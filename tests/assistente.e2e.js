/*
 * Teste de ponta a ponta dos recursos 4.12 do emulador (uso técnico, opcional), só com conteúdo fictício
 * (kit/report-exemplo.html, de dados/EXEMPLO-treinamento.txt):
 *   - "+ Adicionar item": tipo › onde (grupo e posição) › conteúdo › prévia na página › confirmar; "Voltar e ajustar"
 *     e "Cancelar" desfazem a prévia; campos obrigatórios; indicador, card (com imagem e link), texto, imagem,
 *     vídeo, conteúdo complementar e o Creative X trimestral (o bloco volta pelo assistente);
 *   - mover itens (← Antes / Depois →), com a grade refeita e Desfazer;
 *   - ordem das seções: ↑ / ↓ / Posição… e arrastar no painel "Seções do report" e na própria página (alça
 *     "⠿ Mover seção", linha vermelha onde vai entrar, rolagem automática, Esc cancela), capa e encerramento fixos;
 *   - leveza do arrasto: nada da página muda enquanto arrasta (só a linha), também com o processador 4x mais lento;
 *   - a ordem e os itens novos vão no arquivo salvo, voltam ao reabrir, e o e-mail-resumo e o celular seguem certos.
 *   Requer Node.js + Playwright:  node tests/assistente.e2e.js [pasta-de-saida]
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/assistente.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var URL_EMULADOR = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var EXEMPLO = path.join(RAIZ, "kit/report-exemplo.html");
var IMG = path.join(RAIZ, "assets/exemplo/peca-exemplo-2.png"), IMG2 = path.join(RAIZ, "assets/exemplo/print-exemplo.png"), VIDEO = path.join(RAIZ, "assets/exemplo/video-exemplo.webm");
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
  var browser = await chromium.launch();
  var ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  var erros = [], fase = "";
  async function abrir(arquivo) {
    var p = await ctx.newPage();
    p.on("pageerror", function (e) { erros.push(fase + ": " + e.message); });
    p.on("console", function (m) { if (m.type() === "error") erros.push(fase + ": console: " + m.text()); });
    p.on("dialog", function (d) { d.dismiss(); });
    await p.goto(URL_EMULADOR); await p.evaluate(salvarComo);
    await p.setInputFiles("#arquivo", arquivo);
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
    await p.waitForTimeout(400);
    return p;
  }
  function noQuadro(p, fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg }); }
  function textos(p, prefixo) { return noQuadro(p, function (d, pre) { return Array.prototype.map.call(d.querySelectorAll('[data-item^="' + pre + '-"]'), function (x) { var v = x.querySelector('[data-campo$=".valor"], [data-campo$=".nome"], [data-campo$=".titulo"], [data-campo$=".data"]'); return x.getAttribute("data-item") + "=" + (v ? v.textContent.replace(/\s+/g, " ").trim() : ""); }).filter(function (t) { return new RegExp("^" + pre + "-\\d+=").test(t); }); }, prefixo); }
  async function passo(p) { await p.click("#assistOk"); await p.waitForTimeout(250); }
  async function tipo(p, id) { await p.click("#bAdicionarItem"); await p.waitForSelector("#assist:not([hidden])"); await p.click('label:has(> input[name="tipoItem"][value="' + id + '"])'); await passo(p); }
  async function previa(p) { await p.click("#assistOk"); await p.waitForSelector("#previaItem:not([hidden])", { timeout: 20000 }); await p.waitForTimeout(300); }
  function ordem(p) { return noQuadro(p, function (d) { var r = [], w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n; while ((n = w.nextNode())) { var m = /^\s*secao:(\w+)\s*$/.exec(n.nodeValue); if (m) r.push(m[1]); } return r.join(","); }); }
  function pilulas(p) { return noQuadro(p, function (d) { return Array.prototype.filter.call(d.querySelectorAll("span"), function (s) { return /border-radius:\s*999px;\s*padding:\s*0(px)? 7px;\s*letter-spacing:\s*1px/.test(s.getAttribute("style") || "") && /^\d{2}$/.test(s.textContent.trim()); }).map(function (s) { return s.textContent.trim() + " " + s.parentNode.textContent.replace(/\s+/g, " ").trim().slice(3, 22); }); }); }

  /* ================= 1. + Adicionar item ================= */
  fase = "assistente";
  var p = await abrir(EXEMPLO);
  await p.click("#bAdicionarItem"); await p.waitForSelector("#assist:not([hidden])");
  var tipos = await p.$$eval('input[name="tipoItem"]', function (l) { return l.map(function (x) { return x.value + (x.disabled ? "(x)" : ""); }); });
  confere(tipos.join(",") === "indicador,card,texto,destaque,imagem,video,complementar", "assistente: os 7 tipos, todos com lugar neste report · " + tipos.join(","));
  confere(/Passo 1 de 4/.test(await p.$eval("#assistPasso", function (e) { return e.textContent; })), "assistente: passo 1 de 4");
  await p.click("#assistOk"); await p.waitForTimeout(150);
  confere(/Escolha o tipo/.test(await p.$eval("#assistErro", function (e) { return e.textContent; })), "sem escolher o tipo: avisa e não avança");
  await p.click("#assistCancela");

  /* indicador na capa, na 2ª posição */
  var antesNum = await textos(p, "numero");
  await tipo(p, "indicador");
  var destinos = await p.$$eval('input[name="destino"]', function (l) { return l.map(function (x) { return x.value + (x.disabled ? "(x)" : ""); }); });
  confere(destinos.indexOf("numero") >= 0 && destinos.indexOf("cxt(x)") >= 0, "indicador: capa livre; Creative X trimestral cheio (3 de 3) aparece bloqueado · " + destinos.join(","));
  await p.check('input[name="destino"][value="numero"]'); await p.selectOption("#posItem", "1"); await passo(p);
  var campos = await p.$$eval("#assistCorpo input[type=text], #assistCorpo textarea, #assistCorpo select", function (l) { return l.map(function (x) { return x.id; }); });
  confere(campos.join(",") === "aC-valor,aC-titulo,aC-detalhe,aC-variacao,aCor-variacao", "indicador: campos do componente (valor, título, detalhe, variação e a cor) · " + campos.join(","));
  await p.click("#assistOk"); await p.waitForTimeout(150);
  confere(/Valor/.test(await p.$eval("#assistErro", function (e) { return e.textContent; })) && !(await p.$eval("#assist", function (e) { return e.hidden; })), "indicador sem valor: avisa e não aplica");
  await p.fill("#aC-valor", "42%"); await p.fill("#aC-titulo", "Indicador novo"); await p.fill("#aC-detalhe", "Base: 30%"); await p.fill("#aC-variacao", "+12 p.p.");
  await previa(p);
  var depoisNum = await textos(p, "numero");
  var est = await noQuadro(p, function (d) { var x = d.querySelector('[data-item="numero-2"]'), ch = x.querySelector('[data-campo="numero-2.variacao"] [data-tom]'); return { cls: x.className, w: x.getAttribute("width"), novo: x.classList.contains("ed-novo"), chip: ch ? ch.textContent + "|" + ch.getAttribute("data-tom") : "", w1: d.querySelector('[data-item="numero-1"]').getAttribute("width") }; });
  confere(depoisNum.length === antesNum.length + 1 && depoisNum[1] === "numero-2=42%", "prévia: o indicador entra na 2ª posição · " + depoisNum.join(" | "));
  confere(est.novo && est.w === "132" && est.w1 === "132" && est.cls.split(" ")[0] === "half" && est.chip === "▲ +12 p.p.|verde", "prévia: destacado na página; 4 números em 4 colunas iguais (132 px); variação verde com ▲ · " + JSON.stringify(est));
  confere(/Prévia/.test(await p.$eval("#previaTxt", function (e) { return e.textContent; })), "barra da prévia com Confirmar / Voltar e ajustar / Cancelar");
  await p.click("#previaOk"); await p.waitForTimeout(200);
  confere(!(await noQuadro(p, function (d) { return !!d.querySelector(".ed-novo"); })) && /item adicionado/.test(await p.$eval("#estado", function (e) { return e.textContent; })), "confirmado: o destaque sai e o estado avisa");

  /* card com imagem e link; Voltar e ajustar mantém o que foi preenchido */
  var antesLanc = await textos(p, "lancamento");
  await tipo(p, "card"); await p.check('input[name="destino"][value="lancamento"]'); await passo(p);
  await p.fill("#aC-status", "No ar"); await p.selectOption("#aCor-status", "verde"); await p.fill("#aC-nome", "Card novo"); await p.fill("#aC-texto", "Texto do card novo.");
  await p.setInputFiles("#aImg", IMG); await p.fill("#aDesc", "Peça de exemplo nova"); await p.fill("#aUrl", "https://www.example.com/peca-nova");
  await previa(p);
  var card = await noQuadro(p, function (d) { var it = Array.prototype.filter.call(d.querySelectorAll('[data-item^="lancamento-"]'), function (x) { return /Card novo/.test(x.textContent); })[0]; if (!it) return null; var im = it.querySelector("img[data-img]"), a = it.querySelector("a.cta"), st = it.querySelector('[data-campo$=".status"]'); return { item: it.getAttribute("data-item"), src: im ? im.getAttribute("src").slice(0, 5) : "", alt: im ? im.alt : "", href: a ? a.getAttribute("href") : "", status: st ? st.textContent.trim() : "" }; });
  confere(card && card.src === "blob:" && card.alt === "Peça de exemplo nova" && card.href === "https://www.example.com/peca-nova" && /● No ar/.test(card.status), "card: imagem escolhida (otimizada, fora do texto), descrição, link e status verde · " + JSON.stringify(card));
  await p.click("#previaAjustar"); await p.waitForSelector("#assist:not([hidden])");
  confere((await textos(p, "lancamento")).length === antesLanc.length && await p.$eval("#aC-nome", function (e) { return e.value; }) === "Card novo", "Voltar e ajustar: a prévia sai da página e os campos continuam preenchidos");
  await p.fill("#aC-nome", "Card ajustado"); await previa(p); await p.click("#previaOk");
  var lanc = await textos(p, "lancamento");
  confere(lanc.length === antesLanc.length + 1 && /Card ajustado/.test(lanc[lanc.length - 1]), "card ajustado e confirmado, no fim do grupo · " + lanc.slice(-1));

  /* texto: aprendizado cheio (3) bloqueado; agenda; Cancelar desfaz */
  var antesAg = await textos(p, "agenda"), nAp = (await textos(p, "aprendizado")).length;
  await tipo(p, "texto");
  var dt = await p.$$eval('input[name="destino"]', function (l) { return l.map(function (x) { return x.value + (x.disabled ? "(x)" : ""); }); });
  confere(dt.indexOf(nAp >= 3 ? "aprendizado(x)" : "aprendizado") >= 0 && dt.indexOf("agenda") >= 0, "texto: O que aprendemos (" + nAp + " de 3) e agenda como destinos · " + dt.join(","));
  await p.check('input[name="destino"][value="agenda"]'); await p.selectOption("#posItem", "0"); await passo(p);
  await p.fill("#aC-data", "30 NOV"); await p.fill("#aC-titulo", "Evento novo"); await previa(p);
  confere((await textos(p, "agenda"))[0] === "agenda-1=30 NOV", "agenda: entra na 1ª posição");
  await p.click("#previaCancela"); await p.waitForTimeout(200);
  confere(JSON.stringify(await textos(p, "agenda")) === JSON.stringify(antesAg), "Cancelar: a página volta como estava");

  /* imagem num item, conteúdo complementar (link) e vídeo */
  var nImgs = await noQuadro(p, function (d) { return d.querySelectorAll('[data-item="transformation-1"] img[data-img]').length; });
  await tipo(p, "imagem");
  var opImg = await p.$$eval("#alvoItem option", function (l) { return l.map(function (o) { return o.textContent; }); });
  var iT = opImg.findIndex(function (t) { return /^Transformation Hub/.test(t); });
  await p.selectOption("#alvoItem", String(iT)); await passo(p);
  await p.setInputFiles("#aImg", IMG2); await p.click("#assistOk"); await p.waitForTimeout(150);
  confere(/descrição/.test(await p.$eval("#assistErro", function (e) { return e.textContent; })), "imagem sem descrição: avisa");
  await p.fill("#aDesc", "Print novo"); await previa(p); await p.click("#previaOk");
  confere(await noQuadro(p, function (d) { return d.querySelectorAll('[data-item="transformation-1"] img[data-img]').length; }) === nImgs + 1, "imagem: entra no item escolhido (" + opImg[iT] + ")");
  await tipo(p, "complementar");
  var opC = await p.$$eval("#alvoItem option", function (l) { return l.map(function (o) { return o.textContent; }); });
  await p.selectOption("#alvoItem", String(opC.findIndex(function (t) { return /destaque/.test(t); }))); await passo(p);
  await p.fill("#aRot", "Plano do teste"); await p.fill("#aUrl", "https://www.example.com/plano"); await previa(p); await p.click("#previaOk");
  confere(await noQuadro(p, function (d) { var a = Array.prototype.filter.call(d.querySelectorAll('[data-ed-bloco="destaque"] a'), function (x) { return /Plano do teste/.test(x.textContent); })[0]; return a ? a.getAttribute("href") : ""; }) === "https://www.example.com/plano", "conteúdo complementar: link novo no destaque");
  await tipo(p, "video");
  var opV = await p.$$eval("#alvoItem option", function (l) { return l.map(function (o) { return o.textContent; }); });
  var iV = opV.findIndex(function (t) { return /Também neste mês/.test(t) && !/trocar/.test(t); });
  await p.selectOption("#alvoItem", String(iV)); await passo(p); await p.setInputFiles("#aVid", VIDEO); await previa(p); await p.click("#previaOk");
  confere(await noQuadro(p, function (d) { return d.querySelectorAll('img[data-img^="lancamento-"][data-video]').length; }) >= 1, "vídeo: a peça escolhida vira vídeo (" + opV[iV] + ")");

  /* Creative X trimestral: tirar o bloco e trazer de volta pelo assistente */
  await noQuadro(p, function (d) { d.querySelector('[data-item="cx-trimestre"]').scrollIntoView({ block: "center" }); });
  var f = await (await p.$("#edFrame")).contentFrame();
  await p.mouse.move(2, 2); await f.hover('[data-item="cx-trimestre"] [data-campo="cxt.texto"]', { position: { x: 4, y: 4 } }); await p.waitForTimeout(200);
  var bts = await noQuadro(p, function (d) { return Array.prototype.map.call(d.querySelectorAll("#ed-barra button"), function (b) { return b.textContent; }); });
  await noQuadro(p, function (d) { Array.prototype.filter.call(d.querySelectorAll("#ed-barra button"), function (b) { return b.textContent === "Tirar trimestral"; })[0].click(); });
  var semTri = await noQuadro(p, function (d) { return !d.querySelector('[data-item="cx-trimestre"]') && !d.querySelector('[data-campo="cx.rotulo"]'); });
  confere(bts.indexOf("Tirar trimestral") >= 0 && bts.indexOf("+ Imagem") < 0 && semTri, "Creative X: \"Tirar trimestral\" tira o bloco e o rótulo MENSAL · " + bts.join(","));
  await tipo(p, "indicador");
  var lTri = await p.$eval('label:has(input[name="destino"][value="cxt"])', function (e) { return e.textContent; });
  await p.check('input[name="destino"][value="cxt"]'); await passo(p);
  await p.fill("#aC-valor", "60%"); await p.fill("#aC-titulo", "Indicador trimestral"); await p.fill("#aC-variacao", "-3 p.p."); await previa(p);
  var tri = await noQuadro(p, function (d) { var b = d.querySelector('[data-item="cx-trimestre"]'), ch = d.querySelector('[data-campo="cxt-1.variacao"] [data-tom]'); return { bloco: !!b, n: d.querySelectorAll('[data-item^="cxt-"]').length, rot: (d.querySelector('[data-campo="cx.rotulo"]') || {}).textContent, chip: ch ? ch.textContent + "|" + ch.getAttribute("data-tom") : "", w: (d.querySelector('[data-item="cxt-1"]') || { getAttribute: function () { return ""; } }).getAttribute("width") }; });
  confere(/bloco trimestral entra junto/.test(lTri) && tri.bloco && tri.n === 1 && /^MENSAL · /.test(tri.rot) && tri.chip === "▼ −3 p.p.|ambar" && tri.w === "600", "trimestral pelo assistente: o bloco volta com 1 indicador, rótulo MENSAL e variação âmbar · " + JSON.stringify(tri));
  await p.click("#previaOk"); await p.waitForTimeout(200);
  await p.click("#bDesfazer"); await p.waitForTimeout(200);
  confere(await noQuadro(p, function (d) { return !d.querySelector('[data-item="cx-trimestre"]') && !d.querySelector('[data-campo="cx.rotulo"]'); }), "Desfazer: o bloco trimestral (inteiro) sai de uma vez");
  await p.click("#bDesfazer"); await p.waitForTimeout(200);
  confere(await noQuadro(p, function (d) { return d.querySelectorAll('[data-item^="cxt-"]').length === 3 && !!d.querySelector('[data-campo="cx.rotulo"]'); }), "Desfazer de novo: o trimestral original (3 indicadores) volta");

  /* ================= 2. mover itens ================= */
  fase = "mover itens";
  var n0 = await textos(p, "numero");
  await noQuadro(p, function (d) { d.querySelector('[data-item="numero-1"]').scrollIntoView({ block: "center" }); });
  await p.mouse.move(2, 2); await f.hover('[data-item="numero-1"]', { position: { x: 30, y: 60 } }); await p.waitForTimeout(200);
  var bm = await noQuadro(p, function (d) { return Array.prototype.map.call(d.querySelectorAll("#ed-barra button"), function (b) { return b.textContent; }); });
  confere(bm.indexOf("Depois →") >= 0 && bm.indexOf("← Antes") < 0, "barra do 1º indicador: Depois → (sem ← Antes) · " + bm.join(","));
  await noQuadro(p, function (d) { Array.prototype.filter.call(d.querySelectorAll("#ed-barra button"), function (b) { return b.textContent === "Depois →"; })[0].click(); });
  var n1 = await textos(p, "numero"), cor = await noQuadro(p, function (d) { return [d.querySelector('[data-campo="numero-1.valor"]').style.color, d.querySelector('[data-campo="numero-2.valor"]').style.color]; });
  confere(n1[0].split("=")[1] === n0[1].split("=")[1] && n1[1].split("=")[1] === n0[0].split("=")[1] && /236, 0, 0|#EC0000/i.test(cor[0]) && !/236, 0, 0|#EC0000/i.test(cor[1]), "Depois →: troca com o vizinho; o 1º continua em vermelho (grade refeita) · " + n1.slice(0, 2).join(" | "));
  await p.click("#bDesfazer"); await p.waitForTimeout(150);
  confere(JSON.stringify(await textos(p, "numero")) === JSON.stringify(n0), "Desfazer: a ordem volta");
  var l0 = await textos(p, "lancamento");
  await noQuadro(p, function (d) { d.querySelector('[data-item="lancamento-3"]').scrollIntoView({ block: "center" }); });
  await p.mouse.move(2, 2); await f.hover('[data-item="lancamento-3"] [data-campo="lancamento-3.nome"]', { position: { x: 3, y: 3 } }); await p.waitForTimeout(200);
  await noQuadro(p, function (d) { Array.prototype.filter.call(d.querySelectorAll("#ed-barra button"), function (b) { return b.textContent === "Depois →"; })[0].click(); });
  var l1 = await textos(p, "lancamento"), linhas = await noQuadro(p, function (d) { return Array.prototype.map.call(d.querySelectorAll('[data-item^="lancamento-"]'), function (x) { return x.parentNode.rowIndex + ":" + x.getAttribute("width"); }); });
  confere(l1[3].split("=")[1] === l0[2].split("=")[1] && linhas.every(function (x) { return /:184$/.test(x); }), "lançamento muda de linha (3º → 4º): cartões de 184 px, 3 por linha · " + linhas.join(" "));

  /* ================= 3. ordem das seções ================= */
  fase = "seções";
  await p.click("#secEditar details summary");
  var o0 = await ordem(p), linhasPainel = await p.$$eval(".secaoRep", function (l) { return l.map(function (x) { return x.getAttribute("data-id"); }); });
  confere(linhasPainel.indexOf("capa") < 0 && linhasPainel.indexOf("rodape") < 0 && linhasPainel[0] === "lancamos", "painel: só as seções que mudam de lugar (capa e encerramento fixos) · " + linhasPainel.join(","));
  await p.click('.secaoRep[data-id="lancamos"] button[data-a="desce"]'); await p.waitForTimeout(200);
  var o1 = await ordem(p), pl = await pilulas(p);
  confere(/capa,cx,lancamos,/.test(o1) && /^02 CREATIVE X/.test(pl[1]) && /^03 O QUE LANÇAMOS/.test(pl[2]), "↓ no painel: O que lançamos desce; os números das seções são refeitos · " + pl.slice(1, 3).join(" | "));
  confere(await p.evaluate(function () { return document.activeElement && document.activeElement.getAttribute("data-a") === "desce" && document.activeElement.closest(".secaoRep").getAttribute("data-id") === "lancamos"; }), "teclado: depois de mover, o foco segue no mesmo botão da seção");
  await p.click("#bDesfazer"); await p.waitForTimeout(150);
  confere(await ordem(p) === o0, "Desfazer: a ordem das seções volta");
  await p.click('.secaoRep[data-id="cx"] button[data-a="pos"]'); await p.waitForSelector("#modal:not([hidden])");
  await p.selectOption("#posSecao", "agenda"); await p.click("#modalOk"); await p.waitForTimeout(250);
  confere(/aprendizados,foco,cx,agenda,rodape/.test(await ordem(p)), "Posição…: Creative X vai para antes de Também vem aí · " + await ordem(p));
  await p.click("#bDesfazer"); await p.waitForTimeout(150);

  /* arrastar no painel */
  await p.waitForTimeout(900); await p.$eval("#secoesRep", function (e) { e.scrollIntoView({ block: "center" }); }); await p.waitForTimeout(300);
  var h1 = await p.$('.secaoRep[data-id="cx"] .pegaRep'), alvoP = await p.$('.secaoRep[data-id="aprendizados"]');
  var b1 = await h1.boundingBox(), b2 = await alvoP.boundingBox();
  await p.mouse.move(b1.x + 5, b1.y + 5); await p.mouse.down();
  for (var k = 1; k <= 10; k++) await p.mouse.move(b1.x + 5, b1.y + 5 + (b2.y + b2.height * 0.8 - b1.y - 5) * k / 10);
  var ind = await p.evaluate(function () { var l = document.querySelector(".soltaAqui"); return l && !l.hidden; });
  await p.mouse.up(); await p.waitForTimeout(250);
  confere(ind && /aprendizados,cx,/.test(await ordem(p)), "arrastar no painel: linha vermelha mostra o lugar; Creative X vai para depois de O que aprendemos · " + await ordem(p));
  await p.click("#bDesfazer"); await p.waitForTimeout(150);

  /* arrastar na página: alça, linha, rolagem automática, Esc */
  async function alca(id) {
    await noQuadro(p, function (d, i) { var w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n; while ((n = w.nextNode())) if (n.nodeValue.trim() === "secao:" + i) { var e = n.nextSibling; while (e.nodeType !== 1) e = e.nextSibling; e.scrollIntoView({ block: "start" }); return; } }, id);
    await p.evaluate(function () { window.scrollBy(0, -260); }); await p.waitForTimeout(100);
    var r = await noQuadro(p, function (d, i) { var w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n; while ((n = w.nextNode())) if (n.nodeValue.trim() === "secao:" + i) { var e = n.nextSibling; while (e.nodeType !== 1) e = e.nextSibling; var b = e.getBoundingClientRect(); return { x: b.left + 120, y: b.top + 18 }; } }, id);
    var fb = await (await p.$("#edFrame")).boundingBox();
    await p.mouse.move(fb.x + r.x, fb.y + r.y + 20); await p.mouse.move(fb.x + r.x, fb.y + r.y); await p.waitForTimeout(150);
    return noQuadro(p, function (d) { var a = d.getElementById("ed-secao"); if (a.hidden) return null; var b = a.querySelector(".pega").getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, rotulo: a.getAttribute("aria-label") }; });
  }
  var a1 = await alca("transformation");
  confere(a1 && /Transformation Hub/.test(a1.rotulo), "na página: ao passar numa seção, aparece a alça \"⠿ Mover seção\" (com ↑ ↓ Posição…)");
  var a0 = await alca("capa");
  confere(!a0, "capa (e encerramento): sem alça, não mudam de lugar");
  a1 = await alca("transformation"); await p.waitForTimeout(1800);
  /* conta tudo o que muda na página durante o arrasto (só a linha pode mudar) */
  await noQuadro(p, function (d) { window.__mut = 0; var mo = new MutationObserver(function (l) { l.forEach(function (m) { var t = m.target.nodeType === 1 ? m.target : m.target.parentNode, soLinha = m.type === "childList" && Array.prototype.every.call(m.addedNodes, function (x) { return x.id === "ed-solta"; }) && Array.prototype.every.call(m.removedNodes, function (x) { return x.id === "ed-solta"; }); if (!soLinha && !t.closest("#ed-solta") && !(m.type === "attributes" && /^(class|style|hidden)$/.test(m.attributeName) && (t === d.documentElement || t.classList.contains("ed-arrastando") || t.id === "ed-secao" || t.id === "ed-barra"))) { d.defaultView.__mut = (d.defaultView.__mut || 0) + 1; (d.defaultView.__mutl = d.defaultView.__mutl || []).push(m.type + ":" + (m.attributeName || "") + ":" + t.nodeName + "#" + (t.id || "") + "." + (t.className || "") + ":" + Array.prototype.map.call(m.addedNodes || [], function (x) { return x.nodeName + "#" + (x.id || ""); }).join("+") + "/" + Array.prototype.map.call(m.removedNodes || [], function (x) { return x.nodeName + "#" + (x.id || ""); }).join("+")); } }); }); mo.observe(d.body, { subtree: true, childList: true, attributes: true, characterData: true }); d.defaultView.__mo = mo; d.defaultView.__mut = 0; });
  var cdp = await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  var fb2 = await (await p.$("#edFrame")).boundingBox();
  await p.mouse.move(fb2.x + a1.x, fb2.y + a1.y); await p.mouse.down();
  var t0 = Date.now(), alvoY = 860;
  for (var s = 1; s <= 30; s++) await p.mouse.move(fb2.x + a1.x, fb2.y + a1.y + (alvoY - (fb2.y + a1.y)) * s / 30);
  /* parado perto da borda de baixo: a janela rola sozinha até o fim */
  var y0 = await p.evaluate(function () { return window.scrollY; }); await p.waitForTimeout(2500);
  var y1 = await p.evaluate(function () { return window.scrollY; });
  var linhaTxt = await noQuadro(p, function (d) { var l = d.getElementById("ed-solta"); return l ? l.textContent : ""; });
  var mut = await noQuadro(p, function (d) { return d.defaultView.__mut; }), mutl = await noQuadro(p, function (d) { return (d.defaultView.__mutl || []).slice(0, 6).join(" | "); }), dt2 = Date.now() - t0;
  await p.mouse.up(); await p.waitForTimeout(400);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await noQuadro(p, function (d) { d.defaultView.__mo.disconnect(); });
  var o2 = await ordem(p);
  confere(y1 > y0 && /por último, antes do encerramento/.test(linhaTxt) && /,transformation,rodape,fim$/.test(o2), "arrastar na página (CPU 4x mais lenta): rola sozinho, a linha diz onde entra e a seção vai para o fim · " + linhaTxt + " · " + o2);
  confere(mut === 0, "leve: enquanto arrasta, nada da página muda (só a linha) · mudanças = " + mut + (mut ? " (" + mutl + ")" : "") + " · " + dt2 + " ms");
  var pl2 = await pilulas(p);
  confere(/TRANSFORMATION/.test(pl2[pl2.length - 1]), "a última seção numerada agora é o Transformation Hub · " + pl2.slice(-1));
  /* Esc cancela */
  var a2 = await alca("aprendizados"), fb3 = await (await p.$("#edFrame")).boundingBox(), o3 = await ordem(p);
  await p.mouse.move(fb3.x + a2.x, fb3.y + a2.y); await p.mouse.down(); await p.mouse.move(fb3.x + a2.x, fb3.y + a2.y + 120); await p.keyboard.press("Escape"); await p.mouse.up(); await p.waitForTimeout(200);
  confere(await ordem(p) === o3 && !(await noQuadro(p, function (d) { return !!d.getElementById("ed-solta") || !!d.querySelector(".ed-arrastando"); })), "Esc cancela o arrasto: nada muda");
  /* ↑ na alça */
  await alca("foco");
  await noQuadro(p, function (d) { d.querySelector('#ed-secao button[data-a="sobe"]').click(); }); await p.waitForTimeout(200);
  confere(/,foco,aprendizados,/.test(await ordem(p)), "↑ na alça: Foco sobe uma posição · " + await ordem(p));

  /* ================= 4. salvar, reabrir, e-mail e celular ================= */
  fase = "salvar";
  var oFinal = await ordem(p), nFinal = await textos(p, "numero");
  await p.click("#bSalvar"); await p.waitForFunction(function () { return window.__salvos.length >= 1; }, null, { timeout: 30000 });
  var salvo = await p.evaluate(function () { return window.__salvos[window.__salvos.length - 1]; });
  var arq = path.join(SAIDA, "assistente-salvo.html"); fs.writeFileSync(arq, salvo.html);
  confere(!/ed-novo|ed-movida|ed-arrastando|ed-movendo|id="ed-secao"|id="ed-solta"|data-editor/.test(salvo.html), "arquivo salvo sem marcas do editor (destaque, alça, linha)");
  await p.fill("#link", "https://www.example.com/report-ficticio"); await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 40000 });
  confere(true, "e-mail-resumo liberado com o link https");
  await p.close({ runBeforeUnload: false });
  var p2 = await abrir(arq);
  confere(await ordem(p2) === oFinal && JSON.stringify(await textos(p2, "numero")) === JSON.stringify(nFinal), "reaberto: a ordem das seções e os itens novos continuam");
  await p2.click('.tabs button[data-ew="390px"]'); await p2.waitForTimeout(600);
  var lg = await noQuadro(p2, function (d) { return [d.documentElement.scrollWidth, d.documentElement.clientWidth]; });
  confere(lg[0] <= lg[1], "celular (390 px) depois das mudanças: sem rolagem para o lado · " + lg.join(" / "));
  await p2.close({ runBeforeUnload: false });

  await browser.close();
  confere(!erros.length, "sem erro no console" + (erros.length ? ": " + erros.slice(0, 5).join(" | ") : ""));
  console.log(falhas ? "\n" + falhas + " falha(s)." : "\nTudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
