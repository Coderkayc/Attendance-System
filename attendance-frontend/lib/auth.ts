"use client";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "lecturer" | "student";
};

const TOKEN_KEY = "att_token";
const USER_KEY = "att_user";

export function saveAuth(token: string, user: AuthUser) {
  const role = user.role.toLowerCase();

  document.cookie = `att_token=${token}; Path=/; SameSite=Lax`;
  document.cookie = `att_role=${role}; Path=/; SameSite=Lax`;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  document.cookie = "att_token=; Path=/; Max-Age=0";
  document.cookie = "att_role=; Path=/; Max-Age=0";

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

