import WorkshopCard from './WorkshopCard'

const workshopsData = [
  {
    id: 1,
    name: 'Bulaklak Blacksmith',
    distance: '19 kms away',
    description: 'Original Blacksmith for 40 years, Expert in making all kinds of Bolos',
    services: [
      'repair of bolos any kind',
      'special tagad and bundol',
      'make bolos in your own design'
    ],
    proprietor: 'Sol and Pinoy Apduhan',
    contacts: ['0942-332-4389', '0975-915-9057'],
    image: '/assets/bulaklak.jpg'
  },
  {
    id: 2,
    name: 'Pandayan sa Loay',
    distance: '17 kms away',
    description: 'Accepts order and repair of Bolo. Sells wholesale retail',
    contacts: ['09518170977', '09505884254'],
    image: '/assets/pandayan.jpg'
  },
  {
    id: 3,
    name: 'Loay Blacksmith Shop',
    distance: '18 kms away',
    description: 'Accepts Bolo Repair. Maker of Digger, Bar Axe, Crowbar. Is able to design your own pattern at negotiable charge. Sells Bolo, Nipa, and Souvenirs',
    contacts: ['09393148293', '09957032823'],
    image: '/assets/loay-shop.jpg'
  }
]

export default function WorkshopList() {
  return (
    <section className="bg-[#FDEBB6] py-16 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="relative flex justify-center items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-wide">
            Local Blacksmith Workshops
          </h2>
          <button className="absolute right-0 bg-[#B05B3A] text-white px-6 py-2 rounded-lg font-bold text-xs tracking-wider hover:bg-[#904A2F] transition-colors shadow-md">
            VIEW ALL
          </button>
        </div>

        {/* List of Cards */}
        <div className="flex flex-col gap-5">
          {workshopsData.map((workshop) => (
            <WorkshopCard key={workshop.id} data={workshop} />
          ))}
        </div>

      </div>
    </section>
  )
}