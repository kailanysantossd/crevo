"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ClienteFormState = { error?: string };

function parseForm(formData: FormData) {
  const trim = (v: FormDataEntryValue | null) =>
    String(v ?? "").trim() || null;
  return {
    nome: trim(formData.get("nome")) ?? "",
    empresa: trim(formData.get("empresa")),
    email_contato: trim(formData.get("email_contato")),
    telefone: trim(formData.get("telefone")),
    observacoes: trim(formData.get("observacoes")),
  };
}

export async function createCliente(
  _prev: ClienteFormState,
  formData: FormData
): Promise<ClienteFormState> {
  const payload = parseForm(formData);
  if (!payload.nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(
  id: string,
  _prev: ClienteFormState,
  formData: FormData
): Promise<ClienteFormState> {
  const payload = parseForm(formData);
  if (!payload.nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update(payload)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect("/clientes");
}

export async function deleteCliente(id: string) {
  const supabase = await createClient();
  await supabase.from("clientes").delete().eq("id", id);
  revalidatePath("/clientes");
  redirect("/clientes");
}
