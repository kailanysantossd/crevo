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
import { saveBriefing } from "../_briefing-actions";
import {
  ETAPA_TAREFA_LABELS,
  ETAPA_TAREFA_ORDER,
  type EtapaTarefa,
  type StatusTarefa,
} from "@/lib/labels";
import { ChecklistItem } from "./_checklist-item";
import { TarefaActions } from "./_tarefa-status";
import { BriefingSection } from "./_briefing-section";
import { AprovacaoSection, type Aprovacao } from "./_aprovacao-section";
import { AnexosSection, type Anexo } from "./_anexos-section";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("perfil")
    .eq("id", user!.id)
    .maybeSingle();

  const perfil = profile?.perfil as
    | "administrador"
    | "colaborador"
    | "cliente"
    | undefined;
  const isStaff = perfil === "administrador" || perfil === "colaborador";
  const isCliente = perfil === "cliente";

  const [
    { data: campanha },
    { data: projetosRaw },
    { data: responsaveis },
    { data: tarefas },
    { data: checklist },
    { data: briefing },
    { data: aprovacoesRaw },
    { data: anexosRaw },
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
    supabase
      .from("briefings")
      .select(
        "objetivo, publico_alvo, canais_divulgacao, mensagem_principal, orcamento_estimado, data_inicio, data_entrega, referencias, observacoes"
      )
      .eq("campanha_id", id)
      .maybeSingle(),
    supabase
      .from("aprovacoes")
      .select(
        "id, data_envio, status, data_resposta, comentario_cliente, enviado_por, respondido_por, enviado:profiles!aprovacoes_enviado_por_fkey(nome), respondido:profiles!aprovacoes_respondido_por_fkey(nome)"
      )
      .eq("campanha_id", id)
      .order("data_envio", { ascending: false }),
    supabase
      .from("anexos")
      .select("id, nome_arquivo, url_storage, tipo_mime, tamanho_bytes")
      .eq("vinculo_id", id)
      .eq("tipo_vinculo", "campanha")
      .order("created_at", { ascending: false }),
  ]);

  if (!campanha) notFound();

  const projetos: ProjetoOption[] = ((projetosRaw ?? []) as ProjetoRow[]).map(
    (p) => ({
      id: p.id,
      nome: p.nome,
      cliente_nome: pickOne(p.cliente)?.nome ?? "—",
    })
  );

  const aprovacoes: Aprovacao[] = (aprovacoesRaw ?? []).map(
    (a: {
      id: string;
      data_envio: string;
      status: "aguardando" | "aprovada" | "ajustes_solicitados";
      data_resposta: string | null;
      comentario_cliente: string | null;
      enviado: { nome: string } | { nome: string }[] | null;
      respondido: { nome: string } | { nome: string }[] | null;
    }) => ({
      id: a.id,
      data_envio: a.data_envio,
      status: a.status,
      data_resposta: a.data_resposta,
      comentario_cliente: a.comentario_cliente,
      enviado_nome: pickOne(a.enviado)?.nome ?? null,
      respondido_nome: pickOne(a.respondido)?.nome ?? null,
    })
  );

  const anexos: Anexo[] = (anexosRaw ?? []) as Anexo[];

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

  const handleSaveBriefing = async (formData: FormData) => {
    "use server";
    await saveBriefing(id, formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {campanha.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            Editar dados, briefing, tarefas, aprovação e anexos
          </p>
        </div>
        {isStaff && (
          <form action={handleDelete}>
            <Button type="submit" variant="destructive" size="sm">
              Excluir
            </Button>
          </form>
        )}
      </div>

      {isStaff && (
        <CampanhaForm
          action={update}
          defaults={campanha}
          projetos={projetos}
          responsaveis={responsaveis ?? []}
          submitLabel="Salvar alterações"
        />
      )}

      {isStaff && (
        <BriefingSection
          campanhaId={id}
          defaults={briefing}
          saveAction={handleSaveBriefing}
        />
      )}

      <AprovacaoSection
        campanhaId={id}
        aprovacoes={aprovacoes}
        podeEnviar={isStaff}
        podeResponder={isCliente}
      />

      {isStaff && (
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
                        <TableCell className="font-medium">
                          {t.titulo}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ETAPA_TAREFA_LABELS[t.etapa as EtapaTarefa]}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {resp?.nome ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
                Nenhuma tarefa ainda.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isStaff && (
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
              <p className="text-sm text-muted-foreground">Sem itens ainda.</p>
            )}
          </CardContent>
        </Card>
      )}

      <AnexosSection campanhaId={id} vinculoId={id} anexos={anexos} />
    </div>
  );
}
