import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function DeveloperDashboard() {
  const [pendingLGU, setPendingLGU] = useState([]);
  const [approvedLGU, setApprovedLGU] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLGUAdmins();
  }, []);

  const fetchLGUAdmins = async () => {
    try {
      setLoading(true);

      const { data: pending, error: pendingError } = await supabase
        .from('tbl_user_profiles')
        .select('id, full_name, account_status, created_at, updated_at')
        .eq('role', 'lgu_admin')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      const { data: approved, error: approvedError } = await supabase
        .from('tbl_user_profiles')
        .select('id, full_name, account_status, created_at, updated_at')
        .eq('role', 'lgu_admin')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;

      setPendingLGU(pending || []);
      setApprovedLGU(approved || []);
    } catch (err) {
      console.error('Error fetching LGU admins:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveLGU = async (id) => {
    try {
      setUpdatingId(id);
      const { error } = await supabase
        .from('tbl_user_profiles')
        .update({
          account_status: 'approved',
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchLGUAdmins();
    } catch (err) {
      alert(`Error approving LGU: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const revokeLGU = async (id) => {
    try {
      setUpdatingId(id);
      const { error } = await supabase
        .from('tbl_user_profiles')
        .update({
          account_status: 'pending_approval',
          is_approved: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchLGUAdmins();
    } catch (err) {
      alert(`Error revoking LGU: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] font-sans">
      
      {/* UNIVERSAL NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-sm border-b border-white/20 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-black font-serif tracking-[0.2em] text-[#4A3224] uppercase hidden sm:block">Bolo Pandayan</h1>
            <div className="px-3 py-1 bg-[#4A3224]/10 text-[#4A3224] rounded-full text-[10px] font-black tracking-widest uppercase border border-[#4A3224]/20">
                DEVELOPER
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
        <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity" style={{ backgroundImage: `url('/assets/Background.png')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F5] via-[#2A1F1A]/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 md:p-12 pt-20 flex flex-col justify-end">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-serif uppercase tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2">
                System Administration
            </h2>
            <p className="text-gray-200 font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase flex items-center gap-2 drop-shadow-md">
                Developer Operations & Management
            </p>
        </div>
      </header>

      {/* UNIVERSAL MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        
        <section className="mb-16">
          <div className="mb-8 border-b border-[#EAE0D5] pb-4">
            <h2 className="text-2xl font-black text-[#1A2E35] font-serif uppercase tracking-widest">Pending LGU Approvals</h2>
            <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">Review and authorize new government accounts</p>
          </div>

          {loading ? (
            <p className="text-sm font-bold text-gray-400 animate-pulse tracking-widest uppercase">Loading requests...</p>
          ) : pendingLGU.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE0D5] shadow-sm">
              <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">No pending requests.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg border border-[#EAE0D5] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDF8F5] border-b border-[#EAE0D5]">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">LGU Official Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Applied</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingLGU.map((lgu) => (
                    <tr key={lgu.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-[#4A3224] text-xs uppercase tracking-widest">{lgu.full_name}</td>
                      <td className="px-6 py-5 text-xs text-gray-400">{new Date(lgu.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => approveLGU(lgu.id)}
                          disabled={updatingId === lgu.id}
                          className="px-4 py-2 bg-[#D17B57] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#4A3224] transition-colors disabled:opacity-50"
                        >
                          {updatingId === lgu.id ? 'Approving...' : 'Approve Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <div className="mb-8 border-b border-[#EAE0D5] pb-4">
            <h2 className="text-2xl font-black text-[#1A2E35] font-serif uppercase tracking-widest">Active LGU Accounts</h2>
            <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">Manage authorized government personnel</p>
          </div>

          {loading ? (
             <p className="text-sm font-bold text-gray-400 animate-pulse tracking-widest uppercase">Loading accounts...</p>
          ) : approvedLGU.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE0D5] shadow-sm">
              <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">No active LGU admins.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg border border-[#EAE0D5] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDF8F5] border-b border-[#EAE0D5]">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">LGU Official Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Approved</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {approvedLGU.map((lgu) => (
                    <tr key={lgu.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-[#4A3224] text-xs uppercase tracking-widest">{lgu.full_name}</td>
                      <td className="px-6 py-5 text-xs text-gray-400">{new Date(lgu.updated_at || lgu.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => revokeLGU(lgu.id)}
                          disabled={updatingId === lgu.id}
                          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}