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

/* 2b) Arquivo .eml: abre no Outlook como rascunho pronto (X-Unsent), imagens embutidas via cid */
const b64lines = s => s.replace(/.{1,76}/g, "$&\r\n");
const boundary = "----=_report_" + Date.now().toString(36);
const subject = "=?UTF-8?B?" + Buffer.from(content.meta.assuntoEmail || "Report").toString("base64") + "?=";
const eml = [
  "X-Unsent: 1", "Subject: " + subject, "MIME-Version: 1.0",
  `Content-Type: multipart/related; boundary="${boundary}"; type="text/html"`, "",
  "--" + boundary, 'Content-Type: text/html; charset="utf-8"', "Content-Transfer-Encoding: base64", "",
  b64lines(Buffer.from(emailCid, "utf8").toString("base64")),
  ...attachments.flatMap(a => ["--" + boundary, `Content-Type: ${a.contentType}; name="${a.name}"`, "Content-Transfer-Encoding: base64",
    `Content-ID: <${a.contentId}>`, `Content-Disposition: inline; filename="${a.name}"`, "", b64lines(a.contentBytes)]),
  "--" + boundary + "--", ""
].join("\r\n");
const emlName = `report-${slug}.eml`;
fs.writeFileSync(path.join(out, emlName), eml);

/* 2c) Prévia em arquivo único (imagens em base64): só para ver no navegador; o Outlook bloqueia base64 */
const dataUri = {};
attachments.forEach(a => { dataUri[a.name] = `data:${a.contentType};base64,${a.contentBytes}`; });
const preview = T.renderEmail(content, { src: p => dataUri[path.basename(p)] || rel(p), emailThumb });
fs.writeFileSync(path.join(out, `email-previa-${slug}.html`), preview);

/* 3) Versão web */
fs.writeFileSync(path.join(out, "report.html"), T.renderWeb(content, { src: rel }));

/* Relatório */
const lint = T.lintEmail(emailCid);
const pend = T.validate(content);
console.log(`\nReport ${content.meta.mes} ${content.meta.ano} → dist/${slug}/`);
console.log(`  email.html      ${Math.round(Buffer.byteLength(emailPreview) / 1024)} KB`);
console.log(`  sendmail.json   ${Math.round(payloadStr.length / 1024)} KB (HTML ${lint.kb} KB + ${attachments.length} imagens inline, ${Math.round(total / 1024)} KB)`);
console.log(`  ${emlName}  ${Math.round(eml.length / 1024)} KB  ← abrir no Outlook`);
console.log(`  email-previa-${slug}.html  ${Math.round(preview.length / 1024)} KB  ← prévia no navegador`);
console.log(`  report.html     ${Math.round(fs.statSync(path.join(out, "report.html")).size / 1024)} KB`);
if (payloadStr.length > 3 * 1024 * 1024) warn.push("Pacote acima de ~3 MB: o Graph exige sessão de upload para anexos maiores. Reduza as imagens.");
console.log(`\nCompatibilidade com Outlook: ${lint.issues.length ? "\n  - " + lint.issues.join("\n  - ") : "ok"}`);
console.log(`Pendências no conteúdo (${pend.length}):${pend.map(p => `\n  - ${p.campo}: ${p.valor}`).join("")}`);
if (warn.length) console.log(`Avisos:${[...new Set(warn)].map(w => "\n  - " + w).join("")}`);
console.log("");
