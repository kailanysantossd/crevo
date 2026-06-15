import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, perfil")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {profile?.nome ?? "boas-vindas"} 👋
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Você está autenticada como{" "}
          <span className="font-medium capitalize">
            {profile?.perfil ?? "colaborador"}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlaceholderCard label="Campanhas ativas" />
        <PlaceholderCard label="Aprovações pendentes" />
        <PlaceholderCard label="Tarefas pendentes" />
        <PlaceholderCard label="Prazos próximos" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
          O dashboard real será preenchido nas próximas fases — quando começarmos
          a cadastrar clientes, projetos, campanhas e tarefas. Por enquanto,
          login e perfis estão funcionando.
        </CardContent>
      </Card>
    </div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-zinc-300 dark:text-zinc-700">
          —
        </p>
      </CardContent>
    </Card>
  );
}
