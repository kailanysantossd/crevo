"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  enviarParaAprovacao,
  responderAprovacao,
} from "../_aprovacao-actions";

export type Aprovacao = {
  id: string;
  data_envio: string;
  status: "aguardando" | "aprovada" | "ajustes_solicitados";
  data_resposta: string | null;
  comentario_cliente: string | null;
  enviado_nome: string | null;
  respondido_nome: string | null;
};

function formatDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR");
}

export function AprovacaoSection({
  campanhaId,
  aprovacoes,
  podeEnviar,
  podeResponder,
}: {
  campanhaId: string;
  aprovacoes: Aprovacao[];
  podeEnviar: boolean;
  podeResponder: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [comentarios, setComentarios] = useState<Record<string, string>>({});

  const aguardando = aprovacoes.find((a) => a.status === "aguardando");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aprovação do cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {podeEnviar && !aguardando && (
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await enviarParaAprovacao(campanhaId);
              });
            }}
          >
            Enviar para aprovação do cliente
          </Button>
        )}

        {aguardando && podeResponder && (
          <div className="rounded-lg border border-[#22C7B8]/40 bg-accent/40 p-4 space-y-3">
            <p className="text-sm font-medium">
              Aprovação pendente da sua resposta
            </p>
            <Textarea
              rows={2}
              placeholder="Comentário (opcional para aprovação, recomendado para ajustes)"
              value={comentarios[aguardando.id] ?? ""}
              onChange={(e) =>
                setComentarios((c) => ({
                  ...c,
                  [aguardando.id]: e.target.value,
                }))
              }
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await responderAprovacao(
                      aguardando.id,
                      campanhaId,
                      "ajustar",
                      comentarios[aguardando.id] ?? null
                    );
                  });
                }}
              >
                Solicitar ajustes
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await responderAprovacao(
                      aguardando.id,
                      campanhaId,
                      "aprovar",
                      comentarios[aguardando.id] ?? null
                    );
                  });
                }}
              >
                Aprovar
              </Button>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">Histórico</p>
          {aprovacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum envio para aprovação ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {aprovacoes.map((a) => (
                <li key={a.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">
                      Enviado por{" "}
                      <span className="font-medium">
                        {a.enviado_nome ?? "—"}
                      </span>{" "}
                      em {formatDateTime(a.data_envio)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.status === "aprovada"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : a.status === "ajustes_solicitados"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {a.status === "aprovada"
                        ? "Aprovada"
                        : a.status === "ajustes_solicitados"
                          ? "Ajustes solicitados"
                          : "Aguardando"}
                    </span>
                  </div>
                  {a.data_resposta && (
                    <p className="text-xs text-muted-foreground">
                      Resposta de {a.respondido_nome ?? "—"} em{" "}
                      {formatDateTime(a.data_resposta)}
                    </p>
                  )}
                  {a.comentario_cliente && (
                    <p className="text-sm bg-muted rounded p-2 mt-1">
                      {a.comentario_cliente}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
