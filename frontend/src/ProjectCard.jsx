import { Link } from 'react-router-dom'

export default function ProjectCard({ id, name, image }) {
  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] border border-white/5 transition-all duration-500 hover:border-[#D17B57]/50 hover:shadow-[0_0_30px_rgba(209,123,87,0.15)] hover:-translate-y-2">
        
        {/* Edge-to-Edge Image Container */}
        <div className="aspect-[4/5] overflow-hidden relative bg-[#0A0A0A]">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110"
          />
          
          {/* Dark gradient overlay so the text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/20 to-transparent opacity-90"></div>
        </div>

        {/* Text Content overlaying the bottom of the image */}
        <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-xl font-black text-[#FDF8F5] font-serif tracking-wide mb-1 drop-shadow-md">
            {name}
          </h3>
          
          <p className="text-[9px] text-[#D17B57] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            View Details
          </p>
        </div>
        
      </div>
    </Link>
  )
}