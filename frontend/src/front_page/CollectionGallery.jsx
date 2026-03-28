import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ProjectCard from '../components/ProjectCard'

export default function CollectionGallery() {
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
      <section className="py-32 bg-[#121212] text-center border-t border-white/5">
        <p className="text-[#EAE0D5]/50 font-serif italic text-lg">The digital collection is currently being curated...</p>
      </section>
    )
  }

  return (
    <section id="collection" className="bg-[#121212] py-32 px-6 md:px-12 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto mb-20 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-5xl font-black text-[#FDF8F5] font-serif uppercase tracking-widest mb-6 drop-shadow-lg">
          Products
        </h2>
        
        {/* Sleeker gradient accent line */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D17B57] to-transparent rounded-full"></div>
        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((item) => (
          <ProjectCard 
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image_url} 
          />
        ))}
      </div>
    </section>
  )
}