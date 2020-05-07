// import { publicKeyToAddress } from "../wallet/address";
import { privateKeyToPublicKey } from "@nervosnetwork/ckb-sdk-utils";
const BN = require('bn.js');
const { Secp256k1LockScript } = require('../keyper/locks/secp256k1');
// const { Secp256k1LockScript } = require("@keyper/container/lib/locks/secp256k1");

const { scriptToHash } = require("@nervosnetwork/ckb-sdk-utils/lib");
const { addressToScript } = require("@keyper/specs");
const keyperwalletTest = require('../keyper/keyperwallet');

const CKB = require('@nervosnetwork/ckb-sdk-core').default
const nodeUrl = 'http://127.0.0.1:8114/'
const ckb = new CKB(nodeUrl)

const gPrivateKey = "0x8a5c5a277590ee05bb04dfb53e4dee638fb70c90b9bcf59c9f1c51e423223043";
// const gPublicKey = "0x03d3319a7a7b8b88747664ca9559ab21e746452e8ed5eddc2f4365a1a9157e9ca2";
const password = "123456";
const address = "ckt1qyqvkdgtra55kgh2ngcuppr5vy5pw7g5z7yqrajwwp";
describe('SimpleUdt  test', () => {

  //   it('000- generate secp256 lockHash', async () => {
  //       jest.setTimeout(100000);
  //       const secp256k1Dep = await ckb.loadSecp256k1Dep();
  //       const publicKey = privateKeyToPublicKey('0x' + gPrivateKey);
  //       const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`;
  //       const lockHash = ckb.generateLockHash(publicKeyHash, secp256k1Dep)
  //       console.log("secp256 lockHash -->",lockHash);
  //       //secp256 lockHash --> 0x5d67b4eeb98698535f76f1b34a77d852112a35072eb6b834cb4cc8868ac02fb2
  //   });

  //   it('001- generate secp256 args|lockScript hash', async () => {
  //     jest.setTimeout(100000);
  //     const secp256 = new Secp256k1LockScript();
  //     const lockScript = secp256.script(gPublicKey);
  //     console.log("secp256 lockScript -->",lockScript);
  //     const args = ckb.utils.scriptToHash(lockScript)
  //     console.log("secp256 args -->",args);
  //     //secp256 lockHash --> 0x5d67b4eeb98698535f76f1b34a77d852112a35072eb6b834cb4cc8868ac02fb2
  // });

  // it('001- Inputs details ', async () => {
  //   //输入地址1 - 提供交易所需的capacity
  //   const secp256k1Dep = await ckb.loadSecp256k1Dep();
  //   const publicKey = privateKeyToPublicKey('0x' + gPrivateKey);
  //   const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`;
  //   const lockHash = ckb.generateLockHash(publicKeyHash, secp256k1Dep)

  //   //创建着的lockHash,提供消耗的capacity;Inputs数据涞源
  //   const unspentCells = await ckb.loadCells({
  //     lockHash
  //   })
  //   console.log("提供交易所需的capacity的地址信息",JSON.stringify(unspentCells)); 
  // })

  // it('001- lockScript ', async () => {
  //   const sk1 = "0x8a5c5a277590ee05bb04dfb53e4dee638fb70c90b9bcf59c9f1c51e423223043";
  //   const lockScript1 = {
  //     codeHash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  //     hashType: "type",
  //     args: `0x${ckb.utils.blake160(ckb.utils.privateKeyToPublicKey(sk1), 'hex')}`
  //   }
  //   const lockScript = ckb.utils.scriptToHash(lockScript1)
  //   //lockScript "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74"
  //   console.log("lockScript", JSON.stringify(lockScript));
  // })

  it('001- Outputs details ', async () => {
    //输入地址1 - 提供交易所需的capacity
    const secp256k1Dep = await ckb.loadSecp256k1Dep();
    const publicKey = privateKeyToPublicKey('0x' + gPrivateKey);
    const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`;
    const lockHash = ckb.generateLockHash(publicKeyHash, secp256k1Dep)

    //创建着的lockHash,提供消耗的capacity;Inputs数据涞源
    const unspentCells = await ckb.loadCells({
      lockHash
    })

    //002- 构造Outputs
    // 创建一个cell需要消耗142个capacity
    const sendCapacity = BigInt(14200000000);
    const sendFee = BigInt(100000000);
    const rawTransaction = ckb.generateRawTransaction({
      fromAddress: address,
      toAddress: address,
      capacity: sendCapacity,
      fee: sendFee,
      safeMode: true,
      cells: unspentCells,
      deps: ckb.config.secp256k1Dep,
    })

    // 001- deps 替换
    //0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708
    //本地测试环境的第0个TxHash
    const simpleDeps = [
      {
        "depType": "depGroup",
        "outPoint": {
          "txHash": "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
          "index": "0x0"
        }
      },
      {
        "depType": "code",
        "outPoint": {
          "txHash": "0xd969df5018310f8d6f8d3ba56d952a3012b9e896995042db6c4fb12e3b5ca2c4",
          "index": "0x0"
        }
      }
    ];
    rawTransaction.cellDeps = simpleDeps;

    // 002- outputs
    const outputs = rawTransaction.outputs;
    const output0 = outputs[0];
    //codeHash => cells.Json "hash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869"
    //args -> lockScript Hash结果 SimpleUDT创建者address相关表示谁创建的SimpleUDT
    output0.type = {
      "hashType": "data",
      "codeHash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869",
      "args": "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74"
    }
    rawTransaction.outputsData[0] = "0x40420f00000000000000000000000000"; //1000000

    //003- witnesses
    rawTransaction.witnesses = rawTransaction.inputs.map(() => '0x')
    rawTransaction.witnesses[0] = {
      lock: '',
      inputType: '',
      outputType: ''
    }
    console.log("rawTransaction =>", JSON.stringify(rawTransaction));

    const signedTx = ckb.signTransaction('0x' + gPrivateKey)(rawTransaction)
    /**
     * to see the signed transaction
     */
    console.log("signedTx =>", JSON.stringify(signedTx, null, 2))
    const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    /**
     * to see the real transaction hash
     */
    console.log(`The real transaction hash is: ${realTxHash}`)

    //container 中不包含simpleUDT
    // const signObj = {
    //   target: lockHash,
    //   tx: rawTransaction,
    //   config: { index: 0, length: rawTransaction.witnesses.length - 1 }
    // }
    // const signedTx = await keyperwalletTest.signTx(signObj.target, password, signObj.tx, signObj.config);
    // console.log("signedTx =>", JSON.stringify(signedTx, null, 2))
    // const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    // console.log("realTxHash =>", JSON.stringify(realTxHash));

  })

  // signedTx => {
  //   "version": "0x0",
  //   "cellDeps": [
  //     {
  //       "depType": "depGroup",
  //       "outPoint": {
  //         "txHash": "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
  //         "index": "0x0"
  //       }
  //     },
  //     {
  //       "depType": "code",
  //       "outPoint": {
  //         "txHash": "0xd969df5018310f8d6f8d3ba56d952a3012b9e896995042db6c4fb12e3b5ca2c4",
  //         "index": "0x0"
  //       }
  //     }
  //   ],
  //   "headerDeps": [],
  //   "inputs": [
  //     {
  //       "previousOutput": {
  //         "txHash": "0xd969df5018310f8d6f8d3ba56d952a3012b9e896995042db6c4fb12e3b5ca2c4",
  //         "index": "0x1"
  //       },
  //       "since": "0x0"
  //     }
  //   ],
  //   "outputs": [
  //     {
  //       "capacity": "0x34e62ce00",
  //       "lock": {
  //         "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  //         "hashType": "type",
  //         "args": "0xcb350b1f694b22ea9a31c0847461281779141788"
  //       },
  //       "type": {
  //         "hashType": "data",
  //         "codeHash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869",
  //         "args": "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74"
  //       }
  //     },
  //     {
  //       "capacity": "0x1ce54efea60",
  //       "lock": {
  //         "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  //         "hashType": "type",
  //         "args": "0xcb350b1f694b22ea9a31c0847461281779141788"
  //       }
  //     }
  //   ],
  //   "witnesses": [
  //     "0x55000000100000005500000055000000410000007a6d0c2fa4fc6253a6be97bca07a74e9c003f5d171cf37c816aeca6488413365355efa02179ed10ee2d40b64479cace04b58b6cac6e5aa62c072dd6c4f8c939001"
  //   ],
  //   "outputsData": [
  //     "0x40420f00000000000000000000000000",
  //     "0x"
  //   ]
  // }  