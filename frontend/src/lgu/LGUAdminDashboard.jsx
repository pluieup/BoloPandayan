import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ConfirmationModal from './ConfirmationModal';
import ArtisanDirectoryTable from './ArtisanDirectoryTable';


const LGUAdminDashboard = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm', // 'confirm' or 'alert'
    onConfirm: () => {},
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tbl_user_profiles')
      .select('*, tbl_workshops(name, address, banner_url)') 
      .eq('role', 'artisan') 
      .order('created_at', { ascending: false });

    if (!error) setArtisans(data);
    setLoading(false);  
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleViewPublicGallery = () => {
    window.location.href = '/#collection';
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

  // Helper to show custom alerts
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

    // Show Confirmation Modal
    setModalConfig({
      isOpen: true,
      title: 'Confirm Action',
      message: `Are you sure you want to ${actionLabel} this artisan account?`,
      type: 'confirm',
      onConfirm: async () => {
        // Close confirm modal and proceed
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
    <div className="min-h-screen bg-[#FDF8F5] relative">
      
      {/* Mount Modal */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Top Header Bar */}
      <div className="bg-white border-b border-[#EAE0D5] px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <div className="w-10 h-10 shrink-0 overflow-hidden">
            <img src="/assets/Loay.png" alt="Loay Seal" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-sm sm:text-base font-black tracking-widest text-[#1A2E35] uppercase text-center sm:text-left">
            Bolo Pandayan <span className="text-[#D17B57] sm:ml-2 block sm:inline">Admin Portal</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center">
          <button
            onClick={handleViewPublicGallery}
            className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#D17B57] transition-colors uppercase flex items-center gap-2" title="View Public Site"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">View Public Site</span>
          </button>

          <div className="flex items-center pl-4 border-l border-gray-300">
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors" title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-[#1A2E35] uppercase tracking-widest mb-1">Artisan Directory</h2>
            <p className="text-sm font-bold text-gray-400 uppercase">Review and Verify Local Blacksmiths</p>
          </div>
        </div>

        <ArtisanDirectoryTable
          artisans={artisans}
          updatingId={updatingId}
          normalizeStatus={normalizeStatus}
          getStatusLabel={getStatusLabel}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default LGUAdminDashboard;