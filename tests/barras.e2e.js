/*
 * Teste de ponta a ponta das barras flutuantes do emulador (uso técnico, opcional).
 * Move o mouse como uma pessoa (em passos, na velocidade da mão) do alvo até cada botão da barra que
 * apareceu e confere que a barra não troca no caminho (ex.: ir da imagem até "Trocar imagem" passando
 * pelo cartão não pode virar a barra do item). Passa por todos os alvos visíveis: imagens, links,
 * itens de todos os grupos, blocos, tópicos nos 4 layouts e etiquetas (Cor: verde / Cor: âmbar),
 * no modo Computador e no modo Celular, no report de exemplo (com tópicos) e no modelo em branco.
 * Caminhos: reto e em curva para os dois lados; um caminho lento (mão parando pouco) numa amostra.
 * Só conteúdo fictício (dados/EXEMPLO-treinamento.txt e kit/report-coringa.html).
 *   Requer Node.js + Playwright:  node tests/barras.e2e.js   (~15 min; SO=1 a 4 roda uma rodada só)
 *   (EMULADOR=kit/emulador-report.html testa o emulador avulso; DEPURAR=1 lista cada caminho que falhou)
 */
"use strict";
var path = require("path"), fs = require("fs");
var chromium = require("playwright").chromium;
var Motor = require("../tools/motor.js");
var RAIZ = path.join(__dirname, ".."), SAIDA = path.join(RAIZ, "tests", "saida");
var EMU = "file://" + path.resolve(RAIZ, process.env.EMULADOR || "converter-html-eml.html");
var falhas = 0;
function confere(ok, msg) { console.log((ok ? "  ok   " : "  FALHA ") + msg); if (!ok) falhas++; }
function ler(p) { return fs.readFileSync(path.join(RAIZ, p), "utf8"); }

function montar(dados) {
  var r = Motor.montar({ dados: dados, arquivoDados: "barras.txt", marca: ler("config/marca.txt"), template: ler("template/report.html"), existe: function (p) { return fs.existsSync(path.join(RAIZ, p)); } });
  var h = r.html;
  r.imagens.forEach(function (i) {
    var tipo = /\.png$/i.test(i.caminho) ? "image/png" : /\.webm$/i.test(i.caminho) ? "video/webm" : /\.mp4$/i.test(i.caminho) ? "video/mp4" : "image/jpeg";
    h = h.split(i.token).join("data:" + tipo + ";base64," + fs.readFileSync(path.join(RAIZ, i.caminho)).toString("base64"));
  });
  return h;
}
/* o exemplo de treinamento + um tópico em cada layout, com links e imagens */
var EXEMPLO = ler("dados/EXEMPLO-treinamento.txt") +
  "\n[TOPICO]\nrotulo: Testes\ntitulo: Tópico em lista\nlayout: lista\n[TOPICO 1]\nnome: Item da lista\ntexto: Texto de exemplo.\nlinks: Documento | https://www.example.com/doc\nimagens: print-exemplo.png, print-exemplo.png\n[TOPICO 2]\nnome: Outro item\n" +
  "[TOPICO B]\nrotulo: Números\nlayout: numeros\n[TOPICO B 1]\nvalor: 12\nnome: Um\n[TOPICO B 2]\nvalor: 34\nnome: Dois\n[TOPICO B 3]\nvalor: 56\nnome: Três\n" +
  "[TOPICO C]\nrotulo: Cartões\nlayout: cartoes\n[TOPICO C 1]\nstatus: Em teste\nstatus_cor: ambar\nnome: Cartão 1\nlinks: Documento | https://www.example.com/doc\nimagens: print-exemplo.png\n[TOPICO C 2]\nnome: Cartão 2\nimagens: print-exemplo.png\n[TOPICO C 3]\nnome: Cartão 3\n[TOPICO C 4]\nnome: Cartão 4\n" +
  "[TOPICO D]\nrotulo: Colunas\nlayout: colunas\n[TOPICO D 1]\nnome: Coluna 1\nlinks: Documento | https://www.example.com/doc\nimagens: print-exemplo.png\n[TOPICO D 2]\nnome: Coluna 2\n";

var ALVOS = 'img[data-img], a.cta, a[data-anexo], span[title="Link ainda não definido"], [data-item], [data-ed-bloco]';

