import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ConfirmationModal from './ConfirmationModal';
import ArtisanDirectoryTable from './ArtisanDirectoryTable';

const LGUAdminDashboard = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [loadError, setLoadError] = useState('');
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm', 
    onConfirm: () => {},
  });

  const navigate = useNavigate();

  async function fetchArtisans() {
    setLoading(true);
    setLoadError('');
    const { data, error } = await supabase
      .from('tbl_user_profiles')
      .select('*, tbl_workshops:fk_profiles_workshop(name, address, banner_url)') 
      .eq('role', 'artisan') 
      .order('created_at', { ascending: false });

    if (error) {
      setArtisans([]);
      setLoadError(error.message || 'Failed to load artisan directory.');
    } else {
      setArtisans(data || []);
    }
    setLoading(false);  
  }

  useEffect(() => {
    const initializeArtisans = async () => {
      await fetchArtisans();
    };

    initializeArtisans();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const normalizeStatus = (status) => (status || '').toLowerCase();

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'approved') return 'Approved';
    if (normalized === 'pending_approval') return 'Pending';
    if (normalized === 'pending') return 'Pending';
    if (!normalized) return 'Pending';
    return normalized.replaceAll('_', ' ');
  };

  const showAlert = (title, message) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const actionLabel =
      newStatus === 'approved'
        ? 'approve'
        : newStatus === 'pending'
          ? 'set to pending'
          : 'update';

    setModalConfig({
      isOpen: true,
      title: 'Confirm Action',
      message: `Are you sure you want to ${actionLabel} this artisan account?`,
      type: 'confirm',
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        setUpdatingId(id);

        const { error } = await supabase
          .from('tbl_user_profiles')
          .update({
            account_status: newStatus,
            is_approved: newStatus === 'approved'
          })
          .eq('id', id);

        if (error) {
          showAlert('Update Failed', `${error.message}. Check RLS policies.`);
          setUpdatingId(null);
          return;
        }

        showAlert('Success', `Account is now ${getStatusLabel(newStatus)}.`);
        await fetchArtisans();
        setUpdatingId(null);
      }
    });
  };
  
  return (
    <div className="min-h-screen bg-[#FDF8F5] font-sans">
      
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* UNIVERSAL NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-sm border-b border-white/20 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-black font-serif tracking-[0.2em] text-[#4A3224] uppercase hidden sm:block">Bolo Pandayan</h1>
            <div className="px-3 py-1 bg-[#4A3224]/10 text-[#4A3224] rounded-full text-[10px] font-black tracking-widest uppercase border border-[#4A3224]/20 flex items-center gap-2">
                <img src="/assets/Loay.png" alt="Loay Seal" className="w-3 h-3 object-contain" />
                LGU ADMIN
            </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#D17B57] transition-colors uppercase flex items-center gap-2" title="View Public Site">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span className="hidden sm:inline">View Public Site</span>
            </Link>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2" title="Logout">
                    <span className="text-[10px] font-black tracking-widest uppercase hidden sm:inline">Logout</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </div>
      </nav>

      {/* UNIVERSAL HERO HEADER */}
      <header className="relative h-64 md:h-80 bg-[#2A1F1A] overflow-hidden group">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity" style={{ backgroundImage: `url('/assets/Background.png')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F5] via-[#2A1F1A]/60 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 md:p-12 pt-20 flex flex-col justify-end">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-serif uppercase tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2">
                LGU Admin Portal
            </h2>
            <p className="text-gray-200 font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase flex items-center gap-2 drop-shadow-md">
                Municipality of Loay
            </p>
        </div>
      </header>

      {/* UNIVERSAL MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-8 border-b border-[#EAE0D5] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#1A2E35] font-serif uppercase tracking-widest mb-1">Artisan Directory</h2>
            <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">Review and Verify Local Blacksmiths</p>
          </div>
        </div>

        {loading ? (
            <p className="text-sm font-bold text-gray-400 animate-pulse tracking-widest uppercase">Loading directory...</p>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-5 py-4 text-sm font-bold">
            Failed to load artisans: {loadError}
          </div>
        ) : artisans.length === 0 ? (
          <div className="rounded-2xl border border-[#EAE0D5] bg-white px-5 py-6 text-sm font-bold text-gray-500">
            No artisan submissions yet.
          </div>
        ) : (
          <ArtisanDirectoryTable
            artisans={artisans}
            updatingId={updatingId}
            normalizeStatus={normalizeStatus}
            getStatusLabel={getStatusLabel}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </main>
    </div>
  );
};

export default LGUAdminDashboard;