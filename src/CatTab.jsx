import { useState, useEffect } from 'react'
import { CAT_STATUS } from './data'
import { Alert, FormRow, PhotoDrop, SubmitButton, SectionTitle, CatStatusBadge, InfoBox } from './ui'
import s from './CatTab.module.css'

const CAT_ORGS = [
  { id: '',       label: '— 請選擇或自填 —' },
  { id: 'tnrtw',  label: '臺北市支持流浪貓絕育(TNR)計劃協會', url: 'https://www.tnrtw.org' },
  { id: 'scpa',   label: '臺北市流浪貓保護協會 (SCPA)', url: 'https://www.facebook.com/mypetclub/' },
  { id: 'tnrorg', label: '台灣街貓文創協會', url: 'https://www.tnr.org.tw' },
  { id: 'lovecat',label: '愛貓協會 (NGO)', url: 'https://www.facebook.com/NGO.lovecat/' },
  { id: 'tsaca',  label: '貓狗同樂會（台灣收容動物關懷協會）', url: 'https://www.facebook.com/tsaca/' },
  { id: 'tccp',   label: '台北市動保處 TCCP 官方計畫', url: 'https://www.tcapo.gov.taipei' },
  { id: 'li',     label: '里辦公室/里長' },
  { id: 'indie',  label: '個人志工' },
  { id: 'other',  label: '其他' },
]

