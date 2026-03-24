import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import StatsBar from './StatsBar'
import Navbar from './NavBar'
import Hero from './Hero'
import WorkshopList from './WorkShopList'
import CollectionGallery from './CollectionGallery'
import Register from './Register'
import LoginModal from './LoginModal'
import ArtisanDashboard from './ArtisanDashboard'

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

  return (
    <main className="min-h-screen bg-[#FDF8F5]">
      <Routes>
        <Route path="/" element={<Home onLoginOpen={() => setIsLoginOpen(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/artisan-dashboard" element={<ArtisanDashboard />} />
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