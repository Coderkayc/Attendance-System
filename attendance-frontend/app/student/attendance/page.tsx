/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { api } from "@/lib/api";

type Course = {
  _id: string;
  code: string;
  title: string;
};

export default function StudentAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  async function loadCourses() {
    setLoadingCourses(true);
    setMsg(null);
    try {
      const data = await api<Course[]>("/courses/enrolled", { method: "GET" });
      setCourses(data);

      // auto-select first course if available
      if (data.length > 0) setSelectedCourseId(data[0]._id);
    } catch (e: any) {
      setMsg(e.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!selectedCourseId) {
      setMsg("❌ Please select a course first.");
      return;
    }
    if (!code.trim()) {
      setMsg("❌ Please paste the QR code value.");
      return;
    }

    setLoading(true);
    try {
      await api("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({ code, courseId: selectedCourseId }),
      });

      setMsg("✅ Attendance marked successfully");
      setCode("");
    } catch (e: any) {
      setMsg(e.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-md mx-auto px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              Mark Attendance
            </h1>
            <p className="text-sm text-gray-600">
              Select your course, then paste the QR code from your lecturer.
            </p>
          </div>

          {msg && (
            <div className="border rounded-xl p-3 text-sm bg-blue-50 border-blue-200 text-blue-800">
              {msg}
            </div>
          )}

          <form
            onSubmit={submit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Course
              </label>

              {loadingCourses ? (
                <p className="text-sm text-gray-600">Loading courses...</p>
              ) : courses.length === 0 ? (
                <p className="text-sm text-gray-600">
                  You are not enrolled in any course yet. Ask admin to enroll
                  you.
                </p>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white text-gray-600"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                QR Code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste code from QR"
                className="w-full border rounded-lg px-3 py-2 text-gray-600"
              />
            </div>

            <button
              disabled={loading || loadingCourses || courses.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 transition"
            >
              {loading ? "Submitting..." : "Submit Attendance"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
