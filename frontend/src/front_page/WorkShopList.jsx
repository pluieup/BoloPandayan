import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function WorkshopList() {
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkshops = async () => {
      // Added banner_url to the select query so we can use it in the UI
      const { data, error } = await supabase
        .from('tbl_user_profiles')
        .select('id, full_name, shop_name, shop_address, shop_description, workshop_id, banner_url')
        .eq('role', 'artisan')
        .or('is_approved.eq.true,account_status.eq.approved,account_status.eq.Approved')
        .not('workshop_id', 'is', null)
        .not('shop_name', 'is', null)

      if (error) {
        setWorkshops([])
      } else {
        const byWorkshopId = new Map()

        ;(data || []).forEach((artisan) => {
          const key = artisan.workshop_id
          if (!key) return

          const existing = byWorkshopId.get(key)
          if (!existing) {
            byWorkshopId.set(key, {
              id: key,
              shop_name: artisan.shop_name,
              shop_address: artisan.shop_address,
              shop_description: artisan.shop_description,
              banner_url: artisan.banner_url,
              masters: artisan.full_name ? [artisan.full_name] : []
            })
            return
          }

          if (!existing.shop_name && artisan.shop_name) existing.shop_name = artisan.shop_name
          if (!existing.shop_address && artisan.shop_address) existing.shop_address = artisan.shop_address
          if (!existing.shop_description && artisan.shop_description) existing.shop_description = artisan.shop_description
          if (!existing.banner_url && artisan.banner_url) existing.banner_url = artisan.banner_url

          if (artisan.full_name && !existing.masters.includes(artisan.full_name)) {
            existing.masters.push(artisan.full_name)
          }
        })

        setWorkshops(Array.from(byWorkshopId.values()))
      }
      setLoading(false)
    }

    fetchWorkshops()
  }, [])

  if (loading) return null

  if (workshops.length === 0) return null

  return (
    <section className="relative bg-[#1A1A1A] py-24 px-6 sm:px-12 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#D17B57] rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#FDF8F5] tracking-tight font-serif uppercase mb-6 drop-shadow-lg">
            Workshops
          </h2>
          <div className="mx-auto w-24 h-1 bg-gradient-to-r from-transparent via-[#D17B57] to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop) => {
            // Setup dynamic data fallbacks
            const bgImage = workshop.banner_url || '/assets/Background.png'
            const masterText = workshop.masters?.length > 1
              ? `Masters: ${workshop.masters.join(', ')}`
              : `Master: ${workshop.masters?.[0] || 'Unknown'}`
            const descText = workshop.shop_description || `Located in ${workshop.shop_address || 'Loay'}, this workshop preserves the centuries-old tradition of Loay's bolo craftsmanship.`

            return (
              <Link key={workshop.id} to={`/workshops/${workshop.id}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] border border-white/5 transition-all duration-500 hover:border-[#D17B57]/50 hover:shadow-[0_0_30px_rgba(209,123,87,0.15)] hover:-translate-y-2">
                  
                  {/* Edge-to-Edge Banner Container */}
                  <div className="aspect-[4/5] sm:aspect-[4/3] overflow-hidden relative bg-[#0A0A0A]">
                    <img 
                      src={bgImage} 
                      alt={workshop.shop_name} 
                      className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-80 group-hover:scale-110"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent opacity-90"></div>
                  </div>

                  {/* Text Content overlaying the bottom */}
                  <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-black text-[#FDF8F5] font-serif tracking-wide mb-1 drop-shadow-md">
                      {workshop.shop_name}
                    </h3>
                    
                    <p className="text-[9px] text-[#D17B57] font-bold uppercase tracking-[0.2em] mb-2 line-clamp-1">
                      {masterText}
                    </p>

                    <p className="text-[#EAE0D5]/70 text-xs line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {descText}
                    </p>
                    
                    <p className="text-[9px] text-white font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      View Workshop →
                    </p>
                  </div>
                  
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}