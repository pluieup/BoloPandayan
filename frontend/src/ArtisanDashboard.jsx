import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import UploadBoloModal from './UploadBoloModal'

export default function ArtisanDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [myProducts, setMyProducts] = useState([])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return navigate('/')

        const { data: profileRows, error: profileError } = await supabase
      .from('tbl_user_profiles')
      .select('*')
      .eq('id', user.id)
            .limit(1)

        if (profileError) {
            await supabase.auth.signOut()
            return navigate('/')
        }

        const profileData = profileRows?.[0] ?? null

        if (!profileData) {
            await supabase.auth.signOut()
            return navigate('/')
        }

        setProfile(profileData)

    const { data: productData } = await supabase
      .from('tbl_products')
      .select('*')
      .eq('workshop_id', user.id)
      .order('created_at', { ascending: false })

    if (productData) setMyProducts(productData)

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5]">
      <div className="text-[#4A3224] font-serif animate-pulse tracking-widest uppercase font-black">
        Loading Storefront...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F5] font-sans">
      
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-sm border-b border-white/20 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-black font-serif tracking-[0.2em] text-[#4A3224] uppercase hidden sm:block">Bolo Pandayan</h1>
            <div className="px-3 py-1 bg-[#4A3224]/10 text-[#4A3224] rounded-full text-[10px] font-black tracking-widest uppercase border border-[#4A3224]/20">
                {profile?.account_status || 'Pending'}
            </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#D17B57] transition-colors uppercase hidden sm:flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                View Public Site
            </Link>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                <button onClick={() => setIsProfileEditOpen(true)} className="w-8 h-8 rounded-full bg-[#D17B57] flex items-center justify-center text-white font-black shadow-lg hover:scale-105 transition-transform" title="Edit Profile">
                    {profile?.full_name?.charAt(0) || 'A'}
                </button>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </div>
      </nav>

      <header className="relative h-72 md:h-96 bg-[#2A1F1A] overflow-hidden group">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 transition-opacity group-hover:opacity-50"
            style={{ backgroundImage: `url(${profile?.banner_url || '/assets/Background.png'})` }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F5] via-[#2A1F1A]/20 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 pt-20 flex justify-between items-end">
            <div>
                <h2 className="text-4xl md:text-6xl font-black text-white font-serif uppercase tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2">
                    {profile?.shop_name || 'My Pandayan'}
                </h2>
                <p className="text-gray-200 font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2 drop-shadow-md">
                    <svg className="w-4 h-4 text-[#D17B57]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {profile?.shop_address || 'Loay, Bohol'}
                </p>
            </div>
            
            <button 
                onClick={() => setIsProfileEditOpen(true)}
                className="px-6 py-3 bg-white/90 backdrop-blur text-[#4A3224] border border-[#EAE0D5] rounded-xl text-[10px] font-black tracking-widest hover:bg-[#D17B57] hover:text-white transition-all shadow-lg uppercase flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Shop Details
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
            <div>
                <h3 className="text-3xl font-black text-[#4A3224] font-serif uppercase mb-2">Heritage Collection</h3>
                <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">Document and manage your masterworks</p>
            </div>
            {profile?.is_approved ? (
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-8 py-4 bg-[#D17B57] text-white rounded-2xl text-xs font-black tracking-widest hover:bg-[#4A3224] transition-all shadow-lg hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    UPLOAD MASTERWORK
                </button>
            ) : (
                <div className="group relative flex flex-col items-center">
                    <button
                        disabled
                        className="px-8 py-4 bg-[#EAE0D5] text-gray-400 rounded-2xl text-xs font-black tracking-widest uppercase cursor-not-allowed border border-gray-300 flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        UPLOAD MASTERWORK
                    </button>
                    {/* Dark Tooltip */}
                    <span className="absolute -top-12 scale-0 transition-all rounded-lg bg-[#4A3224] p-3 text-[10px] font-black tracking-widest text-[#FDF8F5] group-hover:scale-100 uppercase shadow-xl w-max z-50">
                        Awaiting LGU Verification
                    </span>
                </div>
            )}
                    </div>

        {myProducts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#EAE0D5] rounded-[3rem] py-32 text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#FDF8F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#EAE0D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-[#4A3224] font-serif italic text-xl mb-2">Your collection is empty.</p>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Start by documenting your first design</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                {myProducts.map((product, index) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        index={index}
                        onEdit={() => {
                            setEditingProduct(product)
                            setIsUploadOpen(true)
                        }}
                        onRefresh={fetchProfile}
                    />
                ))}
            </div>
        )}
      </main>

      <UploadBoloModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false)
          setEditingProduct(null)
        }}
        artisanId={profile?.id}
        onUploadSuccess={fetchProfile}
        editingProduct={editingProduct}
      />

      <EditProfileModal 
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        profile={profile}
        onSaveSuccess={fetchProfile}
      />
    </div>
  )
}

