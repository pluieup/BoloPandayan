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
      const approvedArtisansPromise = supabase
        .from('tbl_user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'artisan')
        .or('is_approved.eq.true,account_status.eq.approved,account_status.eq.Approved')

      const totalArtisansPromise = supabase
        .from('tbl_user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'artisan')

      const workshopsPromise = supabase
        .from('tbl_workshops')
        .select('*', { count: 'exact', head: true })

      const productsPromise = supabase
        .from('tbl_products')
        .select('*', { count: 'exact', head: true })

      const [approvedRes, totalRes, workshopsRes, productsRes] = await Promise.all([
        approvedArtisansPromise,
        totalArtisansPromise,
        workshopsPromise,
        productsPromise,
      ])

      const artisanCount = approvedRes.count || 0
      const totalArtisans = totalRes.count || 0
      const workshopCount = workshopsRes.count || 0
      const itemCount = productsRes.count || 0

      const percentage = totalArtisans > 0
        ? Math.round((artisanCount / totalArtisans) * 100)
        : 0

      setStats({
        pandays: artisanCount,
        workshops: workshopCount,
        items: itemCount,
        assessed: percentage
      })
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