import { useState, useEffect } from 'react'
import { DRUG_BY, DRUG_COLOR } from './data'
import { Alert, FormRow, PhotoDrop, SubmitButton, SectionTitle, DrugBadge, InfoBox } from './ui'
import s from './DrugTab.module.css'

export default function DrugTab({ drugs, pendingLoc, onSubmit }) {
  const [loc, setLoc] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [timeStr, setTimeStr] = useState('')
  const [by, setBy] = useState('gov')
  const [color, setColor] = useState(null)
  const [nearCat, setNearCat] = useState('no')
  const [desc, setDesc] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [alert, setAlert] = useState(null)

  useEffect(() => { if (pendingLoc) setLoc(pendingLoc.label) }, [pendingLoc])

  function submit() {
    if (!loc.trim() || !date) { setAlert('err'); setTimeout(() => setAlert(null), 3000); return }
    const district = pendingLoc?.label || loc.match(/[\u4e00-\u9fa5]{2,3}區/)?.[0] || '中正區'
    onSubmit({
      location: loc.trim(), district, date, timeStr, by,
      color: color || 'unknown', nearCat, desc, photoUrl,
      x: pendingLoc?.x || Math.round(50 + Math.random() * 580),
      y: pendingLoc?.y || Math.round(30 + Math.random() * 260),
    })
    setAlert('ok'); setTimeout(() => setAlert(null), 3000)
    setLoc(''); setTimeStr(''); setColor(null); setNearCat('no'); setDesc(''); setPhotoUrl(null)
  }

  return (
    <div className="fade-in">
      <InfoBox color="#922B21" bg="rgba(176,58,46,.06)" border="rgba(176,58,46,.3)">
        ☣️ <strong>投藥紀錄的重要性：</strong> 記錄投藥地點與時間，可在後續受毒動物通報發生時追溯關聯，提供具體數據要求主管機關負責。
      </InfoBox>

      <Alert type="ok" show={alert === 'ok'}>✓ 投藥紀錄已送出！</Alert>
      <Alert type="err" show={alert === 'err'}>請填寫投藥地點與日期。</Alert>

      <FormRow label="📍 投藥地點 *">
        {pendingLoc && (
          <div className={s.pendingBadge}>📍 地圖已選：{pendingLoc.label}</div>
        )}
        <input type="text" value={loc} onChange={e => setLoc(e.target.value)}
          placeholder="例如：大同區重慶北路三段旁水溝蓋附近..." />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <FormRow label="投藥日期 *">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </FormRow>
        <FormRow label="投藥時間">
          <input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} />
        </FormRow>
      </div>

      <FormRow label="投藥單位">
        <select value={by} onChange={e => setBy(e.target.value)}>
          {Object.entries(DRUG_BY).map(([id, label]) =>
            <option key={id} value={id}>{label}</option>
          )}
        </select>
      </FormRow>

      <FormRow label="藥物外觀">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(DRUG_COLOR).map(([id, label]) => (
            <button key={id}
              className={`${s.colorPill} ${color === id ? s.colorPillSel : ''}`}
              onClick={() => setColor(id)}>{label}</button>
          ))}
        </div>
      </FormRow>

      <FormRow label="是否在貓群活動範圍內？">
        <div style={{ display: 'flex', gap: 8 }}>
          {[['yes','是 ⚠️'], ['no','否'], ['unknown','不確定']].map(([v, label]) => (
            <button key={v}
              className={`${s.yesNoBtn} ${nearCat === v ? s.yesNoBtnSel : ''}`}
              onClick={() => setNearCat(v)}>{label}</button>
          ))}
        </div>
      </FormRow>

      <FormRow label="📸 現場照片">
        <PhotoDrop label="點擊上傳投藥現場照片" photoUrl={photoUrl}
          onFile={f => setPhotoUrl(URL.createObjectURL(f))} inputId="drugPhoto" />
      </FormRow>

      <FormRow label="補充說明">
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="例如：在排水溝旁發現散落藍色藥粉，未封裝..." />
      </FormRow>

      <SubmitButton variant="drug" onClick={submit}>送出投藥紀錄</SubmitButton>

      {/* timeline */}
      <div style={{ marginTop: 24 }}>
        <SectionTitle sub={`(${drugs.length} 筆)`}>投藥時間軸</SectionTitle>
        {drugs.map(d => (
          <div key={d.id} className={s.timelineRow}>
            <div className={s.timelineDot} />
            <div style={{ flex: 1 }}>
              <div className={s.timelineTop}>
                <span className={s.timelineDate}>{d.date}{d.timeStr ? ' ' + d.timeStr : ''}</span>
                <DrugBadge>{DRUG_BY[d.by]}</DrugBadge>
                {d.color && d.color !== 'unknown' && (
                  <span className={s.colorTag}>{DRUG_COLOR[d.color]}</span>
                )}
                {d.nearCat === 'yes' && (
                  <span className={s.catWarning}>⚠️ 貓群附近</span>
                )}
              </div>
              <div className={s.timelineLoc}>📍 {d.location}</div>
              {d.desc && <div className={s.timelineDesc}>{d.desc}</div>}
              {d.photoUrl && <img src={d.photoUrl} alt="drug site" className={s.timelinePhoto} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
