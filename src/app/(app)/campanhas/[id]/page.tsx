import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CampanhaForm,
  type ProjetoOption,
} from "../_form";
import {
  createChecklistItem,
  createTarefa,
  deleteCampanha,
  updateCampanha,
  type CampanhaFormState,
} from "../actions";
import {
  ETAPA_TAREFA_LABELS,
  ETAPA_TAREFA_ORDER,
  type EtapaTarefa,
  type StatusTarefa,
} from "@/lib/labels";
import { ChecklistItem } from "./_checklist-item";
import { TarefaActions } from "./_tarefa-status";

type ProjetoRow = {
  id: string;
  nome: string;
  cliente: { nome: string } | { nome: string }[] | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default async function EditarCampanhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: campanha },
    { data: projetosRaw },
    { data: responsaveis },
    { data: tarefas },
    { data: checklist },
  ] = await Promise.all([
    supabase
      .from("campanhas")
      .select(
        "projeto_id, nome, status, canal, responsavel_id, data_inicio, data_entrega"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("projetos")
      .select("id, nome, cliente:clientes(nome)")
      .order("nome"),
    supabase
      .from("profiles")
      .select("id, nome")
      .in("perfil", ["administrador", "colaborador"])
      .order("nome"),
    supabase
      .from("tarefas")
      .select(
        "id, titulo, etapa, status, prazo, responsavel:profiles(nome)"
      )
      .eq("campanha_id", id)
      .order("created_at"),
    supabase
      .from("checklist_itens")
      .select("id, texto, concluido, ordem")
      .eq("campanha_id", id)
      .order("ordem"),
  ]);

  if (!campanha) notFound();

  const projetos: ProjetoOption[] = ((projetosRaw ?? []) as ProjetoRow[]).map(
    (p) => ({
      id: p.id,
      nome: p.nome,
      cliente_nome: pickOne(p.cliente)?.nome ?? "—",
    })
  );

  const update = updateCampanha.bind(null, id) as (
    prev: CampanhaFormState,
    fd: FormData
  ) => Promise<CampanhaFormState>;

  const handleDelete = async () => {
    "use server";
    await deleteCampanha(id);
  };

  const handleAddTarefa = async (formData: FormData) => {
    "use server";
    await createTarefa(id, formData);
  };

  const handleAddChecklist = async (formData: FormData) => {
    "use server";
    await createChecklistItem(id, formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {campanha.nome}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Editar dados, tarefas e checklist
          </p>
        </div>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            Excluir
          </Button>
        </form>
      </div>

      <CampanhaForm
        action={update}
        defaults={campanha}
        projetos={projetos}
        responsaveis={responsaveis ?? []}
        submitLabel="Salvar alterações"
      />

      {/* TAREFAS */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={handleAddTarefa}
            className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="titulo">Nova tarefa</Label>
              <Input
                id="titulo"
                name="titulo"
                required
                placeholder="Título"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa</Label>
              <select
                id="etapa"
                name="etapa"
                defaultValue="briefing"
                className={selectClass}
              >
                {ETAPA_TAREFA_ORDER.map((e) => (
                  <option key={e} value={e}>
                    {ETAPA_TAREFA_LABELS[e]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tarefa_prazo">Prazo</Label>
              <Input id="tarefa_prazo" name="prazo" type="date" />
            </div>
            <Button type="submit">Adicionar</Button>
          </form>

          {tarefas && tarefas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status / Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarefas.map((t) => {
                  const resp = pickOne(
                    t.responsavel as
                      | { nome: string }
                      | { nome: string }[]
                      | null
                  );
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.titulo}</TableCell>
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
                        <TarefaActions
                          tarefaId={t.id}
                          campanhaId={id}
                          status={t.status as StatusTarefa}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhuma tarefa ainda. Use o formulário acima para adicionar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* CHECKLIST */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={handleAddChecklist}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="texto">Novo item</Label>
              <Input
                id="texto"
                name="texto"
                placeholder="Item de progresso"
                required
              />
            </div>
            <Button type="submit">Adicionar</Button>
          </form>

          {checklist && checklist.length > 0 ? (
            <ul>
              {checklist.map((item) => (
                <ChecklistItem
                  key={item.id}
                  id={item.id}
                  campanhaId={id}
                  texto={item.texto}
                  concluido={item.concluido}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sem itens ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
