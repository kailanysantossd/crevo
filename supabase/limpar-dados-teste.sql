-- ============================================================================
-- LIMPAR DADOS DE TESTE
-- ============================================================================
-- Apaga todos os dados de clientes/projetos/campanhas/etc do banco, mantendo
-- as contas de usuário existentes.
--
-- Use isso DEPOIS de rodar a migração 0003 e ANTES de testar com 2 contas.
--
-- ATENÇÃO: isso apaga TUDO de TODOS os clientes/projetos/campanhas.
-- Não tem volta. Só rode se quiser começar do zero.
-- ============================================================================

begin;

-- A ordem importa por causa das foreign keys (cascade resolve mas explicitar
-- ajuda a deixar claro o que está sendo apagado).

delete from public.notificacoes;
delete from public.anexos;
delete from public.comentarios;
delete from public.aprovacoes;
delete from public.checklist_itens;
delete from public.tarefas;
delete from public.briefings;
delete from public.campanhas;
delete from public.projetos;
delete from public.clientes_usuarios;
delete from public.clientes;
delete from public.convites;

-- Não apaga profiles nem auth.users: contas existentes continuam ativas,
-- cada uma como administradora do próprio espaço vazio.

commit;
