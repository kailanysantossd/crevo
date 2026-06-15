import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-md text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            crevo
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
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

        <p className="text-xs text-zinc-400 dark:text-zinc-600 pt-8">
          MVP em desenvolvimento
        </p>
      </div>
    </main>
  );
}
