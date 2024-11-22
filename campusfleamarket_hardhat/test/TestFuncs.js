
const web3 = require("./web3");
const customersOwner = require('../artifacts/contracts/Campus flea market.sol/CustomersOwner.json');
const company = require('../artifacts/contracts/Campus flea market.sol/Company.json');

const Company = address => new web3.eth.Contract(company.abi, address);
const CustomersOwner = address => new web3.eth.Contract(customersOwner.abi, address);

let getOwnerInfo =
  async function getOwnerInfo(customersOwnerAddr) {
    let customersOwnerContract = CustomersOwner(customersOwnerAddr);
    let ownerInfo = await customersOwnerContract.methods.getOwnerInfo().call();
    let owner = {}
    owner.ownerName = ownerInfo[0];
    owner.gender = ownerInfo[1];
    owner.phone = ownerInfo[2];
    return owner;
  }
let getCustomersInfo =
  async function getCustomersInfo(customersOwnerAddr,customersId) {
    let customersOwnerContract = CustomersOwner(customersOwnerAddr);
    let customersInfo = await customersOwnerContract.methods.getCustomerInfoById(customersId).call();
    let customers = {};
    customers.customerNumber = customersInfo[1];
    customers.customerName = customersInfo[2];
    customers.customerAge = customersInfo[3];
    customers.buyRecordId = customersInfo[4];
    return customers;
  }
let getCompanyInfo =
  async function getCompanyInfo(companyAddr) {//获得公司信息
    let companyContract = Company(companyAddr);
    let companyInfo = await companyContract.methods.getCompanyInfo().call();
    let company = {};
    company.userName = companyInfo[0];
    company.phone = companyInfo[1];
    company.companyNo = companyInfo[2];
    return company;
  }
let getCommodityInfo =
  async function getCommodityInfo(companyAddr,commodityId) {//获得方案信息
    let companyContract = Company(companyAddr);
    let commodityInfo = await companyContract.methods.getCommodityInfoById(commodityId).call();
    //返回commodity.Id,commodity.schemeName,commodity.lastTime,commodity.price,commodity.payOut,commodity.onSale共6个值
    let commodity = {};
    commodity.Id = commodityInfo[0];
    commodity.commodityName = commodityInfo[1];
    commodity.describe = commodityInfo[2];
    commodity.number = commodityInfo[3];
    commodity.price = commodityInfo[4];
    commodity.timestamp = commodityInfo[5];
    commodity.onSale = commodityInfo[6];
    return commodity;
  }
let getBuyRecordInfo =
  async function getBuyRecordInfo(buyRecordListContract,buyRecordId) {
    //返回结果顺序为buyRecord.Id,buyRecord.carOwner,buyRecord.carId,buyRecord.company
    //,buyRecord.schemeId,buyRecord.startTime,buyRecord.processState,buyRecord.Balance。共8个返回值
    let buyRecordInfo = await buyRecordListContract.methods.getBuyRecordById(buyRecordId).call();
    let buyRecord = {};
    buyRecord.Id = buyRecordInfo[0];
    buyRecord.customersOwner = buyRecordInfo[1];
    buyRecord.customerId = buyRecordInfo[2];
    buyRecord.company = buyRecordInfo[3];
    buyRecord.commodityId = buyRecordInfo[4];
    buyRecord.startTime = buyRecordInfo[6];
    buyRecord.endTime = buyRecordInfo[7];
    buyRecord.processState = buyRecordInfo[8];
    buyRecord.Balance = buyRecordInfo[9];
    return buyRecord;
  }

let parseBookInfo =
  async function parseBookInfo(buyRecord) {
    let bookInfo = {};
    bookInfo.bookId = buyRecord.Id;//获得订单编号
    bookInfo.balance = buyRecord.Balance;//获得订单金额
    let result = await this.overTime(buyRecord.startTime,buyRecord.endTime);//返回结果形式[true/false,逾期Date]
    console.log("结算:",result);
    let isOverTime = result[0];
    let startTimDate = result[1];
    let overTimeDate = result[2];
    bookInfo.startTime = startTimDate.getFullYear()+"/"+(startTimDate.getMonth()+1)+"/"+startTimDate.getDate();
    bookInfo.overTime = overTimeDate.getFullYear()+"/"+(overTimeDate.getMonth()+1)+"/"+overTimeDate.getDate();
    if(buyRecord.processState==0) bookInfo.state="待处理";
    else if(buyRecord.processState==2) bookInfo.state="已拒绝";
    else if(buyRecord.processState==1) {//已经同意，判断是否逾期
      if(isOverTime) bookInfo.state = "超时结算";
      else bookInfo.state = "按时结算";
    }
    return bookInfo;
  }

let overTime =
  async function overTime(startTime,endTime) {//根据订单记录判断是否逾期
    console.log("订单开始时间："+startTime);
    console.log("订单结算时间："+endTime);
    let startDate = new Date(parseInt(startTime));
    startDate.setFullYear(startDate.getFullYear());//开始年月日
    console.log("开始年月日:",startDate);
    let endDate = new Date(parseInt(endTime));
    endDate.setFullYear(endDate.getFullYear());//结算年月日
    console.log("结算年月日:",endDate);
    if((Number(endTime) - Number(startTime)) / 3600000 > 24) return [true,startDate,endDate];//逾期时间与当前时间比较，如果大于就逾期
    else return [false,startDate,endDate];
  }

module.exports = {
  getOwnerInfo:getOwnerInfo,
  getCustomersInfo:getCustomersInfo,
  getCompanyInfo:getCompanyInfo,
  getCommodityInfo:getCommodityInfo,
  getBuyRecordInfo:getBuyRecordInfo,
  parseBookInfo:parseBookInfo,
  overTime:overTime,
}
