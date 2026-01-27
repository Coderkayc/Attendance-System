/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";

export default function LecturerCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  async function startSession() {
    setLoading(true);
    setErr("");
    setQrUrl(null);

    try {
      const res = await api<{ sessionId: string }>(`/attendance/course/${courseId}/sessions`, {
        method: "POST",
        body: JSON.stringify({ ttlMinutes: 10 }),
      });

      setSessionId(res.sessionId);
    } catch (e: any) {
      setErr(e.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  }

  async function loadQr(id: string) {
    setErr("");
    try {
      const token = getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL!;
      const r = await fetch(`${API_URL}/attendance/sessions/${id}/qr.png`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!r.ok) {
        const text = await r.text();
        throw new Error(text || "Failed to load QR");
      }

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      setQrUrl(url);
    } catch (e: any) {
      setErr(e.message || "Failed to load QR");
    }
  }

  useEffect(() => {
    if (sessionId) loadQr(sessionId);

    return () => {
      if (qrUrl) URL.revokeObjectURL(qrUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function endSession() {
    if (!sessionId) return;
    setLoading(true);
    setErr("");

    try {
      await api(`/attendance/sessions/${sessionId}/end`, { method: "PATCH" });
      setSessionId(null);
      setQrUrl(null);
    } catch (e: any) {
      setErr(e.message || "Failed to end session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-2">Course Attendance</h1>

      {err ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {!sessionId ? (
        <button
          onClick={startSession}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-green-900 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Starting..." : "Start Session (10 mins)"}
        </button>
      ) : (
        <div className="mt-6 bg-white rounded-xl border p-6 max-w-md">
          <h2 className="font-semibold text-lg">Session Active</h2>

          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="Attendance QR Code" className="mt-4 w-72 h-72" />
          ) : (
            <p className="mt-4 text-sm text-gray-600">Loading QR...</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => loadQr(sessionId)}
              className="px-4 py-2 rounded-lg border font-semibold"
            >
              Refresh QR
            </button>

            <button
              onClick={endSession}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Ending..." : "End Session"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

