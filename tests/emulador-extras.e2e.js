/*
 * Teste de ponta a ponta dos recursos 4.6 do emulador (uso técnico, opcional), só com conteúdo fictício:
 *   + Link e + Imagem em qualquer item (projeto, lançamento, destaque, "foi bem"…), até 3 imagens por item,
 *   tirar link/imagem, Desfazer, e a seção reservada "Novo tópico" (ex.: Testes): desligada no modelo em
 *   branco, ligada em "Seções do report", acrescentada numa página que não tem, com a numeração refeita.
 *   Requer Node.js + Playwright:  node tests/emulador-extras.e2e.js [pasta-de-saida]
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/emulador-extras.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var URL_EMULADOR = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var IMG = path.join(RAIZ, "assets/exemplo/print-exemplo.png"), IMG2 = path.join(RAIZ, "assets/exemplo/peca-exemplo-1.png");
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
  async function abrirEmulador() {
    var p = await ctx.newPage();
    p.__respostas = [];
    p.on("pageerror", function (e) { erros.push(fase + ": " + e.message); });
    p.on("console", function (m) { if (m.type() === "error") erros.push(fase + ": console: " + m.text()); });
    /* janelas de pergunta (prompt): respondidas na ordem; null = Cancelar */
    p.on("dialog", function (d) { var r = p.__respostas.shift(); if (r === null || r === undefined) d.dismiss(); else d.accept(r); });
    await p.goto(URL_EMULADOR);
    await p.evaluate(salvarComo);
    return p;
  }
  async function quadro(p) {
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
    await p.waitForTimeout(300);
    return (await p.$("#edFrame")).contentFrame();
  }
  async function noQuadro(p, fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg === undefined ? null : arg }); }
  async function botoes(p, f, alvo) {
    await p.mouse.move(2, 2);
    /* rolar pela página do emulador (o quadro não roda script: o do próprio Playwright seria bloqueado) */
    await noQuadro(p, function (d, a) { d.querySelector(a).scrollIntoView({ block: "center" }); }, alvo);
    await f.hover(alvo, { position: { x: 6, y: 6 } });
    await p.waitForTimeout(150);
    return noQuadro(p, function (d) { var b = d.getElementById("ed-barra"); return b.hidden ? [] : Array.prototype.map.call(b.querySelectorAll("button"), function (x) { return x.textContent; }); });
  }
  async function ferramenta(p, f, alvo, botao) {
    var lista = await botoes(p, f, alvo);
    if (lista.indexOf(botao) < 0) throw new Error("sem o botão \"" + botao + "\" em " + alvo + " (há: " + lista.join(", ") + ")");
    var c = await noQuadro(p, function (d, b) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), x = Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }).getBoundingClientRect();
      return { x: q.left + x.left + x.width / 2, y: q.top + x.top + x.height / 2 };
    }, botao);
    await p.mouse.click(c.x, c.y);
  }
  async function comArquivo(p, f, alvo, botao, arquivo) {
    var fc = await Promise.all([p.waitForEvent("filechooser"), ferramenta(p, f, alvo, botao)]);
    await fc[0].setFiles(arquivo);
  }
  function pilulas(p) {
    return noQuadro(p, function (d) {
      return Array.prototype.filter.call(d.querySelectorAll("span"), function (s) { return /border-radius:999px;padding:0 7px;letter-spacing:1px/.test(s.getAttribute("style") || "") && /^\d{2}$/.test(s.textContent) && !s.closest("[data-ed-oculta]"); }).map(function (s) { return s.textContent; }).join(",");
    });
  }
  /* escrever num campo: o mouse sai do item antes (a barra de botões some), como uma pessoa faria */
  async function escrever(p, f, chave, texto) {
    await p.mouse.move(2, 2); await p.waitForTimeout(900);
    await f.locator('[data-campo="' + chave + '"][data-ed-campo]').first().click({ position: { x: 4, y: 6 } });
    await p.waitForTimeout(150);
    await p.keyboard.press("Control+A"); await p.keyboard.type(texto);
    if (process.env.DEPURAR) console.log("  [" + chave + "] " + await noQuadro(p, function (d) { return (d.activeElement.getAttribute("data-campo") || d.activeElement.tagName) + " = " + d.activeElement.textContent; }));
    await p.keyboard.press("Enter");
  }
  function emOrdem(lista) { return lista.split(",").every(function (x, i) { return +x === i + 1; }); }
  async function imagensDe(p, chave) {
    return noQuadro(p, function (d, k) { return Array.prototype.map.call(d.querySelectorAll('img[data-img^="' + k + '-print-"]'), function (i) { return i.getAttribute("data-img") + ":" + i.getAttribute("width"); }); }, chave);
  }

  /* 1. Modelo em branco: o novo tópico vem desligado. */
  fase = "1";
  var p = await abrirEmulador();
  await p.click("#bModelo");
  var f = await quadro(p);
  confere(await noQuadro(p, function (d) { var t = d.querySelector('[data-item="topico-1"]'); return !!t && !!t.closest("[data-ed-oculta]"); }), "modelo em branco: o novo tópico existe e começa desligado");
  confere(!(await p.isChecked('#secoesRep input[value="topico"]')), "\"Novo tópico (ex.: Testes)\" aparece desmarcado em Seções do report");
  var antes = await pilulas(p);
  await p.$eval("#secoesRep", function (e) { e.closest("details").open = true; });
  await p.check('#secoesRep input[value="topico"]');
  var depois = await pilulas(p);
  confere(emOrdem(antes) && emOrdem(depois) && depois.split(",").length === antes.split(",").length + 1, "ligado: a seção aparece e a numeração das seções se refaz (" + antes + " → " + depois + ")");

  /* 2. + Link: no projeto do Transformation Hub (que já tem link), no novo tópico e num lançamento. */
  fase = "2";
  p.__respostas = ["Guia do agente", "https://www.example.com/guia-agente"];
  await ferramenta(p, f, '[data-item="transformation-1"] [data-campo="transformation-1.nome"]', "+ Link");
  var linhaT = await noQuadro(p, function (d) { var a = Array.prototype.find.call(d.querySelectorAll('[data-item="transformation-1"] a.cta'), function (x) { return /Guia do agente/.test(x.textContent); }); return a ? { href: a.getAttribute("href"), irmaos: a.parentNode.querySelectorAll('a.cta, span[title="Link ainda não definido"]').length, sep: !!a.previousElementSibling && a.previousElementSibling.tagName === "BR" && !/·/.test(a.parentNode.textContent) } : null; });
  confere(linhaT && linhaT.href === "https://www.example.com/guia-agente" && linhaT.irmaos === 2 && linhaT.sep, "Transformation Hub: segundo link embaixo do primeiro (um por linha)");
  p.__respostas = ["Plano do teste", "https://www.example.com/plano"];
  await ferramenta(p, f, '[data-item="topico-1"] [data-campo="topico-1.nome"]', "+ Link");
  p.__respostas = ["Resultado do teste", null];
  await ferramenta(p, f, '[data-item="topico-1"] [data-campo="topico-1.nome"]', "+ Link");
  var linksTp = await noQuadro(p, function (d) { return Array.prototype.map.call(d.querySelectorAll('[data-item="topico-1"] a.cta, [data-item="topico-1"] span[title="Link ainda não definido"]'), function (x) { return x.tagName + ":" + x.textContent.replace(/\s+/g, " ").trim(); }); });
  confere(linksTp.indexOf("A:Plano do teste →") >= 0 && linksTp.indexOf("SPAN:Resultado do teste →") >= 0, "novo tópico: link com endereço e link sem endereço (fica cinza, pendente) · " + linksTp.join(" | "));
  confere(/criado sem endereço/.test(await p.$eval("#estado", function (e) { return e.textContent; })), "aviso: link sem endereço, como completar");
  p.__respostas = ["Peça no SharePoint", "https://www.example.com/peca"];
  await ferramenta(p, f, '[data-item="lancamento-1"] [data-campo="lancamento-1.nome"]', "+ Link");
  confere(await noQuadro(p, function (d) { var l = d.querySelector('[data-item="lancamento-1"] p[data-links]'); return !!l && !!l.querySelector('a[href="https://www.example.com/peca"]'); }), "lançamento sem linha de links: a linha é criada com o link");
  /* tirar o único link da linha: a linha sai junto; Desfazer volta */
  await ferramenta(p, f, '[data-item="lancamento-1"] p[data-links] a.cta', "Tirar link");
  confere(await noQuadro(p, function (d) { return !d.querySelector('[data-item="lancamento-1"] p[data-links]'); }), "tirar o único link: a linha vazia sai");
  await p.click("#bDesfazer");
  confere(await noQuadro(p, function (d) { return !!d.querySelector('[data-item="lancamento-1"] p[data-links] a[href="https://www.example.com/peca"]'); }), "Desfazer: o link volta");
  /* "foi bem" (linha de texto): link no fim da linha, sem "+ Imagem" */
  var bBem = await botoes(p, f, '[data-item="bem-1"]');
  confere(bBem.indexOf("+ Link") >= 0 && bBem.indexOf("+ Imagem") < 0, "\"foi bem\": + Link sim, + Imagem não (é uma linha de texto) · " + bBem.join(", "));
  p.__respostas = ["Ver dados", "https://www.example.com/dados"];
  await ferramenta(p, f, '[data-item="bem-1"]', "+ Link");
  confere(await noQuadro(p, function (d) { return !!d.querySelector('[data-item="bem-1"] span[data-links] a[href="https://www.example.com/dados"]'); }), "\"foi bem\": link no fim da linha");
  /* destaque (bloco sem data-item) e capa (fundo vermelho: link claro) */
  p.__respostas = ["Estudo completo", "https://www.example.com/estudo"];
  await ferramenta(p, f, '[data-campo="destaque.titulo"]', "+ Link");
  confere(await noQuadro(p, function (d) { return !!d.querySelector('[data-ed-bloco="destaque"] a[href="https://www.example.com/estudo"]'); }), "destaque: + Link também");
  p.__respostas = ["Apresentação", "https://www.example.com/apresentacao"];
  await ferramenta(p, f, '[data-campo="principal.nome"]', "+ Link");
  confere(await noQuadro(p, function (d) { var a = d.querySelector('a[href="https://www.example.com/apresentacao"]'); return a && /#FFFFFF/i.test(a.getAttribute("style")); }), "capa (fundo vermelho): link novo em branco");

  /* 3. + Imagem: até 3 por item, na grade da coluna. */
  fase = "3";
  p.__respostas = ["Tela A do teste"];
  await comArquivo(p, f, '[data-item="topico-1"] [data-campo="topico-1.nome"]', "+ Imagem", IMG);
  await p.waitForFunction(function () { return document.querySelector("#edFrame").contentDocument.querySelectorAll('img[data-img^="topico-1-print-"]').length === 1; }, null, { timeout: 10000 });
  var imsT = await imagensDe(p, "topico-1");
  confere(imsT.join(",") === "topico-1-print-1:600", "novo tópico: uma imagem ocupa a largura inteira (600 px) · " + imsT.join(","));
  p.__respostas = ["Tela B do teste"];
  await comArquivo(p, f, '[data-item="topico-1"] [data-campo="topico-1.nome"]', "+ Imagem", IMG2);
  await p.waitForFunction(function () { return document.querySelector("#edFrame").contentDocument.querySelectorAll('img[data-img^="topico-1-print-"]').length === 2; }, null, { timeout: 10000 });
  imsT = await imagensDe(p, "topico-1");
  confere(imsT.join(",") === "topico-1-print-1:288,topico-1-print-2:288", "novo tópico: a segunda entra ao lado (2 × 288 px) · " + imsT.join(","));
  p.__respostas = ["Peça B"];
  await comArquivo(p, f, '[data-item="lancamento-1"] [data-campo="lancamento-1.nome"]', "+ Imagem", IMG2);
  p.__respostas = ["Peça C"];
  await comArquivo(p, f, '[data-item="lancamento-1"] [data-campo="lancamento-1.nome"]', "+ Imagem", IMG);
  await p.waitForFunction(function () { return document.querySelector("#edFrame").contentDocument.querySelectorAll('img[data-img^="lancamento-1-print-"]').length === 2; }, null, { timeout: 10000 });
  var imsL = await imagensDe(p, "lancamento-1");
  confere(imsL.join(",") === "lancamento-1-print-1:184,lancamento-1-print-2:184", "lançamento (coluna de 184 px): imagens uma embaixo da outra · " + imsL.join(","));
  confere(await noQuadro(p, function (d) { var i = d.querySelector('img[data-img="lancamento-1-print-1"]'); return i.alt === "Peça B" && /^data:image\//.test(i.getAttribute("data-ampliar")) && i.classList.contains("fluid"); }), "imagem nova com descrição, versão ampliada (clique) e largura de celular");
  p.__respostas = ["Peça D"];
  await comArquivo(p, f, '[data-item="lancamento-1"] [data-campo="lancamento-1.nome"]', "+ Imagem", IMG2);
  await p.waitForFunction(function () { return document.querySelectorAll('img').length >= 0 && document.querySelector("#edFrame").contentDocument.querySelectorAll('img[data-img^="lancamento-1-print-"]').length === 3; }, null, { timeout: 10000 });
  await comArquivo(p, f, '[data-item="lancamento-1"] [data-campo="lancamento-1.nome"]', "+ Imagem", IMG);
  await p.waitForSelector("#modal:not([hidden])");
  confere(/Máximo de imagens/.test(await p.$eval("#modalTit", function (e) { return e.textContent; })), "a 4ª imagem é recusada (até 3 por item)");
  await p.click("#modalOk");
  /* tirar a 1ª: as outras sobem e são renumeradas */
  await ferramenta(p, f, 'img[data-img="lancamento-1-print-1"]', "Tirar imagem");
  imsL = await imagensDe(p, "lancamento-1");
  confere(imsL.join(",") === "lancamento-1-print-1:184,lancamento-1-print-2:184" && await noQuadro(p, function (d) { return d.querySelector('img[data-img="lancamento-1-print-1"]').alt; }) === "Peça C", "tirar imagem: as outras sobem e são renumeradas");
  p.__respostas = ["Print do agente"];
  await comArquivo(p, f, '[data-item="transformation-2"] [data-campo="transformation-2.nome"]', "+ Imagem", IMG);
  await p.waitForFunction(function () { return document.querySelector("#edFrame").contentDocument.querySelectorAll('img[data-img^="transformation-2-print-"]').length === 2; }, null, { timeout: 10000 });
  confere((await imagensDe(p, "transformation-2")).join(",") === "transformation-2-print-1:240,transformation-2-print-2:240", "Transformation Hub: junto do print que já existia (2 × 240 px)");
  p.__respostas = ["Peça do destaque"];
  await comArquivo(p, f, '[data-campo="destaque.titulo"]', "+ Imagem", IMG2);
  await p.waitForFunction(function () { return document.querySelector("#edFrame").contentDocument.querySelectorAll('img[data-img^="destaque-print-"]').length === 1; }, null, { timeout: 10000 });
  confere(true, "destaque: + Imagem também");

  /* 4. Itens do novo tópico e textos. */
  fase = "4";
  await f.locator('.ed-mais button[data-grupo="topico"]').click();
  confere(await noQuadro(p, function (d) { return d.querySelectorAll('[data-item^="topico-"]').length; }) === 4, "+ Adicionar item no novo tópico");
  await escrever(p, f, "topico.rotulo", "TESTES");
  await escrever(p, f, "topico-1.nome", "Teste A/B fictício");

  /* 5. Salvar e conferir o arquivo. */
  fase = "5";
  await p.click("#bSalvar");
  await p.waitForFunction(function () { return window.__salvos.length === 1; }, null, { timeout: 20000 });
  var salvo = await p.evaluate(function () { return window.__salvos[0]; });
  fs.writeFileSync(path.join(SAIDA, "extras-" + salvo.nome), salvo.html);
  var h = salvo.html, nums = (h.match(/border-radius:999px;padding:0 7px;letter-spacing:1px;">(\d{2})</g) || []).map(function (x) { return x.slice(-3, -1); });
  confere(/<!--secao:topico-->/.test(h) && />TESTES</.test(h) && /Teste A\/B fictício/.test(h), "arquivo: novo tópico com rótulo e textos");
  confere(emOrdem(nums.join(",")), "arquivo: seções numeradas em ordem (" + nums.join(",") + ")");
  confere(["guia-agente", "plano", "peca", "dados", "estudo", "apresentacao"].every(function (x) { return h.indexOf('href="https://www.example.com/' + x + '"') > 0; }), "arquivo: todos os links novos");
  confere(/data-img="lancamento-1-print-2"[^>]*|[^>]*data-img="lancamento-1-print-2"/.test(h) && /data-img="destaque-print-1"/.test(h) && (h.match(/data-ampliar="data:image/g) || []).length >= 5, "arquivo: imagens novas, ampliáveis no clique");
  confere(!/data-ed-bloco|ed-barra|contenteditable/.test(h), "arquivo: nenhuma marca do editor");
  /* o arquivo salvo segue para o e-mail: a conversão (imagens dentro, conferência do Outlook) não pode dar erro */
  await p.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 60000 });
  var ban = await p.$eval("#banner", function (e) { return e.className + " · " + e.textContent; });
  confere(!/banner err/.test(ban), "conversão do arquivo salvo sem erro · " + ban.replace(/^banner \w+ · /, "").slice(0, 90));
  await p.close();

  /* 6. Reabrir o salvo: o novo tópico preenchido continua ligado. */
  fase = "6";
  p = await abrirEmulador();
  await p.setInputFiles("#arquivo", path.join(SAIDA, "extras-" + salvo.nome));
  f = await quadro(p);
  confere(await p.isChecked('#secoesRep input[value="topico"]') && await noQuadro(p, function (d) { return !d.querySelector('[data-item="topico-1"]').closest("[data-ed-oculta]"); }), "reaberto: novo tópico preenchido continua ligado");
  confere((await imagensDe(p, "lancamento-1")).length === 2 && await noQuadro(p, function (d) { return d.querySelectorAll("[data-links] a.cta").length >= 3; }), "reaberto: links e imagens novos continuam editáveis");
  /* celular: nada vaza para o lado */
  var pc = await ctx.newPage(); await pc.setViewportSize({ width: 390, height: 844 });
  await pc.goto("file://" + path.join(SAIDA, "extras-" + salvo.nome));
  var vaza = await pc.evaluate(function () { return document.documentElement.scrollWidth - window.innerWidth; });
  confere(vaza <= 0, "celular (390 px): nada vaza para o lado · " + vaza);
  await pc.close(); await p.close();

  /* 7. Página que não tem o novo tópico (report de antes da 4.6): ligar acrescenta a seção antes do Foco. */
  fase = "7";
  p = await abrirEmulador();
  await p.setInputFiles("#arquivo", path.join(RAIZ, "kit/report-exemplo.html"));
  f = await quadro(p);
  confere(!(await noQuadro(p, function (d) { return !!d.querySelector('[data-item^="topico-"]'); })) && !(await p.isChecked('#secoesRep input[value="topico"]')), "página sem o novo tópico: a opção aparece desmarcada");
  var antigos = await noQuadro(p, function (d) { var a = d.querySelector('[data-item^="transformation-"] a.cta + br + a.cta, [data-item^="transformation-"] a.cta + br + span[title]'); return { br: !!a, ponto: Array.prototype.some.call(d.querySelectorAll('[data-item^="transformation-"] p'), function (x) { return x.querySelector("a.cta") && /·/.test(x.textContent); }) }; });
  confere(antigos.br && !antigos.ponto, "report antigo: links separados por \" · \" viram um embaixo do outro ao abrir");
  antes = await pilulas(p);
  await p.$eval("#secoesRep", function (e) { e.closest("details").open = true; });
  await p.check('#secoesRep input[value="topico"]');
  depois = await pilulas(p);
  var ordem = await noQuadro(p, function (d) { var w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n, r = []; while ((n = w.nextNode())) { var m = /^secao:(\w+)$/.exec(n.nodeValue.trim()); if (m) r.push(m[1]); } return r.join(","); });
  confere(/aprendizados,topico,foco/.test(ordem) && depois.split(",").length === antes.split(",").length + 1 && emOrdem(depois), "acrescentado entre O que aprendemos e o Foco, com a numeração refeita · " + ordem);
  confere(!!(await f.locator('.ed-mais button[data-grupo="topico"]').count()), "itens do novo tópico já podem ser adicionados");
  await p.click("#bDesfazer");
  confere(!(await noQuadro(p, function (d) { return !!d.querySelector('[data-item^="topico-"]'); })) && await pilulas(p) === antes && !(await p.isChecked('#secoesRep input[value="topico"]')), "Desfazer: a seção sai e a numeração volta");
  await p.close({ runBeforeUnload: false });

  await browser.close();
  if (erros.length) { console.log("ERROS NA PÁGINA:", erros.filter(function (e, i) { return erros.indexOf(e) === i; }), "(" + erros.length + ")"); falhas++; }
  else confere(true, "sem erros no console");
  console.log(falhas ? falhas + " falha(s)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})();
