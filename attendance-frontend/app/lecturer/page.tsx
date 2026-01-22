"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function LecturerDashboardPage() {
  const router = useRouter();
  const user = getUser();

  function logout() {
    router.push("/logout");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#063528] via-[#0b5a43] to-[#0f8a64] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl bg-white/95 rounded-2xl shadow-xl border border-white/30 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0b5a43]">
              Lecturer Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold text-gray-900">
                {user?.name || "Lecturer"}
              </span>
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-[#0b5a43] hover:bg-[#0f8a64] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Link
            href="/lecturer/sessions"
            className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-gray-900">Attendance Sessions</h2>
            <p className="text-sm text-gray-600 mt-2">
              Create sessions and display QR codes for students.
            </p>
          </Link>

          <Link href="/lecturer/reports" className="group border rounded-xl p-6 hover:shadow-lg transition bg-white">
          <h3 className="font-semibold text-gray-900">Attendance Reports</h3>
          <p className="text-sm text-gray-600 mt-1">View attendance reports for your courses.</p>
         </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          UNN Attendance System • Lecturer Access
        </p>
      </div>
    </div>
  );
}

