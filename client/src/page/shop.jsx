import { Layout, Menu, Row, Col } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import "../../styles.css";

const { Header, Content } = Layout;

const Shop = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();  

  const menuItems = [
    { label: 'Home', key: '1' },
    { label: 'Products', key: '2' },
    { label: 'Categories', key: '3' },
    { label: 'Cart', key: '4', icon: <ShoppingCartOutlined /> },
    { label: 'Account', key: '5', icon: <UserOutlined /> },
  ];

  useEffect(() => {
    fetch('http://localhost:3000/api/products') 
      .then((response) => response.json())     
      .then((data) => setProducts(data))      
      .catch((error) => console.error('Error fetching products:', error));
  }, []); 

  const handleProductClick = (itazonoso) => {
    navigate(`/order/${azonosito}`);
  };

  return (
    <Layout>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', height: '60px', padding: '0 20px', background: '#fff' }}>
        <Menu
          mode="horizontal"
          style={{ float: 'right', lineHeight: '60px' }}
          defaultSelectedKeys={['1']}
          items={menuItems}
        />
      </Header>

      <Content style={{ padding: '50px 0', background: '#F0EEE5', marginTop: '60px' }}>
        <Row gutter={[4, 4]} justify="space-between">
          {products.length > 0 ? (
            products.map((product) => (
              <Col span={6} key={product.azonosito}>
                <div 
                  style={{
                    borderRadius: '0px', 
                    overflow: 'hidden', 
                    width: '100%',  
                    backgroundColor: '#F8F8F8' 
                  }}
                  onClick={() => handleProductClick(product.azonosito)} 
                >
                  <img alt="product" src={product.boritokep} style={{ width: '100%' }} />
                  <div style={{ padding: '16px' }}>
                    <h4><b>{product.nev}</b></h4>
                    <p style={{ color: '#888' }}>${product.ar}</p>
                  </div>
                </div>
              </Col>
            ))
          ) : (
            <p>Loading products...</p>  
          )}
        </Row>
      </Content>
    </Layout>
  );
};

export default Shop;
