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
    <nav className="forge-glass fixed top-0 w-full z-[100] px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src="/assets/BoloFinal.png" 
            alt="Logo" 
            className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-500"
          />
          <h1 className="forge-heading text-lg md:text-2xl text-[#4A3224]">
            Bolo Pandayan
          </h1>
        </div>
        
          {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-10 action-label text-[10px] text-[#4A3224]/70">
        <Link to="/" className="hover:text-[#D17B57] transition-all hover:scale-105 uppercase">Home</Link>
        <a href="#collection" className="hover:text-[#D17B57] transition-all hover:scale-105 uppercase">Collection</a>
            
            {user && profile ? (
              <button onClick={handleDashboardRedirect} className="action-label px-6 py-3 bg-[#4A3224] text-[#FDF8F5] rounded-full hover:bg-[#D17B57] transition-all shadow-lg hover:scale-105 active:scale-100">
                DASHBOARD
              </button>
            ) : (
              <button onClick={onLoginClick} className="action-label px-6 py-3 border border-[#4A3224]/30 rounded-full hover:bg-[#4A3224] hover:text-white transition-all hover:scale-105">
                LOGIN
              </button>
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
        <div className="absolute top-[73px] left-0 w-full bg-white/95 backdrop-blur-md border-b border-[#4A3224]/10 shadow-xl flex flex-col p-6 gap-6 md:hidden reveal-up">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="action-label text-xs text-[#6B5041] uppercase">HOME</Link>
          <a href="#collection" onClick={() => setIsMenuOpen(false)} className="action-label text-xs text-[#6B5041] uppercase">COLLECTION</a>
          
          <hr className="border-gray-100" />

          {user && profile ? (
            <div className="flex flex-col gap-4">
              <span className="font-bold text-xs tracking-[0.15em] text-[#D17B57] uppercase">HELLO, {profile.full_name}</span>
              <button onClick={handleDashboardRedirect} className="w-full py-4 bg-[#4A3224] text-white rounded-full action-label text-xs uppercase hover:scale-[1.02] transition-all">My Dashboard</button>
              <button onClick={handleLogout} className="w-full py-4 border border-red-100 text-red-600 rounded-full action-label text-xs uppercase hover:scale-[1.02] transition-all">Logout</button>
            </div>
          ) : (
            <button onClick={() => { setIsMenuOpen(false); onLoginClick(); }} className="w-full py-4 bg-[#F5EBE1] text-[#4A3224] rounded-full action-label text-xs uppercase hover:scale-[1.02] transition-all">LOGIN</button>
          )}
        </div>
      )}
    </nav>
  )
}