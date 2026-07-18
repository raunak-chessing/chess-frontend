import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Axial coordinates to Cartesian coordinates
const hexToPixel = (q: number, r: number, size: number) => {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
};

const HexGrid = ({ hexes, onHexClick }: { hexes: any[], onHexClick: (hex: any) => void }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const hexSize = 1;
  const tempObject = new THREE.Object3D();
  const tempColor = new THREE.Color();

  useMemo(() => {
    if (!meshRef.current) return;
    hexes.forEach((hex, i) => {
      const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
      tempObject.position.set(x, 0, y); // Y is up, so we lay it flat on X-Z plane
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Set color based on terrain
      if (hex.terrain === 'PLAINS') tempColor.set('#4ade80');
      else if (hex.terrain === 'FOREST') tempColor.set('#166534');
      else if (hex.terrain === 'MOUNTAIN') tempColor.set('#737373');
      else if (hex.terrain === 'SWAMP') tempColor.set('#3f6212');
      else if (hex.terrain === 'VOLCANO') tempColor.set('#b91c1c');
      else tempColor.set('#ffffff');

      // Faction overlay color mapping
      if (hex.controllingFaction) {
        if (hex.controllingFaction.name === 'Iron Syndicate') tempColor.lerp(new THREE.Color('#ef4444'), 0.3);
        if (hex.controllingFaction.name === 'Celestial Order') tempColor.lerp(new THREE.Color('#3b82f6'), 0.3);
        if (hex.controllingFaction.name === 'Voidborn') tempColor.lerp(new THREE.Color('#a855f7'), 0.3);
      }

      if (hex.terrain === 'UNKNOWN') {
        tempColor.set('#000000'); // Fog of War
      }

      // Hover effect
      if (hovered === i && hex.terrain !== 'UNKNOWN') {
        tempColor.lerp(new THREE.Color('#ffffff'), 0.5);
      }

      meshRef.current!.setColorAt(i, tempColor);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [hexes, hovered]);

  useFrame(() => {
    // Optional: Add subtle floating animation or glow
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, hexes.length]}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined && hexes[e.instanceId].terrain !== 'UNKNOWN') {
          setHovered(e.instanceId);
        }
      }}
      onPointerOut={() => setHovered(null)}
      onClick={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined && hexes[e.instanceId].terrain !== 'UNKNOWN') {
          onHexClick(hexes[e.instanceId]);
        }
      }}
    >
      <cylinderGeometry args={[hexSize * 0.95, hexSize * 0.95, 0.2, 6]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
};

export const WorldMap = ({ hexes, onInitiateAttack }: { hexes: any[], onInitiateAttack?: (hexId: string) => void }) => {
  const [selectedHex, setSelectedHex] = useState<any>(null);

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <Canvas camera={{ position: [0, 15, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <HexGrid hexes={hexes} onHexClick={setSelectedHex} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>

      {/* Hex Info Panel */}
      {selectedHex && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-6 rounded-xl border border-white/20 text-white w-80 shadow-2xl transform transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2 tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {selectedHex.terrain}
          </h2>
          <p className="text-sm text-gray-400 mb-4 font-mono">
            Coords: Q:{selectedHex.q}, R:{selectedHex.r}
          </p>
          
          <div className="mb-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Controlled By</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${selectedHex.controllingFaction ? (
                selectedHex.controllingFaction.name === 'Iron Syndicate' ? 'bg-red-500' :
                selectedHex.controllingFaction.name === 'Celestial Order' ? 'bg-blue-500' :
                'bg-purple-500'
              ) : 'bg-gray-500'}`} />
              <span className="font-semibold text-lg">
                {selectedHex.controllingFaction ? selectedHex.controllingFaction.name : 'Unclaimed'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => onInitiateAttack?.(selectedHex.id)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold tracking-widest uppercase transition-colors">
            Initiate Attack
          </button>
        </div>
      )}
    </div>
  );
};
