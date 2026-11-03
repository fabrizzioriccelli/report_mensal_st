/*
 * Teste de ponta a ponta do "O que aprendemos" dentro de cada campanha (4.13, uso técnico, opcional), só com conteúdo
 * fictício. Num report de antes (sem o bloco), o emulador:
 *   - mostra "+ O que aprendemos" na barra do lançamento, dos números do projeto principal e dos resultados do destaque;
 *   - cria o bloco no lugar certo (abaixo dos números, abaixo dos resultados e antes da nota, no fim do card), com o
 *     texto do modelo entre colchetes para digitar por cima;
 *   - cria o bloco que falta pela importação do Copilot (campo "aprendizado" em [PROJETO PRINCIPAL], [DESTAQUE] e
 *     [LANCAMENTO n]) e só preenche quando o bloco já existe;
 *   - tira o bloco ("Tirar aprendizado") e o Desfazer devolve;
 *   - grava o bloco no arquivo salvo, que reabre com o texto editável, e o celular (320 px) não rola para o lado.
 *   Requer Node.js + Playwright:  node tests/aprendizado.e2e.js
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/aprendizado.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.join(RAIZ, "tests", "saida");
var URL_EMULADOR = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function salvarComo() {
  window.__salvos = [];
  window.showSaveFilePicker = async function (o) {
    return { name: o.suggestedName, createWritable: async function () {
      var partes = [];
      return { write: async function (b) { partes.push(await b.text()); }, close: async function () { window.__salvos.push({ nome: o.suggestedName, html: partes.join("") }); } };
    } };
  };
}

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var browser = await chromium.launch(), erros = [];
  var ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  async function abrir(arquivo) {
    var p = await ctx.newPage();
    p.on("pageerror", function (e) { erros.push(e.message); });
    p.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
    await p.goto(URL_EMULADOR); await p.evaluate(salvarComo);
    await p.setInputFiles("#arquivo", arquivo);
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 60000 });
    await p.waitForTimeout(400);
    return p;
  }
  function q(p, fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg }); }
  async function barra(p, alvo) {
    var f = await (await p.$("#edFrame")).contentFrame();
    await p.mouse.move(2, 2);
    await q(p, function (d, a) { d.querySelector(a).scrollIntoView({ block: "center" }); }, alvo);
    await f.hover(alvo, { position: { x: 8, y: 8 } }); await p.waitForTimeout(200);
    return { f: f, botoes: await q(p, function (d) { var b = d.getElementById("ed-barra"); return b.hidden ? [] : Array.prototype.map.call(b.querySelectorAll("button"), function (x) { return x.textContent; }); }) };
  }
  async function clicarNaBarra(p, f, texto) { await f.click('#ed-barra button:text-is("' + texto + '")'); await p.waitForTimeout(250); }
  function blocos(d) {
    return Array.prototype.map.call(d.querySelectorAll("table.apr[data-apr]"), function (t) {
      var c = t.querySelector("[data-campo]"), it = t.closest("[data-item]"), num = t.parentNode.querySelector('[data-item^="numero-"]');
      var nota = d.querySelector('[data-campo="destaque.nota"]');
      return { chave: t.getAttribute("data-apr"), campo: c && c.getAttribute("data-campo"), texto: c && c.textContent, editavel: !!(c && c.hasAttribute("data-ed-campo")),
        item: it && it.getAttribute("data-item"), aposNumeros: !!num, antesDaNota: !!(nota && (t.compareDocumentPosition(nota) & Node.DOCUMENT_POSITION_FOLLOWING)),
        rotulo: t.querySelector("p").textContent };
    });
  }

  var p = await abrir(path.join(RAIZ, "kit/report-exemplo.html"));
  confere((await q(p, blocos)).length === 0, "report de antes: sem bloco \"O que aprendemos\" nas campanhas");

  /* 0. formato novo ao abrir (4.13): "PROJETO PRINCIPAL" vira "CAMPANHA" (editável); números em ordem de leitura (número → título → etiqueta → referência) */
  var fmt = await q(p, function (d) {
    function ordem(k) { var it = d.querySelector('[data-item="' + k + '"]'); if (!it) return "?"; return Array.prototype.map.call(it.querySelectorAll("[data-campo]"), function (x) { return x.getAttribute("data-campo").replace(/^[a-z]+-\d+\./, ""); }).concat(it.querySelector(".var-vazia") ? ["espaco"] : []).join(">"); }
    var rot = d.querySelector('[data-campo="principal.rotulo"]');
    return { rotulo: rot && rot.textContent, editavel: !!(rot && rot.hasAttribute("data-ed-campo")), antigo: /PROJETO PRINCIPAL/.test(d.body.textContent), n1: ordem("numero-1"), r1: ordem("resultado-1"), r2: ordem("resultado-2") };
  });
  confere(fmt.rotulo === "CAMPANHA" && fmt.editavel && !fmt.antigo, "report de antes: o rótulo da capa vira CAMPANHA, editável · " + JSON.stringify(fmt.rotulo));
  confere(fmt.n1 === "valor>titulo>variacao>detalhe" && fmt.r2 === "valor>titulo>variacao>detalhe" && fmt.r1 === "valor>titulo>detalhe", "números: número → título → etiqueta → referência (sem etiqueta, a referência logo abaixo do título) · " + [fmt.n1, fmt.r1, fmt.r2].join(" | "));
  confere(/Report atualizado para o formato novo/.test(await p.$eval("#estado", function (e) { return e.textContent; })), "o emulador avisa que atualizou o report (salvar grava)");

  /* 1. lançamento: + O que aprendemos na barra do card */
  var b1 = await barra(p, '[data-campo="lancamento-1.nome"]');
  confere(b1.botoes.indexOf("+ O que aprendemos") >= 0, "barra do lançamento: + O que aprendemos · " + b1.botoes.join(" | "));
  await clicarNaBarra(p, b1.f, "+ O que aprendemos");
  var bl = await q(p, blocos);
  confere(bl.length === 1 && bl[0].campo === "lancamento-1.aprendizado" && bl[0].item === "lancamento-1" && /^\[O que a campanha ensinou/.test(bl[0].texto) && bl[0].editavel && bl[0].rotulo === "O QUE APRENDEMOS",
    "bloco criado no fim do card, com o texto do modelo e editável · " + JSON.stringify(bl[0] || {}));
  await p.keyboard.type("Card com um aprendizado curto, de exemplo."); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  confere((await q(p, blocos))[0].texto === "Card com um aprendizado curto, de exemplo.", "digitar por cima troca o texto do modelo");
  var b1b = await barra(p, '[data-campo="lancamento-1.nome"]');
  confere(b1b.botoes.indexOf("+ O que aprendemos") < 0, "com o bloco no card, o botão some da barra do lançamento");

  /* 2. números do projeto principal e resultados do destaque também oferecem o botão */
  var bn = await barra(p, '[data-campo="numero-2.titulo"]'), br = await barra(p, '[data-campo="resultado-1.titulo"]');
  confere(bn.botoes.indexOf("+ O que aprendemos") >= 0 && br.botoes.indexOf("+ O que aprendemos") >= 0, "barra dos números e dos resultados: + O que aprendemos");

  /* 3. importação do Copilot cria os blocos que faltam (e preenche o que já existe) */
  await p.mouse.move(2, 2);
  await p.click("#bImportar"); await p.waitForTimeout(200);
  await p.fill("#txtImportar", "[PROJETO PRINCIPAL]\naprendizado: Frase curta sobre o projeto, de exemplo.\n\n[DESTAQUE]\naprendizado: O destaque também ensinou algo,<br>em duas linhas.\n\n[LANCAMENTO 1]\naprendizado: Card atualizado pela importação.\n");
  await p.click("#bAplicar"); await p.waitForTimeout(600);
  var info = await p.$eval("#importarInfo", function (e) { return e.textContent; });
  bl = await q(p, blocos);
  var porChave = {}; bl.forEach(function (x) { porChave[x.chave] = x; });
  confere(/^3 campo\(s\) preenchido\(s\)/.test(info) && bl.length === 3, "importação: 3 campos, 2 blocos novos e 1 atualizado · " + info);
  confere(porChave["principal.aprendizado"] && porChave["principal.aprendizado"].aposNumeros && porChave["principal.aprendizado"].texto === "Frase curta sobre o projeto, de exemplo.", "projeto principal: bloco abaixo dos números");
  confere(porChave["destaque.aprendizado"] && porChave["destaque.aprendizado"].antesDaNota && /ensinou algo,em duas linhas/.test(porChave["destaque.aprendizado"].texto), "destaque: bloco abaixo dos resultados e antes da nota (com a quebra de linha)");
  confere(porChave["lancamento-1.aprendizado"] && porChave["lancamento-1.aprendizado"].texto === "Card atualizado pela importação.", "lançamento: o bloco que já existia foi preenchido (sem duplicar)");

  /* 3b. [SECOES] na importação (4.13): tira a seção geral "O que aprendemos"; nome que não existe é avisado; Desfazer devolve */
  function secaoAprendizados(d) {
    var w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n, out = [];
    while ((n = w.nextNode())) if (n.nodeValue.trim() === "secao:aprendizados") { for (var e = n.nextSibling; e && !(e.nodeType === 8 && /^secao:/.test(e.nodeValue.trim())); e = e.nextSibling) if (e.nodeType === 1) out.push(e.hasAttribute("data-ed-oculta")); }
    return out;
  }
  await p.fill("#txtImportar", "[SECOES]\ntirar: o que aprendemos, Seção que não existe\n");
  await p.click("#bAplicar"); await p.waitForTimeout(500);
  var infoS = await p.$eval("#importarInfo", function (e) { return e.textContent; }), sa = await q(p, secaoAprendizados);
  var marcada = await p.$eval('#secoesRep input[value="aprendizados"]', function (e) { return e.checked; });
  confere(sa.length > 0 && sa.every(Boolean) && !marcada && /Seção tirada: O que aprendemos/.test(infoS) && /Seção não encontrada: Seção que não existe/.test(infoS), "[SECOES] tirar: a seção geral sai da página (e de Seções do report); nome errado é avisado · " + infoS);
  await p.click("#bFecharImportar").catch(function () {}); await p.mouse.move(2, 2); await p.click("#bDesfazer"); await p.waitForTimeout(300);
  sa = await q(p, secaoAprendizados);
  confere(sa.length > 0 && !sa.some(Boolean) && await p.$eval('#secoesRep input[value="aprendizados"]', function (e) { return e.checked; }), "Desfazer: a seção volta");

  /* 4. tirar e desfazer */
  var bd = await barra(p, '[data-apr="destaque.aprendizado"] p');
  confere(bd.botoes.join("|") === "Tirar aprendizado", "barra do próprio bloco: Tirar aprendizado · " + bd.botoes.join(" | "));
  await clicarNaBarra(p, bd.f, "Tirar aprendizado");
  confere(!(await q(p, blocos)).some(function (x) { return x.chave === "destaque.aprendizado"; }), "Tirar aprendizado: o bloco sai");
  await p.mouse.move(2, 2); await p.click("#bDesfazer"); await p.waitForTimeout(300);
  confere((await q(p, blocos)).some(function (x) { return x.chave === "destaque.aprendizado" && x.antesDaNota; }), "Desfazer: o bloco volta no mesmo lugar");

  /* 5. salvar, reabrir e celular */
  await p.click("#bSalvar"); await p.waitForFunction(function () { return window.__salvos.length > 0; }, null, { timeout: 30000 });
  var salvo = await p.evaluate(function () { return window.__salvos[window.__salvos.length - 1]; });
  var arq = path.join(SAIDA, "aprendizado-salvo.html"); fs.writeFileSync(arq, salvo.html);
  confere((salvo.html.match(/class="apr" data-apr="/g) || []).length === 3 && !/contenteditable|data-ed-/.test(salvo.html), "arquivo salvo: os 3 blocos, sem marcas do editor");
  confere(/data-campo="principal\.rotulo"[^>]*>CAMPANHA</.test(salvo.html) && salvo.html.indexOf('data-campo="numero-1.titulo"') < salvo.html.indexOf('data-campo="numero-1.variacao"') && salvo.html.indexOf('data-campo="numero-1.variacao"') < salvo.html.indexOf('data-campo="numero-1.detalhe"') && !/var-vazia/.test(salvo.html), "arquivo salvo: CAMPANHA e os números em ordem de leitura");
  confere(/max-width:700px/.test(salvo.html) && !/max-width:620px/.test(salvo.html), "arquivo salvo: o layout de celular vale até 700 px (de 621 a 700 px não rola para o lado)");
  var p2 = await abrir(arq), bl2 = await q(p2, blocos);
  confere(bl2.length === 3 && bl2.every(function (x) { return x.editavel; }), "reaberto: os 3 blocos voltam editáveis");
  /* report salvo na 4.13 intermediária (etiqueta logo abaixo do número, espaço reservado): volta à ordem de leitura */
  var inter = salvo.html, chipN1 = (/<p class="fx" data-campo="numero-1\.variacao"[\s\S]*?<\/p>/.exec(inter) || [""])[0];
  inter = inter.replace(chipN1, "").replace(/(data-campo="numero-1\.valor"[^>]*>[^<]*<\/p>)/, "$1" + chipN1).replace(/(data-campo="resultado-1\.valor"[^>]*>[^<]*<\/p>)/, '$1<p class="fx var-vazia" aria-hidden="true" style="margin:4px 0 0 0;height:16px;line-height:16px;font-size:10px;"></p>');
  var arqI = path.join(SAIDA, "aprendizado-intermediario.html"); fs.writeFileSync(arqI, inter);
  var pI = await abrir(arqI), fI = await q(pI, function (d) { function ordem(k) { var it = d.querySelector('[data-item="' + k + '"]'); return Array.prototype.map.call(it.querySelectorAll("[data-campo]"), function (x) { return x.getAttribute("data-campo").replace(/^[a-z]+-\d+\./, ""); }).join(">"); } return { n1: ordem("numero-1"), r1: ordem("resultado-1"), vazio: d.querySelectorAll(".var-vazia").length }; });
  confere(chipN1 && fI.n1 === "valor>titulo>variacao>detalhe" && fI.r1 === "valor>titulo>detalhe" && fI.vazio === 0, "report da 4.13 intermediária: volta à ordem de leitura e o espaço reservado sai · " + JSON.stringify(fI));
  var cel = await browser.newPage({ viewport: { width: 320, height: 800 } });
  await cel.goto("file://" + arq); await cel.waitForTimeout(500);
  var larg = await cel.evaluate(function () { return document.documentElement.scrollWidth; });
  confere(larg <= 320, "celular 320 px: sem rolagem para o lado (" + larg + " px)");
  for (var wm of [640, 690]) { await cel.setViewportSize({ width: wm, height: 800 }); await cel.waitForTimeout(200); var lm = await cel.evaluate(function () { return document.documentElement.scrollWidth; }); confere(lm <= wm, wm + " px: sem rolagem para o lado (" + lm + " px)"); }
  await browser.close();
  confere(!erros.length, "sem erro na página" + (erros.length ? ": " + erros.join(" | ") : ""));
  console.log(falhas ? "\n" + falhas + " falha(s)." : "\nTudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
