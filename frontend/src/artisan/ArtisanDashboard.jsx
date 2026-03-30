import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import UploadBoloModal from '../components/UploadBoloModal'
import ProductCard from './ProductCard'
import EditProfileModal from './EditProfileModal'
import EditPersonalProfileModal from './EditPersonalProfileModal'
import JoinWorkshopView from './JoinWorkshopView'

export default function ArtisanDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
  const [isPersonalEditOpen, setIsPersonalEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [myProducts, setMyProducts] = useState([])
  const [myWorkshop, setMyWorkshop] = useState(null)

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

        let profileData = profileRows?.[0] ?? null

        if (!profileData) {
            await supabase.auth.signOut()
            return navigate('/')
        }

        let resolvedWorkshop = null

        // Fetch the workshop data to check ownership
    if (profileData.workshop_id) {
      const { data: workshopData } = await supabase
        .from('tbl_workshops')
        .select('*')
        .eq('id', profileData.workshop_id)
        .single()

      if (workshopData) {
        resolvedWorkshop = workshopData
      } else {
        // Clear stale workshop references so user is redirected to workshop setup.
        await supabase
          .from('tbl_user_profiles')
          .update({ workshop_id: null })
          .eq('id', profileData.id)

        profileData = { ...profileData, workshop_id: null }
      }
    }

    setProfile(profileData)
    setMyWorkshop(resolvedWorkshop)

    let productData = []
    if (profileData.workshop_id) {
      const { data } = await supabase
        .from('tbl_products')
        .select('*')
        .eq('workshop_id', profileData.workshop_id)
        .order('created_at', { ascending: false })
      productData = data || []
    }

    setMyProducts(productData)

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0A0A0A] text-[#FDF8F5]">
      <p className="action-label loading-pulse text-[11px]">Loading Storefront...</p>
    </div>
  )

    const normalizedStatus = (profile?.account_status || '').toLowerCase()
    const hasWorkshop = !!profile?.workshop_id

    if (!hasWorkshop) {
      return <JoinWorkshopView profile={profile} onRefresh={fetchProfile} />
    }

    if (normalizedStatus === 'pending' || normalizedStatus === 'pending_approval') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6 text-center">
        <div className="max-w-md bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20">
          <div className="w-16 h-16 bg-[#D17B57]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#D17B57] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-widest">
            {normalizedStatus === 'pending' ? 'Submission Received' : 'Verification Pending'}
          </h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed">
            {normalizedStatus === 'pending'
              ? 'Your pandayan setup has been submitted. Please wait while the LGU Admin reviews your profile and workshop application.'
              : 'The LGU Admin is currently reviewing your profile and workshop application. You will be notified once you are approved to publish products.'}
          </p>
          <button onClick={handleLogout} className="mt-8 text-[10px] font-black text-[#D17B57] uppercase tracking-widest hover:underline">Sign Out</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] font-sans">
      
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-sm border-b border-white/20 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-black font-serif tracking-[0.2em] text-[#4A3224] uppercase hidden sm:block">Bolo Pandayan</h1>
            <div className="px-3 py-1 bg-[#4A3224]/10 text-[#4A3224] rounded-full text-[10px] font-black tracking-widest uppercase border border-[#4A3224]/20">
                {normalizedStatus || 'pending'}
            </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#D17B57] transition-colors uppercase flex items-center gap-2" title="View Public Site">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span className="hidden sm:inline">View Public Site</span>
            </Link>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                <button onClick={() => setIsProfileEditOpen(true)} className="w-8 h-8 rounded-full bg-[#D17B57] flex items-center justify-center text-white font-black shadow-lg hover:scale-105 transition-transform overflow-hidden" title="Edit Profile">
                    {profile?.profile_photo_url ? (
                        <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        profile?.full_name?.charAt(0) || 'A'
                    )}
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
            style={{ backgroundImage: `url(${myWorkshop?.banner_url || '/assets/Background.png'})` }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F5] via-[#2A1F1A]/20 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 md:p-16 pt-20 flex flex-col sm:flex-row justify-end sm:justify-between items-start sm:items-end gap-4">
            <div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white font-serif uppercase tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2">
                    {myWorkshop?.name || 'My Pandayan'}
                </h2>
                <p className="text-gray-200 font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase flex items-center gap-2 drop-shadow-md">
                    <svg className="w-4 h-4 text-[#D17B57]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {myWorkshop?.address || 'Loay, Bohol'}
                </p>
                <p className="mt-2 sm:mt-4 max-w-2xl text-[#FDF8F5] text-xs sm:text-sm leading-relaxed drop-shadow-md line-clamp-2 sm:line-clamp-none">
                    {myWorkshop?.description || 'Add your workshop description from Edit Shop Details to tell visitors about your craft.'}
                </p>
            </div>
                        
            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={() => setIsPersonalEditOpen(true)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white/90 backdrop-blur text-[#4A3224] border border-[#EAE0D5] rounded-xl text-[10px] font-black tracking-widest hover:bg-[#D17B57] hover:text-white transition-all shadow-lg uppercase flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Edit Personal Profile
                </button>

                {/* Only show if the logged-in user is the owner of the workshop */}
                {myWorkshop?.owner_id === profile?.id && (
                <button 
                    onClick={() => setIsProfileEditOpen(true)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#4A3224]/90 backdrop-blur text-white border border-[#4A3224] rounded-xl text-[10px] font-black tracking-widest hover:bg-[#D17B57] hover:border-[#D17B57] transition-all shadow-lg uppercase flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Shop Details
                </button>
                )}
            </div>
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
        workshopId={myWorkshop?.id}
        onUploadSuccess={fetchProfile}
        editingProduct={editingProduct}
      />

      <EditProfileModal 
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        workshop={myWorkshop} 
        onSaveSuccess={fetchProfile}
              />

      <EditPersonalProfileModal 
        isOpen={isPersonalEditOpen}
        onClose={() => setIsPersonalEditOpen(false)}
        profile={profile}
        onSaveSuccess={fetchProfile}
      />
    </div>
  )
}
