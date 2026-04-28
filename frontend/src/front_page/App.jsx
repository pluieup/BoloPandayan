import { lazy, Suspense, useState, useEffect } from 'react' // Add useEffect
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' // Import your supabase client
import StatsBar from '../components/StatsBar'
import AnimatedBackground from '../components/AnimatedBackground'
import Navbar from './NavBar'
import Hero from './Hero'
import HeritageIntro from './HeritageIntro'
import WorkshopList from './WorkShopList'
import CollectionGallery from './CollectionGallery'
import LoginModal from '../components/LoginModal'
import ProtectedRoute from './ProtectedRoute'
const Register = lazy(() => import('../components/Register'))
const ArtisanDashboard = lazy(() => import('../artisan/ArtisanDashboard'))
const LGUAdminDashboard = lazy(() => import('../lgu/LGUAdminDashboard'))
const DeveloperDashboard = lazy(() => import('../developer/DeveloperDashboard'))
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
  const [isDarkMode, setIsDarkMode] = useState(true)

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  useEffect(() => {
    const animatedSections = document.querySelectorAll('[data-scroll-reveal]')

    if (!animatedSections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    animatedSections.forEach((section) => observer.observe(section))

    return () => {
      animatedSections.forEach((section) => observer.unobserve(section))
      observer.disconnect()
    }
  }, [])

  return (
    <div className={`${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#FDF8F5]'} min-h-screen transition-colors duration-700 relative overflow-hidden`}>
      <AnimatedBackground isDarkMode={isDarkMode} />
      <Navbar onLoginClick={onLoginOpen} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="relative z-10">
        <div className="scroll-reveal is-visible" data-scroll-reveal>
          <Hero isDarkMode={isDarkMode} />
        </div>
        <div className="scroll-reveal" style={{ '--reveal-delay': '20ms' }} data-scroll-reveal>
          <HeritageIntro isDarkMode={isDarkMode} />
        </div>
        <div className="scroll-reveal" style={{ '--reveal-delay': '40ms' }} data-scroll-reveal>
          <StatsBar isDarkMode={isDarkMode} />
        </div>
        <div className="scroll-reveal" style={{ '--reveal-delay': '90ms' }} data-scroll-reveal>
          <WorkshopList isDarkMode={isDarkMode} />
        </div>
        <div className="scroll-reveal" style={{ '--reveal-delay': '120ms' }} data-scroll-reveal>
          <CollectionGallery isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
    )
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('tbl_user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle() // Use maybeSingle to avoid the "coerce" error

    if (data) setProfile(data)
    setLoading(false)
  }

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
              <ProtectedRoute user={user} profile={profile} allowedRoles={['lgu_admin', 'developer']}>
                <RiskProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workshops/:workshopId/damage-reports"
            element={
              <ProtectedRoute user={user} profile={profile} allowedRoles={['lgu_admin', 'developer']}>
                <DamageReports />
              </ProtectedRoute>
            }
          />
          {/* DEVELOPER DASHBOARD */}
          <Route
            path="/developer-dashboard"
            element={
              <ProtectedRoute user={user} profile={profile} allowedRoles={['developer']}>
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />

          {/* LGU ADMIN DASHBOARD */}
          <Route 
            path="/lgu-dashboard" 
            element={
              <ProtectedRoute user={user} profile={profile} allowedRoles={['lgu_admin']}>
                <LGUAdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/admin-dashboard" element={<Navigate to="/lgu-dashboard" replace />} />

          {/* ARTISAN DASHBOARD */}
          <Route 
            path="/artisan-dashboard" 
            element={
              <ProtectedRoute user={user} profile={profile} allowedRoles={['artisan']}>
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