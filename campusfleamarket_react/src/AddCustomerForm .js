import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, InputNumber, Typography } from 'antd';
import Web3 from 'web3';
import CustomersOwnerABI from './compiled/CustomersOwner.json'; // Import CustomersOwner ABI
import CustomersOwnerListABI from './compiled/CustomersOwnerList.json'; // Import CustomersOwnerList ABI
import address from './address.json';

const { Title } = Typography;

const AddCustomerForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [customersOwnerContract, setCustomersOwnerContract] = useState(null);
  const [customersOwnerListContract, setCustomersOwnerListContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [customersOwnerAddress, setCustomersOwnerAddress] = useState(null);

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
          setCustomersOwnerListContract(customersOwnerListContractInstance);

          const fetchedCustomersOwnerAddr = await customersOwnerListContractInstance.methods.creatorOwnerMap(accounts[0]).call();
          setCustomersOwnerAddress(fetchedCustomersOwnerAddr);

          const customersOwnerContractInstance = new web3Instance.eth.Contract(CustomersOwnerABI.abi, fetchedCustomersOwnerAddr);
          setCustomersOwnerContract(customersOwnerContractInstance);

        } catch (error) {
          console.error('无法连接到以太坊网络或加载合约失败！');
          console.error(error);
          message.error('无法连接到以太坊网络或加载合约失败！');
        }
      } else {
        message.error('MetaMask 未安装！');
      }
    };
    initWeb3();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    const { customerNumber, customerName, customerAge } = values;
    try {
      await customersOwnerContract.methods.addCustomers(customerNumber, customerName, customerAge)
        .send({ from: account, gas: '5000000' });
      message.success('用户添加成功！');
      form.resetFields();
    } catch (err) {
      console.error(err.message);
      message.error('用户添加失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  if (!customersOwnerAddress) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>添加用户</Title>
      <Form
        form={form}
        name="addCustomerForm"
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="身份证号"
          name="customerNumber"
          rules={[{ required: true, message: '请输入身份证号!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="姓名"
          name="customerName"
          rules={[{ required: true, message: '请输入姓名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="年龄"
          name="customerAge"
          rules={[{ required: true, message: '请输入年龄!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
            添加
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddCustomerForm;
