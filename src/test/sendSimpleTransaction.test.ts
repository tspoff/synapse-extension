import { publicKeyToAddress } from "../wallet/address";
import { parseAddress } from '';

const CKB = require('@nervosnetwork/ckb-sdk-core').default
const nodeUrl = 'http://106.13.40.34:8114/'
const ckb = new CKB(nodeUrl)
                      
// privateKey =>  448ff179b923f0602a00f68f23cb8425d30198446a1b5aa2a016deea2762b1f8
// publicKey =>  0304d793194278a005407cd53e6fbd290d8e2a8e90154b4123dc5e0e06a8a19ecb
// Address=> ckt1qyqt9ed4emcxyfed77ed0dp7kcm3mxsn97ls38jxjw
const privateKey = '0x6e678246998b426db75c83c8be213b4ceeb8ae1ff10fcd2f8169e1dc3ca04df1';
const toAddress  = "ckt1qyqfhpyg02ew59cfnr8lnz2kwhwd98xjd4xsscxlae";

const sendCapacity = BigInt(11100000000);
const sendFee = BigInt(1100000000);

describe('transaction test', () => {

  // parseAddress
  it('send simple transaction', async () => {

  });

  it('send simple transaction', async () => {

    console.log("0x6151c90c6735e505c64cda8ac37efcac55a5823c0037a38ad9ca90f4cce56b83".length)
    jest.setTimeout(100000)

    const secp256k1Dep = await ckb.loadSecp256k1Dep() // load the dependencies of secp256k1 algorithm which is used to verify the signature in transaction's witnesses.
    // console.log(" === secp256k1Dep === ",secp256k1Dep);
    // === secp256k1Dep ===  {
    //   hashType: 'type',
    //   codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    //   outPoint: {
    //     txHash: '0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e',
    //     index: '0x0'
    //   }
    // }    
    const publicKey = ckb.utils.privateKeyToPublicKey(privateKey)
    const address = publicKeyToAddress(publicKey);
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
    /**
     * to see the public key hash
     */
    // console.log(`Public key hash: ${publicKeyHash}`)
  
    const addresses = {
      testnetAddress: ckb.utils.pubkeyToAddress(publicKey, {
        prefix: 'ckt'
      })
    }
    //ckt1qyqrpkej44pkt0anq8g0qv8wzlyusjx082xs2c2ux4
    // console.log("fromAddress =>", addresses.testnetAddress);

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
    const lockHash = ckb.generateLockHash(publicKeyHash, secp256k1Dep)

    /**
     * to see the lock hash
     */
    // console.log(lockHash)
  
    // method to fetch all unspent cells by lock hash
    const unspentCells = await ckb.loadCells({
      lockHash
    })
  
    /**
     * to see the unspent cells
     */
    // console.log("unspentCells => ",unspentCells)
  
    /**
     * send transaction
     */
    // const toAddress = ckb.utils.privateKeyToAddress(privateKey, {
    //   prefix: 'ckt'
    // })

    const rawTransaction = ckb.generateRawTransaction({
      fromAddress: addresses.testnetAddress, 
      toAddress: toAddress,
      capacity: sendCapacity,
      fee: sendFee,
      safeMode: true,
      cells: unspentCells,
      deps: ckb.config.secp256k1Dep,
    })
    // console.log(" === rawTransaction === ",rawTransaction);
    // {
    //   version: '0x0',
    //   cellDeps: [ { outPoint: [Object], depType: 'depGroup' } ],
    //   headerDeps: [],
    //   inputs: [ { previousOutput: [Object], since: '0x0' } ],
    //   outputs: [
    //     { capacity: '0x2959c8f00', lock: [Object] },
    //     { capacity: '0x646b4df240', lock: [Object] }
    //   ],
    //   witnesses: [],
    //   outputsData: [ '0x', '0x' ]
    // }

    rawTransaction.witnesses = rawTransaction.inputs.map(() => '0x')
    rawTransaction.witnesses[0] = {
      lock: '',
      inputType: '',
      outputType: ''
    }
  
    console.log("=== rawTransaction ===>",rawTransaction);
    const signedTx = ckb.signTransaction(privateKey)(rawTransaction)
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
    //add by river
    // console.log(masterKeychain
    //             .derivePath(`m/44'/309'/0'/0`)
    //             .deriveChild(0,false)
    //             .privateKey.toString('hex'))
    // console.log(masterKeychain
    //             .derivePath(`m/44'/309'/0'/0`)
    //             .deriveChild(0,false)
    //             .publicKey.toString('hex')) 


    // === rawTransaction ===> {
    //   version: '0x0',
    //   cellDeps: [ { outPoint: [Object], depType: 'depGroup' } ],
    //   headerDeps: [],
    //   inputs: [ { previousOutput: [Object], since: '0x0' } ],
    //   outputs: [
    //     { capacity: '0x2959c8f00', lock: [Object] },
    //     { capacity: '0x646b4df240', lock: [Object] }
    //   ],
    //   witnesses: [ { lock: '', inputType: '', outputType: '' } ],
    //   outputsData: [ '0x', '0x' ]
    // }

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
    //         "txHash": "0xb18bae2bfaf9ddcb8afe237e266ff5e616ca5356f9525e576719476cd37a9b90",
    //         "index": "0x0"
    //       },
    //       "since": "0x0"
    //     },
    //     {
    //       "previousOutput": {
    //         "txHash": "0xb18bae2bfaf9ddcb8afe237e266ff5e616ca5356f9525e576719476cd37a9b90",
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
    //       "capacity": "0x68a253ce00",
    //       "lock": {
    //         "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    //         "hashType": "type",
    //         "args": "0x9b84887ab2ea170998cff9895675dcd29cd26d4d"
    //       }
    //     }
    //   ],
    //   "witnesses": [
    //     "0x55000000100000005500000055000000410000005459c609d10e0c35b2c7482394d20cd0fa89fbe1d37854134c5fbe3598dbca2910bc52957a44c72ab6adca4eaff6e2cbc86fd2bb5824b7bea50e1ddf696df2e900",
    //     "0x"
    //   ],
    //   "outputsData": [
    //     "0x",
    //     "0x"
    //   ]
    // }

    //The real transaction hash is: 0x8d562e1b7972966e82e866580bb1fe3228023a7b50813ea42a317067ee692282