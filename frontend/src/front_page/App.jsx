import { lazy, Suspense, useState, useEffect } from 'react' // Add useEffect
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' // Import your supabase client
import StatsBar from '../components/StatsBar'
import Navbar from './NavBar'
import Hero from './Hero'
import WorkshopList from './WorkShopList'
import CollectionGallery from './CollectionGallery'
import LoginModal from '../components/LoginModal'
import ProtectedRoute from './ProtectedRoute'
const Register = lazy(() => import('../components/Register'))
const ArtisanDashboard = lazy(() => import('../artisan/ArtisanDashboard'))
const LGUAdminDashboard = lazy(() => import('../lgu/LGUAdminDashboard'))
const UpdatePassword = lazy(() => import('../components/UpdatePassword'))
const WorkshopPublicPage = lazy(() => import('../artisan/WorkshopPublicPage'))
const CollectionItemPage = lazy(() => import('./CollectionItemPage'))
const DamageReports = lazy(() => import('../drrm/DamageReports'))
const RiskProfile = lazy(() => import('../drrm/RiskProfile'))
const RiskAssessmentRecords = lazy(() => import('../drrm/RiskAssessmentRecords'))

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0A0A0A] text-[#FDF8F5]">
      <p className="action-label loading-pulse text-[11px]">Loading Bolo Pandayan...</p>
    </div>
  )
}

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

  if (loading) return <LoadingScreen />

  return (
    <main className="min-h-screen selection:bg-[#D17B57] selection:text-white">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home onLoginOpen={() => setIsLoginOpen(true)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/workshops/:workshopId" element={<WorkshopPublicPage />} />
          <Route path="/collection/:productId" element={<CollectionItemPage />} />
          <Route path="/risk-profile/:workshopId" element={<RiskProfile />} />
          <Route path="/workshops/:workshopId/risk-assessments" element={<RiskAssessmentRecords />} />
          <Route path="/workshops/:workshopId/damage-reports" element={<DamageReports />} />
          <Route
            path="/admin/workshops/:workshopId/risk-profile"
            element={
              <ProtectedRoute user={user} profile={profile} allowedRoles={['admin', 'developer']}>
                <RiskProfile />
              </ProtectedRoute>
            }
          />
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
      </Suspense>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  )
}

export default App