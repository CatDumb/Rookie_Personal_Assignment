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
    refresh_token: string;
    token_type: string;
}

export interface RefreshTokenResponse {
    access_token: string;
    token_type: string;
}

export function login(payload: LoginPayload) {
    return api.post<LoginResponse>("/api/user/login", payload)
        .then(res => res.data);
}

export function refreshToken(refreshToken: string) {
    return api.post<RefreshTokenResponse>("/api/user/refresh-token", { refresh_token: refreshToken })
        .then(res => res.data);
}
