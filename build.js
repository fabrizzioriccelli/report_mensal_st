#!/usr/bin/env node
/* =====================================================================
   BUILD DO REPORT · node build.js conteudo/2026-09.json [destinatario@empresa]
   ---------------------------------------------------------------------
   Gera em dist/<mês>/:
     email.html     → e-mail (imagens por caminho relativo, para prévia)
     sendmail.json  → corpo pronto para POST /me/sendMail do Microsoft
                      Graph, com as imagens como anexos inline (cid:)
     report.html    → versão web interativa (para o SharePoint)
   Sem dependências: Node 18+.
   ===================================================================== */
const fs = require("fs");
const path = require("path");
const T = require("./template/render.js");

const ROOT = __dirname;
const input = process.argv[2] || "conteudo/2026-09.json";
const to = process.argv[3] || "[DESTINATARIO@EMPRESA]";
const content = JSON.parse(fs.readFileSync(path.resolve(ROOT, input), "utf8"));
const slug = path.basename(input, ".json");
const out = path.join(ROOT, "dist", slug);
fs.mkdirSync(out, { recursive: true });
const rel = p => (/^https?:|^cid:/i.test(p) ? p : "../../" + p);
const exists = p => fs.existsSync(path.resolve(ROOT, p));
const warn = [];

/* Miniatura de vídeo com play gravado: usa "<nome>-play.jpg" se existir */
const emailThumb = p => {
  const pv = T.playVersion(p);
  if (exists(pv)) return pv;
  warn.push(`Sem versão com play para ${p}: gere no gerador.html ou crie ${pv}.`);
  return p;
};

/* 1) E-mail para prévia (caminhos relativos) */
const emailPreview = T.renderEmail(content, { src: rel, emailThumb });
fs.writeFileSync(path.join(out, "email.html"), emailPreview);

/* 2) Pacote de envio: imagens como anexos inline (cid) */
const images = T.collectImages(content).map(i => ({ ...i, file: i.kind === "video" ? emailThumb(i.src) : i.src }));
const files = new Set(images.map(i => i.file));
const emailCid = T.renderEmail(content, { src: p => (files.has(p) ? "cid:" + path.basename(p) : rel(p)), emailThumb });
let total = 0;
const attachments = images.filter(i => exists(i.file)).map(i => {
  const buf = fs.readFileSync(path.resolve(ROOT, i.file));
  total += buf.length;
  if (buf.length > 200 * 1024) warn.push(`${i.file} tem ${Math.round(buf.length / 1024)} KB: reduza para até ~200 KB.`);
  const ext = path.extname(i.file).slice(1).toLowerCase();
  return { "@odata.type": "#microsoft.graph.fileAttachment", name: path.basename(i.file), contentType: ext === "png" ? "image/png" : "image/jpeg",
    contentId: path.basename(i.file), isInline: true, contentBytes: buf.toString("base64") };
});
images.filter(i => !exists(i.file)).forEach(i => warn.push(`Imagem não encontrada: ${i.file}`));
const payload = {
  message: {
    subject: content.meta.assuntoEmail,
    body: { contentType: "HTML", content: emailCid },
    toRecipients: [{ emailAddress: { address: to } }],
    attachments
  },
  saveToSentItems: true
};
const payloadStr = JSON.stringify(payload);
fs.writeFileSync(path.join(out, "sendmail.json"), payloadStr);

/* 3) Versão web */
fs.writeFileSync(path.join(out, "report.html"), T.renderWeb(content, { src: rel }));

/* Relatório */
const lint = T.lintEmail(emailCid);
const pend = T.validate(content);
console.log(`\nReport ${content.meta.mes} ${content.meta.ano} → dist/${slug}/`);
console.log(`  email.html      ${Math.round(Buffer.byteLength(emailPreview) / 1024)} KB`);
console.log(`  sendmail.json   ${Math.round(payloadStr.length / 1024)} KB (HTML ${lint.kb} KB + ${attachments.length} imagens inline, ${Math.round(total / 1024)} KB)`);
console.log(`  report.html     ${Math.round(fs.statSync(path.join(out, "report.html")).size / 1024)} KB`);
if (payloadStr.length > 3 * 1024 * 1024) warn.push("Pacote acima de ~3 MB: o Graph exige sessão de upload para anexos maiores. Reduza as imagens.");
console.log(`\nCompatibilidade com Outlook: ${lint.issues.length ? "\n  - " + lint.issues.join("\n  - ") : "ok"}`);
console.log(`Pendências no conteúdo (${pend.length}):${pend.map(p => `\n  - ${p.campo}: ${p.valor}`).join("")}`);
if (warn.length) console.log(`Avisos:${[...new Set(warn)].map(w => "\n  - " + w).join("")}`);
console.log("");
