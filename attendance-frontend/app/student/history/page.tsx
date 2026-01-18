/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { api } from "@/lib/api";

type AttendanceRecord = {
  _id: string;
  markedAt: string;
  course: {
    _id: string;
    code: string;
    title: string;
  };
  session: {
    _id: string;
  };
};

export default function StudentHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<AttendanceRecord[]>("/attendance/me", {
        method: "GET",
      });
      setRecords(data);
    } catch (e: any) {
      setError(e.message || "Failed to load attendance history");
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                Attendance History
              </h1>
              <p className="text-sm text-gray-600">
                All attendance you have marked.
              </p>
            </div>

            <Link href="/student" className="underline text-sm">
              Back
            </Link>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-black">Records</h2>
              <button
                onClick={load}
                className="border rounded-lg px-4 py-2 text-sm bg-blue-600"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-600 mt-4">Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-gray-600 mt-4">
                No attendance records yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {records.map((r) => (
                  <div
                    key={r._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-500">
                          {r.course.code} — {r.course.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Marked on{" "}
                          {new Date(r.markedAt).toLocaleString()}
                        </p>
                      </div>

                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Present
                      </span>
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

