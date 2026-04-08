import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const [role, setRole] = useState('artisan')

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [idFile, setIdFile] = useState(null)
  
  // NEW: Password Toggle State
  const [showPassword, setShowPassword] = useState(false)

  // Feedback State
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (authData.user && authData.user.identities?.length === 0) {
        throw new Error("This email is already registered.")
      }

      const userId = authData.user.id
      let idUrl = null

      // 2. Create profile first so storage policies that depend on profile rows can pass
      const { error: profileError } = await supabase
        .from('tbl_user_profiles')
        .insert([
          {
          id: userId,
          full_name: fullName,
          role: role,
          account_status: role === 'lgu_admin' ? 'pending_approval' : 'pending',
          is_approved: false,
          workshop_id: null,
            valid_id_url: null
              }
        ])

      if (profileError) throw profileError

      // 3. Upload ID image and save URL (Artisan only)
      if (role === 'artisan' && idFile) {
        const fileExt = idFile.name.split('.').pop()
        const fileName = `${userId}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('artisan_ids')
          .upload(fileName, idFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('artisan_ids')
          .getPublicUrl(fileName)

        idUrl = publicUrlData.publicUrl

        const { error: updateIdError } = await supabase
          .from('tbl_user_profiles')
          .update({ valid_id_url: idUrl })
          .eq('id', userId)

        if (updateIdError) throw updateIdError
      }

      // Sign out after registration to prevent auto-login
      await supabase.auth.signOut()

      setSuccessMsg("Registration successful! You can now log in to access your dashboard.")
      
      // Reset form
      setFullName(''); setEmail(''); setPassword(''); setIdFile(null);

    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center px-4 py-12" style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-[480px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-[#FDF8F5] font-serif tracking-widest uppercase">Join the Portal</h2>
          <p className="text-[#EAE0D5] text-[10px] tracking-widest uppercase mt-2">Create your heritage account</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-black/30 rounded-xl p-1 mb-6 border border-white/10">
          <button type="button" onClick={() => setRole('artisan')} className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all ${role === 'artisan' ? 'bg-[#D17B57] text-white' : 'text-gray-400'}`}>Local Artisan</button>
          <button type="button" onClick={() => setRole('lgu_admin')} className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all ${role === 'lgu_admin' ? 'bg-[#D17B57] text-white' : 'text-gray-400'}`}>LGU Admin</button>
        </div>

        {errorMsg && <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-[10px] p-3 rounded-lg mb-4 text-center font-bold">{errorMsg}</div>}
        {successMsg && <div className="bg-green-500/20 border border-green-500/50 text-green-200 text-[10px] p-3 rounded-lg mb-4 text-center font-bold">{successMsg}</div>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8A88B]" />

          {/* Artisan ID Upload (Simplified layout) */}
          {role === 'artisan' && (
            <div className="bg-black/10 p-4 rounded-2xl border border-white/5">
              <label className="block text-[9px] font-bold text-[#EAE0D5] tracking-widest mb-2 uppercase">Valid ID (Artisan Verification)</label>
              <input required type="file" accept="image/*" onChange={e => setIdFile(e.target.files[0])} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-[#4A3224] file:text-white" />
            </div>
          )}

          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8A88B]" />
          
          {/* NEW: Password Input with Toggle */}
          <div className="relative">
            <input 
              required 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8A88B] pr-12" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#E8A88B] transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
              )}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#FDF8F5] to-[#EAE0D5] text-[#4A3224] py-4 rounded-xl font-black text-[10px] tracking-widest hover:scale-[1.01] transition-all mt-4 disabled:opacity-50 uppercase shadow-lg">
            {loading ? 'PROCESSING...' : (role === 'artisan' ? 'REGISTER ACCOUNT' : 'CREATE LGU ADMIN ACCOUNT')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-xs text-gray-400 uppercase tracking-tighter">Already registered? <Link to="/" className="text-[#E8A88B] font-black hover:text-[#FDF8F5] transition-all ml-1">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}