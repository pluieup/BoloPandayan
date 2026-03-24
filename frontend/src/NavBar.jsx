import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Navbar({ onLoginClick }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Check if a user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    }

    checkUser()

    // 2. Listen for login/logout changes in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('tbl_user_profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  const handleDashboardRedirect = () => {
    if (profile?.role === 'admin') {
      navigate('/admin-dashboard')
    } else {
      navigate('/artisan-dashboard')
    }
  }

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-sm border-b border-white/20 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-gradient-to-br from-[#4A3224] to-[#8B5A43] rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
          <span className="text-[#FDF8F5] text-xs font-black tracking-wider">BP</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-[#4A3224] font-serif uppercase">
          Bolo Pandayan
        </h1>
      </div>
      
      <div className="hidden md:flex items-center gap-10 font-bold text-xs tracking-[0.15em] text-[#6B5041]">
        <Link to="/" className="hover:text-[#D17B57] transition-colors">HOME</Link>
        <a href="#collection" className="hover:text-[#D17B57] transition-colors">COLLECTION</a>
        
        {/* DYNAMIC BUTTON LOGIC */}
        {user && profile ? (
        <div className="flex items-center gap-8"> {/* Increased gap to match link spacing */}
            <span className="font-bold text-xs tracking-[0.15em] text-[#D17B57] uppercase">
            HELLO, {profile.full_name.split(' ')[0]}
            </span>
            
            <button 
            onClick={handleDashboardRedirect}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4A3224] text-[#FDF8F5] rounded-xl hover:bg-[#D17B57] transition-all shadow-md group"
            >
            <svg className="w-3.5 h-3.5 text-[#E8A88B] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="font-bold text-[10px] tracking-[0.2em] uppercase">My Dashboard</span>
            </button>
        </div>
        ) : (
        <button 
            onClick={onLoginClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5EBE1] rounded-lg hover:bg-[#EAE0D5] text-[#4A3224] font-bold text-xs tracking-[0.15em] transition-all cursor-pointer uppercase"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            LOGIN
        </button>
        )}
      </div>
    </nav>
  )
}