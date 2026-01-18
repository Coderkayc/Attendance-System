import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function api<T>(path: string, opts: RequestInit & { auth?: boolean } = {}) {
  const headers = new Headers(opts.headers);

  if (opts.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
   const message =
  isJson && typeof data === "object" && data !== null && "message" in data
    ? String((data as { message?: unknown }).message ?? "Request failed")
    : "Request failed";
    throw new Error(message);
  }
  
  return data as T;
}
