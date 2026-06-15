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

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, empresa, email_contato, telefone, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {clientes?.length ?? 0} cliente
            {(clientes?.length ?? 0) === 1 ? "" : "s"} cadastrado
            {(clientes?.length ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/clientes/new" className={buttonVariants()}>
          + Novo cliente
        </Link>
      </div>

      {clientes && clientes.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="hover:underline"
                      >
                        {c.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {c.empresa ?? "—"}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {c.email_contato ?? "—"}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {c.telefone ?? "—"}
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
            <CardTitle className="text-base">Nenhum cliente ainda</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500 dark:text-zinc-400">
            Cadastre o primeiro cliente para começar a organizar projetos e
            campanhas.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
