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
        .select('id, name, address, banner_url, owner_id, created_at, safety_score, lat, lng')
        .eq('id', workshopId)
        .maybeSingle()

      if (workshopError) {
        setLoading(false)
        return
      }

      setWorkshop(workshopData)

      const { data: latestRiskData } = await supabase
        .from('tbl_workshop_risk_assessments')
        .select('id, assessed_at, risk_score, risk_label')
        .eq('workshop_id', workshopId)
        .order('assessed_at', { ascending: false })
        .limit(1)

      setLatestRiskRecord((latestRiskData && latestRiskData[0]) || null)

      const { data: artisanData, error: artisanError } = await supabase
        .from('tbl_user_profiles')
        .select('id, full_name, shop_name, shop_address, shop_description, banner_url, workshop_id, account_status')
        .eq('role', 'artisan')
        .eq('workshop_id', workshopId)
        .in('account_status', ['approved', 'Approved'])
        .order('created_at', { ascending: true })

      if (!artisanError) {
        setArtisans(artisanData || [])
      }

      const artisanIds = (artisanData || []).map((artisan) => artisan.id)

      if (artisanIds.length > 0) {
        const { data: productData, error: productError } = await supabase
          .from('tbl_products')
          .select('id, name, image_url, price, description, blade_material, handle_material, workshop_id, created_at')
          .in('workshop_id', artisanIds)
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

  const primaryArtisan = artisans[0] || null

  const title = useMemo(() => {
    return primaryArtisan?.shop_name || workshop?.name || 'Workshop'
  }, [primaryArtisan, workshop])

  const address = useMemo(() => {
    return primaryArtisan?.shop_address || workshop?.address || 'Address not available'
  }, [primaryArtisan, workshop])

  const description = useMemo(() => {
    return (
      primaryArtisan?.shop_description ||
      'No workshop description has been published yet.'
    )
  }, [primaryArtisan])

  const bannerUrl = useMemo(() => {
    return primaryArtisan?.banner_url || workshop?.banner_url || '/assets/Background.png'
  }, [primaryArtisan, workshop])

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
      <header className="relative h-96 md:h-[32rem] overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${bannerUrl})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F5] via-[#121212]/40 to-transparent"></div>

        <div className="absolute top-8 left-8 z-10">
          <Link to="/" className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md text-[#FDF8F5] border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-black/60 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Return
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <h1 className="text-5xl md:text-7xl font-black text-white font-serif uppercase tracking-tighter mb-4 drop-shadow-sm">
            {title}
          </h1>
          <p className="text-[#D17B57] font-black text-black text-[10px] md:text-xs tracking-[0.3em] uppercase flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {address}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 md:px-16 py-16 reveal-up">
        
        <section className="mb-20 max-w-4xl relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[2px] w-12 bg-[#D17B57]"></div>
            <h2 className="text-sm font-black text-[#D17B57] uppercase tracking-[0.3em]">The Legacy</h2>
          </div>
          <p className="text-[#4A3224] text-lg md:text-xl leading-relaxed font-serif whitespace-pre-wrap">
            {description}
          </p>

          <div className="mt-8 inline-flex items-center gap-4 pandayan-curve border border-[#EAD6CA] bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Workshop Risk Profile</p>
              <p className="text-2xl font-black text-[#D17B57]">{riskScore}%</p>
              {riskAssessedDate && (
                <p className="text-[10px] text-gray-500 mt-1">Latest assessed: {riskAssessedDate}</p>
              )}
            </div>
            <div className="h-10 w-px bg-[#EAD6CA]"></div>
            <p className="action-label text-[10px] text-[#1A1A1A]">{riskLabel} Risk</p>
          </div>

          <div className="mt-12 pt-8 border-t border-[#D17B57]/20 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {(userRole === 'admin' || userRole === 'developer') && (
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

          {(workshop?.lat && workshop?.lng) && (
            <div className="mt-12 rounded-2xl overflow-hidden shadow-lg border border-[#EAD6CA] h-96">
              <MapContainer
                center={[parseFloat(workshop.lat), parseFloat(workshop.lng)]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[parseFloat(workshop.lat), parseFloat(workshop.lng)]} />
              </MapContainer>
            </div>
          )}
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-black text-[#1A1A1A] font-serif uppercase tracking-widest mb-10">Master Artisans</h2>
          {artisans.length === 0 ? (
            <p className="text-sm text-[#8B5E3C] italic font-serif">The artisan roster is currently being updated...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((artisan) => (
                <div key={artisan.id} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-[#EAE0D5] transition-all duration-300">
                  <h3 className="text-xl font-black text-[#1A1A1A] uppercase tracking-wider group-hover:text-[#D17B57] transition-colors">{artisan.full_name}</h3>
                  <p className="text-[10px] font-black tracking-[0.2em] text-[#8B5E3C] uppercase mt-2">Resident Blacksmith</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-black text-[#1A1A1A] font-serif uppercase tracking-widest mb-10">Forged Works</h2>
          {products.length === 0 ? (
            <p className="text-sm text-[#8B5E3C] italic font-serif">No products have been cataloged yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#EAE0D5] transition-all duration-300">
                  <div className="aspect-square bg-[#1A1A1A] overflow-hidden relative">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-black text-[#1A1A1A] font-serif mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-[9px] text-[#8B5E3C] uppercase tracking-[0.2em] mb-4 font-bold">
                      {product.blade_material} / {product.handle_material}
                    </p>
                    <p className="text-sm text-[#6B5041] line-clamp-2 mb-6 flex-grow leading-relaxed">
                      {product.description || 'No description provided.'}
                    </p>
                    <div className="pt-4 border-t border-[#EAE0D5]">
                      <p className="text-xs font-black text-[#D17B57] uppercase tracking-widest">
                        PHP {Number(product.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}