export default function CatTab({ cats, pendingLoc, onSubmit }) {
  const [loc, setLoc] = useState('')
  const [count, setCount] = useState(3)
  const [status, setStatus] = useState('active')
  const [names, setNames] = useState('')
  const [desc, setDesc] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [ratNearby, setRatNearby] = useState('no')
  const [caretaker, setCaretaker] = useState('')
  const [org, setOrg] = useState('')
  const [alert, setAlert] = useState(null)

  useEffect(() => { if (pendingLoc) setLoc(pendingLoc.label) }, [pendingLoc])

  function submit() {
    if (!loc.trim()) { setAlert('err'); setTimeout(() => setAlert(null), 3000); return }
    const district = pendingLoc?.label || loc.match(/[\u4e00-\u9fa5]{2,3}區/)?.[0] || '中正區'
    const orgMeta = CAT_ORGS.find(o => o.id === org)
    onSubmit({
      location: loc.trim(), district, count, status, names, desc,
      photoUrl, ratNearby, caretaker,
      org: orgMeta?.id || org,
      orgLabel: orgMeta?.label || caretaker,
      orgUrl: orgMeta?.url || null,
      x: pendingLoc?.x || Math.round(50 + Math.random() * 580),
      y: pendingLoc?.y || Math.round(30 + Math.random() * 260),
    })
    setAlert('ok'); setTimeout(() => setAlert(null), 3000)
    setLoc(''); setCount(3); setStatus('active'); setNames(''); setDesc('')
    setPhotoUrl(null); setRatNearby('no'); setCaretaker(''); setOrg('')
  }

  return (
    <div className="fade-in">
      <InfoBox color="#6B2F65" bg="rgba(150,75,140,.06)" border="rgba(150,75,140,.3)">
        🐱 <strong>為什麼要登記街貓？</strong> 健康的街貓群落能有效壓制鼠患。記錄貓群分佈，可與鼠患熱點進行交叉比對，提供政策決策的科學依據。
      </InfoBox>

      <Alert type="ok" show={alert === 'ok'}>✓ 街貓群落已登記！</Alert>
      <Alert type="err" show={alert === 'err'}>請填寫地點資訊。</Alert>

      <FormRow label="📍 地點 *">
        {pendingLoc && (
          <div className={s.pendingBadge}>📍 地圖已選：{pendingLoc.label}</div>
        )}
        <input type="text" value={loc} onChange={e => setLoc(e.target.value)}
          placeholder="例如：中正區羅斯福路三段公園旁..." />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <FormRow label="估計貓隻數">
          <input type="number" value={count} min={1} max={50}
            onChange={e => setCount(Number(e.target.value))} />
        </FormRow>
        <FormRow label="群落狀態">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {Object.entries(CAT_STATUS).map(([id, m]) =>
              <option key={id} value={id}>{m.label}</option>
            )}
          </select>
        </FormRow>
      </div>

      <FormRow label="貓咪個體識別" hint="(可多填，以逗號分隔)">
        <input type="text" value={names} onChange={e => setNames(e.target.value)}
          placeholder="例如：虎斑母貓「小花」、橘貓公貓「胖虎」..." />
      </FormRow>

      <FormRow label="特徵描述">
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="描述貓咪外觀特徵、活動習性、常出沒時間..." />
      </FormRow>

      <FormRow label="📸 群落照片" hint="(強烈建議上傳，有助識別個體)">
        <PhotoDrop label="點擊上傳貓群照片" photoUrl={photoUrl}
          onFile={f => setPhotoUrl(URL.createObjectURL(f))} inputId="catPhoto" />
      </FormRow>

      <FormRow label="附近是否有鼠患？">
        <div style={{ display: 'flex', gap: 8 }}>
          {[['yes','是，有鼠患'], ['no','無明顯鼠患'], ['unknown','不確定']].map(([v, label]) => (
            <button key={v}
              className={`${s.yesNoBtn} ${ratNearby === v ? s.yesNoBtnSel : ''}`}
              onClick={() => setRatNearby(v)}>{label}</button>
          ))}
        </div>
      </FormRow>

      <FormRow label="負責照護組織" hint="(協助建立各NGO志工網絡)">
        <select value={org} onChange={e => setOrg(e.target.value)} style={{ marginBottom: 7 }}>
          {CAT_ORGS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        {org && CAT_ORGS.find(o => o.id === org)?.url && (
          <a href={CAT_ORGS.find(o => o.id === org).url}
            target="_blank" rel="noopener noreferrer" className={s.orgLink}>
            前往該組織官網 / 粉專 →
          </a>
        )}
      </FormRow>

      <FormRow label="照護者姓名" hint="(可選填，例如里長姓名或個人志工)">
        <input type="text" value={caretaker} onChange={e => setCaretaker(e.target.value)}
          placeholder="例如：黃里長 / 林志工" />
      </FormRow>

      <SubmitButton variant="cat" onClick={submit}>登記街貓群落</SubmitButton>

      {/* existing colonies */}
      <div style={{ marginTop: 24 }}>
        <SectionTitle sub={`(${cats.length} 個)`}>已登記群落</SectionTitle>
        {cats.map(c => {
          const orgMeta = CAT_ORGS.find(o => o.id === c.org)
          return (
            <div key={c.id} className={s.catCard}>
              <div className={s.catCardTop}>
                <CatStatusBadge status={c.status} />
                <span className={s.catCountBadge}>約{c.count}隻</span>
                <span className={s.catTime}>{c.time}</span>
              </div>
              <div className={s.catLoc}>📍 {c.location}</div>
              {c.names && <div className={s.catNames}>🐱 {c.names}</div>}
              {c.desc  && <div className={s.catDesc}>{c.desc}</div>}
              {c.photoUrl && <img src={c.photoUrl} alt="colony" className={s.catPhoto} />}
              <div className={s.catMeta}>
                <span style={{ color: c.ratNearby === 'yes' ? '#A32D2D' : c.ratNearby === 'no' ? '#27500A' : 'var(--text3)' }}>
                  附近鼠患：{c.ratNearby === 'yes' ? '有' : c.ratNearby === 'no' ? '無' : '不確定'}
                </span>
                {orgMeta && orgMeta.id ? (
                  orgMeta.url
                    ? <a href={orgMeta.url} target="_blank" rel="noopener noreferrer" className={s.orgChip}>{orgMeta.label}</a>
                    : <span className={s.orgChip}>{orgMeta.label}</span>
                ) : c.caretaker ? (
                  <span style={{ color: 'var(--text2)' }}>照護：{c.caretaker}</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
