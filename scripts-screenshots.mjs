import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { mkdir } from "node:fs/promises";

const APP = "http://localhost:3000";
const OUT_DIR = "/Users/kailany.santos/dev/crevo/screenshots";

const SUPABASE_URL = "https://umzwkjeozxutozfosvvj.supabase.co";
const SUPABASE_KEY = "sb_publishable_PZQijws9DBRH_mLBnC-Jmw_tb_DIqCU";

const DEMO_EMAIL = `demo-${Date.now()}@example.com`;
const DEMO_PASSWORD = "Demo123Crevo!";
const DEMO_NOME = "Maria Demo";

await mkdir(OUT_DIR, { recursive: true });

// ===== STEP 1: Create user + seed data via Supabase JS =====
console.log("🧑 Criando usuário demo via Supabase...");
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const { data: signUpData, error: signUpErr } = await sb.auth.signUp({
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  options: { data: { nome: DEMO_NOME } },
});
if (signUpErr) {
  console.error("Erro signup:", signUpErr);
  process.exit(1);
}
if (!signUpData.session) {
  console.error("Signup sem session — email confirmation pode estar ON.");
  process.exit(1);
}
console.log("✓ Usuário criado:", DEMO_EMAIL);

console.log("📦 Inserindo dados de exemplo...");

const dt = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const { data: clientes, error: cErr } = await sb
  .from("clientes")
  .insert([
    {
      nome: "Aurora Cosméticos",
      empresa: "Aurora Indústria e Comércio",
      email_contato: "contato@example.com",
      telefone: "+55 11 4000-1000",
      observacoes:
        "Cliente parceiro desde 2024. Linha cosmética premium com pegada natural.",
    },
    {
      nome: "Café Estrela",
      empresa: "Estrela Cafés",
      email_contato: "marketing@example.com",
      telefone: "+55 11 5000-2000",
    },
    {
      nome: "Verdê Moda",
      empresa: "Verdê Confecção",
      email_contato: "atendimento@example.com",
    },
  ])
  .select();
if (cErr) {
  console.error("Erro clientes:", cErr);
  process.exit(1);
}
const [aurora, estrela] = clientes;

const { data: projetos, error: pErr } = await sb
  .from("projetos")
  .insert([
    {
      cliente_id: aurora.id,
      nome: "Lançamento Linha Verão 2027",
      descricao:
        "Campanha integrada de lançamento da nova linha de hidratantes corporais.",
    },
    {
      cliente_id: estrela.id,
      nome: "Reposicionamento de marca",
      descricao:
        "Atualização da identidade do Café Estrela para o público jovem urbano.",
    },
  ])
  .select();
if (pErr) {
  console.error("Erro projetos:", pErr);
  process.exit(1);
}
const [projetoAurora, projetoEstrela] = projetos;

const { data: campanhas, error: campErr } = await sb
  .from("campanhas")
  .insert([
    {
      projeto_id: projetoAurora.id,
      nome: "Instagram",
      status: "em_producao",
      canal: "Instagram",
      data_inicio: dt(-5),
      data_entrega: dt(7),
      responsavel_id: signUpData.user.id,
    },
    {
      projeto_id: projetoAurora.id,
      nome: "TikTok",
      status: "planejamento",
      canal: "TikTok",
      data_inicio: dt(2),
      data_entrega: dt(14),
    },
    {
      projeto_id: projetoAurora.id,
      nome: "Outdoor SP",
      status: "aguardando_aprovacao",
      canal: "Outdoor",
      data_inicio: dt(-2),
      data_entrega: dt(3),
    },
    {
      projeto_id: projetoEstrela.id,
      nome: "Vídeo manifesto",
      status: "aprovada",
      canal: "YouTube",
      data_inicio: dt(0),
      data_entrega: dt(21),
    },
  ])
  .select();
if (campErr) {
  console.error("Erro campanhas:", campErr);
  process.exit(1);
}
const [insta, tiktok, outdoor] = campanhas;

await sb.from("briefings").insert({
  campanha_id: insta.id,
  objetivo:
    "Apresentar a nova linha Verão 2027 com foco em hidratação leve, gerando consideração e tráfego para o site.",
  publico_alvo:
    "Mulheres 22-40 anos, classes A/B, atentas a ingredientes naturais.",
  canais_divulgacao: "Instagram Reels e Stories",
  mensagem_principal: "Verão sem peso na pele — hidratação que respira.",
  orcamento_estimado: 85000,
  data_inicio: dt(-5),
  data_entrega: dt(7),
  referencias:
    "Mood board com paleta clara, luz dourada, locação à beira-mar.",
  observacoes: "Cliente pediu para evitar texto sobre os modelos.",
});

