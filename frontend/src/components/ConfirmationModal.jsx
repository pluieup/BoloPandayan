export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, type = 'confirm' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={type === 'alert' ? onConfirm : onCancel}></div>

      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-[#EAE0D5] transform transition-all">
        <div className="text-center mb-6">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            title.toLowerCase().includes('success') ? 'bg-green-100 text-green-600' :
            title.toLowerCase().includes('error') || title.toLowerCase().includes('failed') ? 'bg-red-100 text-red-600' :
            'bg-orange-100 text-[#D17B57]'
          }`}>
            {title.toLowerCase().includes('success') ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : title.toLowerCase().includes('error') || title.toLowerCase().includes('failed') ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            )}
          </div>
          <h3 className="text-lg font-black text-[#1A2E35] uppercase tracking-widest">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">{message}</p>
        </div>

        <div className="flex gap-3 justify-center">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-colors ${
              title.toLowerCase().includes('success') ? 'bg-green-600 hover:bg-green-700' :
              title.toLowerCase().includes('error') || title.toLowerCase().includes('failed') ? 'bg-red-600 hover:bg-red-700' :
              'bg-[#D17B57] hover:bg-[#b06445]'
            }`}
          >
            {type === 'alert' ? 'OK' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
