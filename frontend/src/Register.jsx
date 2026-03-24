import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient' // Importing your database connection!

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('artisan')

  // 1. State to hold our form data
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // State for loading and feedback messages
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // 2. The function that runs when the form is submitted
  const handleRegister = async (e) => {
    e.preventDefault() // Prevents the page from refreshing
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // Step A: Create the secure Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // Step B: If successful, insert their details into our custom table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('tbl_user_profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: fullName,
              role: role,
              shop_name: role === 'artisan' ? shopName : null,
              shop_address: role === 'artisan' ? shopAddress : null,
              account_status: 'pending'
            }
          ])

        if (profileError) throw profileError

        setSuccessMsg('Application submitted! Awaiting LGU approval.')
        
        // Send them to the login page after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

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

        {/* Toggle Buttons */}
        <div className="flex bg-black/30 rounded-lg p-1 mb-8 border border-white/10">
          <button 
            type="button"
            onClick={() => setRole('artisan')}
            className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-md transition-all ${role === 'artisan' ? 'bg-[#D17B57] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Local Artisan
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-md transition-all ${role === 'admin' ? 'bg-[#D17B57] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            LGU Admin
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg mb-4 text-center">{errorMsg}</div>}
        {successMsg && <div className="bg-green-500/20 border border-green-500/50 text-green-200 text-xs p-3 rounded-lg mb-4 text-center">{successMsg}</div>}

        {/* The Form */}
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Full Name</label>
            <input 
              required
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" 
              placeholder="Juan Dela Cruz" 
            />
          </div>

          {role === 'artisan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/10 p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Shop Name</label>
                <input 
                  required={role === 'artisan'}
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" 
                  placeholder="e.g. Pandayan sa Loay" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Shop Address</label>
                <input 
                  required={role === 'artisan'}
                  type="text" 
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" 
                  placeholder="Barangay, Loay" 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" 
              placeholder="juan@example.com" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8A88B]" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FDF8F5] to-[#EAE0D5] text-[#4A3224] py-3.5 rounded-lg font-black text-xs tracking-widest hover:scale-[1.02] transition-all mt-6 disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : (role === 'artisan' ? 'SUBMIT FOR APPROVAL' : 'CREATE ADMIN ACCOUNT')}
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