await sb.from("tarefas").insert([
  {
    campanha_id: insta.id,
    titulo: "Roteiro do reels",
    etapa: "briefing",
    status: "concluida",
    prazo: dt(-3),
    responsavel_id: signUpData.user.id,
  },
  {
    campanha_id: insta.id,
    titulo: "Captação na praia",
    etapa: "producao",
    status: "em_andamento",
    prazo: dt(3),
    responsavel_id: signUpData.user.id,
  },
  {
    campanha_id: insta.id,
    titulo: "Edição e legenda",
    etapa: "producao",
    status: "pendente",
    prazo: dt(5),
  },
  {
    campanha_id: insta.id,
    titulo: "Aprovação interna",
    etapa: "aprovacao",
    status: "pendente",
    prazo: dt(6),
  },
  {
    campanha_id: tiktok.id,
    titulo: "Pesquisa de tendências",
    etapa: "planejamento",
    status: "em_andamento",
    prazo: dt(4),
    responsavel_id: signUpData.user.id,
  },
]);

await sb.from("checklist_itens").insert([
  {
    campanha_id: insta.id,
    texto: "Briefing aprovado pela equipe",
    concluido: true,
    ordem: 1,
  },
  {
    campanha_id: insta.id,
    texto: "Locação confirmada",
    concluido: true,
    ordem: 2,
  },
  {
    campanha_id: insta.id,
    texto: "Talentos contratados",
    concluido: false,
    ordem: 3,
  },
  {
    campanha_id: insta.id,
    texto: "Edição enviada ao cliente",
    concluido: false,
    ordem: 4,
  },
]);

await sb.from("aprovacoes").insert({
  campanha_id: outdoor.id,
  enviado_por: signUpData.user.id,
  status: "aguardando",
});

console.log("✓ Dados criados");

// ===== STEP 2: Screenshots with Playwright =====
const browser = await chromium.launch({ headless: true });

const publicCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const pub = await publicCtx.newPage();

console.log("📸 1 — Landing");
await pub.goto(APP);
await pub.waitForTimeout(1500);
await pub.screenshot({ path: `${OUT_DIR}/01-landing.png` });

console.log("📸 2 — Login");
await pub.goto(`${APP}/login`);
await pub.waitForTimeout(1000);
await pub.screenshot({ path: `${OUT_DIR}/02-login.png` });

console.log("📸 3 — Signup");
await pub.goto(`${APP}/signup`);
await pub.waitForTimeout(1000);
await pub.screenshot({ path: `${OUT_DIR}/03-signup.png` });

await publicCtx.close();

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

console.log("🔑 Login...");
await page.goto(`${APP}/login`);
await page.fill('input[name="email"]', DEMO_EMAIL);
await page.fill('input[name="password"]', DEMO_PASSWORD);
await Promise.all([
  page.waitForURL("**/dashboard", { timeout: 20000 }),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(2500);

console.log("📸 4 — Dashboard");
await page.screenshot({ path: `${OUT_DIR}/04-dashboard.png` });

console.log("📸 5 — Clientes");
await page.goto(`${APP}/clientes`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT_DIR}/05-clientes.png` });

console.log("📸 6 — Campanhas");
await page.goto(`${APP}/campanhas`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT_DIR}/06-campanhas.png` });

console.log("📸 7 — Campanha detalhe (full page)");
await page.goto(`${APP}/campanhas/${insta.id}`);
await page.waitForTimeout(2500);
await page.screenshot({
  path: `${OUT_DIR}/07-campanha-detalhe.png`,
  fullPage: true,
});

console.log("📸 8 — Cronograma");
await page.goto(`${APP}/cronograma`);
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT_DIR}/08-cronograma.png` });

console.log("📸 9 — Tarefas");
await page.goto(`${APP}/tarefas`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT_DIR}/09-tarefas.png` });

await ctx.close();

// Mobile
console.log("📸 mobile — Dashboard");
const mobileCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const mob = await mobileCtx.newPage();
await mob.goto(`${APP}/login`);
await mob.fill('input[name="email"]', DEMO_EMAIL);
await mob.fill('input[name="password"]', DEMO_PASSWORD);
await Promise.all([
  mob.waitForURL("**/dashboard", { timeout: 20000 }),
  mob.click('button[type="submit"]'),
]);
await mob.waitForTimeout(2000);
await mob.screenshot({ path: `${OUT_DIR}/10-mobile-dashboard.png` });

console.log("📸 mobile — Landing");
await mob.context().clearCookies();
await mob.goto(`${APP}/`);
await mob.waitForTimeout(1000);
await mob.screenshot({ path: `${OUT_DIR}/11-mobile-landing.png` });

await mobileCtx.close();
await browser.close();

console.log("\n✅ Pronto! Imagens em " + OUT_DIR);
