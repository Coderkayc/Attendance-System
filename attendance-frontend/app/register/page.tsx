/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "lecturer" | "admin">("student");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role,
        }),
      });

      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register as a student, lecturer, or admin to use the system."
    >
      <h2 className="text-2xl font-bold text-gray-900">Register</h2>
      <p className="text-sm text-gray-600 mt-1">Create an account to continue.</p>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Full name</label>
          <input
            className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
            placeholder="Mary John"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="admin">Admin</option>
          </select>
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
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="font-semibold text-black hover:underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
