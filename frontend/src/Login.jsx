import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4A3224] to-[#8B5A43] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span className="text-[#FDF8F5] text-sm font-black tracking-wider">BP</span>
          </div>
          <h2 className="text-3xl font-black text-[#FDF8F5] font-serif tracking-widest">WELCOME BACK</h2>
          <p className="text-[#EAE0D5] text-xs tracking-widest uppercase mt-2">Access the Loay Heritage Portal</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#E8A88B] transition-colors"
              placeholder="admin@loay.gov.ph"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Password</label>
            <input 
              type="password" 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#E8A88B] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="button"
            className="w-full bg-gradient-to-r from-[#FDF8F5] to-[#EAE0D5] text-[#4A3224] py-3.5 rounded-lg font-black text-xs tracking-widest hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(232,168,139,0.3)] transition-all duration-300 mt-4"
          >
            SECURE LOGIN
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#E8A88B] font-bold hover:underline transition-all">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}