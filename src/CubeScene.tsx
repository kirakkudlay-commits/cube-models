import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Text } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { Vector3, type Mesh } from 'three'
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

/** Build a right-angle (square) marker at `at`, in the plane spanned by `dir1` and `dir2`. */
function rightAngleSquare(at: Vector3, dir1: Vector3, dir2: Vector3, size: number) {
  const u = dir1.clone().normalize().multiplyScalar(size)
  const v = dir2.clone().normalize().multiplyScalar(size)
  const p0 = at.clone()
  const p1 = at.clone().add(u)
  const p2 = at.clone().add(u).add(v)
  const p3 = at.clone().add(v)
  return [p0.toArray(), p1.toArray(), p2.toArray(), p3.toArray(), p0.toArray()] as [number, number, number][]
}

/** Pulsing green sphere */
function PulseSphere({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    const s = 1 + 0.18 * Math.sin(state.clock.elapsedTime * 2.4)
    if (ref.current) ref.current.scale.setScalar(s)
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.35} />
    </mesh>
  )
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
      {showPerpendicular && !perp.parallel && (
        <>
          {/* Main perpendicular segment (thick) */}
          <Line
            points={[perp.foot1.toArray(), perp.foot2.toArray()]}
            color="#16a34a"
            lineWidth={5}
          />

          {/* Right-angle square at P (in plane of AB direction and PQ direction) */}
          <Line
            points={rightAngleSquare(
              perp.foot1,
              new Vector3().subVectors(Bpos, Apos),
              new Vector3().subVectors(perp.foot2, perp.foot1),
              0.08,
            )}
            color="#16a34a"
            lineWidth={1.5}
          />

          {/* Right-angle square at Q (in plane of CD direction and QP direction) */}
          <Line
            points={rightAngleSquare(
              perp.foot2,
              new Vector3().subVectors(Dpos, Cpos),
              new Vector3().subVectors(perp.foot1, perp.foot2),
              0.08,
            )}
            color="#16a34a"
            lineWidth={1.5}
          />

          {/* Pulsing foot markers */}
          <PulseSphere position={perp.foot1.toArray() as [number, number, number]} />
          <PulseSphere position={perp.foot2.toArray() as [number, number, number]} />

          {showLabels && (
            <>
              <Text
                position={[perp.foot1.x, perp.foot1.y + 0.13, perp.foot1.z]}
                fontSize={0.11}
                color="#0f7c34"
                outlineWidth={0.005}
                outlineColor="#fff"
                fontWeight="bold"
              >
                P
              </Text>
              <Text
                position={[perp.foot2.x, perp.foot2.y + 0.13, perp.foot2.z]}
                fontSize={0.11}
                color="#0f7c34"
                outlineWidth={0.005}
                outlineColor="#fff"
                fontWeight="bold"
              >
                Q
              </Text>
              {/* Length label at midpoint */}
              <Text
                position={[
                  (perp.foot1.x + perp.foot2.x) / 2,
                  (perp.foot1.y + perp.foot2.y) / 2 + 0.08,
                  (perp.foot1.z + perp.foot2.z) / 2,
                ]}
                fontSize={0.08}
                color="#0f7c34"
                outlineWidth={0.005}
                outlineColor="#fff"
              >
                |PQ|={perp.length.toFixed(2)}
              </Text>
            </>
          )}
        </>
      )}

      {/* If lines are parallel, show a notice */}
      {showPerpendicular && perp.parallel && (
        <Text
          position={[0.5, 1.4, 0.5]}
          fontSize={0.1}
          color="#a33"
          outlineWidth={0.005}
          outlineColor="#fff"
        >
          Lines are parallel — perpendicular not unique
        </Text>
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
