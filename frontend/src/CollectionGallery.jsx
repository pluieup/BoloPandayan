import ProjectCard from './ProjectCard'

const collectionData = [
    { id: 'pinuti', name: 'Pinuti', image: '/assets/pinuti.jpg' },
    { id: 'barong', name: 'Barong', image: '/assets/barong.jpg' },
    { id: 'garab', name: 'Garab', image: '/assets/garab.jpg' },
    { id: 'batangas', name: 'Batangas', image: '/assets/batangas.jpg' }
]

export default function CollectionGallery() {
    return (
        <section className="bg-[#D17B57] py-20 px-6 sm:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {collectionData.map((item) => (
                        <ProjectCard 
                            key={item.id} 
                            id={item.id} 
                            name={item.name} 
                            image={item.image} 
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}