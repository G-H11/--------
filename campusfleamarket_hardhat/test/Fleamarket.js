const TestFuncs = require('./TestFuncs');
const assert = require('assert');
const path = require('path');
const web3 = require('./web3')

const BuyRecordList = require(path.resolve(__dirname, '../artifacts/contracts/Campus flea market.sol/BuyRecordList.json'));
const CustomersOwnerList = require(path.resolve(__dirname, "../artifacts/contracts/Campus flea market.sol/CustomersOwnerList.json"));
const CompanyList = require(path.resolve(__dirname, "../artifacts/contracts/Campus flea market.sol/CompanyList.json"));

const CustomersOwner = require(path.resolve(__dirname, "../artifacts/contracts/Campus flea market.sol/CustomersOwner.json"));
const Company = require(path.resolve(__dirname, "../artifacts/contracts/Campus flea market.sol/Company.json"));

let accounts;
let buyRecordList;
let customersOwnerList;
let companyList;
let customersOwner;
let company;

// function randomNum(minNum,maxNum){
//   return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
// }
// function randomVal(valArr) {
//   let index = randomNum(0,valArr.length-1);
//   return valArr[index];
// }

describe('icbc contract',() => {
  beforeEach(async () => {
      // 1.1 拿到 ganache 本地测试网络的账号
      accounts = await web3.eth.getAccounts();

      buyRecordList = await new web3.eth.Contract(BuyRecordList.abi)
        .deploy({ data: BuyRecordList.bytecode })
        .send({ from: accounts[0], gas: '5000000' });
      customersOwnerList = await new web3.eth.Contract(CustomersOwnerList.abi)
        .deploy({ data: CustomersOwnerList.bytecode })
        .send({ from: accounts[0], gas: '5000000' });
      companyList = await new web3.eth.Contract(CompanyList.abi)
        .deploy({ data: CompanyList.bytecode })
        .send({ from: accounts[0], gas: '5000000' });

      await customersOwnerList.methods.createCustomersOwner(buyRecordList.options.address,"郭文锋","123",true,"18888888888")
      .send({
        from: accounts[0],gas: '5000000'
      });
      const [customersOwnerAddr] = await customersOwnerList.methods.getCustomersOwnerList().call();
      customersOwner = await new web3.eth.Contract(CustomersOwner.abi, customersOwnerAddr);

      await companyList.methods.createCompany(buyRecordList.options.address,"中国移动","123","10086","ABCD")
        .send({
        from: accounts[1],gas: '5000000'
      });
      const [companyAddr] = await companyList.methods.getCompanyList().call();
      company = await new web3.eth.Contract(Company.abi, companyAddr);

      console.log(customersOwnerAddr+","+companyAddr);
  });

  it('customersOwner should have correct properties',async () => {
    /*customersOwner 属性验证
    * 方法验证
    * */
    const ownerAddr = await customersOwner.methods.owner().call();
    const buyRecordListAddr = await customersOwner.methods.buyRecordList().call();
    const userName = await customersOwner.methods.userName().call();
    const gender = await customersOwner.methods.gender().call();
    const phone = await customersOwner.methods.phone().call();
    var ownerInfo = await customersOwner.methods.getOwnerInfo().call();

    assert.equal(ownerAddr,accounts[0]);
    assert.equal(buyRecordListAddr,buyRecordList.options.address);
    assert.equal(userName,"郭文锋");
    assert.equal(gender,true);
    assert.equal(phone,"18888888888");
    console.log("name is "+ownerInfo[0]+",gender is "+(ownerInfo[1]?"man":"women")+",phone is "+phone);
    //验证getOwnerInfo js接口方法
    ownerInfo = await TestFuncs.getOwnerInfo(customersOwner.options.address);
    console.log("验证getOwnerInfo js接口方法:")
    console.log(ownerInfo);

    await customersOwner.methods.modifyOwnerInfo("hyk",false,"234567").send({
      from: accounts[0], gas: '5000000'
    });
    ownerInfo = await customersOwner.methods.getOwnerInfo().call();
    console.log(ownerInfo);

    var pwdRight = await customersOwner.methods.pwdRight("123").call();
    assert.equal(pwdRight,true);
    await customersOwner.methods.updatePassword("234").send({
      from: accounts[0], gas: '5000000'
    });
    pwdRight = await customersOwner.methods.pwdRight("234").call();
    assert.equal(pwdRight,true);

    var balance = await customersOwner.methods.getBalance().call();
    assert.equal(balance,10000);
    await customersOwner.methods.updateBalance(20000).send({
      from: accounts[0], gas: '5000000'
    });
    balance = await customersOwner.methods.getBalance().call();
    assert.equal(balance,30000);

    var creditwort = await customersOwner.methods.getCreditwort().call();
    assert.equal(creditwort,100);
    await customersOwner.methods.updateCreditwort(100).send({
      from: accounts[0], gas: '5000000'
    });
    creditwort = await customersOwner.methods.getCreditwort().call();
    assert.equal(creditwort,200);

    //add a customer
    await customersOwner.methods.addCustomers("362123","吴♂♂",20).send({
      from: accounts[0], gas: '5000000'
    });
    await customersOwner.methods.addCustomers("360722","胡♂♂",20).send({
      from: accounts[0], gas: '5000000'
    });
    const CustomersIds = await customersOwner.methods.getCustomersIds().call();
    console.log(CustomersIds);

    //验证getCustomersInfo接口方法
    let customers = [];
    for(var i = 0; i < CustomersIds.length; i++) {
      let customersInfo = await TestFuncs.getCustomersInfo(customersOwner.options.address,CustomersIds[i]);
      customers.push(customersInfo);
    }
    console.log("验证getCustomersInfo接口方法：")
    console.log(customers);

    const customersIdInfoList = await Promise.all(
      CustomersIds.map((customersId) =>
        customersOwner
          .methods.getCustomerInfoById(customersId)
          .call()
      )
    );
    customers = customersIdInfoList.map((customersId,i) => {
      return Object.values(customersIdInfoList[i])
    });
    console.log(customers);

    //验证customersOwnerList方法
    pwdRight = await customersOwnerList.methods.verifyPwd("hyk","234").call({from:accounts[0]});
    assert(pwdRight,true);
    var customersOwnerAddr = await customersOwnerList.methods.creatorOwnerMap(accounts[0]).call();
    assert(customersOwnerAddr,customersOwner.options.address);
  });

  it('company should have correct properties', async () => {
    /*company 属性验证
    * 方法验证
    * */
    const ownerAddr = await company.methods.owner().call({from:accounts[1]});
    const buyRecordListAddr = await company.methods.buyRecordList().call({from:accounts[1]});
    const userName = await company.methods.userName().call({from:accounts[1]});
    const companyNo = await company.methods.companyNo().call({from:accounts[1]});
    const phone = await company.methods.phone().call({from:accounts[1]});
    var companyInfo = await company.methods.getCompanyInfo().call({from:accounts[1]});
    assert.equal(ownerAddr,accounts[1]);
    assert.equal(buyRecordListAddr,buyRecordList.options.address);
    assert.equal(userName,"中国移动");
    assert.equal(companyNo,"ABCD");
    assert.equal(phone,"10086");
    //验证getCompanyInfo js接口方法
    companyInfo = await TestFuncs.getCompanyInfo(company.options.address);
    console.log("验证getCompanyInfo js接口方法：")
    console.log(companyInfo);
    //验证信息修改查询方法
    try {
      await company.methods.modifyCompanyInfo("中国电信","10000","ABCDE").send({
        from: accounts[1], gas: '5000000'
      });
    } catch (err) {
      console.error(err.message);
    }
    companyInfo = await company.methods.getCompanyInfo().call();
    console.log(companyInfo);
    //验证密码
    var pwdRight = await company.methods.pwdRight("123").call();
    assert(pwdRight,true);
    try {
      await company.methods.updatePassword("234").send({
        from: accounts[1], gas: '5000000'
      })
    } catch (e) {
      console.log(e.message);
    }
    pwdRight = await company.methods.pwdRight("234").call();
    assert(pwdRight,true);
    //验证修改查询余额方法
    var balance = await company.methods.getBalance().call({
      from: accounts[1]
    });
    assert(balance,10000);
    await company.methods.updateBalance(20000).send({
      from: accounts[1], gas: '5000000'
    });
    balance = await company.methods.getBalance().call({
      from: accounts[1]
    });
    assert(balance,30000);

    //验证方案添加方法
    await company.methods.addCommodity("套餐1","描述",200,39).send({
      from: accounts[1], gas: '5000000'
    });
    await company.methods.addCommodity("套餐2","描述",100,29).send({
      from: accounts[1], gas: '5000000'
    });
    const commodityIds = await company.methods.getCommodityIds().call();
    console.log(commodityIds);
    let commoditys = [];
    for(var i = 0; i < commodityIds.length; i++) {
      let commodityInfo = await TestFuncs.getCommodityInfo(company.options.address,commodityIds[i]);
      commoditys.push(commodityInfo);
    }
    console.log("验证getCommodityInfo查询方案信息接口：")
    console.log(commoditys);
    const commodityInfoList = await Promise.all(
      commodityIds.map((commodityId) => {
        return company.methods.getCommodityInfoById(commodityId)
          .call();
      })
    );
    commoditys = commodityInfoList.map((commodityId,i)=> {
      return Object.values(commodityInfoList[i])
    })
    console.log(commoditys);

    //验证CompanyList的方法
    pwdRight = await companyList.methods.verifyPwd("中国电信","234").call({from:accounts[1]});
    assert(pwdRight,true);
    var companyAddr = await companyList.methods.creatorCompanyMap(accounts[1]).call();
    assert(companyAddr,company.options.address);
  })

  it("BuyRecordList should have correct property",async ()=>{
    await customersOwner.methods.addCustomers("362123","吴♂♂",20).send({
      from: accounts[0], gas: '5000000'
    });
    await customersOwner.methods.addCustomers("360722","胡♂♂",20).send({
      from: accounts[0], gas: '5000000'
    });
    await company.methods.addCommodity("套餐1","描述",200,39).send({
      from: accounts[1], gas: '5000000'
    });
    await company.methods.addCommodity("套餐2","描述",100,29).send({
      from: accounts[1], gas: '5000000'
    });

    //验证addBuyRecord方法
    await buyRecordList.methods.addBuyRecord(customersOwnerList.options.address, customersOwner.options.address, 1, company.options.address, 1, 1, 39).send({
      from:accounts[0], gas: '5000000'
    });
    var balance = await customersOwner.methods.getBalance().call();
    assert.equal(balance,9961);
    var lastRecordId = await buyRecordList.methods.getLastBuyRecordId().call();
    assert.equal(lastRecordId,1);
    let customersInfo = await customersOwner.methods.getCustomerInfoById(1).call();
    assert(customersInfo[4],1);

    await buyRecordList.methods.addBuyRecord(customersOwnerList.options.address, customersOwner.options.address, 2, company.options.address, 2, 1, 29).send({
      from:accounts[0], gas: '5000000'
    }); 
    balance = await customersOwner.methods.getBalance().call();
    assert.equal(balance,9932);
    lastRecordId = await buyRecordList.methods.getLastBuyRecordId().call();
    assert.equal(lastRecordId,2);
    customersInfo = await customersOwner.methods.getCustomerInfoById(2).call();
    assert(customersInfo[4],2);
    //验证确实插入了两条记录
    const recordIds = await buyRecordList.methods.getRecordList().call();
    console.log(recordIds);
    assert.equal(recordIds[0],1);
    assert.equal(recordIds[1],2);

    //验证getBuyRecordInfo接口方法
    let recordInfos = [];
    let bookInfos = []
    for(var i = 0; i < recordIds.length; i++) {
      let recordInfo = await TestFuncs.getBuyRecordInfo(buyRecordList,recordIds[i]);
      recordInfos.push(recordInfo);
      let bookInfo = await TestFuncs.parseBookInfo(recordInfo);
      bookInfos.push(bookInfo);
    }
    console.log("验证getBuyRecordInfo接口方法：")
    console.log(recordInfos);
    console.log("验证parseBookInfo接口方法：");
    console.log(bookInfos);

    console.log("显示消费记录：");
    let buyRecord1 = await buyRecordList.methods.getBuyRecordById(1).call();
    assert.equal(buyRecord1[0],1);    // 记录ID
    assert.equal(buyRecord1[1],customersOwner.options.address);   // 消费者地址
    assert.equal(buyRecord1[2],1);    // 消费者ID
    assert.equal(buyRecord1[3],company.options.address);    // 公司地址
    assert.equal(buyRecord1[4],1);    // 商品ID
    assert.equal(buyRecord1[5],1);    //购买的商品数量
    assert.equal(buyRecord1[8],0);    // 处理状态：0代表等待处理，1代表批准，2代表拒绝
    assert.equal(buyRecord1[9],39);   // 余额：暂存来自消费者或公司的金额，用于商品支付
    console.log(buyRecord1);

    let buyRecord2 = await buyRecordList.methods.getBuyRecordById(2).call();
    assert.equal(buyRecord2[0],2);    // 记录ID
    assert.equal(buyRecord2[1],customersOwner.options.address);   // 消费者地址
    assert.equal(buyRecord2[2],2);    // 消费者ID
    assert.equal(buyRecord2[3],company.options.address);    // 公司地址
    assert.equal(buyRecord2[4],2);    // 商品ID
    assert.equal(buyRecord2[5],1);    //购买的商品数量
    assert.equal(buyRecord2[8],0);    // 处理状态：0代表等待处理，1代表批准，2代表拒绝
    assert.equal(buyRecord2[9],29);   // 余额：暂存来自消费者或公司的金额，用于商品支付
    console.log(buyRecord2);

    //验证doBuyRecord方法
    //验证approve同意发货
    console.log("显示发货记录：");
    await buyRecordList.methods.doBuyRecord(companyList.options.address, company.options.address, 1, true).send({
      from:accounts[1],gas:5000000
    });
    let companyBalance = await company.methods.getBalance().call({
      from: accounts[1]
    });
    assert.equal(companyBalance,10039);//10000+39
    buyRecord1 = await buyRecordList.methods.getBuyRecordById(1).call();
    assert.equal(buyRecord1[8],1);//订单处理状态变为1
    assert.equal(buyRecord2[9],29);
    console.log(buyRecord1);
    let ownerBalance = await customersOwner.methods.getBalance().call({
      from:accounts[0]
    });
    assert.equal(ownerBalance,9932);//车主余额不发生变化
    let recordInfo = await TestFuncs.getBuyRecordInfo(buyRecordList,1);
    let bookInfo = await TestFuncs.parseBookInfo(recordInfo);
    console.log("商户同意发货后的getBuyRecordInfo和parseBookInfo方法验证");
    console.log(recordInfo);
    console.log(bookInfo);
    //
    //验证reject拒绝发货
    console.log("显示拒绝发货记录：");
    await buyRecordList.methods.doBuyRecord(companyList.options.address,company.options.address,2,false).send({
      from:accounts[1],gas:5000000
    });
    companyBalance = await company.methods.getBalance().call({
      from: accounts[1]
    });
    assert(companyBalance,10039);//不扣也不增
    buyRecord2 = await buyRecordList.methods.getBuyRecordById(2).call();
    assert.equal(buyRecord2[8],2);//订单处理状态变为2
    assert.equal(buyRecord2[9],0);
    ownerBalance = await customersOwner.methods.getBalance().call({
      from:accounts[0]
    });
    assert(ownerBalance,9961);//保险费退还给车主
    recordInfo = await TestFuncs.getBuyRecordInfo(buyRecordList,2);
    bookInfo = await TestFuncs.parseBookInfo(recordInfo);
    console.log("商户拒绝发货后的getBuyRecordInfo和parseBookInfo方法验证");
    console.log(recordInfo);
    console.log(bookInfo);
    
    //
    //验证getBuyRecordIdsByCompany方法
    result = await buyRecordList.methods.getBuyRecordIdsByCompany(company.options.address).call();
    assert(result[0],1);
    assert(result[1],2);
  });

});
