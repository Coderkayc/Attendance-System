"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

type Course = {
  _id: string;
  code: string;
  title: string;
};

type CreateSessionApiResponse = {
  session: {
    id: string;
    course: string;
    startsAt: string;
    endsAt: string;
    status: "open" | "closed";
  };
  qr: {
    text: string; // JSON string {"code":"...","courseId":"..."}
    dataUrl: string; // data:image/png;base64,...
  };
};

export default function LecturerSessionsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>("");

  const [durationMins, setDurationMins] = useState<number>(15);

  // active session state
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionCode, setSessionCode] = useState<string>("");
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === courseId) || null,
    [courses, courseId]
  );

  async function loadMyCourses() {
    setErr(null);
    setLoading(true);
    try {
      // backend: GET /api/courses/my (lecturer)
      const data = await api<Course[]>("/courses/my", { method: "GET" });
      setCourses(data);
      if (!courseId && data[0]) setCourseId(data[0]._id);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load courses";
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSession() {
    setErr(null);
    setMsg(null);

    if (!courseId) {
      setErr("Please select a course.");
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT: backend expects { durationMinutes }, not durationMins
      const data = await api<CreateSessionApiResponse>(
        `/attendance/course/${courseId}/sessions`,
        {
          method: "POST",
          body: JSON.stringify({ durationMinutes: durationMins }),
        }
      );

      // session fields
      setSessionId(data.session.id);
      setStatus(data.session.status);

      // use backend QR dataUrl (fast + reliable)
      setQrDataUrl(data.qr.dataUrl);

      // extract code from qr.text JSON
      const parsed = JSON.parse(data.qr.text) as { code: string; courseId: string };
      setSessionCode(parsed.code);

      setMsg("✅ Attendance session created. Display the QR code to students.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create session";
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    setErr(null);
    setMsg(null);

    if (!sessionId) return;

    setLoading(true);
    try {
      // backend: PATCH /api/attendance/sessions/:sessionId/end
      await api(`/attendance/sessions/${sessionId}/end`, { method: "PATCH" });

      setStatus("closed");
      setMsg("✅ Session ended.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to end session";
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!sessionCode) return;
    navigator.clipboard.writeText(sessionCode);
    setMsg("✅ Attendance code copied.");
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              Lecturer • Attendance Sessions
            </h1>
            <p className="text-sm text-gray-600">
              Select a course, create a session, and show the QR code.
            </p>
          </div>
          <Link className="underline" href="/lecturer">
            Back
          </Link>
        </div>

        {(msg || err) && (
          <div
            className={`border rounded-xl p-3 text-sm ${
              err
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {err || msg}
          </div>
        )}

        {/* Select Course */}
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-black">Select Course</h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              className="w-full sm:w-105 border border-gray-300 rounded-lg p-3 bg-white text-gray-800"
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
              <span className="text-sm text-gray-700">Duration</span>
              <input
                className="border border-gray-300 rounded-lg p-2 w-20 text-gray-800"
                type="number"
                min={1}
                max={180}
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
              />
              <span className="text-sm text-gray-700">mins</span>
            </div>

            <button
              onClick={createSession}
              disabled={loading || !courseId}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 transition disabled:opacity-60"
            >
              Create Session
            </button>

            <button
              onClick={loadMyCourses}
              disabled={loading}
              className="border rounded-lg px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {selectedCourse && (
            <p className="text-sm text-gray-600">
              Selected:{" "}
              <span className="font-medium text-gray-900">
                {selectedCourse.code} — {selectedCourse.title}
              </span>
            </p>
          )}
        </div>

        {/* QR + Code */}
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">QR Code</h2>

            <button
              onClick={endSession}
              disabled={!sessionId || status === "closed" || loading}
              className={`px-4 py-2 rounded-lg border text-sm transition bg-blue-600 hover:bg-blue-700 ${
                !sessionId || status === "closed"
                  ? ""
                  : ""
              }`}
            >
              End Session
            </button>
          </div>

          {!sessionId ? (
            <p className="text-sm text-gray-600">
              Create a session to generate a QR code for students.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* QR Image */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="text-sm text-gray-700 mb-3">
                  Students should scan this QR and submit attendance.
                </p>

                <div className="bg-white rounded-xl p-3 inline-block">
                  {/* dataUrl is easiest; Next Image supports it but we keep unoptimized */}
                  <Image
                    src={qrDataUrl}
                    alt="Attendance QR"
                    width={260}
                    height={260}
                    unoptimized
                  />
                </div>
              </div>

              {/* Code + Status */}
              <div className="space-y-4">
                <div className="text-sm">
                  <span className="text-gray-600">Session Status: </span>
                  <span
                    className={`font-semibold ${
                      status === "open" ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-semibold">
                    Attendance Code
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={sessionCode}
                      className="w-full border rounded-lg p-2 font-mono text-sm text-gray-800"
                    />
                    <button
                      onClick={copyCode}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                    >
                      Copy
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Students can paste this code into their “Mark Attendance” page.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Note: internal IDs and raw JSON are hidden for a cleaner lecturer experience.
        </p>
      </div>
    </div>
  );
}


