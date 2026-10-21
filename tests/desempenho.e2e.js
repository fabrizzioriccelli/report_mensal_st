/*
 * Desempenho do emulador (uso técnico, opcional), só com conteúdo sintético: monta um report pesado (o exemplo do kit
 * com fotos grandes no lugar das imagens, vídeo e PDF embutidos, ~27 MB) e mede, com a CPU 4× mais lenta (notebook
 * modesto): abrir o report, editar um texto e salvar. "Tarefa longa" = a página parada, sem responder.
 * Falha se voltar a travar: maior tarefa longa acima de 1 s, status depois de uma edição acima de 3 s, ou edição com travamento.
 *   Requer Node.js + Playwright e ffmpeg:  node tests/desempenho.e2e.js [pasta-de-saida]
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/desempenho.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs"), cp = require("child_process");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var EMU = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var foto = path.join(SAIDA, "desemp-foto.jpg"), video = path.join(SAIDA, "desemp-video.webm"), arq = path.join(SAIDA, "desemp-report-pesado.html");
  if (!fs.existsSync(foto)) cp.execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1600x1066,noise=alls=25:allf=t", "-frames:v", "1", "-q:v", "5", foto]);
  if (!fs.existsSync(video)) cp.execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1920x1080:rate=30", "-f", "lavfi", "-i", "sine=frequency=440", "-t", "12", "-c:v", "libvpx", "-b:v", "5M", "-c:a", "libopus", "-shortest", video]);
  var h = fs.readFileSync(path.join(RAIZ, "kit/report-exemplo.html"), "utf8");
  var f64 = "data:image/jpeg;base64," + fs.readFileSync(foto).toString("base64"), v64 = "data:video/webm;base64," + fs.readFileSync(video).toString("base64");
  var pdf = "data:application/pdf;base64," + Buffer.concat([Buffer.from("%PDF-1.4\n"), require("crypto").randomBytes(2000000), Buffer.from("\n%%EOF")]).toString("base64");
  h = h.replace(/(<img\b[^>]*?\ssrc=")data:image\/[^"]*(")/g, function (m, a, b) { return a + f64 + b; }).replace(/ data-ampliar="data:image\/[^"]*"/g, ' data-ampliar="' + f64 + '"')
    .replace(/ data-video="data:video\/[^"]*"/g, ' data-video="' + v64 + '"').replace(/(<a\b[^>]*class="cta"[^>]*)>/, '$1 data-anexo="' + pdf + '">');
  fs.writeFileSync(arq, h);
  var mb = Math.round(h.length / 1048576);

  var b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1366, height: 800 } }), p = await ctx.newPage(), erros = [];
  var cdp = await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  p.on("pageerror", function (e) { erros.push(e.message); }); p.on("dialog", function (d) { d.dismiss(); });
  await p.addInitScript(function () {
    window.__lt = []; try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { window.__lt.push([e.startTime, e.duration]); }); }).observe({ type: "longtask", buffered: true }); } catch (e) {}
    window.showSaveFilePicker = async function (o) { return { name: o.suggestedName, createWritable: async function () { var n = 0; return { write: async function (x) { n += x.size || 0; }, close: async function () { window.__salvo = n; } }; } }; };
  });
  function agora() { return p.evaluate(function () { return performance.now(); }); }
  function longas(a, z) { return p.evaluate(function (o) { var l = window.__lt.filter(function (x) { return x[0] >= o[0] && x[0] < o[1]; }); return { n: l.length, max: Math.round(Math.max.apply(null, [0].concat(l.map(function (x) { return x[1]; })))), soma: Math.round(l.reduce(function (s, x) { return s + x[1]; }, 0)) }; }, [a, z]); }
  function espera() { return p.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 600000, polling: 100 }); }
  await p.goto(EMU);

  var a = await agora(), t = Date.now();
  await p.setInputFiles("#arquivo", arq);
  await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 600000, polling: 100 });
  var tEd = Date.now() - t; await espera(); var tSt = Date.now() - t, l1 = await longas(a, await agora());
  confere(l1.max < 1000, "abrir um report de " + mb + " MB: editável em " + tEd + " ms, status em " + tSt + " ms · maior travamento " + l1.max + " ms (total " + l1.soma + " ms)");

  await p.waitForTimeout(1500);
  var f = await (await p.$("#edFrame")).contentFrame(), e0 = await agora(); t = Date.now();
  await f.locator('[data-campo="frase"][data-ed-campo]').first().click({ position: { x: 4, y: 6 } });
  await p.keyboard.type("Teste"); await p.keyboard.press("Enter"); await p.waitForTimeout(300); await espera();
  var tE = Date.now() - t; await p.waitForTimeout(2000); var l2 = await longas(e0, await agora());
  confere(tE < 3000 && l2.max < 200, "editar um texto: status refeito em " + tE + " ms · maior travamento " + l2.max + " ms");

  var s0 = await agora(); t = Date.now();
  await p.click("#bSalvar"); await p.waitForFunction(function () { return window.__salvo; }, null, { timeout: 600000, polling: 100 });
  var tS = Date.now() - t, l3 = await longas(s0, await agora());
  confere(l3.max < 1000, "salvar: " + tS + " ms · maior travamento " + l3.max + " ms · arquivo " + Math.round(await p.evaluate(function () { return window.__salvo; }) / 1048576 * 10) / 10 + " MB");

  await b.close();
  if (erros.length) { console.log("ERROS NA PÁGINA:", erros.slice(0, 5)); falhas++; }
  console.log(falhas ? falhas + " falha(s)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})();
