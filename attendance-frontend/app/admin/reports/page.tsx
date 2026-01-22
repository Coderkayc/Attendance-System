/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

type ReportRow = {
  _id: string;
  course: { code: string; title: string };
  student: { name: string; email: string; matric?: string };
  status: string;
  markedAt: string;
};

type ReportsResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  records: ReportRow[];
};

async function downloadWithAuth(path: string, fallbackName: string) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || fallbackName;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export default function AdminReportsPage() {
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const limit = 25;

  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    p.set("page", String(page));
    p.set("limit", String(limit));
    return p.toString();
  }, [status, from, to, page]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await api<ReportsResponse>(`/admin/reports/attendance?${qs}`);
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35),transparent_65%)]" />

      <div className="relative w-full max-w-5xl bg-white/95 rounded-2xl shadow-2xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Attendance Reports</h1>
            <p className="text-sm text-gray-600">View and export attendance records.</p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => downloadWithAuth(`/admin/reports/attendance/export.csv?${qs}`, "attendance-report.csv")}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm"
            >
              Export CSV
            </button>
            <button
              onClick={() => downloadWithAuth(`/admin/reports/attendance/export.pdf?${qs}`, "attendance-report.pdf")}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm"
            >
              Export PDF
            </button>
            <Link href="/admin" className="text-sm text-green-900 font-semibold hover:underline">
              Back
            </Link>
          </div>
        </div>

        {err && (
          <div className="border border-red-200 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {err}
          </div>
        )}

        <div className="border rounded-xl p-4 bg-white flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-gray-600">From</label>
            <input
              type="date"
              className="block border rounded-lg p-2 text-gray-700"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">To</label>
            <input
              type="date"
              className="block border rounded-lg p-2 text-gray-700"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Status</label>
            <select
              className="block border rounded-lg p-2 text-gray-700"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <button
            onClick={load}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <div className="ml-auto text-sm text-gray-600">
            {data ? `Total: ${data.total}` : ""}
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="p-3">Course</th>
                <th className="p-3">Student</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Marked At</th>
              </tr>
            </thead>
            <tbody>
              {!data?.records?.length ? (
                <tr>
                  <td colSpan={5} className="p-4 text-gray-600">
                    {loading ? "Loading..." : "No records found."}
                  </td>
                </tr>
              ) : (
                data.records.map((r) => (
                  <tr key={r._id} className="border-b last:border-b-0">
                    <td className="p-3 font-medium text-black">
                      {r.course?.code} — {r.course?.title}
                    </td>
                    <td className="p-3 text-black">{r.student?.name}</td>
                    <td className="p-3 text-black">{r.student?.email}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          String(r.status).toLowerCase() === "present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {String(r.status).toLowerCase() === "present" ? "Present" : "Absent"}
                      </span>
                    </td>
                    <td className="p-3 text-black">
                      {r.markedAt ? new Date(r.markedAt).toLocaleString() : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <button
                className="border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {data.page} of {data.pages}
              </span>
              <button
                className="border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-500">UNN Attendance System • Admin Access</p>
      </div>
    </div>
  );
}
