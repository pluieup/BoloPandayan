import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Register() {
  const [role, setRole] = useState('artisan')

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center px-4 py-12"
      style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-[#FDF8F5] font-serif tracking-widest uppercase">Join the Portal</h2>
          <p className="text-[#EAE0D5] text-xs tracking-widest uppercase mt-2">Create your account</p>
        </div>

        {/* Role Selection Toggle */}
        <div className="flex bg-black/30 rounded-lg p-1 mb-8 border border-white/10">
          <button 
            onClick={() => setRole('artisan')}
            className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-md transition-all ${role === 'artisan' ? 'bg-[#D17B57] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Local Artisan
          </button>
          <button 
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-md transition-all ${role === 'admin' ? 'bg-[#D17B57] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            LGU Admin
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Full Name</label>
            <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" placeholder="Juan Dela Cruz" />
          </div>

          {/* Conditional Artisan Fields */}
          {role === 'artisan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/10 p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Shop Name</label>
                <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" placeholder="e.g. Pandayan sa Loay" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Shop Address</label>
                <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" placeholder="Barangay, Loay, Bohol" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Email Address</label>
            <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" placeholder="juan@example.com" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Password</label>
            <input type="password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" placeholder="••••••••" />
          </div>

          <button type="button" className="w-full bg-gradient-to-r from-[#FDF8F5] to-[#EAE0D5] text-[#4A3224] py-3.5 rounded-lg font-black text-xs tracking-widest hover:scale-[1.02] transition-all mt-6">
            {role === 'artisan' ? 'SUBMIT FOR APPROVAL' : 'CREATE ADMIN ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Already registered?{' '}
            <Link to="/login" className="text-[#E8A88B] font-bold hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}