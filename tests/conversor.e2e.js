/*
 * Teste de ponta a ponta da página converter-html-eml.html (uso técnico, opcional).
 * Simula o caso real: a página do mês aberta no Chrome (com a ampliação ativa),
 * editada à mão (designMode) e salva como "Página da Web, completa"; depois
 * converte esse arquivo em .eml e confere o resultado. Testa também o
 * "Acompanhar o arquivo": salva de novo e espera a conversão sozinha.
 *   Requer Node.js + Playwright:  node tests/conversor.e2e.js [pasta-de-saida]
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var browser = await chromium.launch();

  /* 1. Página do mês como sai da ferramenta: o backup + uma peça ampliável + um vídeo. */
  var base = fs.readFileSync(path.join(RAIZ, "report_backup.html"), "utf8");
  var n = 0;
  base = base.replace(/<img\b([^>]*?)\ssrc="(data:image\/[^"]+)"/g, function (m, a, src) {
    n++;
    if (n === 1) return m + ' data-ampliar="' + src + '" data-legenda="Peça de teste"';
    if (n === 2) return m + ' data-video="data:video/mp4;base64,AAAA" data-legenda="Vídeo de teste"';
    return m;
  });
  var navegador = Motor.paraNavegador(base);
  var arqNav = path.join(SAIDA, "pagina-navegador.html");
  fs.writeFileSync(arqNav, navegador);

  /* 2. Abre no "Chrome", edita um texto e salva como o Chrome salva (DOM atual). */
  var p = await browser.newPage();
  await p.goto("file://" + arqNav);
  await p.waitForSelector("#amp", { state: "attached" });
  async function editarESalvar(texto, destino) {
    await p.evaluate(function (t) {
      document.designMode = "on";
      var alvo = Array.prototype.find.call(document.querySelectorAll("p"), function (x) { return /Lorem|EDITADO/.test(x.textContent); });
      alvo.textContent = t;
    }, texto);
    var html = "<!-- saved from url=(0014)about:internet -->\n" + await p.content();
    fs.writeFileSync(destino, html);
    return html;
  }
  var arqEd = path.join(SAIDA, "pagina-editada.html");
  var editado = await editarESalvar("TEXTO EDITADO NO CHROME", arqEd);
  console.log("ENTRADA: " + Math.round(editado.length / 1024) + " KB, script: " + /<script/.test(editado) + ", janela #amp: " + /id="amp"/.test(editado) + ", tabindex: " + /tabindex="0"/.test(editado));

  /* 3. Converte pelo botão clássico (input de arquivo). */
  var c = await browser.newPage({ acceptDownloads: true, viewport: { width: 1200, height: 900 } });
  var erros = [];
  c.on("pageerror", function (e) { erros.push(e.message); });
  c.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
  await c.addInitScript(function () {
    /* Seletor moderno simulado: a página recebe um "endereço" do arquivo e relê quando o teste troca o conteúdo. */
    window.__arquivo = null;
    window.showOpenFilePicker = async function () { return [{ kind: "file", getFile: async function () { return window.__arquivo; } }]; };
  });
  await c.goto("file://" + path.join(RAIZ, "converter-html-eml.html"));
  await c.check("input[name=modo][value=completo]");
  await c.setInputFiles("#arquivo", arqEd);
  await c.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 30000 });
  console.log("STATUS: " + await c.$eval("#banner", function (e) { return e.textContent; }));
  console.log("ETAPAS:\n  " + (await c.$$eval("#etapas > li", function (l) {
    return l.map(function (x) { return x.dataset.estado.toUpperCase() + " · " + x.querySelector(".et").innerText.replace(/\n/g, " / ") + " · " + x.querySelector(".tempo").textContent; });
  })).join("\n  "));
  confere(await c.$eval("#barra", function (e) { return e.getAttribute("aria-valuenow"); }) === "100", "barra de progresso chegou a 100%");
  confere(!(await c.$eval("#bEml", function (b) { return b.disabled; })), "botão de baixar liberado");

  var d = await Promise.all([c.waitForEvent("download"), c.click("#bEml")]);
  var arqEml = path.join(SAIDA, d[0].suggestedFilename());
  await d[0].saveAs(arqEml);
  var eml = fs.readFileSync(arqEml, "latin1");
  console.log("EML: " + d[0].suggestedFilename() + " (" + Math.round(eml.length / 1024) + " KB)");

  /* 4. Confere o .eml por dentro. */
  confere(/^X-Unsent: 1\r\n/.test(eml), "abre como mensagem nova (X-Unsent)");
  var partes = eml.split(/\r\n--=_rel_[^\r\n]*\r\n/);
  var htmlB64 = /Content-Type: text\/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/.exec(eml)[1];
  var html = Buffer.from(htmlB64.replace(/\r\n/g, ""), "base64").toString("utf8");
  confere(html.indexOf("TEXTO EDITADO NO CHROME") >= 0, "a edição feita no navegador está no e-mail");
  confere(!/<script/i.test(html), "sem script");
  confere(!/id="amp"/.test(html) && !/data-(ampliar|video|legenda)=/.test(html), "sem janela de ampliação nem atributos de ampliação/vídeo");
  confere(!/tabindex="0"|role="button"|contenteditable/.test(html), "sem atributos do clique ou da edição");
  confere(!/saved from url/.test(html), "sem a marca do Chrome");
  confere(!/src="data:/.test(html), "nenhuma imagem embutida no HTML (todas viraram anexo)");
  var cids = (html.match(/src="cid:([^"]+)"/g) || []).map(function (s) { return s.slice(9, -1); });
  var unicos = cids.filter(function (x, i) { return cids.indexOf(x) === i; });
  var anexos = (eml.match(/Content-ID: <([^>]+)>/g) || []).map(function (s) { return s.slice(13, -1); });
  confere(unicos.length > 0 && unicos.every(function (x) { return anexos.indexOf(x) >= 0; }), unicos.length + " imagens referenciadas, todas anexadas (" + anexos.length + " anexos)");
  /* A imagem anexada é a mesma (byte a byte) que estava embutida na página. */
  var originais = Motor.imagensDoHtml(Motor.limparHtmlEditado(editado).html).map(function (s) { return Buffer.from(Motor.imagemDeDataUri(s).bytes).toString("base64"); });
  var parte1 = /Content-ID: <img01@report>\r\nContent-Disposition: inline;\r\n filename="[^"]+"\r\n\r\n([\s\S]*?)\r\n--/.exec(eml);
  confere(parte1 && parte1[1].replace(/\r\n/g, "") === originais[0], "imagem 1 idêntica à original");
  confere(Motor.conferirHtml(html).filter(function (x) { return x.nivel === "erro"; }).length === 0, "conferência do Outlook sem erros");
  confere(partes.length > 2, "estrutura multipart/related com anexos");

  /* 5. Acompanhar o arquivo: escolhe pelo seletor moderno e "salva" de novo. */
  async function trocarArquivo(conteudo, quando) {
    await c.evaluate(function (o) { window.__arquivo = new File([o.c], "pagina-editada.html", { type: "text/html", lastModified: o.t }); }, { c: conteudo, t: quando });
  }
  await trocarArquivo(editado, 1000);
  await c.click("#escolher");
  await c.waitForFunction(function () { return /Acompanhando/.test(document.querySelector("#vigiaTxt").textContent) && /banner (ok|warn)/.test(document.querySelector("#banner").className); }, null, { timeout: 30000 });
  confere(await c.$eval("#ponto", function (e) { return e.classList.contains("on"); }), "indicador de acompanhamento ligado");
  var segunda = await editarESalvar("SEGUNDA EDIÇÃO SALVA", arqEd);
  await trocarArquivo(segunda, 2000);
  await c.waitForFunction(function () { return /SEGUNDA EDIÇÃO SALVA/.test(document.querySelector("#prev").srcdoc) && /banner (ok|warn)/.test(document.querySelector("#banner").className); }, null, { timeout: 30000 });
  confere(/salvo de novo/.test(await c.$eval("#log", function (e) { return e.textContent; })), "converteu de novo sozinho quando o arquivo mudou");
  await c.screenshot({ path: path.join(SAIDA, "conversor.png"), fullPage: true });

  /* 6. Imagem que falta (salva numa pasta ao lado): avisa e pede a pasta. */
  var semImagem = editado.replace(/src="data:image\/[^"]+"/, 'src="pagina_files/logo.png"');
  await trocarArquivo(semImagem, 3000);
  await c.waitForFunction(function () { return /banner err/.test(document.querySelector("#banner").className); }, null, { timeout: 30000 });
  confere(!(await c.$eval("#pastaRow", function (e) { return e.hidden; })), "imagem faltando: pede a pasta das imagens");
  confere(await c.$eval("#bEml", function (b) { return b.disabled; }), "imagem faltando: não deixa baixar");

  /* 7. E-mail resumido + versão interativa. */
  await trocarArquivo(editado, 4000);
  await c.check("input[name=modo][value=resumido]");
  await c.waitForFunction(function () { return /banner warn/.test(document.querySelector("#banner").className) && !document.querySelector("#bInterativa").disabled; }, null, { timeout: 30000 });
  confere(/Falta só o link/.test(await c.$eval("#banner", function (e) { return e.textContent; })), "resumido sem link: pede o link e libera a versão interativa");
  confere((await c.$$eval("#secoes input:checked", function (l) { return l.map(function (x) { return x.value; }); })).join(",") === "capa,resumo,foco,rodape", "seções do resumido marcadas por padrão");
  d = await Promise.all([c.waitForEvent("download"), c.click("#bInterativa")]);
  var arqInt = path.join(SAIDA, d[0].suggestedFilename());
  await d[0].saveAs(arqInt);
  var pi = await browser.newPage();
  await pi.goto("file://" + arqInt);
  await pi.click("img[data-ampliar]");
  confere(await pi.evaluate(function () { return document.querySelectorAll("#amp").length === 1 && document.getElementById("amp").hasAttribute("open"); }), "versão interativa: uma janela de ampliação, abre no clique");
  await pi.close();
  var LINK = "https://empresa.sharepoint.com/sites/creative/report.html";
  await c.fill("#link", LINK);
  await c.waitForFunction(function () { return /banner (ok|warn)/.test(document.querySelector("#banner").className) && !document.querySelector("#bEml").disabled; }, null, { timeout: 30000 });
  d = await Promise.all([c.waitForEvent("download"), c.click("#bEml")]);
  var arqRes = path.join(SAIDA, "resumido.eml");
  await d[0].saveAs(arqRes);
  var emlRes = fs.readFileSync(arqRes, "latin1");
  var htmlRes = Buffer.from(/Content-Type: text\/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/.exec(emlRes)[1].replace(/\r\n/g, ""), "base64").toString("utf8");
  confere(htmlRes.indexOf('href="' + LINK + '"') > 0 && /Ver o report completo \(interativo\)/.test(htmlRes), "resumido: botão com o link da versão interativa");
  confere(!/secao:(lancamos|cx|transformation|aprendizados|agenda)-->/.test(htmlRes) && /secao:foco-->/.test(htmlRes), "resumido: só as seções escolhidas");
  confere(htmlRes.indexOf("TEXTO EDITADO NO CHROME") >= 0, "resumido: a edição do navegador continua");
  confere(emlRes.length < eml.length, "resumido menor que o completo (" + Math.round(emlRes.length / 1024) + " KB vs " + Math.round(eml.length / 1024) + " KB)");
  await c.screenshot({ path: path.join(SAIDA, "conversor-resumido.png"), fullPage: true });

  confere(erros.length === 0, "sem erros no console" + (erros.length ? ": " + erros.join(" | ") : ""));
  await browser.close();
  console.log(falhas ? falhas + " FALHA(S)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
