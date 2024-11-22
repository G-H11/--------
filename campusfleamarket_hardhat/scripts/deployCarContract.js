// bored-ape.test.ts

const fs = require('fs-extra');
const path = require('path');
const hardhat = require("hardhat");


async function main() {
    let buyRecordList,customersOwnerList,companyList;

   // let owner;
   // let address1;

   //发布合约 "BuyRecordList","CustomersOwnerList","CompanyList"
    const BuyRecordList = await hardhat.ethers.getContractFactory("BuyRecordList");
    const CustomersOwnerList = await hardhat.ethers.getContractFactory("CustomersOwnerList");
    const CompanyList = await hardhat.ethers.getContractFactory("CompanyList");

    buyRecordList = await BuyRecordList.deploy( );
    customersOwnerList = await CustomersOwnerList.deploy( );
    companyList = await CompanyList.deploy( );

    //console.log( await  accidentRecordList.getAddress());
    // console.log( await  buyRecordList.getAddress());
     const contractAddrArray = [];
     contractAddrArray.push(await buyRecordList.getAddress());
     contractAddrArray.push(await customersOwnerList.getAddress());
     contractAddrArray.push(await companyList.getAddress());
      //  合约地址写入文件系统
    const addressFile = path.resolve(__dirname, './address.json');
    fs.writeFileSync(addressFile, JSON.stringify(contractAddrArray));
    console.log('地址写入成功:', addressFile);

   [owner, address1] = await hardhat.ethers.getSigners();
    console.log( owner);

};
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

