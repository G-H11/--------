import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Form, Input, Select, message, Typography } from 'antd';
import addresses from './address.json';
import BuyRecordListABI from './compiled/BuyRecordList.json';
import CustomersOwnerListABI from './compiled/CustomersOwnerList.json';
import CompanyListABI from './compiled/CompanyList.json';

const { Option } = Select;
const { Title } = Typography;

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    password: '',
    gender: '',
    contact: '',
    companyNumber: '',
  });
  const [role, setRole] = useState('customer'); // New state for role selection
  const [alert, setAlert] = useState('');
  const [contracts, setContracts] = useState({});
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [form] = Form.useForm(); // Using Form.useForm() for form instance

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

  const handleUserRegistration = async (values) => {
    const { name, password, gender, contact, companyNumber } = values;

    try {
      const passwordHash = web3.utils.soliditySha3(password);
      const owner = account;
      const buyRecordListAddress = contracts.BuyRecordList.options.address;

      if (role === 'customer') {
        await contracts.CustomersOwnerList.methods.createCustomersOwner(buyRecordListAddress, name, passwordHash, gender, contact).send({ from: owner });
        message.success("注册成功！");
        navigate('/login');
      } else if (role === 'company') {
        await contracts.CompanyList.methods.createCompany(buyRecordListAddress, name, passwordHash, contact, companyNumber).send({ from: owner });
        message.success("注册成功！");
        navigate('/login');
      } else {
        setAlert('角色选择无效!');
      }
    } catch (err) {
      console.error(err.message);
      setAlert(err.message);
    }
  };

  const validateForm = async (values) => {
    try {
      await form.validateFields();
      setAlert('');
      return true;
    } catch (error) {
      setAlert('请填写所有必填字段！');
      return false;
    }
  };

  const onFinish = async (values) => {
    if (await validateForm(values)) {
      handleUserRegistration(values);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>用户注册</Title>
      {alert && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{alert}</div>}
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label={role === 'customer' ? '用户名' : '店铺名称'}
          name="name"
          rules={[{ required: true, message: `请输入${role === 'customer' ? '姓名' : '公司名称'}!` }]}
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
        {role === 'customer' && (
          <Form.Item
            label="性别"
            name="gender"
            rules={[{ required: true, message: '请输入性别!' }]}
          >
            <Input />
          </Form.Item>
        )}
        <Form.Item
          label="联系电话"
          name="contact"
          rules={[{ required: true, message: '请输入联系方式!' }]}
        >
          <Input />
        </Form.Item>
        {role === 'company' && (
          <Form.Item
            label="营业证号"
            name="companyNumber"
            rules={[{ required: true, message: '请输入公司营业号!' }]}
          >
            <Input />
          </Form.Item>
        )}
        <Form.Item
          label="角色"
          name="role"
          initialValue={role}
          rules={[{ required: true, message: '请选择角色!' }]}
        >
          <Select onChange={value => setRole(value)}>
            <Option value="customer">客户</Option>
            <Option value="company">店家</Option>
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            注册
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link to="/login">已有账号？去登录吧！</Link>
      </div>
    </div>
  );
};

export default RegistrationForm;
