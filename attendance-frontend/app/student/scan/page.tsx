"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ScanClient = dynamic(() => import("./ScanClient"), {
  ssr: false,
});

export default function StudentScanPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ScanClient />
    </Suspense>
  );
}






