export default function ArtisanDirectoryTable({ artisans, updatingId, normalizeStatus, getStatusLabel, onStatusUpdate }) {
  return (
    <div className="bg-white rounded-3xl border border-[#EAE0D5] shadow-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Artisan Name</th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Valid ID</th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Target Workshop</th>
            <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Status</th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Review</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {artisans.map((artisan) => {
            const normalizedStatus = normalizeStatus(artisan.account_status)
            const isUpdating = updatingId === artisan.id
            const isReviewable = normalizedStatus === 'pending' || normalizedStatus === 'pending_approval'

            return (
              <tr key={artisan.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="font-bold text-[#4A3224] text-xs uppercase tracking-widest">{artisan.full_name}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{artisan.email}</div>
                </td>

                <td className="px-8 py-5">
                  {artisan.valid_id_url ? (
                    <a href={artisan.valid_id_url} target="_blank" rel="noreferrer" className="block w-16 h-10 overflow-hidden rounded-md border border-gray-200 hover:border-[#D17B57] transition-all">
                      <img src={artisan.valid_id_url} alt="ID" className="w-full h-full object-cover" />
                    </a>
                  ) : <span className="text-[9px] text-gray-300 font-bold uppercase">No ID</span>}
                </td>

                <td className="px-8 py-5">
                  {artisan.tbl_workshops ? (
                    <div className="flex items-center gap-3">
                      {artisan.tbl_workshops.banner_url && (
                        <img src={artisan.tbl_workshops.banner_url} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                      )}
                      <div>
                        <div className="text-[10px] font-black text-[#4A3224] uppercase">{artisan.tbl_workshops.name}</div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-tighter">{artisan.tbl_workshops.address}</div>
                      </div>
                    </div>
                  ) : <span className="text-[9px] text-gray-300 font-bold uppercase">No Workshop Selected</span>}
                </td>

                <td className="px-8 py-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm border ${
                    normalizedStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    normalizedStatus === 'pending_approval' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {getStatusLabel(artisan.account_status)}
                  </span>
                </td>

                <td className="px-8 py-5 text-right space-x-2">
                  {isReviewable && (
                    <>
                      <button
                        disabled={isUpdating}
                        onClick={() => onStatusUpdate(artisan.id, 'approved')}
                        className="bg-[#D17B57] text-white text-[9px] font-black uppercase px-3 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isUpdating ? 'Working...' : 'Approve'}
                      </button>
                      <button
                        disabled={isUpdating}
                        onClick={() => onStatusUpdate(artisan.id, 'pending')}
                        className="text-red-500 border border-red-100 text-[9px] font-black uppercase px-3 py-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        {isUpdating ? 'Working...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {normalizedStatus === 'approved' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => onStatusUpdate(artisan.id, 'pending')}
                      className="text-gray-400 text-[9px] font-bold uppercase hover:text-red-500 transition-all disabled:opacity-50"
                    >
                      {isUpdating ? 'Working...' : 'Revoke'}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
