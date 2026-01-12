import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

// Floating Card Component
const FloatingCard = ({ position, color, scale = 1 }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 0.6, 0.05]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
};

// Animated Sphere
const AnimatedSphere = ({ position, color }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        metalness={0.9}
        roughness={0.1}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

// Particle Ring
const ParticleRing = () => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 3;
      pts.push(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
    }
    return new Float32Array(pts);
  }, []);

  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#10b981" transparent opacity={0.8} />
    </points>
  );
};

// Main 3D Scene Component
const Scene3D = ({ type = 'hero' }) => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none',
      zIndex: 0
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />
        
        {/* Stars Background */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* Sparkles */}
        <Sparkles count={100} scale={10} size={2} speed={0.4} color="#10b981" />
        
        {/* Floating Cards */}
        <FloatingCard position={[-2, 1, -2]} color="#10b981" />
        <FloatingCard position={[2, -1, -2]} color="#fbbf24" />
        <FloatingCard position={[0, 0.5, -3]} color="#8b5cf6" scale={1.2} />
        
        {/* Animated Spheres */}
        <AnimatedSphere position={[-3, 0, -1]} color="#10b981" />
        <AnimatedSphere position={[3, 0, -1]} color="#fbbf24" />
        
        {/* Particle Ring */}
        <ParticleRing />
      </Canvas>
    </div>
  );
};

// Mini 3D Scene for Cards
export const MiniScene3D = ({ color = '#10b981' }) => {
  return (
    <div style={{ width: '100%', height: '150px' }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color={color} />
        <Float speed={3} rotationIntensity={1} floatIntensity={2}>
          <mesh>
            <icosahedronGeometry args={[0.7, 1]} />
            <meshStandardMaterial 
              color={color}
              metalness={0.8}
              roughness={0.2}
              wireframe
            />
          </mesh>
        </Float>
        <Sparkles count={30} scale={3} size={1} speed={0.3} color={color} />
      </Canvas>
    </div>
  );
};

// Animated Button 3D Effect
export const Button3DEffect = ({ children, onClick, className }) => {
  return (
    <button 
      onClick={onClick}
      className={`btn-3d ${className}`}
      style={{
        position: 'relative',
        transform: 'perspective(500px) rotateX(0deg)',
        transition: 'all 0.3s ease',
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'perspective(500px) rotateX(-5deg) translateY(-5px)';
        e.target.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'perspective(500px) rotateX(0deg) translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
};

export default Scene3D;
