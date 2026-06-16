"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PerfilUsuario = "administrador" | "colaborador" | "cliente";
export type PerfilConvite = "colaborador" | "cliente";

export async function updatePerfil(
  usuarioId: string,
  novoPerfil: PerfilUsuario
) {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ perfil: novoPerfil })
    .eq("id", usuarioId);
  revalidatePath("/usuarios");
}

export type GerarConviteState = {
  error?: string;
  token?: string;
};

export async function gerarConvite(
  _prev: GerarConviteState,
  formData: FormData
): Promise<GerarConviteState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const perfil = String(formData.get("perfil") ?? "") as PerfilConvite;
  const clienteIdRaw = String(formData.get("cliente_id") ?? "").trim();
  const clienteId = clienteIdRaw || null;

  if (!email) return { error: "Informe o e-mail da pessoa convidada." };
  if (perfil !== "colaborador" && perfil !== "cliente") {
    return { error: "Escolha um perfil válido." };
  }
  if (perfil === "cliente" && !clienteId) {
    return { error: "Selecione qual cliente essa pessoa representa." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("agencia_id, perfil")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.agencia_id) return { error: "Perfil sem agência vinculada." };
  if (profile.perfil !== "administrador") {
    return { error: "Apenas administradores podem gerar convites." };
  }

  const token = randomBytes(24).toString("base64url");

  const { error } = await supabase.from("convites").insert({
    token,
    email,
    perfil,
    agencia_id: profile.agencia_id,
    cliente_id: perfil === "cliente" ? clienteId : null,
    criado_por: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { token };
}

export async function revogarConvite(conviteId: string) {
  const supabase = await createClient();
  await supabase.from("convites").delete().eq("id", conviteId);
  revalidatePath("/usuarios");
}
