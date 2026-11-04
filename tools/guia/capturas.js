/*
 * Capturas REAIS dos emuladores PF e PJ para o guia operacional (kit/guia-operacional.pptx).
 * Abre o kit no Chromium, faz cada passo como uma pessoa faria (só conteúdo fictício: os exemplos
 * de treino, Janeiro 2099) e grava, para cada tela, o PNG e a posição dos elementos que o guia
 * destaca (caixas em px da imagem), para as marcações caírem exatamente no lugar.
 * Uso técnico (quem mantém a ferramenta):  node tools/guia/capturas.js <pasta-de-saida>
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, "..", ".."), SAIDA = path.resolve(process.argv[2] || "capturas");
var ESCALA = 2;
var SEG = {
  pf: { url: "file://" + path.join(RAIZ, "kit/emulador-report.html"), exemplo: path.join(RAIZ, "kit/report-exemplo.html"), outro: path.join(RAIZ, "kit/report-exemplo-pj.html"),
    img: path.join(RAIZ, "assets/exemplo/peca-exemplo-principal.png"), video: 'img[data-img="principal"]', item: "lancamento-1" },
  pj: { url: "file://" + path.join(RAIZ, "kit/emulador-report-pj.html"), exemplo: path.join(RAIZ, "kit/report-exemplo-pj.html"), outro: path.join(RAIZ, "kit/report-exemplo.html"),
    img: path.join(RAIZ, "assets/exemplo-pj/peca-pj-principal.png"), video: 'img[data-img="lancamento-3"]', item: "lancamento-1" }
};
var IMPORTAR = "[NUMERO 2]\nvalor: R$ 1,20\ntitulo: Indicador B\ndetalhe: Referência: R$ 1,50\nvariacao: -20%\n";
var meta = {};

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var browser = await chromium.launch();
  for (var s of Object.keys(SEG)) await capturar(browser, s, SEG[s]);
  await browser.close();
  fs.writeFileSync(path.join(SAIDA, "capturas.json"), JSON.stringify(meta, null, 1));
  console.log("Capturas: " + Object.keys(meta).length + " telas em " + SAIDA);
})().catch(function (e) { console.error(e); process.exit(1); });

async function capturar(browser, s, S) {
  var ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: ESCALA, acceptDownloads: true });
  var p = await ctx.newPage();
  p.on("dialog", function (d) { var r = p.__resposta; p.__resposta = null; if (r === null || r === undefined) d.dismiss(); else d.accept(r); });
  await p.goto(S.url);
  await p.evaluate(function () { window.__salvos = []; window.showSaveFilePicker = async function (o) { return { name: o.suggestedName, createWritable: async function () { var pt = []; return { write: async function (b) { pt.push(await b.text()); }, close: async function () { window.__salvos.push({ nome: o.suggestedName, html: pt.join("") }); } }; } }; }; });
  async function noQuadro(fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg === undefined ? null : arg }); }
  /* caixa (px da página, na tela) de um seletor da página ou de dentro do quadro de edição ("q:" na frente) */
  async function caixa(sel) {
    if (/^q:/.test(sel)) return p.evaluate(function (x) { var f = document.querySelector("#edFrame"), q = f.getBoundingClientRect(), d = f.contentDocument, e = Array.prototype.find.call(d.querySelectorAll(x), function (y) { var r = y.getBoundingClientRect(); return r.width > 0 && r.height > 0; }); if (!e) return null; var r = e.getBoundingClientRect(); return { x: q.left + r.left, y: q.top + r.top, w: r.width, h: r.height }; }, sel.slice(2));
    return p.evaluate(function (x) { var e = Array.prototype.find.call(document.querySelectorAll(x), function (y) { var r = y.getBoundingClientRect(); return r.width > 0 && r.height > 0; }); if (!e) return null; var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
  }
  /* foto de uma área (clip em px da tela) e as caixas dos destaques, relativas à foto */
  async function foto(nome, clip, destaques, legenda, op) {
    /* recorte em volta do report (no quadro de edição): o report tem 680 px no meio do quadro; o resto é vazio */
    if (op && op.report) {
      var cont = await caixa("q:table.container"), xs = [cont.x, cont.x + cont.w];
      for (var dd of destaques || []) { var bb = await caixa(dd); if (bb) { xs.push(bb.x); xs.push(bb.x + bb.w); } }
      var xa = Math.max(0, Math.min.apply(null, xs) - 28), xb = Math.min(1280, Math.max.apply(null, xs) + 28);
      clip = { x: xa, y: clip.y, w: xb - xa, h: clip.h };
    }
    clip = { x: Math.max(0, Math.round(clip.x)), y: Math.max(0, Math.round(clip.y)), width: Math.round(clip.w), height: Math.round(clip.h) };
    var cx = [];
    for (var d of destaques || []) { var b = await caixa(d); if (b) cx.push({ sel: d, x: (b.x - clip.x) / clip.width, y: (b.y - clip.y) / clip.height, w: b.w / clip.width, h: b.h / clip.height }); else { cx.push(null); console.log("  (sem caixa) " + nome + " " + d); } }
    var arq = s + "-" + nome + ".png";
    await p.screenshot({ path: path.join(SAIDA, arq), clip: clip });
    meta[s + "-" + nome] = { arquivo: arq, w: clip.width * ESCALA, h: clip.height * ESCALA, caixas: cx, legenda: legenda || "" };
    console.log("  " + arq);
  }
  async function vista(sel, margem, alturaMax) {
    await p.evaluate(function (x) { var e = document.querySelector(x); e.scrollIntoView({ block: "start" }); window.scrollBy(0, -16); }, sel);
    await p.waitForTimeout(250);
    var b = await caixa(sel); margem = margem || 12;
    return { x: 0, y: Math.max(0, b.y - margem), w: 1280, h: Math.min(alturaMax || 800, b.h + margem * 2, 800 - Math.max(0, b.y - margem)) };
  }
  async function quadro() {
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
    await p.waitForTimeout(700);
  }
  async function noTopoDoQuadro(selQuadro) {
    await noQuadro(function (d, x) { var e = d.querySelector(x); e.scrollIntoView({ block: "center" }); }, selQuadro);
    await p.waitForTimeout(250);
  }
  async function passar(selQuadro) {
    await p.mouse.move(2, 2);
    var b = await caixa("q:" + selQuadro);
    await p.mouse.move(b.x + Math.min(40, b.w / 2), b.y + Math.min(16, b.h / 2));
    await p.waitForTimeout(450);
  }

  /* 1. Tela inicial */
  await foto("inicio", { x: 0, y: 0, w: 1280, h: 520 }, ["header h1", "#bModelo", "#escolher", "#drop"], "Tela inicial");
  /* 2. Report aberto (exemplo de treino) */
  await p.setInputFiles("#arquivo", S.exemplo);
  await quadro();
  await p.evaluate(function () { window.scrollTo(0, 0); });
  var top = await caixa("#secEditar");
  await p.evaluate(function (y) { window.scrollTo(0, y - 8); }, top.y);
  await p.waitForTimeout(300);
  await foto("editor", { x: 0, y: 0, w: 1280, h: 800 }, ["#bSalvar", "#bImportar", "#bAdicionarItem", "#bNovoTopico", "#bDesfazer", '[data-ew="390px"]', "#edFrame"], "Tela de edição");
  /* 3. Texto */
  await noTopoDoQuadro('[data-campo="frase"]');
  var fr = (await p.$("#edFrame")), f = await fr.contentFrame();
  await f.click('[data-campo="frase"][data-ed-campo]');
  await p.waitForTimeout(300);
  var bq = await caixa("q:" + '[data-campo="frase"]');
  await foto("texto", { x: 0, y: Math.max(0, bq.y - 170), w: 1280, h: 420 }, ["q:[data-campo=\"frase\"]"], "Editar um texto", { report: true });
  await p.keyboard.press("Escape");
  /* 4. Indicador e etiqueta */
  await noTopoDoQuadro('[data-campo="numero-2.variacao"]');
  await f.locator('[data-campo="numero-2.variacao"]').locator("visible=true").first().click();
  await p.waitForTimeout(400);
  var bv = await caixa("q:[data-campo=\"numero-2.valor\"]");
  await foto("indicador", { x: 0, y: Math.max(0, bv.y - 150), w: 1280, h: 400 }, ["q:[data-campo=\"numero-2.valor\"]", "q:[data-campo=\"numero-2.variacao\"]", "q:#ed-barra"], "Editar um indicador", { report: true });
  /* 5. Item: barra do item e + Adicionar */
  await noTopoDoQuadro('[data-item="' + S.item + '"]');
  await passar('[data-item="' + S.item + '"] [data-campo$=".nome"]');
  var bi = await caixa("q:[data-item=\"" + S.item + "\"]");
  await foto("item", { x: 0, y: Math.max(0, bi.y - 120), w: 1280, h: 460 }, ["q:[data-item=\"" + S.item + "\"]", "q:#ed-barra", "q:.ed-mais button[data-grupo=\"lancamento\"]"], "Barra do item", { report: true });
  /* 6. Imagem: Trocar imagem */
  await noTopoDoQuadro('img[data-img="principal"]');
  await passar('img[data-img="principal"]');
  var bim = await caixa("q:img[data-img=\"principal\"]");
  await foto("imagem", { x: 0, y: Math.max(0, bim.y - 110), w: 1280, h: Math.min(520, bim.h + 220) }, ["q:img[data-img=\"principal\"]", "q:#ed-barra"], "Trocar imagem", { report: true });
  /* 7. Vídeo */
  await noTopoDoQuadro(S.video);
  await passar(S.video);
  var bvd = await caixa("q:" + S.video);
  await foto("video", { x: 0, y: Math.max(0, bvd.y - 110), w: 1280, h: Math.min(480, bvd.h + 240) }, ["q:" + S.video, "q:#ed-barra"], "Vídeo", { report: true });
  await p.mouse.move(2, 2);
  /* 8. + Adicionar item (assistente) */
  await p.evaluate(function (y) { window.scrollTo(0, y - 8); }, (await p.evaluate(function () { return document.querySelector("#secEditar").getBoundingClientRect().top + window.scrollY; })));
  await p.click("#bAdicionarItem"); await p.waitForSelector("#assist:not([hidden])"); await p.waitForTimeout(300);
  var ba = await caixa("#assist");
  await foto("assistente", { x: Math.max(0, ba.x - 20), y: Math.max(0, ba.y - 20), w: Math.min(1280, ba.w + 40), h: Math.min(800, ba.h + 40) }, ["#assist"], "+ Adicionar item");
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  if (await p.$("#assist:not([hidden])")) { var bc = await p.$('#assist button:text-is("Cancelar")'); if (bc) await bc.click(); }
  /* 9. + Novo tópico */
  await p.click("#bNovoTopico"); await p.waitForSelector("#modal:not([hidden]) #nomeTopico"); await p.fill("#nomeTopico", "Testes"); await p.waitForTimeout(250);
  var bm = await caixa("#modal .caixa, #modal > div");
  await foto("topico", { x: Math.max(0, bm.x - 20), y: Math.max(0, bm.y - 20), w: Math.min(1280, bm.w + 40), h: Math.min(800, bm.h + 40) }, ["#nomeTopico", "label.layout"], "+ Novo tópico");
  await p.click("#modalCancela"); await p.waitForTimeout(200);
  /* 10. Seções do report */
  await p.click("#secEditar details summary"); await p.waitForTimeout(250);
  var cs = await vista("#secEditar details", 12, 560);
  await foto("secoes", cs, ["#secEditar details summary", "#secoesRep"], "Seções do report");
  await p.click("#secEditar details summary");
  /* 11. Alça da seção (mover / tirar) */
  var idSec = s === "pj" ? "aprendizados" : "aprendizados";
  await noQuadro(function (d, i) { var w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n; while ((n = w.nextNode())) if (n.nodeValue.trim() === "secao:" + i) { var e = n.nextSibling; while (e.nodeType !== 1) e = e.nextSibling; e.scrollIntoView({ block: "center" }); return; } }, idSec);
  await p.waitForTimeout(250);
  var ps = await noQuadro(function (d, i) { var q = document.querySelector("#edFrame").getBoundingClientRect(), w = d.createTreeWalker(d.body, NodeFilter.SHOW_COMMENT), n; while ((n = w.nextNode())) if (n.nodeValue.trim() === "secao:" + i) { var e = n.nextSibling; while (e.nodeType !== 1) e = e.nextSibling; var b = e.getBoundingClientRect(); return { x: q.left + b.left + 120, y: q.top + b.top + 18 }; } }, idSec);
  await p.mouse.move(ps.x, ps.y + 30); await p.mouse.move(ps.x, ps.y); await p.waitForTimeout(400);
  await foto("alca", { x: 0, y: Math.max(0, ps.y - 160), w: 1280, h: 380 }, ["q:#ed-secao"], "Mover ou tirar uma seção", { report: true });
  await p.mouse.move(2, 2);
  /* 12. Importar conteúdo (Copilot) */
  await p.click("#bImportar"); await p.fill("#txtImportar", IMPORTAR); await p.waitForTimeout(200);
  var ci = await vista("#painelImportar", 12, 520);
  await foto("importar", ci, ["#txtImportar", "#bAplicar"], "Importar conteúdo (Copilot)");
  await p.click("#bFecharImportar");
  /* 13. Celular */
  await p.evaluate(function (y) { window.scrollTo(0, y - 8); }, (await p.evaluate(function () { return document.querySelector("#secEditar").getBoundingClientRect().top + window.scrollY; })));
  await p.click('[data-ew="390px"]');
  await p.waitForFunction(function () { return document.querySelector("#edFrame").getBoundingClientRect().width <= 392; }, null, { timeout: 5000 }); await p.waitForTimeout(500);
  await foto("celular", { x: 0, y: 0, w: 1280, h: 800 }, ['[data-ew="390px"]', "#edFrame"], "Edição no tamanho do celular");
  await p.click('[data-ew="100%"]'); await p.waitForTimeout(400);
  /* 14. Salvar */
  await p.click("#bSalvar"); await p.waitForFunction(function () { return window.__salvos.length >= 1; }, null, { timeout: 15000 }); await p.waitForTimeout(300);
  await p.evaluate(function () { window.scrollTo(0, document.querySelector("#secEditar").getBoundingClientRect().top + window.scrollY - 8); }); await p.waitForTimeout(200);
  await foto("salvar", { x: 0, y: 0, w: 1280, h: 430 }, ["#bSalvar", "#estado"], "Salvar o report");
  /* 15. Link do report completo */
  await p.fill("#link", "https://www.example.com/report-ficticio-" + s + ".html");
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 40000 }); await p.waitForTimeout(400);
  var cl = await vista("#secLink", 12, 300);
  await foto("link", cl, ["#link", "#linkInfo"], "Link do report completo");
  /* 16. E-mail-resumo: destaques */
  var cr = await vista("#secResumo", 12, 560);
  await foto("resumo", cr, ["#dtqEscolhidos"], "Destaques do e-mail-resumo");
  var crl = await vista("#bDtqNovo", 16, 700); crl.h = Math.min(320, 800 - crl.y);
  await foto("resumo-lista", crl, ["#bDtqNovo", "#dtqLista"], "Informação nova e lista do report");
  var crb = await vista(".campo:has(#botao)", 14, 150);
  await foto("resumo-botao", crb, ["#botao"], "Texto do botão do e-mail-resumo");
  /* 17. Status e baixar */
  var cst = await vista("#secStatus", 12, 560);
  await foto("status", cst, ["#secStatus"], "Status");
  var cbx = await vista("#secBaixar", 12, 420);
  await foto("baixar", cbx, ["#bEmlRes", "#bPngRes", "#bEml"], "Downloads");
  /* 18. Prévia do e-mail (computador e celular) */
  var cp = await vista("#secPrev", 12, 780);
  await foto("previa", cp, ["#secPrev .tabs, #secPrev [role=group]", "#prev"], "Prévia do e-mail-resumo");
  var bCel = await p.$('#secPrev button[data-w*="390"]');
  if (bCel) { await bCel.click(); await p.waitForTimeout(600); cp = await vista("#secPrev", 12, 780); await foto("previa-celular", cp, ["#prev"], "Prévia no celular"); var bPc = await p.$('#secPrev button[data-w]:not([data-w*="390"])'); if (bPc) await bPc.click(); }
  /* 19. Recuperar a edição (rascunho guardado) */
  var f2 = await (await p.$("#edFrame")).contentFrame();
  await noTopoDoQuadro('[data-campo="frase"]');
  await f2.click('[data-campo="frase"][data-ed-campo]'); await p.keyboard.press("End"); await p.keyboard.type(" "); await p.keyboard.press("Backspace");
  await p.waitForTimeout(1800);
  await p.close({ runBeforeUnload: false });
  p = await ctx.newPage(); await p.goto(S.url); await p.waitForTimeout(800);
  if (await p.$("#recuperar:not([hidden])")) await foto("recuperar", { x: 0, y: 0, w: 1280, h: 620 }, ["#recuperar", "#bRecuperar", "#bDescartar"], "Recuperar a edição");
  if (await p.$("#recuperar:not([hidden])")) await p.click("#bDescartar");
  /* 20. O outro segmento é recusado */
  await p.setInputFiles("#arquivo", S.outro);
  await p.waitForSelector("#modal:not([hidden])"); await p.waitForTimeout(250);
  var bmr = await caixa("#modal .caixa, #modal > div");
  await foto("recusa", { x: Math.max(0, bmr.x - 20), y: Math.max(0, bmr.y - 20), w: Math.min(1280, bmr.w + 40), h: Math.min(800, bmr.h + 40) }, ["#modalTit"], "Report do outro segmento");
  await p.click("#modalOk");
  await p.close();
  /* 21. O report (página) e o e-mail-resumo, para "Conhecendo" */
  var pr = await ctx.newPage(); await pr.setViewportSize({ width: 900, height: 1000 }); await pr.goto("file://" + S.exemplo); await pr.waitForTimeout(900);
  await pr.screenshot({ path: path.join(SAIDA, s + "-report.png"), clip: { x: 0, y: 0, width: 900, height: 1000 } });
  meta[s + "-report"] = { arquivo: s + "-report.png", w: 900 * ESCALA, h: 1000 * ESCALA, caixas: [], legenda: "O report completo" };
  await pr.setViewportSize({ width: 390, height: 844 }); await pr.reload(); await pr.waitForTimeout(900);
  await pr.screenshot({ path: path.join(SAIDA, s + "-report-celular.png"), clip: { x: 0, y: 0, width: 390, height: 844 } });
  meta[s + "-report-celular"] = { arquivo: s + "-report-celular.png", w: 390 * ESCALA, h: 844 * ESCALA, caixas: [], legenda: "O report no celular" };
  await pr.close();
  await ctx.close();
}
