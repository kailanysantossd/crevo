"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PerfilUsuario = "administrador" | "colaborador" | "cliente";

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
