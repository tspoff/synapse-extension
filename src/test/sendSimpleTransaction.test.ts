const CKB = require('@nervosnetwork/ckb-sdk-core').default
const nodeUrl = 'http://106.13.40.34:8114/'
const ckb = new CKB(nodeUrl)
                  
const privateKey = '8a5c5a277590ee05bb04dfb53e4dee638fb70c90b9bcf59c9f1c51e423223043';
const fromAddress = "ckt1qyqwsp2vpr5k4j3m6yrmqzme0jlede02phmsqt2w5v";
const toAddress  = "ckt1qyqfhpyg02ew59cfnr8lnz2kwhwd98xjd4xsscxlae";

const sendCapacity = BigInt(490000000000);
const sendFee = BigInt(1000000000);

describe('transaction test', () => {


  it('send simple transaction', async () => {

    jest.setTimeout(100000)

    const secp256k1Dep = await ckb.loadSecp256k1Dep() // load the dependencies of secp256k1 algorithm which is used to verify the signature in transaction's witnesses. 
    const publicKey = ckb.utils.privateKeyToPublicKey(privateKey)
    const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`
    const lockHash = ckb.generateLockHash(publicKeyHash, secp256k1Dep)
    const unspentCells = await ckb.loadCells({
      lockHash
    })

    const rawTransaction = ckb.generateRawTransaction({
      fromAddress: fromAddress, 
      toAddress: toAddress,
      capacity: sendCapacity,
      fee: sendFee,
      safeMode: true,
      cells: unspentCells,
      deps: ckb.config.secp256k1Dep,
    })
    rawTransaction.witnesses = rawTransaction.inputs.map(() => '0x')
    rawTransaction.witnesses[0] = {
      lock: '',
      inputType: '',
      outputType: ''
    }
    const signedTx = ckb.signTransaction(privateKey)(rawTransaction)
    const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    console.log(`The real transaction hash is: ${realTxHash}`)
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