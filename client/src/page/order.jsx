import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Row, Col, Typography } from 'antd';
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { Suspense } from "react";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import "../../styles.css";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Scene = () => {
  const materials = useLoader(MTLLoader, "/src/teszt3.mtl");
  const obj = useLoader(OBJLoader, "/src/teszt3.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return (
    <group>
      <primitive object={obj} scale={0.8} />
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.6}
        scale={10}
        blur={2}
        far={4}
      />
    </group>
  );
};

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

  const { item_name, unit_price, quantity } = product;
  
  return (
    <Layout>
      <Content style={{ padding: '50px 0', background: '#fff' }}>
        <Row justify="center" gutter={[48, 48]}>
          <Col span={12}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <img 
                alt="cover product" 
                src={boritokep} 
                style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }}
              />
              <Title level={2}>{item_name}</Title>
              <Paragraph style={{ fontSize: '22px' }}><strong>Price:</strong> ${unit_price}</Paragraph>
              <Paragraph style={{ fontSize: '18px' }}><strong>Quantity:</strong> {quantity}</Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                <img 
                  alt="additional image 1" 
                  src={images2} 
                  style={{ width: '45%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                />
                <img 
                  alt="additional image 2" 
                  src={images3} 
                  style={{ width: '45%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                />
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="canvas-container" style={{ width: '100%', height: '70vh', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Canvas shadows camera={{ position: [0, 0, 15], fov: 40 }}>
                <ambientLight intensity={0.5} />
                <spotLight
                  position={[10, 10, 10]}
                  angle={0.15}
                  penumbra={1}
                  shadow-mapSize={2048}
                  intensity={1.5}
                />
                <directionalLight
                  position={[-5, 5, -5]}
                  intensity={1.5}
                />

                <Suspense fallback={null}>
                  <Scene />
                </Suspense>

                <OrbitControls />
                <Environment preset="sunset" background={false} />
              </Canvas>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ProductOrder;
