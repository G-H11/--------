// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// 将字符串转换为bytes32类型
contract Utils {
    function stringToBytes32(string memory source)
        internal
        pure
        returns (bytes32 result)
    {
        assembly {
            result := mload(add(source, 32))
        }
    }

    // 将bytes32类型转换为字符串
    function bytes32ToString(bytes32 x) internal pure returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint256 charCount = 0;
        for (uint256 j = 0; j < 32; j++) {
            bytes1 char = bytes1(bytes32(uint256(x) * 2**(8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint256 j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }

    // 比较两个字符串是否相等
    function compareStrings(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}

//这是一个消费者列表合约，用于管理消费者账户。
contract CustomersOwnerList is Utils {  
    address[] public customersOwnerList; // 存储合约的地址  
    mapping(address => address) public creatorOwnerMap; // 将创建者的地址映射到CustomersOwner合约的地址  
    
    function createCustomersOwner(address _BuyRecordList, string memory userName, string memory password, bool gender, string memory phone)  
    public {  
        address ownerAccount = msg.sender;  
        require(isNotRegistered(ownerAccount),"The customersOwner account is not registered! Please register !");  
        address newCustomersOwner = address(new CustomersOwner(_BuyRecordList, ownerAccount, userName, password, gender, phone));  
        customersOwnerList.push(newCustomersOwner);  
        creatorOwnerMap[ownerAccount] = newCustomersOwner;  
    }  
    
    function isNotRegistered(address account) internal view returns (bool) {  
        return creatorOwnerMap[account] == address(0); // 如果账户没有创建合约，映射的默认值是0  
    }  
    
    function verifyPwd(string memory userName, string memory password) public view returns (bool) {  
        address creator = msg.sender;  
        require(!isNotRegistered(creator),"The customersOwner account is not registered! Please register !");  
        address contractAddr = creatorOwnerMap[creator];  
        CustomersOwner customersOwner = CustomersOwner(contractAddr);  
        return compareStrings(customersOwner.userName(), userName) && customersOwner.pwdRight(password);  
    }  
    
    function getCustomersOwnerList() public view returns (address[] memory) {  
        return customersOwnerList;  
    }  
    
    function isCustomersOwner(address ownerAddr) public view returns (bool) {  
        for (uint i = 0; i < customersOwnerList.length; i++) {  
            if (ownerAddr == customersOwnerList[i])   
                return true;  
        }  
        return false;  
    }  
}

// 这是一个消费者合约，用于管理消费者的信息和其购买的商品。
contract CustomersOwner is Utils {  
    address public owner; // 合约创建者地址  
    address public buyRecordList; // 购买记录列表合约地址（这里可能需要根据实际情况调整）  
    string public userName; // 用户名  
    bytes32 private password; // 密码（哈希值）  
    uint256 private nowBalance; // 当前余额（这里可能需要根据实际情况调整）  
    bool public gender; // 性别  
    string public phone; // 电话号码
    string public receiving; //收货地址
    uint256 public creditwort; //信誉值  

    constructor(      
        address _BuyRecordList,  
        address _owner,
        string memory _userName,  
        string memory _pwd,  
        bool _gender,  
        string memory _phone  
    ) {  
        owner = _owner;  
        buyRecordList = _BuyRecordList;  
        userName = _userName;  
        password = stringToBytes32(_pwd);  
        nowBalance = 10000; // 这里可能需要根据实际情况调整  
        gender = _gender;  
        phone = _phone; 
        creditwort = 100;   //初始值为100 
    }


    modifier ownerOnly() {  
        require(owner == msg.sender, "Only owner can call this function");  
        _;  
    }  
  
    modifier ownerOrSystemOnly() {  
        require(  
            msg.sender == owner ||    
            msg.sender == buyRecordList,  
            "Only owner or system contracts can call this function"  
        );  
        _;  
    }     

    // 修改消费者信息  
    function modifyOwnerInfo(string memory _userName, bool _gender, string memory _phone) public ownerOnly {  
        userName = _userName;  
        gender = _gender;  
        phone = _phone;  
    }
  
    function updateBalance(int256 increment) public ownerOrSystemOnly {  
        require((int256(nowBalance) + increment) >= 0, "Insufficient balance");  
        nowBalance = uint256(int256(nowBalance) + increment);  
    }  
  
    function updatePassword(string memory newPwd) public ownerOnly {  
        password = stringToBytes32(newPwd);  
    }  

    function updateCreditwort(int256 increment) public ownerOrSystemOnly {
        require((int256(creditwort) + increment) > 0, "Invalid creditwort");
        creditwort = uint256(int256(creditwort) + increment);
    }

    function pwdRight(string memory _pwd) public view returns (bool) {  
        return password == stringToBytes32(_pwd);  
    }  
  
    // 注意：getBalance函数可能需要根据实际情况调整其可见性和修饰符  
    function getBalance() public view ownerOrSystemOnly returns (uint256) {  
        return nowBalance;  
    }

    function getCreditwort() public view ownerOrSystemOnly returns (uint256) {  
        return creditwort;  
    }
  
    function getOwnerInfo()  public view returns (  
        string memory,  
        bool,  
        string memory  
    )  
    {  
        return (userName, gender, phone);  
    }   

    uint256[] public customers; // 存储客户的customerId  
    mapping(uint256 => Customers) customerMap; // 根据customerId获取客户信息 

    struct Customers {  
        uint256 customerId; // 客户编号 
        string customerNumber;  // 客户身份证
        string customerName;  //客户姓名
        uint256 customerAge;    //客户年龄
        uint256 buyRecordId; // 该消费者的购买记录ID
        bool isValid; // 是否有效  
    }
  
    // 通过客户ID、姓名、年龄添加一位客户，默认的购买记录ID为0（这里假设没有购买记录ID的概念对于客户）  
    function addCustomers(string memory customerNumber, string memory customerName, uint256 customerAge) public ownerOnly {  
        require(notRepeated(customerNumber),"The number already exists, please re-enter it !");  
        uint nowCustomerId = customers.length > 0 ? customers[customers.length - 1] + 1 : 1;  
        customers.push(nowCustomerId);  
        customerMap[nowCustomerId].customerId = nowCustomerId;  
        customerMap[nowCustomerId].customerNumber = customerNumber;  
        customerMap[nowCustomerId].customerName = customerName;  
        customerMap[nowCustomerId].customerAge = customerAge;  
        customerMap[nowCustomerId].buyRecordId = 0; // 表示尚未购买
        customerMap[nowCustomerId].isValid = true;  
    } 
  
    function notRepeated(string memory customerNumber) internal view returns (bool) {  
        for (uint i = 0; i < customers.length; i++) {  
            if (compareStrings(customerMap[i].customerNumber, customerNumber)) return false;  
        }  
        return true;  
    }  
  
    function getCustomersIds() public view returns (uint[] memory) {  
        return customers;  
    }  
  
    function getCustomerInfoById(uint id) public view returns (uint256, string memory, string memory, uint256, uint) {  
        Customers storage target = customerMap[id]; // 假设customerMap[id]的返回类型可以直接这样使用，否则可能需要根据实际情况调整  
        return (  
            target.customerId, // 假设存在customerId字段  
            target.customerNumber,  
            target.customerName,  
            target.customerAge,  
            target.buyRecordId  
        );    
    } 
  
    // 购买服务（或类似的，因为对于Customers可能不是购买保险）  
    function buyService(uint256 customerId, uint256 buyRecordId)  public  ownerOrSystemOnly  {  
        require(customerMap[customerId].isValid, "Customer is not valid");    
        customerMap[customerId].buyRecordId = buyRecordId; // 假设这是与服务相关的记录ID  
    }
}

// 这是一个公司列表合约，用于管理公司的创建和验证。
contract CompanyList is Utils {
    address[] public companyList; // 存储公司合约地址的列表过
    mapping(address => address) public creatorCompanyMap; // 通创建者地址获取公司合约地址的映射，在 web3.js 中可以通过 CompanyList(account) 获取对应的合约地址

    function createCompany(
        address _BuyRecordList,
        string memory userName,
        string memory password,
        string memory phone,
        string memory companyNo
    ) public {
        address companyAccount = msg.sender; // 获取调用者的地址作为公司账户
        require(isNotRegistered(companyAccount), "Company already registered");
        address newCompany = address(
            new Company(
                _BuyRecordList,
                companyAccount,
                userName,
                password,
                phone,
                companyNo
            )
        ); // 创建新的公司合约
        companyList.push(newCompany); // 将新公司的地址添加到公司列表中
        creatorCompanyMap[companyAccount] = newCompany; // 将公司创建者地址映射到公司合约地址
    }

    function getCompanyList() public view returns (address[] memory) {
        return companyList; // 获取公司列表
    }

    function isNotRegistered(address account) internal view returns (bool) {
        return creatorCompanyMap[account] == address(0); // 如果账户还没有创建公司合约，则映射值为0
    }

    function isCompany(address companyAddr) public view returns (bool) {
        for (uint256 i = 0; i < companyList.length; i++) {
            if (companyAddr == companyList[i]) return true; // 判断给定地址是否为公司地址
        }
        return false;
    }

    function verifyPwd(string memory userName, string memory password)
        public
        view
        returns (bool)
    {
        address creator = msg.sender;
        require(!isNotRegistered(creator), "Company not registered");
        address contractAddr = creatorCompanyMap[creator]; // 获取调用者的公司合约地址
        Company company = Company(contractAddr); // 创建 Company 合约实例
        return
            compareStrings(company.userName(), userName) &&
            company.pwdRight(password); // 验证用户名和密码是否正确
    }
}

// 这是一个公司合约，用于管理公司的信息和商品。
contract Company is Utils {
    address public owner; // 创建公司的地址
    address public buyRecordList; // 购买记录列表合约地址
    string public userName; // 用户名
    bytes32 private password; // 密码（哈希值）
    uint256 private nowBalance; // 当前余额
    string public phone; // 电话号码
    string public companyNo; // 公司编号
    uint256 public creditwort;  //信誉值

    constructor(
        address _BuyRecordList,
        address _owner,
        string memory _userName,
        string memory _password,
        string memory _phone,
        string memory _companyNo
    ) {
        owner = _owner;
        buyRecordList = _BuyRecordList;
        userName = _userName;
        password = stringToBytes32(_password);
        nowBalance = 10000;
        phone = _phone;
        companyNo = _companyNo;
        creditwort = 100;   //初始值为100 
    }

    modifier ownerOnly() {
        require(owner == msg.sender, "Only owner can call this function");
        _;
    }

    modifier ownerOrSystemOnly() {
        require(
            msg.sender == owner ||
            msg.sender == buyRecordList,
            "Only owner or system contracts can call this function"
        );
        _;
    }

    function modifyCompanyInfo(
        string memory _userName,
        string memory _phone,
        string memory _companyNo
    ) public ownerOnly {
        userName = _userName;
        phone = _phone;
        companyNo = _companyNo;
    }

    function updatePassword(string memory newPwd) public ownerOnly {
        password = stringToBytes32(newPwd);
    }

    function pwdRight(string memory _pwd) public view returns (bool) {
        return password == stringToBytes32(_pwd);
    }

    function updateBalance(int256 increment) public ownerOrSystemOnly {
        require((int256(nowBalance) + increment) > 0, "Invalid balance");
        nowBalance = uint256(int256(nowBalance) + increment);
    }

    function updateCreditwort(int256 increment) public ownerOrSystemOnly {
        require((int256(creditwort) + increment) > 0, "Invalid creditwort");
        creditwort = uint256(int256(creditwort) + increment);
    }

    function getBalance() public view ownerOrSystemOnly returns (uint256) {
        return nowBalance;
    }

    function getCreditwort() public view ownerOrSystemOnly returns (uint256) {
        return creditwort;
    }

    function getCompanyInfo()
        public
        view
        returns (
            string memory,
            string memory,
            string memory
        )
    {
        return (userName, phone, companyNo);
    }

    function getOwner() public view ownerOrSystemOnly returns (address) {
        return owner;
    }

    function getSender() public view ownerOrSystemOnly returns (address) {
        return msg.sender;
    }

    uint256[] public commodityIds; // 存储商品的ID
    mapping(uint256 => Commodity) commoditys; // 通过ID获取商品信息的映射

    struct Commodity {
        uint256 Id; // 商品ID
        string commodityName; // 商品名称
        string describe;    //商品描述
        uint256 price; // 价格
        uint256 number; // 数量
        uint256 timestamp; // 商品发布的时间戳
        bool onSale; // 是否促销
        bool isValid; // 是否上架('false'表示下架、'true'表示上架)
    }

    function addCommodity(
        string memory commodityName,
        string memory describe,
        uint256 number,
        uint256 price
    ) public ownerOnly {
        uint256 nowCommodityId = commodityIds.length > 0
            ? commodityIds[commodityIds.length - 1] + 1
            : 1;
        commodityIds.push(nowCommodityId);
        commoditys[nowCommodityId].Id = nowCommodityId;
        commoditys[nowCommodityId].commodityName = commodityName;
        commoditys[nowCommodityId].describe = describe;
        commoditys[nowCommodityId].number = number;
        commoditys[nowCommodityId].price = price;
        commoditys[nowCommodityId].timestamp = block.timestamp;
        commoditys[nowCommodityId].onSale = true;
        commoditys[nowCommodityId].isValid = true;
    }

    //销售保险
    function setOnSale(uint256 commodityId, bool onSale) public ownerOnly {
        require(existCommodity(commodityId), "Commodity does not exist");
        commoditys[commodityId].onSale = onSale;
    }

    function setNumber(uint256 commodityId, uint256 number) public ownerOrSystemOnly {
        require(existCommodity(commodityId), "Commodity does not exist");
        commoditys[commodityId].number = uint256(commoditys[commodityId].number - number);
    }

    function getCommodityIds() public view returns (uint256[] memory) {
        return commodityIds;
    }

    function getCommodityInfoById(uint256 commodityId)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        require(existCommodity(commodityId), "Commodity does not exist");
        Commodity storage commodity = commoditys[commodityId];
        return (
            commodity.Id,
            commodity.commodityName,
            commodity.describe,
            commodity.number,
            commodity.price,
            commodity.timestamp,
            commodity.onSale
        );
    }

    function existCommodity(uint256 commodityId) internal view returns (bool) {
        return commoditys[commodityId].isValid;
    }
}

// 这是一个购买记录列表合约，用于管理购买记录。
contract BuyRecordList {
    uint256[] recordList; // 存储购买记录ID的列表
    mapping(uint256 => BuyRecord) buyRecords; // 通过ID获取购买记录的映射

    struct BuyRecord {
        uint256 Id; // 记录ID
        address customersOwner; // 消费者地址
        uint256 customerId; // 消费者ID
        address company; // 公司地址
        uint256 commodityId; // 商品ID
        uint256 number;     //购买的商品数量
        uint256 startTime; // 商品购买时的时间戳
        uint256 endTime;    //商品结算时的时间戳
        uint256 processState; // 处理状态：0代表等待处理，1代表批准，2代表拒绝
        uint256 Balance; // 余额：暂存来自消费者或公司的金额，用于商品支付
        bool isValid; // 是否有效
    }

    function getRecordList() public view returns (uint256[] memory) {
        return recordList; // 获取购买记录ID列表
    }

    function getBuyRecordById(uint256 recordId)
        public
        view
        returns (
            uint256,
            address,
            uint256,
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        require(existRecord(recordId)); // 确保记录存在
        BuyRecord storage buyRecord = buyRecords[recordId];
        return (
            buyRecord.Id,
            buyRecord.customersOwner,
            buyRecord.customerId,
            buyRecord.company,
            buyRecord.commodityId,
            buyRecord.number,
            buyRecord.startTime,
            buyRecord.endTime,
            buyRecord.processState,
            buyRecord.Balance
        );
    }

    // 根据公司地址查找购买记录的ID
    function getBuyRecordIdsByCompany(address company)
        public
        view
        returns (uint256[] memory)
    {
        uint256 k = 0;
        for (uint256 i = 0; i < recordList.length; i++) {
            if (buyRecords[recordList[i]].company == company) k++;
        }
        uint256[] memory recordIds = new uint256[](k);
        k = 0;
        for (uint256 i = 0; i < recordList.length; i++) {
            if (buyRecords[recordList[i]].company == company) {
                recordIds[k++] = recordList[i];
            }
        }
        return recordIds;
    }

    function existRecord(uint256 recordId) internal view returns (bool) {
        return buyRecords[recordId].isValid; // 如果 isValid 为 true 则表示记录存在
    }

    function addBuyRecord(
        address customersOwnerListAddr,
        address customersOwner,
        uint256 customerId,
        address company,
        uint256 commodityId,
        uint256 number,
        uint256 price
    ) public {
        CustomersOwner customersOwnerContract = CustomersOwner(customersOwner);
        require(msg.sender == customersOwnerContract.owner());
        CustomersOwnerList customersOwnerList = CustomersOwnerList(customersOwnerListAddr);
        require(customersOwnerList.isCustomersOwner(customersOwner));
        require(customersOwnerContract.getBalance() > uint256(price * number));
        customersOwnerContract.updateBalance(-int256(price * number)); // 减去消费者的余额
        uint256 nowBuyRecordId = recordList.length > 0
            ? recordList[recordList.length - 1] + 1
            : 1;
        recordList.push(nowBuyRecordId);
        buyRecords[nowBuyRecordId].Id = nowBuyRecordId;
        buyRecords[nowBuyRecordId].customersOwner = customersOwner;
        buyRecords[nowBuyRecordId].customerId = customerId;
        buyRecords[nowBuyRecordId].company = company;
        buyRecords[nowBuyRecordId].commodityId = commodityId;
        buyRecords[nowBuyRecordId].number = number;
        buyRecords[nowBuyRecordId].startTime = block.timestamp;
        buyRecords[nowBuyRecordId].processState = 0;
        buyRecords[nowBuyRecordId].Balance = uint256(price * number);
        buyRecords[nowBuyRecordId].isValid = true;
        customersOwnerContract.updateCreditwort(2);
        customersOwnerContract.buyService(customerId, nowBuyRecordId);
    }

    function getLastBuyRecordId() public view returns (uint256) {
        return recordList[recordList.length - 1]; // 返回最后一条购买记录的ID
    }

    function doBuyRecord(
        address companyListAddr,
        address companyAddr,
        uint256 recordId,
        bool approve
    ) public {
        require(existRecord(recordId),"The record does not exist !");
        Company companyContract = Company(companyAddr);
        require(companyContract.owner() == msg.sender,"Accounts don't match !"); // 只有公司可以处理购买记录
        CompanyList companyList = CompanyList(companyListAddr);
        require(companyList.isCompany(companyAddr),"The merchant is not on record !");
        BuyRecord storage buyRecord = buyRecords[recordId];
        require(buyRecord.company == companyAddr,"There is a mismatch between the merchants selling the product !"); // 购买记录的公司地址必须等于 companyAddr
        require(buyRecord.processState == 0,"The record has been accepted !"); // 记录未处理  
        buyRecord.endTime = block.timestamp;  
        if (approve) {
            companyContract.updateBalance(int256(buyRecord.Balance)); // 向公司转账
            buyRecord.Balance = buyRecord.Balance - buyRecord.Balance;
            companyContract.updateCreditwort(2);
            buyRecord.processState = 1;
            companyContract.setNumber(buyRecord.commodityId, buyRecord.number);
        } else {
            CustomersOwner customersOwner = CustomersOwner(buyRecord.customersOwner);
            customersOwner.updateBalance(int256(buyRecord.Balance)); // 将金额返回给消费者
            buyRecord.Balance = buyRecord.Balance - buyRecord.Balance;
            buyRecord.processState = 2;
        }
        if (int256(buyRecord.endTime - buyRecord.startTime) / 3600000 > 24){
                companyContract.updateCreditwort(-5);
            }
    }

    function updateBuyRecordBalance(uint256 recordId, uint256 newBalance)
        public
    {
        BuyRecord storage buyRecord = buyRecords[recordId];
        buyRecord.Balance = newBalance;
    }

}
