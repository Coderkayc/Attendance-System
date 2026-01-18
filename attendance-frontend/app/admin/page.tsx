"use client";

import { getUser } from "@/lib/auth";
import Button from "@/components/Button";

export default function AdminPage() {
  const user = getUser();
  return (
    <div className="p-6">
      <div className="bg-white border rounded-2xl p-6 space-y-3">
        <h1 className="text-xl font-semibold text-black">Admin Dashboard</h1>
        <p className="text-sm text-gray-700 font-bold">Welcome, {user?.name}</p>
       <div className="flex gap-4">
  <Button href="/admin/courses">
    Manage Courses
  </Button>

  <Button href="/logout" variant="secondary">
    Logout
  </Button>
</div>
      </div>
    </div>
  );
}