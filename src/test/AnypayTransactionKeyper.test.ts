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
const anypayAddress = "ckt1q34rnqhe6qvtulnj9ru7pdm972xwlaknde35fyy9d543s6k00rnehvh9kh80qc389hmm94a586mrw8v6zvhm77g4par";
// ckt1q34rnqhe6qvtulnj9ru7pdm972xwlaknde35fyy9d543s6k00rnehwp9rjfn8f5dua6jwmxchuhkz8wtqchh5harwtj

describe('anypay transaction test', () => {

  // // parseAddress
  // it('send simple transaction', async () => {
  //   const pkHashSecp256k1 = CkbUtils.parseAddress("ckt1qyqfhpyg02ew59cfnr8lnz2kwhwd98xjd4xsscxlae", 'hex');
  //   expect(pkHashSecp256k1).toEqual("0x9b84887ab2ea170998cff9895675dcd29cd26d4d");
  // });

  // it('send simple transaction', async () => {

  //   const pkHashKeccak256 = CkbUtils.parseAddress("ckt1qjjm395fg5uc986703vs9uqzw5gljnrslgjqd4gfulrdrhmkkphs3s7nwu6x3pnl82rz3xmqypfhcway723ngkutufp", 'hex');
  //   expect(pkHashKeccak256).toEqual("0xc3d3773468867f3a86289b6020537c3ba4f2a334");
  // });
  // it('send simple transaction', async () => {
  //   const pkHashAnyPay = CkbUtils.parseAddress("ckt1q34rnqhe6qvtulnj9ru7pdm972xwlaknde35fyy9d543s6k00rnehxuy3pat96shpxvvl7vf2e6ae55u6fk566eyvpl", 'hex');
  //   expect(pkHashAnyPay).toEqual("0x9b84887ab2ea170998cff9895675dcd29cd26d4d");
  // });

  // it('get accounts ......', async () => {
  //   jest.setTimeout(150000);
  //   await keyperwalletTest.init();
  //   await keyperwalletTest.generateByPrivateKey(privateKey, password);
  //   //   // 0001- 
  //   const accounts = await keyperwalletTest.accounts()
  //   console.log('accounts : ' + JSON.stringify(accounts));
  // })

  it('send anypay transaction', async () => {

    jest.setTimeout(150000)

    await keyperwalletTest.init();
    await keyperwalletTest.generateByPrivateKey(privateKey, password);

    // const secp256k1Dep = await ckb.loadSecp256k1Dep() // load the dependencies of secp256k1 algorithm which is used to verify the signature in transaction's witnesses.
    const anypayDep = {
      hashType: 'type',
      codeHash: '0x6a3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b',
      outPoint: {
        txHash: '0x9af66408df4703763acb10871365e4a21f2c3d3bdc06b0ae634a3ad9f18a6525',
        index: '0x0'
      }
    }
    const publicKey = ckb.utils.privateKeyToPublicKey("0x" + privateKey)
    // const address = publicKeyToAddress(publicKey);
    /**
     * to see the public key
     */
    //0304d793194278a005407cd53e6fbd290d8e2a8e90154b4123dc5e0e06a8a19ecb
    // console.log(`Public key: ${publicKey}`)
    // console.log src/test/sendSimpleTransaction.test.ts:25
    // Public key: 0x03ec80924627d484afd9da7e701dbc7acbf612f573eb1098a1e0c813dbbdcc543c
    // console.log src/test/sendSimpleTransaction.test.ts:42
    // fromAddress => ckt1qyqwcnwg78e58tnsd4wqyq74yuxvls3076rqcmangd

    const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`


    //0xb2e5b5cef062272df7b2d7b43eb6371d9a132fbf
    console.log("publicKeyHash =>", publicKeyHash);

    /**
     * to see the addresses
     */
    // console.log(JSON.stringify(addresses, null, 2))

    /**
     * calculate the lockHash by the address publicKeyHash
     * 1. the publicKeyHash of the address is required in the args field of lock script
     * 2. compose the lock script with the code hash(as a miner, we use blockAssemblerCodeHash here), and args
     * 3. calculate the hash of lock script via ckb.utils.scriptToHash method
     */
    // const lockScript = {
    //   hashType: "type",
    //   codeHash: blockAssemblerCodeHash,
    //   args: publicKeyHash,
    // }
    /**
     * to see the lock script
     */
    // console.log(JSON.stringify(lockScript, null, 2))

    // const lockHash = ckb.utils.scriptToHash(lockScript)
    const lockHash = ckb.generateLockHash(publicKeyHash, anypayDep)

    // /**
    //  * to see the lock hash
    //  */
    console.log(lockHash)

    // method to fetch all unspent cells by lock hash
    const unspentCells = await ckb.loadCells({
      lockHash
    })

    /**
     * to see the unspent cells
     */
    // console.log("unspentCells => ",unspentCells)
    console.log("publicKeyHash 001=>", publicKeyHash);

    const generateAnyTransaction = (isCustomLock, ...params) => {
      const rawTransaction = ckb.generateRawTransaction(
        params
      )
      //the custom lock logic
      if(isCustomLock === 1){
        const outputs = rawTransaction.outputs;
        outputs.forEach(output => {
          const args = output.lock.args;
          const newargs = "0x" + args.substr(64);
          output.lock.args = newargs;
        });
      }
      return rawTransaction;
    }

    const rawTransaction = generateAnyTransaction({
      isCustomLock: 1,
      fromAddress: anypayAddress,
      toAddress: anypayAddress,
      capacity: sendCapacity,
      fee: sendFee,
      safeMode: true,
      cells: unspentCells,
      deps: anypayDep,
    })

    rawTransaction.witnesses = rawTransaction.inputs.map(() => '0x')
    rawTransaction.witnesses[0] = {
      lock: '',
      inputType: '',
      outputType: ''
    }
    console.log("=== rawTransaction ===>", JSON.stringify(rawTransaction));
    //Keyer sign
    const signObj = {
      target: lockHash,
      tx: rawTransaction
    }
    const signedTx = await keyperwalletTest.signTx(signObj.target, password, signObj.tx);
    /**
     * to see the signed transaction
     */
    console.log("signedTx =>", JSON.stringify(signedTx, null, 2))
    const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    /**
     * to see the real transaction hash
     */
    console.log(`The real transaction hash is: ${realTxHash}`)
    expect(realTxHash).toHaveLength(66);
  });
});

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
//         "txHash": "0x40fea6530a7eeeba313cc0ce47825c8261f5c2dd0b08aef0ea2382f6ea0e06b0",
//         "index": "0x0"
//       },
//       "since": "0x0"
//     },
//     {
//       "previousOutput": {
//         "txHash": "0x40fea6530a7eeeba313cc0ce47825c8261f5c2dd0b08aef0ea2382f6ea0e06b0",
//         "index": "0x1"
//       },
//       "since": "0x0"
//     }
//   ],
//   "outputs": [
//     {
//       "capacity": "0x2959c8f00",
//       "lock": {
//         "codeHash": "0x6a3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b",
//         "hashType": "type",
//         "args": "0x3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b9b84887ab2ea170998cff9895675dcd29cd26d4d"
//       }
//     },
//     {
//       "capacity": "0x4bbba26320",
//       "lock": {
//         "codeHash": "0x6a3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b",
//         "hashType": "type",
//         "args": "0x3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b9b84887ab2ea170998cff9895675dcd29cd26d4d"
//       }
//     }
//   ],
//   "witnesses": [
//     "0x55000000100000005500000055000000410000004ccc2bd8ce928352e6b9510c863699b8d6aadebd7da09758cd422ba6f7df083b5077762da7490522c5d40a2ea0032635966e4218c521e74a8f37ad4b9866168f00",
//     "0x"
//   ],
//   "outputsData": [
//     "0x",
//     "0x"
//   ]
// }

// console.log src/test/AnypayTransaction.test.ts:115
// The real transaction hash is: 0xc8ee9fa27385560f2ed956034fb6abebf035ff1e64025493ca620e9c74df6615
