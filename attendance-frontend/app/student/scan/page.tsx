export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import dynamicImport from "next/dynamic";
import { Suspense } from "react";

const ScanClient = dynamicImport(() => import("./ScanClient"), {
  ssr: false,
  loading: () => <div className="p-6">Loading...</div>,
});

export default function StudentScanPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ScanClient />
    </Suspense>
  );
}




