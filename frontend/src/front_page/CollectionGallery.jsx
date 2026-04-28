import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ProjectCard from '../components/ProjectCard'

export default function CollectionGallery({ isDarkMode }) {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('tbl_products')
        .select('id, name, image_url, price, description, blade_material, handle_material, workshop_id, created_at')
        .order('created_at', { ascending: false })

      if (error) return

      const productsData = data || []

      // Batch fetch related workshops and artisan (owner) profiles to enrich cards
      const workshopIds = [...new Set(productsData.map((p) => p.workshop_id).filter(Boolean))]
      let workshopsMap = {}

      if (workshopIds.length > 0) {
        const { data: workshops } = await supabase
          .from('tbl_workshops')
          .select('id, name, owner_id')
          .in('id', workshopIds)

        if (workshops && workshops.length > 0) {
          workshopsMap = workshops.reduce((acc, w) => {
            acc[w.id] = w
            return acc
          }, {})

          const ownerIds = [...new Set(workshops.map((w) => w.owner_id).filter(Boolean))]
          if (ownerIds.length > 0) {
            const { data: owners } = await supabase
              .from('tbl_user_profiles')
              .select('id, full_name, profile_photo_url')
              .in('id', ownerIds)

            const ownersMap = (owners || []).reduce((acc, o) => {
              acc[o.id] = o
              return acc
            }, {})

            // attach owner (artisan) to workshop entries
            Object.values(workshopsMap).forEach((w) => {
              w.owner = ownersMap[w.owner_id] || null
            })
          }
        }
      }

      const enriched = productsData.map((p) => ({
        ...p,
        workshop: workshopsMap[p.workshop_id] || null,
        artisan: (workshopsMap[p.workshop_id] && workshopsMap[p.workshop_id].owner) || null,
      }))

      setProducts(enriched)
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) =>
    (product.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  if (products.length === 0) {
    return (
      <section className={`py-20 sm:py-24 md:py-32 text-center bg-transparent transition-colors duration-700`}>
        <p className={`font-serif italic text-lg ${isDarkMode ? 'text-[#EAE0D5]/50' : 'text-[#4A3224]/50'}`}>The digital collection is currently curated...</p>
      </section>
    )
  }

  return (
    <section id="collection" className={`py-16 sm:py-20 md:py-32 px-4 sm:px-8 md:px-12 relative bg-transparent transition-colors duration-700`}>
      <div className="max-w-7xl mx-auto mb-12 sm:mb-16 md:mb-20 flex flex-col items-center text-center">
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black font-serif uppercase tracking-widest mb-5 sm:mb-6 drop-shadow-lg transition-colors duration-700 ${isDarkMode ? 'text-[#FDF8F5]' : 'text-[#4A3224]'}`}>
          Products
        </h2>
        
        {/* Sleeker gradient accent line */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D17B57] to-transparent rounded-full"></div>

        <div className="w-full max-w-xl mt-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name..."
              className={`w-full rounded-full px-5 py-3 text-sm sm:text-base outline-none border transition-all duration-300 ${isDarkMode
                ? 'bg-[#1A1A1A]/80 text-[#FDF8F5] border-white/10 placeholder:text-[#EAE0D5]/50 focus:border-[#D17B57] focus:shadow-[0_0_20px_rgba(209,123,87,0.2)]'
                : 'bg-[#FDF8F5]/90 text-[#4A3224] border-[#4A3224]/15 placeholder:text-[#4A3224]/45 focus:border-[#D17B57] focus:shadow-[0_0_20px_rgba(209,123,87,0.15)]'
              }`}
            />
            <button
              type="button"
              className="rounded-full px-6 py-3 action-label text-xs uppercase bg-[#D17B57] text-white hover:bg-[#b96847] transition-all duration-300"
              aria-label="Search products"
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
                aria-label="Clear product search"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {filteredProducts.map((item) => (
          <ProjectCard 
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image_url}
            isDarkMode={isDarkMode}
            workshop={item.workshop}
            artisan={item.artisan}
          />
        ))}
      </div>

      {products.length > 0 && filteredProducts.length === 0 && (
        <p className={`mt-10 text-center font-serif italic ${isDarkMode ? 'text-[#EAE0D5]/55' : 'text-[#4A3224]/55'}`}>
          No products matched your search.
        </p>
      )}
    </section>
  )
}
