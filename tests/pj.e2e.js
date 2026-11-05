/*
 * Teste de ponta a ponta do Emulador Report PJ (Santander Empresas), uso técnico, opcional.
 * Só conteúdo fictício (Janeiro 2099; dados/CORINGA-PJ.txt e dados/EXEMPLO-PJ-treinamento.txt).
 * Faz o mesmo caminho do PF (tests/emulador.e2e.js) no kit PJ e confere o que é só do PJ:
 *   aba "Emulador Report PJ" e ícone Santander + PJ · modelo em branco PJ (seções e identidade do
 *   Brand Guide Empresas) · editar texto, número, etiqueta, período · trocar imagem (retângulo
 *   vertical) · link · tirar e adicionar itens com a grade refeita (números em Preto) · tirar seção
 *   e "+ Novo tópico" · prévia no celular sem rolagem para o lado (390, 640 e 690 px) · importar
 *   conteúdo (Copilot) · salvar (.html com o ícone PJ, a marca do segmento e o título PJ) · reabrir
 *   · rascunho recuperado (e separado do PF) · e-mail-resumo com até 4 destaques no tema Empresas ·
 *   .eml (MIME, imagens dentro) · e-mail completo · PF e PJ não se misturam (cada emulador recusa o
 *   report do outro, sem mexer no que está aberto).
 *   Requer Node.js + Playwright:  node tests/pj.e2e.js [pasta-de-saida]
 *   Outro arquivo:  EMULADOR_PJ=caminho/emulador-report-pj.html node tests/pj.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida", "pj"));
var URL_PJ = "file://" + path.resolve(process.env.EMULADOR_PJ || path.join(RAIZ, "kit", "emulador-report-pj.html"));
var URL_PF = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "kit", "emulador-report.html"));
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function htmlDoEml(eml) {
  var m = /Content-Type: text\/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/.exec(eml);
  return Buffer.from(m[1].replace(/\r\n/g, ""), "base64").toString("utf8");
}
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
  var erros = [];
  async function abrirEmulador(url) {
    var p = await ctx.newPage();
    p.on("pageerror", function (e) { erros.push(e.message); });
    p.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
    p.on("dialog", function (d) { var r = p.__resposta; p.__resposta = null; if (r === null || r === undefined) d.dismiss(); else d.accept(r); });
    await p.goto(url || URL_PJ);
    await p.evaluate(salvarComo);
    return p;
  }
  async function quadro(p) {
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
    await p.waitForFunction(function () { return Math.abs(document.querySelector(".ferramentas").getBoundingClientRect().top) < 2; }, null, { timeout: 5000 });
    return (await p.$("#edFrame")).contentFrame();
  }
  async function noQuadro(p, fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg === undefined ? null : arg }); }
  async function texto(p, chave) { return noQuadro(p, function (d, k) { return d.querySelector('[data-campo="' + k + '"]').textContent.replace(/\s+/g, " ").trim(); }, chave); }
  async function escrever(p, f, chave, t) {
    await f.locator('[data-campo="' + chave + '"][data-ed-campo]').locator("visible=true").first().click();
    await p.waitForTimeout(60);
    await p.keyboard.press("Control+A");
    await p.keyboard.type(t);
    await p.keyboard.press("Enter");
  }
  async function ateBotao(p, de, c) {
    var n = Math.max(5, Math.round(Math.hypot(c.x - de.x, c.y - de.y) / 8));
    for (var k = 1; k <= n; k++) { await p.mouse.move(de.x + (c.x - de.x) * k / n, de.y + (c.y - de.y) * k / n); await p.waitForTimeout(10); }
    await p.mouse.click(c.x, c.y);
  }
  async function pontoDoAlvo(p, alvo) {
    return noQuadro(p, function (d, o) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), r = Array.prototype.map.call(d.querySelectorAll(o), function (e) { return e.getBoundingClientRect(); }).filter(function (x) { return x.width > 0 && x.height > 0; })[0];
      return { x: q.left + r.left + r.width / 2, y: q.top + r.top + r.height / 2 };
    }, alvo.replace(/\s*>>\s*visible=true$/, ""));
  }
  async function ferramenta(p, f, alvo, botao) {
    await p.mouse.move(2, 2);
    await f.hover(alvo);
    var de = await pontoDoAlvo(p, alvo);
    await p.waitForFunction(function (b) { var x = document.querySelector("#edFrame").contentDocument.getElementById("ed-barra"); return x && !x.hidden && Array.prototype.some.call(x.querySelectorAll("button"), function (y) { return y.textContent === b; }); }, botao, { timeout: 5000 });
    var c = await noQuadro(p, function (d, b) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), x = Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }).getBoundingClientRect();
      return { x: q.left + x.left + x.width / 2, y: q.top + x.top + x.height / 2 };
    }, botao);
    await ateBotao(p, de, c);
  }
  async function esperaConversao(p) { await p.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 30000 }); }
  function ordem(p) { return noQuadro(p, function (d) { var r = [], w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n; while ((n = w.nextNode())) { var m = /^\s*secao:(\w+)\s*$/.exec(n.nodeValue); if (m) r.push(m[1]); } return r.join(","); }); }
  async function grade(p, g) {
    return noQuadro(p, function (d, g2) {
      var it = Array.prototype.filter.call(d.querySelectorAll('[data-item^="' + g2 + '-"]'), function (x) { return /^[a-z]+-\d+$/.test(x.getAttribute("data-item")); });
      return { n: it.length, larguras: it.map(function (x) { return x.getAttribute("width"); }).join(","), classes: it.map(function (x) { return x.getAttribute("class"); }).join("|"),
        cores: it.map(function (x) { var v = x.querySelector('[data-campo$=".valor"]'); return v ? (/color:#EC0000/i.test(v.getAttribute("style")) ? "vermelho" : /color:#000000/i.test(v.getAttribute("style")) ? "preto" : "?") : ""; }).join(","),
        filetes: it.map(function (x) { var t = x.querySelector("td"); return t ? ((/border-top:2px solid (#[0-9A-F]{6})/i.exec(t.getAttribute("style") || "") || [])[1] || "") : ""; }).join(",") };
    }, g);
  }
  async function clicarMais(p, g) {
    await noQuadro(p, function (d, k) { d.querySelector('.ed-mais button[data-grupo="' + k + '"]').scrollIntoView({ block: "center" }); }, g);
    var c = await noQuadro(p, function (d, k) { var q = document.querySelector("#edFrame").getBoundingClientRect(), b = d.querySelector('.ed-mais button[data-grupo="' + k + '"]').getBoundingClientRect(); return { x: q.left + b.left + b.width / 2, y: q.top + b.top + b.height / 2 }; }, g);
    await p.mouse.click(c.x, c.y);
  }

  /* 1. O emulador PJ: aba, ícone e cabeçalho */
  var p = await abrirEmulador();
  var cab = await p.evaluate(function () {
    var ic = Array.prototype.map.call(document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]'), function (l) { return l.getAttribute("href"); });
    return { titulo: document.title, h1: document.querySelector("header h1").textContent, icones: ic.length, svg: decodeURIComponent(ic.filter(function (h) { return /svg/.test(h); })[0] || ""), fundo: getComputedStyle(document.querySelector("header")).backgroundColor, alt: document.querySelector(".marca-pf img").getAttribute("alt") };
  });
  confere(cab.titulo === "Emulador Report PJ" && cab.h1 === "Emulador Report PJ", "aba e cabeçalho: \"Emulador Report PJ\"");
  confere(cab.icones === 4 && />PJ</.test(cab.svg) && /#F5DECF/i.test(cab.svg) && /M 31\.5,19\.5 C 31\.4,18/.test(cab.svg), "ícone da aba Santander + PJ (a chama oficial, selo PJ com contorno Rio), embutido (funciona em qualquer computador)");
  confere(cab.fundo === "rgb(245, 222, 207)" && cab.alt === "Santander PJ", "cabeçalho do emulador em Rio, com o símbolo Santander + PJ");

  /* 2. Modelo em branco PJ */
  await p.click("#bModelo");
  var f = await quadro(p);
  var mod = await noQuadro(p, function (d) {
    return { seg: (d.querySelector('meta[name="report-segmento"]') || {}).content || "", campos: d.querySelectorAll("[data-ed-campo]").length, imgs: d.querySelectorAll("img[data-img]").length,
      principal: (function () { var i = d.querySelector('img[data-img="principal"]'); return i.getAttribute("width") + "x" + i.getAttribute("height"); })(),
      area: d.querySelector("p.brand").textContent.trim(), fundoAbertura: d.querySelector("td.px.ra").getAttribute("bgcolor"), fundoPagina: d.body.getAttribute("bgcolor"),
      layout: (d.querySelector('meta[name="report-layout"]') || {}).content || "", fundoConteudo: d.querySelector("table.container").getAttribute("bgcolor"),
      recuo: getComputedStyle(d.querySelector("td.px.ra")).borderTopWidth };
  });
  console.log("MODELO PJ: " + mod.campos + " campos editáveis, " + mod.imgs + " imagens trocáveis.");
  confere(mod.seg === "pj" && mod.campos > 80 && mod.imgs >= 15, "modelo em branco PJ aberto, todas as seções editáveis");
  confere(mod.principal === "184x230" && mod.area === "Creative Strategy PJ" && mod.fundoPagina === "#FFFFFF" && mod.fundoConteudo === "#F5DECF" && mod.fundoAbertura === "#FFFFFF" && mod.recuo === "20px" && mod.layout === "3", "identidade Empresas (5.3): fundo do HTML Branco, conteúdo Rio, abertura num painel Branco recuado, peça da visão geral em retângulo vertical (184 x 230) · " + [mod.fundoPagina, mod.fundoConteudo, mod.fundoAbertura, mod.recuo].join(" "));
  var o1 = await ordem(p);
  confere(o1.indexOf("capa,visao,resultados,lancamos,cx,transformation,aprendizados") === 0 && /foco,agenda,rodape,fim$/.test(o1), "seções do PJ na ordem: abertura, visão geral, principais resultados, campanhas, indicadores, análises, aprendizados, próximas iniciativas, encerramento · " + o1);
  var secs = await p.$$eval("#secoesRep input", function (l) { return l.map(function (i) { return i.value + ":" + i.closest("label").textContent.trim(); }); });
  confere(secs.some(function (s) { return /^visao:Visão geral/.test(s); }) && secs.some(function (s) { return /^cx:Indicadores/.test(s); }) && secs.some(function (s) { return /^transformation:Análises/.test(s); }), "Seções do report com os nomes do PJ · " + secs.join(" | "));

  /* 3. Editar texto, período, número e etiqueta */
  await escrever(p, f, "frase", "Teste PJ fictício");
  await escrever(p, f, "periodo", "JANEIRO 2099");
  var pers = await noQuadro(p, function (d) { return Array.prototype.map.call(d.querySelectorAll('[data-campo="periodo"]'), function (e) { return e.textContent.trim(); }); });
  confere(pers.length >= 2 && pers.every(function (t) { return t === "JANEIRO 2099"; }), "período: muda em todos os lugares (" + pers.length + ")");
  await escrever(p, f, "numero-1.valor", "12,5%");
  await escrever(p, f, "numero-1.titulo", "Indicador fictício A");
  await escrever(p, f, "numero-1.variacao", "▲ +25%");
  await f.locator('[data-campo="numero-2.variacao"]').locator("visible=true").first().click();
  await f.click('#ed-barra button:text-is("Cor: âmbar")');
  confere(await noQuadro(p, function (d) { var e = d.querySelector('[data-campo="numero-2.variacao"]'), c = e.matches("[data-tom]") ? e : e.querySelector("[data-tom]"); return c.getAttribute("data-tom") === "ambar"; }), "etiqueta: cor trocada para âmbar");

  /* 4. Imagem (seleção de arquivo) e link */
  var fc = await Promise.all([p.waitForEvent("filechooser"), ferramenta(p, f, 'img[data-img="principal"]', "Trocar imagem")]);
  await fc[0].setFiles(path.join(RAIZ, "assets/exemplo-pj/peca-pj-principal.png"));
  await p.waitForFunction(async function () { var i = document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="principal"]'), s = i.getAttribute("src"); if (!/^(blob:|data:)/.test(s)) return false; var b = await (await fetch(s)).blob(); return b.type === "image/jpeg"; }, null, { timeout: 10000 });
  var dimImg = await p.evaluate(async function () { var i = document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="principal"]'), im = new Image(); im.src = i.getAttribute("src"); await im.decode(); return { w: im.naturalWidth, h: im.naturalHeight, attr: i.getAttribute("width") + "x" + i.getAttribute("height") }; });
  confere(dimImg.attr === "184x230" && Math.abs(dimImg.w / dimImg.h - 184 / 230) < 0.02, "imagem trocada, recortada no retângulo vertical do PJ (" + dimImg.w + " x " + dimImg.h + ")");
  p.__resposta = "https://www.example.com/peca-ficticia-pj";
  await ferramenta(p, f, '[data-item="lancamento-1"] span[title="Link ainda não definido"]', "Colocar link");
  confere(await noQuadro(p, function (d) { return d.querySelector('[data-item="lancamento-1"] a.cta').getAttribute("href"); }) === "https://www.example.com/peca-ficticia-pj", "link colocado na campanha 1");

  /* 5. Itens: tirar e adicionar (grade refeita), números em Preto */
  /* passa o mouse no nome do card (no centro do card de baixo fica a imagem, que tem a barra dela) */
  for (var lk of ["lancamento-6", "lancamento-5", "lancamento-4"]) await ferramenta(p, f, '[data-item="' + lk + '"] [data-campo$=".nome"]', "Tirar item");
  var gl = await grade(p, "lancamento");
  confere(gl.n === 3 && gl.larguras === "184,184,184", "campanhas: 3 cards numa linha depois de tirar 3 · " + gl.larguras);
  await clicarMais(p, "numero");
  var gn = await grade(p, "numero");
  confere(gn.n === 4 && gn.larguras === "132,132,132,132" && gn.cores === "preto,preto,preto,preto" && gn.filetes === "#000000,#000000,#000000,#000000", "principais resultados: 4 em colunas iguais, valores e filetes em Preto (Empresas) · " + gn.cores);
  await ferramenta(p, f, '[data-item="numero-4"]', "Tirar item");
  gn = await grade(p, "numero");
  confere(gn.n === 3 && gn.larguras === "184,184,184" && gn.classes === "third|third|third", "de volta a 3 resultados na grade de 184 px");

  /* 6. Seções: tirar (Seções do report e alça), + Novo tópico */
  await p.click("#secEditar details summary");
  await p.uncheck('#secoesRep input[value="aprendizados"]');
  confere(!(await p.$eval('#secoesRep input[value="aprendizados"]', function (e) { return e.checked; })), "seção Aprendizados desmarcada (fica de fora do arquivo)");
  var antesTop = await ordem(p);
  await p.click("#bNovoTopico");
  await p.waitForSelector("#modal:not([hidden]) #nomeTopico");
  await p.fill("#nomeTopico", "Testes");
  await p.click('label.layout:has(input[value="lista"])');
  await p.click("#modalOk"); await p.waitForTimeout(300);
  var depoisTop = await ordem(p);
  confere(/topico/.test(depoisTop) && !/topico/.test(antesTop) && /topico[a-z]?,foco/.test(depoisTop), "+ Novo tópico: entra antes das Próximas iniciativas · " + depoisTop);
  confere(/TESTES/.test(await noQuadro(p, function (d) { var r = d.querySelector('[data-campo$=".rotulo"][data-campo^="topico"]'); return r ? r.textContent : ""; })), "tópico com o nome dado (TESTES)");

  /* 7. Celular: sem rolagem para o lado */
  await p.click('[data-ew="390px"]');
  await p.waitForFunction(function () { return document.querySelector("#edFrame").getBoundingClientRect().width <= 392; }, null, { timeout: 5000 }); await p.waitForTimeout(300);
  var cel = await noQuadro(p, function (d) { var w = d.defaultView, cw = d.documentElement.clientWidth, fora = []; Array.prototype.forEach.call(d.querySelectorAll("body *"), function (e) { var r = e.getBoundingClientRect(); if (r.width && r.right > cw + 1 && fora.length < 4) fora.push(e.tagName + "." + (e.className || e.id || "") + " " + Math.round(r.left) + "-" + Math.round(r.right)); });
    return { vaza: d.documentElement.scrollWidth - cw, num: w.getComputedStyle(d.querySelector('[data-item="numero-1"]')).display, img: Math.round(d.querySelector('img[data-img="principal"]').getBoundingClientRect().width), fora: fora.join(" | ") }; });
  confere(cel.vaza <= 0 && cel.num === "inline-block" && cel.img <= 216, "celular (390 px): sem vazar para o lado; resultados lado a lado; peça centralizada · " + JSON.stringify(cel));
  await p.click('[data-ew="100%"]'); await p.waitForTimeout(300);

  /* 8. Importar conteúdo (Copilot) */
  await p.click("#bImportar");
  await p.fill("#txtImportar", "[NUMERO 2]\nvalor: R$ 1,20\ntitulo: Indicador fictício B\ndetalhe: Referência: R$ 1,50\nvariacao: -20%\n\n[PROJETO PRINCIPAL]\nnome: Campanha Exemplo PJ A\nrotulo: Campanha do mês\n");
  await p.click("#bAplicar");
  confere(await texto(p, "numero-2.valor") === "R$ 1,20" && /▼/.test(await texto(p, "numero-2.variacao")) && await texto(p, "principal.rotulo") === "CAMPANHA DO MÊS" && await texto(p, "principal.nome") === "Campanha Exemplo PJ A", "importação: número, rótulo e nome da campanha preenchidos");

  /* 9. Salvar */
  await p.click("#bSalvar");
  await p.waitForFunction(function () { return window.__salvos.length === 1; }, null, { timeout: 15000 });
  var salvo = await p.evaluate(function () { return window.__salvos[0]; });
  fs.writeFileSync(path.join(SAIDA, salvo.nome), salvo.html);
  console.log("SALVO: " + salvo.nome + " (" + Math.round(salvo.html.length / 1024) + " KB)");
  confere(salvo.nome === "report-2099-01.html", "nome sugerido pelo período: report-2099-01.html");
  confere(/<title>Creative Strategy PJ \| Report de Janeiro 2099<\/title>/.test(salvo.html), "título do HTML: Creative Strategy PJ | Report de Janeiro 2099");
  confere(/<meta name="report-segmento" content="pj">/.test(salvo.html), "HTML salvo marcado como PJ");
  var icSalvo = (salvo.html.match(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g) || []);
  confere(icSalvo.length === 4 && icSalvo.join("").indexOf(Motor.ICONE_TAG_PJ.split("\n")[2].slice(0, 120)) >= 0 && icSalvo.every(function (l) { return /href="data:/.test(l); }) && salvo.html.indexOf(Motor.ICONE_TAG.split("\n")[0]) < 0, "ícone da aba do HTML exportado: Santander + PJ, embutido (abre em outro computador)");
  confere(salvo.html.indexOf("Teste PJ fictício") >= 0 && salvo.html.indexOf("12,5%") >= 0 && !/contenteditable|data-ed-|id="ed-barra"/.test(salvo.html), "conteúdo salvo, sem controles de edição");
  confere(!/secao:aprendizados-->\s*<tr/.test(salvo.html) && !/data-item="lancamento-5"/.test(salvo.html), "seção tirada e itens tirados ficaram de fora");
  await p.close();

  /* 10. Reabrir; o salvo no celular (página interativa) sem rolagem para o lado em 390, 640 e 690 px */
  p = await abrirEmulador();
  await p.setInputFiles("#arquivo", path.join(SAIDA, salvo.nome));
  f = await quadro(p);
  confere(await texto(p, "frase") === "Teste PJ fictício" && await texto(p, "numero-2.valor") === "R$ 1,20", "reaberto: textos e números continuam");
  for (var larg of [390, 640, 690]) {
    var pv = await ctx.newPage(); await pv.setViewportSize({ width: larg, height: 800 }); await pv.goto("file://" + path.join(SAIDA, salvo.nome)); await pv.waitForTimeout(300);
    var vz = await pv.evaluate(function () { return document.documentElement.scrollWidth - document.documentElement.clientWidth; });
    confere(vz <= 0, "HTML salvo em " + larg + " px: sem rolagem para o lado (" + vz + ")");
    await pv.close();
  }

  /* 11. Rascunho: guardado no PJ e separado do PF */
  await escrever(p, f, "frase", "Edição PJ não salva");
  await p.waitForTimeout(1700);
  await p.close({ runBeforeUnload: false });
  var pf = await abrirEmulador(URL_PF); await pf.waitForTimeout(1200);
  var pfVe = await pf.$("#recuperar:not([hidden])");
  confere(!pfVe, "o Emulador Report PF não oferece o rascunho do PJ (rascunhos separados)");
  await pf.close();
  p = await abrirEmulador();
  await p.waitForSelector("#recuperar:not([hidden])", { timeout: 5000 });
  await p.click("#bRecuperar");
  f = await quadro(p);
  confere(await texto(p, "frase") === "Edição PJ não salva", "PJ: edição recuperada depois de fechar a aba sem salvar");
  await p.close({ runBeforeUnload: false });

  /* 12. PF e PJ não se misturam */
  p = await abrirEmulador();
  if (await p.$("#recuperar:not([hidden])")) await p.click("#bDescartar");
  await p.setInputFiles("#arquivo", path.join(SAIDA, salvo.nome));
  f = await quadro(p);
  await p.setInputFiles("#arquivo", path.join(RAIZ, "kit/report-exemplo.html"));
  await p.waitForSelector("#modal:not([hidden])");
  var recusa = { t: await p.$eval("#modalTit", function (e) { return e.textContent; }), c: await p.$eval("#modalCorpo", function (e) { return e.textContent; }) };
  await p.click("#modalOk");
  confere(/report PF/.test(recusa.t) && /Emulador Report PF/.test(recusa.c) && /Nada foi alterado/.test(recusa.c), "PJ recusa um report PF e indica o Emulador Report PF · " + recusa.t);
  confere(await texto(p, "frase") === "Teste PJ fictício" && /^blob:|^data:/.test(await noQuadro(p, function (d) { return d.querySelector('img[data-img="principal"]').getAttribute("src"); })), "o report PJ aberto continua igual (textos e imagem)");
  pf = await abrirEmulador(URL_PF);
  if (await pf.$("#recuperar:not([hidden])")) await pf.click("#bDescartar");
  await pf.setInputFiles("#arquivo", path.join(SAIDA, salvo.nome));
  await pf.waitForSelector("#modal:not([hidden])");
  var recusaPF = await pf.$eval("#modalTit", function (e) { return e.textContent; });
  confere(/report PJ/.test(recusaPF) && await pf.$eval("#secEditar", function (e) { return e.hidden; }), "PF recusa um report PJ e não abre nada · " + recusaPF);
  await pf.close();

  /* 12b. Exemplo de treino PJ: indicadores do trimestre (no bloco Rio, separadores brancos, também no item novo) */
  var pe = await abrirEmulador();
  if (await pe.$("#recuperar:not([hidden])")) await pe.click("#bDescartar");
  await pe.setInputFiles("#arquivo", path.join(RAIZ, "kit/report-exemplo-pj.html"));
  await quadro(pe);
  function sepsCxt(pg) { return noQuadro(pg, function (d) { return Array.prototype.filter.call(d.querySelectorAll('[data-item^="cxt-"]'), function (i) { return /^cxt-\d+$/.test(i.getAttribute("data-item")); }).slice(1).map(function (i) { var s = i.previousElementSibling; return (/border-left:1px solid (#[0-9A-F]{6})/i.exec(s.getAttribute("style")) || [])[1]; }).join(","); }); }
  var s1 = await sepsCxt(pe);
  await clicarMais(pe, "cxt");
  var s2 = await sepsCxt(pe);
  confere(/^#F5DECF$/i.test(s1) && /^#F5DECF,#F5DECF$/i.test(s2), "indicadores do trimestre: separadores Rio no painel Branco, também no indicador novo · " + s1 + " → " + s2);
  await pe.close({ runBeforeUnload: false });

  /* 13. E-mail-resumo no tema Empresas: até 4 destaques, link, .eml */
  await esperaConversao(p);
  var marcados = await p.$$eval("#dtqEscolhidos .dtq[data-origem]", function (l) { return l.map(function (x) { return x.getAttribute("data-origem"); }); });
  confere(marcados.join(",") === "numero-1,numero-2,numero-3" && /Sugestão: os principais resultados/.test(await p.$eval("#dtqDica", function (e) { return e.textContent; })), "destaques: sugestão são os 3 principais resultados (texto do PJ)");
  var LINK = "https://www.example.com/report-ficticio-pj";
  await p.fill("#link", LINK);
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 });
  await p.click('#dtqLista button[data-origem="resultado-1"]');
  await p.waitForFunction(function () { return Array.prototype.map.call(document.querySelectorAll("#dtqEscolhidos .dtq"), function (x) { return x.getAttribute("data-origem"); }).length === 4 && document.querySelector("#bDtqNovo").disabled; }, null, { timeout: 30000 });
  confere(true, "4 destaques escolhidos: o limite (+ Informação nova bloqueado)");
  await p.waitForTimeout(1500);
  var d = await Promise.all([p.waitForEvent("download"), p.click("#bEmlRes")]);
  var arqRes = path.join(SAIDA, d[0].suggestedFilename()); await d[0].saveAs(arqRes);
  var eml = fs.readFileSync(arqRes, "latin1"), html = htmlDoEml(eml);
  confere(/^X-Unsent: 1\r\n/.test(eml) && /multipart\/related/.test(eml) && /^Subject: Creative Strategy PJ \| Report de Janeiro 2099\r\n/m.test(eml), ".eml do resumo: mensagem nova, MIME, assunto do PJ");
  var hrefs = html.match(/href="[^"]*"/g) || [];
  confere(hrefs.length === 1 && hrefs[0] === 'href="' + LINK + '"', "um único link: o botão do report completo");
  confere(/<td class="px dm-rio" bgcolor="#F5DECF"/.test(html) && /dm-txt-texto" style="margin:0;font-family:[^"]*color:#000000;">Creative Strategy PJ</.test(html) && /bgcolor="#EC0000"[^>]*><a class="cta fx dm-txt-branco"/.test(html), "tema Empresas: cabeçalho Rio com texto Preto, botão em Vermelho Santander");
  confere(!/#127277|#A6112F|#FBF1EA|#803262/i.test(html) && /SANTANDER EMPRESAS/.test(html), "resumo PJ sem as cores do PF (turquesa, rosa, Lisboa, roxo)");
  confere(/<body class="dm-branco-bg"[^>]*bgcolor="#FFFFFF">/.test(html) && /class="container dm-rio" width="680"[^>]*bgcolor="#F5DECF"/.test(html) && /class="col kpi dtq dm-branco-bg[^"]*"[^>]*bgcolor="#FFFFFF"/.test(html), "resumo PJ (5.3): fundo do e-mail Branco, conteúdo Rio, cartões Brancos");
  var cids = (html.match(/src="cid:([^"]+)"/g) || []).map(function (s) { return s.slice(9, -1); }), anexos = (eml.match(/Content-ID: <([^>]+)>/g) || []).map(function (s) { return s.slice(13, -1); });
  confere(cids.length > 0 && cids.every(function (x) { return anexos.indexOf(x) >= 0; }), cids.length + " imagem(ns) no resumo, todas dentro do .eml");
  confere(Motor.conferirHtml(html).filter(function (x) { return x.nivel === "erro"; }).length === 0, "conferência do Outlook sem erros");
  var dPng = await Promise.all([p.waitForEvent("download"), p.click("#bPngRes")]);
  confere(/\.png$/.test(dPng[0].suggestedFilename()), "imagem do resumo (.png) baixada");
  var dE = await Promise.all([p.waitForEvent("download"), p.click("#bEml")]);
  var emlC = fs.readFileSync(await dE[0].path(), "latin1"), htmlC = htmlDoEml(emlC);
  var errC = Motor.conferirHtml(htmlC).filter(function (x) { return x.nivel === "erro"; });
  fs.writeFileSync(path.join(SAIDA, "email-completo-pj.html"), htmlC);
  confere(/Creative Strategy PJ/.test(htmlC) && /#F5DECF/i.test(htmlC) && !/<script|data-campo|<link rel="icon"/.test(htmlC) && errC.length === 0, "e-mail completo (.eml): report PJ inteiro, sem script nem ícone, conferência do Outlook sem erros" +
    " · " + [/Creative Strategy PJ/.test(htmlC), /#F5DECF/i.test(htmlC), (htmlC.match(/<script|data-campo|<link rel="icon"/) || [""])[0], errC.map(function (x) { return x.msg; }).join("; ")].join(" / "));
  await p.screenshot({ path: path.join(SAIDA, "emulador-pj.png"), fullPage: true });

  confere(erros.length === 0, "sem erros no console" + (erros.length ? ": " + erros.join(" | ") : ""));
  await browser.close();
  console.log(falhas ? falhas + " FALHA(S)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
