/*
 * Teste de ponta a ponta do emulador (converter-html-eml.html), uso técnico, opcional.
 * Faz o caminho de quem está começando, só com conteúdo fictício (Janeiro 2099):
 *   abrir o modelo em branco → editar texto, número, etiqueta, imagem e link → ocultar
 *   um item → importar conteúdo (Copilot) → salvar → fechar → reabrir o arquivo salvo e
 *   conferir que tudo ficou → aviso de números do mês anterior → rascunho recuperado
 *   depois de fechar a aba sem salvar → e-mail-resumo (até 4 destaques, um único
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
  /* Até o botão como uma pessoa: em passos (~8 px a cada 10 ms), não pulando direto; a barra não pode trocar no caminho. */
  async function ateBotao(p, de, c) {
    var n = Math.max(5, Math.round(Math.hypot(c.x - de.x, c.y - de.y) / 8));
    for (var k = 1; k <= n; k++) { await p.mouse.move(de.x + (c.x - de.x) * k / n, de.y + (c.y - de.y) * k / n); await p.waitForTimeout(10); }
    await p.mouse.click(c.x, c.y);
  }
  /* Ponto do alvo na tela (centro, ou dx/dy do canto), lido pela página do emulador: o quadro não roda script, nem o do Playwright. */
  async function pontoDoAlvo(p, alvo, dx, dy) {
    return noQuadro(p, function (d, o) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), r = Array.prototype.map.call(d.querySelectorAll(o.sel), function (e) { return e.getBoundingClientRect(); }).filter(function (x) { return x.width > 0 && x.height > 0; })[0];
      return { x: q.left + r.left + (o.dx === null ? r.width / 2 : o.dx), y: q.top + r.top + (o.dy === null ? r.height / 2 : o.dy) };
    }, { sel: alvo.replace(/\s*>>\s*visible=true$/, ""), dx: dx === undefined ? null : dx, dy: dy === undefined ? null : dy });
  }
  async function ferramenta(p, f, alvo, botao) {
    await p.mouse.move(2, 2);
    await f.hover(alvo);
    var de = await pontoDoAlvo(p, alvo);
    await p.waitForFunction(function (b) { var x = document.querySelector("#edFrame").contentDocument.getElementById("ed-barra"); return x && !x.hidden && Array.prototype.some.call(x.querySelectorAll("button"), function (y) { return y.textContent === b; }); }, botao, { timeout: 5000 });
    /* clique de mouse no botão da barra (coordenadas da tela), sem rolar nada antes */
    var c = await noQuadro(p, function (d, b) {
      var q = document.querySelector("#edFrame").getBoundingClientRect(), x = Array.prototype.find.call(d.getElementById("ed-barra").querySelectorAll("button"), function (y) { return y.textContent === b; }).getBoundingClientRect();
      return { x: q.left + x.left + x.width / 2, y: q.top + x.top + x.height / 2 };
    }, botao);
    await ateBotao(p, de, c);
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
  /* a mídia fica fora do texto (blob:) na edição: confere o tipo real do arquivo */
  await p.waitForFunction(async function () { var s = document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="principal"]').getAttribute("src"); if (!/^(blob:|data:)/.test(s)) return false; var b = await (await fetch(s)).blob(); return b.type === "image/jpeg"; }, null, { timeout: 10000 });
  confere(true, "imagem do projeto principal trocada (recortada e reduzida no navegador)");
  p.__resposta = "https://www.example.com/peca-ficticia";
  await ferramenta(p, f, '[data-item="lancamento-1"] span[title="Link ainda não definido"]', "Colocar link");
  confere(await noQuadro(p, function (d) { return d.querySelector('[data-item="lancamento-1"] a.cta').getAttribute("href"); }) === "https://www.example.com/peca-ficticia", "link colocado no lançamento 1");
  p.__resposta = "\"C:\\Users\\fulano\\peça 2.png\"";
  await ferramenta(p, f, '[data-item="lancamento-2"] span[title="Link ainda não definido"]', "Colocar link");
  var hrefArq = await noQuadro(p, function (d) { var a2 = d.querySelector('[data-item="lancamento-2"] a.cta'); return a2 ? a2.getAttribute("href") : "(sem link)"; }), estArq = await p.$eval("#estado", function (e) { return e.textContent; });
  confere(hrefArq === "file:///C:/Users/fulano/peça%202.png" && !/Atenção/.test(estArq) && /Caminho de arquivo/.test(estArq), "caminho do computador (com aspas, espaço e acento) aceito como link de arquivo, sem aviso (só uma nota) · " + hrefArq);
  p.__resposta = "javascript:alert(1)";
  await ferramenta(p, f, '[data-item="lancamento-3"] span[title="Link ainda não definido"]', "Colocar link");
  await p.waitForSelector("#modal:not([hidden])");
  confere(/Link não aceito/.test(await p.$eval("#modalTit", function (e) { return e.textContent; })), "endereço que executa código (javascript:) é recusado");
  await p.click("#modalOk");
  p.__resposta = "mailto:time@example.com";
  await ferramenta(p, f, '[data-item="lancamento-3"] span[title="Link ainda não definido"]', "Colocar link");
  confere(await noQuadro(p, function (d) { var a3 = d.querySelector('[data-item="lancamento-3"] a.cta'); return a3 ? a3.getAttribute("href") : ""; }) === "mailto:time@example.com", "qualquer outro tipo de link (mailto:) é aceito");

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
  await ferramenta(p, f, '[data-item="agenda-6"]', "Tirar item");
  var ga = await grade("agenda");
  confere(ga.n === 5 && ga.linhas === "3+0 2+1", "agenda: item ocultado e a grade refeita (3 + 2 e um espaço vazio) · " + ga.linhas);
  confere(ga.mais === "+ Adicionar item na agenda", "agenda: botão visível \"+ Adicionar item na agenda\"");
  await ferramenta(p, f, '[data-item="agenda-1"]', "+ Adicionar depois");
  ga = await grade("agenda");
  confere(ga.n === 6 && ga.linhas === "3+0 3+0" && ga.chaves === "agenda-1,agenda-2,agenda-3,agenda-4,agenda-5,agenda-6" && /^bloqueado: Máximo de 6/.test(ga.mais), "agenda: item adicionado depois do 1º, chaves em sequência, máximo de 6 · " + ga.mais);
  confere(await noQuadro(p, function (d) { return d.querySelector('[data-campo="agenda-2.titulo"]').textContent.trim(); }) === "[Item da agenda 2]", "item novo vem do modelo, com o número da posição");
  await ferramenta(p, f, '[data-item="agenda-6"]', "Tirar item");
  for (var lk of ["lancamento-6", "lancamento-5", "lancamento-4"]) await ferramenta(p, f, '[data-item="' + lk + '"]', "Tirar item");
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
  await p.click('[data-ew="390px"]'); await p.waitForTimeout(400);
  var cel = await noQuadro(p, function (d) { var w = d.defaultView; return { vaza: d.documentElement.scrollWidth - d.documentElement.clientWidth, agenda: w.getComputedStyle(d.querySelector('[data-item="agenda-1"]')).display, num: w.getComputedStyle(d.querySelector('[data-item="numero-4"]')).display }; });
  confere(cel.vaza <= 0 && cel.agenda === "block" && cel.num === "inline-block", "celular: sem vazar para o lado; agenda empilhada; indicadores 2 a 2 · " + JSON.stringify(cel));
  await p.click('[data-ew="100%"]'); await p.waitForTimeout(300);
  await ferramenta(p, f, '[data-item="numero-4"]', "Tirar item");
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
  confere(await p.evaluate(async function () { var s = document.querySelector("#edFrame").contentDocument.querySelector('img[data-img="principal"]').getAttribute("src"); return (await (await fetch(s)).blob()).type; }) === "image/jpeg", "reaberto: imagem trocada continua");
  confere(await noQuadro(p, function (d) { var e = d.querySelector('[data-campo="numero-2.variacao"]'), c = e.matches("[data-tom]") ? e : e.querySelector("[data-tom]"); return c.getAttribute("data-tom"); }) === "verde", "reaberto: cor da etiqueta importada (variação negativa = verde, padrão)");

  /* 8. Mês novo a partir do salvo: números sem mexer pedem confirmação. */
  await escrever(p, f, "periodo", "FEVEREIRO 2099");
  await p.click("#bSalvar");
  await p.waitForSelector("#modal:not([hidden])");
  var aviso = await p.$eval("#modalCorpo", function (e) { return e.textContent; });
  confere(/JANEIRO 2099/.test(aviso) && /Resultado principal 1 \(valor\): 12,5%/.test(aviso) && !/numero-1\.valor/.test(aviso), "aviso: período mudou e os números ainda são do mês anterior (com o nome de cada campo)");
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
  var marcados = await p.$$eval("#dtqEscolhidos .dtq[data-origem]", function (l) { return l.map(function (x) { return x.getAttribute("data-origem"); }); });
  console.log("DESTAQUES SUGERIDOS: " + marcados.join(", "));
  confere(marcados.join(",") === "numero-1,numero-2,numero-3" && /^3 de 4 · sugestão/.test(await p.$eval("#dtqConta", function (e) { return e.textContent; })), "destaques: a sugestão são os 3 números do projeto principal (3 de 4)");
  confere(await p.$$eval("#dtqLista button[data-origem]:disabled", function (l) { return l.length; }) >= 3, "os já escolhidos ficam marcados na lista do report (✓)");
  confere(await p.$eval("#bEmlRes", function (b) { return b.disabled; }) && /FALTA O LINK DO REPORT COMPLETO/.test(await p.$eval("#prev", function (e) { return e.srcdoc; })), "sem o link: e-mail-resumo bloqueado e a prévia avisa");
  /* qualquer link vale (4.12). Caminho do Windows com espaço e acento (pasta do OneDrive, "Copiar como caminho"): vira
     file:/// no formato que o Outlook grava (espaço %20, acento como está) e o e-mail-resumo é liberado, com uma nota. */
  await p.fill("#link", "\"C:\\Users\\t000000\\OneDrive - Empresa\\Report PF\\Produção\\Outubro_26\\HTML\\report-2099-01.html\"");
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled && /file:/.test(document.querySelector("#prev").srcdoc); }, null, { timeout: 30000 });
  var hrefRes = ((await p.$eval("#prev", function (e) { return e.srcdoc; })).match(/<a class="cta[^"]*" href="([^"]*)"/) || [])[1], infoRes = await p.$eval("#linkInfo", function (e) { return e.textContent; });
  confere(hrefRes === "file:///C:/Users/t000000/OneDrive%20-%20Empresa/Report%20PF/Produção/Outubro_26/HTML/report-2099-01.html" && /Caminho de arquivo/.test(infoRes) && !/Não dá para usar/.test(infoRes),
    "caminho do Windows (OneDrive, com espaço e acento) aceito: botão com file:/// no formato do Outlook, nota no campo · " + hrefRes);
  confere(decodeURIComponent(new URL(hrefRes).pathname) === "/C:/Users/t000000/OneDrive - Empresa/Report PF/Produção/Outubro_26/HTML/report-2099-01.html", "o endereço do botão volta exatamente ao caminho colado");
  /* 4.12.1: no e-mail recebido, o Outlook bloqueia link para arquivo. O passo 4 avisa (com "Ok, ciente") e indica o link do
     OneDrive, sem travar o .eml */
  var etArq = await p.$eval("#et-resumir", function (e) { return { t: e.textContent, ciente: !!Array.prototype.filter.call(e.querySelectorAll("button"), function (b) { return /Ok, ciente/.test(b.textContent); }).length }; });
  confere(/o Outlook bloqueia esse link/.test(etArq.t) && /Copiar link/.test(etArq.t) && etArq.ciente && !(await p.$eval("#bEmlRes", function (b) { return b.disabled; })), "caminho de arquivo: aviso de que o Outlook bloqueia no e-mail recebido, com o link do OneDrive e \"Ok, ciente\" (o .eml continua liberado)");
  /* o link do .eml abre o arquivo de verdade: o report salvo numa pasta com espaço e acento, o endereço copiado da barra do
     navegador (com %C3%A7…), o .eml baixado e o link de dentro dele aberto no navegador */
  /* (pasta temporária fora do projeto: a página de geração lê a pasta do projeto inteira nos outros testes) */
  var tmpAc = fs.mkdtempSync(path.join(require("os").tmpdir(), "report-link-")), pastaAc = path.join(tmpAc, "OneDrive - Empresa", "Report PF", "Produção");
  fs.mkdirSync(pastaAc, { recursive: true }); fs.copyFileSync(path.join(SAIDA, salvo.nome), path.join(pastaAc, salvo.nome));
  var urlArq = "file://" + path.join(pastaAc, salvo.nome).split("/").map(encodeURIComponent).join("/");
  await p.fill("#link", urlArq);
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled && /Produção/.test(document.querySelector("#prev").srcdoc); }, null, { timeout: 30000 });
  await p.waitForTimeout(800);
  var dArq = await Promise.all([p.waitForEvent("download"), p.click("#bEmlRes")]), emlArq = path.join(SAIDA, "resumo-link-arquivo.eml"); await dArq[0].saveAs(emlArq);
  var hrefEml = (htmlDoEml(fs.readFileSync(emlArq, "utf8")).match(/<a class="cta[^"]*" href="([^"]*)"/) || [])[1] || "";
  var pa = await ctx.newPage(); await pa.goto(hrefEml); var tituloA = await pa.title(); await pa.close();
  fs.rmSync(tmpAc, { recursive: true, force: true });
  confere(/Produção/.test(hrefEml) && !/%C3%A7/i.test(hrefEml) && /Report de Janeiro 2099/.test(tituloA), "o link do botão no .eml abre o report salvo (pasta com espaço e acento) · " + hrefEml.slice(-60) + " → " + tituloA);
  var LINK = "https://www.example.com/report-ficticio";
  await p.fill("#link", LINK);
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 });
  await p.click('#dtqEscolhidos button[aria-label="Tirar o destaque 3"]');
  await p.click('#dtqLista button[data-origem="resultado-1"]');
  await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled && Array.prototype.map.call(document.querySelectorAll("#dtqEscolhidos .dtq"), function (x) { return x.getAttribute("data-origem"); }).join() === "numero-1,numero-2,resultado-1"; }, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  var d = await Promise.all([p.waitForEvent("download"), p.click("#bEmlRes")]);
  var arqRes = path.join(SAIDA, d[0].suggestedFilename());
  await d[0].saveAs(arqRes);
  var eml = fs.readFileSync(arqRes, "latin1"), html = htmlDoEml(eml);
  console.log("EML RESUMO: " + d[0].suggestedFilename() + " (" + Math.round(eml.length / 1024) + " KB)");
  confere(/^X-Unsent: 1\r\n/.test(eml) && /^MIME-Version: 1\.0\r\n/m.test(eml) && /multipart\/related/.test(eml), "MIME válido: abre como mensagem nova (X-Unsent), multipart/related");
  confere(/^Subject: Creative Strategy PF \| Report de Janeiro 2099\r\n/m.test(eml), "assunto: Creative Strategy PF | Report de Janeiro 2099");
  var hrefs = html.match(/href="[^"]*"/g) || [];
  confere(hrefs.length === 1 && hrefs[0] === 'href="' + LINK + '"', "um único link: o botão do report completo (" + hrefs.length + " href)");
  confere(!/<v:roundrect|<w:anchorlock/.test(html) && /<td class="dm-marca-bg" align="center" bgcolor="#EC0000"[^>]*><a class="cta fx dm-txt-branco" href="/.test(html), "botão sem VML (célula vermelha + link de texto): continua clicável depois que o Outlook envia");
  confere(/Acessar report completo/.test(html), "botão: \"Acessar report completo\"");
  confere(/12,5%/.test(html) && /R\$ 1,20/.test(html) && /Indicador fictício A/.test(html), "destaques escolhidos estão no resumo");
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
