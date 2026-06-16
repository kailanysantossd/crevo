"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gerarConvite, type GerarConviteState } from "../actions";

const initialState: GerarConviteState = {};

type Cliente = { id: string; nome: string };

export function ConvidarForm({ clientes }: { clientes: Cliente[] }) {
  const [state, formAction, pending] = useActionState(gerarConvite, initialState);
  const [perfil, setPerfil] = useState<"colaborador" | "cliente">("colaborador");
  const [copiado, setCopiado] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = state.token ? `${origin}/convite/${state.token}` : null;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail da pessoa</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="pessoa@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="perfil">Perfil</Label>
        <select
          id="perfil"
          name="perfil"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as "colaborador" | "cliente")}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="colaborador">Colaborador (parte do time)</option>
          <option value="cliente">Cliente (vê só os projetos da empresa dele)</option>
        </select>
      </div>

      {perfil === "cliente" && (
        <div className="space-y-2">
          <Label htmlFor="cliente_id">Cliente que essa pessoa representa</Label>
          {clientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Você ainda não tem nenhum cliente cadastrado. Cadastre um cliente antes de convidá-lo.
            </p>
          ) : (
            <select
              id="cliente_id"
              name="cliente_id"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      {!link && (
        <Button
          type="submit"
          disabled={pending || (perfil === "cliente" && clientes.length === 0)}
        >
          {pending ? "Gerando..." : "Gerar link de convite"}
        </Button>
      )}

      {link && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 p-4 space-y-3">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
            Convite gerado! Envie este link pra pessoa:
          </p>
          <div className="flex gap-2">
            <Input value={link} readOnly className="font-mono text-xs" />
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              }}
            >
              {copiado ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            O link expira em 7 dias. Quando a pessoa entrar, ela cria a própria senha.
          </p>
        </div>
      )}
    </form>
  );
}
