import { useEffect, useState } from 'react'
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

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  return position === null ? null : <Marker position={position}></Marker>
}

export default function RiskProfile() {
  const { workshopId } = useParams()
  const [workshopName, setWorkshopName] = useState('Loading...')
  const [saving, setSaving] = useState(false)
  const [copiedLat, setCopiedLat] = useState(false)
  const [copiedLng, setCopiedLng] = useState(false)
  
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
    storm_surge: 'Safe',
    flood: 'Safe' 
  })

  useEffect(() => {
    fetchWorkshopData()
  }, [workshopId])

  const fetchWorkshopData = async () => {
    const { data: workshop } = await supabase
      .from('tbl_workshops')
      .select('*')
      .eq('id', workshopId)
      .single()

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
        storm_surge: workshop.storm_surge_risk || 'Safe',
        flood: workshop.flood_risk || 'Safe'
      })
    }
  }

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
    setSaving(true)
    const { error } = await supabase
      .from('tbl_workshops')
      .update({
        lat: position?.[0] || null,
        lng: position?.[1] || null,
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
        flood_risk: hazards.flood
      })
      .eq('id', workshopId)

    if (error) alert("Error saving profile")
    else alert("Risk Profile Updated Successfully!")
    
    setSaving(false)
  }

  const defaultCenter = [9.6015, 124.0150]

  // Refined Color Logic for a cleaner UI
  const getRiskColor = (level) => {
    if (level === 'Safe' || level === 'No immediate volcanic hazard threat') return 'text-emerald-700 font-bold bg-emerald-50/50 border-emerald-200'
    if (level === 'Unavailable') return 'text-gray-500 font-bold bg-gray-50 border-gray-200'
    if (level === 'Low') return 'text-yellow-700 font-bold bg-yellow-50/50 border-yellow-200'
    if (level === 'Medium') return 'text-orange-700 font-bold bg-orange-50/50 border-orange-200'
    if (level === 'High' || level === 'Prone' || level === 'Highly Susceptible' || level.includes('Prone')) return 'text-red-700 font-black bg-red-50/50 border-red-200'
    return 'text-[#1A2E35] bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] pb-20">
      <div className="bg-[#121212] px-6 md:px-8 py-10 md:py-12 border-b border-[#D17B57]/30">
        <div className="max-w-7xl mx-auto">
          <Link to={`/workshops/${workshopId}`} className="text-[#D17B57] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors mb-6 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back to Workshop Details
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-white font-serif uppercase tracking-widest mb-2">
            DRRM Risk Profile
          </h1>
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-bold">
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
              <p className="text-sm text-gray-500 leading-relaxed">Drop a pin on the workshop's exact roof. Use these coordinates in HazardHunterPH.</p>
            </div>

            <div className="h-[350px] md:h-[400px] w-full rounded-3xl overflow-hidden border border-[#EAE0D5] shadow-sm z-0 relative">
              <MapContainer center={position || defaultCenter} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAE0D5] shadow-sm flex flex-col gap-4">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-3 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Longitude</span>
                    <span className="text-sm font-bold text-[#1A2E35]">{position ? position[1].toFixed(6) : '---'}</span>
                  </div>
                  <button onClick={() => handleCopy('lng')} disabled={!position} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all disabled:opacity-50 ${copiedLng ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-[#1A2E35] hover:bg-gray-100 shadow-sm'}`}>
                    {copiedLng ? 'Copied' : 'Copy'}
                  </button>
               </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-3 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Latitude</span>
                    <span className="text-sm font-bold text-[#1A2E35]">{position ? position[0].toFixed(6) : '---'}</span>
                  </div>
                  <button onClick={() => handleCopy('lat')} disabled={!position} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all disabled:opacity-50 ${copiedLat ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-[#1A2E35] hover:bg-gray-100 shadow-sm'}`}>
                    {copiedLat ? 'Copied' : 'Copy'}
                  </button>
               </div>

                <button 
                onClick={handleGetLiveLocation}
                className="w-full mt-2 bg-[#1A2E35] text-white px-5 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-[#111e22] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Use Live Device GPS
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Hazard Ingestion (Col span 7) */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
                 <div className="inline-block bg-[#D17B57]/10 text-[#D17B57] px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">Step 2</div>
                 <a href="https://hazardhunter.georisk.gov.ph/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase hover:bg-blue-100 transition-all border border-blue-100">
                    Open HazardHunterPH ↗
                  </a>
              </div>
              <h2 className="text-2xl font-black text-[#1A2E35] font-serif uppercase tracking-widest mb-2">Hazard Assessment Data</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Run the exact coordinates through DOST-PHIVOLCS to determine the baseline threat levels.</p>
            </div>

            <div className="bg-white border border-[#EAE0D5] rounded-3xl p-6 md:p-10 shadow-sm flex flex-col gap-12">
               
               {/* 1. SEISMIC HAZARDS */}
               <div>
                 <h3 className="text-xs font-black text-[#1A2E35] uppercase tracking-[0.2em] border-b border-gray-100 pb-3 mb-6 flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-[#D17B57]"></span>
                   Seismic Hazard Assessment
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ground Rupture</label>
                      <select value={hazards.ground_rupture} onChange={e => setHazards({...hazards, ground_rupture: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.ground_rupture)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-red-700 font-bold bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ground Shaking</label>
                      <select value={hazards.ground_shaking} onChange={e => setHazards({...hazards, ground_shaking: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.ground_shaking)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-red-700 font-bold bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">EQ-Induced Landslide</label>
                      <select value={hazards.earthquake_induced_landslide} onChange={e => setHazards({...hazards, earthquake_induced_landslide: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.earthquake_induced_landslide)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-yellow-700 font-bold bg-white" value="Low">Low</option>
                        <option className="text-orange-700 font-bold bg-white" value="Medium">Medium</option>
                        <option className="text-red-700 font-bold bg-white" value="High">High</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Liquefaction</label>
                      <select value={hazards.liquefaction} onChange={e => setHazards({...hazards, liquefaction: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.liquefaction)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-red-700 font-bold bg-white" value="High">Highly Susceptible</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tsunami</label>
                      <select value={hazards.tsunami} onChange={e => setHazards({...hazards, tsunami: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.tsunami)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-red-700 font-bold bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
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
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nearest Active Volcano (KM)</label>
                      <input type="number" placeholder="e.g. 86.2" value={hazards.nearest_volcano_distance} onChange={e => setHazards({...hazards, nearest_volcano_distance: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Direction</label>
                      <select value={hazards.nearest_volcano_direction} onChange={e => setHazards({...hazards, nearest_volcano_direction: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer">
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
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ashfall Threat</label>
                      <select value={hazards.ashfall} onChange={e => setHazards({...hazards, ashfall: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.ashfall)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-red-700 font-bold bg-white" value="Prone">Prone</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
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
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">100-Year Flood Risk</label>
                      <select value={hazards.flood} onChange={e => setHazards({...hazards, flood: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.flood)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-yellow-700 font-bold bg-white" value="Low">Low</option>
                        <option className="text-orange-700 font-bold bg-white" value="Medium">Medium</option>
                        <option className="text-red-700 font-bold bg-white" value="High">High</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Rain-Induced Landslide (MGB)</label>
                      <select value={hazards.landslide} onChange={e => setHazards({...hazards, landslide: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.landslide)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-yellow-700 font-bold bg-white" value="Low">Low</option>
                        <option className="text-orange-700 font-bold bg-white" value="Medium">Medium</option>
                        <option className="text-red-700 font-bold bg-white" value="High">High Susceptibility</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Storm Surge (PAGASA)</label>
                      <select value={hazards.storm_surge} onChange={e => setHazards({...hazards, storm_surge: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D17B57]/30 transition-all cursor-pointer ${getRiskColor(hazards.storm_surge)}`}>
                        <option className="text-emerald-700 font-bold bg-white" value="Safe">Safe</option>
                        <option className="text-yellow-700 font-bold bg-white" value="Low">Low</option>
                        <option className="text-orange-700 font-bold bg-white" value="Medium">Medium</option>
                        <option className="text-red-700 font-bold bg-white" value="High">High</option>
                        <option className="text-gray-500 font-bold bg-white" value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                 </div>
               </div>
            </div>

            {/* Save Button */}
            <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl mt-4">
               <button 
                onClick={handleSaveProfile}
                disabled={saving || !position}
                className="w-full bg-[#D17B57] text-white px-6 py-4 md:py-5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-[#b06445] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? 'Processing...' : 'Complete Assessment'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}