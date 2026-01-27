/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

type ConsumeResponse = {
  message?: string;
  course?: { code?: string; title?: string };
  session?: { date?: string; startTime?: string };
};

export default function ScanClient() {
  const params = useSearchParams();
  const router = useRouter();

  // useMemo just to avoid any weird rerenders
  const token = useMemo(() => params.get("token"), [params]);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState("Processing QR...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function consume() {
      if (!token) {
        setStatus("error");
        setError("No token found in the QR link.");
        return;
      }

      setStatus("loading");
      setError(null);
      setMsg("Processing QR...");

      try {
        const res = await api<ConsumeResponse>("/attendance/qr/consume", {
          method: "POST",
          body: JSON.stringify({ token }),
          auth: true, // keep true if your backend requires student JWT
        });

        if (cancelled) return;

        setStatus("success");
        setMsg(res?.message || "Attendance marked ✅");

        // Redirect after 1.5s
        setTimeout(() => {
          if (!cancelled) router.push("/student/history");
        }, 1500);
      } catch (e: any) {
        if (cancelled) return;

        setStatus("error");
        setError(e?.message || "QR invalid/expired. Please rescan.");
      }
    }

    consume();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h1 className="text-xl font-bold text-green-900">Scan Attendance</h1>

        {status === "loading" && (
          <p className="mt-3 text-gray-700">{msg}</p>
        )}

        {status === "success" && (
          <>
            <p className="mt-3 text-green-700 font-medium">{msg}</p>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to attendance history...
            </p>
            <button
              onClick={() => router.push("/student/history")}
              className="mt-4 w-full rounded-lg bg-green-900 px-4 py-3 font-semibold text-white hover:bg-green-700"
            >
              View History Now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="mt-3 text-red-700">{error}</p>
            <button
              onClick={() => router.push("/student")}
              className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}


