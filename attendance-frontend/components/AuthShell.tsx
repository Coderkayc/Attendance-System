"use client";
import Image from "next/image";
import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b3b2e]">
    
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#0f4b39] via-[#0b3b2e] to-[#06261d]" />
        <div className="absolute -top-40 -left-40 h-105 w-105 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-130 w-130 rounded-full bg-green-300/10 blur-3xl" />

        <div 
        className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 ring-1 ring-white/20 overflow-hidden grid place-items-center">
                   <Image
                     src="/UNN.png"
                     alt="UNN Logo"
                     width={44}
                     height={44}
                     className="object-contain"
                     priority
                   />
                 </div>

            <div className="leading-tight">
              <div className="text-xs text-white/75">University of Nigeria Nsukka</div>
              <div className="text-white font-semibold">Attendance System</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/15"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-black hover:bg-emerald-300"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
         
          <section className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              UNN • QR Attendance • Secure
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-3 text-white/75">{subtitle}</p>

            <div className="mt-8 grid gap-3">
              <Feature
                title="QR Code Attendance"
                desc="Lecturers generate a session QR code. Students submit it to mark attendance."
              />
              <Feature
                title="Role-based Access"
                desc="Admin manages courses & enrollment. Lecturers manage sessions. Students mark attendance."
              />
              <Feature
                title="Fast & Reliable"
                desc="Attendance is stored instantly and duplicates are blocked per session."
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur flex items-center">
            <div className="w-full">
              <div className="rounded-2xl bg-white p-7 shadow-xl">
                {children}
              </div>
              <p className="mt-4 text-center text-xs text-white/60">
                © {new Date().getFullYear()} Attendance System
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="text-sm text-white/70 mt-1">{desc}</p>
    </div>
  );
}
