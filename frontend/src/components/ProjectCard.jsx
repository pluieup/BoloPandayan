import { Link } from 'react-router-dom'

export default function ProjectCard({ id, name, image, isDarkMode }) {
  return (
    <Link to={`/collection/${id}`} className="group block">
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 hover:border-[#D17B57]/50 hover:shadow-[0_0_30px_rgba(209,123,87,0.15)] md:hover:-translate-y-2 ${isDarkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-[#EAE0D5] border-[#4A3224]/10'}`}>
        
        {/* Edge-to-Edge Image Container */}
        <div className={`aspect-[4/5] overflow-hidden relative ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#EAE0D5]'}`}>
          <img 
            src={image} 
            alt={name} 
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isDarkMode ? 'opacity-80 group-hover:opacity-100' : 'opacity-90 group-hover:opacity-100'}`}
          />
          
          {/* Dark gradient overlay so the text is always readable */}
          <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#1A1A1A] via-[#1A1A1A]/20' : 'from-[#FDF8F5] via-[#FDF8F5]/20'} to-transparent opacity-90 transition-colors duration-500`}></div>
        </div>

        {/* Text Content overlaying the bottom of the image */}
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className={`text-lg sm:text-xl font-black font-serif tracking-wide mb-1 drop-shadow-md transition-colors duration-500 line-clamp-1 ${isDarkMode ? 'text-[#FDF8F5]' : 'text-[#4A3224]'}`}>
            {name}
          </h3>
          
          <p className="text-[8px] sm:text-[9px] text-[#D17B57] font-bold uppercase tracking-[0.24em] sm:tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            View Details
          </p>
        </div>
        
      </div>
    </Link>
  )
}
