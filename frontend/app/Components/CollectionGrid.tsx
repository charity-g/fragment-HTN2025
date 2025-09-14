import Collection from "@/types/Collection";

const CollectionGrid: React.FC<{ collections: Collection[] }> = ({ collections }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {collections.map((collection, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden"
        >
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="w-full h-full bg-[url('/checkerboard.png')] bg-repeat opacity-30" />
          </div>
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold">{collection.title}</h3>
            <p className="text-sm text-gray-500">
              {collection.count} Ornaments – {collection.privacy}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid;