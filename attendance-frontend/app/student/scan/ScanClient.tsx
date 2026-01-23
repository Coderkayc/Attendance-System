/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ScanClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [msg, setMsg] = useState("Processing QR...");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErr("No token found in QR.");
      return;
    }

    (async () => {
      try {
        const res = await api<any>("/attendance/qr/consume", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        setMsg(res.message || "Attendance marked ✅");
        setTimeout(() => router.push("/student/history"), 1500);
      } catch (e: any) {
        setErr(e?.message || "QR invalid/expired. Rescan.");
      }
    })();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h1 className="text-xl font-bold text-green-900">Scan Attendance</h1>
        {err ? (
          <p className="mt-3 text-red-700">{err}</p>
        ) : (
          <p className="mt-3 text-gray-700">{msg}</p>
        )}
      </div>
    </div>
  );
}