function ProductCard({ product, index, onEdit, onRefresh }) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        try {
            const filePath = product.image_url.split('/bolos/')[1]
            if (filePath) {
                await supabase.storage.from('bolos').remove([filePath])
            }
            const { error } = await supabase.from('tbl_products').delete().eq('id', product.id)
            if (error) throw error
            onRefresh()
        } catch (err) {
            alert("Delete failed: " + err.message)
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <div 
            className="bg-white rounded-[2rem] border border-[#EAE0D5] overflow-hidden group shadow-sm hover:shadow-xl transition-all flex flex-col animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="aspect-[4/3] overflow-hidden relative">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-[#4A3224] shadow-sm uppercase tracking-tighter">
                    {product.blade_material}
                </div>
            </div>
            
            {/* Added min-h-[104px] so the card height doesn't jump when swapping to the delete view */}
            <div className="p-6 min-h-[104px] flex justify-between items-start gap-4">
                {!showConfirm ? (
                    <>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-black text-[#4A3224] font-serif mb-1 uppercase tracking-tight line-clamp-2 break-words">
                                {product.name}
                            </h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                Handle: {product.handle_material}
                            </p>
                        </div>
                        
                        <div className="flex gap-2 shrink-0 mt-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={onEdit} className="p-2.5 bg-[#FDF8F5] text-[#D17B57] border border-[#EAE0D5] rounded-xl hover:bg-[#D17B57] hover:text-white transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => setShowConfirm(true)} className="p-2.5 bg-[#FDF8F5] text-red-400 border border-[#EAE0D5] rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="w-full flex items-center justify-between animate-in fade-in slide-in-from-right-4 duration-300">
                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">Delete Item?</span>
                        <div className="flex gap-2">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md">
                                {isDeleting ? '...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function EditProfileModal({ isOpen, onClose, profile, onSaveSuccess }) {
    const [formData, setFormData] = useState({ ...profile })
    const [bannerFile, setBannerFile] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setFormData({ ...profile })
            setBannerFile(null)
        }
    }, [isOpen, profile])

    if (!isOpen) return null

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        
        try {
            let finalBannerUrl = formData.banner_url

            if (bannerFile) {
                const fileExt = bannerFile.name.split('.').pop()
                const fileName = `banner_${Math.random()}.${fileExt}`
                const filePath = `${profile.id}/${fileName}`

                const { error: uploadError } = await supabase.storage.from('bolos').upload(filePath, bannerFile)
                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage.from('bolos').getPublicUrl(filePath)
                finalBannerUrl = urlData.publicUrl
            }

            const { error } = await supabase
                .from('tbl_user_profiles')
                .update({
                    full_name: formData.full_name,
                    shop_name: formData.shop_name,
                    shop_address: formData.shop_address,
                    banner_url: finalBannerUrl
                })
                .eq('id', profile.id)
            
            if (error) throw error
            
            onSaveSuccess()
            onClose()
        } catch (err) {
            alert(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#4A3224]/90 backdrop-blur-md" onClick={onClose}></div>
            <form onSubmit={handleSave} className="relative z-10 w-full max-w-md bg-[#FDF8F5] rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-3xl font-black text-[#4A3224] font-serif uppercase mb-2">Shop Profile</h2>
                <p className="text-[10px] font-bold text-[#D17B57] uppercase tracking-[0.3em] mb-8">Update Public Details</p>
                
                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Shop Banner Photo</label>
                        <div className="border-2 border-dashed border-[#D17B57]/30 rounded-2xl p-4 text-center bg-white/50">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={e => setBannerFile(e.target.files[0])} 
                                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#4A3224] file:text-white cursor-pointer w-full" 
                            />
                            <p className="text-[10px] mt-2 text-[#D17B57] font-bold uppercase tracking-widest">Leave blank to keep current banner</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Artisan Name</label>
                        <input required type="text" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Workshop Name</label>
                        <input required type="text" value={formData.shop_name || ''} onChange={e => setFormData({...formData, shop_name: e.target.value})} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                        <input required type="text" value={formData.shop_address || ''} onChange={e => setFormData({...formData, shop_address: e.target.value})} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" />
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#4A3224]">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-[2] py-4 bg-[#4A3224] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D17B57] transition-all shadow-lg">
                        {saving ? 'Saving...' : 'Update Storefront'}
                    </button>
                </div>
            </form>
        </div>
    )
}