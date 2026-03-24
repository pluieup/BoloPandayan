import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import WorkshopCard from './WorkshopCard'

export default function WorkshopList() {
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkshops = async () => {
      // Fetch users who are artisans and have been approved by the admin
      const { data, error } = await supabase
        .from('tbl_user_profiles')
        .select('*')
        .eq('role', 'artisan')
        .eq('account_status', 'approved')

      if (!error) setWorkshops(data)
      setLoading(false)
    }

    fetchWorkshops()
  }, [])

  if (loading) return null // Hide section while loading

  // If no artisans are approved yet, don't show the section at all
  if (workshops.length === 0) return null

  return (
  <section className="relative bg-[#1A1A1A] py-24 px-6 sm:px-12 overflow-hidden">
        {/* Subtle Background Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#D17B57] rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-16 text-center">
            <span className="text-[#D17B57] font-black text-[10px] tracking-[0.3em] uppercase mb-3 block">
              The Hands of Loay
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#FDF8F5] tracking-tight font-serif uppercase">
              Master Blacksmiths
            </h2>
            <div className="w-20 h-1 bg-[#D17B57] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Grid Layout for a more professional look than a single list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-[#D17B57]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#D17B57] transition-colors duration-500">
                    <span className="text-[#D17B57] group-hover:text-white font-bold text-lg">⚒️</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#FDF8F5] font-serif mb-2 uppercase tracking-wide">
                    {workshop.shop_name}
                  </h3>
                  <p className="text-[#E8A88B] text-[10px] font-black tracking-widest uppercase mb-4">
                    Master: {workshop.full_name}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    Located in {workshop.shop_address}, this workshop preserves the centuries-old tradition of Loay's bolo craftsmanship.
                  </p>
                </div>
                
                <button className="w-full py-3 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-[#FDF8F5] uppercase hover:bg-white hover:text-black transition-all">
                  View Workshop
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }