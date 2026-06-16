import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AceiteForm } from "./_form";

type Props = { params: Promise<{ token: string }> };

const PERFIL_LABEL: Record<string, string> = {
  colaborador: "colaborador",
  cliente: "cliente",
};

export default async function ConvitePage({ params }: Props) {
  const { token } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("convite_publico", { p_token: token });

  const convite = Array.isArray(data) ? data[0] : data;

  if (error || !convite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Convite não encontrado</CardTitle>
          <CardDescription>
            Esse link de convite não existe ou já foi removido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Ir para o login
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (convite.aceito) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Convite já aceito</CardTitle>
          <CardDescription>
            Este convite já foi usado. Faça login com seu e-mail e senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Ir para o login
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (convite.expirado) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Convite expirado</CardTitle>
          <CardDescription>
            Esse link expirou. Peça pra agência <strong>{convite.agencia_nome}</strong> gerar um novo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aceitar convite</CardTitle>
        <CardDescription>
          Você foi convidado(a) como{" "}
          <strong>{PERFIL_LABEL[convite.perfil] ?? convite.perfil}</strong> da agência{" "}
          <strong>{convite.agencia_nome}</strong>.
        </CardDescription>
      </CardHeader>
      <AceiteForm token={token} email={convite.email} />
    </Card>
  );
}
