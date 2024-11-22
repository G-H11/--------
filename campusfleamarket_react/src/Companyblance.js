import React, { useState, useEffect } from 'react';
import { Typography, message, Card } from 'antd';
import Web3 from 'web3';
import CompanyABI from './compiled/Company.json';
import CompanyListABI from './compiled/CompanyList.json';
import address from './address.json';

const { Title } = Typography;

const BalanceComponent = () => {
  const [web3, setWeb3] = useState(null);
  const [companyContract, setCompanyContract] = useState(null);
  const [companyAddress, setCompanyAddress] = useState(null);
  const [balance, setBalance] = useState(null);
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

          const companyListContractInstance = new web3Instance.eth.Contract(CompanyListABI.abi, address[2]);
          
          const fetchedCompanyAddr = await companyListContractInstance.methods.creatorCompanyMap(accounts[0]).call();
          if (fetchedCompanyAddr === '0x0000000000000000000000000000000000000000') {
            message.error('该账户没有创建公司!');
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
    const fetchBalance = async () => {
      if (companyContract && account) {
        try {
          const balance = await companyContract.methods.getBalance().call({ from: account });
          console.log('Fetched balance:', balance); // 调试信息
          setBalance(balance);
        } catch (error) {
          console.error('获取余额失败:', error);
          message.error('获取余额失败, 请重试!');
        }
      }
    };

    fetchBalance();
  }, [companyContract, account]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <Title level={2}>公司账户余额</Title>
      {balance !== null ? (
        <Card>
          <p>当前余额: {Number(balance)} ETH</p>
        </Card>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default BalanceComponent;
