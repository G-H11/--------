import React, { useState, useEffect } from 'react';
import { Typography, message, Row, Col, Pagination, Card, Button } from 'antd';
import Web3 from 'web3';
import CompanyABI from './compiled/Company.json';
import CompanyListABI from './compiled/CompanyList.json';
import BuyRecordListABI from './compiled/BuyRecordList.json';
import CustomersOwnerABI from './compiled/CustomersOwner.json';
import CustomersOwnerListABI from './compiled/CustomersOwnerList.json';
import address from './address.json';

const { Title } = Typography;

const CardComponent = ({ imageUrl, title, price, number, onSale, onBuy }) => (
  <Card cover={<img alt={title} src={imageUrl} />} title={title}>
    <p>价格: {price} ETH</p>
    <p>库存: {number}</p>
    <p>促销: {onSale ? '是' : '否'}</p>
    <Button type="primary" onClick={onBuy}>购买</Button>
  </Card>
);

const BuyProduct = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [companyListContract, setCompanyListContract] = useState(null);
  const [customersOwnerListContract, setCustomersOwnerListContract] = useState(null);
  const [buyRecordListContract, setBuyRecordListContract] = useState(null);
  const [customersOwner, setCustomersOwnerAddress] = useState(null);
  const [account, setAccount] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const buyRecordList = new web3Instance.eth.Contract(BuyRecordListABI.abi, address[0]);
          setBuyRecordListContract(buyRecordList);
          

          const customersOwnerList = new web3Instance.eth.Contract(CustomersOwnerListABI.abi, address[1]);
          setCustomersOwnerListContract(customersOwnerList);

          const companyList = new web3Instance.eth.Contract(CompanyListABI.abi, address[2]);
          setCompanyListContract(companyList);

          const fetchedCustomersOwnerAddr = await customersOwnerList.methods.creatorOwnerMap(accounts[0]).call();
          console.debug('Fetched CustomersOwner Address:', fetchedCustomersOwnerAddr);
          
          if (fetchedCustomersOwnerAddr === '0x0000000000000000000000000000000000000000') {
            message.error('该账户没有创建用户!');
            setLoading(false);
            return;
          }
          setCustomersOwnerAddress(fetchedCustomersOwnerAddr);

          const customersOwnerContract = new web3Instance.eth.Contract(CustomersOwnerABI.abi, fetchedCustomersOwnerAddr);
          const customerIds = await customersOwnerContract.methods.getCustomersIds().call();
          console.debug('Fetched Customer Info:', customerIds);
          
          if (!customerIds || !customerIds[0]) {
            message.error('用户信息不完整，请创建用户!');
            setLoading(false);
            return;
          }
          setCustomerId(parseInt(customerIds[0]));
          console.debug('customerIds[0]', customerIds[0]);

          await loadProducts(companyList, web3Instance);
        } else {
          message.error('请安装 MetaMask!');
        }
      } catch (error) {
        console.error('初始化失败', error);
        message.error('初始化失败，请检查控制台获取更多信息。');
      }
    };

    init();
  }, []);

  const loadProducts = async (companyList, web3Instance) => {
    if (!companyList) {
      message.error('未加载公司列表合约!');
      return;
    }

    try {
      const companyAddresses = await companyList.methods.getCompanyList().call();
      console.debug('Fetched Company Addresses:', companyAddresses);
      
      const allProducts = [];

      for (const companyAddr of companyAddresses) {
        const companyContractInstance = new web3Instance.eth.Contract(CompanyABI.abi, companyAddr);
        const commodityIds = await companyContractInstance.methods.getCommodityIds().call();
        console.debug(`Fetched Commodity IDs for company ${companyAddr}:`, commodityIds);

        for (const commodityId of commodityIds) {
          const commodity = await companyContractInstance.methods.getCommodityInfoById(commodityId).call();
          console.debug(`Fetched Commodity Info for commodity ${commodityId}:`, commodity);
          console.log("commodity[7]",commodity[7]);
          allProducts.push({
            commodityId: parseInt(commodity[0]),
            commodityName: commodity[1],
            desc: commodity[2],
            number: parseInt(commodity[3]),
            price: parseInt(commodity[4]),
            image: commodity[5],
            timestamp: parseInt(commodity[6]),
            onSale: commodity[7],
            companyAddr,
          });
        }
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('提取产品列表失败:', error);
      message.error('提取产品列表失败, 请重试!');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (commodityId, price, number, companyAddr) => {
    if (!account || !buyRecordListContract || !customerId) {
      message.error('无法购买商品，缺少必要的合约实例或账户信息');
      return;
    }

    try {
      console.debug('Buying product with:', { commodityId, price, number, companyAddr });
      console.log('customerId',customerId);
      console.log("address[1]",address[1]);
      console.log("customersOwner",customersOwner);
      console.log("commodityId",commodityId);

      const RecordList = await buyRecordListContract.methods.getRecordList().call();
      console.log("RecordList",RecordList);

      await buyRecordListContract.methods.addBuyRecord(
        address[1],
        customersOwner,
        customerId,
        companyAddr,
        commodityId,
        number,
        price
      ).send({ from: account, gas: 5000000, value: price * number });

      message.success('购买成功！');
      await loadProducts(companyListContract, web3);
    } catch (error) {
      console.error('购买失败', error);
      message.error('购买失败，请重试！');
    }
  };

  const itemsPerPage = 3;
  const currentItems = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <Title level={2}>商品列表</Title>
      <Row gutter={16}>
        {currentItems.map((product, index) => (
          <Col span={6} key={`${product.commodityId}-${index}`}>
            <CardComponent
              imageUrl={product.image}
              title={product.commodityName}
              price={product.price}
              number={product.number}
              onSale={product.onSale}
              onBuy={() => handleBuy(product.commodityId, product.price, 1, product.companyAddr)}
            />
          </Col>
        ))}
      </Row>
      <Pagination
        current={currentPage}
        onChange={page => setCurrentPage(page)}
        pageSize={itemsPerPage}
        total={products.length}
      />
    </div>
  );
};

export default BuyProduct;
