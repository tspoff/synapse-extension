import * as crypto from 'crypto'
import Keychain from '../wallet/keychain';
import { mnemonicToSeedSync, entropyToMnemonic } from '../wallet/mnemonic';
import * as Keystore from '../wallet/pkeystore';
import { ExtendedPrivateKey } from "../wallet/key";
import Address, { publicKeyToAddress } from '../wallet/address';
import { privateKeyToPublicKey } from '@nervosnetwork/ckb-sdk-utils';

export const generateMnemonic = () => {
    const entropySize = 16
    const entropy = crypto.randomBytes(entropySize).toString('hex')
    return entropyToMnemonic(entropy)
}

describe('mnemonic test', () => {
    it('generate mnemonic', () => {
        const mnemonic = generateMnemonic();
        const seed = mnemonicToSeedSync(mnemonic)
        const masterKeychain = Keychain.fromSeed(seed)
        //没有0x的privateKey
        const privateKey = masterKeychain.derivePath(Address.pathForReceiving(0)).privateKey.toString('hex');
        const publicKey = privateKeyToPublicKey('0x'+ privateKey);
        const address = publicKeyToAddress('0x'+ publicKey);
        console.log("privateKey:  ",privateKey);
        console.log("publicKey :  ",publicKey);
        console.log("address   :  ",address);
    })
})