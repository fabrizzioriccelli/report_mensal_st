/*
 * Teste de ponta a ponta do e-mail-resumo no modo escuro (uso técnico, opcional).
 * Monta o e-mail-resumo do report de exemplo (dados FICTÍCIOS) e confere, no Chromium:
 *   - modo escuro do sistema (prefers-color-scheme: dark, como Apple Mail, Outlook para Mac, iOS e Android):
 *     o e-mail sai igual ao modo claro, pixel a pixel, no computador e no celular;
 *   - Outlook.com / novo Outlook para Windows: uma SIMULAÇÃO do que eles fazem no modo escuro (trocam as cores
 *     de fundo e de texto direto no HTML e marcam o elemento com data-ogsc / data-ogsb). Sem a proteção, o
 *     cabeçalho fica claro com texto escuro (o problema do print); com ela, voltam as cores aprovadas.
 *   É uma simulação: o Outlook de verdade só dá para conferir abrindo o .eml nele (docs/EMULADOR.md).
 *   Requer Node.js + Playwright:  node tests/escuro.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.join(RAIZ, "tests", "saida");
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function ler(p) { return fs.readFileSync(path.join(RAIZ, p), "utf8"); }

function resumo() {
  var r = Motor.montar({ dados: ler("dados/EXEMPLO-treinamento.txt"), arquivoDados: "exemplo.txt", marca: ler("config/marca.txt"), template: ler("template/report.html"), existe: function (p) { return fs.existsSync(path.join(RAIZ, p)); } });
  var h = r.html;
  r.imagens.forEach(function (i) {
    var tipo = /\.png$/i.test(i.caminho) ? "image/png" : "image/jpeg";
    h = h.split(i.token).join("data:" + tipo + ";base64," + fs.readFileSync(path.join(RAIZ, i.caminho)).toString("base64"));
  });
  return Motor.emailResumo(h, { link: "https://www.example.com/report-ficticio", botao: "Acessar report completo" }).html;
}

/* O que o Outlook.com faz no modo escuro (aproximação): fundo claro fica escuro, fundo colorido fica mais claro,
   texto escuro fica claro e texto claro fica escuro; o elemento recolorido ganha data-ogsc / data-ogsb. */
