import dynamic from "next/dynamic";

const ScanClient = dynamic(() => import("./ScanClient"), { ssr: false });

export default function StudentScanPage() {
  return <ScanClient />;
}

