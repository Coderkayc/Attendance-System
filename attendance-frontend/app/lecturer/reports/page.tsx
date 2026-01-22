/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

type ReportRow = {
  _id: string;
  course?: { _id?: string; code?: string; title?: string };
  student?: { _id?: string; name?: string; email?: string };
  status?: string; // "present" | "absent"
  markedAt?: string; // ISO date
};

type ReportsResponse = {
  items: ReportRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toInputDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function LecturerReportsPage() {
  const [data, setData] = useState<ReportsResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    pages: 1,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<"" | "present" | "absent">("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(limit));
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (status) p.set("status", status);
    return p.toString();
  }, [page, limit, from, to, status]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await api<ReportsResponse>(`/lecturer/reports/attendance?${qs}`);
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  async function downloadFile(pathWithQuery: string, filename: string) {
    const token = getToken();
    if (!token) {
      setErr("No token found. Please login again.");
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_URL!;
    const url = `${base}${pathWithQuery}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      setErr(text || "Download failed");
      return;
    }

    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(objectUrl);
  }

  function exportCsv() {
    downloadFile(`/lecturer/reports/attendance/export.csv?${qs}`, "lecturer-attendance.csv");
  }

  function exportPdf() {
    downloadFile(`/lecturer/reports/attendance/export.pdf?${qs}`, "lecturer-attendance.pdf");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 via-emerald-800 to-green-700 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35),transparent_65%)]" />

      <div className="relative w-full max-w-6xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Attendance Reports</h1>
            <p className="text-sm text-gray-600">View and export attendance records.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCsv}
              className="bg-green-700 hover:bg-green-800 text-white rounded-lg px-4 py-2 text-sm"
            >
              Export CSV
            </button>

            <button
              onClick={exportPdf}
              className="bg-green-700 hover:bg-green-800 text-white rounded-lg px-4 py-2 text-sm"
            >
              Export PDF
            </button>

            <Link href="/lecturer" className="text-sm font-medium text-green-800 hover:underline">
              Back
            </Link>
          </div>
        </div>

        {err ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {/* Filters */}
        <div className="rounded-xl border bg-white p-4">
          <div className="grid md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs font-semibold text-gray-700">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setPage(1);
                  setFrom(e.target.value);
                }}
                className="mt-1 w-full border rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setPage(1);
                  setTo(e.target.value);
                }}
                className="mt-1 w-full border rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value as any);
                }}
                className="mt-1 w-full border rounded-lg p-2 text-sm"
              >
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <button
              onClick={load}
              className="bg-green-700 hover:bg-green-800 text-white rounded-lg px-4 py-2 text-sm"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">Course</th>
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Marked At</th>
                </tr>
              </thead>

              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td className="p-4 text-gray-600" colSpan={5}>
                      {loading ? "Loading..." : "No records found."}
                    </td>
                  </tr>
                ) : (
                  data.items.map((r) => {
                    const s = (r.status || "").toLowerCase();
                    const isPresent = s === "present";

                    return (
                      <tr key={r._id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">
                            {r.course?.code || "—"}
                          </div>
                          <div className="text-xs text-gray-500">{r.course?.title || ""}</div>
                        </td>

                        <td className="p-3">{r.student?.name || "—"}</td>
                        <td className="p-3">{r.student?.email || "—"}</td>

                        <td className="p-3">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              isPresent
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isPresent ? "Present" : "Absent"}
                          </span>
                        </td>

                        <td className="p-3 text-gray-700">
                          {r.markedAt ? new Date(r.markedAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-3 border-t bg-gray-50">
            <p className="text-xs text-gray-600">
              Page {data.page} of {data.pages} • Total {data.total}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-md border bg-white text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-md border bg-white text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500">UNN Attendance System • Lecturer Access</p>
      </div>
    </div>
  );
}

