// src/api/auth.ts
import api from "./client";

export interface LoginPayload {
    email: string;
    password: string;
}
export interface LoginResponse {
    first_name: string;
    last_name: string;
    access_token: string;
}

export function login(payload: LoginPayload) {
    return api.post<LoginResponse>("api/user/login", payload)
        .then(res => res.data);
}
