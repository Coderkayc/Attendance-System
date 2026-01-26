"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Role = "lecturer" | "student";

export default function AdminCreateUsersPage() {
  const [role, setRole] = useState<Role>("lecturer");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // role-specific
  const [staffId, setStaffId] = useState("");
  const [matric, setMatric] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const body: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
      };

      if (role === "lecturer") body.staffId = staffId.trim();
      if (role === "student") body.matric = matric.trim();

      // ✅ CHANGE THIS PATH to match your backend admin-create endpoint
      // Common options: "/admin/users" or "/admin/create-user"
      const res = await api<any>("/admin/users", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setMsg(res?.message || `${role} created ✅`);

      // reset fields
      setName("");
      setEmail("");
      setPassword("");
      setStaffId("");
      setMatric("");
    } catch (e: any) {
      setErr(e?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-900">Admin • Create Users</h1>
          <Link href="/admin" className="text-sm font-semibold text-green-900 hover:underline">
            Back
          </Link>
        </div>

        <p className="mt-1 text-sm text-gray-600">
          Only admins should be able to create lecturers/students.
        </p>

        {err ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {msg ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {msg}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="lecturer">Lecturer</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input
              className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
              placeholder="Dr John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
              placeholder="lecturer@uni.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {role === "lecturer" ? (
            <div>
              <label className="text-sm font-medium text-gray-700">Staff ID</label>
              <input
                className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
                placeholder="STAFF123"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700">Matric</label>
              <input
                className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
                placeholder="2021/123456"
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-green-900 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-green-900 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
