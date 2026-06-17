"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RedefinirSenhaState = { error?: string };

export async function redefinirSenha(
  _prev: RedefinirSenhaState,
  formData: FormData
): Promise<RedefinirSenhaState> {
  const senha = String(formData.get("senha") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (senha.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmar) {
    return { error: "As senhas não conferem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Link expirado. Solicite um novo e-mail de recuperação." };
  }

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { error: error.message };

  redirect("/dashboard");
}
