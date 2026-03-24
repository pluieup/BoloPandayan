export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center bg-gray-900 bg-cover bg-center pt-20" style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
      
      <div className="relative z-10 bg-black/20 backdrop-blur-xl border border-white/10 p-10 md:p-14 rounded-[2rem] max-w-4xl text-center mt-10 text-white shadow-2xl mx-4">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-widest text-[#E8A88B] drop-shadow-2xl uppercase font-serif">
          Bolo Pandayan
        </h1>
        <p className="text-xs md:text-sm tracking-[0.25em] mb-8 uppercase text-gray-300 font-semibold">
          The Heritage Resilience Portal Project for Loay
        </p>
        <p className="text-sm md:text-base mb-10 max-w-2xl mx-auto leading-loose text-gray-200 font-light">
          A digital sanctuary for traditional blacksmiths. We document the iron legacy of Bohol, showcase masterworks, and safeguard workshops against disaster risks. Bridging ancient craftsmanship with modern resilience.
        </p>
        <button className="bg-gradient-to-r from-[#FDF8F5] to-[#EAE0D5] text-[#4A3224] px-10 py-4 rounded-full font-black text-sm tracking-widest hover:scale-105 hover:shadow-[0_0_20px_rgba(232,168,139,0.4)] transition-all duration-300">
          EXPLORE COLLECTION
        </button>
      </div>

      <div className="relative z-10 mt-auto w-full max-w-6xl px-6 pb-16 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-white/20 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="text-5xl md:text-6xl font-black text-white font-serif">12</span>
          <span className="text-xs md:text-sm tracking-widest text-gray-300 uppercase font-medium">Registered<br/>Pandays</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="text-5xl md:text-6xl font-black text-white font-serif">3</span>
          <span className="text-xs md:text-sm tracking-widest text-gray-300 uppercase font-medium">Active<br/>Workshops</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="text-5xl md:text-6xl font-black text-white font-serif">45</span>
          <span className="text-xs md:text-sm tracking-widest text-gray-300 uppercase font-medium">Heritage<br/>Items</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="text-5xl md:text-6xl font-black text-[#E8A88B] font-serif">100%</span>
          <span className="text-xs md:text-sm tracking-widest text-gray-300 uppercase font-medium">Workshops<br/>Assessed</span>
        </div>
      </div>
    </section>
  )
}