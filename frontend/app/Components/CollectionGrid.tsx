import Collection from "@/types/Collection";
import CollectionCard from "./CollectionCard";

const CollectionGrid: React.FC<{ collections: Collection[] }> = ({ collections }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 p-6">
      {collections.map((collection, index) => (
        <CollectionCard key={index} collection={collection} />
      ))}
    </div>
  );
};


export default CollectionGrid;