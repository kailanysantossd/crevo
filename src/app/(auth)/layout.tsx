import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background p-6 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.7 0.2 290 / 0.3), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="w-full max-w-sm space-y-6 relative">
        <Link href="/" className="block text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              crevo
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de campanhas publicitárias
          </p>
        </Link>
        {children}
      </div>
    </main>
  );
}
