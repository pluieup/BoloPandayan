import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const HAZARD_LABELS = [
  ['ground_rupture', 'Ground Rupture'],
  ['ground_shaking', 'Ground Shaking'],
  ['earthquake_induced_landslide', 'EQ-Induced Landslide'],
  ['liquefaction', 'Liquefaction'],
  ['tsunami', 'Tsunami'],
  ['ashfall', 'Ashfall Threat'],
  ['landslide', 'Rain-Induced Landslide'],
  ['storm_surge', 'Storm Surge'],
]

function getRiskBadge(level) {
  if (!level || level === 'Unavailable') return 'text-gray-500 bg-gray-100 border-gray-200'
  if (level === 'Safe') return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (level === 'Low') return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  if (level === 'Medium') return 'text-orange-700 bg-orange-50 border-orange-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

export default function RiskAssessmentRecords() {
  const { workshopId } = useParams()
  const [workshopName, setWorkshopName] = useState('Loading...')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    assessed_at: '',
    hazard_snapshot: {
      ground_rupture: 'Unavailable',
      ground_shaking: 'Unavailable',
      earthquake_induced_landslide: 'Unavailable',
      liquefaction: 'Unavailable',
      tsunami: 'Unavailable',
      ashfall: 'Unavailable',
      landslide: 'Unavailable',
      storm_surge: 'Unavailable',
    },
  })

  useEffect(() => {
    const run = async () => {
      setLoading(true)

      const [{ data: sessionData }, workshopRes, recordsRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('tbl_workshops').select('name').eq('id', workshopId).maybeSingle(),
        supabase
          .from('tbl_workshop_risk_assessments')
          .select('id, assessed_at, risk_score, risk_label, hazard_snapshot')
          .eq('workshop_id', workshopId)
          .order('assessed_at', { ascending: false }),
      ])

      if (workshopRes.data?.name) {
        setWorkshopName(workshopRes.data.name)
      } else {
        setWorkshopName('Workshop')
      }

      setRecords(recordsRes.data || [])

      const sessionUserId = sessionData?.session?.user?.id
      if (sessionUserId) {
        const { data: roleData } = await supabase
          .from('tbl_user_profiles')
          .select('role')
          .eq('id', sessionUserId)
          .maybeSingle()
        setUserRole(roleData?.role || null)
      } else {
        setUserRole(null)
      }

      setLoading(false)
    }

    if (workshopId) run()
  }, [workshopId])

  const isEditable = useMemo(() => userRole === 'lgu_admin' || userRole === 'developer', [userRole])

  const calculateRiskFromSnapshot = (snapshot) => {
    const riskToWeight = {
      Safe: 0,
      Low: 1,
      Medium: 2,
      High: 3,
      Prone: 3,
      'Highly Susceptible': 3,
    }

    let assessed = 0
    let total = 0

    HAZARD_LABELS.forEach(([key]) => {
      const rawValue = snapshot?.[key]
      if (!rawValue || rawValue === 'Unavailable') return
      const normalized = rawValue.includes('Prone') ? 'Prone' : rawValue
      const value = riskToWeight[normalized]
      if (value === undefined) return
      total += value
      assessed += 1
    })

    const score = assessed > 0 ? Math.round((total / (assessed * 3)) * 100) : 0
    const label = score >= 60 ? 'High' : score >= 30 ? 'Moderate' : 'Low'
    return { score, label }
  }

  const openEditModal = (record) => {
    if (!isEditable) return
    setEditingRecordId(record.id)
    setFormData({
      assessed_at: new Date(record.assessed_at).toISOString().slice(0, 16),
      hazard_snapshot: {
        ground_rupture: record.hazard_snapshot?.ground_rupture || 'Unavailable',
        ground_shaking: record.hazard_snapshot?.ground_shaking || 'Unavailable',
        earthquake_induced_landslide: record.hazard_snapshot?.earthquake_induced_landslide || 'Unavailable',
        liquefaction: record.hazard_snapshot?.liquefaction || 'Unavailable',
        tsunami: record.hazard_snapshot?.tsunami || 'Unavailable',
        ashfall: record.hazard_snapshot?.ashfall || 'Unavailable',
        landslide: record.hazard_snapshot?.landslide || 'Unavailable',
        storm_surge: record.hazard_snapshot?.storm_surge || 'Unavailable',
      },
    })
    setIsModalOpen(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!isEditable || !editingRecordId) return
    setSaving(true)

    const { score, label } = calculateRiskFromSnapshot(formData.hazard_snapshot)

    const { data, error } = await supabase
      .from('tbl_workshop_risk_assessments')
      .update({
        assessed_at: new Date(formData.assessed_at).toISOString(),
        hazard_snapshot: formData.hazard_snapshot,
        risk_score: score,
        risk_label: label,
      })
      .eq('id', editingRecordId)
      .select('id, assessed_at, risk_score, risk_label, hazard_snapshot')
      .maybeSingle()

    if (error) {
      alert(`Failed to update assessment: ${error.message}`)
      setSaving(false)
      return
    }

    setRecords((prev) => {
      const next = prev.map((record) => (record.id === editingRecordId ? data : record))
      next.sort((a, b) => new Date(b.assessed_at) - new Date(a.assessed_at))
      return next
    })

    setIsModalOpen(false)
    setEditingRecordId(null)
    setSaving(false)
  }

  const handleDeleteRecord = async () => {
    if (!isEditable || !editingRecordId) return
    const confirmed = window.confirm('Delete this assessment record? This cannot be undone.')
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase
      .from('tbl_workshop_risk_assessments')
      .delete()
      .eq('id', editingRecordId)

    if (error) {
      alert(`Failed to delete assessment: ${error.message}`)
      setDeleting(false)
      return
    }

    setRecords((prev) => prev.filter((record) => record.id !== editingRecordId))
    setIsModalOpen(false)
    setEditingRecordId(null)
    setDeleting(false)
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="bg-[#0A0A0A] px-6 md:px-8 py-10 md:py-12 border-b border-[#D17B57]/30">
        <div className="max-w-7xl mx-auto">
          <Link to={`/workshops/${workshopId}`} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md text-[#FDF8F5] border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-black/60 transition-all mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 className="forge-heading text-3xl md:text-5xl text-white mb-2">Risk Assessment Records</h1>
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase">Hazard level snapshots for <span className="text-[#FDF8F5]">{workshopName}</span></p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-[10px] text-[#4A3224]/70 uppercase tracking-widest font-black">Public read-only archive</p>
          {isEditable && (
            <Link to={`/admin/workshops/${workshopId}/risk-profile`} className="action-label text-[10px] px-5 py-3 rounded-full bg-[#D17B57] text-white hover:bg-[#b06445] hover:scale-[1.02] transition-all">
              Assess now
            </Link>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-[#EAE0D5] pandayan-curve p-10 text-center">
            <p className="action-label text-[10px] text-[#4A3224]/70 loading-pulse">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white border border-[#EAE0D5] pandayan-curve p-10 text-center">
            <p className="text-sm text-[#4A3224]">No assessment records yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record) => {
              const snapshot = record.hazard_snapshot || {}
              return (
                <article key={record.id} className="bg-white border border-[#EAE0D5] pandayan-curve p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 border-b border-[#EAD6CA] pb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Assessment Date</p>
                      <h2 className="text-xl md:text-2xl font-black text-[#4A3224] font-serif">
                        {new Date(record.assessed_at).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-[#D17B57]">{Math.round(Number(record.risk_score || 0))}%</span>
                      <span className="action-label text-[10px] text-[#1A1A1A]">{record.risk_label || 'Low'} Risk</span>
                    </div>
                  </div>

                  {isEditable && (
                    <div className="mb-5 flex justify-end">
                      <button
                        onClick={() => openEditModal(record)}
                        className="action-label text-[10px] px-4 py-2 rounded-full bg-[#4A3224] text-white hover:bg-[#D17B57] transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {HAZARD_LABELS.map(([key, label]) => {
                      const level = snapshot[key] || 'Unavailable'
                      return (
                        <div key={key} className="rounded-2xl border border-[#EAE0D5] bg-[#FDF8F5] px-4 py-3 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#4A3224] uppercase tracking-wider font-black">{label}</span>
                          <span className={`text-[10px] uppercase tracking-widest font-black border rounded-full px-3 py-1 ${getRiskBadge(level)}`}>
                            {level}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {isModalOpen && isEditable && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl bg-white pandayan-curve border border-[#EAE0D5] shadow-2xl overflow-hidden">
            <div className="bg-[#0A0A0A] px-6 py-4 flex items-center justify-between">
              <h3 className="action-label text-[10px] text-white">Edit Assessment Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">Assessment Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.assessed_at}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assessed_at: e.target.value }))}
                  className="w-full border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {HAZARD_LABELS.map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">{label}</label>
                    <select
                      value={formData.hazard_snapshot[key]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hazard_snapshot: { ...prev.hazard_snapshot, [key]: e.target.value },
                        }))
                      }
                      className="w-full border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30"
                    >
                      <option value="Unavailable">Unavailable</option>
                      <option value="Safe">Safe</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Prone">Prone</option>
                      <option value="Highly Susceptible">Highly Susceptible</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteRecord}
                  className="action-label text-[10px] px-5 py-3 rounded-full border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Record'}
                </button>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="action-label text-[10px] px-5 py-3 rounded-full border border-[#EAE0D5] text-[#4A3224] hover:bg-[#FDF8F5]">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="action-label text-[10px] px-5 py-3 rounded-full bg-[#D17B57] text-white hover:bg-[#b06445] disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
