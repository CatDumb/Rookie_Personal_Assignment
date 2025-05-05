/* Featured Component - Displays recommended and popular books in a tabbed interface */
import { useState, useEffect } from "react";
import { BookCard } from "../ui/card";
import { getRecommendations, RecommendResponse, getPopular, PopularResponse } from "../../api/book";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

function Featured() {
  /* State Management */
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendResponse[]>([]);
  const [popularBooks, setPopularBooks] = useState<PopularResponse[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState("");
  const [popularError, setPopularError] = useState("");

  /* Fetch Both Recommended and Popular Books on Component Mount */
  useEffect(() => {
    // Load Recommended Books
    setRecommendedLoading(true);
    setRecommendedError("");

    // Load Popular Books
    setPopularLoading(true);
    setPopularError("");

    // Fetch both data sets simultaneously
    Promise.all([getRecommendations(), getPopular()])
      .then(([recommendedData, popularData]) => {
        setRecommendedBooks(recommendedData);
        setPopularBooks(popularData);
        setRecommendedLoading(false);
        setPopularLoading(false);
      })
      .catch(error => {
        console.error("Error fetching book data:", error);
        setRecommendedError("Failed to fetch recommendations");
        setPopularError("Failed to fetch popular books");
        setRecommendedLoading(false);
        setPopularLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-4 py-4 justify-center">
      {/* Section Title */}
      <div className="flex justify-center items-center">
        <div className="text-lg font-bold">Featured</div>
      </div>

      {/* Tab Container */}
      <Tabs
        defaultValue="recommended"
        className="w-full"
      >
        {/* Tab Navigation */}
        <div className="flex justify-center">
          <TabsList className="grid w-96 grid-cols-2">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Container */}
        <div className="border-2 border-gray-400 rounded-lg py-5 px-4 w-full mt-4">
          {/* Recommended Books Tab */}
          <TabsContent value="recommended">
            {recommendedLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : recommendedError ? (
              <div className="text-center text-red-500 py-8">{recommendedError}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
                {recommendedBooks.map((book) => (
                  <BookCard
                    id={book.id}
                    key={book.id}
                    title={book.book_title}
                    author={book.author}
                    price={book.book_price}
                    originalPrice={book.discount_price || undefined}
                    imageUrl={book.book_cover_photo || null}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Popular Books Tab */}
          <TabsContent value="popular">
            {popularLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : popularError ? (
              <div className="text-center text-red-500 py-8">{popularError}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
                {popularBooks.map((book) => (
                  <BookCard
                    id={book.id}
                    key={book.id}
                    title={book.book_title}
                    author={book.author}
                    price={book.book_price}
                    originalPrice={book.discount_price || undefined}
                    imageUrl={book.book_cover_photo || null}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default Featured;
