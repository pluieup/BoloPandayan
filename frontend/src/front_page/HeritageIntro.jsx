import React from 'react'

export default function HeritageIntro({ isDarkMode = true }) {
  const bg = isDarkMode ? 'bg-[#080808] text-[#FDF8F5]' : 'bg-white text-[#0A0A0A]'
  const cardBg = isDarkMode ? 'bg-[#0F0F0F]/80' : 'bg-slate-50'
  const headingColor = isDarkMode ? 'text-white' : 'text-slate-900'
  const accentColor = 'text-[#D17B57]' 
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200'

  return (
    <section className={`${bg} py-16 transition-colors duration-300`}> 
      <div className="max-w-6xl mx-auto px-6">
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 md:p-14 border ${borderColor} backdrop-blur-sm`}> 
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
            
            <aside className="md:w-1/3 lg:w-1/4">
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter leading-none ${headingColor}`}>
                Loay Bolo <br />
                <span className={accentColor}>Pandayan</span>
              </h2>
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D7B29A]/80">
                The Heritage Resilience Portal
              </p>
              <div className="mt-6 h-1 w-16 bg-[#D17B57] rounded-full"></div>
            </aside>

            <div className="md:w-2/3 lg:w-3/4">
              <div className={`
                max-w-none 
                prose 
                ${isDarkMode ? 'prose-invert' : 'prose-slate'} 
                prose-headings:text-white 
                prose-p:text-slate-300 
                prose-p:leading-relaxed 
                prose-strong:text-[#D17B57] 
                prose-strong:font-bold
                prose-em:text-[#F0D6C4]
              `}>
                
                <h3 className="text-2xl font-bold tracking-tight mb-4">A Legacy Forged in Time</h3>
                <p className="text-lg">
                  In Loay, being a <em>Panday</em> is a sacred inheritance rather than just a job. 
                  This tradition traces back to the early 1900s when the blacksmiths of <strong>Poblacion</strong> and <strong>San Miguel</strong> perfected the high-carbon <strong>Sansibar</strong>. 
                  The forge has long been the center of local life. These blades served as tools to clear our lands and stood as symbols of our resistance. 
                  Even now, a Loay Bolo is known for the distinct sound the steel makes when struck. This is a testament to artisans who spent decades perfecting heat-treatment processes learned from their grandfathers.
                </p>

                <h3 className="text-2xl font-bold tracking-tight mt-10 mb-4">Why Digital Resilience Matters Now</h3>
                <p className="text-lg">
                  The world is changing faster than the forge can keep up as we move through 2026. 
                  Recent typhoons and shifting riverbanks have placed physical workshops at higher risk than ever before. 
                  <strong>Bolo Pandayan</strong> serves as our response to these modern challenges:
                </p>

                <ul className="grid grid-cols-1 gap-4 mt-6 list-none pl-0">
                  <li className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[#D17B57] mt-1">✦</span>
                    <span><strong>Digital Immortality:</strong> We preserve the "Blueprint of Loay" forever by recording the specific lineages of master blacksmiths and their unique blade patterns.</span>
                  </li>
                  <li className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[#D17B57] mt-1">✦</span>
                    <span><strong>Real-Time Protection:</strong> Our integration with <strong>HazardHunter PH</strong> monitors flood return periods and storm surge levels for coastal workshops to keep our artisans safe.</span>
                  </li>
                  <li className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[#D17B57] mt-1">✦</span>
                    <span><strong>Bridging Generations:</strong> We bring this 100-year-old craft to the next generation to ensure the Bolo remains a living symbol of Boholano pride.</span>
                  </li>
                </ul>

                <blockquote className="mt-10 text-xl md:text-2xl font-medium italic border-l-4 pl-6 border-[#D17B57] text-[#F0D6C4] bg-white/5 py-6 pr-6 rounded-r-xl">
                  "Our grandfathers shaped the iron; it is now our responsibility to shape the data that protects it."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}