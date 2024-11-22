import React, { useState } from 'react';
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  FormOutlined,
  DeleteOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  DollarOutlined,
  LikeOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme  } from 'antd';
import { Outlet, useNavigate} from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem('商品栏', '1', <ShoppingOutlined />),
  getItem('购物车', 'sub1', <ShoppingCartOutlined />, [
    getItem('更换商品', '2',<FormOutlined />),
    getItem('删除商品', '3',<DeleteOutlined />),
  ]),
  getItem('个人详情', 'sub2', <UserOutlined />, [getItem('创建用户', '4',<UsergroupAddOutlined />),
    getItem('资金', '5',<DollarOutlined />), getItem('信用', '6',<LikeOutlined />)]),
  getItem('个人评价', '7', <FileOutlined />),
];
const CustomersOwner = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const handleMenuClick = (key) => {
    console.log(key);
    switch (key) {
      case '1':
        console.log("已进入key1");
        navigate('buyProduct');
        break;
      // case '2':
      //   console.log("已进入key2");
      //   navigate('replace');
      //   break;
      // case '3':
      //   console.log("已进入key3");
      //   navigate('delete');
      //   break;
      case '4':
        console.log("已进入key4");
        navigate('adduser');
        break;
      case '5':
        console.log("已进入key5");
        navigate('cusblance');
        break;
      case '6':
        console.log("已进入key6");
        navigate('creditCustomer');
        break;
      // case '7':
      //   console.log("已进入key7");
      //   navigate('appraise2');
      //   break;
      default:
        break;
    }
  }
  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={(e)=>handleMenuClick(e.key)}/>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // 居中对齐
          }}
        >
          <div style={{ textAlign: 'center', width: '100%' }}>
            欢迎来到校园二手市场解忧杂货铺
          </div>
        </Header>
        <Content
          style={{
            margin: '0 16px',
          }}
        >
          <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet/>
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};
export default CustomersOwner;