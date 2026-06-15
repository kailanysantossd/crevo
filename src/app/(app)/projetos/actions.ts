"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProjetoFormState = { error?: string };

function parseForm(formData: FormData) {
  const trim = (v: FormDataEntryValue | null) =>
    String(v ?? "").trim() || null;
  return {
    cliente_id: trim(formData.get("cliente_id")) ?? "",
    nome: trim(formData.get("nome")) ?? "",
    descricao: trim(formData.get("descricao")),
  };
}

export async function createProjeto(
  _prev: ProjetoFormState,
  formData: FormData
): Promise<ProjetoFormState> {
  const payload = parseForm(formData);
  if (!payload.cliente_id) return { error: "Selecione um cliente." };
  if (!payload.nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("projetos").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/projetos");
  redirect("/projetos");
}

export async function updateProjeto(
  id: string,
  _prev: ProjetoFormState,
  formData: FormData
): Promise<ProjetoFormState> {
  const payload = parseForm(formData);
  if (!payload.cliente_id) return { error: "Selecione um cliente." };
  if (!payload.nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projetos")
    .update(payload)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${id}`);
  redirect("/projetos");
}

export async function deleteProjeto(id: string) {
  const supabase = await createClient();
  await supabase.from("projetos").delete().eq("id", id);
  revalidatePath("/projetos");
  redirect("/projetos");
}
