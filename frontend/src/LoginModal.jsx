import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null // Don't render if not open

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const { data: profile, error: profileError } = await supabase
        .from('tbl_user_profiles')
        .select('account_status, role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      if (profile.account_status === 'pending') {
        await supabase.auth.signOut()
        setErrorMsg('Your account is still pending LGU approval.')
        return
      }

      // Success Routing
      navigate(profile.role === 'admin' ? '/admin-dashboard' : '/artisan-dashboard')
      onClose() // Close modal on success
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Overlay - Clicking this closes the modal */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative z-10 w-full max-w-md bg-[#FDF8F5] rounded-3xl p-8 shadow-2xl border border-[#EAE0D5]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-[#4A3224] font-serif tracking-widest uppercase">Login</h2>
          <p className="text-[#6B5041] text-[10px] tracking-widest uppercase mt-2">Access the Portal</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full bg-white border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-white border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D17B57]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A3224] text-white py-3.5 rounded-xl font-bold text-xs tracking-widest hover:bg-[#D17B57] transition-all disabled:opacity-50"
          >
            {loading ? 'VERIFYING...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center">
            <Link to="/register" onClick={onClose} className="text-xs text-[#D17B57] font-bold hover:underline">
                Register as an Artisan
            </Link>
            <button 
                onClick={onClose} 
                className="text-xs text-gray-500 font-medium hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                BACK TO HOME
            </button>
        </div>
      </div>
    </div>
  )
}