import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Select, message, Typography } from 'antd';
import addresses from './address.json';
import BuyRecordListABI from './compiled/BuyRecordList.json';
import CustomersOwnerListABI from './compiled/CustomersOwnerList.json';
import CompanyListABI from './compiled/CompanyList.json';

const { Option } = Select;
const { Title } = Typography;

const LoginForm = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState({});
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const initWeb3AndContracts = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const buyRecordListContract = new web3Instance.eth.Contract(BuyRecordListABI.abi, addresses[0]);
          const customersOwnerListContract = new web3Instance.eth.Contract(CustomersOwnerListABI.abi, addresses[1]);
          const companyListContract = new web3Instance.eth.Contract(CompanyListABI.abi, addresses[2]);

          setContracts({
            BuyRecordList: buyRecordListContract,
            CustomersOwnerList: customersOwnerListContract,
            CompanyList: companyListContract,
          });
        } catch (error) {
          console.error('Failed to load web3, accounts, or contract. Check console for details.');
          console.error(error);
          setAlert('无法连接到以太坊网络或合约加载失败！');
        }
      } else {
        setAlert('系统检测不到MetaMask钱包,请安装MetaMask插件!');
      }
    };
    initWeb3AndContracts();
  }, []);

  const handleUserLogin = async (values) => {
    const { userName, password, role } = values;

    try {
      const passwordHash = web3.utils.soliditySha3(password);
      const owner = account;

      if (role === 'customer') {
        const pwdRightCustomer = await contracts.CustomersOwnerList.methods.verifyPwd(userName, passwordHash).call({ from: owner, gas: '5000000' });
        if (pwdRightCustomer) {
          const ownerAddr = await contracts.CustomersOwnerList.methods.creatorOwnerMap(owner).call();
          message.success("登陆成功！");
          navigate(`/customersOwner?CustomersOwnerAddress=${ownerAddr}`);
        } else {
          setAlert('用户名或密码无效!');
        }
      } else if (role === 'company') {
        const pwdRightCompany = await contracts.CompanyList.methods.verifyPwd(userName, passwordHash).call({ from: owner, gas: '5000000' });
        if (pwdRightCompany) {
          const companyAddr = await contracts.CompanyList.methods.creatorCompanyMap(owner).call();
          message.success("登陆成功！");
          navigate(`/company?CompanyAddress=${companyAddr}`);
        } else {
          setAlert('用户名或密码无效!');
        }
      } else {
        setAlert('角色选择无效!');
      }
    } catch (err) {
      console.error(err.message);
      setAlert(err.message);
    }
  };

  const onFinish = (values) => {
    handleUserLogin(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>用户登录</Title>
      {alert && <div style={{ color: 'red', marginBottom: '10px' }}>{alert}</div>}
      <Form
        name="loginForm"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="用户名"
          name="userName"
          rules={[{ required: true, message: '请输入用户名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="身份"
          name="role"
          initialValue="customer"
          rules={[{ required: true, message: '请选择身份！' }]}
        >
          <Select>
            <Option value="customer">客户</Option>
            <Option value="company">店家</Option>
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            登录
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link to="/registration">没有账号？去注册吧！</Link>
      </div>
    </div>
  );
};

export default LoginForm;
