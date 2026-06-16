"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { revogarConvite } from "./actions";

type Convite = {
  id: string;
  token: string;
  email: string;
  perfil: string;
  created_at: string;
  expira_em: string;
  cliente: { nome: string } | { nome: string }[] | null;
};

const PERFIL_LABEL: Record<string, string> = {
  colaborador: "Colaborador",
  cliente: "Cliente",
};

export function ConvitesPendentes({ convites }: { convites: Convite[] }) {
  const [origin, setOrigin] = useState("");
  const [pending, startTransition] = useTransition();
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  if (typeof window !== "undefined" && !origin) {
    setOrigin(window.location.origin);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convites pendentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {convites.map((c) => {
              const cliente = Array.isArray(c.cliente) ? c.cliente[0] : c.cliente;
              const expira = new Date(c.expira_em);
              const diasRestantes = Math.max(
                0,
                Math.ceil((expira.getTime() - Date.now()) / 86400000)
              );
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.email}</TableCell>
                  <TableCell>{PERFIL_LABEL[c.perfil] ?? c.perfil}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cliente?.nome ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {diasRestantes}d
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `${origin}/convite/${c.token}`
                          );
                          setCopiadoId(c.id);
                          setTimeout(() => setCopiadoId(null), 2000);
                        }}
                      >
                        {copiadoId === c.id ? "Copiado" : "Copiar link"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await revogarConvite(c.id);
                          })
                        }
                      >
                        Revogar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
