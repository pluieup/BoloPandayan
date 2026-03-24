import { Link } from 'react-router-dom'

export default function ProjectCard({ id, name, image }) {
    return (
        <Link to={`/collection/${id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-[#EAE0D5] overflow-hidden">
            <div className="p-4">
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#F5EBE1] mb-4 relative">
                    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                </div>
                <div className="flex items-center justify-between px-2 pb-2">
                    <h3 className="text-xl font-bold text-[#4A3224] font-serif">{name}</h3>
                    <svg className="w-5 h-5 text-[#D17B57] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
            </div>
        </Link>
    )
}