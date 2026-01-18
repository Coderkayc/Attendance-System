"use client";

import type { Role } from "./types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const TOKEN_KEY = "att_token";
const USER_KEY = "att_user";

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("auth");
  return raw ? JSON.parse(raw) : null;
}


export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
