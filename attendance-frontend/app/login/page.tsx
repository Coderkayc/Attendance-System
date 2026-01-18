"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { LoginResponse } from "@/lib/types";

type LoginPayload = {
  email: string;
  password: string;
};

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const payload: LoginPayload = {
        email: email.trim().toLowerCase(),
        password,
      };

      const data = await api<LoginResponse>("/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify(payload),
      });

      // store (localStorage or whatever your saveAuth does)
      saveAuth(data.token, data.user);

      // cookies for middleware/route guarding
      setCookie("att_token", data.token);
      setCookie("att_role", data.user.role);

      router.push(`/${data.user.role}`);
    } catch (e: unknown) {
      setErr(getErrorMessage(e) || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-white/70 mt-1">
          Sign in to continue.
        </p>

        {err && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-black py-2 font-medium disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-white/70">
          Don’t have an account?{" "}
          <Link className="text-white underline" href="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

