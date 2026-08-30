"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";

function Model() {
  // Preloads and loads the GLB model from public/trophy.glb
  const { scene } = useGLTF("/trophy.glb");
  return <primitive object={scene} />;
}

// Pre-preload the asset for faster loading
useGLTF.preload("/trophy.glb");

export function InteractiveTrophy() {
  return (
    <div className="w-full h-[380px] sm:h-[460px] md:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing relative">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1.5, 4.5], fov: 45 }}>
        {/* Soft Ambient Light */}
        <ambientLight intensity={0.8} />
        
        {/* Key Light to show off metallic highlights */}
        <directionalLight position={[5, 8, 5]} intensity={2.0} />
        
        {/* Fill Light for dark sides */}
        <directionalLight position={[-5, 5, -5]} intensity={0.8} />
        
        {/* Rim Light for backing contours */}
        <pointLight position={[0, -5, 5]} intensity={0.5} />

        <Suspense fallback={null}>
          <Center>
            <Model />
          </Center>
        </Suspense>

        {/* Dynamic Rotation & Orbital Controls */}
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
