"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";

function Card({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
    >
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </Link>
  );
}

export default function StudentPage() {
  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              View your courses and mark attendance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card
              title="My Courses"
              desc="View courses you are enrolled in"
              href="/student/courses"
            />
            <Card
              title="Mark Attendance"
              desc="Submit QR code to mark attendance"
              href="/student/attendance"
            />
            <Card
            title="Attendance History"
            desc="See all your attendance records"
            href="/student/history"
            />
          </div>
        </div>
      </div>
    </>
  );
}


