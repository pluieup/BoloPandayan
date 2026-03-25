import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient'

export default function StatsBar() {
  const [stats, setStats] = useState({
    pandays: 0,
    workshops: 0,
    items: 0,
    assessed: 0
  })
  
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef()

  useEffect(() => {
    const fetchStats = async () => {
    // 1. Count ONLY approved artisans for "Registered Pandays"
    const { count: artisanCount } = await supabase
      .from('tbl_user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'artisan')
      .eq('is_approved', true);

    // 2. Count Unique Active Workshops (Only for Approved Artisans)
    // We filter by 'artisan' role and ensure shop_name is not null
    const { data: workshopData } = await supabase
      .from('tbl_user_profiles')
      .select('shop_name')
      .eq('role', 'artisan')
      .eq('is_approved', true)
      .not('shop_name', 'is', null);
  
    const uniqueWorkshops = new Set(workshopData?.map(w => w.shop_name)).size;

    // 3. Count Total Heritage Items (Products)
    const { count: itemCount } = await supabase
      .from('tbl_products')
      .select('*', { count: 'exact', head: true });

    // 4. Calculate % of Workshops Assessed
    // Logic: (Approved Artisans / Total Artisan Registrations)
    const { count: totalArtisans } = await supabase
      .from('tbl_user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'artisan');

    const percentage = totalArtisans > 0 
      ? Math.round(((artisanCount || 0) / totalArtisans) * 100) 
      : 0;

    setStats({
      pandays: artisanCount || 0,
      workshops: uniqueWorkshops || 0,
      items: itemCount || 0,
      assessed: percentage
    });
  }

    fetchStats()

    // 2. Scroll Animation Logic (Intersection Observer)
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      })
    }, { threshold: 0.1 })
    
    if (domRef.current) observer.observe(domRef.current)
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current)
    }
  }, [])

  return (
    <div 
      ref={domRef}
      className={`relative z-30 bg-[#0A0A0A] py-16 px-6 sm:px-12 border-y border-white/5 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-10 md:gap-4">
        
        {/* STAT 1: REGISTERED PANDAYS */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className="text-5xl md:text-7xl font-black text-white font-serif leading-none">
            {stats.pandays}
          </span>
          <div className="text-[10px] font-black text-gray-400 tracking-[0.25em] leading-tight uppercase">
            Registered<br/>Pandays
          </div>
        </div>
        
        <Divider />

        {/* STAT 2: ACTIVE WORKSHOPS */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className="text-5xl md:text-7xl font-black text-white font-serif leading-none">
            {stats.workshops}
          </span>
          <div className="text-[10px] font-black text-gray-400 tracking-[0.25em] leading-tight uppercase">
            Active<br/>Workshops
          </div>
        </div>
        
        <Divider />

        {/* STAT 3: HERITAGE ITEMS */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className="text-5xl md:text-7xl font-black text-white font-serif leading-none">
            {stats.items}
          </span>
          <div className="text-[10px] font-black text-gray-400 tracking-[0.25em] leading-tight uppercase">
            Heritage<br/>Items
          </div>
        </div>
        
        <Divider />

        {/* STAT 4: PERCENTAGE (ORANGE) */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className="text-5xl md:text-7xl font-black text-[#D17B57] font-serif leading-none">
            {stats.assessed}%
          </span>
          <div className="text-[10px] font-black text-gray-400 tracking-[0.25em] leading-tight uppercase">
            Workshops<br/>Assessed
          </div>
        </div>

      </div>
    </div>
  )
}

function Divider() {
  return <div className="hidden lg:block w-px h-16 bg-white/10 mx-4"></div>
}