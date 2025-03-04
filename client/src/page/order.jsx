import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Row, Col, Typography } from 'antd';
import '../../styles.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const ProductOrder = () => {
  const { id } = useParams();  
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/inventory/${id}`)  
      .then((response) => response.json())
      .then((data) => setProduct(data))
      .catch((error) => console.error('Error fetching product:', error));
  }, [id]);

  if (!product) {
    return <p>Loading product...</p>;
  }

  const { item_name, unit_price, quantity, cover_img, images } = product;
  
  return (
    <Layout>
      <Content style={{ padding: '50px 0', background: '#fff' }}>
        <Row justify="center" gutter={[48, 48]}>
          <Col span={12}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <img 
                alt="cover product" 
                src={cover_img || 'https://via.placeholder.com/300'} 
                style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }}
              />
              <Title level={2}>{item_name}</Title>
              <Paragraph style={{ fontSize: '22px' }}><strong>Price:</strong> ${unit_price}</Paragraph>
              <Paragraph style={{ fontSize: '18px' }}><strong>Quantity:</strong> {quantity}</Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                {images && images.length >= 2 ? (
                  <>
                    <img 
                      alt="additional image 1" 
                      src={images[0]} 
                      style={{ width: '45%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                    />
                    <img 
                      alt="additional image 2" 
                      src={images[1]} 
                      style={{ width: '45%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                    />
                  </>
                ) : (
                  <p>No additional images available.</p>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ProductOrder;
