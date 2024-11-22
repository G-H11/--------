import React, { useState } from 'react';
import Web3 from 'web3';
import { Form, Input, Button, Row, Col, Card, Typography, Modal } from 'antd'; // 引入 antd 组件
import ABI from './compiled/Company.json';

const { Title, Text } = Typography; // 从 antd 引入 Typography 组件

const Push = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSubmit = async () => {
    if (!window.ethereum) {
      setStatus("MetaMask 未安装！");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        setStatus("未授权。请在 MetaMask 中授权交易。");
        return;
      }

      const userAddress = accounts[0];
      const contractAddress = '0xe472493afF83d17235763e4C7447dB6a30E5D08f'; // 替换为你的合约地址
      const contract = new web3.eth.Contract(ABI, contractAddress);

      const gasEstimate = await contract.methods.addProduct(name, description, price, quantity, image, category).estimateGas({ from: userAddress });
      const gasPrice = await web3.eth.getGasPrice();

      const result = await contract.methods.addProduct(name, description, price, quantity, image, category)
        .send({ from: userAddress, gas: gasEstimate, gasPrice: gasPrice });

      // 获取交易哈希
      const transactionHash = result.transactionHash;
      console.log('Transaction Hash:', transactionHash);
      setStatus("商品发布成功！");
      setIsModalVisible(true); // 显示成功弹窗
    } catch (error) {
      console.error("商品发布失败", error);
      setStatus("商品发布失败。请查看控制台错误信息。");
      setIsModalVisible(true); // 显示失败弹窗
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
    window.location.reload(); // 刷新页面
  };

  return (
    <Row
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'skyblue', // 设置背景颜色为天蓝色
        padding: '20px',
        margin: '0', // 确保行元素铺满整个页面
        width: '100%',
      }}
    >
      <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}> 
        <Card
          bordered={false}
          style={{
            maxWidth: 600,
            width: '100%',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: 12,
            background: 'white' // 设置卡片背景颜色为白色
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: '1em' }}>
            发布商品
          </Title>
          <Form
            name="product"
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="商品名称"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入商品名称"
              />
            </Form.Item>

            <Form.Item
              label="商品描述"
              rules={[{ required: true, message: '请输入商品描述' }]}
            >
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入商品描述"
              />
            </Form.Item>

            <Form.Item
              label="商品价格 (Wei)"
              rules={[{ required: true, message: '请输入商品价格' }]}
            >
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="请输入商品价格 (Wei)"
              />
            </Form.Item>

            <Form.Item
              label="商品数量"
              rules={[{ required: true, message: '请输入商品数量' }]}
            >
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="请输入商品数量"
              />
            </Form.Item>

            <Form.Item
              label="图片链接"
              rules={[{ required: true, message: '请输入商品图片链接' }]}
            >
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="请输入商品图片链接"
              />
            </Form.Item>

            <Form.Item
              label="商品类别"
              rules={[{ required: true, message: '请输入商品类别' }]}
            >
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="请输入商品类别"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: '40px' }}>
                发布商品
              </Button>
            </Form.Item>

            {status && <Text type="danger" style={{ display: 'block', textAlign: 'center' }}>{status}</Text>}
          </Form>
        </Card>
      </Col>
      <Modal
        title="发布结果"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleOk}
        footer={[
          <Button key="ok" type="primary" onClick={handleOk}>
            确定
          </Button>,
        ]}
      >
        <p>{status}</p>
      </Modal>
    </Row>
  );
};

export default Push;
