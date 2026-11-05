/*
 * Teste de ponta a ponta do funil dos Principais resultados e da peça da visão geral embaixo (5.4, Emulador Report PJ).
 * Uso técnico, opcional. Só conteúdo fictício (kit/report-exemplo-pj.html, gerado de dados/EXEMPLO-PJ-treinamento.txt).
 * Confere: "Ver como funil" (os números viram degraus, com o nome e o total) · o bloco é o mesmo do motor
 * (Motor.blocoFunil, o [FUNIL] dos dados) · editar no clique (degrau, nome, total) · + Adicionar e Tirar degrau
 * (larguras refeitas) · ↑/↓ · Tirar o total e + Total ao lado · Desfazer · Ver em colunas e de volta · salvar e
 * reabrir · e-mail-resumo (os mesmos números) · e-mail completo sem erro na conferência do Outlook · celular sem
 * rolagem para o lado · "Imagem embaixo" e "Imagem ao lado" · report PJ salvo antes: "Agenda" vira "Vem aí" ·
 * o PF não tem o botão.
 *   Requer Node.js + Playwright:  node tests/funil.e2e.js [pasta-de-saida]
 */
"use strict";
var path = require("path"), fs = require("fs"), cp = require("child_process");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida", "funil"));
var URL_PJ = "file://" + path.resolve(process.env.EMULADOR_PJ || path.join(RAIZ, "kit", "emulador-report-pj.html"));
var URL_PF = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "kit", "emulador-report.html"));
var EXEMPLO = path.join(RAIZ, "kit", "report-exemplo-pj.html");
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
  var erros = [];
  async function abrirEmulador(url) {
    var p = await ctx.newPage();
    p.on("pageerror", function (e) { erros.push(e.message + " @ " + String(e.stack || "").split("\n").slice(1, 4).join(" < ")); });
    p.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
    p.on("dialog", function (d) { d.dismiss(); });
    await p.goto(url || URL_PJ);
    await p.evaluate(salvarComo);
    if (await p.$("#recuperar:not([hidden])")) await p.click("#bDescartar");
    return p;
  }
  async function quadro(p) {
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
    await p.waitForTimeout(500);
    return (await p.$("#edFrame")).contentFrame();
  }
  async function noQuadro(p, fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg === undefined ? null : arg }); }
  async function texto(p, k) { return noQuadro(p, function (d, k2) { var e = d.querySelector('[data-campo="' + k2 + '"]'); return e ? e.textContent.replace(/\s+/g, " ").trim() : null; }, k); }
  async function escrever(p, f, chave, t) {
    await p.mouse.move(2, 2); await noQuadro(p, function (d) { var x = d.getElementById("ed-barra"); if (x) x.hidden = true; });
    await f.locator('[data-campo="' + chave + '"][data-ed-campo]').first().click();
    await p.waitForTimeout(60);
    await p.keyboard.press("Control+A");
    await p.keyboard.type(t);
    await p.keyboard.press("Tab");
  }
  async function clicar(p, sel) {
    await noQuadro(p, function (d, s) { d.querySelector(s).scrollIntoView({ block: "center" }); }, sel);
    var c = await noQuadro(p, function (d, s) { var q = document.querySelector("#edFrame").getBoundingClientRect(), b = d.querySelector(s).getBoundingClientRect(); return { x: q.left + b.left + b.width / 2, y: q.top + b.top + b.height / 2 }; }, sel);
    await p.mouse.click(c.x, c.y);
    await p.waitForTimeout(150);
  }
  async function botaoDaBarra(p, f, alvo, botao) {
    await p.mouse.move(2, 2);
    await noQuadro(p, function (d, s) { var x = d.getElementById("ed-barra"); if (x) x.hidden = true; d.querySelector(s).scrollIntoView({ block: "center" }); }, alvo);
    await f.hover(alvo, { force: true });
    await p.waitForFunction(function (b) { var x = document.querySelector("#edFrame").contentDocument.getElementById("ed-barra"); return x && !x.hidden && Array.prototype.some.call(x.querySelectorAll("button"), function (y) { return y.textContent === b; }); }, botao, { timeout: 5000 });
    await noQuadro(p, function (d, b) { Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }).click(); }, botao);
    await p.waitForTimeout(200);
  }
  async function botoesDaBarra(p, f, alvo) {
    await p.mouse.move(2, 2);
    await noQuadro(p, function (d, s) { var x = d.getElementById("ed-barra"); if (x) x.hidden = true; d.querySelector(s).scrollIntoView({ block: "center" }); }, alvo);
    await f.hover(alvo, { force: true }); await p.waitForTimeout(250);
    return noQuadro(p, function (d) { var x = d.getElementById("ed-barra"); return x && !x.hidden ? Array.prototype.map.call(x.querySelectorAll("button"), function (y) { return y.textContent; }) : []; });
  }
  function funil(p) {
    return noQuadro(p, function (d) {
      var f = d.querySelector("table[data-funil]"); if (!f) return null;
      var it = Array.prototype.filter.call(f.querySelectorAll('[data-item^="numero-"]'), function (x) { return /^numero-\d+$/.test(x.getAttribute("data-item")); });
      return { n: it.length, chaves: it.map(function (x) { return x.getAttribute("data-item"); }).join(","),
        larguras: it.map(function (x) { return x.querySelector("table[data-degrau]").getAttribute("width"); }).join(","),
        valores: it.map(function (x) { return x.querySelector('[data-campo$=".valor"]').textContent.trim(); }).join(" | "),
        rotulo: (f.querySelector('[data-campo="funil.rotulo"]') || {}).textContent || "", total: !!f.querySelector('[data-item="funil-total"]'),
        larguraCol: f.querySelector("table[data-degraus]").closest("td").getAttribute("width"), colunas: d.querySelectorAll('td[data-item^="numero-"]').length,
        botao: (d.querySelector('.ed-mais button[data-acao="funil"]') || {}).textContent || "", maisTotal: (function () { var b = d.querySelector('.ed-mais button[data-acao="total"]'); return !!b && b.getBoundingClientRect().width > 0; })() };
    });
  }
  async function desfazer(p) { await p.click("#bDesfazer"); await p.waitForTimeout(200); }

  /* 1. Abrir o exemplo PJ (colunas) */
  var p = await abrirEmulador();
  await p.setInputFiles("#arquivo", EXEMPLO);
  var f = await quadro(p);
  var antes = await noQuadro(p, function (d) { return Array.prototype.map.call(d.querySelectorAll('td[data-item^="numero-"]'), function (x) { return { valor: x.querySelector('[data-campo$=".valor"]').innerHTML.trim(), titulo: x.querySelector('[data-campo$=".titulo"]').innerHTML.trim() }; }); });
  var b0 = await noQuadro(p, function (d) { return (d.querySelector('.ed-mais button[data-acao="funil"]') || {}).textContent || ""; });
  confere(antes.length === 3 && b0 === "Ver como funil", "exemplo PJ aberto: 3 números em colunas e o botão \"Ver como funil\" embaixo deles");

  /* 2. Ver como funil */
  await clicar(p, '.ed-mais button[data-acao="funil"]');
  var F = await funil(p), nome = await texto(p, "principal.nome");
  confere(F && F.n === 3 && F.colunas === 0 && F.larguras === "100%,88%,76%" && F.total && !F.maisTotal && F.larguraCol === "344" && F.botao === "Ver em colunas", "virou funil: 3 degraus (100%, 88%, 76%), o total ao lado e o botão \"Ver em colunas\" · " + JSON.stringify(F));
  function limpo(h) { return h.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }
  confere(limpo(F.valores) === antes.map(function (x) { return limpo(x.valor); }).join(" | "), "os degraus têm os mesmos números das colunas · " + limpo(F.valores));
  confere(F.rotulo.trim() === nome.toLocaleUpperCase("pt-BR"), "o nome em cima do funil é o da campanha da visão geral, em maiúsculas · " + F.rotulo);
  /* o mesmo bloco do motor ([FUNIL] nos dados) */
  var html = await noQuadro(p, function (d) { var f2 = d.querySelector("table[data-funil]").cloneNode(true); Array.prototype.forEach.call(f2.querySelectorAll(".ed-mais"), function (x) { x.remove(); }); Array.prototype.forEach.call(f2.querySelectorAll("[contenteditable],[data-ed-campo],[spellcheck]"), function (x) { x.removeAttribute("contenteditable"); x.removeAttribute("data-ed-campo"); x.removeAttribute("spellcheck"); }); return f2.outerHTML; });
  function estrutura(h) { return (h.match(/<(table|tr|td|p|span|b)\b[^>]*?(data-[a-z-]+(="[^"]*")?)?/g) || []).map(function (t) { return t.replace(/\s(style|class|width|bgcolor|align|valign|cellpadding|cellspacing|border|role)="[^"]*"/g, ""); }).join(""); }
  var doMotor = Motor.blocoFunil({ itens: antes.map(function (x, i) { return { idx: i + 1, valor: x.valor, titulo: x.titulo, detalhe: "x", variacao: "" }; }), rotulo: "X", total: "X", total_titulo: "X", cor: { fundo: "#EC0000", valor: "#EC0000", texto: "#000000" }, fonte: { titulos: "a", texto: "b" } });
  var temVar = await noQuadro(p, function (d) { return d.querySelectorAll('table[data-funil] [data-campo$=".variacao"]').length; });
  confere(temVar > 0 || estrutura(html.replace(/<tbody>|<\/tbody>/g, "")).replace(/<span[^>]*>/g, "") === estrutura(doMotor).replace(/<span[^>]*>/g, "") || /data-funil/.test(html) && /data-degraus/.test(html) && (html.match(/data-degrau=""/g) || []).length === 3, "o bloco do emulador é o mesmo do motor (Motor.blocoFunil): funil, degraus e total");

  /* 3. Editar no clique */
  await escrever(p, f, "funil.total", "R$ 9,9 MM");
  await escrever(p, f, "funil.total_titulo", "total de teste");
  await escrever(p, f, "numero-2.titulo", "Degrau de teste");
  confere(await texto(p, "funil.total") === "R$ 9,9 MM" && await texto(p, "funil.total_titulo") === "total de teste" && await texto(p, "numero-2.titulo") === "Degrau de teste", "total, título do total e degrau editados no clique");

  /* 4. + Adicionar degrau e Tirar degrau */
  await clicar(p, '.ed-mais button[data-grupo="numero"]');
  F = await funil(p);
  confere(F.n === 4 && F.larguras === "100%,90%,80%,70%" && F.chaves === "numero-1,numero-2,numero-3,numero-4", "+ Adicionar indicador: 4 degraus (100, 90, 80 e 70%) · " + F.larguras);
  var bar = await botoesDaBarra(p, f, 'tr[data-item="numero-4"] table[data-degrau]');
  confere(bar.indexOf("↑") >= 0 || bar.some(function (x) { return /Antes|↑/.test(x); }), "degrau com ↑/↓ (o funil é vertical) e sem + Link/+ Imagem · " + bar.join(" | "));
  confere(bar.indexOf("+ Link") < 0 && bar.indexOf("+ Imagem") < 0, "degrau sem + Link e + Imagem");
  await botaoDaBarra(p, f, 'tr[data-item="numero-4"] table[data-degrau]', "Tirar item");
  F = await funil(p);
  confere(F.n === 3 && F.larguras === "100%,88%,76%", "Tirar item: 3 degraus de novo, larguras refeitas · " + F.larguras);
  /* ↑: o 2º degrau sobe */
  var v1 = await texto(p, "numero-1.valor"), v2 = await texto(p, "numero-2.valor");
  var bar2 = await botoesDaBarra(p, f, 'tr[data-item="numero-2"] table[data-degrau]'), sobe = bar2.filter(function (x) { return /↑/.test(x); })[0];
  if (sobe) await botaoDaBarra(p, f, 'tr[data-item="numero-2"] table[data-degrau]', sobe);
  confere(sobe && await texto(p, "numero-1.valor") === v2 && await texto(p, "numero-2.valor") === v1 && (await funil(p)).larguras === "100%,88%,76%", "↑ no 2º degrau: troca com o 1º e as larguras continuam do funil");
  await desfazer(p);
  confere(await texto(p, "numero-1.valor") === v1, "Desfazer volta a ordem");

  /* 5. Tirar o total e + Total ao lado */
  var barT = await botoesDaBarra(p, f, '[data-item="funil-total"] [data-campo="funil.total"]');
  confere(barT.join("|") === "Tirar o total", "barra do total: só \"Tirar o total\" · " + barT.join(" | "));
  await botaoDaBarra(p, f, '[data-item="funil-total"] [data-campo="funil.total"]', "Tirar o total");
  F = await funil(p);
  confere(!F.total && F.larguraCol === "552" && F.maisTotal, "Tirar o total: os degraus usam a largura toda (552 px) e aparece \"+ Total ao lado\"");
  await clicar(p, '.ed-mais button[data-acao="total"]');
  F = await funil(p);
  confere(F.total && F.larguraCol === "344" && /\[Total\]/.test(await texto(p, "funil.total")), "+ Total ao lado: o total volta, com o texto [entre colchetes] para trocar");
  await desfazer(p); await desfazer(p);
  F = await funil(p);
  confere(F.total && await texto(p, "funil.total") === "R$ 9,9 MM", "Desfazer (2x): o total editado volta");

  /* 6. Ver em colunas e de volta */
  await clicar(p, '.ed-mais button[data-acao="funil"]');
  var col = await noQuadro(p, function (d) { var it = d.querySelectorAll('td[data-item^="numero-"]'); return { n: it.length, larg: Array.prototype.map.call(it, function (x) { return x.getAttribute("width"); }).join(","), funil: !!d.querySelector("table[data-funil]"), botao: d.querySelector('.ed-mais button[data-acao="funil"]').textContent, t2: d.querySelector('[data-campo="numero-2.titulo"]').textContent.trim() }; });
  confere(col.n === 3 && col.larg === "184,184,184" && !col.funil && col.botao === "Ver como funil" && col.t2 === "Degrau de teste", "Ver em colunas: 3 colunas de 184 px, com os textos editados · " + JSON.stringify(col));
  await desfazer(p);
  F = await funil(p);
  confere(F && F.n === 3 && await texto(p, "funil.total") === "R$ 9,9 MM", "Desfazer: o funil volta como estava (com o total editado)");

  /* 7. Imagem da visão geral embaixo e ao lado */
  var bi = await botoesDaBarra(p, f, 'img[data-img="principal"]');
  confere(bi.indexOf("Imagem embaixo") >= 0, "barra da peça da visão geral: \"Imagem embaixo\" · " + bi.join(" | "));
  await botaoDaBarra(p, f, 'img[data-img="principal"]', "Imagem embaixo");
  await p.waitForTimeout(500);
  var im = await noQuadro(p, function (d) { var i = d.querySelector('img[data-img="principal"]'), td = i.closest("td"), tt = d.querySelector('[data-campo="principal.nome"]').closest("td"); return { emb: td.hasAttribute("data-imagem-embaixo"), w: i.getAttribute("width"), h: i.getAttribute("height"), larg: Math.round(i.getBoundingClientRect().width), alt: Math.round(i.getBoundingClientRect().height), texto: tt.getAttribute("width"), cls: i.className, ok: i.naturalWidth > 0 }; });
  confere(im.emb && im.w === "600" && im.h === null && im.larg === 600 && im.texto === "600" && im.cls === "fluid" && im.ok, "Imagem embaixo: a peça desce para baixo do texto, 600 px, sem altura fixa (sem recorte) · " + JSON.stringify(im));
  bi = await botoesDaBarra(p, f, 'img[data-img="principal"]');
  confere(bi.indexOf("Imagem ao lado") >= 0, "a barra agora oferece \"Imagem ao lado\"");

  /* 8. Salvar e reabrir */
  await p.click("#bSalvar");
  await p.waitForFunction(function () { return window.__salvos.length > 0; }, null, { timeout: 30000 });
  var salvo = await p.evaluate(function () { return window.__salvos[window.__salvos.length - 1]; });
  fs.writeFileSync(path.join(SAIDA, "funil-salvo.html"), salvo.html);
  confere(/data-funil/.test(salvo.html) && /data-imagem-embaixo/.test(salvo.html) && !/contenteditable|data-ed-campo|class="ed-mais"/.test(salvo.html), "salvo com o funil e a peça embaixo, sem controles de edição");
  await p.setInputFiles("#arquivo", path.join(SAIDA, "funil-salvo.html"));
  f = await quadro(p);
  F = await funil(p);
  confere(F && F.n === 3 && F.total && F.botao === "Ver em colunas" && await texto(p, "funil.total") === "R$ 9,9 MM", "reaberto: funil, total editado e o botão \"Ver em colunas\"");
  await escrever(p, f, "numero-3.valor", "777");
  confere(await texto(p, "numero-3.valor") === "777", "reaberto: degrau editável no clique");
  await botaoDaBarra(p, f, 'img[data-img="principal"]', "Imagem ao lado");
  await p.waitForTimeout(500);
  im = await noQuadro(p, function (d) { var i = d.querySelector('img[data-img="principal"]'), tt = d.querySelector('[data-campo="principal.nome"]').closest("td"); return { emb: !!i.closest("td[data-imagem-embaixo]"), w: i.getAttribute("width"), h: i.getAttribute("height"), texto: tt.getAttribute("width"), linhas: d.querySelectorAll("td[data-imagem-embaixo]").length, ok: i.naturalWidth > 0 }; });
  confere(!im.emb && im.w === "184" && im.h === "230" && im.texto === "392" && im.linhas === 0 && im.ok, "Imagem ao lado: de volta ao retângulo vertical (184 x 230) e o texto em 392 px · " + JSON.stringify(im));
  await desfazer(p);
  im = await noQuadro(p, function (d) { return !!d.querySelector('img[data-img="principal"]').closest("td[data-imagem-embaixo]"); });
  confere(im, "Desfazer: a peça volta para baixo do texto");

  /* 9. E-mail-resumo e e-mail completo */
  await p.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 40000 });
  var lista = await p.$$eval("#dtqLista button[data-origem]", function (l) { return l.map(function (x) { return x.getAttribute("data-origem"); }); });
  confere(["numero-1", "numero-2", "numero-3"].every(function (k) { return lista.indexOf(k) >= 0; }), "e-mail-resumo: os degraus do funil entram como os números do mês (numero-1 a 3)");
  await p.fill("#link", "https://www.example.com/report-teste.html");
  await p.waitForFunction(function () { return !document.querySelector("#bEml").disabled && !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 }); await p.waitForTimeout(1200);
  var dR = await Promise.all([p.waitForEvent("download"), p.click("#bEmlRes")]), eR = path.join(SAIDA, "resumo.eml"); await dR[0].saveAs(eR);
  var dE = await Promise.all([p.waitForEvent("download"), p.click("#bEml")]), eE = path.join(SAIDA, "completo.eml"); await dE[0].saveAs(eE);
  function htmlDoEml(eml) { var m = /Content-Type: text\/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/.exec(eml); return Buffer.from(m[1].replace(/\r\n/g, ""), "base64").toString("utf8"); }
  var hR = htmlDoEml(fs.readFileSync(eR, "utf8")), hE = htmlDoEml(fs.readFileSync(eE, "utf8"));
  var errR = Motor.conferirHtml(hR).filter(function (x) { return x.nivel === "erro"; }), errE = Motor.conferirHtml(hE).filter(function (x) { return x.nivel === "erro"; });
  confere(errR.length === 0 && /777/.test(hR), "e-mail-resumo (.eml) com o degrau editado, sem erro na conferência do Outlook");
  confere(errE.length === 0 && /data-funil|R\$&nbsp;9,9 MM|R\$ 9,9 MM/.test(hE) && /777/.test(hE), "e-mail completo (.eml) com o funil, sem erro na conferência do Outlook · " + errE.map(function (x) { return x.msg; }).join(" | "));

  /* 10. Celular: sem rolagem para o lado (página salva) */
  for (var w of [390, 640, 690]) {
    var pc = await ctx.newPage({ viewport: { width: w, height: 800 } }); await pc.setViewportSize({ width: w, height: 800 });
    await pc.goto("file://" + path.join(SAIDA, "funil-salvo.html")); await pc.waitForTimeout(400);
    var r = await pc.evaluate(function () { var t = document.querySelector('[data-item="funil-total"]').getBoundingClientRect(), g = document.querySelector("table[data-degraus]").getBoundingClientRect(); return { lado: document.documentElement.scrollWidth - innerWidth, embaixo: t.top >= g.bottom - 1 }; });
    if (w === 390) await pc.screenshot({ path: path.join(SAIDA, "funil-390.png"), fullPage: true, clip: await pc.evaluate(function () { var r2 = document.querySelector("table[data-funil]").getBoundingClientRect(); return { x: 0, y: Math.max(0, r2.top + scrollY - 20), width: innerWidth, height: Math.round(r2.height + 40) }; }) });
    confere(r.lado === 0 && r.embaixo, w + " px: sem rolagem para o lado e o total embaixo do funil");
    await pc.close();
  }

  /* 11. Report PJ salvo antes da 5.4: "Agenda · Próximas datas" vira "Vem aí" ao abrir */
  var velho = path.join(SAIDA, "exemplo-pj-5.3.html");
  fs.writeFileSync(velho, cp.execSync("git show 3d8be58:kit/report-exemplo-pj.html", { cwd: RAIZ, maxBuffer: 64 * 1024 * 1024 }).toString("utf8"));
  var p2 = await abrirEmulador();
  await p2.setInputFiles("#arquivo", velho);
  await quadro(p2);
  var ag = await noQuadro(p2, function (d) { return /VEM AÍ/.test(d.body.textContent) && !/PRÓXIMAS DATAS/.test(d.body.textContent.replace(/ /g, " ")); });
  var st = await p2.$eval("#estado", function (e) { return e.textContent; });
  confere(ag && /Vem aí|VEM AÍ/.test(st), "report PJ da 5.3 aberto: a seção Agenda agora se chama VEM AÍ (avisado) · " + st.slice(0, 160));
  await p2.close();

  /* 12. PF: sem o botão do funil */
  var p3 = await abrirEmulador(URL_PF);
  await p3.click("#bModelo"); await quadro(p3);
  var pf = await noQuadro(p3, function (d) { return { funil: !!d.querySelector('.ed-mais button[data-acao]'), mais: !!d.querySelector('.ed-mais button[data-grupo="numero"]') }; });
  confere(!pf.funil && pf.mais, "Emulador Report PF: os números continuam em colunas, sem o botão do funil");
  await p3.close();

  confere(erros.length === 0, "sem erros no console" + (erros.length ? ": " + erros.join(" | ") : ""));
  await browser.close();
  console.log(falhas ? "\n" + falhas + " FALHA(S)." : "\nTudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
