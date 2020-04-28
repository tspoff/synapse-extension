import { publicKeyToAddress } from "../wallet/address";
const CkbUtils = require("@nervosnetwork/ckb-sdk-utils");

const keyperwalletTest = require('../keyper/keyperwallet');

const CKB = require('@nervosnetwork/ckb-sdk-core').default
const nodeUrl = 'http://106.13.40.34:8114/'
const ckb = new CKB(nodeUrl)

const sendCapacity = BigInt(11100000000);
const sendFee = BigInt(1100000000);

const privateKey = "448ff179b923f0602a00f68f23cb8425d30198446a1b5aa2a016deea2762b1f8";
const password = "123456";
const anypayAddress = "ckt1qjjm395fg5uc986703vs9uqzw5gljnrslgjqd4gfulrdrhmkkphs3s7nwu6x3pnl82rz3xmqypfhcway723ngkutufp";
// ckt1q34rnqhe6qvtulnj9ru7pdm972xwlaknde35fyy9d543s6k00rnehwp9rjfn8f5dua6jwmxchuhkz8wtqchh5harwtj

describe('kaccak256 transaction test', () => {

  // it('send kaccak256 transaction', async () => {

  //   jest.setTimeout(150000)

  //   await keyperwalletTest.init();
  //   await keyperwalletTest.generateByPrivateKey(privateKey, password);

  //   // const secp256k1Dep = await ckb.loadSecp256k1Dep() // load the dependencies of secp256k1 algorithm which is used to verify the signature in transaction's witnesses.
  //   // const kaccak256dep = [{
  //   //     outPoint: {
  //   //       txHash: "0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e",
  //   //       index: "0x0"
  //   //     },
  //   //     depType: "depGroup",
  //   //   }, {
  //   //     outPoint: {
  //   //       txHash: "0xe920618e2b44f2de429beb23729635679e382995fcf9eeb2d65059edf64a03e4",
  //   //       index: "0x0"
  //   //     },
  //   //     depType: "code",
  //   //   }];
  //   const kaccak256dep = 
  //   {
  //     hashType: 'type',
  //     codeHash: '0xa5b896894539829f5e7c5902f0027511f94c70fa2406d509e7c6d1df76b06f08',
  //     outPoint: {
  //       txHash: '0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e',
  //       index: '0x0'
  //     }
  //   }

  //   const publicKey = ckb.utils.privateKeyToPublicKey("0x" + privateKey)

  //   const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`

  //   console.log("publicKeyHash =>", publicKeyHash);

  //   // const lockHash = ckb.generateLockHash(publicKeyHash, kaccak256dep)
  //   const lockHash = "0x588ab92ffb902db6b79a764eeff08ce100641a5d4bea3cfabca28d714f473f5c";

  //   // /**
  //   //  * to see the lock hash
  //   //  */
  //   console.log(lockHash)

  //   // method to fetch all unspent cells by lock hash
  //   const unspentCells = await ckb.loadCells({
  //     lockHash
  //   })
  //   // console.log("unspentCells => ",unspentCells)

  //   const generateAnyTransaction = (params) => {
  //     // console.log("params => ",JSON.stringify(params));
  //     const rawTransaction = ckb.generateRawTransaction(
  //       params
  //     )
  //     console.log("rawTransaction => ",rawTransaction);
  //     //the custom lock logic
  //     if (params.isCustomLock === 1) {
  //       const outputs = rawTransaction.outputs;
  //       outputs.forEach(output => {
  //         const args = output.lock.args;
  //         const newargs = "0x" + args.substr(64);
  //         output.lock.args = "0xb2e5b5cef062272df7b2d7b43eb6371d9a132fbf";
  //       });
  //     }
  //     return rawTransaction;
  //   }

  //   const rawTransaction = generateAnyTransaction({
  //     fromAddress: anypayAddress,
  //     toAddress: anypayAddress,
  //     capacity: sendCapacity,
  //     fee: sendFee,
  //     safeMode: true,
  //     cells: unspentCells,
  //     deps: kaccak256dep,
  //     isCustomLock: 1,
  //   })

  //   rawTransaction.witnesses = rawTransaction.inputs.map(() => '0x')
  //   rawTransaction.witnesses[0] = {
  //     lock: '',
  //     inputType: '',
  //     outputType: ''
  //   }

  //   //Keyer sign
  //   const signObj = {
  //     target: lockHash,
  //     tx: rawTransaction
  //   }
  //   console.log("rawTransaction =>", JSON.stringify(rawTransaction))

  //   // const signedTx = await keyperwalletTest.signTx(signObj.target, password, signObj.tx);
  //   const signedTx = ckb.signTransaction('0x' + privateKey)(rawTransaction);

  //   console.log("signedTx =>", JSON.stringify(signedTx, null, 2))
  //   const realTxHash = await ckb.rpc.sendTransaction(signedTx)

  //   console.log(`The real transaction hash is: ${realTxHash}`)
  //   expect(realTxHash).toHaveLength(66);
  // });

  const rawTransaction01 = {
    "version":"0x0",
    "cellDeps":[
      {
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
            }
    ],
    "headerDeps":[

    ],
    "inputs":[
        {
            "previousOutput":{
                "txHash":"0x623f951146ecee7ed046670ca718da16e199164628fd973eb20734bad7affe79",
                "index":"0x0"
            },
            "since":"0x0"
        }
    ],
    "outputs":[
        {
            "capacity":"0x2959c8f00",
            "lock":{
                "codeHash":"0xa5b896894539829f5e7c5902f0027511f94c70fa2406d509e7c6d1df76b06f08",
                "hashType":"type",
                "args":"0xb2e5b5cef062272df7b2d7b43eb6371d9a132fbf"
            }
        },
        {
            "capacity":"0x7193254e00",
            "lock":{
                "codeHash":"0xa5b896894539829f5e7c5902f0027511f94c70fa2406d509e7c6d1df76b06f08",
                "hashType":"type",
                "args":"0xb2e5b5cef062272df7b2d7b43eb6371d9a132fbf"
            }
        }
    ],
    "witnesses":[
        {
            "lock":"",
            "inputType":"",
            "outputType":""
        }
    ],
    "outputsData":[
        "0x",
        "0x"
    ]
}

  // rawTransaction01.witnesses = rawTransaction01.inputs.map(() => '0x')
  // rawTransaction01.witnesses[0] = {
  //   lock: '',
  //   inputType: '',
  //   outputType: ''
  // }
  it('test data tx', async () => {
    console.log(JSON.stringify(rawTransaction01));
    
    const signedTx = ckb.signTransaction('0x' + privateKey)(rawTransaction01);
    console.log("===signedTx==", signedTx);
    const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    /**
     * to see the real transaction hash
     */
    console.log(`The real transaction hash is: ${realTxHash}`)
  })
});