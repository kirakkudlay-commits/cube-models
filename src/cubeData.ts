import { Vector3 } from 'three'

/** 8 cube vertices labeled by initials: F/B = front/back, T/B = top/bottom, L/R = left/right.
 *  Front face is at z = 1, back at z = 0.
 *  Top at y = 1, bottom at y = 0.
 *  Left at x = 0, right at x = 1. */
export const VERTICES = {
  FBL: new Vector3(0, 0, 1),
  FBR: new Vector3(1, 0, 1),
  FTL: new Vector3(0, 1, 1),
  FTR: new Vector3(1, 1, 1),
  BBL: new Vector3(0, 0, 0),
  BBR: new Vector3(1, 0, 0),
  BTL: new Vector3(0, 1, 0),
  BTR: new Vector3(1, 1, 0),
} as const

export type VertexKey = keyof typeof VERTICES
export const VERTEX_KEYS: VertexKey[] = ['FBL', 'FBR', 'FTL', 'FTR', 'BBL', 'BBR', 'BTL', 'BTR']

/** Cube edges as pairs of vertex keys. */
export const EDGES: [VertexKey, VertexKey][] = [
  // bottom face
  ['FBL', 'FBR'], ['FBR', 'BBR'], ['BBR', 'BBL'], ['BBL', 'FBL'],
  // top face
  ['FTL', 'FTR'], ['FTR', 'BTR'], ['BTR', 'BTL'], ['BTL', 'FTL'],
  // verticals
  ['FBL', 'FTL'], ['FBR', 'FTR'], ['BBR', 'BTR'], ['BBL', 'BTL'],
]

/** A case = a labeling: "A" → vertex key, "B" → vertex key, etc.
 *  My best guess for the four textbook cases в, г, ж, є. The user can swap these
 *  in the UI if any interpretation is wrong. */
export interface CaseAssignment {
  label: string
  description: string
  A: VertexKey
  B: VertexKey
  C: VertexKey
  D: VertexKey
}

export const PRESETS: CaseAssignment[] = [
  {
    label: 'в',
    description: 'AB — face diagonal of front face; CD — back-left vertical edge',
    A: 'FTL',
    B: 'FBR',
    C: 'BTL',
    D: 'BBL',
  },
  {
    label: 'г',
    description: 'AB — face diagonal of right face; CD — left top edge',
    A: 'FBR',
    B: 'BTR',
    C: 'FTL',
    D: 'BTL',
  },
  {
    label: 'ж',
    description: 'AB — front-right vertical edge; CD — left face diagonal',
    A: 'FBR',
    B: 'FTR',
    C: 'BTL',
    D: 'FBL',
  },
  {
    label: 'є',
    description: 'AB — space diagonal; CD — face diagonal of bottom face',
    A: 'FBL',
    B: 'BTR',
    C: 'BTL',
    D: 'FBR',
  },
]
