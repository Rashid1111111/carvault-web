import { Suspense } from "react";
import { CallbackContent } from "./CallbackContent";

function CallbackFallback() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-sm text-white/80">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#0d2a3a]">
      <Suspense fallback={<CallbackFallback />}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
