import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function WorkshopList({ isDarkMode }) {
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

useEffect(() => {
    const fetchWorkshops = async () => {
      // 1. Fetch the actual workshops as the Source of Truth
      const { data: workshopsData, error: wsError } = await supabase
        .from('tbl_workshops')
        .select('id, name, address, description, banner_url')
        .order('created_at', { ascending: false })

      if (wsError || !workshopsData) {
        setWorkshops([])
        setLoading(false)
        return
      }

      // 2. Fetch approved artisans just to get their names for the "Masters" tag
      const { data: artisansData } = await supabase
        .from('tbl_user_profiles')
        .select('full_name, workshop_id')
        .eq('role', 'artisan')
        .in('account_status', ['approved', 'Approved'])

      // 3. Map the data together
      const activeWorkshops = workshopsData.map(shop => {
        const shopArtisans = artisansData?.filter(a => a.workshop_id === shop.id) || []
        
        return {
          id: shop.id,
          shop_name: shop.name, // Mapping to the variable names your UI already uses
          shop_address: shop.address,
          shop_description: shop.description,
          banner_url: shop.banner_url,
          masters: shopArtisans.map(a => a.full_name)
        }
      }).filter(shop => shop.masters.length > 0) // Hide empty workshops that have no approved artisans yet

      setWorkshops(activeWorkshops)
      setLoading(false)
    }

    fetchWorkshops()
  }, [])

  const filteredWorkshops = workshops.filter((workshop) =>
    (workshop.shop_name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  )
  
  if (loading) return null

  if (workshops.length === 0) return null

  return (
    <section className={`relative bg-transparent py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 overflow-hidden transition-colors duration-700`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#D17B57] rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black ${isDarkMode ? 'text-[#FDF8F5]' : 'text-[#4A3224]'} tracking-tight font-serif uppercase mb-5 sm:mb-6 drop-shadow-lg`}>
            Workshops
          </h2>
          <div className="mx-auto w-24 h-1 bg-gradient-to-r from-transparent via-[#D17B57] to-transparent rounded-full"></div>

          <div className="w-full max-w-xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workshops by name..."
                className={`w-full rounded-full px-5 py-3 text-sm sm:text-base outline-none border transition-all duration-300 ${isDarkMode
                  ? 'bg-[#1A1A1A]/80 text-[#FDF8F5] border-white/10 placeholder:text-[#EAE0D5]/50 focus:border-[#D17B57] focus:shadow-[0_0_20px_rgba(209,123,87,0.2)]'
                  : 'bg-[#FDF8F5]/90 text-[#4A3224] border-[#4A3224]/15 placeholder:text-[#4A3224]/45 focus:border-[#D17B57] focus:shadow-[0_0_20px_rgba(209,123,87,0.15)]'
                }`}
              />
              <button
                type="button"
                className="rounded-full px-6 py-3 action-label text-xs uppercase bg-[#D17B57] text-white hover:bg-[#b96847] transition-all duration-300"
                aria-label="Search workshops"
              >
                Search
              </button>
              {searchQuery.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`rounded-full px-6 py-3 action-label text-xs uppercase border transition-all duration-300 ${isDarkMode
                    ? 'border-white/15 text-[#FDF8F5] hover:bg-white/10'
                    : 'border-[#4A3224]/20 text-[#4A3224] hover:bg-[#4A3224]/5'
                  }`}
                  aria-label="Clear workshop search"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {filteredWorkshops.map((workshop) => {
            // Setup dynamic data fallbacks
            const bgImage = workshop.banner_url || '/assets/Background.png'
            const masterText = workshop.masters?.length > 1
              ? `Masters: ${workshop.masters.join(', ')}`
              : `Master: ${workshop.masters?.[0] || 'Unknown'}`
            const descText = workshop.shop_description || `Located in ${workshop.shop_address || 'Loay'}, this workshop preserves the centuries-old tradition of Loay's bolo craftsmanship.`

            return (
              <Link key={workshop.id} to={`/workshops/${workshop.id}`} className="group block">
                <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 hover:border-[#D17B57]/50 hover:shadow-[0_0_30px_rgba(209,123,87,0.15)] hover:-translate-y-2 ${isDarkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-[transparent] border-[#4A3224]/10'}`}>
                  
                  {/* Edge-to-Edge Banner Container */}
                  <div className={`aspect-[4/5] sm:aspect-[4/3] overflow-hidden relative ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#EAE0D5]'}`}>
                    <img 
                      src={bgImage} 
                      alt={workshop.shop_name} 
                      className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:opacity-80 group-hover:scale-110"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#1A1A1A] via-[#1A1A1A]/60' : 'from-[#F2DCCA] via-[#F2DCCA]/80'} to-transparent opacity-90`}></div>
                  </div>

                  {/* Text Content overlaying the bottom */}
                  <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 transform translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className={`text-xl sm:text-2xl font-black font-serif tracking-wide mb-1 drop-shadow-md line-clamp-1 ${isDarkMode ? 'text-[#FDF8F5]' : 'text-[#4A3224]'}`}>
                      {workshop.shop_name}
                    </h3>
                    
                    <p className="text-[8px] sm:text-[9px] text-[#D17B57] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] mb-2 line-clamp-1">
                      {masterText}
                    </p>

                    <p className={`text-[11px] sm:text-xs line-clamp-2 mb-3 sm:mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDarkMode ? 'text-[#EAE0D5]/70' : 'text-[#4A3224]/70'}`}>
                      {descText}
                    </p>
                    
                    <p className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.24em] sm:tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isDarkMode ? 'text-white' : 'text-[#4A3224]'}`}>
                      View Workshop →
                    </p>
                  </div>
                  
                </div>
              </Link>
            )
          })}
        </div>

        {workshops.length > 0 && filteredWorkshops.length === 0 && (
          <p className={`mt-10 text-center font-serif italic ${isDarkMode ? 'text-[#EAE0D5]/55' : 'text-[#4A3224]/55'}`}>
            No workshops matched your search.
          </p>
        )}
      </div>
    </section>
  )
}
