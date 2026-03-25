import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('artisan')

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [idFile, setIdFile] = useState(null)

  // Workshop Selection State
  const [workshops, setWorkshops] = useState([])
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('')
  const [isCreatingNewWorkshop, setIsCreatingNewWorkshop] = useState(false)
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')

  // Feedback State
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const getFriendlyAuthError = (error) => {
    const message = (error?.message || '').toLowerCase()
    if (message.includes('email rate limit exceeded')) {
      return 'Too many email requests were sent. Please wait a minute, then try again.'
    }
    if (message.includes('cannot coerce the result to a single json object')) {
      return 'A data lookup returned an unexpected number of rows. Please try again or choose a different workshop option.'
    }
    if (message.includes('duplicate key value violates unique constraint "unique_owner"')) {
      return 'This account already has a workshop record. Your shop details were reused.'
    }
    return error?.message || 'Something went wrong. Please try again.'
  }

  const isAlreadyRegisteredError = (error) => {
    const message = (error?.message || '').toLowerCase()
    return message.includes('user already registered') || message.includes('already registered')
  }

  // Fetch existing workshops on component mount
  useEffect(() => {
    const fetchWorkshops = async () => {
      const { data, error } = await supabase
        .from('tbl_workshops')
        .select('id, name, address')
        .order('name', { ascending: true })
      
      if (data) setWorkshops(data)
      if (error) console.error("Error fetching workshops:", error.message)
    }
    fetchWorkshops()
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Validation for Artisan
      if (role === 'artisan' && !isCreatingNewWorkshop && !selectedWorkshopId) {
        throw new Error("Please select an existing workshop or register a new one.")
      }

      // 2. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      let userId = null

      if (authError && !isAlreadyRegisteredError(authError)) {
        throw authError
      }

      if (authError || authData?.user?.identities?.length === 0) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          throw new Error('This email is already registered. Use the original password to continue registration, or reset your password first.')
        }

        userId = signInData?.user?.id ?? null
      } else {
        userId = authData?.user?.id ?? null
      }

      if (!userId) {
        throw new Error('Unable to determine account ID. Please try again.')
      }

      let idUrl = null

      // 3. Upload ID Image (Artisan only)
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
      }

      // 4. Workshop Logic: resolve final shop data
      let finalShopName = null
      let finalShopAddress = null

      if (role === 'artisan' && isCreatingNewWorkshop) {
        const { error: wsError } = await supabase
          .from('tbl_workshops')
          .upsert([
            {
              owner_id: userId,
              name: shopName,
              address: shopAddress,
            },
          ], { onConflict: 'owner_id' })

        if (wsError) throw wsError
        finalShopName = shopName
        finalShopAddress = shopAddress
      }

      if (role === 'artisan' && !isCreatingNewWorkshop) {
        const selectedWorkshop = workshops.find((w) => String(w.id) === String(selectedWorkshopId))
        if (!selectedWorkshop) {
          throw new Error('Selected workshop not found. Please pick a valid workshop.')
        }
        finalShopName = selectedWorkshop.name
        finalShopAddress = selectedWorkshop.address ?? null
      }

      // 5. Create the Master Profile
      const { data: existingProfiles, error: existingProfileError } = await supabase
        .from('tbl_user_profiles')
        .select('account_status, is_approved')
        .eq('id', userId)
        .limit(1)

      if (existingProfileError) throw existingProfileError
      const existingProfile = existingProfiles?.[0] ?? null

      const nextAccountStatus = existingProfile?.account_status === 'approved'
        ? 'approved'
        : (role === 'admin' ? 'approved' : 'pending')

      const nextIsApproved = existingProfile?.is_approved === true || role === 'admin'

      const { error: profileError } = await supabase
        .from('tbl_user_profiles')
        .upsert([
          {
            id: userId,
            full_name: fullName,
            role: role,
            account_status: nextAccountStatus,
            is_approved: nextIsApproved,
            valid_id_url: idUrl,
            shop_name: role === 'artisan' ? finalShopName : null,
            shop_address: role === 'artisan' ? finalShopAddress : null
          }
        ], { onConflict: 'id' })

      if (profileError) throw profileError

      // Sign out after registration to prevent auto-login before approval
      await supabase.auth.signOut()

      setSuccessMsg("Registration successful! Please check your email for verification. LGU approval is required before you can log in.")
      
      // Reset form
      setFullName(''); setEmail(''); setPassword(''); setIdFile(null);
      setShopName(''); setShopAddress(''); setSelectedWorkshopId('');

    } catch (error) {
      setErrorMsg(getFriendlyAuthError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center px-4 py-12" style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-[480px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-[#FDF8F5] font-serif tracking-widest uppercase">PORTAL</h2>
          <p className="text-[#EAE0D5] text-[10px] tracking-widest uppercase mt-2">Create your heritage account</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-black/30 rounded-xl p-1 mb-6 border border-white/10">
          <button type="button" onClick={() => setRole('artisan')} className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all ${role === 'artisan' ? 'bg-[#D17B57] text-white' : 'text-gray-400'}`}>Local Artisan</button>
          <button type="button" onClick={() => setRole('admin')} className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all ${role === 'admin' ? 'bg-[#D17B57] text-white' : 'text-gray-400'}`}>LGU Admin</button>
        </div>

        {errorMsg && <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-[10px] p-3 rounded-lg mb-4 text-center font-bold">{errorMsg}</div>}
        {successMsg && <div className="bg-green-500/20 border border-green-500/50 text-green-200 text-[10px] p-3 rounded-lg mb-4 text-center font-bold">{successMsg}</div>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8A88B]" />

          {role === 'artisan' && (
            <div className="space-y-4 bg-black/10 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-[#EAE0D5] tracking-widest uppercase">Workshop / Pandayan</label>
                <button type="button" onClick={() => setIsCreatingNewWorkshop(!isCreatingNewWorkshop)} className="text-[9px] font-black text-[#E8A88B] hover:underline uppercase">
                  {isCreatingNewWorkshop ? "Join Existing" : "Register New Shop"}
                </button>
              </div>

              {!isCreatingNewWorkshop ? (
                <select required value={selectedWorkshopId} onChange={e => setSelectedWorkshopId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E8A88B]">
                  <option value="" className="bg-[#1A1A1A]">-- Select Workshop --</option>
                  {workshops.map(ws => <option key={ws.id} value={ws.id} className="bg-[#1A1A1A]">{ws.name}</option>)}
                </select>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input required type="text" placeholder="Shop Name" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none" />
                  <input required type="text" placeholder="Address" value={shopAddress} onChange={e => setShopAddress(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none" />
                </div>
              )}

              <div className="mt-2">
                <label className="block text-[9px] font-bold text-[#EAE0D5] tracking-widest mb-1 uppercase">Valid ID (Artisan Verification)</label>
                <input required type="file" accept="image/*" onChange={e => setIdFile(e.target.files[0])} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-[#4A3224] file:text-white" />
              </div>
            </div>
          )}

          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#FDF8F5] to-[#EAE0D5] text-[#4A3224] py-4 rounded-xl font-black text-[10px] tracking-widest hover:scale-[1.01] transition-all mt-4 disabled:opacity-50 uppercase shadow-lg">
            {loading ? 'PROCESSING...' : (role === 'artisan' ? 'SUBMIT FOR APPROVAL' : 'CREATE ADMIN ACCOUNT')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-xs text-gray-400 uppercase tracking-tighter">Already registered? <Link to="/" className="text-[#E8A88B] font-black hover:text-[#FDF8F5] transition-all ml-1">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}