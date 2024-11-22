import React, { useState, useEffect } from 'react';
import { Typography, message, Card } from 'antd';
import Web3 from 'web3';
import CustomersOwnerABI from './compiled/CustomersOwner.json';
import CustomersOwnerListABI from './compiled/CustomersOwnerList.json';
import address from './address.json';

const { Title } = Typography;

const CreditwortCustomer = () => {
  const [web3, setWeb3] = useState(null);
  const [customersOwnerContract, setCustomersOwnerContract] = useState(null);
  const [customersOwnerAddress, setCustomersOwnerAddress] = useState(null);
  const [creditwort, setCreditwort] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const customersOwnerListContractInstance = new web3Instance.eth.Contract(CustomersOwnerListABI.abi, address[1]);
          
          const fetchedCustomersOwnerAddr = await customersOwnerListContractInstance.methods.creatorOwnerMap(accounts[0]).call();
          if (fetchedCustomersOwnerAddr === '0x0000000000000000000000000000000000000000') {
            message.error('该账户没有创建用户!');
            return;
          }
          setCustomersOwnerAddress(fetchedCustomersOwnerAddr);

          const companyContractInstance = new web3Instance.eth.Contract(CustomersOwnerABI.abi, fetchedCustomersOwnerAddr);
          setCustomersOwnerContract(companyContractInstance);
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
    const fetchCreditwort = async () => {
      if (customersOwnerContract && account) {
        try {
          const creditwort = await customersOwnerContract.methods.getCreditwort().call({ from: account });
          console.log('Fetched creditwort:', creditwort); // 调试信息
          setCreditwort(creditwort);
        } catch (error) {
          console.error('获取信用值失败:', error);
          message.error('获取信用值失败, 请重试!');
        }
      }
    };

    fetchCreditwort();
  }, [customersOwnerContract, account]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <Title level={2}>用户信用值</Title>
      {creditwort !== null ? (
        <Card>
          <p>当前信用值: {Number(creditwort)}</p>
        </Card>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default CreditwortCustomer;
