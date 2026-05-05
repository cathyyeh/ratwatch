import { useState, useRef } from 'react'
import { INCIDENT_TYPES, LOCATION_TYPES, CAT_STATUS, DRUG_BY, DRUG_COLOR, DISTRICTS } from './data'
import { Pill } from './ui'
import s from './MapTab.module.css'

const MAP_W = 680, MAP_H = 320

function districtFromXY(x, y) {
  const col = Math.min(Math.floor(x / 170), 3)
  const row = Math.min(Math.floor(y / 80), 3)
  return DISTRICTS[row * 4 + col] || DISTRICTS[0]
}

export default function MapTab({ reports, cats, drugs, onLocationPick, pendingLoc }) {
  const [layers, setLayers] = useState({ rat: true, cat: true, drug: true })
  const [ratFilter, setRatFilter] = useState('all')
  const [tooltip, setTooltip] = useState(null)
  const wrapRef = useRef(null)

  function toggleLayer(name) {
    setLayers(prev => ({ ...prev, [name]: !prev[name] }))
  }

  function handleClick(e) {
    if (e.target.dataset.nodrag) return
    const rect = wrapRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width * MAP_W
    const y = (e.clientY - rect.top) / rect.height * MAP_H
    onLocationPick({ label: districtFromXY(x, y), x: Math.round(x), y: Math.round(y) })
  }

  const filteredReports = ratFilter === 'all' ? reports : reports.filter(r => r.type === ratFilter)

  function ttPos(x, y) {
    const left = x > 420 ? x / MAP_W * 100 - 26 : x / MAP_W * 100 + 2
    const top  = y > 210 ? y / MAP_H * 100 - 32 : y / MAP_H * 100 + 5
    return { left: `${left}%`, top: `${top}%` }
  }

  return (
    <div className="fade-in">
      {/* layer + filter pills */}
      <div className={s.controls}>
        <span className={s.ctrlLabel}>圖層：</span>
        <Pill active={layers.rat} onClick={() => toggleLayer('rat')}
          activeClass={s.pillRat}>🐀 鼠患</Pill>
        <Pill active={layers.cat} onClick={() => toggleLayer('cat')}
          activeClass={s.pillCat}>🐱 街貓</Pill>
        <Pill active={layers.drug} onClick={() => toggleLayer('drug')}
          activeClass={s.pillDrug}>☣️ 投藥</Pill>
        <span className={s.ctrlSep}></span>
        <span className={s.ctrlLabel}>篩選：</span>
        {['all','rat-live','rat-dead','poisoned','env-risk'].map(f => (
          <Pill key={f} active={ratFilter === f} onClick={() => setRatFilter(f)}>
            {f === 'all' ? '全部' : INCIDENT_TYPES[f]?.icon + ' ' + INCIDENT_TYPES[f]?.label}
          </Pill>
        ))}
      </div>

      {/* map */}
      <div ref={wrapRef} className={s.map} onClick={handleClick}>
        {/* SVG grid */}
        <svg className={s.mapSvg} viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="none">
          {[80,160,240].map(y => <line key={y} x1="0" y1={y} x2={MAP_W} y2={y} stroke="var(--border)" strokeWidth=".5"/>)}
          {[170,340,510].map(x => <line key={x} x1={x} y1="0" x2={x} y2={MAP_H} stroke="var(--border)" strokeWidth=".5"/>)}
          {DISTRICTS.map((d, i) => {
            const col = i % 4, row = Math.floor(i / 4)
            return <text key={d} x={col * 170 + 85} y={row * 80 + 38} textAnchor="middle" fontSize="11" fill="var(--text3)">{d}</text>
          })}
        </svg>

        {/* rat dots */}
        {layers.rat && filteredReports.map(r => {
          const m = INCIDENT_TYPES[r.type]
          return (
            <div key={r.id} data-nodrag="1"
              className={s.dot}
              style={{ left: `${r.x / MAP_W * 100}%`, top: `${r.y / MAP_H * 100}%`, background: m.color }}
              onMouseEnter={() => setTooltip({ kind: 'rat', r })}
              onMouseLeave={() => setTooltip(null)}
            />
          )
        })}

        {/* cat dots */}
        {layers.cat && cats.map(c => {
          const sz = Math.min(9 + c.count * 1.4, 22)
          return (
            <div key={c.id} data-nodrag="1"
              className={s.dot}
              style={{ left: `${c.x / MAP_W * 100}%`, top: `${c.y / MAP_H * 100}%`,
                width: sz, height: sz, background: '#964B8C' }}
              onMouseEnter={() => setTooltip({ kind: 'cat', c })}
              onMouseLeave={() => setTooltip(null)}
            />
          )
        })}

        {/* drug markers */}
        {layers.drug && drugs.map(d => (
          <div key={d.id} data-nodrag="1"
            className={s.drugMarker}
            style={{ left: `${d.x / MAP_W * 100}%`, top: `${d.y / MAP_H * 100}%` }}
            onMouseEnter={() => setTooltip({ kind: 'drug', d })}
            onMouseLeave={() => setTooltip(null)}
          >☣️</div>
        ))}

        {/* pending marker */}
        {pendingLoc && (
          <div className={s.pendingMarker}
            style={{ left: `${pendingLoc.x / MAP_W * 100}%`, top: `${pendingLoc.y / MAP_H * 100}%` }}
          />
        )}

        {/* tooltip */}
        {tooltip && (() => {
          const { kind } = tooltip
          if (kind === 'rat') {
            const { r } = tooltip
            const m = INCIDENT_TYPES[r.type]
            const lt = LOCATION_TYPES[r.locType]
            const pos = ttPos(r.x, r.y)
            return (
              <div className={s.tooltip} style={pos}>
                <div style={{ fontWeight: 500, color: m.text, marginBottom: 3 }}>{m.icon} {m.label}</div>
                <div style={{ color: 'var(--text)', marginBottom: 2 }}>{r.location}</div>
                {lt && <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>{lt.icon} {lt.label}</div>}
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.time}</div>
              </div>
            )
          }
          if (kind === 'cat') {
            const { c } = tooltip
            const st = CAT_STATUS[c.status]
            const pos = ttPos(c.x, c.y)
            return (
              <div className={s.tooltip} style={pos}>
                <div style={{ fontWeight: 500, color: '#6B2F65', marginBottom: 3 }}>🐱 街貓群落</div>
                <div style={{ color: 'var(--text)', marginBottom: 2 }}>{c.location}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>約 {c.count} 隻 · {st?.label}</div>
                <div style={{ fontSize: 11, color: c.ratNearby === 'yes' ? '#A32D2D' : c.ratNearby === 'no' ? '#27500A' : 'var(--text3)' }}>
                  附近鼠患：{c.ratNearby === 'yes' ? '有' : c.ratNearby === 'no' ? '無' : '不確定'}
                </div>
              </div>
            )
          }
          if (kind === 'drug') {
            const { d } = tooltip
            const pos = ttPos(d.x, d.y)
            return (
              <div className={s.tooltip} style={pos}>
                <div style={{ fontWeight: 500, color: '#922B21', marginBottom: 3 }}>☣️ 投藥紀錄</div>
                <div style={{ color: 'var(--text)', marginBottom: 2 }}>{d.location}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>{d.date} · {DRUG_BY[d.by]}</div>
                <div style={{ fontSize: 11, color: d.nearCat === 'yes' ? '#A32D2D' : 'var(--text3)' }}>
                  貓群附近：{d.nearCat === 'yes' ? '⚠️ 是' : d.nearCat === 'no' ? '否' : '不確定'}
                </div>
              </div>
            )
          }
        })()}

        {/* legend */}
        <div className={s.legend}>
          {[
            { color: '#E24B4A', label: '活鼠' },
            { color: '#BA7517', label: '受毒動物' },
            { color: '#964B8C', label: '街貓群落' },
          ].map(({ color, label }) => (
            <div key={label} className={s.legendRow}>
              <div className={s.legendDot} style={{ background: color }} />
              {label}
            </div>
          ))}
          <div className={s.legendRow}>☣️ 投藥地點</div>
        </div>
        <div className={s.hint}>點擊地圖選擇通報位置</div>
      </div>

      {/* counters */}
      <div className={s.mapFooter}>
        <span>通報 <strong>{filteredReports.length}</strong> 筆</span>
        <span style={{ color: '#6B2F65' }}>街貓群落 <strong>{cats.length}</strong> 個</span>
        <span style={{ color: '#922B21' }}>投藥紀錄 <strong>{drugs.length}</strong> 筆</span>
      </div>
    </div>
  )
}
