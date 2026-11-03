/*
 * Teste de ponta a ponta do e-mail-resumo com destaques escolhidos (4.13, uso técnico, opcional), só com conteúdo
 * fictício (kit/report-exemplo.html e uma imagem gerada na hora). No emulador:
 *   - a sugestão automática (3 números do projeto principal) é só sugestão: dá para reordenar, tirar, incluir até 4
 *     itens do report e voltar para a sugestão;
 *   - título e descrição podem ser ajustados para o e-mail sem mudar o report;
 *   - "+ Informação nova" fica marcada como "precisa de revisão" e trava o .eml até "Revisei";
 *   - imagem do computador (com posição), capa de vídeo (▶) e link do destaque; um link que roda código não entra;
 *   - mudar um número no report muda o e-mail;
 *   - o .eml leva as imagens dentro (cid), um único botão principal e nenhum dado de edição; o e-mail completo também
 *     não leva a configuração do resumo;
 *   - a imagem do resumo (.png) é um PNG de verdade, no dobro da largura do e-mail;
 *   - a escolha fica gravada no report salvo (sem mudar o conteúdo do report) e volta ao reabrir;
 *   - no celular (390 px) o e-mail não rola para o lado.
 *   Requer Node.js + Playwright:  node tests/resumo.e2e.js
 *   Versão avulsa:  EMULADOR=kit/emulador-report.html node tests/resumo.e2e.js
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var RAIZ = path.join(__dirname, ".."), SAIDA = path.join(RAIZ, "tests", "saida");
var URL_EMULADOR = "file://" + path.resolve(process.env.EMULADOR || path.join(RAIZ, "converter-html-eml.html"));
var LINK = "https://www.example.com/report-ficticio", LINK_DTQ = "https://www.example.com/peca-ficticia";
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function htmlDoEml(eml) {
  var m = /Content-Type: text\/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/.exec(eml);
  return m ? Buffer.from(m[1].replace(/\r\n/g, ""), "base64").toString("utf8") : "";
}
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
  var browser = await chromium.launch(), erros = [];
  var ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });

  /* imagem fictícia (gradiente com formas), gerada na hora */
  var foto = path.join(SAIDA, "resumo-foto-ficticia.png");
  var pf = await ctx.newPage(); await pf.setViewportSize({ width: 800, height: 600 });
  await pf.setContent('<body style="margin:0"><div style="width:800px;height:600px;background:linear-gradient(135deg,#127277,#F0B998);position:relative"><div style="position:absolute;left:300px;top:200px;width:200px;height:200px;border-radius:50%;background:#FBF1EA"></div></div></body>');
  await pf.screenshot({ path: foto }); await pf.close();

  async function abrir(arquivo) {
    var p = await ctx.newPage();
    p.on("pageerror", function (e) { erros.push(e.message); });
    p.on("console", function (m) { if (m.type() === "error") erros.push("console: " + m.text()); });
    await p.goto(URL_EMULADOR); await p.evaluate(salvarComo);
    await p.setInputFiles("#arquivo", arquivo);
    await p.waitForFunction(function () { return document.querySelectorAll("#dtqEscolhidos .dtq").length > 0; }, null, { timeout: 60000 });
    return p;
  }
  function ordem(p) { return p.$$eval("#dtqEscolhidos .dtq[data-origem]", function (l) { return l.map(function (x) { return x.getAttribute("data-origem"); }).join(","); }); }
  function conta(p) { return p.$eval("#dtqConta", function (e) { return e.textContent; }); }
  function prev(p) { return p.$eval("#prev", function (e) { return e.srcdoc; }); }
  function esperaPrev(p, fn, arg) { return p.waitForFunction(function (o) { var s = document.querySelector("#prev").srcdoc; return new Function("s", "arg", "return (" + o.fn + ")(s, arg);")(s, o.arg); }, { fn: fn.toString(), arg: arg }, { timeout: 30000 }); }
  function cartao(p, i) { return p.locator("#dtqEscolhidos .dtq").nth(i); }
  async function liberado(p) { await p.waitForFunction(function () { return !document.querySelector("#bEmlRes").disabled; }, null, { timeout: 30000 }); }

  var p = await abrir(path.join(RAIZ, "kit/report-exemplo.html"));
  await p.fill("#link", LINK); await liberado(p);

  /* 1. sugestão */
  confere(await ordem(p) === "numero-1,numero-2,numero-3" && /^3 de 4 · sugestão/.test(await conta(p)), "sugestão: os 3 números do projeto principal (" + await conta(p) + ")");
  var pv = await prev(p);
  confere((pv.match(/class="col kpi dtq/g) || []).length === 3 && /DESTAQUES DO MÊS/.test(pv), "prévia: 3 cartões na seção DESTAQUES DO MÊS");

  /* 2. reordenar: o 1º desce; a lista vira da pessoa */
  await p.click('#dtqEscolhidos button[aria-label="Descer o destaque 1"]');
  await esperaPrev(p, function (s) { return s.indexOf("R$&nbsp;1,20") > 0 && s.indexOf("R$&nbsp;1,20") < s.indexOf("12,5%") || s.indexOf("R$ 1,20") > 0 && s.indexOf("R$ 1,20") < s.indexOf("12,5%"); });
  confere(await ordem(p) === "numero-2,numero-1,numero-3" && !/sugestão/.test(await conta(p)), "↓: nova ordem no emulador e na prévia, e deixa de ser sugestão (" + await conta(p) + ")");

  /* 3. título ajustado só para o e-mail */
  await cartao(p, 0).locator('label.f:has-text("Título") input').fill("Indicador B, em uma frase para o e-mail");
  await esperaPrev(p, function (s) { return /Indicador B, em uma frase para o e-mail/.test(s); });
  confere(true, "título editado aparece no e-mail");

  /* 4. incluir do report até 4 (o texto do destaque leva a imagem dele junto); com 4, a lista e o "+ Informação nova" travam */
  await p.click('#dtqLista button[data-origem="destaque"]');
  await p.waitForFunction(function () { return document.querySelectorAll("#dtqEscolhidos .dtq").length === 4; }, null, { timeout: 30000 });
  var trava = await p.evaluate(function () { return { novo: document.querySelector("#bDtqNovo").disabled, livres: document.querySelectorAll("#dtqLista button[data-origem]:not(:disabled)").length }; });
  confere(/^4 de 4/.test(await conta(p)) && trava.novo && trava.livres === 0, "4 de 4: nada mais entra (" + JSON.stringify(trava) + ")");
  await esperaPrev(p, function (s) { return (s.match(/class="col kpi dtq/g) || []).length === 4 && /class="dimg"/.test(s); });
  confere(true, "o destaque entra com a imagem do report");
  var selo = await cartao(p, 0).locator(".selo.ed").count();
  confere(selo === 1, "cartão com o título ajustado mostra \"texto ajustado para o e-mail\"");

  /* 5. tirar e incluir informação nova: trava o .eml até "Revisei" */
  await p.click('#dtqEscolhidos button[aria-label="Tirar o destaque 4"]');
  await p.waitForFunction(function () { return document.querySelectorAll("#dtqEscolhidos .dtq").length === 3 && !document.querySelector("#bDtqNovo").disabled; }, null, { timeout: 30000 });
  await p.click("#bDtqNovo");
  var novo = p.locator("#dtqEscolhidos .dtq.novo");
  confere(await novo.count() === 1 && /precisa de revisão/.test(await novo.locator(".selo").first().textContent()), "+ Informação nova: cartão marcado \"precisa de revisão\"");
  await novo.locator('label.f:has-text("Número") input').fill("7 de 10");
  await novo.locator('label.f:has-text("Título") input').fill("Item novo fictício");
  await novo.locator('label.f:has-text("Descrição curta") textarea').fill("Uma frase de exemplo sobre por que isso importa.");
  await p.waitForFunction(function () { return document.querySelector("#bEmlRes").disabled && /Informação nova para revisar/.test(document.querySelector("#etapas").textContent); }, null, { timeout: 30000 });
  confere(true, "sem revisão: o .eml fica travado e o status pede \"Revisei\"");
  await novo.locator('label.check:has-text("Revisei") input').check();
  await liberado(p);
  await esperaPrev(p, function (s) { return /Item novo fictício/.test(s) && /7 de 10/.test(s); });
  confere(/revisada/.test(await p.locator("#dtqEscolhidos .dtq.novo .selo").first().textContent()), "revisada: o .eml libera e a informação nova entra no e-mail");

  /* 6. imagem do computador no 1º cartão (4 cartões: metade, 290 px) e capa de vídeo */
  var fc = await Promise.all([p.waitForEvent("filechooser"), cartao(p, 0).locator('button:has-text("+ Imagem do computador")').click()]);
  await fc[0].setFiles(foto);
  await esperaPrev(p, function (s) { var m = s.match(/<td class="col kpi dtq[\s\S]*?<\/td>/); return m && /class="dimg"[^>]*width="290"|width="290"[^>]*class="dimg"/.test(m[0]); });
  confere(true, "imagem do computador no 1º destaque, no tamanho do espaço (290 px)");
  var srcAntes = await p.evaluate(function () { var d = new DOMParser().parseFromString(document.querySelector("#prev").srcdoc, "text/html"); return d.querySelector("img.dimg").getAttribute("src"); });
  await cartao(p, 0).locator('label.check:has-text("Capa de vídeo") input').check();
  await p.waitForFunction(function (a) { var d = new DOMParser().parseFromString(document.querySelector("#prev").srcdoc, "text/html"), i = d.querySelector("img.dimg"); return i && i.getAttribute("src") !== a; }, srcAntes, { timeout: 30000 });
  confere(true, "capa de vídeo: a imagem é redesenhada com o ▶");

  /* 7. link do destaque; um link que roda código não entra */
  await cartao(p, 1).locator('label.f:has-text("Link do destaque") input').fill("javascript:alert(1)");
  await p.waitForTimeout(1500); await liberado(p).catch(function () {});
  confere(!/javascript:/i.test(await prev(p)), "link que roda código: fica fora do e-mail");
  await cartao(p, 1).locator('label.f:has-text("Link do destaque") input').fill(LINK_DTQ);
  await esperaPrev(p, function (s, l) { return s.indexOf('href="' + l + '"') > 0 && /Saiba mais/.test(s); }, LINK_DTQ);
  confere(true, "link do destaque com o texto padrão \"Saiba mais\"");

  /* 8. o número vem do report: mudar no report muda o e-mail */
  var f = await (await p.$("#edFrame")).contentFrame();
  await p.mouse.move(2, 2); await p.waitForTimeout(600);
  await f.locator('[data-campo="numero-1.valor"][data-ed-campo]').first().click({ position: { x: 4, y: 6 } }); await p.waitForTimeout(150);
  await p.keyboard.press("Control+A"); await p.keyboard.type("99,9%"); await p.keyboard.press("Enter");
  await esperaPrev(p, function (s) { return /99,9%/.test(s) && !/12,5%/.test(s); });
  confere(true, "número mudado no report (12,5% → 99,9%) aparece no e-mail");
  await liberado(p); await p.waitForTimeout(800);

  /* 9. .eml do resumo */
  var d = await Promise.all([p.waitForEvent("download"), p.click("#bEmlRes")]), arq = path.join(SAIDA, "resumo-destaques.eml"); await d[0].saveAs(arq);
  var eml = fs.readFileSync(arq, "latin1"), html = htmlDoEml(eml);
  var cids = (html.match(/src="cid:([^"]+)"/g) || []).map(function (s) { return s.slice(9, -1); }), anexos = (eml.match(/Content-ID: <([^>]+)>/g) || []).map(function (s) { return s.slice(13, -1); });
  confere((html.match(/class="col kpi dtq/g) || []).length === 4 && /Item novo fictício/.test(html) && /99,9%/.test(html), ".eml: os 4 destaques, na ordem escolhida, com a informação nova e o número atualizado");
  confere(cids.length >= 2 && cids.every(function (c) { return anexos.indexOf(c) >= 0; }) && !/src="(data|blob):/.test(html), ".eml: imagens dentro do e-mail (" + cids.length + " cid, todas anexadas)");
  var hrefs = (html.match(/href="[^"]*"/g) || []);
  confere(hrefs.length === 2 && hrefs.indexOf('href="' + LINK + '"') >= 0 && hrefs.indexOf('href="' + LINK_DTQ + '"') >= 0 && (html.match(/class="cta /g) || []).length === 1, ".eml: um único botão principal (report completo) e o link do destaque como texto");
  var ordemEml = ["99,9%", "Indicador B, em uma frase", "7 de 10"].map(function (x) { return html.indexOf(x); });
  confere(ordemEml[1] < ordemEml[0] && ordemEml[0] < ordemEml[2], ".eml: a ordem do e-mail é a ordem escolhida");
  confere(!/<script|resumo-email|data-campo|contenteditable/.test(html), ".eml: estático, sem a configuração dos destaques nem marcas de edição");

  /* 10. imagem do resumo (.png) */
  var dp = await Promise.all([p.waitForEvent("download"), p.click("#bPngRes")]), png = path.join(SAIDA, "resumo-destaques.png"); await dp[0].saveAs(png);
  var b = fs.readFileSync(png);
  confere(b.slice(0, 8).toString("hex") === "89504e470d0a1a0a" && b.readUInt32BE(16) === 1360 && b.readUInt32BE(20) > 1000 && /-resumo\.png$/.test(dp[0].suggestedFilename()), ".png: PNG de verdade, 1360 px de largura (o dobro de 680) · " + b.readUInt32BE(16) + "×" + b.readUInt32BE(20) + " · " + Math.round(b.length / 1024) + " KB");

  /* 11. e-mail completo: não leva a configuração do resumo */
  await p.waitForFunction(function () { return !document.querySelector("#bEml").disabled; }, null, { timeout: 30000 });
  var dc = await Promise.all([p.waitForEvent("download"), p.click("#bEml")]), arqC = path.join(SAIDA, "resumo-completo.eml"); await dc[0].saveAs(arqC);
  var htmlC = htmlDoEml(fs.readFileSync(arqC, "latin1"));
  confere(htmlC.length > 0 && !/resumo-email|Item novo fictício/.test(htmlC), "e-mail completo: sem a configuração do resumo e sem a informação nova");

  /* 12. salvar: a escolha fica num bloco de dados à parte; o conteúdo do report não muda */
  await p.click("#bSalvar"); await p.waitForFunction(function () { return window.__salvos.length > 0; }, null, { timeout: 30000 });
  var salvo = await p.evaluate(function () { return window.__salvos[window.__salvos.length - 1]; });
  var arqS = path.join(SAIDA, "resumo-salvo.html"); fs.writeFileSync(arqS, salvo.html);
  var m = /<script type="application\/json" id="resumo-email">([\s\S]*?)<\/script>/.exec(salvo.html), cfg = null;
  try { cfg = JSON.parse(m[1]); } catch (e) { cfg = null; }
  confere(cfg && cfg.versao === 1 && cfg.destaques.map(function (x) { return x.origem; }).join(",") === "numero-2,numero-1,numero-3,novo-1" && cfg.destaques[3].revisado === true && cfg.destaques[1].link === LINK_DTQ && cfg.destaques[0].imagem && cfg.destaques[0].imagem.video === true,
    "arquivo salvo: ordem, informação nova revisada, link e imagem com ▶ gravados · " + (cfg ? cfg.destaques.map(function (x) { return x.origem; }).join(",") : "sem bloco"));
  var semCfg = salvo.html.replace(m ? m[0] : "", "");
  confere(m && m[1].indexOf("<") < 0 && !/Item novo fictício|Indicador B, em uma frase/.test(semCfg) && /data-campo="numero-2.titulo"[^>]*>Indicador B</.test(semCfg), "o conteúdo do report não muda (o que é só do e-mail fica no bloco de dados)");

  /* 13. reabrir o salvo: a escolha volta */
  var p2 = await abrir(arqS); await p2.fill("#link", LINK); await liberado(p2);
  confere(await ordem(p2) === "numero-2,numero-1,numero-3,novo-1" && /^4 de 4/.test(await conta(p2)) && /revisada/.test(await p2.locator("#dtqEscolhidos .dtq.novo .selo").first().textContent()), "reaberto: mesma ordem, informação nova revisada (" + await conta(p2) + ")");
  confere(await cartao(p2, 0).locator('label.f:has-text("Título") input').inputValue() === "Indicador B, em uma frase para o e-mail" && await cartao(p2, 0).locator(".img img").count() === 1, "reaberto: título ajustado e imagem do computador continuam");
  await esperaPrev(p2, function (s) { return (s.match(/class="col kpi dtq/g) || []).length === 4 && /99,9%/.test(s); });
  confere(true, "reaberto: a prévia sai igual (4 destaques, número atualizado)");

  /* 14. celular: 390 px sem rolar para o lado */
  await p2.click('button[data-w="390px"]'); await p2.waitForTimeout(900);
  var cel = await p2.evaluate(function () { var fr = document.querySelector("#prev"), dd = fr.contentDocument; return { janela: fr.clientWidth, conteudo: dd.documentElement.scrollWidth }; });
  confere(cel.janela <= 392 && cel.conteudo <= cel.janela, "celular 390 px: o e-mail não rola para o lado · " + JSON.stringify(cel));

  /* 15. voltar para a sugestão */
  await p2.click("#bDtqSugestao");
  await p2.waitForFunction(function () { return /sugestão/.test(document.querySelector("#dtqConta").textContent); }, null, { timeout: 30000 });
  confere(!/novo-1/.test(await ordem(p2)), "Voltar para a sugestão: a lista automática volta (" + await ordem(p2) + ")");

  await browser.close();
  confere(!erros.length, "sem erro na página" + (erros.length ? ": " + erros.join(" | ") : ""));
  console.log(falhas ? "\n" + falhas + " falha(s)." : "\nTudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
