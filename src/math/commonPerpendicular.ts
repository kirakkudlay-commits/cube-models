import { Vector3 } from 'three'

export interface CommonPerpResult {
  foot1: Vector3   // point on line AB
  foot2: Vector3   // point on line CD
  length: number
  parallel: boolean
}

/**
 * Compute the common perpendicular between two lines:
 *   L1 = A + t * (B - A)
 *   L2 = C + s * (D - C)
 *
 * Returns the closest points on each line and the perpendicular length.
 * If the lines are (nearly) parallel, returns parallel=true and a fallback
 * pair of feet with foot1 = A and foot2 = projection of A onto L2.
 */
export function commonPerpendicular(
  A: Vector3, B: Vector3, C: Vector3, D: Vector3,
): CommonPerpResult {
  const u = new Vector3().subVectors(B, A)
  const v = new Vector3().subVectors(D, C)
  const w = new Vector3().subVectors(A, C)

  const a = u.dot(u)
  const b = u.dot(v)
  const c = v.dot(v)
  const d = u.dot(w)
  const e = v.dot(v) === 0 ? 0 : v.dot(w)

  const denom = a * c - b * b

  if (Math.abs(denom) < 1e-9) {
    // parallel — pick foot1 = A, foot2 = projection of A onto L2
    const sParallel = e / c
    const foot1 = A.clone()
    const foot2 = C.clone().add(v.clone().multiplyScalar(sParallel))
    return { foot1, foot2, length: foot1.distanceTo(foot2), parallel: true }
  }

  const t = (b * e - c * d) / denom
  const s = (a * e - b * d) / denom

  const foot1 = A.clone().add(u.clone().multiplyScalar(t))
  const foot2 = C.clone().add(v.clone().multiplyScalar(s))
  return { foot1, foot2, length: foot1.distanceTo(foot2), parallel: false }
}
