import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar({ onLoginClick }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Toggle for mobile menu
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('tbl_user_profiles')
      .select('full_name, role')
      .eq('id', userId)
      .maybeSingle()
    if (data) setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsMenuOpen(false)
    navigate('/')
  }

  const handleDashboardRedirect = () => {
    setIsMenuOpen(false)
    if (profile?.role === 'admin' || profile?.role === 'developer') {
      navigate('/lgu-dashboard')
    } else if (profile?.role === 'artisan') {
      navigate('/artisan-dashboard')
    } else {
      navigate('/')
    }
  }
  
  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-white/20 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
        
        <img 
          src="/assets/BoloFinal.png" 
          alt="Bolo Pandayan Logo" 
          className="w-9 h-9 md:w-10 md:h-10 object-contain group-hover:scale-105 transition-transform"
        />

        <h1 className="text-lg md:text-2xl font-black tracking-[0.1em] md:tracking-[0.2em] text-[#4A3224] font-serif uppercase">
          Bolo Pandayan
        </h1>
        
      </div>      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-10 font-bold text-xs tracking-[0.15em] text-[#6B5041]">
        <Link to="/" className="hover:text-[#D17B57] transition-colors">HOME</Link>
        <a href="#collection" className="hover:text-[#D17B57] transition-colors">COLLECTION</a>
        
        {user && profile ? (
          <div className="flex items-center gap-6">
            <span className="font-bold text-xs tracking-[0.15em] text-[#D17B57] uppercase">
              HELLO, {profile.full_name?.split(' ')[0] || 'User'}
            </span>
            <button onClick={handleDashboardRedirect} className="flex items-center gap-2 px-5 py-2.5 bg-[#4A3224] text-[#FDF8F5] rounded-xl hover:bg-[#D17B57] transition-all shadow-md">
              <span className="font-bold text-[10px] tracking-[0.2em] uppercase">Dashboard</span>
            </button>
          </div>
        ) : (
          <button onClick={onLoginClick} className="px-4 py-2 bg-[#F5EBE1] rounded-lg hover:bg-[#EAE0D5] text-[#4A3224] font-bold text-xs tracking-[0.15em] transition-all uppercase">LOGIN</button>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#4A3224] focus:outline-none">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-[73px] left-0 w-full bg-white border-b border-gray-100 shadow-xl flex flex-col p-6 gap-6 md:hidden animate-in slide-in-from-top duration-300">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="font-black text-xs tracking-widest text-[#6B5041] uppercase">HOME</Link>
          <a href="#collection" onClick={() => setIsMenuOpen(false)} className="font-black text-xs tracking-widest text-[#6B5041] uppercase">COLLECTION</a>
          
          <hr className="border-gray-100" />

          {user && profile ? (
            <div className="flex flex-col gap-4">
              <span className="font-bold text-xs tracking-[0.15em] text-[#D17B57] uppercase">HELLO, {profile.full_name}</span>
              <button onClick={handleDashboardRedirect} className="w-full py-4 bg-[#4A3224] text-white rounded-xl font-black text-xs tracking-widest uppercase">My Dashboard</button>
              <button onClick={handleLogout} className="w-full py-4 border border-red-100 text-red-600 rounded-xl font-black text-xs tracking-widest uppercase">Logout</button>
            </div>
          ) : (
            <button onClick={() => { setIsMenuOpen(false); onLoginClick(); }} className="w-full py-4 bg-[#F5EBE1] text-[#4A3224] rounded-xl font-black text-xs tracking-widest uppercase">LOGIN</button>
          )}
        </div>
      )}
    </nav>
  )
}