import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background p-6 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.76 0.12 190 / 0.2), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="w-full max-w-sm space-y-6 relative">
        <Link href="/" className="block text-center space-y-1">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground">
            Gestão de campanhas publicitárias
          </p>
        </Link>
        {children}
      </div>
    </main>
  );
}
