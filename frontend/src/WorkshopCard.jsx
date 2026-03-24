export default function WorkshopCard({ data }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row gap-8 border border-[#EAE0D5] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      
      <div className="w-full md:w-72 h-52 bg-gray-200 rounded-xl overflow-hidden shrink-0 relative">
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#4A3224] flex items-center gap-1 z-10 shadow-sm">
          <svg className="w-3 h-3 text-[#D17B57]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          {data.distance}
        </div>
        <img src={data.image} alt={data.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="text-xl font-black text-[#4A3224] font-serif mb-2">{data.name}</h3>
          <p className="text-sm text-[#6B5041] leading-relaxed mb-6">{data.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#6B5041]">
            {data.services && (
              <div className="bg-[#FDF8F5] p-3 rounded-lg">
                <span className="block font-bold mb-2 text-[#4A3224] uppercase tracking-wider text-[10px]">Services</span>
                <ul className="space-y-1.5">
                  {data.services.map((service, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {data.proprietor && (
                <div>
                  <span className="block font-bold text-[#4A3224] uppercase tracking-wider text-[10px] mb-1">Proprietor</span>
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[#D17B57]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    {data.proprietor}
                  </span>
                </div>
              )}
              {data.contacts && (
                <div>
                  <span className="block font-bold text-[#4A3224] uppercase tracking-wider text-[10px] mb-1">Contact</span>
                  {data.contacts.map((contact, index) => (
                    <span key={index} className="flex items-center gap-2 mb-1">
                      <svg className="w-3.5 h-3.5 text-[#D17B57]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {contact}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button className="px-8 py-2.5 bg-[#4A3224] text-[#FDF8F5] rounded-lg text-xs tracking-widest font-bold hover:bg-[#D17B57] transition-colors shadow-md">
            VIEW DETAILS
          </button>
        </div>
      </div>
    </div>
  )
}