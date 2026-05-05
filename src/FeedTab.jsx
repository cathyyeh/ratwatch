import { useState } from 'react'
import { INCIDENT_TYPES, LOCATION_TYPES, ANIMAL_TYPES, CAT_STATUS, DRUG_BY, DRUG_COLOR } from './data'
import { Badge, LocBadge, CatStatusBadge, DrugBadge, SectionTitle } from './ui'
import s from './FeedTab.module.css'

export function FeedTab({ reports, cats, drugs }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [locFilter,  setLocFilter]  = useState('all')

  const filteredReports = reports.filter(r =>
    (typeFilter === 'all' || typeFilter === r.type) &&
    (locFilter  === 'all' || locFilter  === r.locType)
  )
  const showCats  = typeFilter === 'all' || typeFilter === '_cat'
  const showDrugs = typeFilter === 'all' || typeFilter === '_drug'

  const typeFilters = [
    { id:'all', label:'全部' },
    ...Object.entries(INCIDENT_TYPES).map(([id,t]) => ({ id, label:`${t.icon} ${t.label}` })),
    { id:'_cat',  label:'🐱 街貓' },
    { id:'_drug', label:'☣️ 投藥' },
  ]

  return (
    <div className="fade-in">
      <div className={s.filterSection}>
        <div className={s.filterLabel}>事件類型</div>
        <div className={s.filterRow}>
          {typeFilters.map(f => (
            <button key={f.id}
              className={`${s.filterPill} ${typeFilter === f.id ? s.filterPillActive : ''}`}
              onClick={() => setTypeFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div className={s.filterLabel} style={{ marginTop: 8 }}>地點類型</div>
        <div className={s.filterRow}>
          <button className={`${s.filterPill} ${s.filterGreen} ${locFilter === 'all' ? s.filterGreenActive : ''}`}
            onClick={() => setLocFilter('all')}>全部地點</button>
          {Object.entries(LOCATION_TYPES).map(([id,lt]) => (
            <button key={id}
              className={`${s.filterPill} ${s.filterGreen} ${locFilter === id ? s.filterGreenActive : ''}`}
              onClick={() => setLocFilter(id)}>{lt.icon} {lt.label}</button>
          ))}
        </div>
      </div>

      {/* rat reports */}
      {filteredReports.map(r => (
        <div key={r.id} className={s.card}>
          <div className={s.cardTop}>
            <Badge type={r.type} />
            {r.locType && <LocBadge locType={r.locType} />}
            {r.animal && ANIMAL_TYPES[r.animal] && (
              <span className={s.animalTag}>{ANIMAL_TYPES[r.animal]}</span>
            )}
            <span className={s.cardTime}>{r.time}</span>
          </div>
          <div className={s.cardLoc}>{r.location}</div>
          <div className={s.cardDesc}>{r.desc}</div>
          {r.photoUrl && <img src={r.photoUrl} alt="report" className={s.cardPhoto} />}
          {r.source && (
            <div className={s.sourceRow}>
              📰 {r.sourceUrl
                ? <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className={s.sourceLink}>{r.source}</a>
                : r.source}
            </div>
          )}
        </div>
      ))}

      {/* cat entries */}
      {showCats && cats.map(c => (
        <div key={`cat-${c.id}`} className={`${s.card} ${s.catCard}`}>
          <div className={s.cardTop}>
            <span className={s.catBadge}>🐱 街貓群落</span>
            <CatStatusBadge status={c.status} />
            <span className={s.catCount}>約{c.count}隻</span>
            <span className={s.cardTime}>{c.time}</span>
          </div>
          <div className={s.cardLoc}>{c.location}</div>
          {c.names && <div className={s.catNames}>{c.names}</div>}
          {c.photoUrl && <img src={c.photoUrl} alt="cats" className={s.cardPhoto} />}
          <div className={s.catMeta}>
            附近鼠患：
            <span style={{ color: c.ratNearby==='yes'?'#A32D2D':c.ratNearby==='no'?'#27500A':'var(--text3)' }}>
              {c.ratNearby==='yes'?'有':c.ratNearby==='no'?'無':'不確定'}
            </span>
            {c.caretaker && <span style={{marginLeft:10, color:'var(--text2)'}}>照護：{c.caretaker}</span>}
          </div>
        </div>
      ))}

      {/* drug entries */}
      {showDrugs && drugs.map(d => (
        <div key={`drug-${d.id}`} className={`${s.card} ${s.drugCard}`}>
          <div className={s.cardTop}>
            <DrugBadge>☣️ 投藥紀錄</DrugBadge>
            <span className={s.drugByTag}>{DRUG_BY[d.by]}</span>
            {d.nearCat === 'yes' && <span className={s.catWarnTag}>⚠️ 貓群附近</span>}
            <span className={s.cardTime}>{d.date}</span>
          </div>
          <div className={s.cardLoc}>{d.location}</div>
          {d.desc && <div className={s.cardDesc}>{d.desc}</div>}
          {d.photoUrl && <img src={d.photoUrl} alt="drug site" className={s.cardPhoto} />}
          {d.source && (
            <div className={s.sourceRow}>
              📰 {d.sourceUrl
                ? <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className={s.sourceLink}>{d.source}</a>
                : d.source}
            </div>
          )}
        </div>
      ))}

      {filteredReports.length === 0 && !showCats && !showDrugs && (
        <p className={s.empty}>無符合條件的通報</p>
      )}
    </div>
  )
}

export function InfoTab() {
  const blocks = [
    {
      title: '⚠️ 漢他病毒警示',
      color: '#A32D2D', bg: 'rgba(226,75,74,.06)', border: 'rgba(226,75,74,.3)',
      content: '2025年1月台北市發生漢他病毒死亡案例。若接觸鼠類排泄物請立即就醫，症狀包括發燒、肌肉痠痛、呼吸困難。',
    },
    {
      title: '為什麼不能只靠老鼠藥？',
      color: '#854F0B', bg: 'rgba(186,117,23,.06)', border: 'rgba(186,117,23,.3)',
      content: '台灣實施40年「全國滅鼠週」成效有限，老鼠已對抗凝血劑產生抗藥性。中毒老鼠不會立即死亡，行為異常時易被貓、猛禽捕食，造成生物放大效應。台灣猛禽研究會2021-2024年數據：106隻死亡猛禽中，61%驗出毒鼠藥殘留，形成「天敵死亡→鼠患更嚴重」的惡性循環。',
    },
    {
      title: '高風險地點類型與環境管理',
      color: '#0C447C', bg: 'rgba(24,95,165,.06)', border: 'rgba(24,95,165,.3)',
      list: [
        '🏪 傳統市場/夜市：食物殘渣與廚餘是最穩定鼠食來源，需嚴格廚餘管理',
        '🗑️ 垃圾收集點：不規律收運或堆積，是鼠類主要食源與藏匿地',
        '🚇 排水溝/地下道：老鼠主要移動通道，建議定期清淤與封堵',
        '🏚️ 老舊建築：提供大量藏匿與築巢空間，翻修前需先評估鼠患',
        '🌳 公園/綠地：不當餵食流浪動物，殘餘飼料成為鼠食來源',
      ],
    },
    {
      title: '正確的環境管理做法',
      color: '#27500A', bg: 'rgba(59,109,17,.06)', border: 'rgba(59,109,17,.3)',
      list: [
        '▶︎ 清除躲藏處：定期清理雜物，減少築巢機會',
        '▶︎ 嚴格管理食源：廚餘密封、垃圾不落地',
        '▶︎ 不隨意餵食遊蕩動物：殘留飼料是穩定鼠食來源',
        '▶︎ 封堵入侵路徑：建築物縫隙、管線口需定期檢查',
        '▶︎ 若必須用藥：限制毒餌站入口大小、系統性精準投放、評估成效',
      ],
    },
    {
      title: 'One Health 健康一體',
      color: '#3C3489', bg: 'rgba(83,58,183,.06)', border: 'rgba(83,58,183,.3)',
      content: '人、動物、環境是三位一體。環境受害，人類的健康就無法獨善其身。野灣野生動物保育協會呼籲雙北市政府停止便宜行事的投藥政策，以環境衛生管理為根本，保護街貓、猛禽等天然生態防治力量，為全台建立正確公衛標竿。',
    },
  ]

  return (
    <div className="fade-in">
      {blocks.map(b => (
        <div key={b.title} className={s.infoBlock}
          style={{ background: b.bg, border: `0.5px solid ${b.border}` }}>
          <div className={s.infoTitle} style={{ color: b.color }}>{b.title}</div>
          {b.content && <p className={s.infoText}>{b.content}</p>}
          {b.list && <ul className={s.infoList}>{b.list.map((li,i) => <li key={i}>{li}</li>)}</ul>}
        </div>
      ))}

      {/* cat community directory */}
      <div className={s.infoBlock} style={{ background: 'rgba(150,75,140,.04)', border: '0.5px solid rgba(150,75,140,.25)' }}>
        <div className={s.infoTitle} style={{ color: '#6B2F65' }}>🐱 街貓社群與照護組織</div>
        <p className={s.infoText} style={{ marginBottom: 10 }}>
          這些組織擁有台北市街貓聚落的實地資料，是建立貓群地圖的最佳合作夥伴。若您在某個聚落照護，歡迎在「街貓登記」分頁登記，並標注所屬組織。
        </p>
        <div className={s.orgGrid}>
          {[
            { name: '臺北市支持流浪貓絕育(TNR)計劃協會', tag: 'TNR 主力 · 全台北', note: '與動保處合作TCCP，擁有最完整的各區聚落資料', fb: 'https://www.facebook.com/SupportTNR/', web: 'https://www.tnrtw.org', fans: '16萬讚' },
            { name: '臺北市流浪貓保護協會 (SCPA)', tag: 'TNR + 醫療救援', note: '諮詢電話 02-2726-1079，受傷街貓第一通報管道', fb: 'https://www.facebook.com/mypetclub/', fans: '6.9萬讚' },
            { name: '台灣街貓文創協會', tag: '教育倡議', note: '推廣街貓文化與政策倡議，適合作「街貓防鼠」公眾教育合作', web: 'https://www.tnr.org.tw' },
            { name: '愛貓協會 (NGO)', tag: '收容所救援', note: '受毒動物快速通報節點，FB社群活躍', fb: 'https://www.facebook.com/NGO.lovecat/', fans: '8.8萬讚' },
            { name: '貓狗同樂會', tag: '大型倡議社群', note: '觸及率最高，適合擴散「反濫投藥」訊息', fb: 'https://www.facebook.com/tsaca/', fans: '18.6萬讚' },
            { name: '台北市動保處 TCCP 計畫', tag: '官方 · 政府認證', note: '市府唯一認證的街貓絕育回置計畫，數據最具公信力', web: 'https://www.tcapo.gov.taipei/cp.aspx?n=EF17C50DFE5643D1' },
          ].map(o => (
            <div key={o.name} className={s.orgCard}>
              <div className={s.orgName}>{o.name}</div>
              <div className={s.orgTag}>{o.tag}{o.fans ? ` · ${o.fans}` : ''}</div>
              <div className={s.orgNote}>{o.note}</div>
              <div className={s.orgLinks}>
                {o.fb  && <a href={o.fb}  target="_blank" rel="noopener noreferrer" className={s.orgBtn}>FB</a>}
                {o.web && <a href={o.web} target="_blank" rel="noopener noreferrer" className={s.orgBtn}>官網</a>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={s.contactBox}>
        <div className={s.contactTitle}>📞 緊急聯繫</div>
        <div className={s.contactRows}>
          <div>台北市市民服務熱線：<strong>1999</strong></div>
          <div>台北市衛生局防疫專線：<strong>02-2375-3782</strong></div>
          <div>野灣野生動物保育協會：<a href="https://www.wildlife.org.tw" target="_blank" rel="noopener noreferrer">wildlife.org.tw</a></div>
        </div>
      </div>
    </div>
  )
}
