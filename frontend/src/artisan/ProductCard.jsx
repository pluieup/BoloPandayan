import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ProductCard({ product, index, onEdit, onRefresh }) {
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
      alert('Delete failed: ' + err.message)
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
