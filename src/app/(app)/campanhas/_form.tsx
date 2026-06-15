"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CampanhaFormState } from "./actions";
import {
  STATUS_CAMPANHA_LABELS,
  STATUS_CAMPANHA_ORDER,
  type StatusCampanha,
} from "@/lib/labels";

export type CampanhaDefaults = {
  projeto_id?: string | null;
  nome?: string | null;
  status?: StatusCampanha | null;
  canal?: string | null;
  responsavel_id?: string | null;
  data_inicio?: string | null;
  data_entrega?: string | null;
};

export type ProjetoOption = {
  id: string;
  nome: string;
  cliente_nome: string;
};

export type ResponsavelOption = {
  id: string;
  nome: string;
};

const initialState: CampanhaFormState = {};

export function CampanhaForm({
  action,
  defaults,
  projetos,
  responsaveis,
  submitLabel,
}: {
  action: (
    prev: CampanhaFormState,
    fd: FormData
  ) => Promise<CampanhaFormState>;
  defaults?: CampanhaDefaults;
  projetos: ProjetoOption[];
  responsaveis: ResponsavelOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Dados da campanha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projeto_id">Projeto *</Label>
            <select
              id="projeto_id"
              name="projeto_id"
              required
              defaultValue={defaults?.projeto_id ?? ""}
              className={selectClass}
            >
              <option value="" disabled>
                Selecione um projeto
              </option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.cliente_nome} — {p.nome}
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
              placeholder="Ex: Instagram"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={defaults?.status ?? "rascunho"}
                className={selectClass}
              >
                {STATUS_CAMPANHA_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CAMPANHA_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="canal">Canal</Label>
              <Input
                id="canal"
                name="canal"
                defaultValue={defaults?.canal ?? ""}
                placeholder="Ex: Instagram, Outdoor, TV"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavel_id">Responsável</Label>
            <select
              id="responsavel_id"
              name="responsavel_id"
              defaultValue={defaults?.responsavel_id ?? ""}
              className={selectClass}
            >
              <option value="">Ninguém</option>
              {responsaveis.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de início</Label>
              <Input
                id="data_inicio"
                name="data_inicio"
                type="date"
                defaultValue={defaults?.data_inicio ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_entrega">Data de entrega</Label>
              <Input
                id="data_entrega"
                name="data_entrega"
                type="date"
                defaultValue={defaults?.data_entrega ?? ""}
              />
            </div>
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
          href="/campanhas"
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