(async function () {
  fs.mkdirSync(SAIDA, { recursive: true });
  var arqExemplo = path.join(SAIDA, "barras-exemplo.html");
  fs.writeFileSync(arqExemplo, montar(EXEMPLO));
  var browser = await chromium.launch(), erros = [];
  var ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });

  /* Roda na página do emulador (o quadro não roda script): devolve o que está no ponto do quadro. */
  function sob(o) {
    var f = document.querySelector("#edFrame"), d = f.contentDocument, q = f.getBoundingClientRect();
    var el = d.elementFromPoint(o.x - q.left, o.y - q.top); if (!el) return { tipo: "nada" };
    var b = el.closest("#ed-barra button"); if (b) return { tipo: "botao", texto: b.textContent };
    if (el.closest("#ed-barra")) return { tipo: "barra" };
    var alvo = el.closest("img[data-img]") || el.closest('a.cta, a[data-anexo], span[title="Link ainda não definido"]') || el.closest("[data-item], [data-ed-bloco]");
    return { tipo: alvo ? "alvo" : "nada", i: alvo ? Array.prototype.indexOf.call(d.querySelectorAll(o.alvos), alvo) : -1 };
  }
  function barraAgora() {
    var b = document.querySelector("#edFrame").contentDocument.getElementById("ed-barra");
    return !b || b.hidden ? "(sem barra)" : Array.prototype.map.call(b.querySelectorAll("button"), function (x) { return x.textContent; }).join(" / ");
  }
  /* Lista os alvos visíveis e, para cada um, um ponto de passar o mouse onde ele é o alvo de cima. */
  function listar(o) {
    var f = document.querySelector("#edFrame"), d = f.contentDocument, todos = d.querySelectorAll(o.alvos), out = [];
    Array.prototype.forEach.call(todos, function (el, i) {
      if (el.closest("[data-ed-oculta]")) return;
      var r = el.getBoundingClientRect(); if (r.width < 6 || r.height < 6) return;
      var nome = el.tagName === "IMG" ? "imagem " + el.getAttribute("data-img") : el.hasAttribute("data-item") ? "item " + el.getAttribute("data-item") : el.hasAttribute("data-ed-bloco") ? "bloco " + el.getAttribute("data-ed-bloco") : "link \"" + el.textContent.trim().slice(0, 30) + "\"";
      out.push({ i: i, nome: nome });
    });
    return out;
  }
  function pontoDe(o) {
    var f = document.querySelector("#edFrame"), d = f.contentDocument, el = d.querySelectorAll(o.alvos)[o.i];
    d.getElementById("ed-barra").hidden = true;
    el.scrollIntoView({ block: "center", inline: "nearest" });
    var q = f.getBoundingClientRect(), r = el.getBoundingClientRect(), pts = [];
    for (var a = 1; a < 12; a++) for (var b = 1; b < 12; b++) pts.push([r.left + r.width * a / 12, r.top + r.height * b / 12]);
    pts.sort(function (m, n) { return Math.hypot(m[0] - r.left - r.width / 2, m[1] - r.top - r.height / 2) - Math.hypot(n[0] - r.left - r.width / 2, n[1] - r.top - r.height / 2); });
    for (var k = 0; k < pts.length; k++) {
      var x = pts[k][0] + q.left, y = pts[k][1] + q.top;
      if (x < 2 || y < 2 || x > innerWidth - 2 || y > innerHeight - 2) continue;
      var e = d.elementFromPoint(pts[k][0], pts[k][1]); if (!e) continue;
      var alvo = e.closest("img[data-img]") || e.closest('a.cta, a[data-anexo], span[title="Link ainda não definido"]') || e.closest("[data-item], [data-ed-bloco]");
      if (alvo === el) {
        /* ponto neutro (fora do quadro ou sem alvo) para começar do zero */
        var neutro = [[3, 3], [innerWidth - 3, 3], [3, innerHeight - 3], [innerWidth - 3, innerHeight - 3]].find(function (n) {
          var fx = n[0] - q.left, fy = n[1] - q.top; if (fx < 0 || fy < 0 || fx > q.width || fy > q.height) return true;
          var z = d.elementFromPoint(fx, fy); return !z || !z.closest(o.alvos);
        }) || [3, 3];
        return { x: x, y: y, nx: neutro[0], ny: neutro[1] };
      }
    }
    return null;
  }
  function botaoDe(o) {
    var f = document.querySelector("#edFrame"), q = f.getBoundingClientRect(), b = f.contentDocument.getElementById("ed-barra");
    if (b.hidden) return null;
    var x = Array.prototype.find.call(b.querySelectorAll("button"), function (y) { return y.textContent === o.texto; }); if (!x) return null;
    var r = x.getBoundingClientRect();
    return { x: q.left + r.left + r.width / 2, y: q.top + r.top + r.height / 2 };
  }
  function rotulos() {
    var b = document.querySelector("#edFrame").contentDocument.getElementById("ed-barra");
    return b.hidden ? [] : Array.prototype.map.call(b.querySelectorAll("button"), function (x) { return x.textContent; });
  }

  /* Mão de verdade: passos de ~8 px a cada 12 ms (~650 px/s); "lento" ~200 px/s. Curva: ponto de controle a 25% da distância (desvio de até 12,5%). */
  async function caminho(p, de, ate, curva, lento) {
    var dx = ate.x - de.x, dy = ate.y - de.y, dist = Math.hypot(dx, dy), n = Math.max(5, Math.round(dist / 8));
    var cx = de.x + dx / 2 - dy * curva, cy = de.y + dy / 2 + dx * curva;
    for (var k = 1; k <= n; k++) {
      var t = k / n, x = (1 - t) * (1 - t) * de.x + 2 * (1 - t) * t * cx + t * t * ate.x, y = (1 - t) * (1 - t) * de.y + 2 * (1 - t) * t * cy + t * t * ate.y;
      await p.mouse.move(x, y); await p.waitForTimeout(lento ? 40 : 12);
    }
    await p.waitForTimeout(60);
  }
  /* Rola até o alvo e espera a rolagem parar (o ponto calculado com a página andando sai errado). */
  async function parado(p, fn, arg) {
    var antes = JSON.stringify(await p.evaluate(fn, arg));
    for (var k = 0; k < 40; k++) { await p.waitForTimeout(40); var agora = JSON.stringify(await p.evaluate(fn, arg)); if (agora === antes) return JSON.parse(agora); antes = agora; }
    return JSON.parse(antes);
  }
  /* Começa limpo: mouse fora do quadro, barra escondida, e entra direto no ponto do alvo. */
  async function preparar(p, i) {
    var pt = await parado(p, pontoDe, { alvos: ALVOS, i: i }); if (!pt) return null;
    await p.mouse.move(pt.nx, pt.ny); await p.waitForTimeout(30);
    await p.evaluate(function () { var b = document.querySelector("#edFrame").contentDocument.getElementById("ed-barra"); b.hidden = true; b.dono = null; });
    await p.mouse.move(pt.x, pt.y); await p.waitForTimeout(120);
    return pt;
  }

  async function rodada(nomeArq, arq, celular) {
    var p = await ctx.newPage(), nomeCaso = nomeArq + (celular ? " · Celular" : " · Computador");
    p.on("pageerror", function (e) { erros.push(e.message); });
    p.on("dialog", function (d) { d.dismiss(); });
    await p.goto(EMU); await p.setInputFiles("#arquivo", arq);
    await p.waitForFunction(function () { return /banner (ok|warn|err)/.test(document.querySelector("#banner").className); }, null, { timeout: 120000 });
    await p.waitForFunction(function () { var f = document.querySelector("#edFrame"); return f && f.contentDocument && f.contentDocument.getElementById("ed-barra"); }, null, { timeout: 30000 });
    if (celular) { await p.click('.ferramentas button[data-ew="390px"]'); await p.waitForTimeout(400); }
    var lista = await p.evaluate(listar, { alvos: ALVOS }), ruins = [], testados = 0, botoes = 0, semPonto = [];
    for (var a = 0; a < lista.length; a++) {
      var alvo = lista[a], pt = await preparar(p, alvo.i);
      if (!pt) { semPonto.push(alvo.nome); continue; }
      var bs = await p.evaluate(rotulos); if (!bs.length) { ruins.push(alvo.nome + ": a barra não apareceu"); continue; }
      testados++;
      for (var b = 0; b < bs.length; b++) {
        /* reto em todos; curva para um lado ou para o outro, alternando; lento numa amostra */
        var formas = [[0, false], [a % 2 ? 0.25 : -0.25, false]];
        if (b === 0 && a % 5 === 0) formas.push([0.12, true]);
        for (var fz = 0; fz < formas.length; fz++) {
          pt = await preparar(p, alvo.i);
          var dest = await p.evaluate(botaoDe, { texto: bs[b] });
          if (!dest) { ruins.push(alvo.nome + " → \"" + bs[b] + "\": a barra não voltou igual"); break; }
          await caminho(p, pt, dest, formas[fz][0], formas[fz][1]);
          var s = await p.evaluate(sob, { x: dest.x, y: dest.y, alvos: ALVOS });
          botoes++;
          if (s.tipo !== "botao" || s.texto !== bs[b]) {
            ruins.push(alvo.nome + " → \"" + bs[b] + "\" (" + (formas[fz][1] ? "lento" : formas[fz][0] ? "curva " + formas[fz][0] : "reto") + "): chegou em " + (s.tipo === "botao" ? "\"" + s.texto + "\"" : s.tipo) + "; barra agora: " + await p.evaluate(barraAgora));
            break;
          }
        }
      }
    }
    /* etiquetas: clica no campo (a barra de cor aparece em cima) e vai até as cores */
    var etiquetas = await p.evaluate(function () {
      var d = document.querySelector("#edFrame").contentDocument;
      return Array.prototype.map.call(d.querySelectorAll("[data-ed-campo]"), function (el, i) { return { i: i, ok: (el.matches("[data-tom]") || el.querySelector("[data-tom]")) && !el.closest("[data-ed-oculta]") && el.getBoundingClientRect().width > 4, nome: el.getAttribute("data-campo") }; }).filter(function (x) { return x.ok; });
    });
    for (var e = 0; e < etiquetas.length; e++) {
      for (var cor of ["Cor: verde", "Cor: âmbar"]) {
        var pc = await parado(p, function (i) {
          var f = document.querySelector("#edFrame"), d = f.contentDocument, el = d.querySelectorAll("[data-ed-campo]")[i];
          if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
          d.getElementById("ed-barra").hidden = true;
          el.scrollIntoView({ block: "center" });
          var q = f.getBoundingClientRect(), r = el.getBoundingClientRect();
          return { x: q.left + r.left + Math.min(r.width / 2, 20), y: q.top + r.top + r.height / 2 };
        }, etiquetas[e].i);
        await p.mouse.move(3, 3); await p.mouse.click(pc.x, pc.y); await p.waitForTimeout(150);
        var dc = await p.evaluate(botaoDe, { texto: cor });
        if (!dc) { ruins.push("etiqueta " + etiquetas[e].nome + ": a barra de cor não apareceu (" + await p.evaluate(barraAgora) + ")"); break; }
        await caminho(p, pc, dc, 0, false);
        var se = await p.evaluate(sob, { x: dc.x, y: dc.y, alvos: ALVOS });
        botoes++;
        if (se.tipo !== "botao" || se.texto !== cor) { ruins.push("etiqueta " + etiquetas[e].nome + " → \"" + cor + "\": chegou em " + (se.tipo === "botao" ? "\"" + se.texto + "\"" : se.tipo) + "; barra agora: " + await p.evaluate(barraAgora)); break; }
      }
    }
    await p.evaluate(function () { var d = document.querySelector("#edFrame").contentDocument; if (d.activeElement && d.activeElement.blur) d.activeElement.blur(); });
    if (process.env.DEPURAR) ruins.forEach(function (x) { console.log("     · " + x); });
    confere(!ruins.length, nomeCaso + ": " + testados + " alvos e " + etiquetas.length + " etiquetas, " + botoes + " caminhos até os botões, a barra fica até o clique" + (ruins.length ? " — " + ruins.length + " problema(s): " + ruins.slice(0, 4).join(" | ") : ""));
    if (semPonto.length) console.log("       (sem ponto livre para o mouse: " + semPonto.join(", ") + ")");
    await p.close();
  }

  /* SO=1..4 roda só uma das quatro rodadas (para investigar) */
  var rodadas = [["exemplo com tópicos", arqExemplo, false], ["modelo em branco", path.join(RAIZ, "kit", "report-coringa.html"), false], ["exemplo com tópicos", arqExemplo, true], ["modelo em branco", path.join(RAIZ, "kit", "report-coringa.html"), true]];
  for (var k = 0; k < rodadas.length; k++) if (!process.env.SO || +process.env.SO === k + 1) await rodada(rodadas[k][0], rodadas[k][1], rodadas[k][2]);
  confere(!erros.length, "sem erros no console" + (erros.length ? ": " + erros.slice(0, 3).join(" | ") : ""));
  await browser.close();
  console.log(falhas ? falhas + " falha(s)." : "Tudo certo.");
  process.exit(falhas ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
