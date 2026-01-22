"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = "att_token=; path=/; max-age=0";
    document.cookie = "att_role=; path=/; max-age=0";
    
    localStorage.removeItem("auth");

    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-white/70">Logging out...</p>
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    document.cookie = "att_token=; path=/; max-age=0";
    document.cookie = "att_role=; path=/; max-age=0";
    localStorage.removeItem("auth");

    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}

