import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '../supabaseClient'

// Fix for default Leaflet marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component that lets the admin click the map to drop a pin
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export default function RiskProfile() {
  const { workshopId } = useParams()
  const [workshopName, setWorkshopName] = useState('Loading...')
  const [saving, setSaving] = useState(false)
  
  // DRRM State
  const [position, setPosition] = useState(null) // [lat, lng]
  const [hazards, setHazards] = useState({
    flood: 'Low',
    landslide: 'Safe',
    storm_surge: 'Low'
  })

  useEffect(() => {
    fetchWorkshopData()
  }, [workshopId])

  const fetchWorkshopData = async () => {
    const { data: workshop } = await supabase
      .from('tbl_workshops')
      .select('name, lat, lng, flood_risk, landslide_risk, storm_surge_risk')
      .eq('id', workshopId)
      .single()

    if (workshop) {
      setWorkshopName(workshop.name)
      if (workshop.lat && workshop.lng) {
        setPosition([workshop.lat, workshop.lng])
      }
      if (workshop.flood_risk) {
        setHazards({
          flood: workshop.flood_risk,
          landslide: workshop.landslide_risk || 'Safe',
          storm_surge: workshop.storm_surge_risk || 'Low'
        })
      }
    }
  }

  // HTML5 Geolocation to get admin's live physical location
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        alert("Could not get location. Please click on the map manually.")
      }
    )
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    
    // We will update the workshop table with the baseline safety data
    const { error } = await supabase
      .from('tbl_workshops')
      .update({
        lat: position?.[0] || null,
        lng: position?.[1] || null,
        flood_risk: hazards.flood,
        landslide_risk: hazards.landslide,
        storm_surge_risk: hazards.storm_surge
      })
      .eq('id', workshopId)

    if (error) {
      alert("Error saving profile")
    } else {
      alert("Risk Profile Updated Successfully!")
    }
    setSaving(false)
  }

  // Initial center point for the map (Set to Loay, Bohol coordinates)
  const defaultCenter = [9.6015, 124.0150]

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {/* Header */}
      <div className="bg-[#121212] px-8 py-10 border-b border-[#D17B57]/30">
        <div className="max-w-5xl mx-auto">
          <Link to={`/admin/workshops/${workshopId}`} className="text-[#D17B57] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors mb-4 inline-block">
            ← Back to Workshop Details
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white font-serif uppercase tracking-widest mb-2">
            DRRM Risk Profile
          </h1>
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-bold">
            Baseline Safety Data for <span className="text-[#FDF8F5]">{workshopName}</span>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Side: The Interactive Map */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-black text-[#1A2E35] font-serif uppercase tracking-widest mb-1">Geospatial Mapping</h2>
              <p className="text-xs text-gray-500 font-medium">Click on the map to drop a pin on the workshop's exact roof, or use your live GPS if you are on-site.</p>
            </div>

            <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-[#EAE0D5] shadow-sm z-0 relative">
              <MapContainer 
                center={position || defaultCenter} 
                zoom={14} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#EAE0D5]">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {position ? `LAT: ${position[0].toFixed(5)} | LNG: ${position[1].toFixed(5)}` : 'No coordinates set'}
              </div>
              <button 
                onClick={handleGetLiveLocation}
                className="bg-[#1A2E35] text-white px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase hover:bg-[#111e22] transition-colors"
              >
                📍 Use Live GPS
              </button>
            </div>
          </div>

          {/* Right Side: Hazard Dropdowns and Saving */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-black text-[#1A2E35] font-serif uppercase tracking-widest mb-1">Hazard Ingestion</h2>
              <p className="text-xs text-gray-500 font-medium">Copy the coordinates above into HazardHunterPH, then record the specific risk levels here.</p>
            </div>

            <div className="bg-white border border-[#EAE0D5] rounded-2xl p-8 shadow-sm flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-black text-[#D17B57] uppercase tracking-widest mb-2">100-Year Flood Risk</label>
                <select 
                  value={hazards.flood} 
                  onChange={e => setHazards({...hazards, flood: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57]"
                >
                  <option>Safe</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#D17B57] uppercase tracking-widest mb-2">Rain-Induced Landslide Risk</label>
                <select 
                  value={hazards.landslide} 
                  onChange={e => setHazards({...hazards, landslide: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57]"
                >
                  <option>Safe</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#D17B57] uppercase tracking-widest mb-2">Storm Surge Risk</label>
                <select 
                  value={hazards.storm_surge} 
                  onChange={e => setHazards({...hazards, storm_surge: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57]"
                >
                  <option>Safe</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            {/* Save Action Area */}
            <div className="bg-[#1A1A1A] p-6 rounded-2xl flex flex-col items-center text-center gap-4 shadow-xl">
               <p className="text-gray-400 text-xs font-medium">Saving these baseline metrics will automatically recalculate the workshop's Total Risk Score in the database.</p>
               <button 
                onClick={handleSaveProfile}
                disabled={saving || !position}
                className="w-full bg-[#D17B57] text-white px-6 py-4 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-[#b06445] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Lock in Safety Profile'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}