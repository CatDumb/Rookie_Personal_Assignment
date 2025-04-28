import api from "./client";

export interface Author {
    id: number;
    author_name: string;
    author_desc: string;
}

export function getAuthors() {
    return api.get<Author[]>("api/author/")
        .then(res => {
            if (res.data && Array.isArray(res.data)) {
                return res.data;
            }
            console.error("Unexpected response structure:", res.data);
            return [];
        });
}
