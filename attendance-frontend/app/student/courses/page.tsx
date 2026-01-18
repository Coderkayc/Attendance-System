/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { api } from "@/lib/api";

type Course = {
  _id: string;
  code: string;
  title: string;
  unit?: number;
  lecturer?: any;
};

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await api<Course[]>("/courses/enrolled", { method: "GET" });
      setCourses(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">My Courses</h1>
              <p className="text-sm text-gray-600">
                These are the courses you are enrolled in.
              </p>
            </div>

            <Link className="underline text-sm" href="/student">
              Back
            </Link>
          </div>

          {err && (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-3 text-sm">
              {err}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Enrolled Courses</h2>
              <button
                onClick={load}
                className="border rounded-lg px-4 py-2 text-sm text-blue-600 "
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-600 mt-4">Loading...</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-gray-600 mt-4">
                You are not enrolled in any course yet. Ask admin to enroll you.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {courses.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        {c.code} — {c.title}
                      </h3>
                      {typeof c.unit === "number" && (
                        <span className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-700">
                          Unit: {c.unit}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Course ID: <span className="font-mono">{c._id}</span>
                    </p>

                    <div className="mt-4">
                      <Link
                        href="/student/attendance"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                      >
                        Mark Attendance
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

