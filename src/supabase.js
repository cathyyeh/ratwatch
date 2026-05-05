import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || ''
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── helpers ────────────────────────────────────────────────────────────────

export async function fetchReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(r => ({
    ...r,
    time: timeAgo(r.created_at),
  }))
}

export async function insertReport(report) {
  const { data, error } = await supabase
    .from('reports')
    .insert([report])
    .select()
    .single()
  if (error) throw error
  return { ...data, time: '剛剛' }
}

export async function fetchCats() {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(c => ({ ...c, time: timeAgo(c.created_at) }))
}

export async function insertCat(cat) {
  const { data, error } = await supabase
    .from('cats')
    .insert([cat])
    .select()
    .single()
  if (error) throw error
  return { ...data, time: '剛剛' }
}

export async function fetchDrugs() {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(d => ({ ...d, time: timeAgo(d.created_at) }))
}

export async function insertDrug(drug) {
  const { data, error } = await supabase
    .from('drugs')
    .insert([drug])
    .select()
    .single()
  if (error) throw error
  return { ...data, time: '剛剛' }
}

// ── upload photo to Supabase Storage ───────────────────────────────────────

export async function uploadPhoto(file, bucket = 'photos') {
  const ext  = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// ── util ───────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return ''
  const d = Date.now() - new Date(ts).getTime()
  if (d < 60000)     return '剛剛'
  if (d < 3600000)   return Math.floor(d / 60000)   + '分鐘前'
  if (d < 86400000)  return Math.floor(d / 3600000)  + '小時前'
  return Math.floor(d / 86400000) + '天前'
}
