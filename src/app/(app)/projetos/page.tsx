import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getClienteNome(
  cliente: unknown
): string | null {
  if (!cliente) return null;
  if (Array.isArray(cliente)) {
    const first = cliente[0] as { nome?: string } | undefined;
    return first?.nome ?? null;
  }
  return (cliente as { nome?: string }).nome ?? null;
}

export default async function ProjetosPage() {
  const supabase = await createClient();
  const { data: projetos } = await supabase
    .from("projetos")
    .select("id, nome, descricao, created_at, cliente:clientes(nome)")
    .order("created_at", { ascending: false });

  const count = projetos?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {count} projeto{count === 1 ? "" : "s"} cadastrado
            {count === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/projetos/new" className={buttonVariants()}>
          + Novo projeto
        </Link>
      </div>

      {projetos && projetos.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projetos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/projetos/${p.id}`}
                        className="hover:underline"
                      >
                        {p.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {getClienteNome(p.cliente) ?? "—"}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400 max-w-md truncate">
                      {p.descricao ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nenhum projeto ainda</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500 dark:text-zinc-400">
            Cadastre o primeiro projeto vinculando-o a um cliente.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
