import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProjetoForm } from "../_form";
import {
  deleteProjeto,
  updateProjeto,
  type ProjetoFormState,
} from "../actions";

export default async function EditarProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: projeto }, { data: clientes }] = await Promise.all([
    supabase
      .from("projetos")
      .select("cliente_id, nome, descricao")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clientes").select("id, nome").order("nome"),
  ]);

  if (!projeto) notFound();

  const update = updateProjeto.bind(null, id) as (
    prev: ProjetoFormState,
    fd: FormData
  ) => Promise<ProjetoFormState>;

  const handleDelete = async () => {
    "use server";
    await deleteProjeto(id);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar projeto
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Atualize os dados ou exclua o projeto
          </p>
        </div>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            Excluir
          </Button>
        </form>
      </div>
      <ProjetoForm
        action={update}
        defaults={projeto}
        clientes={clientes ?? []}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
