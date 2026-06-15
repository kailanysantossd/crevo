"use client";

import { useTransition } from "react";
import { updateStatusTarefa, deleteTarefa } from "../actions";
import { STATUS_TAREFA_LABELS, type StatusTarefa } from "@/lib/labels";

const OPTIONS: StatusTarefa[] = ["pendente", "em_andamento", "concluida"];

export function TarefaActions({
  tarefaId,
  campanhaId,
  status,
}: {
  tarefaId: string;
  campanhaId: string;
  status: StatusTarefa;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value as StatusTarefa;
          startTransition(async () => {
            await updateStatusTarefa(tarefaId, campanhaId, v);
          });
        }}
        className="h-7 rounded-md border border-input bg-transparent px-2 text-xs disabled:opacity-50"
      >
        {OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_TAREFA_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => {
          if (!confirm("Excluir essa tarefa?")) return;
          startTransition(async () => {
            await deleteTarefa(tarefaId, campanhaId);
          });
        }}
        disabled={pending}
        className="text-xs text-zinc-400 hover:text-red-600 disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
