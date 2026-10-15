/*
 * Teste de ponta a ponta da página converter-html-eml.html (uso técnico, opcional).
 * Simula o caso real: a página do mês aberta no Chrome (com a ampliação e o vídeo
 * ativos), editada à mão (texto pelo designMode e um print colado pelo Inspecionar,
 * com o bloco que o próprio conversor oferece) e salva como "Página da Web, completa".
 * Depois converte e confere: e-mail completo, e-mail resumido (com o link da versão
 * interativa, miniatura de vídeo sem ▶), versão interativa (print embutido, botão
 * "Assistir ao vídeo") e o "Acompanhar o arquivo".
 *   Requer Node.js + Playwright:  node tests/conversor.e2e.js [pasta-de-saida]
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function htmlDoEml(eml) {
  var m = /Content-Type: text\/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/.exec(eml);
  return Buffer.from(m[1].replace(/\r\n/g, ""), "base64").toString("utf8");
}
async function esperaFim(c) {
  await c.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 30000 });
}

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var PASTA = path.join(SAIDA, "pagina"); fs.rmSync(PASTA, { recursive: true, force: true }); fs.mkdirSync(PASTA);
  var browser = await chromium.launch();

  /* 0. O conversor (com o seletor moderno simulado, para testar o "Acompanhar o arquivo"). */
  var c = await browser.newPage({ acceptDownloads: true, viewport: { width: 1200, height: 900 } });
  var erros = [];
  c.on("pageerror", function (e) { erros.push(e.message); });
  c.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
  await c.addInitScript(function () {
    window.__arquivo = null;
    window.showOpenFilePicker = async function () { return [{ kind: "file", getFile: async function () { return window.__arquivo; } }]; };
  });
  await c.goto("file://" + path.join(RAIZ, "converter-html-eml.html"));
  var bloco = (await c.$eval("#snippet", function (e) { return e.value; })).replace("NOME-DO-PRINT-1.png", "print-teste.png").replace(/DESCREVA O PRINT 1/g, "Tela do agente de teste");

  /* 1. Página do mês como sai da ferramenta: o backup + uma peça ampliável + um vídeo (com a miniatura sem ▶). */
  var base = fs.readFileSync(path.join(RAIZ, "report_backup.html"), "utf8"), n = 0, srcs = [];
  base.replace(/<img\b[^>]*?\ssrc="(data:image\/[^"]+)"/g, function (m, s) { srcs.push(s); return m; });
  base = base.replace(/<img\b([^>]*?)\ssrc="(data:image\/[^"]+)"/g, function (m, a, src) {
    n++;
    /* 1ª imagem (na capa, que o resumido mantém) vira o vídeo; a 2ª, peça ampliável. */
    if (n === 1) return m + ' data-video="data:video/mp4;base64,AAAA" data-legenda="Vídeo de teste" data-thumb="' + srcs[2] + '"';
    if (n === 2) return m + ' data-ampliar="' + src + '" data-legenda="Peça de teste"';
    return m;
  });
  base = base.replace(/<img\b[^>]*data-video="[^"]*"[^>]*>/, function (t) { return t.replace(/ alt="[^"]*"/, ' alt="Vídeo: vídeo de teste"'); });
  var arqNav = path.join(PASTA, "pagina-navegador.html");
  fs.writeFileSync(arqNav, Motor.paraNavegador(base));

  /* 2. Abre no "Chrome", edita um texto, cola um print pelo "Inspecionar" e salva como o Chrome salva (DOM atual). */
  var p = await browser.newPage();
  await p.goto("file://" + arqNav);
  await p.waitForSelector("#amp", { state: "attached" });
  confere(await p.$$eval(".vidpill", function (l) { return l.length; }) === 1, "página: o vídeo ganha o botão \"Assistir ao vídeo\"");
  /* Print de 1600 px (maior que o limite de 1200 px), ao lado do .html. */
  var png = await p.evaluate(function () {
    var cv = document.createElement("canvas"); cv.width = 1600; cv.height = 900;
    var g = cv.getContext("2d"); g.fillStyle = "#2B6CB0"; g.fillRect(0, 0, 1600, 900); g.fillStyle = "#FFFFFF"; g.font = "bold 80px Arial"; g.fillText("PRINT DE TESTE", 400, 470);
    return cv.toDataURL("image/png").split(",")[1];
  });
  fs.writeFileSync(path.join(PASTA, "print-teste.png"), Buffer.from(png, "base64"));
  async function editarESalvar(texto, destino, comPrint) {
    await p.evaluate(function (o) {
      document.designMode = "on";
      var alvo = Array.prototype.find.call(document.querySelectorAll("p"), function (x) { return /Lorem|EDITADO/.test(x.textContent); });
      alvo.textContent = o.texto;
      if (o.print && !document.querySelector('img[src="print-teste.png"]')) {
        var td = Array.prototype.find.call(document.querySelectorAll('[data-bloco="transformation-1"] td'), function (t) { return t.querySelector("p.ft"); });
        td.insertAdjacentHTML("beforeend", o.print);
      }
    }, { texto: texto, print: comPrint ? bloco : "" });
    var html = "<!-- saved from url=(0014)about:internet -->\n" + await p.content();
    fs.writeFileSync(destino, html);
    return html;
  }
  var arqEd = path.join(PASTA, "pagina-editada.html");
  var editado = await editarESalvar("TEXTO EDITADO NO CHROME", arqEd, true);
  console.log("ENTRADA: " + Math.round(editado.length / 1024) + " KB, script: " + /<script/.test(editado) + ", janela #amp: " + /id="amp"/.test(editado) + ", botão do vídeo: " + /class="vidpill"/.test(editado) + ", print colado: " + /print-teste\.png/.test(editado));

  /* 3. Converte (sem link: sai o completo; o resumido pede o link). */
  await c.setInputFiles("#pasta", PASTA);
  await c.setInputFiles("#arquivo", arqEd);
  await esperaFim(c);
  console.log("STATUS: " + await c.$eval("#banner", function (e) { return e.textContent; }));
  console.log("ETAPAS:\n  " + (await c.$$eval("#etapas > li", function (l) {
    return l.map(function (x) { return x.dataset.estado.toUpperCase() + " · " + x.querySelector(".et").innerText.replace(/\n/g, " / "); });
  })).join("\n  "));
  confere(await c.$eval("#barra", function (e) { return e.getAttribute("aria-valuenow"); }) === "100", "barra de progresso chegou a 100%");
  confere(!(await c.$eval("#bEml", function (b) { return b.disabled; })) && await c.$eval("#bEmlRes", function (b) { return b.disabled; }), "sem link: completo liberado, resumido espera o link");
  confere(/Para o resumido, falta o link/.test(await c.$eval("#banner", function (e) { return e.textContent; })), "status explica que falta o link");
  confere(/reduzida para 1200 px/.test(await c.$eval("#et-imagens", function (e) { return e.textContent; })), "print de 1600 px reduzido para 1200 px");

  var d = await Promise.all([c.waitForEvent("download"), c.click("#bEml")]);
  var arqEml = path.join(SAIDA, d[0].suggestedFilename());
  await d[0].saveAs(arqEml);
  var eml = fs.readFileSync(arqEml, "latin1"), html = htmlDoEml(eml);
  console.log("EML COMPLETO: " + d[0].suggestedFilename() + " (" + Math.round(eml.length / 1024) + " KB)");
  confere(/^X-Unsent: 1\r\n/.test(eml), "abre como mensagem nova (X-Unsent)");
  confere(html.indexOf("TEXTO EDITADO NO CHROME") >= 0, "a edição feita no navegador está no e-mail");
  confere(!/<script/i.test(html) && !/id="amp"/.test(html) && !/data-(ampliar|video|legenda|thumb)=/.test(html), "sem script, janela de ampliação nem atributos da página");
  confere(!/class="vidpill"|Assistir ao v/.test(html), "sem o botão \"Assistir ao vídeo\" (só existe na página)");
  confere(!/tabindex="0"|role="button"|contenteditable|saved from url/.test(html), "sem marcas do clique, da edição e do Chrome");
  confere(!/src="data:/.test(html) && !/src="print-teste\.png"/.test(html), "nenhuma imagem embutida nem arquivo solto: tudo virou anexo");
  var cids = (html.match(/src="cid:([^"]+)"/g) || []).map(function (s) { return s.slice(9, -1); });
  var anexos = (eml.match(/Content-ID: <([^>]+)>/g) || []).map(function (s) { return s.slice(13, -1); });
  confere(cids.length > 0 && cids.every(function (x) { return anexos.indexOf(x) >= 0; }), cids.length + " imagens no HTML, todas anexadas (" + anexos.length + " anexos)");
  confere(/alt="Tela do agente de teste"/.test(html), "o print colado entrou no e-mail completo");
  confere(Motor.conferirHtml(html).filter(function (x) { return x.nivel === "erro"; }).length === 0, "conferência do Outlook sem erros");

  /* 4. Versão interativa: print embutido, ampliação e botão do vídeo funcionando. */
  d = await Promise.all([c.waitForEvent("download"), c.click("#bInterativa")]);
  var arqInt = path.join(SAIDA, d[0].suggestedFilename());
  await d[0].saveAs(arqInt);
  var inter = fs.readFileSync(arqInt, "utf8");
  confere(!/src="print-teste\.png"/.test(inter) && /<img src="data:image\/png;base64,[^"]+"[^>]*alt="Tela do agente de teste"/.test(inter), "versão interativa: o print vai embutido (sobe sozinho para o SharePoint)");
  var pi = await browser.newPage();
  await pi.goto("file://" + arqInt);
  confere(await pi.evaluate(function () { return document.querySelectorAll("#amp").length === 1 && document.querySelectorAll(".vidpill").length === 1; }), "versão interativa: uma janela de ampliação e um botão de vídeo (sem duplicar)");
  await pi.click('img[alt="Tela do agente de teste"]');
  confere(await pi.evaluate(function () { var a = document.getElementById("amp"); return a.hasAttribute("open") && /^data:image\//.test(a.querySelector("img").src); }), "versão interativa: o print abre maior no clique");
  await pi.keyboard.press("Escape");
  await pi.click(".vidpill");
  confere(await pi.evaluate(function () { var v = document.querySelector("#amp video"); return document.getElementById("amp").hasAttribute("open") && v.style.display !== "none" && /^data:video/.test(v.getAttribute("src")); }), "versão interativa: \"Assistir ao vídeo\" abre o vídeo");
  await pi.close();

  /* 5. Com o link: sai o resumido. */
  var LINK = "https://empresa.sharepoint.com/sites/creative/report.html";
  await c.fill("#link", LINK);
  await c.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 });
  console.log("STATUS COM LINK: " + await c.$eval("#banner", function (e) { return e.textContent; }));
  confere((await c.$$eval("#secoes input:checked", function (l) { return l.map(function (x) { return x.value; }); })).join(",") === "capa,resumo,foco,rodape", "seções do resumido marcadas por padrão");
  confere(/1 miniatura\(s\) de vídeo sem ▶/.test(await c.$eval("#et-resumir", function (e) { return e.textContent; })), "status: miniatura de vídeo sem ▶ no resumido");
  d = await Promise.all([c.waitForEvent("download"), c.click("#bEmlRes")]);
  var arqRes = path.join(SAIDA, d[0].suggestedFilename());
  await d[0].saveAs(arqRes);
  var emlRes = fs.readFileSync(arqRes, "latin1"), htmlRes = htmlDoEml(emlRes);
  console.log("EML RESUMIDO: " + d[0].suggestedFilename() + " (" + Math.round(emlRes.length / 1024) + " KB)");
  confere(htmlRes.indexOf('href="' + LINK + '"') > 0 && /Ver o report completo \(interativo\)/.test(htmlRes), "resumido: botão com o link da versão interativa");
  confere(!/secao:(lancamos|cx|transformation|aprendizados|agenda)-->/.test(htmlRes) && /secao:foco-->/.test(htmlRes), "resumido: só as seções escolhidas");
  confere(htmlRes.indexOf("TEXTO EDITADO NO CHROME") >= 0, "resumido: a edição do navegador continua");
  confere(/alt="vídeo de teste"/.test(htmlRes) && !/alt="Vídeo:/.test(htmlRes) && !/<a\b[^>]*>\s*<img\b[^>]*alt="vídeo de teste"/.test(htmlRes), "resumido: miniatura do vídeo sem \"Vídeo:\" e sem link");
  /* A miniatura do vídeo no resumido é a versão sem ▶ (data-thumb), idêntica byte a byte. */
  var cidThumb = /<img\b[^>]*src="cid:([^"]+)"[^>]*alt="vídeo de teste"|<img\b[^>]*alt="vídeo de teste"[^>]*src="cid:([^"]+)"/.exec(htmlRes);
  var idT = cidThumb && (cidThumb[1] || cidThumb[2]);
  var parteT = idT && new RegExp("Content-ID: <" + idT.replace(/[.@]/g, "\\$&") + ">\\r\\nContent-Disposition: inline;\\r\\n filename=\"[^\"]+\"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--").exec(emlRes);
  confere(parteT && parteT[1].replace(/\r\n/g, "") === srcs[2].split(",")[1], "resumido: a miniatura é a versão sem ▶");
  confere(emlRes.length < eml.length, "resumido menor que o completo (" + Math.round(emlRes.length / 1024) + " KB vs " + Math.round(eml.length / 1024) + " KB)");
  confere(Motor.conferirHtml(htmlRes).filter(function (x) { return x.nivel === "erro"; }).length === 0, "resumido: conferência do Outlook sem erros");
  await c.screenshot({ path: path.join(SAIDA, "conversor.png"), fullPage: true });

  /* 6. Acompanhar o arquivo: escolhe pelo seletor moderno e "salva" de novo. */
  async function trocarArquivo(conteudo, quando) {
    await c.evaluate(function (o) { window.__arquivo = new File([o.c], "pagina-editada.html", { type: "text/html", lastModified: o.t }); }, { c: conteudo, t: quando });
  }
  await trocarArquivo(editado, 1000);
  await c.click("#escolher");
  await c.waitForFunction(function () { return /Acompanhando/.test(document.querySelector("#vigiaTxt").textContent) && !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 });
  confere(await c.$eval("#ponto", function (e) { return e.classList.contains("on"); }), "indicador de acompanhamento ligado");
  var segunda = await editarESalvar("SEGUNDA EDIÇÃO SALVA", arqEd, false);
  await trocarArquivo(segunda, 2000);
  await c.waitForFunction(function () { return /SEGUNDA EDIÇÃO SALVA/.test(document.querySelector("#prev").srcdoc) && !document.querySelector("#bEml").disabled; }, null, { timeout: 30000 });
  confere(/salvo de novo/.test(await c.$eval("#log", function (e) { return e.textContent; })), "converteu de novo sozinho quando o arquivo mudou");

  /* 7. Imagem que falta (arquivo que não está na pasta escolhida): avisa e não deixa baixar. */
  await trocarArquivo(editado.replace(/src="print-teste\.png"/, 'src="nao-existe.png"'), 3000);
  await c.waitForFunction(function () { return /banner err/.test(document.querySelector("#banner").className); }, null, { timeout: 30000 });
  confere(/nao-existe\.png/.test(await c.$eval("#et-imagens", function (e) { return e.textContent; })), "imagem faltando: o status diz qual");
  confere(await c.$eval("#bEml", function (b) { return b.disabled; }) && await c.$eval("#bEmlRes", function (b) { return b.disabled; }), "imagem faltando: não deixa baixar");

  confere(erros.length === 0, "sem erros no console" + (erros.length ? ": " + erros.join(" | ") : ""));
  await browser.close();
  console.log(falhas ? falhas + " FALHA(S)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
