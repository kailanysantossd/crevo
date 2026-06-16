"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveBriefing(campanhaId: string, formData: FormData) {
  const trim = (v: FormDataEntryValue | null) =>
    String(v ?? "").trim() || null;
  const num = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number(s.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const payload = {
    campanha_id: campanhaId,
    objetivo: trim(formData.get("objetivo")),
    publico_alvo: trim(formData.get("publico_alvo")),
    canais_divulgacao: trim(formData.get("canais_divulgacao")),
    mensagem_principal: trim(formData.get("mensagem_principal")),
    orcamento_estimado: num(formData.get("orcamento_estimado")),
    data_inicio: trim(formData.get("data_inicio")),
    data_entrega: trim(formData.get("data_entrega")),
    referencias: trim(formData.get("referencias")),
    observacoes: trim(formData.get("observacoes")),
  };

  const supabase = await createClient();
  await supabase
    .from("briefings")
    .upsert(payload, { onConflict: "campanha_id" });
  revalidatePath(`/campanhas/${campanhaId}`);
}
