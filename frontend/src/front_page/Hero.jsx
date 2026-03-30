import backgroundImage from '/assets/Background.png'

export default function Hero({ isDarkMode }) {
  return (
    <section 
      className={`relative min-h-[85svh] md:min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center transition-colors duration-700`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-5xl mx-auto flex flex-col items-center justify-center">
        
        <span className={`text-[#D17B57] font-black text-[9px] sm:text-[10px] md:text-sm tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] uppercase mb-5 sm:mb-6 block animate-in fade-in slide-in-from-bottom-4 duration-700`}>
          Loay Heritage Information System
        </span>
        
        <h1 className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[#FDF8F5] font-serif tracking-tight leading-[0.9] mb-6 sm:mb-8 drop-shadow-2xl uppercase transition-colors duration-700`}>
          Bolo <br className="md:hidden" /> Pandayan
        </h1>
      
        <p className={`text-[#EAE0D5] opacity-90 text-sm sm:text-base lg:text-lg font-medium leading-relaxed mb-8 sm:mb-12 max-w-2xl px-2 sm:px-4 transition-colors duration-700`}>
          A digital sanctuary for Loay's traditional blacksmiths. We document the iron legacy of Bohol, showcase their masterworks, and safeguard their workshops against disaster risks. 
          <span className="hidden md:inline"> This project bridges ancient craftsmanship with modern resilience.</span>
        </p>

        <a 
          href="#collection" 
          className={`px-7 sm:px-10 py-3 sm:py-4 bg-[#D17B57] text-white hover:bg-[#A65B3D] font-black text-[9px] sm:text-[10px] md:text-xs tracking-[0.16em] sm:tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase`}
        >
          Explore Collection
        </a>
      </div>

      {/* Changed the bottom gradient to adapt to theme */}
      <div className={`absolute bottom-0 left-0 w-full h-36 sm:h-48 bg-gradient-to-t ${isDarkMode ? 'from-[#0A0A0A] via-[#0A0A0A]/80' : 'from-[#FDF8F5] via-[#FDF8F5]/80'} to-transparent transition-colors duration-700`}></div>
    </section>
  )
}