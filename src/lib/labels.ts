export type StatusCampanha =
  | "rascunho"
  | "briefing_aprovado"
  | "planejamento"
  | "em_producao"
  | "aguardando_aprovacao"
  | "aprovada"
  | "agendada"
  | "publicada"
  | "concluida"
  | "pausada"
  | "cancelada"
  | "arquivada";

export type EtapaTarefa =
  | "briefing"
  | "planejamento"
  | "producao"
  | "revisao"
  | "aprovacao"
  | "publicacao"
  | "conclusao";

export type StatusTarefa = "pendente" | "em_andamento" | "concluida";

export const STATUS_CAMPANHA_LABELS: Record<StatusCampanha, string> = {
  rascunho: "Rascunho",
  briefing_aprovado: "Briefing aprovado",
  planejamento: "Planejamento",
  em_producao: "Em produção",
  aguardando_aprovacao: "Aguardando aprovação",
  aprovada: "Aprovada",
  agendada: "Agendada",
  publicada: "Publicada",
  concluida: "Concluída",
  pausada: "Pausada",
  cancelada: "Cancelada",
  arquivada: "Arquivada",
};

export const STATUS_CAMPANHA_ORDER: StatusCampanha[] = [
  "rascunho",
  "briefing_aprovado",
  "planejamento",
  "em_producao",
  "aguardando_aprovacao",
  "aprovada",
  "agendada",
  "publicada",
  "concluida",
  "pausada",
  "cancelada",
  "arquivada",
];

export const ETAPA_TAREFA_LABELS: Record<EtapaTarefa, string> = {
  briefing: "Briefing",
  planejamento: "Planejamento",
  producao: "Produção",
  revisao: "Revisão",
  aprovacao: "Aprovação",
  publicacao: "Publicação",
  conclusao: "Conclusão",
};

export const ETAPA_TAREFA_ORDER: EtapaTarefa[] = [
  "briefing",
  "planejamento",
  "producao",
  "revisao",
  "aprovacao",
  "publicacao",
  "conclusao",
];

export const STATUS_TAREFA_LABELS: Record<StatusTarefa, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export function statusCampanhaBadge(status: StatusCampanha) {
  const map: Record<StatusCampanha, string> = {
    rascunho: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    briefing_aprovado:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    planejamento:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    em_producao:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    aguardando_aprovacao:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    aprovada:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    agendada:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    publicada:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    concluida:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    pausada:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    cancelada:
      "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    arquivada: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
  };
  return map[status];
}

export function statusTarefaBadge(status: StatusTarefa) {
  const map: Record<StatusTarefa, string> = {
    pendente: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    em_andamento:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    concluida:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  };
  return map[status];
}
