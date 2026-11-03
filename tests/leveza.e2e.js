/*
 * Teste de ponta a ponta dos ajustes 4.8 do emulador (uso técnico, opcional), só com conteúdo fictício:
 *   imagem pesada vira JPEG no tamanho de uso; vídeo pesado é otimizado no navegador; ao abrir, imagens
 *   pesadas do report ficam mais leves; edição e prévia sem rolagem dentro do quadro (no Celular, o report
 *   inteiro aparece rolando só a página); indicadores com o nome do projeto e aviso de repetição; ícones da
 *   aba (ferramenta: chama + PF; report: chama; e-mails: nenhum).
 *   Requer Node.js + Playwright e ffmpeg (gera os arquivos pesados de teste):
 *     node tests/leveza.e2e.js [pasta-de-saida]
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/leveza.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs"), cp = require("child_process");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var URL_EMULADOR = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function salvarComo() {
  window.__salvos = [];
  window.showSaveFilePicker = async function (o) {
    return { name: o.suggestedName, createWritable: async function () { var partes = []; return { write: async function (b) { partes.push(await b.text()); }, close: async function () { window.__salvos.push({ nome: o.suggestedName, html: partes.join("") }); } }; } };
  };
}
/* tipo e tamanho reais de uma mídia da edição (blob: ou data:), lida como o navegador lê */
function midiaDe(pg, sel, at) { return pg.evaluate(async function (o) { var v = document.querySelector("#edFrame").contentDocument.querySelector(o.sel).getAttribute(o.at) || ""; if (!v) return { tipo: "", tam: 0 }; var b = await (await fetch(v)).blob(); return { tipo: b.type, tam: b.size }; }, { sel: sel, at: at }); }
function kb(n) { return Math.round(n / 1024) + " KB"; }

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  /* arquivos pesados de teste (sintéticos): vídeo de 9 s em 1080p com som e uma foto PNG de 3000 px */
  var VID = path.join(SAIDA, "teste-video-pesado.webm"), FOTO = path.join(SAIDA, "teste-foto-pesada.png");
  if (!fs.existsSync(VID)) cp.execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1920x1080:rate=30", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "9", "-c:v", "libvpx", "-b:v", "9M", "-c:a", "libopus", "-shortest", VID]);
  if (!fs.existsSync(FOTO)) cp.execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=3000x2000", "-frames:v", "1", FOTO]);
  var tamVid = fs.statSync(VID).size, tamFoto = fs.statSync(FOTO).size;

  var browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  var ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } });
  var p = await ctx.newPage(), erros = [];
  p.__respostas = [];
  p.on("pageerror", function (e) { erros.push(e.message); });
  p.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
  p.on("dialog", function (d) { var r = p.__respostas.shift(); if (r === null || r === undefined) d.dismiss(); else d.accept(r); });
  await p.goto(URL_EMULADOR);
  await p.evaluate(salvarComo);
  async function noQuadro(fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg === undefined ? null : arg }); }
  /* Até o botão como uma pessoa: em passos (~8 px a cada 10 ms), não pulando direto; a barra não pode trocar no caminho. */
  async function ateBotao(p, de, c) {
    var n = Math.max(5, Math.round(Math.hypot(c.x - de.x, c.y - de.y) / 8));
    for (var k = 1; k <= n; k++) { await p.mouse.move(de.x + (c.x - de.x) * k / n, de.y + (c.y - de.y) * k / n); await p.waitForTimeout(10); }
    await p.mouse.click(c.x, c.y);
  }
  /* Ponto do alvo na tela (centro, ou dx/dy do canto), lido pela página do emulador: o quadro não roda script, nem o do Playwright. */
  async function pontoDoAlvo(alvo, dx, dy) {
    return noQuadro(function (d, o) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), r = Array.prototype.map.call(d.querySelectorAll(o.sel), function (e) { return e.getBoundingClientRect(); }).filter(function (x) { return x.width > 0 && x.height > 0; })[0];
      return { x: q.left + r.left + (o.dx === null ? r.width / 2 : o.dx), y: q.top + r.top + (o.dy === null ? r.height / 2 : o.dy) };
    }, { sel: alvo.replace(/\s*>>\s*visible=true$/, ""), dx: dx === undefined ? null : dx, dy: dy === undefined ? null : dy });
  }
  async function ferramenta(f, alvo, botao) {
    await p.mouse.move(2, 2);
    await noQuadro(function (d, a) { d.querySelector(a).scrollIntoView({ block: "center" }); }, alvo);
    await f.hover(alvo, { position: { x: 6, y: 6 } }); await p.waitForTimeout(150);
    var de = await pontoDoAlvo(alvo, 6, 6);
    var c = await noQuadro(function (d, b) {
      var bt = Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }); if (!bt) return null;
      var q = document.querySelector("#edFrame").getBoundingClientRect(), x = bt.getBoundingClientRect(); return { x: q.left + x.left + x.width / 2, y: q.top + x.top + x.height / 2 };
    }, botao);
    if (!c) throw new Error("sem o botão " + botao + " em " + alvo);
    await ateBotao(p, de, c);
  }

  /* 1. Aba do emulador: nome e ícone Santander + PF (PNG 16 e 32, SVG e celular), todos carregando; símbolo no cabeçalho */
  var ab = await p.evaluate(async function () {
    var r = { titulo: document.title, icones: [] };
    for (var l of document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')) { var im = new Image(); im.src = l.href; try { await im.decode(); r.icones.push((l.getAttribute("sizes") || "") + ":" + im.naturalWidth); } catch (e) { r.icones.push((l.getAttribute("sizes") || "") + ":ERRO"); } }
    var svg = document.querySelector('link[type="image/svg+xml"]'); r.svgPF = !!svg && /PF<\/text>/.test(decodeURIComponent(svg.getAttribute("href")));
    var c = document.querySelector("header .marca-pf img"); r.cab = c ? c.naturalWidth + "x" + c.getBoundingClientRect().width : "";
    return r;
  });
  confere(ab.titulo === "Emulador Report PF", "aba do emulador: " + ab.titulo);
  confere(ab.icones.join(",") === "32x32:32,16x16:16,any:150,180x180:180" && ab.svgPF, "ícone Santander + PF carregando em todos os tamanhos · " + ab.icones.join(","));
  confere(/^150x/.test(ab.cab), "símbolo Santander + PF no cabeçalho do emulador · " + ab.cab);

  /* 2. Abrir o exemplo: edição sem rolagem dentro do quadro, no computador e no celular */
  await p.setInputFiles("#arquivo", path.join(RAIZ, "kit/report-exemplo.html"));
  await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
  await p.waitForTimeout(800);
  var f = await (await p.$("#edFrame")).contentFrame();
  async function semRolagem(sel) { return p.$eval(sel, function (fr) { var d = fr.contentDocument; return { quadro: Math.round(fr.getBoundingClientRect().height), conteudo: d.documentElement.scrollHeight, rola: d.documentElement.scrollHeight - d.documentElement.clientHeight }; }); }
  var a1 = await semRolagem("#edFrame");
  confere(a1.rola <= 1, "edição (computador): o quadro mostra o report inteiro, sem rolagem dentro · " + JSON.stringify(a1));
  await p.click('.ferramentas button[data-ew="390px"]'); await p.waitForTimeout(700);
  var a2 = await semRolagem("#edFrame");
  confere(a2.rola <= 1 && a2.conteudo > a1.conteudo, "edição (celular): o report inteiro aparece, rolando só a página · " + JSON.stringify(a2));
  await p.screenshot({ path: path.join(SAIDA, "leveza-celular.png") });
  await p.click('.ferramentas button[data-ew="100%"]'); await p.waitForTimeout(500);

  /* 3. Imagem pesada (PNG de 3000 px): entra como JPEG no tamanho de uso */
  p.__respostas = ["Foto fictícia"];
  var fc = await Promise.all([p.waitForEvent("filechooser"), ferramenta(f, '[data-item="lancamento-1"] [data-campo="lancamento-1.nome"]', "+ Imagem")]);
  await fc[0].setFiles(FOTO);
  await p.waitForFunction(function () { return !!document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="lancamento-1-print-1"]'); }, null, { timeout: 15000 });
  var im = await midiaDe(p, 'img[data-img="lancamento-1-print-1"]', "src"), zz = await midiaDe(p, 'img[data-img="lancamento-1-print-1"]', "data-ampliar");
  im = { src: im.tipo, n: im.tam, zt: zz.tipo, z: zz.tam };
  confere(/image\/jpeg/.test(im.src) && im.n < 120 * 1024 && /image\/jpeg/.test(im.zt) && im.z < 400 * 1024, "imagem de " + kb(tamFoto) + " (PNG) vira JPEG: " + kb(im.n) + " na página, " + kb(im.z) + " ampliada");

  /* 4. Vídeo pesado: otimizado no navegador */
  var fv = await Promise.all([p.waitForEvent("filechooser"), ferramenta(f, 'img[data-img="principal"]', "Trocar vídeo")]);
  await fv[0].setFiles(VID);
  await p.waitForSelector("#modal:not([hidden])");
  confere(/Vídeo pesado/.test(await p.$eval("#modalTit", function (e) { return e.textContent; })), "vídeo de " + kb(tamVid) + ": pergunta se otimiza");
  await p.click("#modalOk");
  await p.waitForSelector("#progVideo", { timeout: 10000 });
  confere(true, "otimizando, com a barra de andamento");
  await p.waitForFunction(function () { return /otimizado/.test(document.querySelector("#estado").textContent); }, null, { timeout: 60000 });
  var vid = await midiaDe(p, 'img[data-img="principal"]', "data-video"); vid = { tipo: vid.tipo, n: vid.tam };
  confere(/video\/webm/.test(vid.tipo) && vid.n < tamVid * 0.6, "vídeo otimizado: " + kb(tamVid) + " → " + kb(vid.n) + " · " + await p.$eval("#estado", function (e) { return e.textContent.slice(0, 90); }));

  /* 5. Destaques do resumo (4.13): a lista do report mostra o nome da campanha, e aviso de repetição com a frase */
  await p.fill("#link", "https://www.example.com/report-ficticio");
  await p.waitForFunction(function () { return document.querySelectorAll("#dtqEscolhidos .dtq").length > 0 && document.querySelectorAll("#dtqLista button").length > 0; }, null, { timeout: 30000 });
  var cab = await p.$$eval("#dtqLista .grupo > b", function (l) { return l.map(function (x) { return x.textContent; }); });
  var tags = await p.$$eval("#dtqEscolhidos .dtq .tag", function (l) { return l.map(function (x) { return x.textContent; }); });
  confere(cab.some(function (x) { return /Campanha Exemplo A/.test(x); }) && tags.some(function (x) { return /CAMPANHA EXEMPLO A/.test(x); }), "destaques com o nome da campanha (na lista e no cartão) · " + cab[0] + " · " + tags[0]);
  await p.mouse.move(2, 2); await p.waitForTimeout(900);
  await f.locator('[data-campo="frase"][data-ed-campo]').first().click({ position: { x: 4, y: 6 } }); await p.waitForTimeout(150);
  await p.keyboard.press("Control+A"); await p.keyboard.type("12,5% no indicador A"); await p.keyboard.press("Enter");
  await p.waitForFunction(function () { return /já está na frase/.test(document.querySelector("#dtq").textContent); }, null, { timeout: 30000 });
  confere(true, "frase com o número: o item mostra \"já está na frase do mês\"");
  var sug = await p.$$eval("#dtqEscolhidos .dtq[data-origem]", function (l) { return l.map(function (x) { return x.getAttribute("data-origem"); }); });
  confere(sug.indexOf("numero-1") < 0 && sug.length > 0, "a sugestão deixa de fora o número que já está na frase · " + sug.join(","));
  /* escolhido de propósito, o número repetido continua possível, com aviso */
  await p.click('#dtqLista button[data-origem="numero-1"]');
  await p.waitForFunction(function () { return /Repete a frase do mês/.test(document.querySelector("#etapas") ? document.querySelector("#etapas").textContent : document.body.textContent); }, null, { timeout: 30000 });
  confere(true, "e o status avisa a repetição enquanto ele estiver escolhido");

  /* 6. Prévia do e-mail no celular: inteira, sem rolagem dentro */
  await p.click('button[data-w="390px"]'); await p.waitForTimeout(800);
  var a3 = await semRolagem("#prev");
  confere(a3.rola <= 1, "prévia (celular): o e-mail inteiro aparece, sem rolagem dentro · " + JSON.stringify(a3));
  var prevHtml = await p.$eval("#prev", function (e) { return e.srcdoc; });
  confere(!/rel="icon"/.test(prevHtml), "e-mail-resumo sem ícone de aba");

  /* 7. Salvar: o report leva a chama (sem PF) e fica leve */
  await p.click("#bSalvar");
  await p.waitForFunction(function () { return window.__salvos.length === 1; }, null, { timeout: 30000 });
  var salvo = await p.evaluate(function () { return window.__salvos[0]; });
  fs.writeFileSync(path.join(SAIDA, "leveza-" + salvo.nome), salvo.html);
  var cabS = salvo.html.slice(0, salvo.html.indexOf("</head>")), corpoS = salvo.html.slice(salvo.html.indexOf("</head>"));
  var svgS = (/<link rel="icon" type="image\/svg\+xml"[^>]*href="([^"]*)"/.exec(cabS) || [])[1] || "";
  confere(/PF<\/text>/.test(decodeURIComponent(svgS)) && /sizes="32x32"/.test(cabS) && (cabS.match(/rel="icon"/g) || []).length === 3, "report salvo: ícone da aba Santander + PF (sem ícones repetidos)");
  confere(!/santander-pf|PF%3C\/text|marca-pf/.test(corpoS), "report salvo: o símbolo fica só na aba, fora do conteúdo");
  confere(Buffer.byteLength(salvo.html) < 2.5 * 1048576, "report salvo com foto e vídeo pesados: " + kb(Buffer.byteLength(salvo.html)) + " (os originais somam " + kb(tamVid + tamFoto) + ")");

  /* 8. Reabrir um report pesado (imagem PNG enorme embutida): fica mais leve ao abrir */
  var pesado = fs.readFileSync(path.join(RAIZ, "kit/report-exemplo.html"), "utf8"), b64 = fs.readFileSync(FOTO).toString("base64"), n = 0;
  pesado = pesado.replace(/(<img\b[^>]*\bdata-img="lancamento-1"[^>]*\ssrc="|<img\b[^>]*\ssrc=")data:image\/png;base64,[^"]*("[^>]*\bdata-img="lancamento-1")/, function (m, a, b) { n++; return a + "data:image/png;base64," + b64 + b; });
  var arqP = path.join(SAIDA, "teste-report-pesado.html"); fs.writeFileSync(arqP, pesado);
  var p2 = await ctx.newPage(); p2.on("pageerror", function (e) { erros.push(e.message); });
  await p2.goto(URL_EMULADOR); await p2.setInputFiles("#arquivo", arqP);
  await p2.waitForFunction(function () { return /Otimizei/.test(document.querySelector("#estado").textContent); }, null, { timeout: 30000 }).catch(function () {});
  var est = await p2.$eval("#estado", function (e) { return e.textContent; });
  var lanc = (await midiaDe(p2, 'img[data-img="lancamento-1"]', "src")).tam;
  confere(n === 1 && /Otimizei/.test(est) && lanc < 200 * 1024, "report com imagem de " + kb(tamFoto) + ": ao abrir, ela cai para " + kb(lanc) + " · " + est.slice(0, 80));
  await p2.close({ runBeforeUnload: false });

  /* 9. Status: cada pendência tem "Ir até lá"; URL válida não dá aviso e vai gravada no report; "Creative X" não é pendência */
  var p3 = await ctx.newPage(); p3.on("pageerror", function (e) { erros.push(e.message); });
  async function etapaRes(pg) { return pg.$eval("#et-resumir", function (li) { return { estado: li.dataset.estado, itens: Array.prototype.map.call(li.querySelectorAll("ul li"), function (x) { return x.textContent; }) }; }); }
  async function espera(pg) { await pg.waitForTimeout(1300); await pg.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 60000 }); }
  await p3.goto(URL_EMULADOR); await p3.click("#bModelo"); await p3.fill("#link", "https://www.example.com/r"); await espera(p3);
  var e1 = await etapaRes(p3);
  confere(e1.estado === "aviso" && e1.itens.some(function (x) { return /texto do modelo/.test(x) && /Ir até lá/.test(x); }), "modelo em branco: cada texto do modelo no status tem \"Ir até lá\" · " + e1.itens.length + " item(ns)");
  var primeiro = await p3.$eval("#et-resumir ul li:has(button)", function (li) { return li.firstChild.textContent.replace(/^Ainda é texto do modelo: /, ""); });
  await p3.click("#et-resumir ul li:has(button) button"); await p3.waitForTimeout(300);
  var foco = await p3.evaluate(function () { var d = document.querySelector("#edFrame").contentDocument, a = d.activeElement; return a ? (a.getAttribute("data-campo") || "") + " = " + a.textContent.trim().slice(0, 40) : ""; });
  confere(/=/.test(foco) && primeiro.indexOf(foco.split(" = ")[1].slice(0, 15)) >= 0, "\"Ir até lá\" leva ao campo, com o cursor dentro · " + foco);
  await p3.keyboard.press("Control+A"); await p3.keyboard.type("Texto real fictício"); await p3.keyboard.press("Enter"); await espera(p3);
  var e2 = await etapaRes(p3);
  confere(!e2.itens.some(function (x) { return x.indexOf(primeiro) >= 0; }), "editado o campo, o item sai do status · " + primeiro);
  await p3.close({ runBeforeUnload: false });
  var p4 = await ctx.newPage(); p4.on("pageerror", function (e) { erros.push(e.message); });
  await p4.goto(URL_EMULADOR); await p4.setInputFiles("#arquivo", path.join(RAIZ, "kit/report-exemplo.html")); await espera(p4);
  await p4.fill("#link", "report-2099-01.html"); await espera(p4);
  var e3 = await etapaRes(p4), b3 = await p4.$eval("#banner", function (b) { return b.className + " · " + b.textContent; }), i3 = await p4.$eval("#linkInfo", function (e) { return e.textContent; });
  /* só o nome do arquivo: aceito (vale qualquer link), mas no e-mail ele não abre: o status avisa (nunca um botão quebrado em silêncio) */
  confere(/relativo/.test(i3) && e3.itens.some(function (x) { return /só o nome do arquivo não abre/.test(x); }) && !(await p4.$eval("#bEmlRes", function (b) { return b.disabled; })), "link relativo: aceito, com nota no campo e aviso no status (no e-mail, só o nome não abre) · " + i3.slice(0, 70));
  for (var lv of ["empresa.sharepoint.com/sites/cs/report.html", "http://intranet/report.html", "Link do report: https://empresa.sharepoint.com/:u:/r/sites/cs/r.html?csf=1&web=1", "mailto:time@example.com"]) {
    await p4.fill("#link", lv); await espera(p4);
    var ev = await etapaRes(p4), bv = await p4.$eval("#banner", function (b) { return b.className; }), hv = ((await p4.$eval("#prev", function (e) { return e.srcdoc; })).match(/<a class="cta[^"]*" href="([^"]*)"/) || [])[1];
    confere(ev.estado === "ok" && /banner ok/.test(bv) && !!hv, "\"" + lv.slice(0, 40) + "\": aceito sem aviso e aplicado ao botão · " + hv);
  }
  /* o link vai gravado no report: salvar, reabrir e o campo vem preenchido */
  await p4.fill("#link", "https://empresa.sharepoint.com/sites/cs/report-ficticio.html"); await espera(p4);
  await p4.evaluate(function () { window.__salvos = []; window.showSaveFilePicker = async function (o) { return { name: o.suggestedName, createWritable: async function () { var pt = []; return { write: async function (b) { pt.push(await b.text()); }, close: async function () { window.__salvos.push(pt.join("")); } }; } }; }; });
  await p4.click("#bSalvar"); await p4.waitForFunction(function () { return window.__salvos.length === 1; }, null, { timeout: 30000 });
  var hs = await p4.evaluate(function () { return window.__salvos[0]; }), arqL = path.join(SAIDA, "leveza-link.html"); fs.writeFileSync(arqL, hs);
  confere(/<meta name="report-completo" content="https:\/\/empresa\.sharepoint\.com\/sites\/cs\/report-ficticio\.html">/.test(hs), "link gravado no report salvo");
  var p5 = await ctx.newPage(); await p5.goto(URL_EMULADOR); await p5.setInputFiles("#arquivo", arqL); await espera(p5);
  confere(await p5.$eval("#link", function (e) { return e.value; }) === "https://empresa.sharepoint.com/sites/cs/report-ficticio.html", "reaberto: o campo do link já vem preenchido");
  await p5.close({ runBeforeUnload: false });
  /* report com o caminho do computador gravado (pasta do OneDrive): reabre com o caminho no campo e o e-mail-resumo liberado */
  var arqV = path.join(SAIDA, "leveza-link-local.html"), caminhoV = "file:///C:/Users/t000000/OneDrive%20-%20Empresa/Report%20PF/Produção/report-2099-01.html";
  fs.writeFileSync(arqV, hs.replace(/(<meta name="report-completo" content=")[^"]*"/, "$1" + caminhoV + "\""));
  var p6 = await ctx.newPage(); await p6.goto(URL_EMULADOR); await p6.setInputFiles("#arquivo", arqV); await espera(p6);
  await p6.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 });
  var hv6 = ((await p6.$eval("#prev", function (e) { return e.srcdoc; })).match(/<a class="cta[^"]*" href="([^"]*)"/) || [])[1];
  confere(await p6.$eval("#link", function (e) { return e.value; }) === caminhoV && hv6 === caminhoV, "reaberto com o caminho do computador gravado: campo preenchido e o botão com o mesmo caminho · " + hv6);
  await p6.close({ runBeforeUnload: false });
  var f4 = await (await p4.$("#edFrame")).contentFrame();
  await f4.locator('[data-campo="numero-1.detalhe"][data-ed-campo]').first().click({ position: { x: 4, y: 6 } }); await p4.waitForTimeout(150);
  await p4.keyboard.press("Control+A"); await p4.keyboard.type("Creative X 64%"); await p4.keyboard.press("Enter"); await espera(p4);
  var e5 = await etapaRes(p4);
  confere(e5.estado === "ok" && !e5.itens.some(function (x) { return /texto do modelo/.test(x); }), "\"Creative X 64%\" não é texto do modelo (o X só conta no lugar de um número)");
  await p4.close({ runBeforeUnload: false });

  await browser.close();
  if (erros.length) { console.log("ERROS NA PÁGINA:", erros.slice(0, 5)); falhas++; }
  console.log(falhas ? falhas + " falha(s)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})();
