import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background p-8 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.7 0.2 290 / 0.25), transparent 50%), radial-gradient(ellipse at bottom right, oklch(0.7 0.18 320 / 0.2), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="max-w-md text-center space-y-8 relative">
        <div className="space-y-3">
          <h1 className="text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              crevo
            </span>
          </h1>
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
