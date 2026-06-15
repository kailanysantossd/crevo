"use client";

import { useTransition } from "react";
import { updatePerfil, type PerfilUsuario } from "./actions";

const OPTIONS: { value: PerfilUsuario; label: string }[] = [
  { value: "administrador", label: "Administrador" },
  { value: "colaborador", label: "Colaborador" },
  { value: "cliente", label: "Cliente" },
];

export function PerfilSelect({
  usuarioId,
  perfil,
  disabled,
}: {
  usuarioId: string;
  perfil: PerfilUsuario;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={perfil}
      disabled={disabled || pending}
      onChange={(e) => {
        const value = e.target.value as PerfilUsuario;
        startTransition(async () => {
          await updatePerfil(usuarioId, value);
        });
      }}
      className="h-8 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
