// import { publicKeyToAddress } from "../wallet/address";
import { privateKeyToPublicKey, scriptToHash } from "@nervosnetwork/ckb-sdk-utils";
import { addressToScript } from "../keyper/address";
const BN = require('bn.js');

//SimpleUDT的交易包含2部分的交易
//inputs 2个输入，CKB的输入和UDT的输入
//1- CKB的交易，目的是为了创建存储UDT所需的cell，需要2个142的cell，并且需要找零
//2- UDT的交易
//3- 根据dataHash来判断是不是合约；
//"datahash": "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869"
const contractDataHash = "0xe7f93d7120de3ca8548b34d2ab9c40fe662eec35023f07e143797789895b4869";
describe('SimpleUdt  Transfer', () => {

  const CKB = require('@nervosnetwork/ckb-sdk-core').default
  const nodeUrl = 'http://127.0.0.1:8114/'
  const ckb = new CKB(nodeUrl)

  const gPrivateKey = "0x8a5c5a277590ee05bb04dfb53e4dee638fb70c90b9bcf59c9f1c51e423223043";
  const address = "ckt1qyqvkdgtra55kgh2ngcuppr5vy5pw7g5z7yqrajwwp";
  const udtFromAddress = "ckt1qyqvkdgtra55kgh2ngcuppr5vy5pw7g5z7yqrajwwp";
  const udtToAddress = "ckt1qyqwwdkk8r3paulzalewsru73jjfj8uzu7eql9fk9g";
  // ckt1qyqrr4jftg8nw06jzp7x4hvvtna742d2g54qjsm6rm


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

    const contractCells = unspentCells.filter(cell => cell.dataHash == contractDataHash);
    const lockScript = {
      hashType: "type",
      codeHash: contractCells[0].lock.codeHash,
      args: contractCells[0].lock.args,
    }
    const lockScriptHash = ckb.utils.scriptToHash(lockScript)
    const outputsType = {
      "hashType": "data",
      "codeHash": contractDataHash,
      "args": lockScriptHash
    }
    //0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74
    //console.log("--- lockScriptHash ---",lockScriptHash);

    const inputsCells = unspentCells.filter(cell => cell.dataHash != contractDataHash);
    // console.log("--- contractCells ---", JSON.stringify(contractCells));
    // console.log("--- inputsCells ---", JSON.stringify(inputsCells));

    //未花费的CKB总量获取
    const transferFee = BigInt(10000000);
    const EMPTY_DATA_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const ckbUnspentCells = unspentCells.filter(cell => cell.type == null && cell.dataHash == EMPTY_DATA_HASH);
    // let totalCkbAmount = BigInt(0);
    // ckbUnspentCells.forEach(cell => {
    //     totalCkbAmount = totalCkbAmount + BigInt(cell.capacity);
    // })
    // console.log("--- totalCkbAmount ---",totalCkbAmount);

    // const udtUnspentCells = unspentCells.filter(cell => cell.type != null && cell.type.args == "0xf36ae14f410b1cac72793362d15678c0ce42b8b0337f390be37789ee3993ff74");
    // console.log("--- ckbUnspentCells ---", JSON.stringify(ckbUnspentCells));
    // console.log("--- udtUnspentCells ---", JSON.stringify(udtUnspentCells));

    //002- UDT构造Outputs
    //CKB的转移和消耗创建一个cell需要消耗142个capacity
    //UDT的转移
    const udtTransferAmount = BigInt(100000);

    inputsCells.forEach(cell => {
      if (cell.type != null) {
        if (cell.type.args == lockScriptHash) {
          console.log("--- cell.data.content ---", cell.data.content);
          const usdtTotal = ckb.utils.bytesToHex(cell.data.content)
          console.log("--- usdtTotal ---", usdtTotal);
        }
      }
    });


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

    // const rawTx = await createRawTx(udtFromAddress,udtToAddress,transferFee,udtTransferAmount,simpleDeps, inputsCells, outputsType,ckbUnspentCells);
    // rawTx.witnesses = rawTx.inputs.map(() => '0x')
    // rawTx.witnesses[0] = {
    //   lock: '',
    //   inputType: '',
    //   outputType: ''
    // }
    // console.log("rawTransaction =>", JSON.stringify(rawTx));
    // const signedTx = ckb.signTransaction(gPrivateKey)(rawTx)
    // // /**
    // //  * to see the signed transaction
    // //  */
    // // console.log("signedTx =>", JSON.stringify(signedTx, null, 2))
    // const realTxHash = await ckb.rpc.sendTransaction(signedTx)
    // // /**
    // //  * to see the real transaction hash
    // //  */
    // console.log(`The real transaction hash is: ${realTxHash}`)

  })

})

async function createRawTx(fromAddress, toAddress, transferFee, udtTransferAmount,
  cellDeps, inputsCells, outputsType, ckbUnspentCells) {
  const rawTx = {
    version: "0x0",
    cellDeps: [],
    headerDeps: [],
    inputs: [],
    outputs: [],
    witnesses: [],
    outputsData: []
  };

  //001-
  rawTx.cellDeps = cellDeps;

  //002-
  for (let i = 0; i < inputsCells.length; i++) {
    const element = inputsCells[i].outPoint;
    rawTx.inputs.push({
      previousOutput: {
        txHash: element.txHash,
        index: element.index,
      },
      since: "0x0",
    });
    rawTx.witnesses.push("0x");
  }

  //003- CKB-UDT,Cell的构造处理 以及outputsData处理outputsData相当于UDT的转移
  //创建一个存储UDT的Cell需要14200000000
  const toAmount = BigInt(14200000000);
  //From UDT找零
  const fromLock = addressToScript(fromAddress);
  rawTx.outputs.push({
    capacity: `0x${new BN(toAmount).toString(16)}`,
    lock: fromLock,
    type: outputsType,
  });
  //TODO Bug
  rawTx.outputsData.push("0x00350c00000000000000000000000000");
  //To 转移UDT
  const toLock = addressToScript(toAddress);
  rawTx.outputs.push({
    capacity: `0x${new BN(toAmount).toString(16)}`,
    lock: toLock,
    type: outputsType,
  });
  //TODO Bug
  rawTx.outputsData.push("0xa0860100000000000000000000000000");

  //004- CKB的找零构造
  let totalCkbAmount = BigInt(0);
  ckbUnspentCells.forEach(cell => {
    totalCkbAmount = totalCkbAmount + BigInt(cell.capacity);
  })
  const chargeAmount = totalCkbAmount - toAmount - toAmount - transferFee;
  rawTx.outputs.push({
    capacity: `0x${new BN(chargeAmount).toString(16)}`,
    lock: fromLock,
  });
  rawTx.outputsData.push("0x");

  console.log('rawTx --- ', rawTx);
  return rawTx;
}