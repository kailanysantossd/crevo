"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function enviarParaAprovacao(campanhaId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("aprovacoes").insert({
    campanha_id: campanhaId,
    enviado_por: user.id,
    status: "aguardando",
  });
  await supabase
    .from("campanhas")
    .update({ status: "aguardando_aprovacao" })
    .eq("id", campanhaId);
  revalidatePath(`/campanhas/${campanhaId}`);
}

export async function responderAprovacao(
  aprovacaoId: string,
  campanhaId: string,
  acao: "aprovar" | "ajustar",
  comentario: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const novoStatusAprovacao =
    acao === "aprovar" ? "aprovada" : "ajustes_solicitados";
  const novoStatusCampanha =
    acao === "aprovar" ? "aprovada" : "em_producao";

  await supabase
    .from("aprovacoes")
    .update({
      status: novoStatusAprovacao,
      respondido_por: user.id,
      data_resposta: new Date().toISOString(),
      comentario_cliente: comentario,
    })
    .eq("id", aprovacaoId);
  await supabase
    .from("campanhas")
    .update({ status: novoStatusCampanha })
    .eq("id", campanhaId);
  revalidatePath(`/campanhas/${campanhaId}`);
}
