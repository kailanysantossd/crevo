"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteAnexo,
  getSignedUrl,
  uploadAnexo,
} from "../_anexo-actions";

export type Anexo = {
  id: string;
  nome_arquivo: string;
  url_storage: string;
  tipo_mime: string | null;
  tamanho_bytes: number | null;
};

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AnexosSection({
  campanhaId,
  vinculoId,
  anexos,
}: {
  campanhaId: string;
  vinculoId: string;
  anexos: Anexo[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          action={async (fd) => {
            setError(null);
            startTransition(async () => {
              const res = await uploadAnexo(
                campanhaId,
                "campanha",
                vinculoId,
                fd
              );
              if (res?.error) setError(res.error);
            });
          }}
          className="flex flex-col sm:flex-row gap-3 items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="anexo_file">Selecionar arquivos</Label>
            <input
              id="anexo_file"
              name="file"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              required
              className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:opacity-90"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Enviar"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {anexos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum arquivo enviado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {anexos.map((a) => (
              <li
                key={a.id}
                className="py-2 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {a.nome_arquivo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.tipo_mime ?? "arquivo"} · {formatSize(a.tamanho_bytes)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const url = await getSignedUrl(a.url_storage);
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    Abrir
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm("Excluir esse anexo?")) return;
                      startTransition(async () => {
                        await deleteAnexo(a.id, campanhaId, a.url_storage);
                      });
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
