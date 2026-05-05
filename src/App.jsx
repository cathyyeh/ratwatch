import { useState, useEffect, useCallback } from 'react'
import {
  fetchReports, insertReport,
  fetchCats,    insertCat,
  fetchDrugs,   insertDrug,
  uploadPhoto,
} from './supabase'
import { SAMPLE_REPORTS, SAMPLE_CATS, SAMPLE_DRUGS } from './data'
import MapTab    from './MapTab'
import ReportTab from './ReportTab'
import CatTab    from './CatTab'
import DrugTab   from './DrugTab'
import StatsTab  from './StatsTab'
import { FeedTab, InfoTab } from './FeedTab'
import s from './App.module.css'

const TABS = [
  { id: 'map',    label: '通報地圖' },
  { id: 'report', label: '事件通報' },
  { id: 'cats',   label: '🐱 街貓登記' },
  { id: 'drug',   label: '☣️ 投藥紀錄' },
  { id: 'stats',  label: '數據分析' },
  { id: 'feed',   label: '通報記錄' },
  { id: 'info',   label: '防治知識' },
]

const DB_ENABLED = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [tab, setTab]         = useState('map')
  const [reports, setReports] = useState(SAMPLE_REPORTS)
  const [cats, setCats]       = useState(SAMPLE_CATS)
  const [drugs, setDrugs]     = useState(SAMPLE_DRUGS)
  const [pendingLoc, setPendingLoc] = useState(null)
  const [loading, setLoading] = useState(DB_ENABLED)
  const [dbError, setDbError] = useState(null)

  // ── load from Supabase on mount ──────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!DB_ENABLED) return
    try {
      const [r, c, d] = await Promise.all([fetchReports(), fetchCats(), fetchDrugs()])
      // merge with sample seed if DB is empty
      setReports(r.length > 0 ? r : SAMPLE_REPORTS)
      setCats(c.length   > 0 ? c : SAMPLE_CATS)
      setDrugs(d.length  > 0 ? d : SAMPLE_DRUGS)
    } catch (err) {
      console.error('Supabase load error:', err)
      setDbError('資料庫連線失敗，目前使用本機暫存資料。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── helpers to normalise field names (JS camelCase → DB snake_case) ──────
  function toReportRow(data) {
    return {
      type:       data.type,
      location:   data.location,
      district:   data.district,
      loc_type:   data.locType || data.loc_type || 'other',
      animal:     data.animal  || null,
      count:      data.count   || '1',
      description: data.description || data.desc    || null,
      photo_url:  data.photoUrl|| data.photo_url || null,
      x:          data.x       || 340,
      y:          data.y       || 160,
    }
  }
  function toCatRow(data) {
    return {
      location:  data.location,
      district:  data.district,
      count:     data.count     || 1,
      status:    data.status    || 'active',
      names:     data.names     || null,
      description: data.description || data.desc      || null,
      photo_url: data.photoUrl  || data.photo_url || null,
      rat_nearby:data.ratNearby || data.rat_nearby || 'unknown',
      caretaker: data.caretaker || null,
      org:       data.org       || null,
      org_label: data.orgLabel  || data.org_label || null,
      org_url:   data.orgUrl    || data.org_url   || null,
      x:         data.x         || 340,
      y:         data.y         || 160,
    }
  }
  function toDrugRow(data) {
    return {
      location: data.location,
      district: data.district,
      date:     data.date     || null,
      time_str: data.timeStr  || data.time_str || null,
      by:       data.by       || 'unknown',
      color:    data.color    || 'unknown',
      near_cat: data.nearCat  || data.near_cat || 'unknown',
      description: data.description || data.desc     || null,
      photo_url:data.photoUrl || data.photo_url || null,
      x:        data.x        || 340,
      y:        data.y        || 160,
    }
  }

  // normalise DB row back to the shape components expect
  function normaliseReport(r) {
    return { ...r, locType: r.loc_type, photoUrl: r.photo_url, time: r.time || '剛剛' }
  }
  function normaliseCat(c) {
    return { ...c, ratNearby: c.rat_nearby, photoUrl: c.photo_url, orgLabel: c.org_label, orgUrl: c.org_url, time: c.time || '剛剛' }
  }
  function normaliseDrug(d) {
    return { ...d, nearCat: d.near_cat, timeStr: d.time_str, photoUrl: d.photo_url, time: d.time || '剛剛' }
  }

  // ── submit handlers ──────────────────────────────────────────────────────
  async function addReport(data) {
    // upload photo first if present (File object)
    let photoUrl = data.photoUrl
    if (data._photoFile) {
      try { photoUrl = await uploadPhoto(data._photoFile) } catch {}
    }
    const payload = { ...data, photoUrl }

    if (DB_ENABLED) {
      try {
        const row = await insertReport(toReportRow(payload))
        setReports(prev => [normaliseReport(row), ...prev])
      } catch (err) {
        console.error('insertReport error:', err)
        // fallback: add locally
        setReports(prev => [{ ...payload, id: Date.now(), time: '剛剛' }, ...prev])
      }
    } else {
      setReports(prev => [{ ...payload, id: Date.now(), time: '剛剛' }, ...prev])
    }
  }

  async function addCat(data) {
    let photoUrl = data.photoUrl
    if (data._photoFile) {
      try { photoUrl = await uploadPhoto(data._photoFile) } catch {}
    }
    const payload = { ...data, photoUrl }

    if (DB_ENABLED) {
      try {
        const row = await insertCat(toCatRow(payload))
        setCats(prev => [normaliseCat(row), ...prev])
      } catch (err) {
        console.error('insertCat error:', err)
        setCats(prev => [{ ...payload, id: Date.now(), time: '剛剛' }, ...prev])
      }
    } else {
      setCats(prev => [{ ...payload, id: Date.now(), time: '剛剛' }, ...prev])
    }
  }

  async function addDrug(data) {
    let photoUrl = data.photoUrl
    if (data._photoFile) {
      try { photoUrl = await uploadPhoto(data._photoFile) } catch {}
    }
    const payload = { ...data, photoUrl }

    if (DB_ENABLED) {
      try {
        const row = await insertDrug(toDrugRow(payload))
        setDrugs(prev => [normaliseDrug(row), ...prev])
      } catch (err) {
        console.error('insertDrug error:', err)
        setDrugs(prev => [{ ...payload, id: Date.now(), time: '剛剛' }, ...prev])
      }
    } else {
      setDrugs(prev => [{ ...payload, id: Date.now(), time: '剛剛' }, ...prev])
    }
  }

  function handleLocationPick(loc) {
    setPendingLoc(loc)
    setTab('report')
  }

  const live   = reports.filter(r => r.type === 'rat-live').length
  const poison = reports.filter(r => r.type === 'poisoned').length

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
        height:'100vh', flexDirection:'column', gap:12, color:'var(--text2)', fontFamily:'var(--font)' }}>
        <div style={{ fontSize:28 }}>🐀</div>
        <div style={{ fontSize:14 }}>載入資料中…</div>
      </div>
    )
  }

  return (
    <div className={s.layout}>
      <div className={s.container}>
        {/* DB status banner */}
        {!DB_ENABLED && (
          <div style={{ padding:'7px 12px', background:'rgba(186,117,23,.08)',
            border:'0.5px solid rgba(186,117,23,.3)', borderRadius:6,
            fontSize:11, color:'#854F0B', marginBottom:8 }}>
            ⚠️ 尚未連接資料庫 — 資料只存在本機，重新整理即消失。請設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY。
          </div>
        )}
        {dbError && (
          <div style={{ padding:'7px 12px', background:'rgba(226,75,74,.07)',
            border:'0.5px solid rgba(226,75,74,.3)', borderRadius:6,
            fontSize:11, color:'#A32D2D', marginBottom:8 }}>
            ⚠️ {dbError}
          </div>
        )}
        {DB_ENABLED && !dbError && (
          <div style={{ padding:'7px 12px', background:'rgba(59,109,17,.06)',
            border:'0.5px solid rgba(59,109,17,.25)', borderRadius:6,
            fontSize:11, color:'#27500A', marginBottom:8 }}>
            ✓ 已連接 Supabase 資料庫 — 所有通報即時儲存
          </div>
        )}

        {/* header */}
        <div className={s.header}>
          <div className={s.logoWrap}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5"/>
              <circle cx="9" cy="9" r="2.5" fill="white"/>
              <line x1="9" y1="2" x2="9" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="13" x2="9" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="9" x2="5" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="9" x2="16" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className={s.appTitle}>鼠患通報系統 · Rat Watch Taipei</div>
            <div className={s.appSub}>One Health — 鼠患、街貓、投藥 三層監控</div>
          </div>
          <div className={s.headerStats}>
            <div className={s.hStat}><div style={{ color:'#A32D2D' }}>{live}</div><div>活鼠</div></div>
            <div className={s.hStat}><div style={{ color:'#6B2F65' }}>{cats.length}</div><div>街貓</div></div>
            <div className={s.hStat}><div style={{ color:'#922B21' }}>{drugs.length}</div><div>投藥</div></div>
            <div className={s.hStat}><div style={{ color:'#854F0B' }}>{poison}</div><div>受毒</div></div>
          </div>
        </div>

        {/* tabs */}
        <div className={s.tabBar}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className={s.content}>
          {tab === 'map'    && <MapTab    reports={reports} cats={cats} drugs={drugs} onLocationPick={handleLocationPick} pendingLoc={pendingLoc} />}
          {tab === 'report' && <ReportTab pendingLoc={pendingLoc} onClearLoc={() => setPendingLoc(null)} onSubmit={addReport} />}
          {tab === 'cats'   && <CatTab    cats={cats} pendingLoc={pendingLoc} onSubmit={addCat} />}
          {tab === 'drug'   && <DrugTab   drugs={drugs} pendingLoc={pendingLoc} onSubmit={addDrug} />}
          {tab === 'stats'  && <StatsTab  reports={reports} cats={cats} drugs={drugs} />}
          {tab === 'feed'   && <FeedTab   reports={reports} cats={cats} drugs={drugs} />}
          {tab === 'info'   && <InfoTab />}
        </div>
      </div>
    </div>
  )
}
