"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Model() {
  const { scene } = useGLTF("/trophy.glb");
  const ref = useRef<THREE.Group>(null);

  // Apply a premium metallic material to all meshes if textures were stripped
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Only override if material looks flat/grey (no map)
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && !mat.map) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#c0a060"),
            metalness: 0.9,
            roughness: 0.15,
            envMapIntensity: 1.5,
          });
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/trophy.glb");

export function InteractiveTrophy() {
  return (
    <div className="w-full h-[380px] sm:h-[460px] md:h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 2, 6], fov: 40 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
      >
        {/* HDRI Environment — gives realistic reflections */}
        <Environment preset="studio" />

        {/* Key light */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={3}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Fill light */}
        <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#a0c8ff" />
        {/* Rim light for gold pop */}
        <pointLight position={[0, 8, -6]} intensity={2} color="#ffd080" />
        <ambientLight intensity={0.4} />

        <Suspense fallback={null}>
          <Center>
            <Model />
          </Center>
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.4}
            scale={8}
            blur={2}
            far={4}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
