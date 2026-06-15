"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StatusCampanha } from "@/lib/labels";

export type CampanhaFormState = { error?: string };

function parseForm(formData: FormData) {
  const trim = (v: FormDataEntryValue | null) =>
    String(v ?? "").trim() || null;
  return {
    projeto_id: trim(formData.get("projeto_id")) ?? "",
    nome: trim(formData.get("nome")) ?? "",
    status: (trim(formData.get("status")) ??
      "rascunho") as StatusCampanha,
    canal: trim(formData.get("canal")),
    responsavel_id: trim(formData.get("responsavel_id")),
    data_inicio: trim(formData.get("data_inicio")),
    data_entrega: trim(formData.get("data_entrega")),
  };
}

export async function createCampanha(
  _prev: CampanhaFormState,
  formData: FormData
): Promise<CampanhaFormState> {
  const payload = parseForm(formData);
  if (!payload.projeto_id) return { error: "Selecione um projeto." };
  if (!payload.nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campanhas")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/campanhas");
  redirect(`/campanhas/${data.id}`);
}

export async function updateCampanha(
  id: string,
  _prev: CampanhaFormState,
  formData: FormData
): Promise<CampanhaFormState> {
  const payload = parseForm(formData);
  if (!payload.projeto_id) return { error: "Selecione um projeto." };
  if (!payload.nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("campanhas")
    .update(payload)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/campanhas");
  revalidatePath(`/campanhas/${id}`);
  return {};
}

export async function deleteCampanha(id: string) {
  const supabase = await createClient();
  await supabase.from("campanhas").delete().eq("id", id);
  revalidatePath("/campanhas");
  redirect("/campanhas");
}

// ----- TAREFAS -----

export async function createTarefa(campanhaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const etapa = String(formData.get("etapa") ?? "briefing");
  const prazo = String(formData.get("prazo") ?? "").trim() || null;
  const responsavel_id =
    String(formData.get("responsavel_id") ?? "").trim() || null;

  if (!titulo) return;

  const supabase = await createClient();
  await supabase.from("tarefas").insert({
    campanha_id: campanhaId,
    titulo,
    etapa,
    prazo,
    responsavel_id,
  });
  revalidatePath(`/campanhas/${campanhaId}`);
}

export async function updateStatusTarefa(
  tarefaId: string,
  campanhaId: string,
  status: "pendente" | "em_andamento" | "concluida"
) {
  const supabase = await createClient();
  await supabase.from("tarefas").update({ status }).eq("id", tarefaId);
  revalidatePath(`/campanhas/${campanhaId}`);
  revalidatePath("/tarefas");
}

export async function deleteTarefa(tarefaId: string, campanhaId: string) {
  const supabase = await createClient();
  await supabase.from("tarefas").delete().eq("id", tarefaId);
  revalidatePath(`/campanhas/${campanhaId}`);
  revalidatePath("/tarefas");
}

// ----- CHECKLIST -----

export async function createChecklistItem(
  campanhaId: string,
  formData: FormData
) {
  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) return;

  const supabase = await createClient();
  const { data: max } = await supabase
    .from("checklist_itens")
    .select("ordem")
    .eq("campanha_id", campanhaId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("checklist_itens").insert({
    campanha_id: campanhaId,
    texto,
    ordem: (max?.ordem ?? 0) + 1,
  });
  revalidatePath(`/campanhas/${campanhaId}`);
}

export async function toggleChecklistItem(
  itemId: string,
  campanhaId: string,
  concluido: boolean
) {
  const supabase = await createClient();
  await supabase
    .from("checklist_itens")
    .update({ concluido })
    .eq("id", itemId);
  revalidatePath(`/campanhas/${campanhaId}`);
}

export async function deleteChecklistItem(itemId: string, campanhaId: string) {
  const supabase = await createClient();
  await supabase.from("checklist_itens").delete().eq("id", itemId);
  revalidatePath(`/campanhas/${campanhaId}`);
}
