import { BrowserCanonicalUrl } from "@/app/lib/BrowserCanonicalUrl";
import { getProfileLink, getProfilePath } from "@/app/lib/links";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfileLinkFallbackPage({ params }: PageProps) {
  const { username: usernameParam } = await params;
  const username = decodeURIComponent(usernameParam);
  const publicUrl = getProfileLink(username);
  const path = getProfilePath(username);
  const appDeepLink = `carvault://u/${encodeURIComponent(username)}`;

  return (
    <div className="min-h-screen bg-[#0d2a3a] px-4 py-16 text-center text-white">
      <div className="mx-auto max-w-md">
        <p className="text-xs uppercase tracking-wide text-white/50">CarVault profile link</p>
        <p className="mt-1 text-xs text-white/40">Exact canonical link</p>
        <p className="mt-0.5">
          <BrowserCanonicalUrl path={path} serverFallback={publicUrl} />
        </p>
        <p className="mt-6 text-lg font-medium text-white">@{username}</p>
        <p className="mt-4 text-sm text-white/70">Open this profile in the CarVault app</p>
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
