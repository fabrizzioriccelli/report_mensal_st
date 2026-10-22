/*
 * Teste do trabalho pesado do emulador (Web Worker), sem navegador (uso técnico, opcional).
 * Roda o mesmo código do TRABALHADOR de converter-html-eml.html no Node e confere a ida e volta:
 * separar a mídia de um .html (data:…;base64 → binário) e juntar de novo (binário → base64) devolve o arquivo
 * idêntico, byte a byte, mesmo com blocos minúsculos (cabeçalho e base64 cortados entre blocos), acentos e emoji,
 * parâmetros no tipo, os três finais de base64 ("", "=", "=="), "data:" pequeno (fica no texto) e mídia repetida
 * (vira uma só). Só conteúdo sintético e os reports de exemplo do kit.
 *   Requer Node.js 18+:  node tests/trabalhador.test.js
 */
"use strict";
var fs = require("fs"), path = require("path"), crypto = require("crypto"), assert = require("assert");
var RAIZ = path.join(__dirname, "..");
var src = fs.readFileSync(path.join(RAIZ, "converter-html-eml.html"), "utf8");
var CODIGO = src.slice(src.indexOf("  function TRABALHADOR() {"), src.indexOf("\n  var TRAB = null"));
var falhas = 0, total = 0;

function trabalhador(bloco) {
  var onmsg, espera = {}, n = 0;
  var self = { postMessage: function (m) { if (m.progresso === undefined) espera[m.id](m); }, set onmessage(f) { onmsg = f; } };
  new Function("self", CODIGO.replace("BLOCO = 16 << 20", "BLOCO = " + bloco) + "\nTRABALHADOR();")(self);
  return function (tipo, dados) { return new Promise(function (ok) { var id = ++n; espera[id] = ok; onmsg({ data: Object.assign({ tipo: tipo, id: id }, dados) }); }); };
}
async function idaVolta(buf, bloco) {
  var w = trabalhador(bloco), r = await w("separar", { arquivo: new Blob([buf]) });
  if (r.erro) throw new Error(r.erro);
  var cods = [];
  for (var i = 0; i < r.r.midias.length; i++) { var c = await w("codificar", { blob: r.r.midias[i] }); if (c.erro) throw new Error(c.erro); cods.push(Buffer.from(await c.r.arrayBuffer())); }
  return { volta: Buffer.concat(r.r.partes.map(function (x) { return typeof x === "string" ? Buffer.from(x, "utf8") : cods[x.k]; })), sep: r.r };
}
async function teste(nome, fn) {
  total++;
  try { await fn(); console.log("  ok   " + nome); } catch (e) { falhas++; console.log("  FALHA " + nome + ": " + e.message); }
}

(async function () {
  assert.ok(CODIGO.length > 1000, "TRABALHADOR não encontrado no emulador");
  var b64 = function (n) { return crypto.randomBytes(n).toString("base64"); };
  var img = b64(5000), pdf = b64(5001), svg = b64(5002);
  var sintetico = Buffer.from('<!DOCTYPE html><html><head><title>Ação ✓ 😀</title></head><body><p>Olá, ção</p>' +
    '<img src="data:image/png;base64,' + img + '"> texto "data:" solto e data:x/y;base64,AAAA pequeno · ' +
    '<a data-anexo="data:application/pdf;name=a.pdf;base64,' + pdf + '">pdf</a> ' +
    '<img src="data:image/png;base64,' + img + '"> (repetida) <img src="data:image/svg+xml;charset=utf-8;base64,' + svg + '"> fim ção 😀</body></html>', "utf8");

  for (var bl of [5, 7, 64, 1000, 4096, 1 << 24]) await (async function (bl) {
    await teste("ida e volta idêntica, blocos de " + bl + " bytes (cabeçalho e base64 cortados entre blocos)", async function () {
      var r = await idaVolta(sintetico, bl);
      assert.ok(Buffer.compare(r.volta, sintetico) === 0, "o arquivo voltou diferente (" + r.volta.length + " de " + sintetico.length + " bytes)");
    });
  })(bl);

  await teste("mídia repetida vira uma só; \"data:\" pequeno fica no texto; tipo guarda os parâmetros", async function () {
    var r = await idaVolta(sintetico, 1 << 24), s = r.sep;
    assert.strictEqual(s.partes.filter(function (x) { return typeof x !== "string"; }).length, 4, "4 lugares de mídia");
    assert.strictEqual(s.midias.length, 3, "3 mídias (a repetida é a mesma)");
    assert.deepStrictEqual(s.midias.map(function (b) { return b.type; }), ["image/png", "application/pdf;name=a.pdf", "image/svg+xml;charset=utf-8"]);
    assert.ok(s.partes.filter(function (x) { return typeof x === "string"; }).join("").indexOf("data:x/y;base64,AAAA pequeno") > 0, "o data: pequeno continua no texto");
    assert.deepStrictEqual(s.ilegiveis, [], "todas as mídias legíveis");
  });

  await teste("os bytes da mídia saem decodificados certos (os três finais de base64)", async function () {
    for (var n of [3000, 3001, 3002]) {
      var bytes = crypto.randomBytes(n), w = trabalhador(1 << 24);
      var r = await w("separar", { arquivo: new Blob(['<html><body><img src="data:image/jpeg;base64,' + bytes.toString("base64") + '"></body></html>']) });
      assert.ok(Buffer.compare(Buffer.from(await r.r.midias[0].arrayBuffer()), bytes) === 0, n + " bytes");
    }
  });

  for (var f of ["kit/report-exemplo.html", "kit/report-coringa.html"]) await (async function (f) {
    await teste(f + ": ida e volta idêntica (blocos de 100 KB e de 16 MB)", async function () {
      var buf = fs.readFileSync(path.join(RAIZ, f));
      for (var bl of [100003, 1 << 24]) { var r = await idaVolta(buf, bl); assert.ok(Buffer.compare(r.volta, buf) === 0, "bloco " + bl); assert.ok(r.sep.midias.length > 5, "mídias separadas"); }
    });
  })(f);

  console.log("\n" + (total - falhas) + " de " + total + " testes passaram.");
  process.exit(falhas ? 1 : 0);
})();
