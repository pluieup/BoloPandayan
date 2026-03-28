import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function CollectionItemPage() {
  const { productId } = useParams()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [artisan, setArtisan] = useState(null)

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)

      const { data: item, error: itemError } = await supabase
        .from('tbl_products')
        .select('*')
        .eq('id', productId)
        .maybeSingle()

      if (itemError || !item) {
        setLoading(false)
        return
      }

      setProduct(item)

      const { data: artisanData } = await supabase
        .from('tbl_user_profiles')
        .select('id, full_name, shop_name, shop_address, workshop_id')
        .eq('id', item.workshop_id)
        .maybeSingle()

      setArtisan(artisanData || null)
      setLoading(false)
    }

    if (productId) fetchItem()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-[#FDF8F5] uppercase tracking-widest text-xs font-black">
        Loading Item...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-center p-8">
        <h2 className="text-3xl font-black text-white uppercase mb-3">Item Not Found</h2>
        <p className="text-gray-400 text-sm mb-8">This collection item may have been removed.</p>
        <Link to="/" className="px-6 py-3 bg-[#D17B57] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#b06445] transition-colors">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <Link to="/#collection" className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-[#4A3224] hover:text-[#D17B57] mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white border border-[#EAE0D5] rounded-3xl p-6 md:p-10 shadow-sm">
          <div className="rounded-2xl overflow-hidden bg-[#F5EBE1]">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <p className="text-[10px] text-[#D17B57] font-black tracking-[0.2em] uppercase mb-2">Heritage Item</p>
            <h1 className="text-4xl font-black text-[#4A3224] font-serif mb-4">{product.name}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-6">{product.blade_material} / {product.handle_material}</p>

            <p className="text-[#6B5041] leading-relaxed mb-6">{product.description || 'No description provided.'}</p>

            <p className="text-lg font-black text-[#D17B57] uppercase tracking-widest mb-6">PHP {Number(product.price || 0).toLocaleString()}</p>

            {artisan && (
              <div className="border-t border-[#EAE0D5] pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Crafted By</p>
                <h2 className="text-xl font-black text-[#4A3224] uppercase">{artisan.full_name}</h2>
                <p className="text-sm text-gray-600 mb-4">{artisan.shop_name || 'Workshop'} • {artisan.shop_address || 'Address unavailable'}</p>
                {artisan.workshop_id && (
                  <Link
                    to={`/workshops/${artisan.workshop_id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A3224] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D17B57] transition-colors"
                  >
                    View Workshop
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
