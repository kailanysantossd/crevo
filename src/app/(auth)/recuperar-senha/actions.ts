"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type RecuperarSenhaState = { error?: string; ok?: boolean };

export async function recuperarSenha(
  _prev: RecuperarSenhaState,
  formData: FormData
): Promise<RecuperarSenhaState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe o e-mail." };

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });
  if (error) return { error: error.message };

  return { ok: true };
}
