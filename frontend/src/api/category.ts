import api from "./client";

export interface Category {
  id: number;
  category_name: string;
  category_desc: string;
}

export function getCategories() {
  return api.get<Category[]>("/api/category/")
    .then(res => {
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      console.error("Unexpected response structure:", res.data);
      return [];
    });
}
