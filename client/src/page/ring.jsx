import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { Suspense, useEffect } from "react";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";


const Scene = () => {
  const materials = useLoader(MTLLoader, "/src/teszt3.mtl");
  const obj = useLoader(OBJLoader, "/src/teszt3.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return (
    <group>
      <primitive object={obj} scale={0.4} />
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

export default function RingPage() {
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (canvas && canvas?.getContext) {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT); 
      }
    }
  }, []);

  return (
    <>
      <style>{`
        .canvas-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          overflow: hidden;
        }
      `}</style>
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [0, 0, 10], fov: 25 }}>
          {/* Lights */}
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            shadow-mapSize={2048}
            castShadow
            intensity={1.5}
          />
          <directionalLight
            position={[-5, 5, -5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={1024}
          />

        
          <Suspense fallback={null}>
            <Scene />
          </Suspense>

      
          <OrbitControls />

         
          <Environment preset="sunset" background={false} />
        </Canvas>
      </div>
    </>
  );
}
