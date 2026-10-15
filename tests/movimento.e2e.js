/*
 * Teste de ponta a ponta do movimento na página do navegador (uso técnico, opcional).
 * Monta um report com números SINTÉTICOS (não são resultados reais), abre no navegador
 * e confere: barra de leitura, seções aparecendo na rolagem, números contando até o
 * valor exato, barra do Creative X crescendo, "reduzir movimento" e que a página salva
 * no meio da animação volta limpa para o e-mail.
 *   Requer Node.js + Playwright:  node tests/movimento.e2e.js [pasta-de-saida]
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function ler(p) { return fs.readFileSync(path.join(RAIZ, p), "utf8"); }

var DADOS = [
  "[EDICAO]", "mes: Outubro", "ano: 2026", "proximo_mes: Novembro", "pasta_imagens: assets/icones",
  "[ABERTURA]", "frase: Um mês", "frase_final: de teste.",
  "[PROJETO PRINCIPAL]", "nome: Projeto", "imagem: icone-prancheta.png", "tipo: peca", "link:",
  "[NUMERO 1]", "valor: 4,50%", "titulo: Taxa de clique", "detalhe: era 2,00%",
  "[NUMERO 2]", "valor: R$ 1.234", "titulo: Custo", "detalhe: era R$ 2.000",
  "[NUMERO 3]", "valor: 2,5x", "titulo: Retorno", "detalhe: era 1x",
  "[CREATIVE X]", "anterior: 70%", "atual: 75%", "periodo: setembro vs. outubro",
  "[FOCO]", "prioridade: Testar o movimento.",
  "[AGENDA 1]", "data: EM BREVE", "titulo: Item", "detalhe: Texto."
].join("\n");

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var r = Motor.montar({ dados: DADOS, arquivoDados: "teste.txt", marca: ler("config/marca.txt"), template: ler("template/report.html"), existe: function (p) { return fs.existsSync(path.join(RAIZ, p)); } });
  if (!r.html) { console.error(JSON.stringify(r.problemas.filter(function (p) { return p.nivel === "erro"; }))); process.exit(1); }
  var png = "data:image/png;base64," + fs.readFileSync(path.join(RAIZ, "assets/icones/icone-prancheta.png")).toString("base64");
  var pagina = Motor.paraNavegador(Motor.trocarImagens(r.html, function () { return png; }));
  var arq = path.join(SAIDA, "movimento.html");
  fs.writeFileSync(arq, pagina);
  confere(/id='leitura'|bl\.id='leitura'/.test(pagina) && /data-motion/.test(pagina), "a página do navegador leva o movimento");
  confere(!/leitura|data-rv|data-motion/.test(Motor.paraEmail(r.html)), "o e-mail não leva nada do movimento");

  var browser = await chromium.launch();
  var p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  var erros = [];
  p.on("pageerror", function (e) { erros.push(e.message); });
  await p.goto("file://" + arq);
  await p.waitForTimeout(200);
  var ini = await p.evaluate(function () {
    return { motion: document.documentElement.hasAttribute("data-motion"), leitura: !!document.getElementById("leitura"),
      alvos: document.querySelectorAll("[data-rv]").length, barra: document.querySelectorAll("td[data-barra]").length };
  });
  confere(ini.motion && ini.leitura, "movimento ligado e barra de leitura no topo");
  confere(ini.alvos >= 5, ini.alvos + " partes da página aparecem na rolagem");
  confere(ini.barra === 1, "barra do Creative X marcada para crescer");
  /* No meio da contagem, o número da capa ainda não é o final. */
  var meio = await p.evaluate(function () { var el = document.querySelector("[data-conta]"); return el ? el.textContent : ""; });
  await p.waitForTimeout(1500);
  var fim = await p.$$eval("[data-conta]", function (l) { return l.map(function (x) { return x.textContent.replace(/\u00a0/g, " ") + "|" + x.getAttribute("data-conta"); }); });
  console.log("  contagem da capa: no meio \"" + meio + "\" → no fim " + JSON.stringify(fim));
  confere(fim.indexOf("4,50%|ok") >= 0 && fim.indexOf("R$ 1.234|ok") >= 0 && fim.indexOf("2,5x|ok") >= 0, "números da capa contam até o valor exato (4,50% · R$ 1.234 · 2,5x)");
  confere(meio !== "" && meio !== "4,50%", "o número começa a contar do zero");
  /* Janela baixa (420 px): o Creative X começa fora da tela; depois de rolar, aparece, conta e a barra cresce. */
  await p.close();
  p = await browser.newPage({ viewport: { width: 1280, height: 420 } });
  p.on("pageerror", function (e) { erros.push(e.message); });
  await p.goto("file://" + arq);
  await p.waitForTimeout(300);
  var antes = await p.evaluate(function () { var b = document.querySelector("td[data-barra]"); return b.getAttribute("data-barra"); });
  await p.evaluate(function () { window.scrollTo(0, document.documentElement.scrollHeight); });
  await p.waitForTimeout(400);
  await p.evaluate(function () { document.querySelector("td[data-barra]").scrollIntoView({ block: "center" }); });
  await p.waitForTimeout(1900);
  var depois = await p.evaluate(function () {
    var b = document.querySelector("td[data-barra]");
    return { barra: b.getAttribute("data-barra"), escala: getComputedStyle(b).transform, cx: Array.prototype.map.call(document.querySelectorAll("[data-conta]"), function (x) { return x.textContent; }) };
  });
  confere(antes === "" && depois.barra === "on" && (depois.escala === "none" || /matrix\(1, 0, 0, 1/.test(depois.escala)), "barra do Creative X começa vazia e cresce quando aparece");
  confere(depois.cx.indexOf("75%") >= 0, "Creative X conta até 75%");
  await p.evaluate(function () { window.scrollTo(0, document.documentElement.scrollHeight); });
  await p.waitForTimeout(300);
  var lido = await p.evaluate(function () { return getComputedStyle(document.getElementById("leitura")).transform; });
  confere(/matrix\(1, 0, 0, 1|none/.test(lido) || /matrix\(0\.9\d/.test(lido), "barra de leitura cheia no fim da página (" + lido + ")");
  confere(await p.evaluate(function () { return document.querySelectorAll("[data-rv]:not([data-rv=on])").length; }) === 0, "rolando até o fim, todas as partes aparecem");
  await p.screenshot({ path: path.join(SAIDA, "movimento.png"), fullPage: true });

  /* Salva no meio de uma animação (como o Chrome salvaria) e confere que o e-mail sai limpo e com os valores certos. */
  var p2 = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  await p2.goto("file://" + arq);
  await p2.waitForTimeout(250);
  var salvo = await p2.content();
  var limpo = Motor.limparHtmlEditado(salvo).html;
  confere(!/data-(rv|motion|barra|conta)|id="leitura"/.test(limpo), "salvo no meio da animação: o conversor tira todas as marcas do movimento");
  var inter = Motor.paginaInterativa(salvo);
  var semCodigo = inter.html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
  confere((inter.html.match(/bl\.id='leitura'/g) || []).length === 1 && !/data-(rv|motion|barra|conta)=|id="leitura"/.test(semCodigo), "versão interativa: script do movimento uma vez só, sem marcas velhas");

  /* Edição no navegador (designMode): nada se mexe. */
  var p3 = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  await p3.addInitScript(function () { document.designMode = "on"; });
  await p3.goto("file://" + arq);
  await p3.waitForTimeout(300);
  confere(!(await p3.evaluate(function () { return document.documentElement.hasAttribute("data-motion"); })), "durante a edição (designMode), o movimento fica desligado");

  /* Reduzir movimento: tudo visível e parado, números já no valor final. */
  var p4 = await browser.newPage({ viewport: { width: 1280, height: 700 }, reducedMotion: "reduce" });
  await p4.goto("file://" + arq);
  await p4.waitForTimeout(150);
  var rm = await p4.evaluate(function () { return { motion: document.documentElement.hasAttribute("data-motion"), rv: document.querySelectorAll("[data-rv]").length, leitura: !!document.getElementById("leitura") }; });
  confere(!rm.motion && rm.rv === 0 && rm.leitura, "\"reduzir movimento\": nada anima (só a barra de leitura, que acompanha a rolagem)");
  confere(/4,50%/.test(await p4.content()), "\"reduzir movimento\": números já no valor final");

  /* Celular */
  var p5 = await browser.newPage({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  await p5.goto("file://" + arq);
  await p5.waitForTimeout(1500);
  var sw = await p5.evaluate(function () { return document.documentElement.scrollWidth; });
  confere(sw === 390, "celular: nada vaza para o lado durante o movimento (" + sw + " px)");

  confere(erros.length === 0, "sem erros no console" + (erros.length ? ": " + erros.join(" | ") : ""));
  await browser.close();
  console.log(falhas ? falhas + " FALHA(S)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
