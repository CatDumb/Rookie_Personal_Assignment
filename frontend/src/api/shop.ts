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
  sort?: SortOption;
}

// Sort options for the shop
export type SortOption = 'onsale' | 'popularity' | 'price-asc' | 'price-desc';

// Interface for the response from the books API
export interface ShopBooksResponse {
  books: BookDetailResponse['book'][];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Interface for the API response structure - now exported
export interface BookApiItem {
  id: number;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  cover_photo: string | null;
  average_rating: number | null;
  category: string | null;
  summary?: string; // Add summary field
  review_count?: number; // Add review_count field
}

// Common interface for book data used in UI components
export interface BookViewModel {
  id: number;
  title: string;
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
    title: apiBook.name,
    author: apiBook.author,
    price: apiBook.price,
    discountPrice: apiBook.discount_price,
    imageUrl: apiBook.cover_photo || "/placeholder-book.png",
    rating: apiBook.average_rating || 0,
    category: apiBook.category || "",
    summary: apiBook.summary || "",
    reviewCount: apiBook.review_count || 0
  };
}

interface BookApiResponse {
  items: BookApiItem[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
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
  queryParams.append('per_page', String(perPage)); // Instead of 'limit

  // DEBUGGING: Log all incoming params
  console.log('getShopBooks called with params:', params);

  // Add filter parameters if they exist
  if (params.categories && params.categories.length > 0) {
    const categoryParam = params.categories.join(',');
    // Use the correct parameter name for the backend
    queryParams.append('category_ids', categoryParam);
    console.log(`Adding category filter: ${categoryParam}`);
  }

  if (params.authors && params.authors.length > 0) {
    const authorParam = params.authors.join(',');
    // Use the correct parameter name for the backend
    queryParams.append('author_ids', authorParam);
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
        name: item.name,
        author: item.author,
        price: item.price,
        discount_price: item.discount_price,
        cover_photo: item.cover_photo || "/placeholder-book.png",
        average_rating: item.average_rating || 0,
        category: item.category || "",
        summary: item.summary || "", // Add summary with default value
        review_count: item.review_count || 0 // Add review_count with default value
      })),
      total: response.data.total || 0,
      page: response.data.page || 1,
      per_page: perPage, // Use our validated perPage value instead of response.data.per_page
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
