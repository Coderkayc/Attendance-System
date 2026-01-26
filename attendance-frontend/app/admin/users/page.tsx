/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type UserRow = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "lecturer" | "student";
  matric?: string;
  staffId?: string;
};

export default function AdminUsersPage() {
  const [list, setList] = useState<UserRow[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRow["role"]>("lecturer");
  const [password, setPassword] = useState("");
  const [matric, setMatric] = useState("");
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await api<UserRow[]>("/admin/users");
      setList(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      await api("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          matric: role === "student" ? matric : undefined,
          staffId: role === "lecturer" ? staffId : undefined,
        }),
      });

      setMsg("User created ✅");
      setName("");
      setEmail("");
      setPassword("");
      setMatric("");
      setStaffId("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">Admin · Users</h1>

        <div className="rounded-2xl bg-white p-5 shadow-sm border">
          <h2 className="font-semibold">Create user</h2>

          {msg ? <p className="mt-2 text-sm text-green-700">{msg}</p> : null}
          {err ? <p className="mt-2 text-sm text-red-700">{err}</p> : null}

          <form onSubmit={onCreate} className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="border rounded-lg p-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="border rounded-lg p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <select className="border rounded-lg p-3" value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="lecturer">Lecturer</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <input className="border rounded-lg p-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {role === "student" ? (
              <input className="border rounded-lg p-3 md:col-span-2" placeholder="Matric" value={matric} onChange={(e) => setMatric(e.target.value)} />
            ) : null}

            {role === "lecturer" ? (
              <input className="border rounded-lg p-3 md:col-span-2" placeholder="Staff ID" value={staffId} onChange={(e) => setStaffId(e.target.value)} />
            ) : null}

            <button disabled={loading} className="md:col-span-2 rounded-lg bg-green-900 text-white py-3 font-semibold disabled:opacity-60">
              {loading ? "Creating..." : "Create user"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border">
          <h2 className="font-semibold">Users</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u._id || u.id || u.email} className="border-b">
                    <td className="py-2">{u.name}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={load} className="mt-4 text-sm underline">
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
