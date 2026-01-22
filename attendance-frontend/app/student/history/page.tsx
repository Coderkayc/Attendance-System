"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type AttendanceRecord = {
  _id: string;
  course: {
    code: string;
    title: string;
  };
  createdAt: string;
  status: "present" | "absent";
};

export default function StudentHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    setErr("");
    try {
      const data = await api<AttendanceRecord[]>("/attendance/me");
      setRecords(data);
    } catch {
      setErr("Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35),transparent_65%)]" />

      <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-900">
              Attendance History
            </h1>
            <p className="text-sm text-gray-600">
              All attendance records you have marked.
            </p>
          </div>

          <button
            onClick={loadHistory}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm transition disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="space-y-3">
          {records.length === 0 && !loading && (
            <p className="text-center text-sm text-gray-500">
              No attendance records found.
            </p>
          )}

          {records.map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {r.course.code} — {r.course.title}
                </p>
                <p className="text-xs text-gray-500">
                  Marked on{" "}
                  {new Date(r.createdAt).toLocaleDateString()} at{" "}
                  {new Date(r.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  r.status === "present"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {r.status === "present" ? "Present" : "Absent"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-gray-500">
          UNN Attendance System • Student Access
        </p>
      </div>
    </div>
  );
}
