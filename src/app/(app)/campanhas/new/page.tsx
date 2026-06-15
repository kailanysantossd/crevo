import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CampanhaForm, type ProjetoOption } from "../_form";
import { createCampanha } from "../actions";

type ProjetoRow = {
  id: string;
  nome: string;
  cliente: { nome: string } | { nome: string }[] | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function NovaCampanhaPage() {
  const supabase = await createClient();
  const [{ data: projetosRaw }, { data: responsaveis }] = await Promise.all([
    supabase
      .from("projetos")
      .select("id, nome, cliente:clientes(nome)")
      .order("nome"),
    supabase
      .from("profiles")
      .select("id, nome")
      .in("perfil", ["administrador", "colaborador"])
      .order("nome"),
  ]);

  const projetos: ProjetoOption[] = ((projetosRaw ?? []) as ProjetoRow[]).map(
    (p) => ({
      id: p.id,
      nome: p.nome,
      cliente_nome: pickOne(p.cliente)?.nome ?? "—",
    })
  );

  if (projetos.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Nova campanha</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Cadastre um projeto primeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500 dark:text-zinc-400 space-y-4">
            <p>
              Campanhas precisam estar vinculadas a um projeto. Cadastre pelo
              menos um projeto antes.
            </p>
            <Link href="/projetos/new" className={buttonVariants()}>
              Cadastrar projeto
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova campanha</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Cadastre uma campanha dentro de um projeto
        </p>
      </div>
      <CampanhaForm
        action={createCampanha}
        projetos={projetos}
        responsaveis={responsaveis ?? []}
        submitLabel="Cadastrar"
      />
    </div>
  );
}
