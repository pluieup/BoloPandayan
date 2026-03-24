import { Routes, Route } from 'react-router-dom'
import Navbar from './NavBar'
import Hero from './Hero'
import WorkshopList from './WorkShopList'
import CollectionGallery from './CollectionGallery'
import Login from './Login'
import Register from './Register'

// I extracted your main page content into its own component
function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WorkshopList />
      <CollectionGallery />
    </>
  )
}

function App() {
  return (
    <main className="min-h-screen bg-[#FDF8F5]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </main>
  )
}

export default App