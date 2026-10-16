/*
 * Monta a versão avulsa do emulador: um único arquivo .html, com o motor (tools/motor.js) e o
 * modelo em branco (tools/coringa.js) embutidos. É o arquivo que o time recebe e abre com dois
 * cliques no Chrome ou no Edge, em qualquer pasta. Uso técnico (quem mantém a ferramenta):
 *   node tools/montar-avulso.js [destino]      (padrão: kit/emulador-report.html)
 */
"use strict";
var fs = require("fs"), path = require("path");
var RAIZ = path.join(__dirname, ".."), destino = path.resolve(process.argv[2] || path.join(RAIZ, "kit", "emulador-report.html"));
function embutir(arq, comentario) {
  /* Dentro de <script>, "</script" fecharia o bloco e "<!--" muda o modo de leitura do navegador. */
  var js = fs.readFileSync(path.join(RAIZ, arq), "utf8").replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "\\x3C!--");
  return "<script>\n/* " + comentario + " */\n" + js + "\n</script>";
}
var h = fs.readFileSync(path.join(RAIZ, "converter-html-eml.html"), "utf8");
[["tools/motor.js", "tools/motor.js embutido: esta versão funciona sozinha, sem a pasta do projeto."],
 ["tools/coringa.js", "tools/coringa.js embutido: o modelo em branco."]].forEach(function (x) {
  var tag = '<script src="' + x[0] + '"></script>';
  if (h.split(tag).length !== 2) throw new Error("não encontrei " + tag);
  h = h.split(tag).join(embutir(x[0], x[1]));
});
h = h.replace("  Precisa de tools/motor.js e tools/coringa.js na mesma estrutura de pastas\n  (a versão avulsa, para o time, já traz os dois embutidos).",
  "  Versão avulsa: o motor e o modelo em branco estão embutidos. Funciona\n  sozinha, em qualquer pasta (dois cliques: abre no navegador).");
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, h);
console.log("Emulador avulso: " + path.relative(RAIZ, destino) + " (" + Math.round(Buffer.byteLength(h) / 1024) + " KB)");
