import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "../_form";
import { deleteCliente, updateCliente, type ClienteFormState } from "../actions";
import { Button } from "@/components/ui/button";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("nome, empresa, email_contato, telefone, observacoes")
    .eq("id", id)
    .maybeSingle();

  if (!cliente) notFound();

  const update = updateCliente.bind(null, id) as (
    prev: ClienteFormState,
    fd: FormData
  ) => Promise<ClienteFormState>;

  const handleDelete = async () => {
    "use server";
    await deleteCliente(id);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar cliente
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Atualize os dados ou exclua o cliente
          </p>
        </div>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            Excluir
          </Button>
        </form>
      </div>
      <ClienteForm
        action={update}
        defaults={cliente}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
