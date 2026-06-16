"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AceitarConviteState = { error?: string; success?: string };

export async function aceitarConvite(
  token: string,
  _prev: AceitarConviteState,
  formData: FormData
): Promise<AceitarConviteState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nome || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa de no mínimo 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome, conviteToken: token } },
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  if (!data.session) {
    return {
      success:
        "Conta criada. Confirme seu e-mail para entrar e acessar o espaço da agência.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

function traduzirErro(msg: string): string {
  if (/already registered|user already/i.test(msg)) {
    return "Já existe uma conta com esse e-mail. Faça login normalmente.";
  }
  if (/convite inv/i.test(msg)) {
    return "Este convite é inválido ou já expirou.";
  }
  if (/password should be at least/i.test(msg)) {
    return "A senha precisa de no mínimo 6 caracteres.";
  }
  return msg;
}
