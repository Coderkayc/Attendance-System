/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

type LoginResponse = {
  token: string;
  user: { _id: string; name: string; email: string; role: "admin" | "lecturer" | "student" };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      saveAuth(data.token, data.user);

      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "lecturer") router.push("/lecturer");
      else router.push("/student");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Login to manage courses, create sessions, or mark attendance."
    >
      <h2 className="text-2xl font-bold text-gray-900">Login</h2>
      <p className="text-sm text-gray-600 mt-1">Sign in to continue.</p>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error} 
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
            placeholder="you@uni.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-green-900 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link className="font-semibold text-black hover:underline" href="/register">
            Register
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
