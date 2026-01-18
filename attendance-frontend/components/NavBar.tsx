/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
  }, []);

  function handleLogout() {
    document.cookie = "att_token=; path=/; max-age=0";
    document.cookie = "att_role=; path=/; max-age=0";
    localStorage.removeItem("auth");
    router.push("/login");
  }

  return (
    <div className="w-full bg-gray-100 border-b">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <p className="font-semibold text-black text-2xl">
            Attendance System
          </p>
          <p className="text-sm text-black capitalize font-bold">
            {user?.role}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-xl text-black font-bold">
            {user?.name}
          </p>

          <button
            onClick={handleLogout}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

