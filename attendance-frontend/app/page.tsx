import  Button from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border rounded-2xl p-6 w-full max-w-md space-y-3">
        <h1 className="text-xl font-semibold text-black">Attendance System</h1>
        <p className="text-sm text-gray-900">Continue to login.</p>
       <Button href="/login" variant="secondary">
           Go to Login
         </Button>
      </div>
    </div>
  );
}

