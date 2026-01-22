"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen text-white bg-linear-to-br from-[#0b3d2e] via-[#0f5132] to-[#06281d]">
      
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-128 w-lg rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-112 w-md rounded-full bg-green-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-120 w-120 rounded-full bg-lime-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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

            <div>
              <p className="text-sm text-white/70 font-bold">University of Nigeria Nsukka</p>
              <p className="text-lg font-semibold">Attendance System</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
            >
              Register
            </Link>
          </div>
        </header>

        <section className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              UNN • QR Attendance • Secure
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Smart attendance tracking for the
              <span className="block text-emerald-300">
                Department of Computer Science
              </span>
            </h1>

            <p className="max-w-xl text-white/70">
              A modern attendance system built for Computer Science Department. Lecturers create QR
              sessions, students mark attendance instantly, and admins manage
              courses with ease.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition"
              >
                Continue to Login →
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20 transition"
              >
                Create Account
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <Badge text="JWT Security" />
              <Badge text="QR + Code Attendance" />
              <Badge text="Admin • Lecturer • Student" />
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/20 backdrop-blur">
            <p className="text-sm font-semibold text-white/80">How it works</p>

            <div className="mt-5 space-y-3">
              <Step n="1" title="Admin setup" desc="Create courses and assign lecturers." />
              <Step n="2" title="Lecturer session" desc="Generate a QR attendance session." />
              <Step n="3" title="Student attendance" desc="Scan QR or paste code to submit." />
              <Step n="4" title="Reports" desc="View attendance records instantly." />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <MiniStat label="Roles" value="3" />
              <MiniStat label="QR Ready" value="Yes" />
              <MiniStat label="UNN" value="Official" />
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          <Feature
            title="Role-based dashboards"
            desc="Each user sees exactly what they need—nothing more, nothing less."
          />
          <Feature
            title="Fast & reliable"
            desc="Attendance submission works instantly, even with poor network."
          />
          <Feature
            title="Clean UI"
            desc="Simple, modern interface designed for real university use."
          />
        </section>

        <footer className="mt-16 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} University of Nigeria • Attendance System
        </footer>
      </div>
    </main>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/30 text-sm font-bold text-emerald-200 ring-1 ring-emerald-300/30">
        {n}
      </div>
      <div>
        <p className="font-semibold text-white/80">{title}</p>
        <p className="text-sm text-white/60">{desc}</p>
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/20 backdrop-blur">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/20">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">
      {text}
    </span>
  );
}
