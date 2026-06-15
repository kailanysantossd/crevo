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
import type { ClienteFormState } from "./actions";

export type ClienteDefaults = {
  nome?: string | null;
  empresa?: string | null;
  email_contato?: string | null;
  telefone?: string | null;
  observacoes?: string | null;
};

const initialState: ClienteFormState = {};

export function ClienteForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prev: ClienteFormState, fd: FormData) => Promise<ClienteFormState>;
  defaults?: ClienteDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              name="nome"
              required
              defaultValue={defaults?.nome ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                name="empresa"
                defaultValue={defaults?.empresa ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_contato">E-mail de contato</Label>
              <Input
                id="email_contato"
                name="email_contato"
                type="email"
                defaultValue={defaults?.email_contato ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              name="telefone"
              defaultValue={defaults?.telefone ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              rows={4}
              defaultValue={defaults?.observacoes ?? ""}
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
        <Link href="/clientes" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
