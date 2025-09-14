import Collection from "@/types/Collection";

const CollectionGrid: React.FC<{ collections: Collection[] }> = ({ collections }) => {
    console.log(collections);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 p-6">
      {collections.map((collection, index) => (
      <Collection key={index} collection={collection} />
      ))}
    </div>
  );
};


const Collection: React.FC<{ collection: Collection }> = ({ collection }) => {
  return (
    <div
          className="rounded-lg bg-transparent shadow-none overflow-hidden"
          >
          <div className="aspect-square bg-transparent flex items-center justify-center">
              <img
              src={collection.gif_url}
              alt={collection.title}
              className="w-full h-full object-cover rounded-lg"
              />
          </div>
          <div className="py-4 text-left">
              <h3 className="text-lg font-semibold">{collection.title}</h3>
              <p className="text-sm text-gray-500">
              {collection.count} fragments • {collection.privacy}
              </p>
          </div>
          </div>);
}

export default CollectionGrid;