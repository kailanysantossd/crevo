import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STATUS_CAMPANHA_LABELS,
  statusCampanhaBadge,
  type StatusCampanha,
} from "@/lib/labels";

type CampanhaCronograma = {
  id: string;
  nome: string;
  status: StatusCampanha;
  data_inicio: string | null;
  data_entrega: string | null;
  projeto: { nome: string } | { nome: string }[] | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoDay(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function CronogramaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>;
}) {
  const { mes, ano } = await searchParams;
  const hoje = new Date();
  const monthIdx = mes ? Math.min(11, Math.max(0, Number(mes) - 1)) : hoje.getMonth();
  const year = ano ? Number(ano) : hoje.getFullYear();

  const firstDay = new Date(year, monthIdx, 1);
  const lastDay = new Date(year, monthIdx + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const monthStartIso = isoDay(year, monthIdx, 1);
  const monthEndIso = isoDay(year, monthIdx, daysInMonth);

  const supabase = await createClient();
  const { data: campanhasRaw } = await supabase
    .from("campanhas")
    .select(
      "id, nome, status, data_inicio, data_entrega, projeto:projetos(nome)"
    )
    .or(
      `and(data_entrega.gte.${monthStartIso},data_entrega.lte.${monthEndIso}),and(data_inicio.gte.${monthStartIso},data_inicio.lte.${monthEndIso})`
    );

  const campanhas = (campanhasRaw ?? []) as CampanhaCronograma[];

  type EventoDia = {
    id: string;
    nome: string;
    tipo: "inicio" | "entrega";
    status: StatusCampanha;
  };
  const eventosPorDia: Record<string, EventoDia[]> = {};
  campanhas.forEach((c) => {
    if (c.data_inicio) {
      const key = c.data_inicio.slice(0, 10);
      eventosPorDia[key] = eventosPorDia[key] ?? [];
      eventosPorDia[key].push({
        id: c.id,
        nome: c.nome,
        tipo: "inicio",
        status: c.status,
      });
    }
    if (c.data_entrega) {
      const key = c.data_entrega.slice(0, 10);
      eventosPorDia[key] = eventosPorDia[key] ?? [];
      eventosPorDia[key].push({
        id: c.id,
        nome: c.nome,
        tipo: "entrega",
        status: c.status,
      });
    }
  });

  const prevMonth = monthIdx === 0 ? 12 : monthIdx;
  const prevYear = monthIdx === 0 ? year - 1 : year;
  const nextMonth = monthIdx === 11 ? 1 : monthIdx + 2;
  const nextYear = monthIdx === 11 ? year + 1 : year;

  const cells: ({ day: number; iso: string } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: isoDay(year, monthIdx, d) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const hojeIso = isoDay(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  // Próximas entregas (lista)
  const { data: proximasRaw } = await supabase
    .from("campanhas")
    .select(
      "id, nome, status, data_entrega, projeto:projetos(nome, cliente:clientes(nome))"
    )
    .not("data_entrega", "is", null)
    .gte("data_entrega", hojeIso)
    .not("status", "in", "(concluida,cancelada,arquivada)")
    .order("data_entrega", { ascending: true })
    .limit(15);

  const proximas = (proximasRaw ?? []) as Array<{
    id: string;
    nome: string;
    status: StatusCampanha;
    data_entrega: string;
    projeto:
      | { nome: string; cliente: { nome: string } | { nome: string }[] | null }
      | {
          nome: string;
          cliente: { nome: string } | { nome: string }[] | null;
        }[]
      | null;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cronograma</h1>
          <p className="text-sm text-muted-foreground">
            Datas de início e entrega das campanhas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/cronograma?mes=${prevMonth}&ano=${prevYear}`}
            className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-accent transition-colors"
          >
            ←
          </Link>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {MONTH_NAMES[monthIdx]} {year}
          </span>
          <Link
            href={`/cronograma?mes=${nextMonth}&ano=${nextYear}`}
            className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-accent transition-colors"
          >
            →
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-px text-xs font-medium text-muted-foreground mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-1 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) {
                return (
                  <div
                    key={i}
                    className="aspect-square sm:aspect-auto sm:min-h-[100px] rounded-md bg-muted/40"
                  />
                );
              }
              const eventos = eventosPorDia[cell.iso] ?? [];
              const isHoje = cell.iso === hojeIso;
              return (
                <div
                  key={i}
                  className={`min-h-[80px] sm:min-h-[100px] rounded-md border p-1 sm:p-2 ${
                    isHoje
                      ? "border-[#22C7B8] bg-accent/50"
                      : "border-border bg-card"
                  }`}
                >
                  <div
                    className={`text-xs font-medium mb-1 ${
                      isHoje ? "text-[#1F3A5F] dark:text-[#22C7B8]" : ""
                    }`}
                  >
                    {cell.day}
                  </div>
                  <div className="space-y-0.5">
                    {eventos.slice(0, 3).map((e, idx) => (
                      <Link
                        key={`${e.id}-${e.tipo}-${idx}`}
                        href={`/campanhas/${e.id}`}
                        className={`block text-[10px] leading-tight px-1 py-0.5 rounded truncate ${
                          e.tipo === "entrega"
                            ? statusCampanhaBadge(e.status)
                            : "bg-muted text-foreground"
                        }`}
                        title={`${e.nome} · ${e.tipo === "entrega" ? "Entrega" : "Início"}`}
                      >
                        {e.tipo === "entrega" ? "▼" : "▸"} {e.nome}
                      </Link>
                    ))}
                    {eventos.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1">
                        +{eventos.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-2 rounded bg-[#22C7B8]/20" />
              ▼ Entrega
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-2 rounded bg-muted" />
              ▸ Início
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximas entregas</CardTitle>
        </CardHeader>
        <CardContent>
          {proximas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma entrega futura cadastrada.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {proximas.map((c) => {
                const projeto = pickOne(c.projeto);
                const cliente = pickOne(projeto?.cliente);
                return (
                  <li key={c.id} className="py-3 flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-muted-foreground uppercase">
                        {new Date(c.data_entrega).toLocaleDateString("pt-BR", {
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </p>
                      <p className="text-2xl font-semibold tabular-nums leading-none">
                        {new Date(c.data_entrega).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          timeZone: "UTC",
                        })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/campanhas/${c.id}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {c.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {cliente?.nome ?? "—"}
                        {projeto?.nome ? ` · ${projeto.nome}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCampanhaBadge(c.status)}`}
                    >
                      {STATUS_CAMPANHA_LABELS[c.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
