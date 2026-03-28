import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function DamageReports() {
  const { workshopId } = useParams()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [workshopName, setWorkshopName] = useState('Loading...')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    incident_date: '',
    disaster_type: 'Typhoon',
    description: '',
    estimated_cost: '',
    admin_notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [workshopId])

  const fetchData = async () => {
    setLoading(true)
    
    // Get Workshop Name for the header
    const { data: workshop } = await supabase
      .from('tbl_workshops')
      .select('name')
      .eq('id', workshopId)
      .single()
      
    if (workshop) setWorkshopName(workshop.name)

    // Get Reports
    const { data: reportData } = await supabase
      .from('tbl_damage_reports')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('incident_date', { ascending: false })

    if (reportData) setReports(reportData)
    setLoading(false)
  }

  // Calculate total damages
  const totalEstimatedDamage = useMemo(() => {
    return reports.reduce((sum, report) => sum + Number(report.estimated_cost || 0), 0)
  }, [reports])


  const openModal = (report = null) => {
    if (report) {
      setEditingId(report.id)
      setFormData({
        incident_date: report.incident_date,
        disaster_type: report.disaster_type,
        description: report.description,
        estimated_cost: report.estimated_cost,
        admin_notes: report.admin_notes || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        incident_date: new Date().toISOString().split('T')[0],
        disaster_type: 'Typhoon',
        description: '',
        estimated_cost: '',
        admin_notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    const payload = {
      workshop_id: workshopId,
      incident_date: formData.incident_date,
      disaster_type: formData.disaster_type,
      description: formData.description,
      estimated_cost: Number(formData.estimated_cost),
      admin_notes: formData.admin_notes
    }

    if (editingId) {
      await supabase.from('tbl_damage_reports').update(payload).eq('id', editingId)
    } else {
      await supabase.from('tbl_damage_reports').insert([payload])
    }

    setIsModalOpen(false)
    fetchData()
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {/* Header */}
      <div className="bg-[#121212] px-8 py-12 border-b border-[#D17B57]/30">
        <div className="max-w-6xl mx-auto">
          <Link to={`/workshops/${workshopId}`} className="text-[#D17B57] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors mb-6 inline-block">
            ← Return to Workshop Page
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
                <h1 className="text-4xl md:text-5xl font-black text-white font-serif uppercase tracking-widest mb-2">
                  Disaster Records
                </h1>
                <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-bold">
                  Status & Needs for <span className="text-[#FDF8F5]">{workshopName}</span>
                </p>
             </div>
             
             {/* Total Damages Summary Card */}
             <div className="bg-red-950/40 border border-red-900/50 rounded-2xl px-8 py-4 text-right">
                <p className="text-[10px] text-red-300 uppercase tracking-widest font-black mb-1">Total Estimated Recovery</p>
                <p className="text-2xl font-black text-white">PHP {totalEstimatedDamage.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 py-12">
        <div className="flex justify-between items-center mb-10 border-b border-[#EAE0D5] pb-6">
          <h2 className="text-2xl font-black text-[#1A2E35] font-serif uppercase tracking-widest">Incident Log</h2>
          <button 
            onClick={() => openModal()}
            className="bg-[#D17B57] text-white px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-[#b06445] transition-all shadow-lg"
          >
            + File New Report
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 font-bold uppercase text-xs">Retrieving records...</p>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-[#EAE0D5] rounded-3xl p-16 text-center shadow-sm">
             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-2">No Incidents Logged</p>
            <p className="text-gray-500 text-xs">This workshop currently has no recorded disaster damage.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div 
                key={report.id} 
                onClick={() => openModal(report)}
                className="bg-white border border-[#EAE0D5] rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-[#D17B57]/30 transition-all cursor-pointer group flex flex-col md:flex-row gap-8"
              >
                {/* Left Column: Dates & Type */}
                <div className="md:w-1/4 border-b md:border-b-0 md:border-r border-[#EAE0D5] pb-6 md:pb-0 md:pr-6">
                   <span className="inline-block bg-red-50 text-red-700 border border-red-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      {report.disaster_type}
                    </span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Date of Incident</p>
                    <h3 className="text-lg font-black text-[#1A2E35] uppercase tracking-wide">
                      {new Date(report.incident_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                </div>

                {/* Middle Column: Description */}
                <div className="md:w-2/4">
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2">Damage Description</p>
                   <p className="text-gray-700 text-sm leading-relaxed">{report.description}</p>
                   
                   {report.admin_notes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                         <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mb-1">Admin Notes</p>
                         <p className="text-gray-600 text-xs italic">{report.admin_notes}</p>
                      </div>
                   )}
                </div>

                {/* Right Column: Cost */}
                <div className="md:w-1/4 text-left md:text-right pt-4 md:pt-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Est. Repair Cost</p>
                    <p className="text-2xl font-black text-[#D17B57]">PHP {report.estimated_cost?.toLocaleString() || '0'}</p>
                    
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                       <span className="text-[9px] font-black text-[#D17B57] uppercase tracking-widest bg-[#FDF8F5] px-3 py-1.5 rounded-md">Edit Record →</span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#EAE0D5]">
            <div className="bg-[#121212] px-8 py-5 border-b border-[#D17B57]/30 flex justify-between items-center">
              <h3 className="text-white font-black uppercase tracking-widest text-sm">
                {editingId ? 'Edit Damage Record' : 'File New Damage Record'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#D17B57] transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Date of Incident</label>
                  <input type="date" required value={formData.incident_date} onChange={e => setFormData({...formData, incident_date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57] focus:ring-1 focus:ring-[#D17B57]/20 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Disaster Type</label>
                  <select value={formData.disaster_type} onChange={e => setFormData({...formData, disaster_type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57] focus:ring-1 focus:ring-[#D17B57]/20 transition-all">
                    <option>Typhoon</option>
                    <option>Flood</option>
                    <option>Landslide</option>
                    <option>Fire</option>
                    <option>Earthquake</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Detailed Description of Damage</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g., Roof collapsed over the forge area, ruining two anvils..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57] focus:ring-1 focus:ring-[#D17B57]/20 transition-all"></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Estimated Cost to Fix (PHP)</label>
                <div className="relative">
                   <span className="absolute left-4 top-3 text-gray-400 font-bold">₱</span>
                   <input type="number" required value={formData.estimated_cost} onChange={e => setFormData({...formData, estimated_cost: e.target.value})} placeholder="50000" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#D17B57] focus:ring-1 focus:ring-[#D17B57]/20 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Admin Notes (Internal Use Only)</label>
                <textarea rows="2" value={formData.admin_notes} onChange={e => setFormData({...formData, admin_notes: e.target.value})} placeholder="Funding request sent to DOST..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57] focus:ring-1 focus:ring-[#D17B57]/20 transition-all"></textarea>
              </div>

              <div className="pt-6 flex gap-4 border-t border-[#EAE0D5]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-[#1A2E35] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#111e22] transition-colors shadow-lg">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}