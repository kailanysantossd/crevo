"use client";

import { useTransition } from "react";
import { toggleChecklistItem, deleteChecklistItem } from "../actions";

export function ChecklistItem({
  id,
  campanhaId,
  texto,
  concluido,
}: {
  id: string;
  campanhaId: string;
  texto: string;
  concluido: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-start gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <input
        type="checkbox"
        checked={concluido}
        disabled={pending}
        onChange={(e) => {
          startTransition(async () => {
            await toggleChecklistItem(id, campanhaId, e.target.checked);
          });
        }}
        className="mt-0.5 size-4 rounded border-zinc-300 cursor-pointer disabled:opacity-50"
      />
      <span
        className={`flex-1 text-sm ${
          concluido
            ? "line-through text-zinc-400 dark:text-zinc-500"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {texto}
      </span>
      <button
        type="button"
        onClick={() => {
          if (!confirm("Excluir esse item?")) return;
          startTransition(async () => {
            await deleteChecklistItem(id, campanhaId);
          });
        }}
        disabled={pending}
        className="text-xs text-zinc-400 hover:text-red-600 disabled:opacity-50"
      >
        Excluir
      </button>
    </li>
  );
}
