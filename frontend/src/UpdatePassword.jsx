import { useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Password updated successfully!")
      navigate('/') // Send them back to login
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5]">
      <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-[#EAE0D5]">
        <h2 className="text-2xl font-black text-[#4A3224] font-serif uppercase mb-6">Create New Password</h2>
        <input 
          required
          type="password" 
          placeholder="Enter new password"
          className="w-full bg-[#FDF8F5] border border-[#EAE0D5] rounded-2xl px-5 py-3 mb-6 focus:outline-none focus:border-[#D17B57]"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button 
          disabled={loading}
          className="w-full py-4 bg-[#4A3224] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D17B57] transition-all shadow-lg"
        >
          {loading ? 'Updating...' : 'Save New Password'}
        </button>
      </form>
    </div>
  )
}