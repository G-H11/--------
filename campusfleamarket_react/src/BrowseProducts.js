import React, { useState, useEffect } from 'react';
import { List, Typography, message, Row, Col, Pagination, Card, Input, Select } from 'antd';
import Web3 from 'web3';
import CompanyABI from './compiled/Company.json';
import CompanyListABI from './compiled/CompanyList.json';
import address from './address.json';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// CardComponent 组件定义
const CardComponent = ({ imageUrl, title, price, number, onSale }) => (
  <Card
    cover={<img alt={title} src={imageUrl} />}
    title={title}
  >
    <p>价格: {price} ETH</p>
    <p>库存: {number}</p>
    <p>促销: {onSale ? '是' : '否'}</p>
  </Card>
);

const ProductList = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [companyContract, setCompanyContract] = useState(null);
  const [companyListContract, setCompanyListContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [companyAddress, setCompanyAddress] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState(null);

  const itemsPerPage = 3; // 每页显示三个商品

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const companyListContractInstance = new web3Instance.eth.Contract(CompanyListABI.abi, address[2]);
          setCompanyListContract(companyListContractInstance);

          const fetchedCompanyAddr = await companyListContractInstance.methods.creatorCompanyMap(accounts[0]).call();
          if (fetchedCompanyAddr === '0x0000000000000000000000000000000000000000') {
            message.error('该账户没有创建公司!');
            setLoading(false);
            return;
          }
          setCompanyAddress(fetchedCompanyAddr);

          const companyContractInstance = new web3Instance.eth.Contract(CompanyABI.abi, fetchedCompanyAddr);
          setCompanyContract(companyContractInstance);
        } catch (error) {
          console.error('无法连接到以太坊网络或加载合约失败！', error);
          message.error('无法连接到以太坊网络或加载合约失败！');
        }
      } else {
        message.error('MetaMask钱包未安装!');
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (!companyContract) {
        message.error('未加载公司合约!');
        return;
      }

      try {
        const commodityIds = await companyContract.methods.getCommodityIds().call();
        const loadedProducts = await Promise.all(
          commodityIds.map(async (commodityId) => {
            const commodity = await companyContract.methods.getCommodityInfoById(commodityId).call();
            console.log("wffsadf",commodity)
            return {
              id: parseInt(commodity[0]),
              name: commodity[1],
              desc: commodity[2],
              number: parseInt(commodity[3]),
              price: parseInt(commodity[4]),
              image: commodity[5],
              timestamp: parseInt(commodity[6]),
              onSale: commodity[7],
            };
          })
        );

        setProducts(loadedProducts);
      } catch (error) {
        console.error('提取产品列表失败:', error);
        message.error('提取产品列表失败, 请重试!');
      } finally {
        setLoading(false);
      }
    };

    if (companyContract) {
      loadProducts();
    }
  }, [companyContract]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchTerm(value.toLowerCase());
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm) &&
      (priceRange === null ||
        (priceRange === '0-1' && product.price <= 1) ||
        (priceRange === '1-5' && product.price > 1 && product.price <= 5) ||
        (priceRange === '5-10' && product.price > 5 && product.price <= 10) ||
        (priceRange === '10+' && product.price > 10))
    );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Search placeholder="搜索产品" onSearch={handleSearch} enterButton />
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            onChange={handlePriceRangeChange}
            placeholder="筛选价格"
            allowClear
          >
            <Option value={null}>全部</Option>
            <Option value="0-1">0-1 ETH</Option>
            <Option value="1-5">1-5 ETH</Option>
            <Option value="5-10">5-10 ETH</Option>
            <Option value="10+">10 ETH 以上</Option>
          </Select>
        </Col>
      </Row>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {currentProducts.map(item => (
              <Col key={item.id} span={8}>
                <CardComponent
                  imageUrl={item.image}
                  title={item.name}
                  price={item.price}
                  number={item.number}
                  onSale={item.onSale}
                />
              </Col>
            ))}
          </Row>
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={filteredProducts.length}
            onChange={handlePageChange}
            style={{ textAlign: 'center', marginTop: '20px' }}
          />
        </>
      )}
    </div>
  );
};

export default ProductList;
