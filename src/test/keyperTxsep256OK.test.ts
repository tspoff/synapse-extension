import { publicKeyToAddress } from "../wallet/address";
const BN = require('bn.js');

const { scriptToHash } = require("@nervosnetwork/ckb-sdk-utils/lib");
const { addressToScript } = require("@keyper/specs");
const keyperwalletTest = require('../keyper/keyperwallet');

const CKB = require('@nervosnetwork/ckb-sdk-core').default
const nodeUrl = 'http://106.13.40.34:8114/'
const ckb = new CKB(nodeUrl)

const privateKey = "6e678246998b426db75c83c8be213b4ceeb8ae1ff10fcd2f8169e1dc3ca04df1";
const password = "123456";
const sep256Address = "ckt1qyqfhpyg02ew59cfnr8lnz2kwhwd98xjd4xsscxlae";
describe('transaction test', () => {

  //OK
  // it('get balance by lockhash-kacca256', async () => {
  //   jest.setTimeout(100000);
  //   const lockHash = "0x588ab92ffb902db6b79a764eeff08ce100641a5d4bea3cfabca28d714f473f5c";
  //   const unspentCells = await ckb.loadCells({
  //     lockHash
  //   })
  //   console.log("unspentCells => ", unspentCells)
  // });

  // it('get accounts ......', async () => {

  //   jest.setTimeout(150000);

  //   await keyperwalletTest.init();
  //   await keyperwalletTest.generateByPrivateKey(privateKey, password);
  //   //   // 0001- 
  //   const accounts = await keyperwalletTest.accounts()
  //   console.log('accounts : ' + JSON.stringify(accounts));
  // })

  // it('get script ......', async () => {

  //   jest.setTimeout(100000);

  //   await keyperwalletTest.init();
  //   await keyperwalletTest.generateByPrivateKey(privateKey, password);

  //   //     === script ===  {
  //   //      codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
  //   //      hashType: 'type',
  //   //      args: '0x9b84887ab2ea170998cff9895675dcd29cd26d4d'
  //   //    }
  //   //     === script ===  {
  //   //      codeHash: '0xa5b896894539829f5e7c5902f0027511f94c70fa2406d509e7c6d1df76b06f08',
  //   //      hashType: 'type',
  //   //      args: '0xc3d3773468867f3a86289b6020537c3ba4f2a334'
  //   //    }
  //   //     === script ===  {
  //   //      codeHash: '0x6a3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b',
  //   //      hashType: 'type',
  //   //      args: '0x9b84887ab2ea170998cff9895675dcd29cd26d4d'
  //   //    }
  // })

  it('003- send sep256', async () => {

    jest.setTimeout(150000);

    await keyperwalletTest.init();
    await keyperwalletTest.generateByPrivateKey(privateKey, password);

    const lockHash = "0x5d67b4eeb98698535f76f1b34a77d852112a35072eb6b834cb4cc8868ac02fb2";
    const unspentCells = await ckb.loadCells({
      lockHash
    })
    // console.log("=== unspentCells ===", JSON.stringify(unspentCells));
    const toAmount = new BN(11100000000);
    const toLock = addressToScript(sep256Address);
    const lock = addressToScript(sep256Address);
    const rawTx = await createRawTx(
      toAmount, toLock, unspentCells, lock);
    // console.log("rawTx =>", JSON.stringify(rawTx));

    const signObj = {
      target: lockHash,
      tx: rawTx,
      config: { index: 0, length: rawTx.witnesses.length - 1 }
    }

    const signedTx = ckb.signTransaction('0x' + privateKey)(rawTx);
    // const signedTx = await keyperwalletTest.signTx(signObj.target, password, signObj.tx, signObj.config);
    console.log("signedTx =>", JSON.stringify(signedTx, null, 2))

    const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    console.log("realTxHash =>", JSON.stringify(realTxHash));

  });

});


async function createRawTx(toAmount, toLock, cells, lock) {
  const rawTx = {
    version: "0x0",
    cellDeps: [{
      outPoint: {
        txHash: "0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e",
        index: "0x0"
      },
      depType: "depGroup",
    }],
    headerDeps: [],
    inputs: [],
    outputs: [],
    witnesses: [],
    outputsData: []
  };
  rawTx.outputs.push({
    capacity: `0x${new BN(toAmount).toString(16)}`,
    lock: toLock,
  });
  rawTx.outputsData.push("0x");
  let totalcapacity = new BN(0);
  // const total = new BN(toAmount).add(new BN("1000"));
  for (let i = 0; i < cells.length; i++) {
    const element = cells[i].outPoint;

    rawTx.inputs.push({
      previousOutput: {
        txHash: element.txHash,
        index: element.index,
      },
      since: "0x0",
    });
    //Keyper
    // rawTx.witnesses.push("0x");
    totalcapacity = totalcapacity.add(new BN(cells[i].capacity))
  }
  //Keyper
  // rawTx.witnesses[1] = {
  //   lock: "",
  //   inputType: "",
  //   outputType: "",
  // };
  rawTx.witnesses = rawTx.inputs.map(() => "0x")
  rawTx.witnesses[0] = {
    lock: "",
    inputType: "",
    outputType: "",
  }
  // if (cells.total.gt(total) && cells.total.sub(total).gt(new BN("6100000000"))) {
  rawTx.outputs.push({
    capacity: `0x${totalcapacity.sub(toAmount).toString(16)}`,
    lock: lock
  });
  rawTx.outputsData.push("0x");
  // }
  return rawTx;
}