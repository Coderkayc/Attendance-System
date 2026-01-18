"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Course = {
  _id: string;
  code: string;
  title: string;
  unit?: number;
};

type UserLite = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "lecturer" | "student";
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<UserLite[]>([]);
  const [students, setStudents] = useState<UserLite[]>([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // create course form
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState<number>(2);

  // assign lecturer (dropdowns)
  const [assignCourseId, setAssignCourseId] = useState("");
  const [lecturerId, setLecturerId] = useState("");

  // enroll student (dropdowns + optional search)
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s._id.toLowerCase().includes(q)
      );
    });
  }, [students, studentSearch]);

  async function loadAll() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const [courseData, lecturerData, studentData] = await Promise.all([
        api<Course[]>("/courses", { method: "GET" }),
        api<UserLite[]>("/users?role=lecturer", { method: "GET" }),
        api<UserLite[]>("/users?role=student", { method: "GET" }),
      ]);

      setCourses(courseData);
      setLecturers(lecturerData);
      setStudents(studentData);

      // set defaults if empty
      if (!assignCourseId && courseData[0]) setAssignCourseId(courseData[0]._id);
      if (!enrollCourseId && courseData[0]) setEnrollCourseId(courseData[0]._id);
      if (!lecturerId && lecturerData[0]) setLecturerId(lecturerData[0]._id);
      if (!studentId && studentData[0]) setStudentId(studentData[0]._id);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load data";
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCourse() {
    setErr(null);
    setMsg(null);
    try {
      const body = { code: code.trim().toUpperCase(), title: title.trim(), unit };
      await api<Course>("/courses", { method: "POST", body: JSON.stringify(body) });

      setMsg("✅ Course created");
      setCode("");
      setTitle("");
      await loadAll();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create course";
      setErr(message);
    }
  }

  async function assignLecturer() {
    setErr(null);
    setMsg(null);

    if (!assignCourseId || !lecturerId) {
      setErr("Please select a course and a lecturer.");
      return;
    }

    try {
      await api(`/courses/${assignCourseId}/assign-lecturer`, {
        method: "PATCH",
        body: JSON.stringify({ lecturerId }),
      });
      setMsg("✅ Lecturer assigned successfully");
      await loadAll();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to assign lecturer";
      setErr(message);
    }
  }

  async function enrollStudent() {
    setErr(null);
    setMsg(null);

    if (!enrollCourseId || !studentId) {
      setErr("Please select a course and a student.");
      return;
    }

    try {
      await api(`/courses/${enrollCourseId}/enroll`, {
        method: "POST",
        body: JSON.stringify({ studentId }),
      });
      setMsg("✅ Student enrolled");
      await loadAll();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to enroll student";
      setErr(message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Admin • Courses</h1>
            <p className="text-sm text-gray-600">
              Create courses, assign lecturers, enroll students.
            </p>
          </div>
          <Link className="underline" href="/admin">
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

        {/* Create Course */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-black">Create Course</h2>

          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="border rounded-xl p-3 text-gray-700"
              placeholder="Code e.g. CSC101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              className="border rounded-xl p-3 sm:col-span-2 text-gray-700"
              placeholder="Title e.g. Introduction to Computing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 font-semibold">Unit</label>
            <input
              className="border rounded-xl p-2 w-20 text-gray-700"
              type="number"
              value={unit}
              onChange={(e) => setUnit(Number(e.target.value))}
              min={1}
              max={10}
            />
            <button
              onClick={createCourse}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 transition"
            >
              Create
            </button>
          </div>
        </div>

        {/* Assign Lecturer */}
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-black">Assign Lecturer to Course</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-semibold">Course</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-800"
                value={assignCourseId}
                onChange={(e) => setAssignCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-semibold">Lecturer</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-800"
                value={lecturerId}
                onChange={(e) => setLecturerId(e.target.value)}
              >
                {lecturers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={assignLecturer}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 transition"
          >
            Assign Lecturer
          </button>

          {lecturers.length === 0 && (
            <p className="text-xs text-red-600">
              No lecturers found. Create/register a lecturer first.
            </p>
          )}
        </div>

        {/* Enroll Student */}
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-black">Enroll Student</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-semibold">Course</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-800"
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-semibold">Student</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-800"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                {filteredStudents.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <input
            className="w-full border rounded-xl p-3 text-gray-700"
            placeholder="Search student by name/email (optional)"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />

          <button
            onClick={enrollStudent}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 transition"
          >
            Enroll Student
          </button>

          {students.length === 0 && (
            <p className="text-xs text-red-600">
              No students found. Create/register a student first.
            </p>
          )}
        </div>

        {/* Course List */}
        <div className="bg-white border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">All Courses</h2>
            <button
              onClick={loadAll}
              className="border rounded-xl px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {courses.length === 0 ? (
            <p className="text-sm text-gray-600">No courses yet.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c._id} className="border rounded-xl p-3 text-sm bg-white">
                  <div className="font-medium text-gray-900">
                    {c.code} — {c.title}
                  </div>
                  <div className="text-gray-600">
                    Unit: <span className="font-mono">{c.unit ?? "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Helpful note */}
        <p className="text-xs text-gray-500">
          If the lecturer/student dropdowns are empty, confirm your backend has{" "}
          <span className="font-mono">GET /api/users?role=lecturer</span> and{" "}
          <span className="font-mono">GET /api/users?role=student</span> (admin only).
        </p>
      </div>
    </div>
  );
}

