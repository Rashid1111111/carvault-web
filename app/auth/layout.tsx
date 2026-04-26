export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#0d2a3a] px-4 py-10 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center sm:min-h-[calc(100vh-8rem)]">
        {children}
      </div>
    </div>
  );
}
