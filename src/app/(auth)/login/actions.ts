"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

function traduzirErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) {
    return "E-mail ou senha incorretos.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "Confirme seu e-mail antes de entrar.";
  }
  return msg;
}