function simularOutlookCom() {
  function hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
    return [h, s, l];
  }
  function rgb(h, s, l) {
    function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
    if (!s) return [l, l, l].map(function (x) { return Math.round(x * 255); });
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)].map(function (x) { return Math.round(x * 255); });
  }
  function hex(c) { var m = /^#([0-9a-f]{6})$/i.exec(c.trim()); return m ? [0, 2, 4].map(function (i) { return parseInt(m[1].substr(i, 2), 16); }) : null; }
  function troca(c, fundo) {
    var v = hex(c); if (!v) return null;
    var x = hsl(v[0], v[1], v[2]), l = x[2];
    l = fundo ? (x[1] > 0.4 && l < 0.7 ? Math.min(0.82, l + 0.3) : 1 - l) : (l > 0.6 ? 0.16 : 1 - l);
    var o = rgb(x[0], x[1], l);
    return "#" + o.map(function (n) { return ("0" + n.toString(16)).slice(-2); }).join("");
  }
  Array.prototype.forEach.call(document.querySelectorAll("body, body *"), function (el) {
    var st = el.getAttribute("style") || "", bg = el.getAttribute("bgcolor"), mudou = st;
    mudou = mudou.replace(/(^|;)(\s*color:\s*)(#[0-9a-f]{6})/i, function (t, a, b, c) { var n = troca(c, false); if (n) el.setAttribute("data-ogsc", c); return a + b + (n || c); });
    mudou = mudou.replace(/(^|;)(\s*background(?:-color)?:\s*)(#[0-9a-f]{6})/gi, function (t, a, b, c) { var n = troca(c, true); if (n) el.setAttribute("data-ogsb", c); return a + b + (n || c); });
    if (mudou !== st) el.setAttribute("style", mudou);
    if (bg && troca(bg, true)) { el.setAttribute("data-ogab", bg); el.setAttribute("bgcolor", troca(bg, true)); }
  });
}

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var html = resumo(), semProtecao = html.replace(/\n  @media \(prefers-color-scheme:dark\)\{[\s\S]*?(?=\n<\/style>)/, "");
  confere(semProtecao.length < html.length && !/data-ogsc/.test(semProtecao), "versão sem a proteção (para comparar) montada");
  var arq = path.join(SAIDA, "escuro-resumo.html"), arqSem = path.join(SAIDA, "escuro-resumo-sem-protecao.html");
  fs.writeFileSync(arq, html); fs.writeFileSync(arqSem, semProtecao);
  var browser = await chromium.launch(), erros = [];

  /* 1. modo escuro do sistema = modo claro, pixel a pixel (computador e celular) */
  for (var w of [800, 390]) {
    var fotos = {};
    for (var esquema of ["light", "dark"]) {
      var pg = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: esquema });
      pg.on("pageerror", function (e) { erros.push(e.message); });
      await pg.goto("file://" + arq); await pg.waitForTimeout(300);
      fotos[esquema] = await pg.screenshot({ fullPage: true, path: path.join(SAIDA, "escuro-sistema-" + esquema + "-" + w + ".png") });
      await pg.close();
    }
    confere(Buffer.compare(fotos.light, fotos.dark) === 0, w + " px: no modo escuro do sistema o e-mail fica igual ao claro (pixel a pixel)");
  }

  /* 2. Outlook.com / novo Outlook (simulação): sem proteção o cabeçalho perde as cores; com ela, voltam */
  async function cores(arquivo, simular, foto) {
    var pg = await browser.newPage({ viewport: { width: 800, height: 900 } });
    await pg.goto("file://" + arquivo); await pg.waitForTimeout(200);
    if (simular) await pg.evaluate(simularOutlookCom);
    await pg.waitForTimeout(100);
    if (foto) await pg.screenshot({ fullPage: true, path: path.join(SAIDA, foto) });
    var c = await pg.evaluate(function () {
      function cs(sel, p) { var e = document.querySelector(sel); return e ? getComputedStyle(e)[p] : "?"; }
      return {
        cabecalho: cs("td.px.dm-marca-bg", "backgroundColor"), frase: cs("p.h1", "color"), cartao: cs("table.container", "backgroundColor"),
        fundo: cs("body", "backgroundColor"), botao: cs("table.btn td", "backgroundColor"), textoBotao: cs("table.btn a", "color"),
        valor: cs("p.kpiv", "color"), titulo: cs("td.kpi p.fx", "color"), chamada: cs("td.ctat p.ft", "color"), assinatura: cs("tr:last-child > td.px.dm-marca-bg p.ft", "color"),
        selo: cs("table.selo td", "backgroundColor"), etiqueta: cs("td.dm-chip-verde, td.dm-chip-ambar", "color"),
        recoloridos: document.querySelectorAll("[data-ogsc], [data-ogsb], [data-ogab]").length
      };
    });
    await pg.close();
    return c;
  }
  var claro = await cores(arq, false, "escuro-claro-800.png"), sem = await cores(arqSem, true, "escuro-outlookcom-sem-protecao.png"), com = await cores(arq, true, "escuro-outlookcom-com-protecao.png");
  console.log("  claro:          " + JSON.stringify(claro));
  console.log("  sem proteção:   " + JSON.stringify(sem));
  console.log("  com proteção:   " + JSON.stringify(com));
  confere(claro.cabecalho === "rgb(236, 0, 0)" && claro.frase === "rgb(255, 255, 255)" && claro.botao === "rgb(236, 0, 0)", "modo claro: cabeçalho e botão vermelhos, texto branco");
  confere(sem.recoloridos > 20 && sem.cabecalho !== claro.cabecalho && sem.frase !== claro.frase && sem.cartao !== claro.cartao, "simulação reproduz o problema do print: sem a proteção, cabeçalho, texto e cartão mudam de cor");
  var chaves = Object.keys(claro).filter(function (k) { return k !== "recoloridos"; }), diferentes = chaves.filter(function (k) { return com[k] !== claro[k]; });
  confere(com.recoloridos > 20 && !diferentes.length, "com a proteção, todas as cores voltam às aprovadas (" + chaves.join(", ") + ")" + (diferentes.length ? " · diferentes: " + diferentes.join(", ") : ""));

  /* 3. o resumo continua dentro da tela no celular, nos dois modos */
  for (var esq of ["light", "dark"]) {
    var pc = await browser.newPage({ viewport: { width: 320, height: 800 }, colorScheme: esq });
    await pc.goto("file://" + arq); await pc.waitForTimeout(200);
    var larg = await pc.evaluate(function () { return document.documentElement.scrollWidth; });
    confere(larg <= 320, "320 px (" + esq + "): sem rolagem para o lado (" + larg + " px)");
    await pc.close();
  }
  await browser.close();
  confere(!erros.length, "sem erro na página" + (erros.length ? ": " + erros.join(" | ") : ""));
  console.log(falhas ? "\n" + falhas + " falha(s)." : "\nTudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
