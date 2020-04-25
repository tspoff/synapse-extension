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
const kaccak256Address = "ckt1qjjm395fg5uc986703vs9uqzw5gljnrslgjqd4gfulrdrhmkkphs3s7nwu6x3pnl82rz3xmqypfhcway723ngkutufp";
describe('transaction test', () => {

  //OK
  // it('get balance by lockhash-sep256', async () => {
  //   jest.setTimeout(100000);
  //   const lockHash = "0x5d67b4eeb98698535f76f1b34a77d852112a35072eb6b834cb4cc8868ac02fb2";
  //   const unspentCells = await ckb.loadCells({
  //     lockHash
  //   })
  //   console.log("unspentCells => ", unspentCells)
  // });

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

  it('003- send keccak256', async () => {

    jest.setTimeout(150000);

    await keyperwalletTest.init();
    await keyperwalletTest.generateByPrivateKey(privateKey, password);

    const lockHash = "0x588ab92ffb902db6b79a764eeff08ce100641a5d4bea3cfabca28d714f473f5c";
    const unspentCells = await ckb.loadCells({
      lockHash
    })
    // console.log("=== unspentCells ===", JSON.stringify(unspentCells));
    const toAmount = new BN(11100000000);
    const toLock = addressToScript(kaccak256Address);
    const lock = addressToScript(kaccak256Address);
    const rawTx = await createRawTx(
      toAmount, toLock, unspentCells, lock);
    // console.log("rawTx =>", JSON.stringify(rawTx));

    const signObj = {
      target: lockHash,
      tx: rawTx,
      config: {index: 1, length: rawTx.witnesses.length-1}
    }

    console.log("scriptToHash(lock) === ", scriptToHash(lock));

    // const signedTx = ckb.signTransaction('0x' + privateKey)(rawTx);
    const signedTx = await keyperwalletTest.signTx(signObj.target, password, signObj.tx, signObj.config);
    console.log("signedTx =>", JSON.stringify(signedTx, null, 2))

    // const keccak256Dep = {
    //   hashType: 'type',
    //   codeHash: '0xa5b896894539829f5e7c5902f0027511f94c70fa2406d509e7c6d1df76b06f08',
    //   outPoint: {
    //     txHash: '0xe920618e2b44f2de429beb23729635679e382995fcf9eeb2d65059edf64a03e4',
    //     index: '0x0'
    //   }
    // }
    // ckb.config.secp256k1Dep = keccak256Dep;
    // console.log(" ==== ckb.config.secp256k1Dep ===",ckb.config.secp256k1Dep);

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
    }, {
      outPoint: {
        txHash: "0xe920618e2b44f2de429beb23729635679e382995fcf9eeb2d65059edf64a03e4",
        index: "0x0"
      },
      depType: "code",
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
    rawTx.witnesses.push("0x");
    totalcapacity = totalcapacity.add(new BN(cells[i].capacity))
  }
  rawTx.witnesses[1] = {
    lock: "",
    inputType: "",
    outputType: "",
  };
  // if (cells.total.gt(total) && cells.total.sub(total).gt(new BN("6100000000"))) {
  rawTx.outputs.push({
    capacity: `0x${totalcapacity.sub(toAmount).toString(16)}`,
    lock: lock
  });
  rawTx.outputsData.push("0x");
  // }
  return rawTx;
}