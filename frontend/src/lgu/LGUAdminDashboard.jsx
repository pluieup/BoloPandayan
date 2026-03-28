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
      <div className="bg-white border-b border-[#EAE0D5] px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1A2E35] rounded-lg flex items-center justify-center">
            <span className="text-white text-[10px] font-black">LGU</span>
          </div>
          <h1 className="text-sm font-black tracking-widest text-[#1A2E35] uppercase">
            Bolo Pandayan <span className="text-[#D17B57] ml-2">Admin Portal</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewPublicGallery}
            className="flex items-center gap-2 px-4 py-2 border border-[#EAE0D5] text-[#1A2E35] rounded-xl hover:bg-[#FDF8F5] transition-all font-bold text-[10px] tracking-widest uppercase"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View Public Gallery
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all font-bold text-[10px] tracking-widest uppercase"
          >
            Logout
          </button>
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