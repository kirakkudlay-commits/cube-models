import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Text } from '@react-three/drei'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { EDGES, VERTICES, VERTEX_KEYS, type VertexKey } from './cubeData'
import { commonPerpendicular } from './math/commonPerpendicular'

interface Props {
  A: VertexKey
  B: VertexKey
  C: VertexKey
  D: VertexKey
  showPerpendicular: boolean
  showLabels: boolean
}

const CENTER = new Vector3(0.5, 0.5, 0.5)

function CameraPullback() {
  const { camera } = useThree()
  // Pull camera back a touch on first mount.
  camera.position.set(2.6, 2.0, 2.8)
  camera.lookAt(0.5, 0.5, 0.5)
  return null
}

export default function CubeScene({ A, B, C, D, showPerpendicular, showLabels }: Props) {
  const Apos = VERTICES[A]
  const Bpos = VERTICES[B]
  const Cpos = VERTICES[C]
  const Dpos = VERTICES[D]

  const perp = useMemo(() => commonPerpendicular(Apos, Bpos, Cpos, Dpos), [Apos, Bpos, Cpos, Dpos])

  // Highlighted vertex keys (the four picked points)
  const usedKeys = new Set<VertexKey>([A, B, C, D])

  return (
    <Canvas shadows camera={{ position: [2.6, 2.0, 2.8], fov: 40 }}>
      <CameraPullback />
      <color attach="background" args={['#f5f3ee']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {/* Cube edges (wireframe) */}
      {EDGES.map(([k1, k2], i) => {
        const v1 = VERTICES[k1]
        const v2 = VERTICES[k2]
        // Dashed for back-face hidden edges (purely visual hint)
        const isBack = k1.startsWith('B') && k2.startsWith('B')
        return (
          <Line
            key={i}
            points={[v1.toArray(), v2.toArray()]}
            color={isBack ? '#a4a09a' : '#2a2620'}
            lineWidth={isBack ? 1 : 1.6}
            dashed={isBack}
            dashSize={0.05}
            gapSize={0.05}
          />
        )
      })}

      {/* Vertex spheres + labels */}
      {VERTEX_KEYS.map((k) => {
        const v = VERTICES[k]
        const isUsed = usedKeys.has(k)
        const labelLetter =
          k === A ? 'A' : k === B ? 'B' : k === C ? 'C' : k === D ? 'D' : ''
        return (
          <group key={k} position={v.toArray()}>
            <mesh>
              <sphereGeometry args={[isUsed ? 0.04 : 0.018, 16, 16]} />
              <meshStandardMaterial color={isUsed ? '#ff5b1f' : '#444'} />
            </mesh>
            {showLabels && (
              <Text
                position={[
                  (v.x - CENTER.x) * 0.3,
                  (v.y - CENTER.y) * 0.3 + 0.12,
                  (v.z - CENTER.z) * 0.3,
                ]}
                fontSize={isUsed ? 0.13 : 0.07}
                color={isUsed ? '#ff5b1f' : '#888'}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#fff"
              >
                {labelLetter || k}
              </Text>
            )}
          </group>
        )
      })}

      {/* Line AB — orange */}
      <Line
        points={[Apos.toArray(), Bpos.toArray()]}
        color="#ff5b1f"
        lineWidth={3.5}
      />

      {/* Line CD — blue */}
      <Line
        points={[Cpos.toArray(), Dpos.toArray()]}
        color="#1f7bff"
        lineWidth={3.5}
      />

      {/* Common perpendicular */}
      {showPerpendicular && (
        <>
          <Line
            points={[perp.foot1.toArray(), perp.foot2.toArray()]}
            color="#16a34a"
            lineWidth={4}
          />
          {/* Foot markers */}
          <mesh position={perp.foot1.toArray()}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          <mesh position={perp.foot2.toArray()}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          {showLabels && (
            <>
              <Text
                position={[perp.foot1.x, perp.foot1.y + 0.1, perp.foot1.z]}
                fontSize={0.09}
                color="#0f7c34"
                outlineWidth={0.005}
                outlineColor="#fff"
              >
                P
              </Text>
              <Text
                position={[perp.foot2.x, perp.foot2.y + 0.1, perp.foot2.z]}
                fontSize={0.09}
                color="#0f7c34"
                outlineWidth={0.005}
                outlineColor="#fff"
              >
                Q
              </Text>
            </>
          )}
        </>
      )}

      {/* Floor grid for spatial reference */}
      <gridHelper
        args={[4, 16, '#cfcab8', '#e6e1d4']}
        position={[0.5, -0.001, 0.5]}
      />

      <OrbitControls
        target={[0.5, 0.5, 0.5]}
        enablePan={false}
        minDistance={1.8}
        maxDistance={6}
      />
    </Canvas>
  )
}
