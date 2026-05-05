import { useMemo, useState } from 'react'
import CubeScene from './CubeScene'
import { PRESETS, VERTEX_KEYS, VERTICES, type VertexKey } from './cubeData'
import { commonPerpendicular } from './math/commonPerpendicular'
import './App.css'

export default function App() {
  const [presetIdx, setPresetIdx] = useState(0)
  const [overrides, setOverrides] = useState<Partial<Record<'A' | 'B' | 'C' | 'D', VertexKey>>>({})
  const [showPerp, setShowPerp] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  const preset = PRESETS[presetIdx]
  const A = overrides.A ?? preset.A
  const B = overrides.B ?? preset.B
  const C = overrides.C ?? preset.C
  const D = overrides.D ?? preset.D

  const stats = useMemo(() => {
    const r = commonPerpendicular(VERTICES[A], VERTICES[B], VERTICES[C], VERTICES[D])
    return { ...r, length: r.length }
  }, [A, B, C, D])

  function setVertex(role: 'A' | 'B' | 'C' | 'D', key: VertexKey) {
    setOverrides((o) => ({ ...o, [role]: key }))
  }

  function resetOverrides() {
    setOverrides({})
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Common perpendiculars on a cube</h1>
        <p className="subtitle">
          Interactive 3D model. Drag to rotate, scroll to zoom. The orange line is&nbsp;<b>AB</b>,
          the blue line is&nbsp;<b>CD</b>, the green segment is the <b>common perpendicular</b>&nbsp;PQ.
        </p>
      </header>

      <div className="layout">
        <div className="canvas-wrap">
          <CubeScene A={A} B={B} C={C} D={D} showPerpendicular={showPerp} showLabels={showLabels} />
        </div>

        <aside className="panel">
          <section>
            <h2>Case</h2>
            <div className="preset-grid">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  className={`preset ${i === presetIdx ? 'active' : ''}`}
                  onClick={() => {
                    setPresetIdx(i)
                    resetOverrides()
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="case-desc">{preset.description}</p>
          </section>

          <section>
            <h2>Vertices</h2>
            <p className="hint">
              Pick which cube vertex each label points to. Orange = front face, full
              opacity; the back-face edges are dashed.
            </p>
            {(['A', 'B', 'C', 'D'] as const).map((role) => (
              <div key={role} className="role-row">
                <span className="role">{role}</span>
                <select
                  value={role === 'A' ? A : role === 'B' ? B : role === 'C' ? C : D}
                  onChange={(e) => setVertex(role, e.target.value as VertexKey)}
                >
                  {VERTEX_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k} ({VERTICES[k].toArray().join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {Object.keys(overrides).length > 0 && (
              <button className="reset" onClick={resetOverrides}>
                Reset to preset
              </button>
            )}
          </section>

          <section>
            <h2>Display</h2>
            <label className="toggle">
              <input
                type="checkbox"
                checked={showPerp}
                onChange={(e) => setShowPerp(e.target.checked)}
              />
              Show common perpendicular PQ
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Show vertex labels
            </label>
          </section>

          <section>
            <h2>Result</h2>
            <table className="result">
              <tbody>
                <tr>
                  <th>AB</th>
                  <td>{A} → {B}</td>
                </tr>
                <tr>
                  <th>CD</th>
                  <td>{C} → {D}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    {stats.parallel ? 'Parallel' : stats.length < 1e-6 ? 'Intersecting' : 'Skew'}
                  </td>
                </tr>
                <tr>
                  <th>|PQ|</th>
                  <td>{stats.length.toFixed(4)} <span className="unit">cube edges</span></td>
                </tr>
                <tr>
                  <th>P (on AB)</th>
                  <td>({stats.foot1.x.toFixed(2)}, {stats.foot1.y.toFixed(2)}, {stats.foot1.z.toFixed(2)})</td>
                </tr>
                <tr>
                  <th>Q (on CD)</th>
                  <td>({stats.foot2.x.toFixed(2)}, {stats.foot2.y.toFixed(2)}, {stats.foot2.z.toFixed(2)})</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="legend">
            <div><span className="dot orange" /> AB</div>
            <div><span className="dot blue" /> CD</div>
            <div><span className="dot green" /> common perpendicular PQ</div>
          </section>
        </aside>
      </div>
    </div>
  )
}
