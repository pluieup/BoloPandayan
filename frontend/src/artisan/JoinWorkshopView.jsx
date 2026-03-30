import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function JoinWorkshopView({ profile, onRefresh }) {
  const [workshops, setWorkshops] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)

  const [shopData, setShopData] = useState({ name: '', address: '', description: '' })
  const [bannerFile, setBannerFile] = useState(null)

  useEffect(() => {
    const fetchShops = async () => {
      const { data } = await supabase.from('tbl_workshops').select('*').order('name')
      if (data) setWorkshops(data)
    }
    fetchShops()
  }, [])

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalWorkshopId = selectedId

      // 1. JOINING EXISTING WORKSHOP
      if (!isCreating) {
        const selectedWorkshop = workshops.find(ws => ws.id === selectedId)
        if (!selectedWorkshop) throw new Error('Please select a valid workshop.')
      }

      // 2. CREATING A NEW WORKSHOP
      if (isCreating) {
        let bannerUrl = null
        if (bannerFile) {
          const fileExt = bannerFile.name.split('.').pop()
          const fileName = `workshop_banner_${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage.from('bolos').upload(`${profile.id}/${fileName}`, bannerFile)
          if (uploadError) throw uploadError
          const { data: urlData } = supabase.storage.from('bolos').getPublicUrl(`${profile.id}/${fileName}`)
          bannerUrl = urlData.publicUrl
        }

        // Target the workshops table as the absolute Source of Truth
        const { data: newWS, error: wsError } = await supabase
          .from('tbl_workshops')
          .insert([{
            name: shopData.name,
            address: shopData.address,
            description: shopData.description, // <-- Added this to save to the workshop!
            banner_url: bannerUrl,
            owner_id: profile.id               // <-- The owner is securely set here
          }])
          .select()
          .single()

        if (wsError) throw wsError

        finalWorkshopId = newWS.id
      }

      // 3. UPDATE THE ARTISAN'S PROFILE
      // Only link the artisan to a workshop. Sensitive account fields are managed by LGU/developer flows.
      const { error: profileError } = await supabase
        .from('tbl_user_profiles')
        .update({
          workshop_id: finalWorkshopId
        })
        .eq('id', profile.id)

      if (profileError) throw profileError
      onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 shadow-2xl">
        <h2 className="text-2xl font-black text-white uppercase mb-2 tracking-widest font-serif">Setup Your Pandayan</h2>
        <p className="text-gray-400 text-[10px] mb-8 uppercase tracking-widest">Select your forge or register a new one for LGU review.</p>

        <div className="flex bg-black/40 rounded-xl p-1 mb-6 border border-white/5">
          <button type="button" onClick={() => setIsCreating(false)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${!isCreating ? 'bg-[#D17B57] text-white' : 'text-gray-500'}`}>Join Existing</button>
          <button type="button" onClick={() => setIsCreating(true)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${isCreating ? 'bg-[#D17B57] text-white' : 'text-gray-500'}`}>Create New</button>
        </div>

        {!isCreating ? (
          <select required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white mb-8 focus:outline-none focus:border-[#D17B57] appearance-none" onChange={e => setSelectedId(e.target.value)}>
            <option value="">-- Choose Workshop --</option>
            {workshops.map(ws => <option key={ws.id} value={ws.id} className="bg-gray-900">{ws.name}</option>)}
          </select>
        ) : (
          <div className="space-y-4 mb-8">
            <input required placeholder="Shop Name" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" onChange={e => setShopData({ ...shopData, name: e.target.value })} />
            <input required placeholder="Shop Location" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" onChange={e => setShopData({ ...shopData, address: e.target.value })} />
            <textarea placeholder="Workshop Description" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none" rows={4} onChange={e => setShopData({ ...shopData, description: e.target.value })} />
            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <label className="block text-[9px] font-bold text-gray-400 mb-2 uppercase">Shop Banner Photo</label>
              <input required type="file" accept="image/*" onChange={e => setBannerFile(e.target.files[0])} className="text-[10px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-[#4A3224] file:text-white" />
            </div>
          </div>
        )}

        <button disabled={loading} className="w-full py-5 bg-[#D17B57] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg">
          {loading ? 'Processing...' : 'Submit to LGU Admin'}
        </button>
      </form>
    </div>
  )
}
