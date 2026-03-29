import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

export default function StatsBar({ isDarkMode }) {
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

      // Get count of unique workshops that have at least one risk assessment
      const assessedWorkshopsPromise = supabase
        .from('tbl_workshop_risk_assessments')
        .select('workshop_id')

      const [approvedRes, workshopsRes, productsRes, assessmentsRes] = await Promise.all([
        approvedArtisansPromise,
        workshopsPromise,
        productsPromise,
        assessedWorkshopsPromise
      ])

      const artisanCount = approvedRes.count || 0
      const workshopCount = workshopsRes.count || 0
      const itemCount = productsRes.count || 0

      // Calculate percentage based on unique assessed workshops vs total workshops
      let percentage = 0
      if (workshopCount > 0 && assessmentsRes.data) {
        const uniqueAssessedWorkshops = new Set(assessmentsRes.data.map(a => a.workshop_id))
        percentage = Math.round((uniqueAssessedWorkshops.size / workshopCount) * 100)
      }

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
      className={`relative z-30 bg-transparent py-16 px-6 sm:px-12 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-10 md:gap-4">
        
        {/* STAT 1: REGISTERED PANDAYS */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className={`text-5xl md:text-7xl font-black ${isDarkMode ? 'text-white' : 'text-[#4A3224]'} font-serif leading-none`}>
            {stats.pandays}
          </span>
          <div className={`text-[9px] font-black ${isDarkMode ? 'text-gray-500' : 'text-[#4A3224]/70'} tracking-[0.3em] leading-relaxed uppercase`}>
            Registered<br/>Pandays
          </div>
        </div>
        
        <Divider isDarkMode={isDarkMode} />

        {/* STAT 2: ACTIVE WORKSHOPS */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className={`text-5xl md:text-7xl font-black ${isDarkMode ? 'text-white' : 'text-[#4A3224]'} font-serif leading-none`}>
            {stats.workshops}
          </span>
          <div className={`text-[9px] font-black ${isDarkMode ? 'text-gray-500' : 'text-[#4A3224]/70'} tracking-[0.3em] leading-relaxed uppercase`}>
            Active<br/>Workshops
          </div>
        </div>
        
        <Divider isDarkMode={isDarkMode} />

        {/* STAT 3: HERITAGE ITEMS */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className={`text-5xl md:text-7xl font-black ${isDarkMode ? 'text-white' : 'text-[#4A3224]'} font-serif leading-none`}>
            {stats.items}
          </span>
          <div className={`text-[9px] font-black ${isDarkMode ? 'text-gray-500' : 'text-[#4A3224]/70'} tracking-[0.3em] leading-relaxed uppercase`}>
            Heritage<br/>Items
          </div>
        </div>
        
        <Divider isDarkMode={isDarkMode} />

        {/* STAT 4: PERCENTAGE (ORANGE) */}
        <div className="flex items-center gap-5 min-w-[180px]">
          <span className="text-5xl md:text-7xl font-black text-[#D17B57] font-serif leading-none">
            {stats.assessed}%
          </span>
          <div className={`text-[9px] font-black ${isDarkMode ? 'text-gray-500' : 'text-[#4A3224]/70'} tracking-[0.3em] leading-relaxed uppercase`}>
            Workshops<br/>Assessed
          </div>
        </div>

      </div>
    </div>
  )
}

function Divider({ isDarkMode }) {
  return <div className={`hidden lg:block w-px h-16 ${isDarkMode ? 'bg-white/10' : 'bg-[#4A3224]/10'} mx-4`}></div>
}
