/*
 * Auditoria do grid no emulador (uso técnico, opcional), só com o modelo em branco (sem dado real):
 * em cada grupo de itens e em cada layout de tópico novo, adiciona até o máximo e tira até sobrar um;
 * acrescenta e tira imagens e links; oculta e mostra seções. Depois de cada passo, mede no computador
 * e no celular: nada sai da coluna, nada se sobrepõe, itens da mesma linha alinhados no topo e com o
 * mesmo espaço entre eles, linha cheia fechando na largura do grupo, e no celular itens empilhados na
 * largura da tela, com respiro entre eles e sem nada vazando para o lado.
 *   Requer Node.js + Playwright:  node tests/grade.e2e.js [pasta-de-saida]
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/grade.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var URL_EMULADOR = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var IMG = path.join(RAIZ, "assets/exemplo/print-exemplo.png");
var falhas = 0, passos = 0;
function confere(ok, msg) { if (!ok || process.env.DEPURAR) console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }

/* Medição dentro do quadro de edição: devolve a lista de problemas de grid e alinhamento. */
function medir(d, celular) {
  var prob = [], w = d.defaultView, barra = d.getElementById("ed-barra");
  if (barra) barra.hidden = true;
  function vis(el) { if (el.closest("[data-ed-oculta]")) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function ret(el) { var r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width }; }
  if (d.documentElement.scrollWidth > d.documentElement.clientWidth + 1) prob.push("a página vaza para o lado (" + d.documentElement.scrollWidth + " > " + d.documentElement.clientWidth + ")");
  var grupos = {};
  Array.prototype.forEach.call(d.querySelectorAll("[data-item]"), function (el) {
    var m = /^([a-z]+)-\d+$/.exec(el.getAttribute("data-item") || ""); if (!m || !vis(el)) return;
    (grupos[m[1]] = grupos[m[1]] || []).push(el);
  });
  Object.keys(grupos).forEach(function (g) {
    var it = grupos[g], rs = it.map(ret), cont = it[0].closest("table"), C = ret(cont);
    /* dentro da tabela do grupo */
    rs.forEach(function (r, i) { if (r.l < C.l - 1 || r.r > C.r + 1) prob.push(g + "-" + (i + 1) + " sai da coluna (" + Math.round(r.l - C.l) + ".." + Math.round(r.r - C.l) + " de " + Math.round(C.w) + ")"); });
    /* sem sobreposição */
    for (var i = 0; i < rs.length; i++) for (var j = i + 1; j < rs.length; j++) {
      var a = rs[i], b = rs[j];
      if (Math.min(a.r, b.r) - Math.max(a.l, b.l) > 1 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 1) prob.push(g + "-" + (i + 1) + " e " + g + "-" + (j + 1) + " se sobrepõem");
    }
    /* linhas: itens com o mesmo topo */
    var linhas = [];
    rs.forEach(function (r) { var l = linhas.filter(function (x) { return Math.abs(x[0].t - r.t) < 2; })[0]; if (l) l.push(r); else linhas.push([r]); });
    var tdItem = it[0].tagName === "TD";
    if (!celular) {
      linhas.forEach(function (l, k) {
        l.sort(function (a, b) { return a.l - b.l; });
        if (tdItem && Math.abs(l[0].l - C.l) > 1) prob.push(g + ": linha " + (k + 1) + " não começa no alinhamento do grupo (" + Math.round(l[0].l - C.l) + " px)");
        var gaps = []; for (var q = 1; q < l.length; q++) gaps.push(Math.round(l[q].l - l[q - 1].r));
        if (gaps.some(function (x) { return Math.abs(x - gaps[0]) > 1; })) prob.push(g + ": espaços diferentes entre os itens da linha " + (k + 1) + " (" + gaps.join(", ") + ")");
        if (gaps.some(function (x) { return x < 20; })) prob.push(g + ": itens colados na linha " + (k + 1) + " (" + gaps.join(", ") + ")");
      });
      /* a 1ª linha fecha na largura do grupo (menos lançamentos e cartões com mais de 3, que seguem as colunas de 184) */
      /* capa (até 3) e agenda seguem as colunas fixas de 184 px; os outros grupos dividem a largura e fecham a linha */
      var fixa = g === "agenda" || (g === "numero" && it.length <= 3);
      if (fixa) rs.forEach(function (r) { var x = Math.round(r.l - C.l); if ([0, 208, 416].every(function (c) { return Math.abs(x - c) > 1; }) || Math.abs(r.w - 184) > 1) prob.push(g + ": fora das colunas de 184 px (" + x + ", " + Math.round(r.w) + ")"); });
      var l0 = linhas[0], cheia = tdItem && l0.length > 1 && !(linhas.length > 1) && !fixa;
      if (cheia && g !== "resultado" && Math.abs(l0[l0.length - 1].r - C.r) > 2) prob.push(g + ": a linha não fecha na largura do grupo (sobra " + Math.round(C.r - l0[l0.length - 1].r) + " px)");
      if (linhas.length > 1) linhas.forEach(function (l, k) { l.forEach(function (r, q) { if (Math.abs(r.l - linhas[0][q].l) > 1) prob.push(g + ": linha " + (k + 1) + " fora das colunas da linha 1"); }); });
    } else if (tdItem && !/^(numero|resultado)$/.test(g)) {
      /* celular: um embaixo do outro, na largura toda, com respiro */
      rs.forEach(function (r, i) { if (Math.abs(r.w - C.w) > 2) prob.push(g + "-" + (i + 1) + " não ocupa a largura no celular (" + Math.round(r.w) + " de " + Math.round(C.w) + ")"); });
      var ord = rs.slice().sort(function (a, b) { return a.t - b.t; });
      for (var z = 1; z < ord.length; z++) {
        var conteudo = function (r) { return r; };
        if (ord[z].t - ord[z - 1].b < -1) prob.push(g + ": itens sobrepostos no celular");
      }
      /* respiro: do fim do texto de um item até o começo do próximo */
      var el2 = it.slice().sort(function (a, b) { return ret(a).t - ret(b).t; });
      for (var y = 1; y < el2.length; y++) {
        var ult = Array.prototype.filter.call(el2[y - 1].querySelectorAll("p, img, table"), vis).map(ret).reduce(function (m, r) { return Math.max(m, r.b); }, 0);
        var pri = Array.prototype.filter.call(el2[y].querySelectorAll("p, img, table"), vis).map(ret).reduce(function (m, r) { return Math.min(m, r.t); }, 1e9);
        if (ult && pri < 1e9 && pri - ult < 12) prob.push(g + ": pouco respiro entre " + el2[y - 1].getAttribute("data-item") + " e " + el2[y].getAttribute("data-item") + " no celular (" + Math.round(pri - ult) + " px)");
      }
    }
    /* imagens: dentro do item e alinhadas entre si */
    it.forEach(function (el) {
      var R = ret(el);
      Array.prototype.forEach.call(el.querySelectorAll("img[data-img]"), function (im) { if (!vis(im)) return; var r = ret(im); if (r.l < R.l - 1 || r.r > R.r + 1) prob.push(im.getAttribute("data-img") + " sai do item"); });
    });
  });
  /* seções: o rótulo de cada seção começa no mesmo alinhamento */
  var lefts = Array.prototype.filter.call(d.querySelectorAll("span"), function (s) { return /border-radius:\s*999px;\s*padding:\s*0(px)? 7px;\s*letter-spacing:\s*1px/.test(s.getAttribute("style") || "") && vis(s) && !s.closest("table.ra"); }).map(function (s) { return Math.round(s.getBoundingClientRect().left); });
  if (lefts.some(function (x) { return Math.abs(x - lefts[0]) > 1; })) prob.push("rótulos das seções desalinhados (" + lefts.join(",") + ")");
  return prob;
}

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var browser = await chromium.launch();
  var ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  var p = await ctx.newPage(), erros = [];
  p.__respostas = [];
  p.on("pageerror", function (e) { erros.push(e.message); });
  p.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
  p.on("dialog", function (dl) { var r = p.__respostas.shift(); if (r === null || r === undefined) dl.dismiss(); else dl.accept(r); });
  await p.goto(URL_EMULADOR);
  await p.click("#bModelo");
  await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
  await p.waitForTimeout(400);
  var f = await (await p.$("#edFrame")).contentFrame();
  async function noQuadro(fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg === undefined ? null : arg }); }
  async function modo(cel) { await p.click('button[data-ew="' + (cel ? "390px" : "100%") + '"], button[data-ew]:not([data-ew="390px"])' ); }
  async function auditar(rotulo) {
    passos++;
    var pd = await noQuadro(medir, false);
    await p.click('.ferramentas button[data-ew="390px"]'); await p.waitForTimeout(350);
    var pc = await noQuadro(medir, true);
    await p.click('.ferramentas button[data-ew]:not([data-ew="390px"])'); await p.waitForTimeout(350);
    confere(!pd.length, rotulo + " · computador" + (pd.length ? ": " + pd.slice(0, 4).join(" | ") : ""));
    confere(!pc.length, rotulo + " · celular" + (pc.length ? ": " + pc.slice(0, 4).join(" | ") : ""));
  }
  async function botoes(alvo) {
    await p.mouse.move(2, 2);
    await noQuadro(function (d, a) { d.querySelector(a).scrollIntoView({ block: "center" }); }, alvo);
    await f.hover(alvo, { position: { x: 6, y: 6 } });
    await p.waitForTimeout(150);
    return noQuadro(function (d) { var b = d.getElementById("ed-barra"); return b.hidden ? [] : Array.prototype.map.call(b.querySelectorAll("button"), function (x) { return x.textContent; }); });
  }
  async function ferramenta(alvo, botao) {
    var lista = await botoes(alvo);
    if (lista.indexOf(botao) < 0) throw new Error("sem \"" + botao + "\" em " + alvo + " (há: " + lista.join(", ") + ")");
    var c = await noQuadro(function (d, b) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), x = Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }).getBoundingClientRect();
      return { x: q.left + x.left + x.width / 2, y: q.top + x.top + x.height / 2 };
    }, botao);
    await p.mouse.click(c.x, c.y);
    await p.waitForTimeout(80);
  }
  function itens(g) { return noQuadro(function (d, k) { return Array.prototype.filter.call(d.querySelectorAll('[data-item^="' + k + '-"]'), function (x) { return new RegExp("^" + k + "-\\d+$").test(x.getAttribute("data-item")); }).length; }, g); }
  async function maxDo(g) { return noQuadro(function (d, k) { var b = d.querySelector('.ed-mais button[data-grupo="' + k + '"]'); return b ? b.textContent : ""; }, g); }
  /* um grupo inteiro: até o máximo, depois tira (do meio e do começo) até sobrar um, e volta a 2 */
  async function grupo(g, alvoTexto) {
    var n = await itens(g), bt = f.locator('.ed-mais button[data-grupo="' + g + '"]');
    while (!(await bt.isDisabled())) { await bt.click(); n++; await auditar(g + ": " + n + " itens (adicionar)"); }
    confere(/^Máximo de/.test(await maxDo(g)), g + ": no máximo, o botão diz \"" + await maxDo(g) + "\"");
    while (n > 1) {
      var alvo = '[data-item="' + g + '-' + Math.ceil(n / 2) + '"]' + (alvoTexto || "");
      await ferramenta(alvo, "Tirar item"); n--;
      confere(await itens(g) === n, g + ": tirar item deixa " + n);
      await auditar(g + ": " + n + " itens (tirar)");
    }
    var b1 = await botoes('[data-item="' + g + '-1"]' + (alvoTexto || ""));
    confere(b1.indexOf("Tirar item") < 0, g + ": o último item não tem \"Tirar item\" (para tirar o grupo, oculte a seção) · " + b1.join(", "));
    await bt.click(); await auditar(g + ": volta a 2");
    await p.click("#bDesfazer"); await auditar(g + ": Desfazer volta a 1");
  }

  await auditar("modelo em branco ao abrir");
  var GR = [["numero", ' [data-campo$=".titulo"]'], ["resultado", ' [data-campo$=".titulo"]'], ["lancamento", ' [data-campo$=".nome"]'], ["bem", ""], ["melhorar", ""],
    ["transformation", ' [data-campo$=".nome"]'], ["aprendizado", ' [data-campo$=".titulo"]'], ["agenda", ' [data-campo$=".titulo"]']];
  for (var i = 0; i < GR.length; i++) await grupo(GR[i][0], GR[i][1]);

  /* tópicos novos, um de cada layout */
  var LAY = ["lista", "colunas", "cartoes", "numeros"];
  for (var k = 0; k < LAY.length; k++) {
    await p.click("#bNovoTopico"); await p.waitForSelector("#modal:not([hidden]) #nomeTopico");
    await p.fill("#nomeTopico", "Tópico " + LAY[k]); await p.click('label.layout:has(input[value="' + LAY[k] + '"])'); await p.click("#modalOk");
    var id = ["topico", "topicob", "topicoc", "topicod"][k];
    await auditar("tópico " + LAY[k] + " criado");
    await grupo(id, ' [data-campo$=".nome"]');
  }

  /* imagens: 3 num cartão, num lançamento e num projeto; tirar uma */
  for (var alvoI of ['[data-item="lancamento-1"] [data-campo$=".nome"]', '[data-item="topicoc-1"] [data-campo$=".nome"]', '[data-item="topico-1"] [data-campo$=".nome"]', '[data-item="topicob-1"] [data-campo$=".nome"]']) {
    for (var q = 0; q < 2; q++) {
      p.__respostas = ["Imagem fictícia"];
      var fc = await Promise.all([p.waitForEvent("filechooser"), ferramenta(alvoI, "+ Imagem")]);
      await fc[0].setFiles(IMG); await p.waitForTimeout(500);
      await auditar("imagem " + (q + 1) + " em " + alvoI.split(" ")[0]);
    }
  }
  await ferramenta('img[data-img="topico-1-print-1"]', "Tirar imagem"); await auditar("tirar imagem do tópico lista");
  /* links */
  p.__respostas = ["Link fictício", "https://www.example.com/x"];
  await ferramenta('[data-item="aprendizado-1"] [data-campo$=".titulo"]', "+ Link"); await auditar("+ Link num aprendizado");
  await ferramenta('[data-item="aprendizado-1"] a.cta', "Tirar link"); await auditar("tirar o link");
  /* seções: ocultar cada uma e mostrar de volta */
  await p.$eval("#secoesRep", function (e) { e.closest("details").open = true; });
  var ids = await p.$$eval("#secoesRep input[type=checkbox]", function (l) { return l.map(function (x) { return x.value; }); });
  for (var s = 0; s < ids.length; s++) {
    await p.uncheck('#secoesRep input[value="' + ids[s] + '"]'); await auditar("seção " + ids[s] + " oculta");
    await p.check('#secoesRep input[value="' + ids[s] + '"]');
  }
  await auditar("todas as seções de volta");
  await p.screenshot({ path: path.join(SAIDA, "grade-final.png"), fullPage: false });

  await browser.close();
  if (erros.length) { console.log("ERROS NA PÁGINA:", erros.slice(0, 5)); falhas++; }
  console.log(passos + " passos medidos (computador e celular). " + (falhas ? falhas + " falha(s)." : "Tudo certo."));
  process.exit(falhas ? 1 : 0);
})();
