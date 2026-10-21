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
  async function ferramenta(f, alvo, botao) {
    await p.mouse.move(2, 2);
    await noQuadro(function (d, a) { d.querySelector(a).scrollIntoView({ block: "center" }); }, alvo);
    await f.hover(alvo, { position: { x: 6, y: 6 } }); await p.waitForTimeout(150);
    var c = await noQuadro(function (d, b) {
      var bt = Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }); if (!bt) return null;
      var q = document.querySelector("#edFrame").getBoundingClientRect(), x = bt.getBoundingClientRect(); return { x: q.left + x.left + x.width / 2, y: q.top + x.top + x.height / 2 };
    }, botao);
    if (!c) throw new Error("sem o botão " + botao + " em " + alvo);
    await p.mouse.click(c.x, c.y);
  }

  /* 1. Ícone da aba da ferramenta: chama + PF */
  var icone = await p.$eval('link[rel="icon"]', function (l) { return decodeURIComponent(l.getAttribute("href")); });
  confere(/EC0000/.test(icone) && />PF</.test(icone), "ferramenta: ícone da aba com a chama e o selo PF");

  /* 2. Abrir o exemplo: edição sem rolagem dentro do quadro, no computador e no celular */
  await p.setInputFiles("#arquivo", path.join(RAIZ, "kit/report-exemplo.html"));
  await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
  await p.waitForTimeout(800);
  var f = await (await p.$("#edFrame")).contentFrame();
  async function semRolagem(sel) { return p.$eval(sel, function (fr) { var d = fr.contentDocument; return { quadro: Math.round(fr.getBoundingClientRect().height), conteudo: d.documentElement.scrollHeight, rola: d.documentElement.scrollHeight - d.documentElement.clientHeight }; }); }
  var a1 = await semRolagem("#edFrame");
  confere(a1.rola <= 1, "edição (computador): o quadro mostra o report inteiro, sem rolagem dentro · " + JSON.stringify(a1));
  await p.click('.ferramentas button[data-ew="400px"]'); await p.waitForTimeout(700);
  var a2 = await semRolagem("#edFrame");
  confere(a2.rola <= 1 && a2.conteudo > a1.conteudo, "edição (celular): o report inteiro aparece, rolando só a página · " + JSON.stringify(a2));
  await p.screenshot({ path: path.join(SAIDA, "leveza-celular.png") });
  await p.click('.ferramentas button[data-ew="100%"]'); await p.waitForTimeout(500);

  /* 3. Imagem pesada (PNG de 3000 px): entra como JPEG no tamanho de uso */
  p.__respostas = ["Foto fictícia"];
  var fc = await Promise.all([p.waitForEvent("filechooser"), ferramenta(f, '[data-item="lancamento-1"] [data-campo="lancamento-1.nome"]', "+ Imagem")]);
  await fc[0].setFiles(FOTO);
  await p.waitForFunction(function () { return !!document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="lancamento-1-print-1"]'); }, null, { timeout: 15000 });
  var im = await noQuadro(function (d) { var i = d.querySelector('img[data-img="lancamento-1-print-1"]'); return { src: i.getAttribute("src").slice(0, 16), n: i.getAttribute("src").length * 0.75, z: (i.getAttribute("data-ampliar") || "").length * 0.75, zt: (i.getAttribute("data-ampliar") || "").slice(0, 16) }; });
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
  var vid = await noQuadro(function (d) { var v = d.querySelector('img[data-img="principal"]').getAttribute("data-video") || ""; return { tipo: v.slice(0, 16), n: v.length * 0.75 }; });
  confere(/video\/webm/.test(vid.tipo) && vid.n < tamVid * 0.6, "vídeo otimizado: " + kb(tamVid) + " → " + kb(vid.n) + " · " + await p.$eval("#estado", function (e) { return e.textContent.slice(0, 90); }));

  /* 5. Indicadores do resumo: o nome do projeto, e aviso de repetição com a frase */
  await p.fill("#link", "https://www.example.com/report-ficticio");
  await p.waitForFunction(function () { return document.querySelectorAll("#indicadores input").length > 0; }, null, { timeout: 30000 });
  var rot = await p.$$eval("#indicadores label", function (l) { return l.map(function (x) { return x.textContent; }); });
  confere(rot.some(function (x) { return /\(Campanha Exemplo A\)/.test(x); }) && !rot.some(function (x) { return /Projeto principal|Destaque do mês/.test(x); }), "indicadores com o nome do projeto, não \"Projeto principal\" · " + rot[0]);
  await p.mouse.move(2, 2); await p.waitForTimeout(900);
  await f.locator('[data-campo="frase"][data-ed-campo]').first().click({ position: { x: 4, y: 6 } }); await p.waitForTimeout(150);
  await p.keyboard.press("Control+A"); await p.keyboard.type("12,5% no indicador A"); await p.keyboard.press("Enter");
  await p.waitForFunction(function () { return /já está na frase/.test(document.querySelector("#indicadores").textContent); }, null, { timeout: 30000 });
  confere(true, "frase com o número: o indicador mostra \"já está na frase do mês\"");
  await p.waitForFunction(function () { return /Repete a frase do mês/.test(document.querySelector("#etapas") ? document.querySelector("#etapas").textContent : document.body.textContent); }, null, { timeout: 30000 });
  confere(true, "e o status avisa a repetição enquanto ele estiver marcado");

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
  var ic = (/<link rel="icon"[^>]*href="([^"]*)"/.exec(salvo.html) || [])[1] || "";
  confere(/EC0000/.test(decodeURIComponent(ic)) && !/>PF</.test(decodeURIComponent(ic)), "report salvo: ícone da aba é a chama (sem o PF)");
  confere(Buffer.byteLength(salvo.html) < 2.5 * 1048576, "report salvo com foto e vídeo pesados: " + kb(Buffer.byteLength(salvo.html)) + " (os originais somam " + kb(tamVid + tamFoto) + ")");

  /* 8. Reabrir um report pesado (imagem PNG enorme embutida): fica mais leve ao abrir */
  var pesado = fs.readFileSync(path.join(RAIZ, "kit/report-exemplo.html"), "utf8"), b64 = fs.readFileSync(FOTO).toString("base64"), n = 0;
  pesado = pesado.replace(/(<img\b[^>]*\bdata-img="lancamento-1"[^>]*\ssrc="|<img\b[^>]*\ssrc=")data:image\/png;base64,[^"]*("[^>]*\bdata-img="lancamento-1")/, function (m, a, b) { n++; return a + "data:image/png;base64," + b64 + b; });
  var arqP = path.join(SAIDA, "teste-report-pesado.html"); fs.writeFileSync(arqP, pesado);
  var p2 = await ctx.newPage(); p2.on("pageerror", function (e) { erros.push(e.message); });
  await p2.goto(URL_EMULADOR); await p2.setInputFiles("#arquivo", arqP);
  await p2.waitForFunction(function () { return /Otimizei/.test(document.querySelector("#estado").textContent); }, null, { timeout: 30000 }).catch(function () {});
  var est = await p2.$eval("#estado", function (e) { return e.textContent; });
  var lanc = await p2.evaluate(function () { var i = document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="lancamento-1"]'); return i.getAttribute("src").length * 0.75; });
  confere(n === 1 && /Otimizei/.test(est) && lanc < 200 * 1024, "report com imagem de " + kb(tamFoto) + ": ao abrir, ela cai para " + kb(lanc) + " · " + est.slice(0, 80));
  await p2.close({ runBeforeUnload: false });

  await browser.close();
  if (erros.length) { console.log("ERROS NA PÁGINA:", erros.slice(0, 5)); falhas++; }
  console.log(falhas ? falhas + " falha(s)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})();
