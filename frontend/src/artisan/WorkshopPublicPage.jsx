import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '../supabaseClient'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function WorkshopPublicPage() {
  const { workshopId } = useParams()
  const [loading, setLoading] = useState(true)
  const [workshop, setWorkshop] = useState(null)
  const [artisans, setArtisans] = useState([])
  const [products, setProducts] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [latestRiskRecord, setLatestRiskRecord] = useState(null)
  const [selectedArtisan, setSelectedArtisan] = useState(null)
  const [isArtisanModalOpen, setIsArtisanModalOpen] = useState(false)

  useEffect(() => {
    const fetchWorkshopPage = async () => {
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
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

      const { data: workshopData, error: workshopError } = await supabase
        .from('tbl_workshops')
        .select('id, name, address, description, banner_url, owner_id, created_at, safety_score, lat, lng')
        .eq('id', workshopId)
        .maybeSingle()

      if (workshopError) {
        setLoading(false)
        return
      }

      setWorkshop(workshopData)

      const { data: latestRiskData } = await supabase
        .from('tbl_workshop_risk_assessments')
        .select('id, assessed_at, risk_score, risk_label, hazard_snapshot')
        .eq('workshop_id', workshopId)
        .order('assessed_at', { ascending: false })
        .limit(1)

      setLatestRiskRecord((latestRiskData && latestRiskData[0]) || null)

      const { data: artisanData, error: artisanError } = await supabase
        .from('tbl_user_profiles')
        .select('id, full_name, workshop_id, account_status, profile_photo_url, bio')
        .eq('role', 'artisan')
        .eq('workshop_id', workshopId)
        .in('account_status', ['approved', 'Approved'])
        .order('created_at', { ascending: true })

      if (!artisanError) {
        setArtisans(artisanData || [])
      }

      if ((artisanData || []).length > 0) {
        const { data: productData, error: productError } = await supabase
          .from('tbl_products')
          .select('id, name, image_url, price, description, blade_material, handle_material, workshop_id, created_at')
          .eq('workshop_id', workshopId)
          .order('created_at', { ascending: false })

        if (!productError) {
          setProducts(productData || [])
        }
      } else {
        setProducts([])
      }

      setLoading(false)
    }

    if (workshopId) fetchWorkshopPage()
  }, [workshopId])

// Pull directly from the workshop Source of Truth
  const title = useMemo(() => {
    return workshop?.name || 'Workshop'
  }, [workshop])

  const address = useMemo(() => {
    return workshop?.address || 'Address not available'
  }, [workshop])

  const description = useMemo(() => {
    return workshop?.description || 'No workshop description has been published yet.'
  }, [workshop])

  const bannerUrl = useMemo(() => {
    return workshop?.banner_url || '/assets/Background.png'
  }, [workshop])

  const riskScore = useMemo(() => {
    if (latestRiskRecord?.risk_score !== null && latestRiskRecord?.risk_score !== undefined) {
      return Math.round(Number(latestRiskRecord.risk_score || 0))
    }
    return Math.round(Number(workshop?.safety_score || 0))
  }, [latestRiskRecord, workshop])

  const riskLabel = useMemo(() => {
    if (latestRiskRecord?.risk_label) return latestRiskRecord.risk_label
    if (riskScore >= 60) return 'High'
    if (riskScore >= 30) return 'Moderate'
    return 'Low'
  }, [latestRiskRecord, riskScore])

  const riskAssessedDate = useMemo(() => {
    if (!latestRiskRecord?.assessed_at) return null
    return new Date(latestRiskRecord.assessed_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [latestRiskRecord])

  const mapLat = useMemo(() => {
    return parseFloat(latestRiskRecord?.hazard_snapshot?.lat || workshop?.lat || 9.6053)
  }, [latestRiskRecord, workshop])

  const mapLng = useMemo(() => {
    return parseFloat(latestRiskRecord?.hazard_snapshot?.lng || workshop?.lng || 124.0135)
  }, [latestRiskRecord, workshop])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#FDF8F5] uppercase tracking-widest text-xs font-black">
        Loading Workshop...
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-center p-8">
        <h2 className="text-3xl font-black text-white uppercase mb-3">Workshop Not Found</h2>
        <p className="text-gray-400 text-sm mb-8">This workshop may have been removed or is still awaiting approval.</p>
        <Link to="/" className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md text-[#FDF8F5] border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-black/60 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Return
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <header className="relative h-72 sm:h-80 md:h-[28rem] lg:h-[32rem] overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${bannerUrl})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F5] via-[#121212]/40 to-transparent"></div>

        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
          <Link to="/" className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/40 backdrop-blur-md text-[#FDF8F5] border border-white/10 text-[9px] sm:text-[10px] font-black tracking-widest uppercase hover:bg-black/60 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Return
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 md:p-12 lg:p-16">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white font-serif uppercase tracking-tight mb-2 sm:mb-4 drop-shadow-sm break-words">
            {title}
          </h1>
          <p className="text-[#D17B57] font-black text-black text-[9px] sm:text-[10px] md:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase flex items-center gap-2 sm:gap-3 break-words">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {address}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-12 md:py-16 reveal-up">
        
        <section className="mb-16 sm:mb-20 max-w-4xl relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[2px] w-12 bg-[#D17B57]"></div>
            <h2 className="text-sm font-black text-[#D17B57] uppercase tracking-[0.3em]">The Legacy</h2>
          </div>
          <p className="text-[#4A3224] text-base sm:text-lg md:text-xl leading-relaxed font-serif whitespace-pre-wrap">
            {description}
          </p>

          <div className="mt-8 inline-flex flex-col sm:flex-row sm:items-center gap-4 pandayan-curve border border-[#EAD6CA] bg-white px-5 sm:px-6 py-4 sm:py-5 shadow-sm w-full sm:w-auto">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Workshop Risk Profile</p>
              <p className="text-2xl font-black text-[#D17B57]">{riskScore}%</p>
              {riskAssessedDate && (
                <p className="text-[10px] text-gray-500 mt-1">Latest assessed: {riskAssessedDate}</p>
              )}
            </div>
            <div className="h-px w-full sm:w-px sm:h-10 bg-[#EAD6CA]"></div>
            <p className="action-label text-[10px] text-[#1A1A1A]">{riskLabel} Risk</p>
          </div>

          <div className="mt-12 pt-8 border-t border-[#D17B57]/20 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {(userRole === 'lgu_admin' || userRole === 'developer') && (
                <Link
                  to={`/risk-profile/${workshop.id}`}
                  className="action-label flex-1 inline-flex items-center justify-center gap-3 py-4 px-6 bg-white border border-[#D17B57]/30 text-[#D17B57] rounded-full text-[10px] hover:bg-[#D17B57] hover:text-white hover:scale-[1.02] transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  Risk Profile Map
                </Link>
              )}

              <Link
                to={`/workshops/${workshop.id}/risk-assessments`}
                className="action-label flex-1 inline-flex items-center justify-center gap-3 py-4 px-6 bg-white border border-[#4A3224]/20 text-[#4A3224] rounded-full text-[10px] hover:bg-[#4A3224] hover:text-white hover:scale-[1.02] transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Assessment Records
              </Link>

              <Link
                to={`/workshops/${workshop.id}/damage-reports`}
                className="action-label flex-1 inline-flex items-center justify-center gap-3 py-4 px-6 bg-[#1A1A1A] border border-[#1A1A1A] text-white rounded-full text-[10px] hover:bg-[#D17B57] hover:border-[#D17B57] hover:scale-[1.02] transition-all shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Disaster Records
              </Link>
            </div>

          </div>

          {/* Workshop Location Map - Only shown if an assessment record exists */}
          {latestRiskRecord && (
            <div className="mt-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[2px] w-12 bg-[#D17B57]"></div>
                <h2 className="text-sm font-black text-[#D17B57] uppercase tracking-[0.3em] font-sans">Workshop Location</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-[#8B5E3C] text-xs uppercase tracking-widest font-black font-sans">
                  Coordinates captured during Risk Assessment
                </p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D17B57]/30 text-[#D17B57] rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-[#D17B57] hover:text-white transition-all shadow-sm w-fit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Open in Google Maps
                </a>
              </div>
              
              <div className="rounded-2xl overflow-hidden shadow-lg border border-[#EAD6CA] h-[280px] sm:h-[340px] md:h-[400px] z-0 relative">
                <MapContainer
                  center={[mapLat, mapLng]}
                  zoom={((latestRiskRecord?.hazard_snapshot?.lat) || workshop?.lat) ? 15 : 12}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[mapLat, mapLng]} />
                </MapContainer>
              </div>
            </div>
          )}
        </section>

        <section className="mb-20 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] font-serif uppercase tracking-widest mb-8 sm:mb-10">Master Artisans</h2>
          {artisans.length === 0 ? (
            <p className="text-sm text-[#8B5E3C] italic font-serif">The artisan roster is currently being updated...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((artisan) => (
                <div 
                  key={artisan.id} 
                  onClick={() => {
                    setSelectedArtisan(artisan)
                    setIsArtisanModalOpen(true)
                  }}
                  className="group bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl border border-[#EAE0D5] transition-all duration-300 cursor-pointer flex items-center gap-4 sm:gap-6"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#EAE0D5] border-2 border-transparent group-hover:border-[#D17B57] transition-all shrink-0">
                    <img 
                      src={artisan.profile_photo_url || '/assets/Background.png'} 
                      alt={artisan.full_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] uppercase tracking-wider group-hover:text-[#D17B57] transition-colors break-words">{artisan.full_name}</h3>
                    <p className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] text-[#8B5E3C] uppercase mt-1">Resident Blacksmith</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] font-serif uppercase tracking-widest mb-8 sm:mb-10">Forged Works</h2>
          {products.length === 0 ? (
            <p className="text-sm text-[#8B5E3C] italic font-serif">No products have been cataloged yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/collection/${product.id}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#EAE0D5] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square bg-[#1A1A1A] overflow-hidden relative">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    />
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A] font-serif mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-[9px] text-[#8B5E3C] uppercase tracking-[0.2em] mb-4 font-bold">
                      {product.blade_material} / {product.handle_material}
                    </p>
                    <p className="text-sm text-[#6B5041] line-clamp-2 mb-6 flex-grow leading-relaxed">
                      {product.description || 'No description provided.'}
                    </p>
                    <div className="pt-4 border-t border-[#EAE0D5] space-y-2">
                      <p className="text-xs font-black text-[#D17B57] uppercase tracking-widest">
                        PHP {Number(product.price || 0).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-[#8B5E3C] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        View Details
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Artisan Profile Modal */}
      {isArtisanModalOpen && selectedArtisan && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsArtisanModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FDF8F5] rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsArtisanModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-[#4A3224] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#EAE0D5] overflow-hidden mb-6 shadow-xl">
              <img 
                src={selectedArtisan.profile_photo_url || '/assets/Background.png'} 
                alt={selectedArtisan.full_name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-3xl font-black text-[#1A1A1A] font-serif uppercase tracking-wider mb-2">{selectedArtisan.full_name}</h3>
            <p className="text-[10px] font-black tracking-[0.3em] text-[#D17B57] uppercase mb-8">Master Blacksmith</p>
            <div className="w-16 h-px bg-[#D17B57]/30 mx-auto mb-8"></div>
            <p className="text-[#6B5041] leading-relaxed text-sm md:text-base font-serif whitespace-pre-wrap px-4">
              {selectedArtisan.bio || 'No biography provided yet.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}