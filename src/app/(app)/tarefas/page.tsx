import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
  ETAPA_TAREFA_LABELS,
  STATUS_TAREFA_LABELS,
  statusTarefaBadge,
  type EtapaTarefa,
  type StatusTarefa,
} from "@/lib/labels";

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("tarefas")
    .select(
      "id, titulo, etapa, status, prazo, responsavel_id, responsavel:profiles(nome), campanha:campanhas(id, nome)"
    )
    .order("prazo", { ascending: true, nullsFirst: false });

  if (filtro === "minhas" && user) {
    query = query.eq("responsavel_id", user.id);
  } else if (filtro === "pendentes") {
    query = query.in("status", ["pendente", "em_andamento"]);
  }

  const { data: tarefas } = await query;
  const rows = tarefas ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {rows.length} tarefa{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/tarefas"
            className={`px-3 py-1.5 text-xs rounded-md ${
              !filtro
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Todas
          </Link>
          <Link
            href="/tarefas?filtro=minhas"
            className={`px-3 py-1.5 text-xs rounded-md ${
              filtro === "minhas"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Minhas
          </Link>
          <Link
            href="/tarefas?filtro=pendentes"
            className={`px-3 py-1.5 text-xs rounded-md ${
              filtro === "pendentes"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Pendentes
          </Link>
        </div>
      </div>

      {rows.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => {
                  const resp = pickOne(
                    t.responsavel as
                      | { nome: string }
                      | { nome: string }[]
                      | null
                  );
                  const camp = pickOne(
                    t.campanha as
                      | { id: string; nome: string }
                      | { id: string; nome: string }[]
                      | null
                  );
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.titulo}</TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {camp ? (
                          <Link
                            href={`/campanhas/${camp.id}`}
                            className="hover:underline"
                          >
                            {camp.nome}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {ETAPA_TAREFA_LABELS[t.etapa as EtapaTarefa]}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {resp?.nome ?? "—"}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {formatDate(t.prazo)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusTarefaBadge(
                            t.status as StatusTarefa
                          )}`}
                        >
                          {STATUS_TAREFA_LABELS[t.status as StatusTarefa]}
                        </span>
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
            <CardTitle className="text-base">Nenhuma tarefa</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500 dark:text-zinc-400">
            Crie tarefas dentro de campanhas para vê-las aqui.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
