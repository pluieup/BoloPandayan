import backgroundImage from '/assets/Background.png' // Import it at the top

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center overflow-hidden"
      // CHANGE THIS PATH HERE:
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* 1. Dark Overlay to make the text "BOLO PANDAYAN" pop */}
      <div className="absolute inset-0 bg-black/50 backdrop-brightness-75"></div>

      {/* 2. Content */}
      <div className="relative z-10 text-center px-6">
        <span className="text-[#D17B57] font-black text-xs md:text-sm tracking-[0.4em] uppercase mb-4 block animate-in fade-in slide-in-from-bottom-4 duration-700">
          Loay Heritage Information System
        </span>
        <h1 className="text-6xl md:text-7xl font-black text-[#FDF8F5] font-serif tracking-tighter leading-none mb-6 drop-shadow-2xl">
          BOLO <br className="md:hidden" /> PANDAYAN
        </h1>
        <p className="mx-auto text-[#EAE0D5] text-sm md:text-lg font-medium leading-relaxed opacity-80 mb-10">
          A digital sanctuary for Loay's traditional blacksmiths. We document the iron legacy of Bohol, showcase their masterworks, and safeguard their workshops against disaster risks. This project bridges ancient craftsmanship with modern resilience.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#collection" className="px-10 py-4 bg-[#D17B57] text-white font-black text-xs tracking-[0.2em] rounded-full hover:bg-[#A65B3D] transition-all shadow-xl uppercase">
            Explore Collection
          </a>
        </div>
      </div>

      {/* 3. Subtle Bottom Gradient for smooth transition to StatsBar */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
    </section>
  )
}