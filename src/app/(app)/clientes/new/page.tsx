import { ClienteForm } from "../_form";
import { createCliente } from "../actions";

export default function NovoClientePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo cliente</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Cadastre uma empresa atendida pela agência
        </p>
      </div>
      <ClienteForm action={createCliente} submitLabel="Cadastrar" />
    </div>
  );
}
