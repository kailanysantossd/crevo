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
import {
  STATUS_CAMPANHA_LABELS,
  statusCampanhaBadge,
  type StatusCampanha,
} from "@/lib/labels";

type CampanhaRow = {
  id: string;
  nome: string;
  status: StatusCampanha;
  canal: string | null;
  data_entrega: string | null;
  projeto:
    | { nome: string; cliente: { nome: string } | { nome: string }[] | null }
    | { nome: string; cliente: { nome: string } | { nome: string }[] | null }[]
    | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function CampanhasPage() {
  const supabase = await createClient();
  const { data: campanhas } = await supabase
    .from("campanhas")
    .select(
      "id, nome, status, canal, data_entrega, projeto:projetos(nome, cliente:clientes(nome))"
    )
    .order("created_at", { ascending: false });

  const rows = (campanhas ?? []) as CampanhaRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campanhas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {rows.length} campanha{rows.length === 1 ? "" : "s"} cadastrada
            {rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/campanhas/new" className={buttonVariants()}>
          + Nova campanha
        </Link>
      </div>

      {rows.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cliente / Projeto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => {
                  const projeto = pickOne(c.projeto);
                  const cliente = pickOne(projeto?.cliente);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/campanhas/${c.id}`}
                          className="hover:underline"
                        >
                          {c.nome}
                        </Link>
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {cliente?.nome ?? "—"}{" "}
                        {projeto?.nome ? `· ${projeto.nome}` : ""}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCampanhaBadge(c.status)}`}
                        >
                          {STATUS_CAMPANHA_LABELS[c.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {c.canal ?? "—"}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {formatDate(c.data_entrega)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nenhuma campanha ainda</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500 dark:text-zinc-400">
            Cadastre a primeira campanha dentro de um projeto.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
