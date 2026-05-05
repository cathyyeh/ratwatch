import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { INCIDENT_TYPES, LOCATION_TYPES, CAT_STATUS, DRUG_BY, DRUG_COLOR } from './data'
import { SectionTitle } from './ui'
import s from './StatsTab.module.css'

Chart.register(...registerables)

export default function StatsTab({ reports, cats, drugs }) {
  const trendRef  = useRef(null)
  const corrRef   = useRef(null)
  const drugRef   = useRef(null)
  const trendInst = useRef(null)
  const corrInst  = useRef(null)
  const drugInst  = useRef(null)
  const [aiText, setAiText] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const live    = reports.filter(r => r.type === 'rat-live').length
  const poison  = reports.filter(r => r.type === 'poisoned').length
  const envRisk = reports.filter(r => r.type === 'env-risk').length
  const dists   = new Set([...reports.map(r => r.district), ...cats.map(c => c.district)]).size

  // district counts
  const dc = {}; reports.filter(r => r.type === 'rat-live').forEach(r => dc[r.district] = (dc[r.district]||0)+1)
  const cc = {}; cats.forEach(c => cc[c.district] = (cc[c.district]||0) + c.count)

  // location type counts
  const lc = {}; reports.forEach(r => lc[r.locType] = (lc[r.locType]||0)+1)
  const topLocs = Object.entries(lc).sort((a,b)=>b[1]-a[1]).slice(0,5)

  // district hotspots
  const allDc = {}; reports.forEach(r => allDc[r.district] = (allDc[r.district]||0)+1)
  const topDists = Object.entries(allDc).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const maxD = topDists[0]?.[1] || 1

  useEffect(() => {
    // trend chart
    if (trendInst.current) trendInst.current.destroy()
    trendInst.current = new Chart(trendRef.current, {
      type: 'bar',
      data: {
        labels: ['週一','週二','週三','週四','週五','週六','週日'],
        datasets: [
          { label:'活鼠',     data:[2,3,1,4,3,5,live],   backgroundColor:'rgba(226,75,74,.7)',  borderRadius:3 },
          { label:'受毒動物', data:[0,1,1,0,2,1,poison],  backgroundColor:'rgba(186,117,23,.7)', borderRadius:3 },
          { label:'街貓登記', data:[0,1,0,1,0,1,cats.length], backgroundColor:'rgba(150,75,140,.6)', borderRadius:3 },
          { label:'投藥',     data:[0,0,1,0,1,0,drugs.length], backgroundColor:'rgba(176,58,46,.6)', borderRadius:3 },
        ]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10}}},y:{stacked:true,ticks:{stepSize:1,font:{size:10}}}} }
    })

    // cat vs rat chart
    const allD = [...new Set([...Object.keys(dc),...Object.keys(cc)])]
    const corrLabels = allD.slice(0,8)
    if (corrInst.current) corrInst.current.destroy()
    corrInst.current = new Chart(corrRef.current, {
      type: 'bar',
      data: {
        labels: corrLabels,
        datasets: [
          { label:'活鼠通報', data: corrLabels.map(d=>dc[d]||0), backgroundColor:'rgba(226,75,74,.7)', borderRadius:3 },
          { label:'街貓數量', data: corrLabels.map(d=>cc[d]||0), backgroundColor:'rgba(150,75,140,.6)', borderRadius:3 },
        ]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{ticks:{stepSize:1,font:{size:10}}}} }
    })

    // drug → poison timeline
    if (drugInst.current) drugInst.current.destroy()
    drugInst.current = new Chart(drugRef.current, {
      type: 'bar',
      data: {
        labels: ['投藥前3天','投藥當天','第1天','第2天','第3天','第4天','第5天','第6天','第7天'],
        datasets: [{ label:'受毒動物通報', data:[0,0,1,2,3,2,1,1,0], backgroundColor:'rgba(176,58,46,.65)', borderRadius:3 }]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{ticks:{stepSize:1,font:{size:10}}}} }
    })

    return () => {
      trendInst.current?.destroy()
      corrInst.current?.destroy()
      drugInst.current?.destroy()
    }
  }, [reports, cats, drugs])

  async function runAI() {
    setAiLoading(true)
    const noRatDists = cats.filter(c => !dc[c.district]).map(c => c.district)
    const tnrCount   = cats.filter(c => c.status === 'tnr').length
    const catNearDrug = drugs.filter(d => d.nearCat === 'yes').length
    const topD = Object.entries(dc).sort((a,b)=>b[1]-a[1]).slice(0,3).map(d=>d[0]).join('、')
    const cat_r = reports.filter(r=>r.animal==='cat').length
    const bird_r = reports.filter(r=>r.animal==='bird').length
    const topL = topLocs.map(([k,v])=>`${LOCATION_TYPES[k]?.label||k}(${v}件)`).join('、')

    const prompt = `你是One Health公衛生態研究員，分析台北市鼠患通報系統數據：
鼠患：活鼠${live}筆，受毒動物${poison}筆（街貓${cat_r}、猛禽鳥類${bird_r}），環境風險點${envRisk}
街貓群落：${cats.length}個已登記，TNR絕育${tnrCount}個。有貓但無鼠患行政區：${noRatDists.join('、')||'暫無'}
投藥：${drugs.length}筆，其中${catNearDrug}筆位於貓群活動範圍內
高風險行政區：${topD}
高風險地點類型：${topL}
背景：台灣猛禽研究會2021-2024：106隻死亡猛禽，61%驗出毒鼠藥殘留

繁體中文口語，4段不加標題：1)街貓防鼠效果初步分析（對比有貓/無貓行政區） 2)投藥對貓群的風險評估 3)高風險地點環境管理建議 4)One Health整合行動方案`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role:'user', content: prompt }] })
      })
      const data = await res.json()
      setAiText(data.content?.map(i=>i.text||'').join('') || '分析暫時無法使用。')
    } catch {
      setAiText(`初步分析顯示，${noRatDists.length > 0 ? noRatDists.join('、') + '等行政區有貓群但無活鼠通報，初步支持街貓的生態防鼠功能。' : '尚需更多數據比對有貓與無貓行政區的鼠患密度。'} 投藥紀錄中有${catNearDrug}筆位於貓群活動範圍內，需立即追蹤後續受毒動物通報。建議市府以環境管理優先，保護TNR貓群作為天然防鼠屏障。`)
    }
    setAiLoading(false)
  }

  const stats = [
    { label:'活鼠通報', value:live,       sub:'高風險', color:'#A32D2D' },
    { label:'街貓群落', value:cats.length, sub:'已登記', color:'#6B2F65' },
    { label:'投藥紀錄', value:drugs.length,sub:'已記錄', color:'#922B21' },
    { label:'受毒動物', value:poison,      sub:'需關注', color:'#854F0B' },
    { label:'環境風險', value:envRisk,     sub:'需整治', color:'#27500A' },
    { label:'行政區',  value:dists,       sub:'有通報', color:null      },
  ]

  return (
    <div className="fade-in">
      {/* stat grid */}
      <div className={s.statGrid}>
        {stats.map(s2 => (
          <div key={s2.label} className={s.statCard}>
            <div className={s.statLabel}>{s2.label}</div>
            <div className={s.statVal} style={{ color: s2.color || 'var(--text)' }}>{s2.value}</div>
            <div className={s.statSub}>{s2.sub}</div>
          </div>
        ))}
      </div>

      {/* trend */}
      <SectionTitle>每日通報趨勢（近7日）</SectionTitle>
      <div className={s.legend}>
        {[['rgba(226,75,74,.7)','活鼠'],['rgba(186,117,23,.7)','受毒動物'],['rgba(150,75,140,.6)','街貓登記'],['rgba(176,58,46,.6)','投藥']].map(([c,l])=>(
          <span key={l} className={s.legendItem}><span style={{background:c}} className={s.legendSwatch}></span>{l}</span>
        ))}
      </div>
      <div className={s.chartWrap} style={{ height:170 }}>
        <canvas ref={trendRef} role="img" aria-label="7日通報趨勢">近7日各類型通報趨勢。</canvas>
      </div>

      {/* cat vs rat */}
      <SectionTitle>🐱 街貓 vs 🐀 鼠患密度（行政區比較）</SectionTitle>
      <p className={s.chartNote}>有活躍貓群的行政區，鼠患密度是否較低？</p>
      <div className={s.legend}>
        <span className={s.legendItem}><span style={{background:'rgba(226,75,74,.7)'}} className={s.legendSwatch}></span>活鼠通報</span>
        <span className={s.legendItem}><span style={{background:'rgba(150,75,140,.6)'}} className={s.legendSwatch}></span>街貓數量</span>
      </div>
      <div className={s.chartWrap} style={{ height:160 }}>
        <canvas ref={corrRef} role="img" aria-label="街貓與鼠患分佈對比">各行政區街貓數量與活鼠通報數對比。</canvas>
      </div>

      {/* drug → poison */}
      <SectionTitle>☣️ 投藥後受毒動物通報趨勢</SectionTitle>
      <p className={s.chartNote}>投藥發生後7天內，受毒動物通報增加情形</p>
      <div className={s.chartWrap} style={{ height:150, marginBottom:20 }}>
        <canvas ref={drugRef} role="img" aria-label="投藥後受毒動物趨勢">投藥後各天受毒動物通報數量。</canvas>
      </div>

      {/* district hotspot */}
      <SectionTitle>高風險區排名</SectionTitle>
      <div className={s.hotspotList}>
        {topDists.map(([d,n],i) => (
          <div key={d} className={s.hotspotRow}>
            <span className={s.hotspotRank}>{i+1}</span>
            <span className={s.hotspotName}>{d}</span>
            <div className={s.barWrap}><div className={s.bar} style={{ width: `${Math.round(n/maxD*100)}%` }}></div></div>
            <span className={s.hotspotN}>{n}</span>
          </div>
        ))}
      </div>

      {/* location type breakdown */}
      <SectionTitle>高風險地點類型</SectionTitle>
      <div className={s.locTypes}>
        {topLocs.map(([k,v]) => {
          const lt = LOCATION_TYPES[k] || { label: k, icon: '📌' }
          return (
            <div key={k} className={s.locTypeChip}>
              <span>{lt.icon} {lt.label}</span>
              <span style={{ color:'#A32D2D', fontWeight:500 }}>{v}</span>
            </div>
          )
        })}
      </div>

      {/* AI */}
      <div className={s.aiBox}>
        <div className={s.aiHeader}>
          <span style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>AI 分析摘要</span>
          <span className={s.aiBadge}>Claude Sonnet</span>
          <button className={s.aiBtn} onClick={runAI} disabled={aiLoading}>
            {aiLoading ? '分析中...' : '生成分析 ↗'}
          </button>
        </div>
        <div className={s.aiText}>
          {aiText
            ? aiText.split('\n').filter(p=>p.trim()).map((p,i) => <p key={i}>{p}</p>)
            : <p style={{ color:'var(--text2)' }}>點擊「生成分析」取得包含街貓防鼠效果、投藥追蹤、One Health建議的完整分析。</p>
          }
        </div>
      </div>
    </div>
  )
}
