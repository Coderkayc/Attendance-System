"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, clearAuth } from "@/lib/auth";

export default function AdminDashboard() {
  const user = getUser();
  const router = useRouter();

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0b3d2e] via-[#0f5f46] to-[#138a63] relative overflow-hidden">
      
      <div className="absolute -top-32 -left-32 w-105 h-105 bg-green-400/30 blur-[140px]" />
      <div className="absolute -bottom-32 -right-32 w-105 h-105 bg-emerald-400/30 blur-[140px]" />

      <div className="relative w-full max-w-3xl bg-white/95 rounded-2xl shadow-2xl p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0b3d2e]">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>

          <button
            onClick={logout}
            className="px-5 py-2 rounded-lg bg-green-900  hover:bg-green-800 text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>

  <div className="grid md:grid-cols-3 gap-6">
  <Link
    href="/admin/courses"
    className="group border rounded-xl p-6 hover:shadow-lg transition bg-white"
  >
    <h3 className="font-semibold text-gray-900">Manage Courses</h3>
    <p className="text-sm text-gray-600 mt-1">
      Create courses, assign lecturers, and enroll students.
    </p>
  </Link>

  <Link
    href="/admin/users"
    className="group border rounded-xl p-6 hover:shadow-lg transition bg-white"
  >
    <h3 className="font-semibold text-gray-900">Manage Users</h3>
    <p className="text-sm text-gray-600 mt-1">
      Create lecturers and students (admin-only).
    </p>
  </Link>

  <Link
    href="/admin/reports"
    className="group border rounded-xl p-6 hover:shadow-lg transition bg-white"
  >
    <h3 className="font-semibold text-gray-900">Attendance Reports</h3>
    <p className="text-sm text-gray-600 mt-1">
      View and export attendance data.
    </p>
  </Link>
</div>

      <p className="text-xs text-gray-400 mt-8">
          UNN Attendance System • Admin Access
        </p>
      </div>
    </div>
  );
}
