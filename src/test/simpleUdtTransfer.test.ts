// import { publicKeyToAddress } from "../wallet/address";
import { privateKeyToPublicKey, utf8ToHex } from "@nervosnetwork/ckb-sdk-utils";

//SimpleUDT的交易包含2部分的交易
//1- CKB的交易，目的是为了创建存储UDT所需的cell，需要2个142的cell，并且需要找零
//2- UDT的交易
describe('SimpleUdt  Transfer', () => {

  const CKB = require('@nervosnetwork/ckb-sdk-core').default
  const nodeUrl = 'http://127.0.0.1:8114/'
  const ckb = new CKB(nodeUrl)

  const gPrivateKey = "0x8a5c5a277590ee05bb04dfb53e4dee638fb70c90b9bcf59c9f1c51e423223043";
  const address = "ckt1qyqvkdgtra55kgh2ngcuppr5vy5pw7g5z7yqrajwwp";
  const udtFromAddress = "ckt1qyqvkdgtra55kgh2ngcuppr5vy5pw7g5z7yqrajwwp";
  const udtToAddress = "ckt1qyqrr4jftg8nw06jzp7x4hvvtna742d2g54qjsm6rm";


  it('001- Outputs details ', async () => {

    //输入地址1 - 提供交易所需的capacity
    const secp256k1Dep = await ckb.loadSecp256k1Dep();
    const publicKey = privateKeyToPublicKey(gPrivateKey);
    const publicKeyHash = `0x${ckb.utils.blake160(publicKey, 'hex')}`;
    const lockHash = ckb.generateLockHash(publicKeyHash, secp256k1Dep)

    //创建着的lockHash,提供消耗的capacity;Inputs数据涞源
    const unspentCells = await ckb.loadCells({
      lockHash
    })

    const ckbUnspentCells = unspentCells.filter(cell => cell.type == null);
    const udtUnspentCells = unspentCells.filter(cell => cell.type != null && cell.type.args == "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74");
    // console.log("--- ckbUnspentCells ---", ckbUnspentCells);
    // console.log("--- udtUnspentCells ---", udtUnspentCells);
 
    //002- 构造Outputs
    //CKB的转移和消耗创建一个cell需要消耗142个capacity
    const udtCapacity = BigInt(14200000000);
    const sendFee = BigInt(10000000);

    //UDT的转移
    const udtTransferAmount = 100000;
    let usdtTotal = BigInt(0);
    udtUnspentCells.forEach(cell => {
      if (cell.type != null) {
        if (cell.type.args == "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74") {
          usdtTotal = cell.data.content;
        }
      }
    });
    // var i64:Int128 = new UInt128(0x1020304050607);

    var cellsMap = new Map();
    cellsMap.set(lockHash, ckbUnspentCells);
    const rawTransaction = ckb.generateRawTransaction({
      fee: sendFee,
      safeMode: true,
      deps: ckb.config.secp256k1Dep,
      cells: cellsMap,
      fromAddresses: [
        address
      ],
      receivePairs: [
        {
          address: udtFromAddress,
          capacity: udtCapacity.toString()
        },
        {
          address: udtToAddress,
          capacity: udtCapacity.toString()
        },
      ],
    })

    // 001- deps 替换
    // 0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708 ：本地测试环境的第0个TxHash
    // 0xd969df5018310f8d6f8d3ba56d952a3012b9e896995042db6c4fb12e3b5ca2c4 ：SimpleUDT：Outpoint txHash
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

    // console.log("rawTransaction =>", JSON.stringify(rawTransaction));
    // 001-Inputs少了一个
    // 0x1f567f38f3e6040288b9619e4ed8abde2011d936af7e66fd8628d37ec27bd15e 0x0
    const inputs = rawTransaction.inputs;
    const inputs1 = {
      "since": "0x0",
      "previousOutput": {
        "txHash": "0x1f567f38f3e6040288b9619e4ed8abde2011d936af7e66fd8628d37ec27bd15e",
        "index": "0x0"
      }
    }
    inputs[1] = inputs1;

    // 002- outputs type添加
    // "type": {
    //   "hashType": "data",
    //   "codeHash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869",
    //   "args": "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74"
    // }
    //ckt1qyqvkdgtra55kgh2ngcuppr5vy5pw7g5z7yqrajwwp => Lock Hash:0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74
    const outputs = rawTransaction.outputs;
    const output0 = outputs[0];
    output0.type = {
      "hashType": "data",
      "codeHash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869",
      "args": "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74"
    }
    //
    rawTransaction.outputsData[0] = "0xa0bb0d00000000000000000000000000";

    const output1 = outputs[1];
    output1.type = {
      "hashType": "data",
      "codeHash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869",
      "args": "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74"
    }
    // const remainUdtAmount = BigInt(usdtTotal) - BigInt(udtTransferAmount);
    rawTransaction.outputsData[1] = "0xa0860100000000000000000000000000";

    // 003- witnesses
    rawTransaction.witnesses = rawTransaction.inputs.map(() => '0x')
    rawTransaction.witnesses[0] = {
      lock: '',
      inputType: '',
      outputType: ''
    }
    console.log("rawTransaction =>", JSON.stringify(rawTransaction));

    const signedTx = ckb.signTransaction(gPrivateKey)(rawTransaction)
    /**
     * to see the signed transaction
     */
    console.log("signedTx =>", JSON.stringify(signedTx, null, 2))
    const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    /**
     * to see the real transaction hash
     */
    console.log(`The real transaction hash is: ${realTxHash}`)

  })

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
//         "txHash": "0x1f567f38f3e6040288b9619e4ed8abde2011d936af7e66fd8628d37ec27bd15e",
//         "index": "0x1"
//       },
//       "since": "0x0"
//     },
//     {
//       "since": "0x0",
//       "previousOutput": {
//         "txHash": "0x1f567f38f3e6040288b9619e4ed8abde2011d936af7e66fd8628d37ec27bd15e",
//         "index": "0x0"
//       }
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
//       "capacity": "0x34e62ce00",
//       "lock": {
//         "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//         "hashType": "type",
//         "args": "0x31d6495a0f373f52107c6add8c5cfbeaa9aa452a"
//       },
//       "type": {
//         "hashType": "data",
//         "codeHash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869",
//         "args": "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74"
//       }
//     },
//     {
//       "capacity": "0x1c7b791b7e0",
//       "lock": {
//         "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//         "hashType": "type",
//         "args": "0xcb350b1f694b22ea9a31c0847461281779141788"
//       }
//     }
//   ],
//   "witnesses": [
//     "0x5500000010000000550000005500000041000000737972bb1f28c26f450c9437bc211ee0c8dbc775ddc69dad5400ac24a287112b354b57bd0ba91db5f57c63c31b0ee69a5806e1815b0dcd10822839bf4571ed9401",
//     "0x"
//   ],
//   "outputsData": [
//     "0xa0bb0d00000000000000000000000000",
//     "0xa0860100000000000000000000000000",
//     "0x"
//   ]
// }

// console.log src/test/simpleUdtTransfer.test.ts:154
// The real transaction hash is: 0xf9969763907a2dd1ae160787230480fbe9aba981edcfdd4614cda56114d3ffd0