"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "lecturer" | "student" | string;

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(";").shift()!);
  return null;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export default function ProfileMenu() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const role: Role = useMemo(() => getCookie("att_role") ?? "user", []);
  const initial = (role?.[0] ?? "U").toUpperCase();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function handleLogout() {
    clearCookie("att_token");
    clearCookie("att_role");
    localStorage.removeItem("auth");
    router.push("/login");
  }

  function goProfile() {
    router.push(`/${role}/profile`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 rounded-full border border-white/15 bg-white/10 flex items-center justify-center font-semibold hover:bg-white/15 transition"
        aria-label="Open profile menu"
      >
        {initial}
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-lg">
          <div className="px-3 py-2 text-xs text-white/60 border-b border-white/10">
            Signed in as <span className="text-white">{role}</span>
          </div>

          <button
            onClick={goProfile}
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition"
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
