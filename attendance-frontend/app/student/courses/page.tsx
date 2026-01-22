/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

type Course = {
  _id: string;
  code: string;
  title: string;
  unit?: number;
};

export default function StudentCoursesPage() {
  const router = useRouter();
  const user = getUser();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadCourses() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = await api<Course[]>("/courses/enrolled", { method: "GET" });
      setCourses(data || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function logout() {
    router.push("/logout");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#063528] via-[#0b5a43] to-[#0f8a64] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="w-full bg-white/95 rounded-2xl shadow-xl border border-white/30 p-8">
       
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0b5a43]">My Courses</h1>
              <p className="text-sm text-gray-600">
                These are the courses you are enrolled in,{" "}
                <span className="font-semibold text-gray-900">
                  {user?.name || "Student"}
                </span>
                .
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/student"
                className="px-4 py-2 rounded-lg border bg-[#0b5a43] hover:bg-[#0f8a64] text-sm transition"
              >
                Back
              </Link>

              <button
                onClick={logout}
                className="bg-[#0b5a43] hover:bg-[#0f8a64] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>

          {(msg || err) && (
            <div
              className={`mt-5 border rounded-xl p-3 text-sm ${
                err
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {err || msg}
            </div>
          )}

          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Enrolled Courses
              </h2>

              <button
                onClick={loadCourses}
                disabled={loading}
                className="bg-[#0b5a43] hover:bg-[#0f8a64] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {courses.length === 0 ? (
              <p className="mt-4 text-sm text-gray-600">
                You are not enrolled in any courses yet.
              </p>
            ) : (
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                {courses.map((c) => (
                  <div
                    key={c._id}
                    className="border rounded-xl p-5 bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {c.code} — {c.title}
                        </p>
                        {typeof c.unit === "number" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Unit: {c.unit}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        href="/student/attendance"
                        className="bg-[#0b5a43] hover:bg-[#0f8a64] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                      >
                        Mark Attendance
                      </Link>

                      <span className="text-xs text-gray-400">
                        (Course: {c.code})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="mt-8 text-xs text-gray-400">
            UNN Attendance System • Student Access
          </p>
        </div>
      </div>
    </div>
  );
}


