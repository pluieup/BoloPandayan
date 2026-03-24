import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function UploadBoloModal({ isOpen, onClose, artisanId, onUploadSuccess, editingProduct = null }) {
  const [name, setName] = useState('')
  const [blade, setBlade] = useState('')
  const [handle, setHandle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // THE MAGIC: Pre-fill fields if we are in "Edit Mode"
  useEffect(() => {
    if (editingProduct && isOpen) {
      // It's an Edit! Fill the inputs with existing data
      setName(editingProduct.name || '')
      setBlade(editingProduct.blade_material || '')
      setHandle(editingProduct.handle_material || '')
      setPrice(editingProduct.price || '')
      setDescription(editingProduct.description || '')
    } else {
      // It's a New Upload! Clear everything out
      setName('')
      setBlade('')
      setHandle('')
      setPrice('')
      setDescription('')
      setImageFile(null)
    }
  }, [editingProduct, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      // Default to the old image if they don't upload a new one during an edit
      let imageUrl = editingProduct?.image_url 

      // 1. If a NEW image is selected, upload it
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${artisanId}/${fileName}`

        const { error: uploadError } = await supabase.storage.from('bolos').upload(filePath, imageFile)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('bolos').getPublicUrl(filePath)
        imageUrl = urlData.publicUrl
      }

      // We need an image URL to proceed (either the old one or the newly uploaded one)
      if (!imageUrl) throw new Error("Please upload a photo of the bolo.")

      const productData = {
        name,
        blade_material: blade,
        handle_material: handle,
        price: parseFloat(price) || 0,
        description,
        image_url: imageUrl,
        artisan_id: artisanId
      }

      if (editingProduct) {
        // SUPABASE: UPDATE (Modify existing record)
        const { error } = await supabase.from('tbl_products').update(productData).eq('id', editingProduct.id)
        if (error) throw error
      } else {
        // SUPABASE: INSERT (Create new record)
        const { error } = await supabase.from('tbl_products').insert([productData])
        if (error) throw error
      }

      onUploadSuccess()
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A3224]/90 backdrop-blur-md" onClick={onClose}></div>
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-lg bg-[#FDF8F5] rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Dynamic Title based on mode */}
        <h2 className="text-3xl font-black text-[#4A3224] font-serif uppercase mb-2">
          {editingProduct ? 'Edit Masterwork' : 'Upload Bolo'}
        </h2>
        <p className="text-[10px] font-bold text-[#D17B57] uppercase tracking-[0.3em] mb-8">
          {editingProduct ? 'Update Heritage Documentation' : 'Heritage Documentation'}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Name</label>
            <input required type="text" placeholder="e.g. Classic Pinuti" value={name} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" onChange={e => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Blade Material</label>
              <input required type="text" placeholder="e.g. Carbon Steel" value={blade} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" onChange={e => setBlade(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Handle Material</label>
              <input required type="text" placeholder="e.g. Kamagong" value={handle} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" onChange={e => setHandle(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Price (PHP)</label>
            <input type="number" placeholder="0.00" value={price} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#D17B57]" onChange={e => setPrice(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
            <textarea placeholder="Describe the history or forging process of this blade..." value={description} className="w-full bg-white border border-[#EAE0D5] rounded-2xl px-5 py-3 text-sm h-24 focus:outline-none focus:border-[#D17B57]" onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="border-2 border-dashed border-[#D17B57]/30 rounded-3xl p-6 text-center bg-white/50">
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setImageFile(e.target.files[0])} 
              // We only REQUIRE a file if it's a new upload. If editing, they can leave it blank to keep old photo.
              required={!editingProduct} 
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#4A3224] file:text-white cursor-pointer" 
            />
            {editingProduct && <p className="text-[10px] mt-2 text-[#D17B57] font-bold uppercase tracking-widest">Leave blank to keep current photo</p>}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#4A3224] transition-colors">Cancel</button>
          <button type="submit" disabled={uploading} className="flex-[2] py-4 bg-[#4A3224] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D17B57] transition-all shadow-lg disabled:opacity-50">
            {uploading ? 'Processing...' : editingProduct ? 'Save Changes' : 'Publish Masterwork'}
          </button>
        </div>
      </form>
    </div>
  )
}