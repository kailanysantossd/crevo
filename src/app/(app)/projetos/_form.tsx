"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjetoFormState } from "./actions";

export type ProjetoDefaults = {
  cliente_id?: string | null;
  nome?: string | null;
  descricao?: string | null;
};

export type ClienteOption = { id: string; nome: string };

const initialState: ProjetoFormState = {};

export function ProjetoForm({
  action,
  defaults,
  clientes,
  submitLabel,
}: {
  action: (prev: ProjetoFormState, fd: FormData) => Promise<ProjetoFormState>;
  defaults?: ProjetoDefaults;
  clientes: ClienteOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Dados do projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente_id">Cliente *</Label>
            <select
              id="cliente_id"
              name="cliente_id"
              required
              defaultValue={defaults?.cliente_id ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Selecione um cliente
              </option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              name="nome"
              required
              defaultValue={defaults?.nome ?? ""}
              placeholder="Ex: Lançamento Linha Verão 2027"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={4}
              defaultValue={defaults?.descricao ?? ""}
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
        </CardContent>
      </Card>
      <div className="flex items-center justify-end gap-2 mt-4">
        <Link
          href="/projetos"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
