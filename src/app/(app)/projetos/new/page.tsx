import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProjetoForm } from "../_form";
import { createProjeto } from "../actions";

export default async function NovoProjetoPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome")
    .order("nome");

  if (!clientes || clientes.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Novo projeto</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Cadastre um cliente primeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500 dark:text-zinc-400 space-y-4">
            <p>
              Projetos precisam estar vinculados a um cliente. Cadastre pelo
              menos um cliente antes de criar projetos.
            </p>
            <Link href="/clientes/new" className={buttonVariants()}>
              Cadastrar cliente
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo projeto</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Cadastre uma iniciativa dentro de um cliente
        </p>
      </div>
      <ProjetoForm
        action={createProjeto}
        clientes={clientes}
        submitLabel="Cadastrar"
      />
    </div>
  );
}
