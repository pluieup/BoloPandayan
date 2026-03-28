import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password',
    });
    if (error) setErrorMsg(error.message);
    else alert("Check your email for the reset link!");
  };

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
        .limit(1)
        .maybeSingle();

      if (profileError) throw profileError
      if (!profile) throw new Error('Profile not found. Please contact support or re-register.')

      navigate(profile.role === 'admin' || profile.role === 'developer' ? '/lgu-dashboard' : '/artisan-dashboard')
      onClose()

    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Modal Overlay Wrapper: Added padding-top to ensure it clears the navbar 
    // Adjust pt-24 if your navbar is taller or shorter
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pt-24">
      
      {/* Background Dimmer */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* The Login Card: Narrowed width (max-w-[360px]) and tightened padding (p-8) */}
      <div className="relative w-full max-w-[360px] bg-[#FDF8F5] rounded-[2rem] p-8 shadow-2xl border border-[#EAE0D5] z-10">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#4A3224] font-serif uppercase tracking-widest mb-1.5">Login</h2>
          <p className="text-[#8B5E3C] text-[9px] font-bold uppercase tracking-[0.2em]">Heritage Portal</p>
        </div>

        {errorMsg && <div className="text-red-500 text-[10px] font-bold text-center mb-5 uppercase tracking-wider bg-red-50 p-2 rounded-lg border border-red-100">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full bg-white border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm text-[#4A3224] placeholder:text-[#8B5E3C]/50 focus:outline-none focus:border-[#D17B57] focus:ring-1 focus:ring-[#D17B57]/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              className="w-full bg-white border border-[#EAE0D5] rounded-xl px-4 py-3 text-sm text-[#4A3224] placeholder:text-[#8B5E3C]/50 focus:outline-none focus:border-[#D17B57] focus:ring-1 focus:ring-[#D17B57]/30 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8B5E3C]/60 hover:text-[#D17B57] transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"></path></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
              )}
            </button>
          </div>

          <div className="text-right">
            <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black text-[#D17B57] hover:text-[#4A3224] transition-colors uppercase tracking-widest">
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A3224] text-white py-3.5 rounded-xl font-bold text-[10px] tracking-[0.2em] hover:bg-[#362419] transition-all disabled:opacity-50 mt-1 shadow-lg shadow-[#4A3224]/20"
          >
            {loading ? 'VERIFYING...' : 'LOGIN'}
          </button>
          
          <div className="mt-5 pt-5 border-t border-[#EAE0D5] flex flex-col items-center gap-4">
            <Link to="/register" onClick={onClose} className="text-[10px] text-[#8B5E3C] font-black uppercase tracking-widest hover:text-[#D17B57] transition-colors">
              Register a new account
            </Link>
            
            <button 
              type="button"
              onClick={onClose} 
              className="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-black tracking-widest uppercase hover:bg-white/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Return
            </button>
          </div>        
        </form>
      </div>
    </div>
  )
}