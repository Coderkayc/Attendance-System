/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Course = {
  _id: string;
  code: string;
  title: string;
};

export default function LecturerSessionsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [durationMins, setDurationMins] = useState(10);

  const [sessionId, setSessionId] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [status, setStatus] = useState<"open" | "closed">("open");

  const [qrDataUrl, setQrDataUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === courseId),
    [courses, courseId]
  );

  useEffect(() => {
    loadMyCourses();
  }, []);

  async function loadMyCourses() {
    setLoading(true);
    setErr(null);

    try {
      const data = await api<Course[]>("/courses/my");
      setCourses(data);
      if (!courseId && data[0]) setCourseId(data[0]._id);
    } catch {
      setErr("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function createSession() {
    if (!courseId) return;

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const data = await api<any>(`/attendance/course/${courseId}/sessions`, {
        method: "POST",
        body: JSON.stringify({ durationMinutes: durationMins }),
      });

    const newSessionId =
      data?.session?.id || data?.session?._id || data?.sessionId || data?.id;

    const newStatus = (data?.session?.status || data?.status || "open") as "open" | "closed";

    const newQr = data?.qr?.dataUrl || "";
    const newCode = data?.qr?.text || data?.qr?.code || data?.session?.code || "";
    
    let attendanceCode = "";

if (newCode) {
  try {
    const parsed = JSON.parse(newCode);
    attendanceCode = parsed.code;
  } catch {
    attendanceCode = newCode;
  }
}

    setSessionId(String(newSessionId));
    setStatus(newStatus);
    setQrDataUrl(String(newQr));
    setSessionCode(attendanceCode); 

      setMsg("Attendance session created. Display QR code to students.");
    } catch (e: any) {
      setErr(e?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (!sessionId) return;

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      await api(`/attendance/sessions/${sessionId}/end`, { method: "PATCH" });
      setStatus("closed");
      setMsg("Session ended successfully.");
    } catch {
      setErr("Failed to end session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4 relative">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35),transparent_65%)]" />

      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-900">
              Lecturer • Attendance Sessions
            </h1>
            <p className="text-sm text-gray-600">
              Create sessions and display QR codes.
            </p>
          </div>

          <Link
            href="/lecturer"
            className="text-sm font-medium text-green-800 hover:underline"
          >
            Back
          </Link>
        </div>

        {(msg || err) && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              err
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {err || msg}
          </div>
        )}

        <div className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Select Course</h2>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="border rounded-lg p-3 min-w-65 text-gray-700"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Duration</span>
              <input
                type="number"
                min={1}
                className="border rounded-lg p-2 w-20 text-gray-700"
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
              />
              <span className="text-sm text-gray-600">mins</span>
            </div>

            <button
              onClick={createSession}
              disabled={loading}
              className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-lg px-5 py-2 text-sm transition"
            >
              Create Session
            </button>

            <button
              onClick={loadMyCourses}
              disabled={loading}
              className="border rounded-lg px-4 py-2 text-sm bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white transition"
            >
              Refresh
            </button>
          </div>

          {selectedCourse && (
            <p className="text-xs text-gray-500">
              Selected: {selectedCourse.code} — {selectedCourse.title}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">QR Code</h2>

            <button
              onClick={endSession}
              disabled={!sessionId || status === "closed" || loading}
              className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 text-sm transition"
            >
              End Session
            </button>
          </div>

          {!sessionId ? (
            <p className="text-sm text-gray-600">
              Create a session to generate a QR code.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Attendance QR"
                    className="w-65 h-65"
                  />
                ) : (
                  <p className="text-sm text-red-600">QR not available</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-black">
                  Status:{" "}
                  <span className="font-semibold text-green-700">{status}</span>
                </p>

                <div>
                  <p className="text-sm font-semibold text-black">Attendance Code</p>
                  <input
                    readOnly
                    value={sessionCode}
                    className="w-full border rounded-lg p-2 font-mono text-sm text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-500">
          UNN Attendance System • Lecturer Access
        </p>
      </div>
    </div>
  );
}
