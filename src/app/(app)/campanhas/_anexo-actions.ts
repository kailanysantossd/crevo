"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadAnexo(
  campanhaId: string,
  tipoVinculo: "briefing" | "campanha" | "tarefa",
  vinculoId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const files = formData.getAll("file") as File[];
  if (files.length === 0) return { error: "Nenhum arquivo selecionado." };

  for (const file of files) {
    if (file.size === 0) continue;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${campanhaId}/${tipoVinculo}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("anexos")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (uploadError) return { error: uploadError.message };

    const { error: insertError } = await supabase.from("anexos").insert({
      tipo_vinculo: tipoVinculo,
      vinculo_id: vinculoId,
      nome_arquivo: file.name,
      url_storage: path,
      tipo_mime: file.type || null,
      tamanho_bytes: file.size,
      enviado_por: user.id,
    });
    if (insertError) {
      await supabase.storage.from("anexos").remove([path]);
      return { error: insertError.message };
    }
  }

  revalidatePath(`/campanhas/${campanhaId}`);
  return { success: true };
}

export async function deleteAnexo(
  anexoId: string,
  campanhaId: string,
  pathStorage: string
) {
  const supabase = await createClient();
  await supabase.from("anexos").delete().eq("id", anexoId);
  await supabase.storage.from("anexos").remove([pathStorage]);
  revalidatePath(`/campanhas/${campanhaId}`);
}

export async function getSignedUrl(path: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("anexos")
    .createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
}
