import { BrowserCanonicalUrl } from "@/app/lib/BrowserCanonicalUrl";
import { getCarLink, getCarPath } from "@/app/lib/links";

type PageProps = {
  params: Promise<{ carId: string }>;
};

export default async function CarLinkFallbackPage({ params }: PageProps) {
  const { carId: carIdParam } = await params;
  const carId = decodeURIComponent(carIdParam);
  const publicUrl = getCarLink(carId);
  const path = getCarPath(carId);
  const appDeepLink = `carvault://car/${encodeURIComponent(carId)}`;

  return (
    <div className="min-h-screen bg-[#0d2a3a] px-4 py-16 text-center text-white">
      <div className="mx-auto max-w-md">
        <p className="text-xs uppercase tracking-wide text-white/50">CarVault car link</p>
        <p className="mt-1 text-xs text-white/40">Exact canonical link</p>
        <p className="mt-0.5">
          <BrowserCanonicalUrl path={path} serverFallback={publicUrl} />
        </p>
        <p className="mt-2 text-sm text-white/60">Car ID</p>
        <p className="mt-1 break-all font-mono text-sm text-white/90">{carId}</p>
        <p className="mt-6 text-sm text-white/70">Open this car in the CarVault app</p>
        <a
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-6 text-sm font-semibold text-[#0d2a3a] no-underline transition hover:bg-amber-300"
          href={appDeepLink}
        >
          Open in CarVault
        </a>
      </div>
    </div>
  );
}
