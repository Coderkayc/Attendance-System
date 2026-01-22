/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Course = {
  _id: string;
  code: string;
  title: string;
};

export default function StudentAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
  setErr("");
  try {
    const data = await api<any[]>("/courses/enrolled");
    setCourses(data);
    if (data[0]) setCourseId(data[0]._id);
  } catch {
    setErr("Failed to load courses");
  }
}


  async function submitAttendance(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      await api("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          code: qrCode.trim(),
        }),
      });

      setMsg("✅ Attendance marked successfully");
      setQrCode("");
    } catch (e: any) {
      setErr(e?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4">
     
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35),transparent_65%)]" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-green-900">
            Mark Attendance
          </h1>
          <p className="text-sm text-gray-600">
            Select your course and enter the QR code.
          </p>
        </div>

        {(msg || err) && (
          <div
            className={`rounded-lg p-3 text-sm ${
              err
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {err || msg}
          </div>
        )}

        <form onSubmit={submitAttendance} className="space-y-4">
         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-lg border-2 border-green-600 bg-white px-4 py-3
             text-gray-800 font-medium
             focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-700
             hover:border-green-700
             transition"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR Code
            </label>
            <input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Paste code from lecturer"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 hover:bg-green-800 text-white py-3 font-medium transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Attendance"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          UNN Attendance System • Student Access
        </p>
      </div>
    </div>
  );
}
