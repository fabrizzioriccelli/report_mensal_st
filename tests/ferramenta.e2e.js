/*
 * Teste de ponta a ponta da página gerar-report.html (uso técnico, opcional).
 * Abre a página num navegador de verdade, escolhe a pasta do projeto, lê a
 * conferência e baixa o .eml e o .html, como uma pessoa faria.
 *   Requer Node.js + Playwright:  node tests/ferramenta.e2e.js [pasta-de-saida]
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var browser = await chromium.launch();
  var page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1200, height: 900 } });
  var erros = [];
  page.on("pageerror", function (e) { erros.push(e.message); });
  await page.goto("file://" + path.join(RAIZ, "gerar-report.html"));
  await page.setInputFiles("#pasta", RAIZ);
  await page.waitForSelector("#secConf:not([hidden])", { timeout: 20000 });
  await page.waitForTimeout(800);
  console.log("MÊS:", await page.$eval("#mes", function (s) { return s.value; }));
  console.log("CONFERÊNCIA:", await page.$eval("#banner", function (e) { return e.textContent; }));
  console.log("IMAGENS:\n  " + (await page.$$eval("#imgs tr", function (t) { return t.map(function (r) { return r.innerText.replace(/\t/g, " | "); }); })).join("\n  "));
  console.log("LINKS:\n  " + (await page.$$eval("#links tr", function (t) { return t.map(function (r) { return r.innerText.replace(/\t/g, " | "); }); })).join("\n  "));
  var final = await page.$eval("#bEml", function (b) { return b.disabled; });
  if (final) await page.check("#rascunho");
  var d = await Promise.all([page.waitForEvent("download"), page.click("#bEml")]);
  await d[0].saveAs(path.join(SAIDA, d[0].suggestedFilename()));
  console.log("EML:", await page.$eval("#gerarInfo", function (e) { return e.textContent; }));
  d = await Promise.all([page.waitForEvent("download"), page.click("#bHtml")]);
  await d[0].saveAs(path.join(SAIDA, d[0].suggestedFilename()));
  console.log("HTML:", d[0].suggestedFilename());
  await page.screenshot({ path: path.join(SAIDA, "ferramenta.png"), fullPage: true });
  await browser.close();
  if (erros.length) { console.log("ERROS NA PÁGINA:", erros); process.exit(1); }
})();
