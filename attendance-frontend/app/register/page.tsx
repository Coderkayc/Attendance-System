"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { LoginResponse } from "@/lib/types";

type Role = "admin" | "lecturer" | "student";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
  matric?: string;
  staffId?: string;
};

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<Role>("student");
  const [matric, setMatric] = useState("");
  const [staffId, setStaffId] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const needsMatric = useMemo(() => role === "student", [role]);
  const needsStaffId = useMemo(() => role === "lecturer", [role]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const payload: RegisterPayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      };

      if (needsMatric) payload.matric = matric.trim();
      if (needsStaffId) payload.staffId = staffId.trim();

      const data = await api<LoginResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify(payload),
      });

      saveAuth(data.token, data.user);
      setCookie("att_token", data.token);
      setCookie("att_role", data.user.role);

      router.push(`/${data.user.role}`);
    } catch (e: unknown) {
      setErr(getErrorMessage(e) || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow">
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="text-sm text-white/70 mt-1">
          Create your account.
        </p>

        {err && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

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

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              aria-label="Role"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {needsMatric && (
            <div>
              <label className="block text-sm mb-1">Matric number</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
                placeholder="e.g. CSC/2021/1234"
                required
              />
            </div>
          )}

          {needsStaffId && (
            <div>
              <label className="block text-sm mb-1">Staff ID</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. LEC-1029"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-black py-2 font-medium disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-sm text-white/70">
          Already have an account?{" "}
          <Link className="text-white underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

