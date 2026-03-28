import { useState, useEffect } from 'react' // Add useEffect
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' // Import your supabase client
import StatsBar from '../components/StatsBar'
import Navbar from './NavBar'
import Hero from './Hero'
import WorkshopList from './WorkShopList'
import CollectionGallery from './CollectionGallery'
import Register from '../components/Register'
import LoginModal from '../components/LoginModal'
import ArtisanDashboard from '../artisan/ArtisanDashboard'
import ProtectedRoute from './ProtectedRoute'
import LGUAdminDashboard from '../lgu/LGUAdminDashboard'
import UpdatePassword from '../components/UpdatePassword' // Create this file next!
import WorkshopPublicPage from '../artisan/WorkshopPublicPage'
import CollectionItemPage from './CollectionItemPage'
import DamageReports from '../drrm/DamageReports'
import RiskProfile from '../drrm/RiskProfile'

function Home({ onLoginOpen }) {
  return (
<div className="bg-[#0A0A0A] min-h-screen"> 
      <Navbar onLoginClick={onLoginOpen} />
      <Hero />
      <StatsBar /> 
      <WorkshopList />
      <CollectionGallery />
    </div>
    )
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('tbl_user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle() // Use maybeSingle to avoid the "coerce" error

    if (data) setProfile(data)
    setLoading(false)
  }

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Bolo Pandayan...</div>

  return (
    <main className="min-h-screen bg-[#FDF8F5]">
      <Routes>
        <Route path="/" element={<Home onLoginOpen={() => setIsLoginOpen(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/workshops/:workshopId" element={<WorkshopPublicPage />} />
        <Route path="/collection/:productId" element={<CollectionItemPage />} />
        <Route path="/risk-profile/:workshopId" element={<RiskProfile />} />
        <Route
          path="/admin/workshops/:workshopId/damage-reports"
          element={
            <ProtectedRoute user={user} profile={profile} allowedRoles={['admin', 'developer']}>
              <DamageReports />
            </ProtectedRoute>
          }
        />
        {/* LGU ADMIN DASHBOARD */}
        <Route 
          path="/lgu-dashboard" 
          element={
            <ProtectedRoute user={user} profile={profile} allowedRoles={['admin', 'developer']}>
              <LGUAdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/admin-dashboard" element={<Navigate to="/lgu-dashboard" replace />} />

        {/* ARTISAN DASHBOARD */}
        <Route 
          path="/artisan-dashboard" 
          element={
            <ProtectedRoute user={user} profile={profile} allowedRoles={['artisan', 'developer']}>
              <ArtisanDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  )
}

export default App