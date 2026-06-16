import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { logout } from "./actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clientes", label: "Clientes" },
  { href: "/projetos", label: "Projetos" },
  { href: "/campanhas", label: "Campanhas" },
  { href: "/tarefas", label: "Tarefas" },
  { href: "/cronograma", label: "Cronograma" },
  { href: "/usuarios", label: "Usuários" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, perfil")
    .eq("id", user.id)
    .maybeSingle();

  const nome = profile?.nome ?? user.email;
  const perfil = profile?.perfil ?? "colaborador";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <Logo size="sm" />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              MVP
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {nome}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                {perfil}
              </span>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>

        <nav className="md:hidden border-t border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <div className="flex items-center gap-1 px-4 py-2 min-w-max">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
