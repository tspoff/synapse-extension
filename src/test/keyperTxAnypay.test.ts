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
const anypayAddress = "ckt1q34rnqhe6qvtulnj9ru7pdm972xwlaknde35fyy9d543s6k00rnehxuy3pat96shpxvvl7vf2e6ae55u6fk566eyvpl";
describe('transaction test', () => {

  it('003- send anypay', async () => {

    jest.setTimeout(150000);

    await keyperwalletTest.init();
    await keyperwalletTest.generateByPrivateKey(privateKey, password);

    const lockHash = "0x5608236d76f5d82df724cfe49c477fb04818769d948dbd7df9799bc881d99307";
    const unspentCells = await ckb.loadCells({
      lockHash
    })
    // console.log("=== unspentCells ===", JSON.stringify(unspentCells));
    const toAmount = new BN(11100000000);
    const toLock = addressToScript(anypayAddress);
    const lock = addressToScript(anypayAddress);
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
        txHash: "0x9af66408df4703763acb10871365e4a21f2c3d3bdc06b0ae634a3ad9f18a6525",
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

// signedTx => {
//   "version": "0x0",
//   "cellDeps": [
//     {
//       "outPoint": {
//         "txHash": "0x9af66408df4703763acb10871365e4a21f2c3d3bdc06b0ae634a3ad9f18a6525",
//         "index": "0x0"
//       },
//       "depType": "depGroup"
//     }
//   ],
//   "headerDeps": [],
//   "inputs": [
//     {
//       "previousOutput": {
//         "txHash": "0xcaa30a42c5cbe89f4b7359cf92d8f4ef2b64e210a05275bf6519bcd5352f49aa",
//         "index": "0x0"
//       },
//       "since": "0x0"
//     }
//   ],
//   "outputs": [
//     {
//       "capacity": "0x2959c8f00",
//       "lock": {
//         "hashType": "type",
//         "codeHash": "0x6a3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b",
//         "args": "0x9b84887ab2ea170998cff9895675dcd29cd26d4d"
//       }
//     },
//     {
//       "capacity": "0x4bfd330e20",
//       "lock": {
//         "hashType": "type",
//         "codeHash": "0x6a3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b",
//         "args": "0x9b84887ab2ea170998cff9895675dcd29cd26d4d"
//       }
//     }
//   ],
//   "witnesses": [
//     "0x5500000010000000550000005500000041000000741ad93261473ecfa487a8dff1a579aa64c33e00a0523a420979df43dce69e1b44503254d9d059491ee355ab09fb4813226b63a4b9f508e5c88c50955f942f7a01"
//   ],
//   "outputsData": [
//     "0x",
//     "0x"
//   ]
// }

// console.log src/test/keyperTxAnypay.test.ts:47
// realTxHash => "0x40fea6530a7eeeba313cc0ce47825c8261f5c2dd0b08aef0ea2382f6ea0e06b0"

