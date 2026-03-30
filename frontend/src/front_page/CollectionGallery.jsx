import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ProjectCard from '../components/ProjectCard'

export default function CollectionGallery({ isDarkMode }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('tbl_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setProducts(data)
    }

    fetchProducts()
  }, [])

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
        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {products.map((item) => (
          <ProjectCard 
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image_url}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </section>
  )
}
