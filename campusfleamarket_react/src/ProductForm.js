import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, InputNumber, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Web3 from 'web3';
import CompanyABI from './compiled/Company.json';
import CompanyListABI from './compiled/CompanyList.json'; // Import CompanyList ABI
import address from './address.json';
import { useOutletContext } from 'react-router-dom';

const { TextArea } = Input;
const { Title } = Typography;

const ProductForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [fileUrl, updateFileUrl] = useState('');
  const [web3, setWeb3] = useState(null);
  const [companyContract, setCompanyContract] = useState(null);
  const [companyListContract, setCompanyListContract] = useState(null); // CompanyList contract instance
  const [account, setAccount] = useState(null);
  const [companyAddress, setCompanyAddress] = useState(null); // State to hold company address

  const { companyAddr } = useOutletContext(); // Assuming this gives us the initial company address

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

          // Call function to fetch company address from CompanyList contract
          const fetchedCompanyAddr = await companyListContractInstance.methods.creatorCompanyMap(accounts[0]).call();
          setCompanyAddress(fetchedCompanyAddr);

          const companyContractInstance = new web3Instance.eth.Contract(CompanyABI.abi, fetchedCompanyAddr);
          setCompanyContract(companyContractInstance);

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
  }, [companyAddr]);

  const onFinish = async (values) => {
    setLoading(true);
    const { productName, productDesc, quantity, price } = values;
    try {
      // Upload image to Pinata
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const pinataApiKey = '9d7536bd2247a53479a1';
        const pinataSecretApiKey = 'd4cbe7b0dd0895bb47135190fc5938e5b9128ab4cc9c65b1a96e41e5f16a4f94';

        try {
          const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
              'pinata_api_key': pinataApiKey,
              'pinata_secret_api_key': pinataSecretApiKey
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          const cid = data.IpfsHash;
          const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
          updateFileUrl(url);
          console.log("url",url);
          message.success('文件上传成功');
          // Add product with IPFS URL to the blockchain
          console.log("fileUrl",url);
          await companyContract.methods.addCommodity(productName, productDesc, quantity, price, url)
            .send({ from: account, gas: '5000000' });
          message.success('产品发布成功！');
          form.resetFields();
          setImageFile(null);
        } catch (error) {
          console.error('Error uploading file to Pinata:', error);
          message.error('文件上传失败');
        }
      } else {
        message.error('请上传产品图片！');
      }
    } catch (err) {
      console.error(err.message);
      message.error('产品发布失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  if (!companyAddress) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>发布产品</Title>
      <Form
        form={form}
        name="productForm"
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="产品名称"
          name="productName"
          rules={[{ required: true, message: '请输入产品名称!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="产品描述"
          name="productDesc"
          rules={[{ required: true, message: '请输入产品描述!' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="产品价格 (ETH)"
          name="price"
          rules={[{ required: true, message: '请输入产品价格!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="产品数量"
          name="quantity"
          rules={[{ required: true, message: '请输入产品数量!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="image"
          label="产品图片"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: '请上传产品图片!' }]}
        >
          <Upload
            beforeUpload={beforeUpload}
            onChange={(info) => {
              setImageFile(info.file.originFileObj);
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
            发布
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductForm;
