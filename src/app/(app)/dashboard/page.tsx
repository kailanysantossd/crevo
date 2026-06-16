import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STATUS_CAMPANHA_LABELS,
  STATUS_CAMPANHA_ORDER,
  statusCampanhaBadge,
  type StatusCampanha,
} from "@/lib/labels";

const ACTIVE_STATUSES: StatusCampanha[] = [
  "rascunho",
  "briefing_aprovado",
  "planejamento",
  "em_producao",
  "aguardando_aprovacao",
  "aprovada",
  "agendada",
];

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function diasAte(date: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(date);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, perfil")
    .eq("id", user!.id)
    .maybeSingle();

  const hojeIso = new Date().toISOString().slice(0, 10);
  const em7DiasIso = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  const [
    { data: campanhas },
    { count: tarefasPendentesCount },
    { count: aprovacoesPendentesCount },
    { data: minhasTarefas },
    { data: prazoProximos },
    { data: aguardandoAprovacao },
  ] = await Promise.all([
    supabase
      .from("campanhas")
      .select("id, status, data_entrega"),
    supabase
      .from("tarefas")
      .select("id", { count: "exact", head: true })
      .in("status", ["pendente", "em_andamento"]),
    supabase
      .from("aprovacoes")
      .select("id", { count: "exact", head: true })
      .eq("status", "aguardando"),
    supabase
      .from("tarefas")
      .select(
        "id, titulo, prazo, status, campanha:campanhas(id, nome)"
      )
      .eq("responsavel_id", user!.id)
      .in("status", ["pendente", "em_andamento"])
      .order("prazo", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from("campanhas")
      .select(
        "id, nome, status, data_entrega, projeto:projetos(nome, cliente:clientes(nome))"
      )
      .not("data_entrega", "is", null)
      .lte("data_entrega", em7DiasIso)
      .not("status", "in", "(concluida,cancelada,arquivada)")
      .order("data_entrega", { ascending: true })
      .limit(6),
    supabase
      .from("campanhas")
      .select(
        "id, nome, projeto:projetos(nome, cliente:clientes(nome))"
      )
      .eq("status", "aguardando_aprovacao")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const totalCampanhas = campanhas?.length ?? 0;
  const ativasCount =
    campanhas?.filter((c) =>
      ACTIVE_STATUSES.includes(c.status as StatusCampanha)
    ).length ?? 0;
  const atrasadasOuProximas =
    campanhas?.filter((c) => {
      if (!c.data_entrega) return false;
      if (
        c.status === "concluida" ||
        c.status === "cancelada" ||
        c.status === "arquivada"
      )
        return false;
      const d = diasAte(c.data_entrega);
      return d <= 7;
    }).length ?? 0;

  const porStatus: Record<StatusCampanha, number> = Object.fromEntries(
    STATUS_CAMPANHA_ORDER.map((s) => [s, 0])
  ) as Record<StatusCampanha, number>;
  campanhas?.forEach((c) => {
    porStatus[c.status as StatusCampanha]++;
  });
  const porStatusMax = Math.max(1, ...Object.values(porStatus));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {profile?.nome ?? "boas-vindas"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da operação · perfil{" "}
          <span className="font-medium capitalize">
            {profile?.perfil ?? "colaborador"}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI
          label="Campanhas ativas"
          value={ativasCount}
          hint={`${totalCampanhas} no total`}
        />
        <KPI
          label="Tarefas pendentes"
          value={tarefasPendentesCount ?? 0}
        />
        <KPI
          label="Aprovações pendentes"
          value={aprovacoesPendentesCount ?? 0}
        />
        <KPI
          label="Prazos críticos"
          value={atrasadasOuProximas}
          hint="próximos 7 dias"
          accent
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campanhas por status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STATUS_CAMPANHA_ORDER.filter((s) => porStatus[s] > 0).length ===
            0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma campanha cadastrada ainda.
              </p>
            ) : (
              STATUS_CAMPANHA_ORDER.filter((s) => porStatus[s] > 0).map((s) => {
                const v = porStatus[s];
                const pct = (v / porStatusMax) * 100;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className="w-44 text-sm text-foreground">
                      {STATUS_CAMPANHA_LABELS[s]}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusCampanhaBadge(s).split(" ")[0]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium tabular-nums w-8 text-right">
                      {v}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suas tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {minhasTarefas && minhasTarefas.length > 0 ? (
              minhasTarefas.map((t) => {
                const camp = pickOne(
                  t.campanha as
                    | { id: string; nome: string }
                    | { id: string; nome: string }[]
                    | null
                );
                return (
                  <div key={t.id} className="space-y-0.5">
                    <p className="text-sm font-medium leading-tight">
                      {t.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                      {" · "}
                      {formatDate(t.prazo)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem tarefas atribuídas a você.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prazos próximos (7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prazoProximos && prazoProximos.length > 0 ? (
              prazoProximos.map((c) => {
                const projeto = pickOne(
                  c.projeto as
                    | {
                        nome: string;
                        cliente:
                          | { nome: string }
                          | { nome: string }[]
                          | null;
                      }
                    | {
                        nome: string;
                        cliente:
                          | { nome: string }
                          | { nome: string }[]
                          | null;
                      }[]
                    | null
                );
                const cliente = pickOne(projeto?.cliente);
                const dias = c.data_entrega ? diasAte(c.data_entrega) : null;
                return (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 pb-2 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/campanhas/${c.id}`}
                        className="text-sm font-medium hover:underline block truncate"
                      >
                        {c.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {cliente?.nome ?? "—"}
                        {projeto?.nome ? ` · ${projeto.nome}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        dias !== null && dias < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {dias === null
                        ? "—"
                        : dias < 0
                          ? `${Math.abs(dias)}d atraso`
                          : dias === 0
                            ? "hoje"
                            : `em ${dias}d`}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem prazos críticos no horizonte.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aguardando aprovação do cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aguardandoAprovacao && aguardandoAprovacao.length > 0 ? (
              aguardandoAprovacao.map((c) => {
                const projeto = pickOne(
                  c.projeto as
                    | {
                        nome: string;
                        cliente:
                          | { nome: string }
                          | { nome: string }[]
                          | null;
                      }
                    | {
                        nome: string;
                        cliente:
                          | { nome: string }
                          | { nome: string }[]
                          | null;
                      }[]
                    | null
                );
                const cliente = pickOne(projeto?.cliente);
                return (
                  <div
                    key={c.id}
                    className="pb-2 border-b border-border last:border-0 last:pb-0"
                  >
                    <Link
                      href={`/campanhas/${c.id}`}
                      className="text-sm font-medium hover:underline block"
                    >
                      {c.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {cliente?.nome ?? "—"}
                      {projeto?.nome ? ` · ${projeto.nome}` : ""}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma campanha aguardando aprovação.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`text-3xl font-semibold tracking-tight tabular-nums ${
            accent ? "text-[#22C7B8]" : "text-foreground"
          }`}
        >
          {value}
        </p>
        {hint && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
