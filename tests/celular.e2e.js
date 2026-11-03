/*
 * Teste de ponta a ponta do celular com conteúdo longo (uso técnico, opcional).
 * Monta, a partir de dados/EXEMPLO-treinamento.txt, um report de ESTRESSE com números e nomes FICTÍCIOS
 * bem maiores que o normal (valores de 15 caracteres, títulos longos, palavras sem espaço, 4 indicadores
 * na capa, tópicos nos 4 layouts) e confere, em 320, 375, 390 e 430 px:
 *   - a página e o e-mail-resumo não rolam para o lado e nenhum texto passa da caixa;
 *   - no report normal, os 3 indicadores continuam lado a lado (o layout aprovado não muda);
 *   - um report antigo (sem o ajuste de largura) aberto no emulador fica dentro da tela
 *     (edição e prévias) e sai salvo com o ajuste.
 *   Requer Node.js + Playwright:  node tests/celular.e2e.js
 *   (EMULADOR=kit/emulador-report.html testa o emulador avulso)
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.join(RAIZ, "tests", "saida");
var EMU = "file://" + path.resolve(RAIZ, process.env.EMULADOR || "converter-html-eml.html");
var LARGURAS = [320, 375, 390, 430];
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function ler(p) { return fs.readFileSync(path.join(RAIZ, p), "utf8"); }

function montar(dados) {
  var r = Motor.montar({ dados: dados, arquivoDados: "estresse.txt", marca: ler("config/marca.txt"), template: ler("template/report.html"), existe: function (p) { return fs.existsSync(path.join(RAIZ, p)); } });
  var h = r.html;
  r.imagens.forEach(function (i) {
    var tipo = /\.png$/i.test(i.caminho) ? "image/png" : /\.webm$/i.test(i.caminho) ? "video/webm" : /\.mp4$/i.test(i.caminho) ? "video/mp4" : "image/jpeg";
    h = h.split(i.token).join("data:" + tipo + ";base64," + fs.readFileSync(path.join(RAIZ, i.caminho)).toString("base64"));
  });
  return h;
}
var NORMAL = ler("dados/EXEMPLO-treinamento.txt");
var vals = ["R$ 1.234.567,89", "+1.250,5%", "12.345.678", "R$ 98.765,43"], k = 0;
var ESTRESSE = NORMAL.replace(/^valor: .*$/gm, function () { return "valor: " + vals[k++ % vals.length]; })
  .replace(/^titulo: Indicador ([A-F])$/gm, "titulo: Indicador $1 com um título bem mais comprido que o normal")
  .replace(/^anterior: .*$/m, "anterior: 1.234,5%").replace(/^atual: .*$/m, "atual: 12.345,6%")
  .replace(/^nome: Lançamento Exemplo 1$/m, "nome: Lançamento_Com_Nome_Muito_Longo_Sem_Espaços_2026")
  .replace(/^nome: Campanha Exemplo A$/m, "nome: Campanha Exemplo A com nome comprido para testar a quebra de linha")
  .replace("[NUMERO 3]", "[NUMERO 4]\nvalor: R$ 9.999.999\ntitulo: Quarto indicador longo\n\n[NUMERO 3]") +
  "\n[TOPICO]\nrotulo: Testes com rótulo longo\ntitulo: Título longo do tópico em lista\nlayout: lista\n[TOPICO 1]\nnome: Item_SemEspacos_MuitoLongo_ParaQuebrar_Linha\nlinks: Documento com nome bem comprido | https://www.example.com/pasta/arquivo-com-nome-bem-longo-para-testar.pdf\n" +
  "[TOPICO B]\nrotulo: Números\nlayout: numeros\n[TOPICO B 1]\nvalor: R$ 1.234.567,89\nnome: Alcance total\n[TOPICO B 2]\nvalor: 12.345.678\nnome: Impressões\n[TOPICO B 3]\nvalor: +1.250,5%\nnome: Crescimento\n[TOPICO B 4]\nvalor: 98,7%\nnome: Taxa\n" +
  "[TOPICO C]\nrotulo: Cartões\nlayout: cartoes\n[TOPICO C 1]\nnome: Cartão_Com_Nome_Longo_Sem_Espaços\n[TOPICO C 2]\nnome: Cartão 2\n[TOPICO C 3]\nnome: Cartão 3\n[TOPICO C 4]\nnome: Cartão 4\n" +
  "[TOPICO D]\nrotulo: Colunas\nlayout: colunas\n[TOPICO D 1]\nnome: Coluna_Com_Nome_Longo_Sem_Espaços\n[TOPICO D 2]\nnome: Coluna 2\n[TOPICO D 3]\nnome: Coluna 3\n";

/* Roda dentro da página: lista o que passa da largura (rolagem para o lado, elemento fora da tela, texto maior que a caixa). */
function medir(d) {
  var W = d.documentElement.clientWidth, out = [], w = d.defaultView;
  if (d.documentElement.scrollWidth > W + 1) out.push("a página rola " + (d.documentElement.scrollWidth - W) + " px para o lado");
  function nome(e) { var c = e.getAttribute("data-campo") || e.getAttribute("data-item") || e.getAttribute("data-img") || e.id || (typeof e.className === "string" ? e.className.split(" ")[0] : ""); return e.tagName.toLowerCase() + (c ? "[" + c + "]" : ""); }
  Array.prototype.forEach.call(d.querySelectorAll("body *"), function (e) {
    if (e.closest("[data-editor], #amp, [data-ed-oculta]")) return;
    var cs = w.getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return;
    var r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
    if (r.right > W + 1 || r.left < -1) out.push(nome(e) + " sai da tela (" + Math.round(r.left) + ".." + Math.round(r.right) + " de " + W + ")");
    if (/^(P|TD|DIV|H1|H2|H3|LI|BUTTON|LABEL)$/.test(e.tagName) && cs.overflowX === "visible" && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) out.push(nome(e) + " tem conteúdo mais largo que a caixa (" + e.scrollWidth + " > " + e.clientWidth + ")");
  });
  return out.filter(function (x, i, a) { return a.indexOf(x) === i; });
}
function resumo(lista) { return lista.length ? lista.length + " problema(s): " + lista.slice(0, 3).join(" | ") : "ok"; }

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var estresse = montar(ESTRESSE), normal = montar(NORMAL);
  var antigo = estresse.replace(/<style id="ajuste-celular">[\s\S]*?<\/style>/, "");
  confere(antigo !== estresse, "report antigo de teste montado sem o ajuste de largura");
  var arqEstresse = path.join(SAIDA, "celular-estresse.html"), arqNormal = path.join(SAIDA, "celular-normal.html"), arqAntigo = path.join(SAIDA, "celular-antigo.html");
  fs.writeFileSync(arqEstresse, estresse); fs.writeFileSync(arqNormal, normal); fs.writeFileSync(arqAntigo, antigo);
  var arqResumo = path.join(SAIDA, "celular-resumo.html"), rr = Motor.emailResumo(estresse, { link: "https://www.example.com/report" });
  confere(!rr.erro && rr.html, "e-mail-resumo do report de estresse montado");
  fs.writeFileSync(arqResumo, rr.html || "");

  var browser = await chromium.launch(), erros = [];
  async function celular(w) { var ctx = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true }); var p = await ctx.newPage(); p.on("pageerror", function (e) { erros.push(e.message); }); return { ctx: ctx, p: p }; }
  async function revelar(p) { await p.evaluate(function () { document.querySelectorAll("[data-rv]").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; }); }); }

  for (var i = 0; i < LARGURAS.length; i++) {
    var w = LARGURAS[i], c = await celular(w);
    await c.p.goto("file://" + arqEstresse); await c.p.waitForTimeout(500); await revelar(c.p);
    var r1 = await c.p.evaluate("(" + medir.toString() + ")(document)");
    confere(!r1.length, w + " px · report com conteúdo longo dentro da tela: " + resumo(r1));
    await c.p.goto("file://" + arqResumo); await c.p.waitForTimeout(300);
    var r2 = await c.p.evaluate("(" + medir.toString() + ")(document)");
    confere(!r2.length, w + " px · e-mail-resumo com conteúdo longo dentro da tela: " + resumo(r2));
    await c.p.goto("file://" + arqNormal); await c.p.waitForTimeout(500); await revelar(c.p);
    var r3 = await c.p.evaluate("(" + medir.toString() + ")(document)");
    var topos = await c.p.evaluate(function () { return [1, 2, 3].map(function (n) { var e = document.querySelector('[data-campo="numero-' + n + '.valor"]'); return e ? Math.round(e.getBoundingClientRect().top) : null; }); });
    confere(!r3.length && topos[0] !== null && topos[0] === topos[1] && topos[1] === topos[2], w + " px · report normal: os 3 indicadores seguem lado a lado e tudo dentro da tela (" + resumo(r3) + ")");
    await c.ctx.close();
  }

  /* Entre o celular e o computador (621 a 700 px, ex.: celular deitado): nada rola para o lado (4.13; antes, de 621 a ~680 px rolava). */
  for (var wm of [640, 690]) {
    var cm = await celular(wm);
    for (var am of [arqNormal, arqResumo]) {
      await cm.p.goto("file://" + am); await cm.p.waitForTimeout(300); await revelar(cm.p);
      var lm = await cm.p.evaluate(function () { return document.documentElement.scrollWidth; });
      confere(lm <= wm, wm + " px · " + path.basename(am) + ": sem rolagem para o lado (" + lm + " px)");
    }
    await cm.ctx.close();
  }

  /* Report antigo no emulador: celular de verdade (320 e 430) e computador no modo Celular. */
  var casos = [[320, true], [430, true], [1366, false]];
  for (var j = 0; j < casos.length; j++) {
    var cw = casos[j][0], movel = casos[j][1];
    var ctx = await browser.newContext({ viewport: { width: cw, height: 800 }, isMobile: movel, hasTouch: movel, acceptDownloads: true }), p = await ctx.newPage();
    p.on("pageerror", function (e) { erros.push(e.message); });
    await p.addInitScript(function () { window.showSaveFilePicker = undefined; });
    await p.goto(EMU); await p.setInputFiles("#arquivo", arqAntigo);
    await p.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 120000 });
    await p.fill("#link", "https://www.example.com/report"); await p.waitForTimeout(1800);
    /* o quadro encolhe com transição: mede depois que ele chega aos 390 px (como uma pessoa vê) */
    if (!movel) { await p.click('.ferramentas button[data-ew="390px"]'); await p.waitForFunction(function () { return document.querySelector("#edFrame").getBoundingClientRect().width <= 392; }, null, { timeout: 10000 }); await p.waitForTimeout(300); }
    var nomeCaso = movel ? cw + " px (celular)" : "computador no modo Celular";
    var pag = await p.evaluate("(" + medir.toString() + ")(document)");
    var ed = await p.evaluate("(" + medir.toString() + ")(document.querySelector('#edFrame').contentDocument)");
    confere(!pag.length && !ed.length, nomeCaso + " · emulador: página e edição do report antigo dentro da tela (" + resumo(pag.concat(ed)) + ")");
    for (var q of ["resumido", "completo"]) {
      await p.click('button[data-qual="' + q + '"]'); await p.waitForTimeout(900);
      var pv = await p.evaluate("(" + medir.toString() + ")(document.querySelector('#prev').contentDocument)");
      confere(!pv.length, nomeCaso + " · prévia " + q + " dentro da tela (" + resumo(pv) + ")");
    }
    if (j === 0) {
      var d = await Promise.all([p.waitForEvent("download"), p.click("#bSalvar")]);
      var salvo = fs.readFileSync(await d[0].path(), "utf8");
      confere(salvo.indexOf('id="ajuste-celular"') > 0 && salvo.split('id="ajuste-celular"').length === 2, "report antigo salvo pelo emulador sai com o ajuste de largura (uma vez só)");
    }
    await ctx.close();
  }
  confere(!erros.length, "sem erros no console" + (erros.length ? ": " + erros.slice(0, 3).join(" | ") : ""));
  await browser.close();
  console.log(falhas ? falhas + " falha(s)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
