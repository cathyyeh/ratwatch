import { INCIDENT_TYPES, LOCATION_TYPES, CAT_STATUS } from './data'
import s from './ui.module.css'

export function Badge({ type }) {
  const m = INCIDENT_TYPES[type]
  if (!m) return null
  return (
    <span className={s.badge} style={{ background: m.bg, color: m.text }}>
      {m.icon} {m.label}
    </span>
  )
}

export function LocBadge({ locType }) {
  const m = LOCATION_TYPES[locType]
  if (!m) return null
  return <span className={s.locBadge}>{m.icon} {m.label}</span>
}

export function CatStatusBadge({ status }) {
  const m = CAT_STATUS[status]
  if (!m) return null
  return (
    <span className={s.badge} style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

export function DrugBadge({ children }) {
  return <span className={s.drugBadge}>{children}</span>
}

export function Alert({ type, children, show }) {
  if (!show) return null
  return (
    <div className={`${s.alert} ${type === 'ok' ? s.alertOk : s.alertErr}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, sub }) {
  return (
    <div className={s.sectionTitle}>
      <span>{children}</span>
      {sub && <span className={s.sectionSub}>{sub}</span>}
    </div>
  )
}

export function PhotoDrop({ label, photoUrl, onFile, inputId }) {
  return (
    <div>
      <div
        className={s.photoDrop}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {photoUrl ? `📸 已上傳` : label}
      </div>
      <input
        type="file"
        id={inputId}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      {photoUrl && (
        <img
          src={photoUrl}
          alt="preview"
          style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '0.5px solid var(--border)' }}
        />
      )}
    </div>
  )
}

export function FormRow({ label, hint, children }) {
  return (
    <div className={s.formRow}>
      <label className={s.formLabel}>
        {label}
        {hint && <span className={s.formHint}> {hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function CountPicker({ value, onChange }) {
  const options = ['1', '2-5', '6-10', '10+']
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`${s.countBtn} ${value === o ? s.countBtnSel : ''}`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function Pill({ children, active, onClick, activeClass }) {
  return (
    <button
      className={`${s.pill} ${active ? (activeClass || s.pillActive) : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function SubmitButton({ children, onClick, variant }) {
  const variantStyle = {
    cat:  { background: '#964B8C' },
    drug: { background: '#B03A2E' },
  }[variant] || {}
  return (
    <button className={s.submitBtn} style={variantStyle} onClick={onClick}>
      {children}
    </button>
  )
}

export function InfoBox({ color, bg, border, children }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: bg,
      border: `0.5px solid ${border}`,
      borderRadius: 8,
      marginBottom: 14,
      fontSize: 12,
      color,
      lineHeight: 1.7,
    }}>
      {children}
    </div>
  )
}
