import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '../supabaseClient'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function LocationMarker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export default function RiskProfile() {
  const { workshopId } = useParams()
  const [workshopName, setWorkshopName] = useState('Loading...')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [copiedLat, setCopiedLat] = useState(false)
  const [copiedLng, setCopiedLng] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [assessmentHistory, setAssessmentHistory] = useState([])
  
  const [position, setPosition] = useState(null)
  
  const [hazards, setHazards] = useState({
    ground_rupture: 'Safe',
    ground_shaking: 'Safe',
    earthquake_induced_landslide: 'Safe',
    liquefaction: 'Safe',
    tsunami: 'Safe',
    nearest_volcano_distance: '',
    nearest_volcano_direction: 'NW',
    ashfall: 'Safe',
    landslide: 'Safe',
    storm_surge: 'Safe'
  })

  const fetchCurrentRole = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const sessionUserId = sessionData?.session?.user?.id
    if (!sessionUserId) {
      setUserRole(null)
      return
    }

    const { data: roleData } = await supabase
      .from('tbl_user_profiles')
      .select('role')
      .eq('id', sessionUserId)
      .maybeSingle()

    setUserRole(roleData?.role || null)
  }

  const fetchWorkshopData = async () => {
    const { data: workshop, error: workshopError } = await supabase
      .from('tbl_workshops')
      .select('*')
      .eq('id', workshopId)
      .maybeSingle()

    if (workshopError) {
      setSaveError(workshopError.message || 'Unable to load workshop risk profile.')
      return
    }

    if (workshop) {
      setWorkshopName(workshop.name)
      if (workshop.lat && workshop.lng) {
        setPosition([workshop.lat, workshop.lng])
      }
      setHazards({
        ground_rupture: workshop.ground_rupture || 'Safe',
        ground_shaking: workshop.ground_shaking || 'Safe',
        earthquake_induced_landslide: workshop.earthquake_induced_landslide || 'Safe',
        liquefaction: workshop.liquefaction_risk || 'Safe',
        tsunami: workshop.tsunami_risk || 'Safe',
        nearest_volcano_distance: workshop.nearest_volcano_distance || '',
        nearest_volcano_direction: workshop.nearest_volcano_direction || 'NW',
        ashfall: workshop.ashfall_risk || 'Safe',
        landslide: workshop.landslide_risk || 'Safe',
        storm_surge: workshop.storm_surge_risk || 'Safe'
      })

      const { data: historyRows, error: historyFetchError } = await supabase
        .from('tbl_workshop_risk_assessments')
        .select('id, assessed_at, risk_score, risk_label, hazard_snapshot')
        .eq('workshop_id', workshopId)
        .order('assessed_at', { ascending: false })

      if (historyFetchError) {
        setSaveError(historyFetchError.message || 'Unable to load assessment history.')
      }

      setAssessmentHistory(historyRows || [])
    }
  }

  useEffect(() => {
    fetchCurrentRole()
    fetchWorkshopData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId])

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Could not get location.")
    )
  }

  const handleCopy = (type) => {
    if (!position) return
    if (type === 'lat') {
      navigator.clipboard.writeText(position[0].toFixed(6))
      setCopiedLat(true)
      setTimeout(() => setCopiedLat(false), 2000)
    } else {
      navigator.clipboard.writeText(position[1].toFixed(6))
      setCopiedLng(true)
      setTimeout(() => setCopiedLng(false), 2000)
    }
  }

  const handleSaveProfile = async () => {
    if (!isEditable) return
    setSaving(true)
    setSaveError('')

    const updatePayload = {
      ground_rupture: hazards.ground_rupture,
      ground_shaking: hazards.ground_shaking,
      earthquake_induced_landslide: hazards.earthquake_induced_landslide,
      liquefaction_risk: hazards.liquefaction,
      tsunami_risk: hazards.tsunami,
      nearest_volcano_distance: Number(hazards.nearest_volcano_distance) || 0,
      nearest_volcano_direction: hazards.nearest_volcano_direction,
      ashfall_risk: hazards.ashfall,
      landslide_risk: hazards.landslide,
      storm_surge_risk: hazards.storm_surge,
    }

    if (position) {
      updatePayload.lat = position[0]
      updatePayload.lng = position[1]
    }

    const { data: updatedWorkshop, error } = await supabase
      .from('tbl_workshops')
      .update(updatePayload)
      .eq('id', workshopId)
      .select('safety_score')
      .maybeSingle()

    if (error) {
      setSaveError(error.message || 'Unable to save risk profile.')
      alert(`Error saving profile: ${error.message || 'Unknown error'}`)
      setSaving(false)
      return
    }

    const currentScore = Number(updatedWorkshop?.safety_score || hazardRiskSummary.percent)
    const currentLabel = currentScore >= 60 ? 'High' : currentScore >= 30 ? 'Moderate' : 'Low'

    const historyPayload = {
      workshop_id: workshopId,
      assessed_at: new Date().toISOString(),
      risk_score: currentScore,
      risk_label: currentLabel,
      hazard_snapshot: {
        ground_rupture: hazards.ground_rupture,
        ground_shaking: hazards.ground_shaking,
        earthquake_induced_landslide: hazards.earthquake_induced_landslide,
        liquefaction: hazards.liquefaction,
        tsunami: hazards.tsunami,
        ashfall: hazards.ashfall,
        landslide: hazards.landslide,
        storm_surge: hazards.storm_surge,
        lat: position ? position[0] : null,
        lng: position ? position[1] : null,
      },
    }

    let { data: insertedHistory, error: historyInsertError } = await supabase
      .from('tbl_workshop_risk_assessments')
      .insert([
        historyPayload,
      ])
      .select('id, assessed_at, risk_score, risk_label, hazard_snapshot')
      .maybeSingle()

    if (historyInsertError && /hazard_snapshot|column/i.test(historyInsertError.message || '')) {
      const fallbackPayload = {
        workshop_id: workshopId,
        assessed_at: historyPayload.assessed_at,
        risk_score: currentScore,
        risk_label: currentLabel,
      }

      const fallbackRes = await supabase
        .from('tbl_workshop_risk_assessments')
        .insert([fallbackPayload])
        .select('id, assessed_at, risk_score, risk_label')
        .maybeSingle()

      insertedHistory = fallbackRes.data
      historyInsertError = fallbackRes.error
    }

    if (historyInsertError) {
      setSaveError(`Assessment was saved, but history record failed: ${historyInsertError.message}`)
      alert(`Assessment saved, but history record was not created: ${historyInsertError.message}`)
      await fetchWorkshopData()
      setSaving(false)
      return
    }

    if (insertedHistory) {
      setAssessmentHistory((prev) => [insertedHistory, ...prev])
    }

    alert('Risk Profile Updated Successfully!')
    await fetchWorkshopData()
    
    setSaving(false)
  }

  const defaultCenter = [9.6015, 124.0150]
  const isEditable = userRole === 'lgu_admin' || userRole === 'developer'

  const hazardRiskSummary = useMemo(() => {
    const keys = [
      'ground_rupture',
      'ground_shaking',
      'earthquake_induced_landslide',
      'liquefaction',
      'tsunami',
      'ashfall',
      'landslide',
      'storm_surge',
    ]

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

    keys.forEach((key) => {
      const value = hazards[key]
      if (!value || value === 'Unavailable') return
      const normalized = value.includes('Prone') ? 'Prone' : value
      const weight = riskToWeight[normalized]
      if (weight === undefined) return
      assessed += 1
      total += weight
    })

    const percent = assessed > 0 ? Math.round((total / (assessed * 3)) * 100) : 0
    let label = 'Low'
    if (percent >= 60) label = 'High'
    else if (percent >= 30) label = 'Moderate'

    return { percent, label, assessed }
  }, [hazards])

  // Refined Color Logic for a cleaner UI
  const getRiskColor = (level) => {
    if (level === 'Safe' || level === 'No immediate volcanic hazard threat') return 'text-emerald-700  bg-emerald-50/50 border-emerald-200'
    if (level === 'Unavailable') return 'text-gray-500 bg-gray-50 border-gray-200'
    if (level === 'Low') return 'text-yellow-700  bg-yellow-50/50 border-yellow-200'
    if (level === 'Medium') return 'text-orange-700  bg-orange-50/50 border-orange-200'
    if (level === 'High' || level === 'Prone' || level === 'Highly Susceptible' || level.includes('Prone')) return 'text-red-700  bg-red-50/50 border-red-200'
    return 'text-[#1A2E35] bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] pb-20 reveal-up">
      <div className="bg-[#121212] px-6 md:px-8 py-10 md:py-12 border-b border-[#D17B57]/30">
        <div className="max-w-7xl mx-auto">
          <Link to={`/workshops/${workshopId}`} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md text-[#FDF8F5] border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-black/60 transition-all">
            <svg className="w-4 h-" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Return
          </Link>
          <h1 className="forge-heading text-3xl md:text-5xl text-white mb-2">
            DRRM Risk Profile
          </h1>
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase ">
            Baseline Safety Data for <span className="text-[#FDF8F5]">{workshopName}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
          
          {/* LEFT COLUMN: Map & Geolocation (Col span 5) */}
          <div className="xl:col-span-5 flex flex-col gap-6 xl:sticky xl:top-8 self-start">
            <div>
               <div className="inline-block bg-[#D17B57]/10 text-[#D17B57] px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase mb-3">Step 1</div>
              <h2 className="text-2xl font-black text-[#1A2E35] font-serif uppercase tracking-widest mb-2">Geospatial Mapping</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Drop a pin on the workshop and use these coordinates in HazardHunterPH.</p>
            </div>

            <div className="h-[350px] md:h-[400px] w-full pandayan-curve overflow-hidden border border-[#EAE0D5] shadow-sm z-0 relative">
              <MapContainer
                center={position || defaultCenter}
                zoom={14}
                scrollWheelZoom={isEditable}
                dragging={isEditable}
                doubleClickZoom={isEditable}
                touchZoom={isEditable}
                boxZoom={isEditable}
                keyboard={isEditable}
                zoomControl={isEditable}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {isEditable && <LocationMarker setPosition={setPosition} />}
                {position && <Marker position={position}></Marker>}
              </MapContainer>
            </div>

            <div className="bg-white p-5 pandayan-curve border border-[#EAE0D5] shadow-sm flex flex-col gap-4">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-3 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Longitude</span>
                    <span className="text-sm  text-[#1A2E35]">{position ? position[1].toFixed(6) : '---'}</span>
                  </div>
                  {isEditable && (
                    <button onClick={() => handleCopy('lng')} disabled={!position} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all disabled:opacity-50 ${copiedLng ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-[#1A2E35] hover:bg-gray-100 shadow-sm'}`}>
                      {copiedLng ? 'Copied' : 'Copy'}
                    </button>
                  )}
               </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-3 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Latitude</span>
                    <span className="text-sm  text-[#1A2E35]">{position ? position[0].toFixed(6) : '---'}</span>
                  </div>
                  {isEditable && (
                    <button onClick={() => handleCopy('lat')} disabled={!position} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all disabled:opacity-50 ${copiedLat ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-[#1A2E35] hover:bg-gray-100 shadow-sm'}`}>
                      {copiedLat ? 'Copied' : 'Copy'}
                    </button>
                  )}
               </div>

               <button 
                onClick={handleGetLiveLocation}
                disabled={!isEditable}
                className="action-label w-full mt-2 bg-[#1A2E35] text-white px-5 py-4 rounded-full text-[10px] hover:bg-[#111e22] hover:scale-[1.02] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Use Device Location
              </button>
            </div>

            <div className="bg-white border border-[#EAE0D5] pandayan-curve p-5 shadow-sm">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mb-2">Hazard Risk Score</p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-3xl font-black text-[#D17B57]">{hazardRiskSummary.percent}%</p>
                <p className="action-label text-[10px] text-[#1A2E35]">{hazardRiskSummary.label} Risk</p>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">Based on {hazardRiskSummary.assessed} assessed hazard categories.</p>
            </div>

            <div className="bg-white border border-[#EAE0D5] pandayan-curve p-5 shadow-sm">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mb-3">Assessment History</p>
              {assessmentHistory.length === 0 ? (
                <p className="text-[11px] text-gray-500">No assessment records yet.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {assessmentHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                      <span className="text-[10px]  text-[#1A2E35]">
                        {new Date(entry.assessed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#D17B57]">
                        {Number(entry.risk_score || 0)}% {entry.risk_label || ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to={`/workshops/${workshopId}/risk-assessments`}
                className="mt-4 inline-flex items-center gap-2 action-label text-[10px] text-[#D17B57] hover:text-[#b06445] transition-colors"
              >
                View Full Assessment Records
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Hazard Ingestion (Col span 7) */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
                 <div className="inline-block bg-[#D17B57]/10 text-[#D17B57] px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">Step 2</div>
                 {isEditable && (
                   <a href="https://hazardhunter.georisk.gov.ph/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase hover:bg-blue-100 transition-all border border-blue-100">
                      Open HazardHunterPH ↗
                    </a>
                 )}
              </div>
              <h2 className="text-2xl font-black text-[#1A2E35] font-serif uppercase tracking-widest mb-2">Hazard Assessment Data</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Run the exact coordinates through DOST-PHIVOLCS to determine the baseline threat levels.</p>
              {!isEditable && (
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Public Read-Only View</p>
              )}
            </div>

            <div className={`bg-white border border-[#EAE0D5] pandayan-curve p-6 md:p-10 shadow-sm flex flex-col gap-12 ${!isEditable ? 'pointer-events-none select-none' : ''}`}>
               
               {/* 1. SEISMIC HAZARDS */}
               <div>
                 <h3 className="text-xs font-black text-[#1A2E35] uppercase tracking-[0.2em] border-b border-gray-100 pb-3 mb-6 flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-[#D17B57]"></span>
                   Seismic Hazard Assessment
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Ground Rupture</label>
                      <select value={hazards.ground_rupture} onChange={e => setHazards({...hazards, ground_rupture: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.ground_rupture)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-red-700  bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Ground Shaking</label>
                      <select value={hazards.ground_shaking} onChange={e => setHazards({...hazards, ground_shaking: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.ground_shaking)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-red-700  bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">EQ-Induced Landslide</label>
                      <select value={hazards.earthquake_induced_landslide} onChange={e => setHazards({...hazards, earthquake_induced_landslide: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.earthquake_induced_landslide)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-yellow-700  bg-white" value="Low">Low</option>
                        <option className="text-orange-700  bg-white" value="Medium">Medium</option>
                        <option className="text-red-700  bg-white" value="High">High</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Liquefaction</label>
                      <select value={hazards.liquefaction} onChange={e => setHazards({...hazards, liquefaction: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.liquefaction)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-red-700  bg-white" value="High">Highly Susceptible</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Tsunami</label>
                      <select value={hazards.tsunami} onChange={e => setHazards({...hazards, tsunami: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.tsunami)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-red-700  bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                 </div>
               </div>

               {/* 2. VOLCANIC HAZARDS */}
               <div>
                 <h3 className="text-xs font-black text-[#1A2E35] uppercase tracking-[0.2em] border-b border-gray-100 pb-3 mb-6 flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-[#D17B57]"></span>
                   Volcanic Hazard Assessment
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Nearest Active Volcano (KM)</label>
                      <input type="number" disabled={!isEditable} placeholder="e.g. 86.2" value={hazards.nearest_volcano_distance} onChange={e => setHazards({...hazards, nearest_volcano_distance: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all disabled:opacity-80" />
                    </div>
                    <div>
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Direction</label>
                      <select disabled={!isEditable} value={hazards.nearest_volcano_direction} onChange={e => setHazards({...hazards, nearest_volcano_direction: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-80">
                        <option value="N">North (N)</option>
                        <option value="NE">Northeast (NE)</option>
                        <option value="E">East (E)</option>
                        <option value="SE">Southeast (SE)</option>
                        <option value="S">South (S)</option>
                        <option value="SW">Southwest (SW)</option>
                        <option value="W">West (W)</option>
                        <option value="NW">Northwest (NW)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Ashfall Threat</label>
                      <select value={hazards.ashfall} onChange={e => setHazards({...hazards, ashfall: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.ashfall)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-red-700  bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                 </div>
               </div>

               {/* 3. HYDRO-MET HAZARDS */}
               <div>
                 <h3 className="text-xs font-black text-[#1A2E35] uppercase tracking-[0.2em] border-b border-gray-100 pb-3 mb-6 flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-[#D17B57]"></span>
                   Hydro-Meteorological Assessment
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Rain-Induced Landslide (MGB)</label>
                      <select value={hazards.landslide} onChange={e => setHazards({...hazards, landslide: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.landslide)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-yellow-700  bg-white" value="Low">Low</option>
                        <option className="text-orange-700  bg-white" value="Medium">Medium</option>
                        <option className="text-red-700  bg-white" value="High">High Susceptibility</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px]  text-gray-500 uppercase tracking-widest mb-2">Storm Surge (PAGASA)</label>
                      <select value={hazards.storm_surge} onChange={e => setHazards({...hazards, storm_surge: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.storm_surge)}`}>
                        <option className="text-emerald-700  bg-white" value="Safe">Safe</option>
                        <option className="text-yellow-700  bg-white" value="Low">Low</option>
                        <option className="text-orange-700  bg-white" value="Medium">Medium</option>
                        <option className="text-red-700  bg-white" value="High">High</option>
                        <option className="text-gray-500  bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                 </div>
               </div>
            </div>

            {/* Save Button */}
            {isEditable && (
              <div className="flex items-center justify-center mt-4">
                 {saveError && (
                   <p className="mb-4 text-[10px]  tracking-widest uppercase text-red-300">{saveError}</p>
                 )}
                 <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="action-label w-75 bg-[#D17B57] text-white md:py-5 rounded-full text-[10px] hover:bg-[#b06445] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {saving ? 'Processing...' : 'Complete Assessment'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}