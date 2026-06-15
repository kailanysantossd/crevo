"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { error?: string; success?: string };

export async function signup(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
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
    options: { data: { nome } },
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  if (!data.session) {
    return {
      success:
        "Cadastro feito. Verifique seu e-mail para confirmar a conta antes de entrar.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

function traduzirErro(msg: string): string {
  if (/already registered|user already/i.test(msg)) {
    return "Já existe uma conta com esse e-mail.";
  }
  if (/password should be at least/i.test(msg)) {
    return "A senha precisa de no mínimo 6 caracteres.";
  }
  return msg;
}
