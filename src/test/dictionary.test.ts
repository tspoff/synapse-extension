
import Dictionary from '../keyper/Dictionary';

const stores = {};

describe('test ditcionary ', () => {
    const keystore = {
        version: 3,
        id: '0b057427-2769-43e1-9d7c-c05e5828ca9e',
        crypto: {
          ciphertext: '6b61f53bdc65c6811a0522944380ed07e545b810943741c787ba9cc201a1cd7d',
          cipherparams: { iv: 'dc1ace68c2ddec30c329f89fe8579d50' },
          cipher: 'aes-128-ctr',
          kdf: 'scrypt',
          kdfparams: {
            dklen: 32,
            salt: '916a74cdb0c5e77ca96af44530ce84ef9a5afa23c782d7518d37b03932aed7f3',
            n: 262144,
            r: 8,
            p: 1
          },
          mac: 'c729ca9b398545494253bb55984dd349277e9cdcb2893530764b221e5ea57e35'
        },
        publicKey: '0304d793194278a005407cd53e6fbd290d8e2a8e90154b4123dc5e0e06a8a19ecb'
      }
    const publicKey = "0304d793194278a005407cd53e6fbd290d8e2a8e90154b4123dc5e0e06a8a19ecb";

    it('get from dictionary', async () => {
        let store = new Dictionary();
        store.set(publicKey, JSON.stringify(keystore));

        const getKeystore = store.get(publicKey);
        // expect(getKeystore).toEqual(keystore);
        console.log(getKeystore);
    })
})