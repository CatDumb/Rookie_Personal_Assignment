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

// Interface for the API response structure
interface BookApiItem {
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

  // Add filter parameters if they exist
  if (params.categories && params.categories.length > 0) {
    queryParams.append('category_ids', params.categories.join(','));
  }

  if (params.authors && params.authors.length > 0) {
    queryParams.append('author_ids', params.authors.join(','));
  }

  if (params.ratings && params.ratings.length > 0) {
    queryParams.append('rating_min', String(params.ratings[0]));
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

  try {
    const response = await api.get<BookApiResponse>(`/api/book?${queryParams.toString()}`);

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
