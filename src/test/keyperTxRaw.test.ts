import { publicKeyToAddress } from "../wallet/address";
const BN = require('bn.js');

const { scriptToHash } = require("@nervosnetwork/ckb-sdk-utils/lib");
const { addressToScript } = require("@keyper/specs");
const keyperwalletTest = require('../keyper/keyperwallet');

const CKB = require('@nervosnetwork/ckb-sdk-core').default
const nodeUrl = 'http://106.13.40.34:8114/'
const ckb = new CKB(nodeUrl)


const sendCapacity = BigInt(11100000000);
const sendFee = BigInt(1100000000);
// const anypayAddress = "ckt1qsusu8rukk0m6h8eh7unwzktp54mhw70gymvjze086jjw76vzw65pxuy3pat96shpxvvl7vf2e6ae55u6fk560m2alm";

const privateKey = "6e678246998b426db75c83c8be213b4ceeb8ae1ff10fcd2f8169e1dc3ca04df1";
const password = "123456";
const address = "ckt1qyqfhpyg02ew59cfnr8lnz2kwhwd98xjd4xsscxlae";
const kaccak256Address = "ckt1qjjm395fg5uc986703vs9uqzw5gljnrslgjqd4gfulrdrhmkkphs3s7nwu6x3pnl82rz3xmqypfhcway723ngkutufp";
const anypayAddress = "ckt1q34rnqhe6qvtulnj9ru7pdm972xwlaknde35fyy9d543s6k00rnehxuy3pat96shpxvvl7vf2e6ae55u6fk566eyvpl";
describe('transaction test', () => {

  it('send simple transaction by Keccak256LockScript', async () => {

    jest.setTimeout(150000);

    await keyperwalletTest.init();
    await keyperwalletTest.generateByPrivateKey(privateKey, password);


  
    const lockHash = "0x588ab92ffb902db6b79a764eeff08ce100641a5d4bea3cfabca28d714f473f5c";
    const unspentCells = await ckb.loadCells({
      lockHash
    })

    // console.log("unspentCells => ", unspentCells)
    const keccak256Dep = {
      hashType: 'type',
      codeHash: '0xa5b896894539829f5e7c5902f0027511f94c70fa2406d509e7c6d1df76b06f08',
      outPoint: {
        txHash: '0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e',
        index: '0x0'
      }
    }

    const rawTransaction = ckb.generateRawTransaction({
      fromAddress: kaccak256Address,
      toAddress: kaccak256Address,
      capacity: sendCapacity,
      fee: sendFee,
      safeMode: true,
      cells: unspentCells,
      deps: keccak256Dep,
    })
    rawTransaction.witnesses = rawTransaction.inputs.map(() => '0x')
    rawTransaction.witnesses[0] = {
      lock: '',
      inputType: '',
      outputType: ''
    }

    const signedTx = ckb.signTransaction('0x' + privateKey)(rawTransaction)

    // /**
    //  * to see the signed transaction
    //  */
    console.log("signedTx =>", JSON.stringify(signedTx, null, 2))

    const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    // /**
    //  * to see the real transaction hash
    //  */
    console.log(`The real transaction hash is: ${realTxHash}`)

    expect(realTxHash).toHaveLength(66);
  });

});
// Array[1]
// [
//   {
//       "blockHash":"0xd2250e030d4cd5a61388b1b0cde60b1843574be23119dd2e5a84c8da6885c354",
//       "lock":{
//           "codeHash":"0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//           "hashType":"type",
//           "args":"0x9b84887ab2ea170998cff9895675dcd29cd26d4d"
//       },
//       "outPoint":{
//           "txHash":"0x254e6fd9954b08784ef7e210e5efb9651505eda56f184429c993b1b40c73324e",
//           "index":"0x1"
//       },
//       "outputDataLen":"0x0",
//       "capacity":"0x6d02e50a00",
//       "cellbase":false,
//       "type":null,
//       "dataHash":"0x0000000000000000000000000000000000000000000000000000000000000000",
//       "status":"live"
//   }
// ]

//add by river
// console.log(masterKeychain
//             .derivePath(`m/44'/309'/0'/0`)
//             .deriveChild(0,false)
//             .privateKey.toString('hex'))
// console.log(masterKeychain
//             .derivePath(`m/44'/309'/0'/0`)
//             .deriveChild(0,false)
//             .publicKey.toString('hex')) 

// {
//   outPoint: {
//     txHash: "0x25635bf587adacf95c9ad302113648f89ecddc2acfe1ea358ea99f715219c4c5",
//     index: "0x0"
//   },
//   depType: "code",
// }
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
  rawTx.witnesses[0] = {
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

// unspentCells =>  [
//   {
//     blockHash: '0x3fa610d16c45cc62a68b8b78db9220eecd4cfed59646304d5d766b3990b1d476',
//     lock: {
//       codeHash: '0xac8a4bc0656aeee68d4414681f4b2611341c4f0edd4c022f2d250ef8bb58682f',
//       hashType: 'type',
//       args: '0xc3d3773468867f3a86289b6020537c3ba4f2a334'
//     },
//     outPoint: {
//       txHash: '0x815eb5a9e3a23aebbdeacfe38259a687af46a9da31e235509dc4f8be5514d221',
//       index: '0x0'
//     },
//     outputDataLen: '0x0',
//     capacity: '0x746a528800',
//     cellbase: false,
//     type: null,
//     dataHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
//     status: 'live'
//   }
// ]



// signedTx => {
//   "version": "0x0",
//   "cellDeps": [
//     {
//       "outPoint": {
//         "txHash": "0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e",
//         "index": "0x0"
//       },
//       "depType": "depGroup"
//     }
//   ],
//   "headerDeps": [],
//   "inputs": [
//     {
//       "previousOutput": {
//         "txHash": "0x70fc933b594e49ca0ccae4ef6121d3527a32f4b9485c3f9ee14f8617614418f8",
//         "index": "0x0"
//       },
//       "since": "0x0"
//     },
//     {
//       "previousOutput": {
//         "txHash": "0x70fc933b594e49ca0ccae4ef6121d3527a32f4b9485c3f9ee14f8617614418f8",
//         "index": "0x1"
//       },
//       "since": "0x0"
//     }
//   ],
//   "outputs": [
//     {
//       "capacity": "0x2959c8f00",
//       "lock": {
//         "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//         "hashType": "type",
//         "args": "0x9b84887ab2ea170998cff9895675dcd29cd26d4d"
//       }
//     },
//     {
//       "capacity": "0x69a8967a00",
//       "lock": {
//         "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//         "hashType": "type",
//         "args": "0x9b84887ab2ea170998cff9895675dcd29cd26d4d"
//       }
//     }
//   ],
//   "witnesses": [
//     "0x550000001000000055000000550000004100000027b4b007e911901e6f31e359796001a01ecd6277483a32118660ea3f7dd13aff0064d24f47dfdbb45c63a33b685a361c36dd1f0b5d3aeff8f3ed475bc9d9bb9500",
//     "0x"
//   ],
//   "outputsData": [
//     "0x",
//     "0x"
//   ]
// }

// console.log src/test/keyperTx.test.ts:120
// The real transaction hash is: 0xcb9e58f192531bd773a694b344269398dc5f5ee2c10844f931cdaff5a2e2fdbe