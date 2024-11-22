import React, { useState } from 'react';
import {
  ShoppingOutlined,
  ProductOutlined,
  SettingOutlined,
  FormOutlined,
  DeleteOutlined,
  AlertOutlined,
  TeamOutlined,
  DollarOutlined,
  LikeOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

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
  getItem('产品展示', '1', <ShoppingOutlined />),
  getItem('发布产品', '2', <ProductOutlined />),
  getItem('产品管理', 'sub1', <SettingOutlined />, [
    getItem('产品修改', '3', <FormOutlined />),
    // getItem('产品下架', '4', <DeleteOutlined />),
    getItem('产品受理', '5', <AlertOutlined />),
  ]),
  getItem('店家详情', 'sub2', <TeamOutlined />, [
    getItem('资金', '6', <DollarOutlined />),
    getItem('信用', '7', <LikeOutlined />),
  ]),
  getItem('店家评价', '8', <FileOutlined />),
];

const breadcrumbItems = [
  {
    title: 'User',
  },
  {
    title: 'Bill',
  },
];

const Company = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyAddr = searchParams.get('CompanyAddress');

  const handleMenuClick = (key) => {
    console.log(key);
    switch (key) {
      case '1':
        console.log("已进入key1");
        navigate('showProduct');
        break;
      case '2':
        console.log("已进入key2");
        navigate('productForm');
        break;
      case '3':
        console.log("已进入key3");
        navigate('modify');
        break;
      // case '4':
      //   console.log("已进入key4");
      // navigate('logoff');
      //   break;
      // case '5':
      //   console.log("已进入key5");
      //   navigate('accept');
      //   break;
      case '6':
        console.log("已进入key6");
        navigate('comblance');
        break;
      case '7':
        console.log("已进入key7");
        navigate('creditCompany');
        break;
      // case '8':
      //   console.log("已进入key8");
      //   navigate('appraise');
      //   break;
      default:
        break;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={(e) => handleMenuClick(e.key)} />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Breadcrumb items={breadcrumbItems} />
        </Header>
        <Content style={{ margin: '16px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
            <Outlet context={{ companyAddr }} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>区块链电子商城 ©2023 Created by Feng</Footer>
      </Layout>
    </Layout>
  );
};

export default Company;
