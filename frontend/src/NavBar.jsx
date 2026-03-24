import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FDF8F5]/90 backdrop-blur-md border-b border-[#EAE0D5] px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-[#4A3224] to-[#8B5A43] rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
          <span className="text-[#FDF8F5] text-xs font-black tracking-wider">BP</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-[#4A3224] font-serif">
          BOLO PANDAYAN
        </h1>
      </div>
      
      <div className="hidden md:flex items-center gap-10 font-bold text-xs tracking-[0.15em] text-[#6B5041]">
        <Link to="/" className="hover:text-[#D17B57] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#D17B57] hover:after:w-full after:transition-all after:duration-300">HOME</Link>
        <a href="#collection" className="hover:text-[#D17B57] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#D17B57] hover:after:w-full after:transition-all after:duration-300">COLLECTION</a>
        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 bg-[#F5EBE1] rounded-lg hover:bg-[#EAE0D5] text-[#4A3224] transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          ADMIN
        </Link>
      </div>
    </nav>
  )
}