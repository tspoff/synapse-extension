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
const kacca256Address = "ckt1qjjm395fg5uc986703vs9uqzw5gljnrslgjqd4gfulrdrhmkkphs3s7nwu6x3pnl82rz3xmqypfhcway723ngkutufp";
describe('transaction test', () => {

  it('003- send kacca256', async () => {

    jest.setTimeout(150000);

    await keyperwalletTest.init();
    await keyperwalletTest.generateByPrivateKey(privateKey, password);

    const lockHash = "0x588ab92ffb902db6b79a764eeff08ce100641a5d4bea3cfabca28d714f473f5c";
    const unspentCells = await ckb.loadCells({
      lockHash
    })
    // console.log("=== unspentCells ===", JSON.stringify(unspentCells));
    const toAmount = new BN(11100000000);
    const toLock = addressToScript(kacca256Address);
    const lock = addressToScript(kacca256Address);
    const rawTx = await createRawTx(
      toAmount, toLock, unspentCells, lock);

    console.log("scriptToHash(lock) === ", scriptToHash(lock));

    const signedTx = ckb.signTransaction('0x' + privateKey)(rawTx);
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
        txHash: "0x25635bf587adacf95c9ad302113648f89ecddc2acfe1ea358ea99f715219c4c5",
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