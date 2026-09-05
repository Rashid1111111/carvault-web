export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
          CarVault
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Your car life, in one place.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-slate-300 sm:text-lg">
          Open this link on your iPhone with CarVault installed to continue in the app.
        </p>
      </section>
    </main>
  );
}
