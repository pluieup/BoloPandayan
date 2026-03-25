import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const LGUAdminDashboard = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tbl_user_profiles')
      .select('*')
      .eq('role', 'artisan') // Grabs everyone, pending or approved
      .order('created_at', { ascending: false });

    if (!error) setArtisans(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleApproval = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Update BOTH fields so the login gatekeeper lets them in!
    const { error } = await supabase
      .from('tbl_user_profiles')
      .update({ 
        is_approved: newStatus,
        account_status: newStatus ? 'approved' : 'pending' 
      })
      .eq('id', id);

    if (!error) fetchArtisans(); 
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
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
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all font-bold text-[10px] tracking-widest uppercase"
        >
          Logout
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-[#1A2E35] uppercase tracking-widest mb-1">Artisan Directory</h2>
            <p className="text-sm font-bold text-gray-400 uppercase">Review and Verify Local Blacksmiths</p>
          </div>
        </div>

        {/* Artisan Table Section */}
        <div className="bg-white rounded-3xl border border-[#EAE0D5] shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-4">Artisan Name</th>
                <th className="px-8 py-4">Shop Details</th>
                <th className="px-8 py-4 text-center">Valid ID</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-bold text-sm">Loading Applications...</td></tr>
              ) : artisans.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-bold text-sm">No artisans found.</td></tr>
              ) : (
                artisans.map((artisan) => (
                  <tr key={artisan.id} className="hover:bg-[#FDF8F5]/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-[#4A3224]">{artisan.full_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{artisan.id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-[#1A2E35]">{artisan.shop_name || 'No Shop Set'}</p>
                      <p className="text-xs font-medium text-gray-500">{artisan.shop_address}</p>
                    </td>
                    
                    {/* NEW VALID ID COLUMN */}
                    <td className="px-8 py-5 text-center">
                      {artisan.valid_id_url ? (
                        <a 
                          href={artisan.valid_id_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-1.5 bg-[#1A2E35] text-white rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-[#D17B57] transition-colors shadow-md"
                        >
                          View ID
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-gray-100 px-3 py-1 rounded-md">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm border ${artisan.is_approved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-[#D17B57] border-orange-200'}`}>
                        {artisan.is_approved ? '✓ Verified' : '● Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => toggleApproval(artisan.id, artisan.is_approved)}
                        className={`text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-lg transition-all border ${artisan.is_approved ? 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-100' : 'bg-[#D17B57] text-white hover:bg-[#A65B3D] hover:shadow-lg border-transparent'}`}
                      >
                        {artisan.is_approved ? 'Revoke' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LGUAdminDashboard;