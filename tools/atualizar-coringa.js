/*
 * Atualiza o modelo em branco ("coringa") depois de mudar o template ou dados/CORINGA.txt.
 * Faz o que está em docs/ARQUITETURA.md: gera a página de dados/CORINGA.txt pelo gerar-report.html
 * (num navegador de verdade, como uma pessoa faria) e grava kit/report-coringa.html e tools/coringa.js.
 * Uso técnico (quem mantém a ferramenta). Requer Node.js + Playwright:
 *   node tools/atualizar-coringa.js        (depois: node tools/montar-avulso.js e os testes)
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, "..");
(async function () {
  var browser = await chromium.launch(), page = await browser.newPage({ acceptDownloads: true }), erros = [];
  page.on("pageerror", function (e) { erros.push(e.message); });
  await page.goto("file://" + path.join(RAIZ, "gerar-report.html"));
  await page.setInputFiles("#pasta", RAIZ);
  await page.waitForSelector("#secConf:not([hidden])", { timeout: 30000 });
  await page.selectOption("#mes", "dados/CORINGA.txt");
  await page.waitForFunction(function () { return /pend|faltam|pronto/i.test(document.getElementById("banner").textContent); }, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  if (await page.$eval("#bHtml", function (b) { return b.disabled; })) await page.check("#rascunho");
  var d = await Promise.all([page.waitForEvent("download"), page.click("#bHtml")]);
  var tmp = await d[0].path(), html = fs.readFileSync(tmp, "utf8");
  await browser.close();
  if (erros.length) { console.error("Erros na página:", erros); process.exit(1); }
  fs.writeFileSync(path.join(RAIZ, "kit", "report-coringa.html"), html);
  var js = "/* Modelo em branco (\"coringa\") do report, aberto pelo emulador em \"Começar do modelo em branco\".\n" +
    "   Gerado a partir de dados/CORINGA.txt (sem dado real). Não edite à mão: veja docs/ARQUITETURA.md. */\n" +
    "window.CORINGA_HTML = " + JSON.stringify(html).replace(/</g, "\\u003c") + ";\n";
  fs.writeFileSync(path.join(RAIZ, "tools", "coringa.js"), js);
  console.log("Modelo em branco atualizado: kit/report-coringa.html e tools/coringa.js (" + Math.round(Buffer.byteLength(js) / 1024) + " KB)");
})();
