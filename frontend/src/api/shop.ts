import api from "./client";
import { BookDetailResponse } from "./book";

// Valid per page options
export const VALID_PER_PAGE_OPTIONS = [5, 15, 20, 25] as const;
export type ValidPerPage = typeof VALID_PER_PAGE_OPTIONS[number];

// Types for request parameters
export interface ShopParams {
  page?: number;
  limit?: ValidPerPage;
  categories?: number[];
  authors?: number[];
  ratings?: number[];
  sort?: SortOptionShop | SortOptionReview;
}

// Sort options for the shop
export type SortOptionShop = 'onsale' | 'popularity' | 'price-asc' | 'price-desc';

export type SortOptionReview = 'newest' | 'oldest';

// Interface for the response from the books API
export interface ShopBooksResponse {
  books: BookDetailResponse['book'][];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Interface for the API response structure
export interface BookApiResponse {
  items: BookApiItem[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Interface for the API response structure - now exported
export interface BookApiItem {
  id: number;
  book_title: string;
  author: string;
  price?: number;
  book_price?: number;
  discount_price: number | null;
  cover_photo?: string | null;
  book_cover_photo?: string | null;
  average_rating?: number | null;
  avg_rating?: number | null;
  category: string | null;
  book_summary?: string;
  review_count?: number;
}

// Common interface for book data used in UI components
export interface BookViewModel {
  id: number;
  book_title: string;
  author: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
  rating: number;
  category: string;
  summary?: string;
  reviewCount?: number;
}

// Transform API response to view model
export function transformToViewModel(apiBook: BookApiItem): BookViewModel {
  return {
    id: apiBook.id,
    book_title: apiBook.book_title,
    author: apiBook.author,
    price: apiBook.book_price || apiBook.price,
    discountPrice: apiBook.discount_price,
    imageUrl: apiBook.book_cover_photo || apiBook.cover_photo || "/placeholder-book.png",
    rating: apiBook.average_rating || apiBook.avg_rating || 0,
    category: apiBook.category || "",
    summary: apiBook.book_summary || "",
    reviewCount: apiBook.review_count || 0
  };
}

// Function to get books for shop page with filtering, sorting, and pagination
export const getShopBooks = async (params: ShopParams = {}): Promise<ShopBooksResponse> => {
  // Set default values if not provided
  const queryParams = new URLSearchParams();

  // Add pagination parameters with validation
  queryParams.append('page', String(params.page || 1));

  // Enforce valid per-page values
  let perPage = params.limit || 15; // Default to 15
  if (!VALID_PER_PAGE_OPTIONS.includes(perPage as ValidPerPage)) {
    perPage = 15; // Fallback to 15 if an invalid value is provided
  }
  queryParams.append('per_page', String(perPage));

  // DEBUGGING: Log all incoming params
  console.log('getShopBooks called with params:', params);

  // Add filter parameters if they exist
  if (params.categories && params.categories.length > 0) {
    const categoryParam = params.categories.join(',');
    // Use the correct parameter name for the backend
    queryParams.append('category_ids_csv', categoryParam);
    console.log(`Adding category filter: ${categoryParam}`);
  }

  if (params.authors && params.authors.length > 0) {
    const authorParam = params.authors.join(',');
    // Use the correct parameter name for the backend
    queryParams.append('author_ids_csv', authorParam);
    console.log(`Adding author filter: ${authorParam}`);
  }

  if (params.ratings && params.ratings.length > 0) {
    const ratingParam = String(params.ratings[0]);
    queryParams.append('rating_min', ratingParam);
    console.log(`Adding rating filter: ${ratingParam}`);
  }

  // Add sorting parameter
  if (params.sort) {
    let sortBy;
    switch (params.sort) {
      case 'onsale':
        sortBy = 'onsale';
        break;
      case 'popularity':
        sortBy = 'popularity';
        break;
      case 'price-asc':
        sortBy = 'price_asc';
        break;
      case 'price-desc':
        sortBy = 'price_desc';
        break;
      default:
        sortBy = 'onsale';
    }
    queryParams.append('sort_by', sortBy);
  }

  const finalUrl = `/api/book?${queryParams.toString()}`;
  console.log(`Making API request to: ${finalUrl}`);

  // Create a browser-side fetch for debugging (in addition to axios)
  const debugFetch = () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      fetch(`${baseUrl}${finalUrl}`)
        .then(res => {
          console.log('Debug fetch status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Debug fetch response:', {
            total: data.total,
            itemsCount: data.items?.length
          });
        })
        .catch(err => {
          console.error('Debug fetch error:', err);
        });
    } catch (err) {
      console.error('Failed to make debug fetch:', err);
    }
  };

  // Call the debug fetch in parallel
  debugFetch();

  try {
    const response = await api.get<BookApiResponse>(finalUrl);
    console.log(`API Response - Total Books: ${response.data.total}, Current Page: ${response.data.page}`);

    // Transform the response to match the expected format
    return {
      books: response.data.items.map((item: BookApiItem) => ({
        id: item.id,
        book_title: item.book_title,
        author: item.author,
        book_price: item.book_price || item.price || 0,
        price: item.book_price || item.price || 0,
        discount_price: item.discount_price,
        book_cover_photo: item.book_cover_photo || item.cover_photo || "/placeholder-book.png",
        cover_photo: item.book_cover_photo || item.cover_photo || "/placeholder-book.png",
        avg_rating: item.avg_rating || item.average_rating || 0,
        average_rating: item.avg_rating || item.average_rating || 0,
        category: item.category || "",
        book_summary: item.book_summary || "",
        review_count: item.review_count || 0
      })),
      total: response.data.total || 0,
      page: response.data.page || 1,
      per_page: perPage,
      pages: response.data.pages || 1
    };
  } catch (error) {
    console.error("Error fetching shop books:", error);
    throw error;
  }
};

// Get all available filter options (can be expanded later if needed)
export const getFilterOptions = async () => {
  // This could fetch available filter options from the backend if needed
  // For now, we're using the existing category and author endpoints
  return {
    // These will be fetched separately using the category and author APIs
    categories: [],
    authors: [],
    ratings: [5, 4, 3, 2, 1]
  };
};
