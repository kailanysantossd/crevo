import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background p-8 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.76 0.12 190 / 0.18), transparent 55%), radial-gradient(ellipse at bottom right, oklch(0.31 0.06 250 / 0.15), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="max-w-md text-center space-y-8 relative">
        <div className="space-y-3">
          <Logo size="xl" />
          <p className="text-muted-foreground text-lg">
            Gestão de campanhas publicitárias
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Entrar
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Criar conta
          </Link>
        </div>

        <p className="text-xs text-muted-foreground pt-12">
          MVP em desenvolvimento
        </p>
      </div>
    </main>
  );
}
