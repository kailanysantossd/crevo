import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConvidarForm } from "./_form";

export default async function ConvidarPage() {
  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("arquivado", false)
    .order("nome", { ascending: true });

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link
          href="/usuarios"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar para usuários
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">
          Convidar pessoa
        </h1>
        <p className="text-sm text-muted-foreground">
          Gere um link de convite para entrar na sua agência como colaborador ou cliente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do convite</CardTitle>
          <CardDescription>
            O link gerado vale por 7 dias. Você pode enviar por e-mail, whatsapp ou copiar e mandar como quiser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConvidarForm clientes={clientes ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
