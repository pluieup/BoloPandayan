import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import ProjectCard from './ProjectCard'

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

  // Only show the gallery if there are actual products
  if (products.length === 0) {
    return (
      <section className="py-20 bg-[#FDF8F5] text-center">
        <p className="text-gray-400 font-serif italic">The digital collection is currently being curated...</p>
      </section>
    )
  }

  return (
    <section id="collection" className="bg-[#D17B57] py-20 px-10">
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