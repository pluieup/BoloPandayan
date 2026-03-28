import backgroundImage from '/assets/Background.png'

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      <div className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto flex flex-col items-center justify-center">
        
        <span className="text-[#D17B57] font-black text-[10px] md:text-sm tracking-[0.3em] md:tracking-[0.5em] uppercase mb-6 block animate-in fade-in slide-in-from-bottom-4 duration-700">
          Loay Heritage Information System
        </span>
        
        <h1 className="text-2xl md:text-7xl lg:text-8xl font-black text-[#FDF8F5] font-serif tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl uppercase">
          Bolo <br className="md:hidden" /> Pandayan
        </h1>
      
        <p className="text-[#EAE0D5] text-xs md:text-base lg:text-lg font-medium leading-relaxed opacity-90 mb-12 max-w-2xl px-4">
          A digital sanctuary for Loay's traditional blacksmiths. We document the iron legacy of Bohol, showcase their masterworks, and safeguard their workshops against disaster risks. 
          <span className="hidden md:inline"> This project bridges ancient craftsmanship with modern resilience.</span>
        </p>

        <a 
          href="#collection" 
          className="px-10 py-4 bg-[#D17B57] text-white font-black text-[10px] md:text-xs tracking-[0.2em] rounded-full hover:bg-[#A65B3D] hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase"
        >
          Explore Collection
        </a>
      </div>

      {/* Changed the bottom gradient to #121212 to match the new Gallery background smoothly */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
    </section>
  )
}