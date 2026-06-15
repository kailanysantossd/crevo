export default function Home() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-8 font-sans">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            crevo
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gestão de campanhas publicitárias
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300">
          <span
            className={`size-2 rounded-full ${
              supabaseConfigured ? "bg-green-500" : "bg-amber-500"
            }`}
            aria-hidden
          />
          <span>
            {supabaseConfigured
              ? "Banco de dados conectado"
              : "Configurar variáveis de ambiente"}
          </span>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-600 pt-12">
          MVP em desenvolvimento · Fase 1
        </p>
      </div>
    </main>
  );
}
