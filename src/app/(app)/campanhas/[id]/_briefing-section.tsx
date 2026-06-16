"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type BriefingDefaults = {
  objetivo?: string | null;
  publico_alvo?: string | null;
  canais_divulgacao?: string | null;
  mensagem_principal?: string | null;
  orcamento_estimado?: number | null;
  data_inicio?: string | null;
  data_entrega?: string | null;
  referencias?: string | null;
  observacoes?: string | null;
};

export function BriefingSection({
  campanhaId,
  defaults,
  saveAction,
}: {
  campanhaId: string;
  defaults: BriefingDefaults | null;
  saveAction: (fd: FormData) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Briefing</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (fd) => {
            setPending(true);
            try {
              await saveAction(fd);
            } finally {
              setPending(false);
            }
          }}
          className="space-y-4"
        >
          <input type="hidden" name="campanha_id" value={campanhaId} />
          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo da campanha</Label>
            <Textarea
              id="objetivo"
              name="objetivo"
              rows={2}
              defaultValue={defaults?.objetivo ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publico_alvo">Público-alvo</Label>
            <Textarea
              id="publico_alvo"
              name="publico_alvo"
              rows={2}
              defaultValue={defaults?.publico_alvo ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="canais_divulgacao">Canais de divulgação</Label>
            <Input
              id="canais_divulgacao"
              name="canais_divulgacao"
              defaultValue={defaults?.canais_divulgacao ?? ""}
              placeholder="Ex: Instagram, TikTok, Outdoor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mensagem_principal">Mensagem principal</Label>
            <Textarea
              id="mensagem_principal"
              name="mensagem_principal"
              rows={2}
              defaultValue={defaults?.mensagem_principal ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="orcamento_estimado">Orçamento (R$)</Label>
              <Input
                id="orcamento_estimado"
                name="orcamento_estimado"
                type="number"
                step="0.01"
                defaultValue={defaults?.orcamento_estimado ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b_data_inicio">Data de início</Label>
              <Input
                id="b_data_inicio"
                name="data_inicio"
                type="date"
                defaultValue={defaults?.data_inicio ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b_data_entrega">Data de entrega</Label>
              <Input
                id="b_data_entrega"
                name="data_entrega"
                type="date"
                defaultValue={defaults?.data_entrega ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referencias">Referências</Label>
            <Textarea
              id="referencias"
              name="referencias"
              rows={2}
              defaultValue={defaults?.referencias ?? ""}
              placeholder="Links, peças anteriores, mood, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              rows={2}
              defaultValue={defaults?.observacoes ?? ""}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar briefing"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
