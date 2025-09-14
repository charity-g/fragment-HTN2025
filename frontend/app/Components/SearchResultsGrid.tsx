"use client";

interface SearchResult {
  video_id: string;
  tags: string[];
  description: string;
  gif_link: string;
  _score: number;
  highlight?: {
    tags?: string[];
    description?: string[];
  };
}

interface SearchResultsGridProps {
  results: SearchResult[];
}

export default function SearchResultsGrid({ results }: SearchResultsGridProps) {
  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-light mb-2">Search Results</h2>
        <p className="text-gray-400">
          {results.length === 0
            ? "No results found"
            : `Found ${results.length} result${
                results.length === 1 ? "" : "s"
              }`}
        </p>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((result) => (
            <div
              key={result.video_id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors"
            >
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                <img
                  src={`http://localhost:8000/uploads/${result.gif_link}`}
                  alt="Fragment preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {result.highlight?.tags
                      ? result.highlight.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                            dangerouslySetInnerHTML={{ __html: tag }}
                          />
                        ))
                      : result.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                  </div>
                </div>

                {result.description && (
                  <div className="text-sm text-gray-300 mb-2">
                    {result.highlight?.description ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: result.highlight.description[0],
                        }}
                      />
                    ) : (
                      result.description
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Score: {result._score.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No fragments found</div>
          <div className="text-gray-500 text-sm">
            Try different search terms or check your spelling
          </div>
        </div>
      )}
    </div>
  );
}
