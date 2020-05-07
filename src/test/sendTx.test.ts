import { pubkeyToAddress, privateKeyToPublicKey } from "@nervosnetwork/ckb-sdk-utils";
import { publicKeyToAddress } from "../wallet/address";
import Address, { AddressPrefix } from '../wallet/address';

describe('transaction test', () => {

  const CKB = require('@nervosnetwork/ckb-sdk-core').default
  const nodeUrl = 'http://106.13.40.34:8114/'
  const ckb = new CKB(nodeUrl)

  const privateKey = "0x6e678246998b426db75c83c8be213b4ceeb8ae1ff10fcd2f8169e1dc3ca04df1";
  const fromAddress = "ckt1qyqfhpyg02ew59cfnr8lnz2kwhwd98xjd4xsscxlae";
  const toAddress = "ckt1qyqfhpyg02ew59cfnr8lnz2kwhwd98xjd4xsscxlae";

  const sendCapacity = BigInt(3100000000000);//6100000000
  const sendFee = BigInt(100000000);

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