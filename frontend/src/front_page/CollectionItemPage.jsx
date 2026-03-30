import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function CollectionItemPage() {
  const { productId } = useParams()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [workshop, setWorkshop] = useState(null)
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

      const { data: workshopData } = await supabase
        .from('tbl_workshops')
        .select('id, name, address, owner_id')
        .eq('id', item.workshop_id)
        .maybeSingle()

      setWorkshop(workshopData || null)

      const { data: artisanData } = await supabase
        .from('tbl_user_profiles')
        .select('id, full_name, workshop_id')
        .eq('id', workshopData?.owner_id)
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
        <Link to="/" className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md text-[#FDF8F5] border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-black/60 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Return
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 lg:py-12">
        <Link to="/#collection" className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#FDF8F5] border border-[#D17B57]/20 text-[#4A3224] text-[9px] sm:text-[10px] font-black tracking-widest uppercase hover:bg-[#D17B57] hover:text-white hover:scale-[1.02] transition-all mb-6 sm:mb-8 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 bg-white border border-[#EAE0D5] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-sm items-start">
          <div className="rounded-2xl overflow-hidden bg-[#F5EBE1] aspect-[4/5] max-h-[72vh] lg:max-h-[44rem]">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
          </div>

          <div>
            <p className="text-[10px] text-[#D17B57] font-black tracking-[0.2em] uppercase mb-2">Heritage Item</p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#4A3224] font-serif mb-3 sm:mb-4 break-words">{product.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-[0.2em] sm:tracking-widest mb-5 sm:mb-6 break-words">{product.blade_material} / {product.handle_material}</p>

            <p className="text-sm sm:text-base text-[#6B5041] leading-relaxed mb-5 sm:mb-6">{product.description || 'No description provided.'}</p>

            <p className="text-base sm:text-lg font-black text-[#D17B57] uppercase tracking-[0.16em] sm:tracking-widest mb-5 sm:mb-6">PHP {Number(product.price || 0).toLocaleString()}</p>

            {artisan && (
              <div className="border-t border-[#EAE0D5] pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Crafted By</p>
                <h2 className="text-lg sm:text-xl font-black text-[#4A3224] uppercase break-words">{artisan.full_name}</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 break-words">{workshop?.name || 'Workshop'} • {workshop?.address || 'Address unavailable'}</p>
                {artisan.workshop_id && (
                  <Link
                    to={`/workshops/${artisan.workshop_id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4A3224] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D17B57] transition-colors"
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
