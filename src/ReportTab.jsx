import { useState, useEffect } from 'react'
import { INCIDENT_TYPES, LOCATION_TYPES, ANIMAL_TYPES } from './data'
import { Alert, FormRow, CountPicker, PhotoDrop, SubmitButton } from './ui'
import s from './ReportTab.module.css'

export default function ReportTab({ pendingLoc, onClearLoc, onSubmit }) {
  const [type, setType] = useState(null)
  const [locType, setLocType] = useState(null)
  const [count, setCount] = useState('1')
  const [animal, setAnimal] = useState('')
  const [loc, setLoc] = useState('')
  const [desc, setDesc] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => { if (pendingLoc) setLoc(pendingLoc.label) }, [pendingLoc])

  function handlePhoto(file) {
    setPhotoUrl(URL.createObjectURL(file))
  }

  function submit() {
    if (!type || !loc.trim()) { setStatus('err'); setTimeout(() => setStatus(null), 3000); return }
    const district = pendingLoc?.label || (loc.includes('區') ? loc.match(/[\u4e00-\u9fa5]{2,3}區/)?.[0] : '中正區') || '中正區'
    onSubmit({
      type, locType: locType || 'other', location: loc.trim(), district,
      count, animal, desc, photoUrl,
      x: pendingLoc?.x || Math.round(50 + Math.random() * 580),
      y: pendingLoc?.y || Math.round(30 + Math.random() * 260),
    })
    setStatus('ok'); setTimeout(() => setStatus(null), 3000)
    setType(null); setLocType(null); setCount('1'); setAnimal(''); setDesc(''); setPhotoUrl(null); setLoc('')
    onClearLoc()
  }

  return (
    <div className="fade-in">
      <Alert type="ok" show={status === 'ok'}>✓ 通報已送出，感謝您的貢獻！</Alert>
      <Alert type="err" show={status === 'err'}>請選擇事件類型並填寫位置。</Alert>

      {/* incident type */}
      <FormRow label="事件類型 *">
        <div className={s.typeGrid}>
          {Object.entries(INCIDENT_TYPES).map(([id, t]) => (
            <button key={id} className={`${s.typeBtn} ${type === id ? s.typeBtnSel : ''}`}
              style={type === id ? { borderColor: t.color, background: t.bg } : {}}
              onClick={() => { setType(id) }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              <span className={s.typeName}>{t.label}</span>
              <span className={s.typeEn}>{t.labelEn}</span>
            </button>
          ))}
        </div>
      </FormRow>

      {/* location type */}
      <FormRow label="地點類型" hint="(有助分析高風險場所)">
        <div className={s.pillWrap}>
          {Object.entries(LOCATION_TYPES).map(([id, lt]) => (
            <button key={id}
              className={`${s.locPill} ${locType === id ? s.locPillSel : ''}`}
              onClick={() => setLocType(id)}>
              {lt.icon} {lt.label}
            </button>
          ))}
        </div>
      </FormRow>

      {/* location */}
      <FormRow label="位置 *" hint="(在地圖點選後自動填入，或直接輸入地址)">
        {pendingLoc && (
          <div className={s.pendingBadge}>
            <span>📍 地圖已選：{pendingLoc.label}</span>
            <button onClick={onClearLoc} className={s.clearBtn}>×</button>
          </div>
        )}
        <input type="text" value={loc} onChange={e => setLoc(e.target.value)}
          placeholder="例如：大同區重慶北路二段旁巷子..." />
      </FormRow>

      {/* animal (only if poisoned) */}
      {type === 'poisoned' && (
        <FormRow label="受毒動物種類">
          <select value={animal} onChange={e => setAnimal(e.target.value)}>
            <option value="">— 請選擇 —</option>
            {Object.entries(ANIMAL_TYPES).map(([id, label]) =>
              <option key={id} value={id}>{label}</option>
            )}
          </select>
        </FormRow>
      )}

      <FormRow label="數量估計">
        <CountPicker value={count} onChange={setCount} />
      </FormRow>

      <FormRow label="📸 照片上傳" hint="(有助判斷嚴重程度)">
        <PhotoDrop label="點擊上傳照片（jpg / png）" photoUrl={photoUrl}
          onFile={handlePhoto} inputId="rPhoto" />
      </FormRow>

      <FormRow label="補充說明">
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="例如：在巷子入口發現3隻死鼠，旁邊有散落的藍色藥粉..." />
      </FormRow>

      <div className={s.hotlineTip}>
        📞 嚴重鼠患請撥台北市政府 <strong>1999</strong> 或衛生局 <strong>02-2375-3782</strong>
      </div>

      <SubmitButton onClick={submit}>送出通報</SubmitButton>
    </div>
  )
}
