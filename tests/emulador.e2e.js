/*
 * Teste de ponta a ponta do emulador (converter-html-eml.html), uso técnico, opcional.
 * Faz o caminho de quem está começando, só com conteúdo fictício (Janeiro 2099):
 *   abrir o modelo em branco → editar texto, número, etiqueta, imagem e link → ocultar
 *   um item → importar conteúdo (Copilot) → salvar → fechar → reabrir o arquivo salvo e
 *   conferir que tudo ficou → aviso de números do mês anterior → rascunho recuperado
 *   depois de fechar a aba sem salvar → e-mail-resumo (até 3 indicadores, um único
 *   botão, aviso sem o link) → .eml (MIME, imagens dentro, X-Unsent).
 *   Requer Node.js + Playwright:  node tests/emulador.e2e.js [pasta-de-saida]
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/emulador.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "tests", "saida"));
/* EMULADOR=caminho testa outro arquivo (ex.: a versão avulsa do kit, copiada para uma pasta qualquer). */
var URL_EMULADOR = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var falhas = 0;
function confere(ok, msg) { if (process.env.DEPURAR) console.log("--"); console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function htmlDoEml(eml) {
  var m = /Content-Type: text\/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/.exec(eml);
  return Buffer.from(m[1].replace(/\r\n/g, ""), "base64").toString("utf8");
}
/* "Salvar como" do Chrome/Edge simulado: guarda o que foi gravado (o teste não tem quem clique na janela). */
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
  async function abrirEmulador() {
    var p = await ctx.newPage();
    p.on("pageerror", function (e) { erros.push(e.message); });
    p.on("console", function (m) { if (m.type() === "error") { erros.push("console: " + m.text()); if (process.env.DEPURAR) console.log("  [console] " + m.text().slice(0, 50)); } });
    p.on("dialog", function (d) { var r = p.__resposta; p.__resposta = null; if (r === null || r === undefined) d.dismiss(); else d.accept(r); });
    await p.goto(URL_EMULADOR);
    await p.evaluate(salvarComo);
    return p;
  }
  async function quadro(p) {
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.querySelector("[data-ed-campo]"); }, null, { timeout: 30000 });
    /* ao abrir, a página rola até a barra de ferramentas: o quadro de edição fica inteiro na tela */
    await p.waitForFunction(function () { return Math.abs(document.querySelector(".ferramentas").getBoundingClientRect().top) < 2; }, null, { timeout: 5000 });
    return (await p.$("#edFrame")).contentFrame();
  }
  async function escrever(p, f, chave, texto) {
    await f.locator('[data-campo="' + chave + '"][data-ed-campo]').locator("visible=true").first().click();
    await p.waitForTimeout(60);
    await p.keyboard.press("Control+A");
    await p.keyboard.type(texto);
    if (process.env.DEPURAR) console.log("  [" + chave + "] " + await p.evaluate(function () { var d = document.querySelector("#edFrame").contentDocument; return d.activeElement.getAttribute("data-campo") + " = " + d.activeElement.textContent; }));
    await p.keyboard.press("Enter");
  }
  async function ferramenta(p, f, alvo, botao) {
    await p.mouse.move(2, 2);
    await f.hover(alvo);
    await p.waitForFunction(function (b) { var x = document.querySelector("#edFrame").contentDocument.getElementById("ed-barra"); return x && !x.hidden && Array.prototype.some.call(x.querySelectorAll("button"), function (y) { return y.textContent === b; }); }, botao, { timeout: 5000 });
    /* clique de mouse no botão da barra (coordenadas da tela), sem rolar nada antes */
    var c = await noQuadro(p, function (d, b) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), x = Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }).getBoundingClientRect();
      return { x: q.left + x.left + x.width / 2, y: q.top + x.top + x.height / 2 };
    }, botao);
    await p.mouse.click(c.x, c.y);
  }
  /* Lê o quadro de edição pela página do emulador: o quadro não roda script (sandbox), então o teste não avalia nada dentro dele. */
  async function noQuadro(p, fn, arg) { return p.evaluate(function (o) { var d = document.querySelector("#edFrame").contentDocument; return new Function("d", "arg", "return (" + o.fn + ")(d, arg);")(d, o.arg); }, { fn: fn.toString(), arg: arg === undefined ? null : arg }); }
  async function texto(p, chave) { return noQuadro(p, function (d, k) { return d.querySelector('[data-campo="' + k + '"]').textContent.replace(/\s+/g, " ").trim(); }, chave); }
  async function esperaConversao(p, cond) {
    await p.waitForFunction(function (c) { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className) && new Function("return " + c)(); }, (cond || "true").toString(), { timeout: 30000 });
  }

  /* 1. Abrir o modelo em branco. */
  var p = await abrirEmulador();
  confere(await p.$eval("#secEditar", function (e) { return e.hidden; }), "antes de abrir: só o passo 1 aparece");
  await p.click("#bModelo");
  var f = await quadro(p);
  confere(!!f, "modelo em branco aberto no quadro de edição");
  confere(await noQuadro(p, function (d) { return d.querySelectorAll("script").length; }) === 0, "na edição a página fica parada (sem script)");
  var nCampos = await noQuadro(p, function (d) { return d.querySelectorAll("[data-ed-campo]").length; }), nImgs = await noQuadro(p, function (d) { return d.querySelectorAll("img[data-img]").length; });
  console.log("MODELO: " + nCampos + " campos editáveis, " + nImgs + " imagens trocáveis.");
  confere(nCampos > 80 && nImgs >= 15, "todas as seções editáveis (textos, números e imagens)");

  /* 2. Editar textos, número, etiqueta e período. */
  await escrever(p, f, "frase", "Teste fictício");
  confere(await texto(p, "frase_final") === "[segunda parte, mais leve.]", "a segunda parte da frase continua (cada parte é um campo)");
  await escrever(p, f, "periodo", "JANEIRO 2099");
  var pers = await noQuadro(p, function (d) { return Array.prototype.map.call(d.querySelectorAll('[data-campo="periodo"]'), function (e) { return e.textContent.trim(); }); });
  confere(pers.length >= 2 && pers.every(function (t) { return t === "JANEIRO 2099"; }), "período: muda em todos os lugares da página (" + pers.join(" | ") + ")");
  await escrever(p, f, "numero-1.valor", "12,5%");
  await escrever(p, f, "numero-1.titulo", "Indicador fictício A");
  await escrever(p, f, "numero-1.variacao", "▲ +25%");
  await f.locator('[data-campo="numero-2.variacao"]').locator("visible=true").first().click();
  await f.click('#ed-barra button:text-is("Cor: âmbar")');
  confere(await noQuadro(p, function (d) { var e = d.querySelector('[data-campo="numero-2.variacao"]'), c = e.matches("[data-tom]") ? e : e.querySelector("[data-tom]"); return c.getAttribute("data-tom") === "ambar"; }), "etiqueta: cor trocada para âmbar");
  confere(/não salvas/.test(await p.$eval("#estado", function (e) { return e.textContent; })), "aviso de alterações não salvas");

  /* 3. Trocar imagem (seletor de arquivo) e link. */
  var fc = await Promise.all([p.waitForEvent("filechooser"), ferramenta(p, f, 'img[data-img="principal"]', "Trocar imagem")]);
  await fc[0].setFiles(path.join(RAIZ, "assets/exemplo/peca-exemplo-principal.png"));
  await p.waitForFunction(function () { return /^data:image\/jpeg/.test(document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="principal"]').getAttribute("src")); }, null, { timeout: 10000 });
  confere(true, "imagem do projeto principal trocada (recortada e reduzida no navegador)");
  p.__resposta = "https://www.example.com/peca-ficticia";
  await ferramenta(p, f, '[data-item="lancamento-1"] span[title="Link ainda não definido"]', "Colocar link");
  confere(await noQuadro(p, function (d) { return d.querySelector('[data-item="lancamento-1"] a.cta').getAttribute("href"); }) === "https://www.example.com/peca-ficticia", "link colocado no lançamento 1");
  p.__resposta = "\"C:\\Users\\fulano\\peça 2.png\"";
  await ferramenta(p, f, '[data-item="lancamento-2"] span[title="Link ainda não definido"]', "Colocar link");
  var hrefArq = await noQuadro(p, function (d) { var a2 = d.querySelector('[data-item="lancamento-2"] a.cta'); return a2 ? a2.getAttribute("href") : "(sem link)"; }), estArq = await p.$eval("#estado", function (e) { return e.textContent; });
  confere(hrefArq === "file:///C:/Users/fulano/pe%C3%A7a%202.png" && /Atenção/.test(estArq), "caminho do computador (com aspas, espaço e acento) aceito como link de arquivo, com aviso · " + hrefArq);
  p.__resposta = "abc";
  await ferramenta(p, f, '[data-item="lancamento-3"] span[title="Link ainda não definido"]', "Colocar link");
  await p.waitForSelector("#modal:not([hidden])");
  confere(/Link não aceito/.test(await p.$eval("#modalTit", function (e) { return e.textContent; })), "texto que não é endereço nem caminho é recusado");
  await p.click("#modalOk");

  /* 4. Ocultar e adicionar itens (a grade se refaz como o motor monta) e ocultar uma seção. */
  async function grade(g) {
    return noQuadro(p, function (d, g2) {
      var it = Array.prototype.filter.call(d.querySelectorAll('[data-item^="' + g2 + '-"]'), function (x) { return /^[a-z]+-\d+$/.test(x.getAttribute("data-item")); });
      if (!it.length) return { n: 0 };
      var corpo = it[0].tagName === "TD" ? it[0].parentNode.parentNode : it[0].parentNode;
      return { n: it.length, chaves: it.map(function (x) { return x.getAttribute("data-item"); }).join(","), larguras: it.map(function (x) { return x.getAttribute("width"); }).join(","),
        classes: it.map(function (x) { return x.getAttribute("class"); }).join("|"), linhas: Array.prototype.filter.call(corpo.children, function (tr) { return !tr.querySelector("td[colspan]"); }).map(function (tr) { return Array.prototype.filter.call(tr.children, function (c) { return c.hasAttribute("data-item"); }).length + "+" + Array.prototype.filter.call(tr.children, function (c) { return !c.hasAttribute("data-item") && c.getAttribute("width") === "184"; }).length; }).join(" "),
        mais: (function () { var b = d.querySelector('.ed-mais button[data-grupo="' + g2 + '"]'); return b ? (b.disabled ? "bloqueado: " : "") + b.textContent : ""; })(),
        cab: (function () { var c = corpo.querySelector("td[colspan]"); return c ? c.getAttribute("colspan") : ""; })(),
        cores: it.map(function (x) { var v = x.querySelector('[data-campo$=".valor"]'); return v ? (/color:#EC0000/i.test(v.getAttribute("style")) ? "vermelho" : "preto") : ""; }).join(",") };
    }, g);
  }
  await ferramenta(p, f, '[data-item="agenda-6"]', "Ocultar item");
  var ga = await grade("agenda");
  confere(ga.n === 5 && ga.linhas === "3+0 2+1", "agenda: item ocultado e a grade refeita (3 + 2 e um espaço vazio) · " + ga.linhas);
  confere(ga.mais === "+ Adicionar item na agenda", "agenda: botão visível \"+ Adicionar item na agenda\"");
  await ferramenta(p, f, '[data-item="agenda-1"]', "+ Adicionar depois");
  ga = await grade("agenda");
  confere(ga.n === 6 && ga.linhas === "3+0 3+0" && ga.chaves === "agenda-1,agenda-2,agenda-3,agenda-4,agenda-5,agenda-6" && /^bloqueado: Máximo de 6/.test(ga.mais), "agenda: item adicionado depois do 1º, chaves em sequência, máximo de 6 · " + ga.mais);
  confere(await noQuadro(p, function (d) { return d.querySelector('[data-campo="agenda-2.titulo"]').textContent.trim(); }) === "[Item da agenda 2]", "item novo vem do modelo, com o número da posição");
  await ferramenta(p, f, '[data-item="agenda-6"]', "Ocultar item");
  for (var lk of ["lancamento-6", "lancamento-5", "lancamento-4"]) await ferramenta(p, f, '[data-item="' + lk + '"]', "Ocultar item");
  var gl = await grade("lancamento");
  confere(gl.n === 3 && gl.linhas === "3+0" && gl.larguras === "184,184,184" && gl.classes === "col gap|col gap|col" && gl.cab === "5", "lançamentos: 3 numa linha, como o motor monta · " + gl.larguras + " · " + gl.classes);
  await noQuadro(p, function (d) { d.querySelector('.ed-mais button[data-grupo="lancamento"]').scrollIntoView({ block: "center" }); });
  var cMais = await noQuadro(p, function (d) { var q = document.querySelector("#edFrame").getBoundingClientRect(), b = d.querySelector('.ed-mais button[data-grupo="lancamento"]').getBoundingClientRect(); return { x: q.left + b.left + b.width / 2, y: q.top + b.top + b.height / 2 }; });
  await p.mouse.click(cMais.x, cMais.y);
  gl = await grade("lancamento");
  confere(gl.n === 4 && gl.linhas === "3+0 1+2" && gl.larguras === "184,184,184,184" && /pt0/.test(gl.classes.split("|")[3]) && gl.cab === "5", "lançamentos: o 4º abre uma linha nova, com 2 espaços vazios · " + gl.linhas);
  await noQuadro(p, function (d) { d.querySelector('.ed-mais button[data-grupo="numero"]').scrollIntoView({ block: "center" }); });
  cMais = await noQuadro(p, function (d) { var q = document.querySelector("#edFrame").getBoundingClientRect(), b = d.querySelector('.ed-mais button[data-grupo="numero"]').getBoundingClientRect(); return { x: q.left + b.left + b.width / 2, y: q.top + b.top + b.height / 2 }; });
  await p.mouse.click(cMais.x, cMais.y);
  var gn = await grade("numero");
  confere(gn.n === 4 && gn.larguras === "132,132,132,132" && gn.classes === "half|half|half|half" && gn.cores === "vermelho,preto,preto,preto", "capa: 4 indicadores em 4 colunas iguais (1º em vermelho) · " + gn.larguras);
  /* no celular: nada sai para o lado e os itens empilham */
  await p.click('[data-ew="400px"]'); await p.waitForTimeout(400);
  var cel = await noQuadro(p, function (d) { var w = d.defaultView; return { vaza: d.documentElement.scrollWidth - d.documentElement.clientWidth, agenda: w.getComputedStyle(d.querySelector('[data-item="agenda-1"]')).display, num: w.getComputedStyle(d.querySelector('[data-item="numero-4"]')).display }; });
  confere(cel.vaza <= 0 && cel.agenda === "block" && cel.num === "inline-block", "celular: sem vazar para o lado; agenda empilhada; indicadores 2 a 2 · " + JSON.stringify(cel));
  await p.click('[data-ew="100%"]'); await p.waitForTimeout(300);
  await ferramenta(p, f, '[data-item="numero-4"]', "Ocultar item");
  gn = await grade("numero");
  confere(gn.n === 3 && gn.larguras === "184,184,184" && gn.classes === "third|third|third", "capa: de volta a 3 indicadores na grade de 184 px");
  /* Imagens opcionais do modelo (selo, logo e print do Transformation Hub): saem com o espaço delas. */
  for (var alvo of ['img[data-img="selo"]', 'img[data-img="transformation-3-logo"]', 'img[data-img="transformation-3-print-1"]']) {
    await noQuadro(p, function (d, s) { var i = Array.prototype.find.call(d.querySelectorAll(s), function (x) { return x.getBoundingClientRect().width > 0; }); i.scrollIntoView({ block: "center" }); }, alvo);
    await ferramenta(p, f, alvo + " >> visible=true", "Tirar imagem");
  }
  confere(await noQuadro(p, function (d) { return !d.querySelector('img[data-img="selo"], img[data-img="transformation-3-logo"], img[data-img="transformation-3-print-1"]') && !!d.querySelector('[data-campo="transformation-3.nome"]') && !!d.querySelector('img[data-img="transformation-2-logo"]'); }), "selo, logo e print tirados (o texto do projeto continua)");
  await p.click("#secEditar details summary");
  await p.uncheck('#secoesRep input[value="aprendizados"]');

  /* 5. Importar conteúdo (resposta do Copilot no formato da biblioteca de prompts). */
  await p.click("#bImportar");
  await p.fill("#txtImportar", "[NUMERO 2]\nvalor: R$ 1,20\ntitulo: Indicador fictício B\ndetalhe: Referência: R$ 1,50\nvariacao: -20%\n\n[CAMPO INEXISTENTE]\nvalor: 1\n");
  await p.click("#bAplicar");
  confere(await texto(p, "numero-2.valor") === "R$ 1,20" && /▼/.test(await texto(p, "numero-2.variacao")), "importação: número 2 preenchido (com a seta da variação)");
  console.log("IMPORTAÇÃO: " + await p.$eval("#importarInfo", function (e) { return e.textContent; }));

  /* 6. Salvar (Salvar como do Chrome/Edge). */
  await p.click("#bSalvar");
  await p.waitForFunction(function () { return window.__salvos.length === 1; }, null, { timeout: 15000 });
  var salvo = await p.evaluate(function () { return window.__salvos[0]; });
  fs.writeFileSync(path.join(SAIDA, salvo.nome), salvo.html);
  console.log("SALVO: " + salvo.nome + " (" + Math.round(salvo.html.length / 1024) + " KB) · " + await p.$eval("#estado", function (e) { return e.textContent; }));
  confere(salvo.nome === "report-2099-01.html", "nome sugerido pelo período: report-2099-01.html");
  confere(/<title>Creative Strategy PF \| Report de Janeiro 2099<\/title>/.test(salvo.html), "título (assunto) acompanha o período");
  confere(salvo.html.indexOf("Teste fictício") >= 0 && salvo.html.indexOf("12,5%") >= 0 && salvo.html.indexOf("R$ 1,20") >= 0, "textos, números e importação estão no arquivo");
  confere(!/contenteditable|data-ed-|id="ed-barra"|id="ed-css"/.test(salvo.html), "nenhum controle de edição no arquivo (quem recebe não vê)");
  confere(/<script/.test(salvo.html) && /data-campo=/.test(salvo.html), "arquivo salvo é a versão interativa e continua editável no emulador");
  confere(!/data-item="agenda-6"/.test(salvo.html) && !/data-item="lancamento-5"/.test(salvo.html) && /data-item="lancamento-4"/.test(salvo.html) && !/secao:aprendizados-->\s*<tr/.test(salvo.html), "itens ocultados e seção ficaram de fora; item adicionado ficou");
  confere(!/ed-mais|data-grupo=/.test(salvo.html), "botões \"+ Adicionar\" não vão para o arquivo");
  confere(/href="https:\/\/www\.example\.com\/peca-ficticia"/.test(salvo.html), "link salvo");
  await p.close();

  /* 7. Reabrir o arquivo salvo (outra aba, como no dia seguinte). */
  p = await abrirEmulador();
  await p.setInputFiles("#arquivo", path.join(SAIDA, salvo.nome));
  f = await quadro(p);
  confere(await texto(p, "frase") === "Teste fictício" && await texto(p, "numero-1.valor") === "12,5%" && await texto(p, "numero-2.valor") === "R$ 1,20", "reaberto: textos e números continuam");
  confere(/^data:image\/jpeg/.test(await noQuadro(p, function (d) { return d.querySelector('img[data-img="principal"]').getAttribute("src"); })), "reaberto: imagem trocada continua");
  confere(await noQuadro(p, function (d) { var e = d.querySelector('[data-campo="numero-2.variacao"]'), c = e.matches("[data-tom]") ? e : e.querySelector("[data-tom]"); return c.getAttribute("data-tom"); }) === "verde", "reaberto: cor da etiqueta importada (variação negativa = verde, padrão)");

  /* 8. Mês novo a partir do salvo: números sem mexer pedem confirmação. */
  await escrever(p, f, "periodo", "FEVEREIRO 2099");
  await p.click("#bSalvar");
  await p.waitForSelector("#modal:not([hidden])");
  var aviso = await p.$eval("#modalCorpo", function (e) { return e.textContent; });
  confere(/JANEIRO 2099/.test(aviso) && /Número 1 da capa \(valor\): 12,5%/.test(aviso) && !/numero-1\.valor/.test(aviso), "aviso: período mudou e os números ainda são do mês anterior (com o nome de cada campo)");
  await p.click("#modalCancela");
  confere(await p.evaluate(function () { return window.__salvos.length; }) === 0, "\"Voltar e conferir\" não salva");

  /* 9. Fechar a aba sem salvar e recuperar a edição. */
  await escrever(p, f, "frase", "Edição não salva");
  await p.waitForTimeout(1700);
  await p.close({ runBeforeUnload: false });
  p = await abrirEmulador();
  await p.waitForSelector("#recuperar:not([hidden])", { timeout: 5000 });
  await p.click("#bRecuperar");
  f = await quadro(p);
  confere(await texto(p, "frase") === "Edição não salva", "edição recuperada depois de fechar a aba sem salvar");
  await p.close({ runBeforeUnload: false });

  /* 10. E-mail-resumo a partir do arquivo salvo. */
  p = await abrirEmulador();
  await p.waitForSelector("#recuperar:not([hidden])");
  await p.click("#bDescartar");
  await p.setInputFiles("#arquivo", path.join(SAIDA, salvo.nome));
  f = await quadro(p);
  await esperaConversao(p);
  var marcados = await p.$$eval("#indicadores input:checked", function (l) { return l.map(function (x) { return x.value; }); });
  console.log("INDICADORES MARCADOS: " + marcados.join(", "));
  confere(marcados.join(",") === "numero-1,numero-2,numero-3", "indicadores: os 3 números do projeto principal por padrão");
  confere(await p.$$eval("#indicadores input:disabled", function (l) { return l.length; }) > 0, "no máximo 3 indicadores (os outros ficam bloqueados)");
  confere(await p.$eval("#bEmlRes", function (b) { return b.disabled; }) && /FALTA O LINK DO REPORT COMPLETO/.test(await p.$eval("#prev", function (e) { return e.srcdoc; })), "sem o link: e-mail-resumo bloqueado e a prévia avisa");
  /* link de arquivo (caminho do Windows, como "Copiar como caminho"): libera o e-mail, com aviso */
  await p.fill("#link", "\"C:\\Users\\Fulano\\Downloads\\report-2099-01.html\"");
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 });
  var hrefRes = ((await p.$eval("#prev", function (e) { return e.srcdoc; })).match(/<a class="cta" href="([^"]*)"/) || [])[1], infoRes = await p.$eval("#linkInfo", function (e) { return e.textContent; });
  confere(hrefRes === "file:///C:/Users/Fulano/Downloads/report-2099-01.html" && /Atenção/.test(infoRes), "link de arquivo (C:\\…) aceito: vira file:///… no botão, com aviso · " + hrefRes + " · " + infoRes.slice(0, 60));
  var LINK = "https://www.example.com/report-ficticio";
  await p.fill("#link", LINK);
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 });
  await p.uncheck('#indicadores input[value="numero-3"]');
  await p.check('#indicadores input[value="resultado-1"]');
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled && /resultado-1/.test(Array.prototype.map.call(document.querySelectorAll("#indicadores input:checked"), function (x) { return x.value; }).join()); }, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  var d = await Promise.all([p.waitForEvent("download"), p.click("#bEmlRes")]);
  var arqRes = path.join(SAIDA, d[0].suggestedFilename());
  await d[0].saveAs(arqRes);
  var eml = fs.readFileSync(arqRes, "latin1"), html = htmlDoEml(eml), htmlTxt = Buffer.from(html, "latin1").toString("utf8");
  console.log("EML RESUMO: " + d[0].suggestedFilename() + " (" + Math.round(eml.length / 1024) + " KB)");
  confere(/^X-Unsent: 1\r\n/.test(eml) && /^MIME-Version: 1\.0\r\n/m.test(eml) && /multipart\/related/.test(eml), "MIME válido: abre como mensagem nova (X-Unsent), multipart/related");
  confere(/^Subject: Creative Strategy PF \| Report de Janeiro 2099\r\n/m.test(eml), "assunto: Creative Strategy PF | Report de Janeiro 2099");
  var hrefs = html.match(/href="[^"]*"/g) || [];
  confere(hrefs.length >= 1 && hrefs.every(function (h) { return h === 'href="' + LINK + '"'; }), "um único destino: o botão do report completo (" + hrefs.length + " href)");
  confere(/Acessar report completo/.test(html), "botão: \"Acessar report completo\"");
  confere(/12,5%/.test(html) && /R\$ 1,20/.test(html) && /Indicador fictício A/.test(html), "indicadores escolhidos estão no resumo");
  confere(!/<script|data-campo|contenteditable/.test(html), "resumo estático, sem marcas");
  var cids = (html.match(/src="cid:([^"]+)"/g) || []).map(function (s) { return s.slice(9, -1); });
  var anexos = (eml.match(/Content-ID: <([^>]+)>/g) || []).map(function (s) { return s.slice(13, -1); });
  confere(cids.length > 0 && cids.every(function (x) { return anexos.indexOf(x) >= 0; }), cids.length + " imagem(ns) no resumo, todas dentro do .eml");
  confere(Motor.conferirHtml(html).filter(function (x) { return x.nivel === "erro"; }).length === 0, "conferência do Outlook sem erros");
  await p.screenshot({ path: path.join(SAIDA, "emulador.png"), fullPage: true });

  /* 11. Sem "Salvar como" (navegador antigo): o report vai para Downloads. */
  var p2 = await ctx.newPage();
  await p2.goto(URL_EMULADOR);
  await p2.evaluate(function () { window.showSaveFilePicker = undefined; });
  if (await p2.$("#recuperar:not([hidden])")) await p2.click("#bDescartar");
  await p2.click("#bModelo");
  await quadro(p2);
  d = await Promise.all([p2.waitForEvent("download"), p2.click("#bSalvar")]);
  confere(d[0].suggestedFilename() === "report.html", "sem \"Salvar como\": baixa o report (" + d[0].suggestedFilename() + ")");

  void texto; void cids;
  confere(erros.length === 0, "sem erros no console" + (erros.length ? ": " + erros.join(" | ") : ""));
  await browser.close();
  console.log(falhas ? falhas + " FALHA(S)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
