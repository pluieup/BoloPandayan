import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function EditProfileModal({ isOpen, onClose, profile, onSaveSuccess }) {
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
          shop_description: formData.shop_description,
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
            <input required type="text" value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Workshop Name</label>
            <input required type="text" value={formData.shop_name || ''} onChange={e => setFormData({ ...formData, shop_name: e.target.value })} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Location</label>
            <input required type="text" value={formData.shop_address || ''} onChange={e => setFormData({ ...formData, shop_address: e.target.value })} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Workshop Description</label>
            <textarea
              rows={4}
              placeholder="Share your workshop story and craft tradition..."
              value={formData.shop_description || ''}
              onChange={e => setFormData({ ...formData, shop_description: e.target.value })}
              className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57] resize-none"
            />
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
