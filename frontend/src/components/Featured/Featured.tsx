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
  const [activeTab, setActiveTab] = useState("recommended");

  /* Fetch Recommended Books on Component Mount */
  useEffect(() => {
    setRecommendedLoading(true);
    setRecommendedError("");

    getRecommendations()
      .then((books) => {
        // Make sure the books array has all required fields
        setRecommendedBooks(books);
        setRecommendedLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        setRecommendedError("Failed to fetch recommendations");
        setRecommendedLoading(false);
      });
  }, []);

  /* Fetch Popular Books When Tab Selected (Lazy Loading) */
  useEffect(() => {
    if (activeTab === "popular" && popularBooks.length === 0) {
      setPopularLoading(true);
      setPopularError("");

      getPopular()
        .then((books) => {
          setPopularBooks(books);
          setPopularLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching popular books:", error);
          setPopularError("Failed to fetch popular books");
          setPopularLoading(false);
        });
    }
  }, [activeTab, popularBooks.length]);

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
        onValueChange={(value) => setActiveTab(value)}
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
