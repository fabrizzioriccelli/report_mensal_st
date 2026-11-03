/*
 * MOTOR DO REPORT · Creative Strategy PF
 * ======================================================================
 * Código técnico. Você NÃO precisa abrir este arquivo no dia a dia.
 * No dia a dia, edite dados/AAAA-MM.txt (conteúdo) e, raramente,
 * config/marca.txt (fontes, cores, imagens, links).
 *
 * O que este arquivo faz:
 *   1. lê os arquivos "campo: valor" (dados do mês e marca);
 *   2. confere tudo (campos, imagens, links, pendências);
 *   3. monta o modelo do e-mail e aplica no template/report.html;
 *   4. gera a versão em texto puro e o arquivo .eml (MIME);
 *   5. converte uma página do mês editada no navegador em .eml
 *      (converter-html-eml.html).
 *
 * Roda no navegador (tools/gerar-report.html carrega este arquivo) e no
 * Node.js (testes em tests/). Sem nenhuma dependência externa.
 * ======================================================================
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Motor = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  /* Versão do projeto (veja CHANGELOG.md). Aparece na página de geração e nos arquivos gerados. */
  var VERSAO = "4.13 (2026-11-03)";

  /* =================================================================== */
  /* 1. LEITURA DOS ARQUIVOS "campo: valor"                               */
  /* =================================================================== */

  function semAcento(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function chaveBloco(s) { return semAcento(s).trim().toUpperCase().replace(/\s+/g, " "); }
  function chaveCampo(s) { return semAcento(s).trim().toLowerCase().replace(/[\s-]+/g, "_"); }

  function problema(lista, nivel, arquivo, linha, msg) {
    lista.push({ nivel: nivel, arquivo: arquivo || "", linha: linha || 0, msg: msg });
  }

  /* Lê o texto e devolve { blocos: { "NOME": { nome, linha, campos: { campo: {valor, linha} } } }, problemas } */
  function ler(texto, arquivo) {
    var out = { arquivo: arquivo, blocos: {}, ordem: [], problemas: [] };
    var atual = null;
    /* Arquivo salvo como ANSI (e não UTF-8) chega com "�" no lugar dos acentos. */
    var ruim = String(texto).split(/\r\n|\r|\n/).map(function (l, i) { return l.indexOf("\uFFFD") >= 0 ? i + 1 : 0; }).filter(Boolean);
    if (ruim.length) problema(out.problemas, "erro", arquivo, ruim[0], "O arquivo não está salvo em UTF-8 e os acentos foram perdidos (linhas " + ruim.slice(0, 5).join(", ") + (ruim.length > 5 ? "…" : "") + "). No Bloco de Notas: Arquivo → Salvar como → Codificação: UTF-8. Depois confira os acentos dessas linhas.");
    String(texto).replace(/^﻿/, "").split(/\r\n|\r|\n/).forEach(function (bruta, i) {
      var n = i + 1, linha = bruta.trim();
      if (!linha || linha.charAt(0) === "#") return;
      var m = linha.match(/^\[([^\]]+)\]$/);
      if (m) {
        var k = chaveBloco(m[1]);
        if (out.blocos[k]) {
          problema(out.problemas, "erro", arquivo, n, "O bloco [" + m[1].trim() + "] aparece duas vezes (a 1ª vez na linha " + out.blocos[k].linha + "). Apague um ou troque o número.");
          atual = { campos: {} }; /* descarta o repetido */
          return;
        }
        atual = out.blocos[k] = { nome: m[1].trim(), chave: k, linha: n, campos: {} };
        out.ordem.push(k);
        return;
      }
      var c = linha.indexOf(":");
      if (c < 1) { problema(out.problemas, "erro", arquivo, n, "Linha sem \":\". Use o formato  campo: valor  (ou comece a linha com # para escrever um comentário)."); return; }
      if (!atual) { problema(out.problemas, "erro", arquivo, n, "Campo antes do primeiro [BLOCO]."); return; }
      var campo = chaveCampo(linha.slice(0, c));
      if (atual.campos[campo]) problema(out.problemas, "aviso", arquivo, n, "Campo \"" + campo + "\" repetido no bloco [" + atual.nome + "]: vale este, o da linha " + atual.campos[campo].linha + " é ignorado.");
      atual.campos[campo] = { valor: linha.slice(c + 1).trim(), linha: n };
    });
    return out;
  }

  /* =================================================================== */
  /* 2. ESQUEMAS: quais blocos e campos existem                           */
  /* =================================================================== */
  /* 1 = obrigatório, 0 = opcional. "max" = bloco numerado (NUMERO 1, 2…) */

  var NUM = { valor: 1, titulo: 0, detalhe: 0, variacao: 0, variacao_cor: 0 };
  var PECA = { imagem: 0, descricao_imagem: 0, enquadramento: 0, tipo: 0, link: 0, video: 0 };
  function junta() { var o = {}; for (var i = 0; i < arguments.length; i++) for (var k in arguments[i]) o[k] = arguments[i][k]; return o; }

  /* [FOI BEM] e [A MELHORAR] eram o "Resumo das campanhas", que saiu do report na 4.11. */
  var RESUMO_SAIU = /^(FOI BEM|A MELHORAR)$/, RESUMO_AVISO = "[FOI BEM] e [A MELHORAR] (Resumo das campanhas) saíram do report na versão 4.11 e foram ignorados. Pode apagar esses blocos.";
  var ESQUEMA_DADOS = [
    { bloco: "EDICAO", obrigatorio: true, campos: { mes: 1, ano: 1, proximo_mes: 1, pasta_imagens: 1, contato: 0, link_report_completo: 0 } },
    { bloco: "ABERTURA", obrigatorio: true, campos: { frase: 1, frase_final: 0, previa: 0 } },
    { bloco: "PROJETO PRINCIPAL", obrigatorio: true, campos: junta({ rotulo: 0, nome: 1, resumo: 0, aprendizado: 0 }, PECA) },
    { bloco: "NUMERO", max: 4, campos: NUM },
    { bloco: "LANCAMOS", campos: { titulo: 0 } },
    { bloco: "DESTAQUE", campos: junta({ categoria: 0, titulo: 1, texto: 0, nota: 0, aprendizado: 0 }, PECA) },
    { bloco: "RESULTADO", max: 3, campos: NUM },
    { bloco: "LANCAMENTO", max: 6, campos: junta({ status: 0, status_cor: 0, nome: 1, texto: 0, aprendizado: 0 }, PECA) },
    { bloco: "CREATIVE X", campos: { subtitulo: 0, rotulo: 0, anterior: 0, atual: 1, variacao: 0, periodo: 0, referencia: 0, significado: 0, nota: 0 } },
    /* Creative X trimestral (opcional, no mês que fecha o trimestre): entra na mesma seção, abaixo do resultado do mês. */
    { bloco: "CREATIVE X TRIMESTRE", campos: { rotulo: 0, titulo: 0, texto: 0, estimativa: 0 } },
    { bloco: "CREATIVE X TRIMESTRE", max: 3, campos: NUM },
    { bloco: "TRANSFORMATION", campos: { titulo: 0 } },
    { bloco: "TRANSFORMATION", max: 3, campos: junta({ status: 0, status_cor: 0, nome: 1, texto: 0, citacao: 0, resultado: 0, icones: 0, logo: 0, descricao_logo: 0, links: 0, prints: 0, descricao_prints: 0 }, PECA) },
    { bloco: "APRENDIZADO", max: 3, campos: { titulo: 1, texto: 0, levamos: 0 } },
    /* Novos tópicos (ex.: Testes): até 4 assuntos que ainda não têm seção própria ([TOPICO], [TOPICO B], [TOPICO C],
       [TOPICO D]), cada um no layout escolhido (lista, colunas, cartoes ou numeros). Entram aqui por TOPICOS (abaixo). */
    { bloco: "FOCO", campos: { prioridade: 1, texto: 0, selo: 0, descricao_selo: 0 } },
    { bloco: "AGENDA", max: 6, campos: { data: 0, titulo: 1, detalhe: 0 } }
  ];

  /* Ícone da aba do report no navegador: Santander + PF (assets/marca/svg/santander-pf.svg e os PNG de 16, 32 e 180 px),
     o mesmo do emulador. Só na aba (cabeçalho da página): o conteúdo do report não muda, e o e-mail não leva o ícone
     (paraEmail, limparHtmlEditado e emailResumido tiram). */
  var ICONE_TAG = "<link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADO0lEQVR4nMRXXUgUURT+xt1ZDVtHXYNAKMqULO1Rw0BIHyzTMAIVgp6Cgv40Kcyi8CEKohDxwR57CZceIpAkXxUy8clNJKlAfCrbdjcpdN1t+u7sVcxtZ2faIT+4nDt3zj33u+ece+aOG1uMLDvKQeAcHIZiVfELsJ1swyqwXwM+wCFY9kA2sJPCtQo8hoOwTCBmOMFAM0PRAIeQlsB3oEgH3D6ji+di7BfQzzEVDiAtgRXg0jfgtOi7gW6KKBOn7CtwFQ4gLQEuVsPdPmLLyQc+cahPjt9ZAnYgQ1jJAXFSihn3K+KBoeglmUV2vcvATWQIKwQmpLwl8oFsfrJdl2PNyBBJdYCxraI4w3a0CDjERX1R4COfefwxwLHLUu8dxUG2GbaX9MpTxmMONrHuARrIpZsH2X2LhLsrQ8DuPBZAsrwr1S7Q92Wy/0xKQaKHOjMk1aPbrK5ZcnGVi49Snt/4Mi6fC7lzivdsbi70UIxRft5ki4cE92inH3YJcFIvRc1f3ncJL3CxuCKTkDjJsVrK4hQ2L/LYHocdAtx5a4r3nrg8dr6Eh4ZFn1XxBvttqYxyzlnYIUB4TXRa1kovle8LSW+coDhgMkeDHQI0+NpMiaV3QOQJc2EKFqBIT1kmwC9dl56ocqkM7qMXrrHrQhrQziuG6wkswiBA/y9ykVox2cTwbSZXrdrUBG18HIWhEHy6ntSKdL0Ruh7TUyPENs7WJDf3J7jIESZRN18cQ+JorcPT2hr0+v0+xGKIjowgHghAj0ZhFYrHA1dlJTwNTCn2iVOKyY5zSaaG8d9LpV183lMQCDS6Sku1cFUV4tPT+Fe4KiqQP8V0ys6esHwlM0jpejjq92tL7e3IFN6hIXja2iK2yiahxWZn4QSkHc0ugSQUzM+vJ2BhMAjmCLBtmyE3J6haX5803w0HsNzXhx+dnVDr6pA3OoqcicQXPDY5iUh1telcRwisIb6wwDvcChTV+nUx4xAI5HR0GC4umJvD6tgYlgcHjXE3T8vGEGSVlCTNdTQEm2ElBHY9EHGXl8MJSDsRu3XgDWN8eCsLUQvFi/9Sik1IiI+I+EERd8F82EcYiYvsA0VRhn8DAAD///RxfWoAAAAGSURBVAMAdkE0NBPwdJsAAAAASUVORK5CYII=\">\n<link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABtElEQVR4nJxSTUsCURQ9b2b6wMySEloIGcFYUGAE9QeKIMofELVoI7RsUZs+IGpVQbRoI7SMgqho1V9oFwiJYlCQbcwy0yDxYzqOIqYjWg/uvPPu3HPm3PtGgsF6A+xocElGyRzgeQVG8R8BDTAx+SyAIzSwqgRof48OzijUHwUW/ixAYi+3GcYGY62egMg/YoAjUygOysB9FjgmdjJCLHjivtsNXBoKfNAqyXfE7fz6IwsH2cY1iT6eR5ifKDpbsQH7VS2QPJUnF+30vQOr3Lc4hyWmxspq54wcSFS+YkTLZrDOiFHEzKOlVFjjVkozYN87hLN5krBYAmavd0AZHkY2EqkmyTKU8fEgmps39VuwclDsfb4L6OTRbjk9PcnF44gNDUFWVUg2GzK3tzoWJhNS5+eIqaoTicS2UmGH7vGiTU8rSZeLJw1Zvx+fbjc6bm4KeHKyVJ+6uFANf2W9Z6u1sNvtMB8e4tvr1XHbwQGaiiKSwwEFdVYuHEbS49Fxy+IivpaXf3+oBi/AIemg3HI55gChuFwhYcTWNM2MdPo46/O5c4lEa+V7IQRkp/NB9PSs/QAAAP//Vu1NDgAAAAZJREFUAwDKA33QsZYOOgAAAABJRU5ErkJggg==\">\n<link rel=\"icon\" type=\"image/svg+xml\" sizes=\"any\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cg transform='translate(2,2) scale(0.95)'%3E%3Cpath transform='translate(0,-0.4)' fill='%23EC0000' d='M 31.5,19.5 C 31.4,18 31,16.5 30.2,15.2 L 23.4,3.3 C 22.9,2.4 22.5,1.4 22.3,0.4 L 22,0.9 c -1.7,2.9 -1.7,6.6 0,9.5 l 5.5,9.5 c 1.7,2.9 1.7,6.6 0,9.5 l -0.3,0.5 c -0.2,-1 -0.6,-2 -1.1,-2.9 l -5,-8.7 -3.2,-5.6 C 17.4,11.8 17,10.8 16.8,9.8 l -0.3,0.5 c -1.7,2.9 -1.7,6.5 0,9.5 v 0 l 5.5,9.5 c 1.7,2.9 1.7,6.6 0,9.5 l -0.3,0.5 c -0.2,-1 -0.6,-2 -1.1,-2.9 L 13.7,24.5 C 12.8,22.9 12.4,21.1 12.4,19.3 5.1,21.2 0,25.3 0,30 0,36.6 9.8,41.9 21.9,41.9 34,41.9 43.8,36.6 43.8,30 43.9,25.5 38.9,21.4 31.5,19.5 Z'/%3E%3C/g%3E%3Crect x='22' y='36' width='42' height='28' rx='8' fill='%23FFFFFF'/%3E%3Crect x='25' y='39' width='36' height='22' rx='6' fill='%23EC0000'/%3E%3Ctext x='43' y='57' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-weight='900' font-size='19' fill='%23FFFFFF'%3EPF%3C/text%3E%3C/svg%3E\">\n<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAAAPxklEQVR4nOzdeXATZR8H8N/upkmapk1aEOrBIYIWuaqO0+IxrY4IoqN44406Kp7gzXg7XggjggoWB7XqOBS8kLFaUWrBg3ogRTwK5SggUK4mPXJudvd9Kto3tHmepMlu0t38PsMfdPfJSu23zz77XGtSFAUQisQECFFgOBAVhgNRYTgQFYYDUWE4EBWGA1FhOBAVhgNRYTgQFYYDUWE4EBWGA1FhOBAVhgNRYTgQFYYDUWE4EBWGA1FhOBAVhgNRYTgQFYYDUWE4EBWGA1HxYESh778HlDADhsM3e7Z/0SJACeMMtlZW8XhcRx0FZnPuvn0cxwFKgNFqDn9ZmdLaqhw4EKquBpQYo4Uj8P77h/7ifeYZQIkx1G1F2rHDPWhQ55c533+fcdppgOJlqJpDrKoK/9J7332AEmCocIR+/LHLl8GlSwHFy1DhkH7/vcsRz0MPAYqXocIhHzjQ9cj27b4XXwQUF0M1SJv79FGam7setdvztm3j+vYF1EPGepQ1myMcbG/3PPoooJ4zVDh4pzPi8cAbb4T+/BNQDxkrHKTjnMJ7992AeshQ4RBGj6adEqurxcpKQD1hqHCYTj6ZcbZ9+nRAPWGocGRMnMg4K2/e7H/1VUAxM9qQfcsZZzBm+nBOp3P7dj4nB1AMjDYqa73pJsZZxe32PfUUoNjor+YgP2DS7ymMGUMr4DrhBHnTJsYVcjdt4ocNAxSN/moO79NPB5jDaVnPPw9MOOASI53VHHJTk2vgQGH4cOf69Yxi7JYHkVNTk1FSAohJZzWHb+ZMEEXpt98kZo+n/fXXmZcBD/aJxUBP4VBkOVBefujv3mefZZQURo2y3n47o4C0YUPgzTcBMenptiJ+/nnr+ed3fsluVyoul2vIENJ6pRXg+vfP27IFsrIAUeip5hBrasK/9Dz2GKMwl5trY9Yuyt693mhN1zSnp5qjddw48euvw4/k/PBDxtixtPKKJLWMHCnV19MKdCxv2baNMVyX5vRUc0gbN3Y54mUOl3CCYC8rYxSAYNDzwAOAKPQUDnn//i5HQj/9FKyoYHzEVFJivuwyRoHg4sWhdesARaKn28rBSMsb+QEDcnfsYHxK3rnTdfzx4PfTCpiKihy1tYC60f3YCvnZ+2bNYhQg6bHNmMEogCsYaPRUczQ7HEpra/fjXHa2s7GRz8ujfVAJBFyDBytNTbQC/LHHOhsaSBsFUBg91Rz80UdHPK60tfnYj7UWi505k0Petk386CNAh9NTOEi/J+2Uf+FCqaGB/lEgzVLT6aczCgQWLwZ0OD2Fw3TKKdRzsuyZNg2Y2I+1wWXLwOsFFEZP4TBfcgnjrPjFF126ULsQRo603nkno0Do558BhdHVbWXoUIE5hdhzzz3AZHvmGa5PH9pZ8fB12Ehnj7KZ0cZa/fPnMwp0DLjQN3WRfvsNUJhe+igbWr2aPJvwxx3X/ZTrmGPkXbtoH+Ty8nK3bOEoS98OcY8eTWLU/bhw4omONWs4nH78n95Vc4jV1Z677mru16+lpITWq53J7NFSmpu9TzwBTPbXXot4XPrzT9KV0jpxYmDRIjLiD2mvV9Qc8tatvldfDbz3nnLwYOdB+1tvWW68MWJ5d0FB90G4cM4//iDVAKNA6znniCtXAlPGuHGWyZMtV18NViukpRTXHMHly8lAvOu44/xz54YnAyINs3XKirY2yRNtcZvtySchGvGrr9pvvrk5P59cTd6yBdJPysJBWo6ugQPbLrqoyxSNTtIff9A+S36nzZMmAR35uQY/+4xRwHTmmfzgwRADpaXFP2+ea+jQ1vHjxW++gXSS9HDIMrl9kKqCtC3ImBmjYChSm7GTbd48MLE2bie/7oooMgqwe026E1esaD377NZzzw398gukh6SGI/Tdd+5Ro9qvv540MqIWltatY8wAFQYOzHz4YcbHyY3A/8orjALmsOmosSN1Usupp7Zddlks34LeJatBqii+55/3kju9JMX+Ifvbb1umTKFe0uslNRBjrBXs9tytW/kjjoh4Um5pcTGfeKP94+zZ779vvvBCMK5k1BzksbD1vPO8ZOC0J8kgAsxZXpzNlvXSS4wC0N7ufeQR2kne4YjYjxKr9nbSYPLcey8Yl+Y1B2lXkqYco9uKzbl+PWNLFohhcZvz11+Fk06K/NmxY0MJzwEzFRXlVFYyeuX1S9uag3RktZx+etzJgGiLl4gsZn850T51Ku0U53BAwkI//uguLpZ37wbD0TAc5MGP/FqTR0FIQPCDD0J1dYwCpjFjLLfcwijQMQl5yRLQkrx5c0txsbRtGxiLVrcV8v/LRW4HPh8kzDR2rOOHHxgFlAMHmo89ljQCaAVok5BbiopIdEAlZDDIuWEDGdsDo9Cq5mi79lpVkkGE1qzpfFFGRFzfvlnPPcco0DEJOdJgrLxvH6iH3D3brrsODESTmsM3e7ZX1T0wuPz8jrFWm41WIKbFbY2N/JFH/v8jPl8z/YJxy1q40HrrrWAI6tccpOPBq/buKOSavhdeYBTgBCFrwQJGAQgGvQ8+GH5A0mbeF3m4NcyIrvrh8C9cCBrwzZolMRcvZZx1lvniixkFyL0pFPZahWC0Udk4eb1kfAAMQeXbihIKuY4+WlH1Xt6JjIZkMxcQdLypadgwUklQr3DFFdn/Pbm4yW2IPraXCH7YsFzmpmR6oXLNIVZVaZQMIvjxx1GmEEcbcAkuXUoeo+CfrjmNkkHIDQ0S8/FbL1QOh/TXX6Alzx13KMw++MwZM0jrlVHgUJe81i9hMcY+/CqHgz0KnzgSvsAbbzAKdAy4zJnDKBCsrJQbG7VuFsjbt4P+qR0OZptRFd7HH2cM5ROWq64SRo6knSWDKe3MjWxVgeGIgDRIQWPKwYNRpxDbmEtnkzChS6E3inVE5XDw/fqB9vzz57Nv6hnkmTals4L5/v1B/9QOx8CBkASy7L3rLsZ5zmxmTzLVWowTVHs5lcNhPuccSApya+hY+sz4l5x3HqSOefx40D/1x1ZoW6yojtRSufR2HxlncQ8fDqkgjBjh7PaGWz1Sv/ucPbtCReTJiDHgIhQUpKrZYZiBN/VrDmnnTvegQZCcecuZmWS0NnysNZxrwAD5778hyez2vL17OQ3Ge5NP/ZpDGDAgaZUH+Hxeen95SubdkKdoYyQDNJrPofj9LaecIiWrCzmntjajqKj7cfeoUVJy7/2m0tKc6mou0paYeqTJTDDOas3++OOk7TnvoezXw+5IVR0/aFDOhx8aJhmg3TRB4YQTcpK1P5+0dm3gnXe6H09qg8Nmy/nsM4MtUNBw9nnG+PFR1w2oxUNaHodv98aaMqgB8pvAGNDRKRNoyXrHHVxeXvu11/Z0rVtPdbwf4+mnbWED8aFff2WUN51xBnnG4fv0Ib/rXEYGJMJstlx3HX/MMWA4yVgrK1ZVtV1zjdLcDBrL3bWr8/0Y7bfcEli0qEsB0qduvuIK88SJqixnMrxkrJXNmDDB+ddfGdr3KPtmzz70F0WSguEtHp4nv9y5DQ3Zn3xCBvQxGTFK0hYMZLQ2p6rKvmgRR9+hPHH+hQsP1U+hlSv/nQLO8+bLL3du2GB/911+6FBAPZHU/TksN9+cu2mT5aabQKPnPZ/v0Ghc5yxAobAwa8EC9v5giCbZO/uQBqD9zTeddXXmSy8FDQQrK0O1tWJ1Nfm7+eKLHd9+y/ftCyguqdxNUG5o8L74osqv8LTbTSeeGPrpJ3ITcaxdy+OmoglI/VaTysGD/vnzfQsWkMdRUAmpnxxr1gjMF9aTjpDg0qXBlStJX5m8Z49aK3tVR5rP5BGMHzLEfMEFlksu4ZIy1+7f/3Rv2cFYFMUVKwIVFcFPP1Xa2iAxWWVl1ttui3xOUYLLl/tmzQoxV+73UoJAHsVtDz5I245GXb1ve2u/P7hihbhyJfkT37ojYcQIx/r1EV+7JDc1tV15ZWj1atA567RpWbNmkf430FKvfo2Xsn+/uGZNaO1aaf36UF1djPP9s5ctM190Uffj4qpVJBkq3rxSy3TqqdnLl/PMFVwJ0tM73uCfhoK8YwdJiUQaCtu3yzt3SuRLMsD238sfOzZr2L27+9CovH9/y8knp2Duj5ZI72J2ZSXHa/XIqbNwxEcRxdbSUl02MqLJfPhh28yZoI20CEewoqLtqqvAkCyW3B07NFoupPv3ykalBAIe5tJ7fQsEfNHW/8XN+DWHWFPTetZZYGAWS57bzWkw1d74NYdYVQXGFgiEtHnduraTfXqDHkwJc5TYamsyC2Ip6iddJnJjI/kjVZX7K1bJgQQvGIFSM909YV7kKx9OqqvLKC0FtRm/5pAZO+fHz8rnDzYVl5onT8ksr8ltWpd1W1EKJxZr8z2mQ4M0CXPQnYXWslrH4ht4C6SERt9jWjytQFIIk8tz5o5PSf2h0fdo/DZHYprEiirJ7Q87YgWnk9xThIICIb/rA4IwZWZmRa13VUtPLkil1NUqSQp2ZBgOJn998Kmp/o0Rf0QW/sq5OeVThfCEWAvNU4p9q75U4rlgr2P824pmAvKSGe1z67rkQCieIBhl/jKGIxEtofIysUtbkNxxnClql6oNw5EYd6PcJRzWfC6BN8f1KtjmUJ1fiam5qQMYjsTkk2eWw480kbpEH+3NqDAciXCYpkwxHf48K9fXSknd+UFD2OaIl2OM5fWq7OmFh/d6uUPLamSDVBxYc7BZC8xPlQld+qyc+R2dYIWFQveGZ125b9lG5gVLs+r9sW1q0xSYVNj+aSpnvGI42PIzJk+JdYcGf61v+syQQeYvd8BwqMRf55s0ybvKQNHANoca/FJNWXvpBO+XhkoGYM0RJ79bqq+X6uuk2tpg1bLQxthfrBz7wFujWJ/iDhMMB5O/xlM4Qc1xMl0NvGE4EBWGA1FhOBAVhgNRYTgQlfHDwVkMMvWGQaPNM43fCcZpuYNFL6HRLh3Grzl4DEfclwWjyyguBqMzFRaCBoy/yl7eu9dl6MpDGDPGWVcHGjB+zcH372+54QYwLtuMGaCNtNjZR2psdBcUQMAoM7TCCMOHOzV7XVpaDNkLgwdnzZ0LhsNlZ9srKkAz6TKfwzp1qnXaNDASjrN/9JFp9GjQTBpN9rG9/LJx8mE225csMY8bB1pKizZHOP+cOZ777wc94/r1y1m61FRSAhpLu3DAPxsj++bM8ZeXK9psiKMdYcQI6913U7d1V1s6hqNTaPXqjrcm7Nwp79mj9Na3JvAOR8e7CocMMV94oVAQ7/5icUnrcCA2HLJHVBgORIXhQFQYDkSF4UBUGA5EheFAVBgORIXhQFQYDkSF4UBUGA5EheFAVBgORIXhQFQYDkSF4UBUGA5EheFAVBgORIXhQFQYDkSF4UBUGA5EheFAVBgORIXhQFT/AwAA//+42vPMAAAABklEQVQDACYwKR0wEI0uAAAAAElFTkSuQmCC\">";
  /* Ajuste de largura (4.10): nada passa da largura do celular. Vai no report (template, {{css_celular}}) e o emulador
     acrescenta em reports antigos (paginaInterativa). Palavras longas sem espaço quebram; no celular, cada indicador tem
     a largura do seu valor (o título acompanha, sem alargar a coluna): valores curtos ficam lado a lado, um valor longo
     vai sozinho para a linha de baixo, e um valor maior que a tela quebra no espaço. */
  var CSS_CELULAR = '<style id="ajuste-celular">\n' +
    '  .container td,.container p{overflow-wrap:anywhere;word-break:break-word;}\n' +
    '  @media screen and (max-width:700px){\n' +
    '    .third,.half{width:auto !important;max-width:100% !important;}\n' +
    '    .third{min-width:32% !important;}\n' +
    '    .half{min-width:49% !important;}\n' +
    '    .third p,.half p{width:0;min-width:100%;}\n' +
    '    .third p.num,.half p.num,.third .num-v,.half .num-v{width:auto;min-width:0;white-space:normal !important;}\n' +
    '    .container img{max-width:100% !important;height:auto !important;}\n' +
    '  }\n' +
    '</style>';
  /* Novos tópicos: bloco nos dados → id da seção na página (só letras: a marca <!--secao:id--> e as chaves data-campo/data-item usam o id). */
  var TOPICOS = [["TOPICO", "topico"], ["TOPICO B", "topicob"], ["TOPICO C", "topicoc"], ["TOPICO D", "topicod"]];
  /* Layouts de um tópico novo, com o máximo de itens de cada um (a grade de 600 px: 3 colunas, 3 cartões por linha, 4 números). */
  var LAYOUTS_TOPICO = {
    lista: { max: 6, nome: "Lista", como: "um item embaixo do outro, na largura inteira, com status, links e imagens (como o Transformation Hub)" },
    colunas: { max: 3, nome: "Colunas", como: "colunas numeradas, lado a lado (como O que aprendemos)" },
    cartoes: { max: 6, nome: "Cartões", como: "cartões com imagem em cima, 3 por linha (como Também neste mês)" },
    numeros: { max: 4, nome: "Números", como: "números grandes com o que medem (como os da capa); viram indicadores do e-mail-resumo" }
  };
  TOPICOS.forEach(function (t) {
    ESQUEMA_DADOS.splice(ESQUEMA_DADOS.length - 2, 0,
      { bloco: t[0], campos: { rotulo: 0, titulo: 0, texto: 0, layout: 0 } },
      { bloco: t[0], max: 6, campos: { status: 0, status_cor: 0, nome: 1, texto: 0, valor: 0, links: 0, imagens: 0, descricao_imagens: 0 } });
  });
  function layoutTopico(s) {
    var k = chaveCampo(s || "lista");
    return { lista: "lista", linhas: "lista", colunas: "colunas", cartoes: "cartoes", cartao: "cartoes", cards: "cartoes", numeros: "numeros", numero: "numeros", indicadores: "numeros" }[k] || "";
  }

  var CORES = ["marca", "titulo", "texto", "texto_corpo", "texto_apoio", "positivo", "positivo_fundo", "atencao", "atencao_fundo", "fundo_pagina", "fundo_email"];
  var CORES_APOIO = ["grupo_resultados", "grupo_resultados_fundo", "grupo_evolucao", "grupo_evolucao_fundo", "grupo_aprendizado", "grupo_aprendizado_fundo",
    "capa_selo", "capa_filete", "capa_destaque", "abertura_fundo", "abertura_linha", "linha", "creative_x", "creative_x_anterior", "transformation", "transformation_titulo",
    "transformation_fundo", "transformation_linha", "transformation_placeholder_fundo", "transformation_placeholder_borda", "foco_rotulo", "foco_texto", "rodape_claro", "rodape_fundo",
    "placeholder_fundo", "placeholder_borda"];
  function obrig(lista) { var o = {}; lista.forEach(function (k) { o[k] = 1; }); return o; }

  var ESQUEMA_MARCA = [
    { bloco: "FONTES", obrigatorio: true, campos: { titulos: 1, texto: 1, impacto: 0, titulos_outlook_windows: 1, texto_outlook_windows: 1 } },
    { bloco: "LOGO", campos: { arquivo: 0, largura: 0, descricao: 0 } },
    { bloco: "CORES", obrigatorio: true, campos: obrig(CORES) },
    { bloco: "CORES DE APOIO", obrigatorio: true, campos: obrig(CORES_APOIO) },
    { bloco: "IMAGENS", obrigatorio: true, campos: { modo: 1, endereco_base: 0, qualidade_jpg: 0 } },
    { bloco: "LINKS", campos: { dominios_permitidos: 0 } },
    { bloco: "FORMIGUINHA", campos: { arquivo: 0, descricao: 0 } }
  ];

  /* Confere blocos e campos contra o esquema. Devolve { simples: {BLOCO: campos}, listas: {BLOCO: [campos…]} } */
  function conferirEsquema(lido, esquema, prob) {
    var simples = {}, listas = {}, avisouResumo = false;
    lido.ordem.forEach(function (k) {
      var b = lido.blocos[k], m = k.match(/^(.*?)\s+(\d+)$/), base = m ? m[1] : k, idx = m ? +m[2] : 0;
      var def = esquema.filter(function (e) { return e.bloco === base && (idx ? e.max : !e.max); })[0];
      /* arquivo de dados de antes da 4.11: o "Resumo das campanhas" saiu do report; os blocos são ignorados, sem erro */
      if (!def && RESUMO_SAIU.test(base)) {
        if (!avisouResumo) problema(prob, "aviso", lido.arquivo, b.linha, RESUMO_AVISO);
        avisouResumo = true; return;
      }
      if (!def) {
        var nomes = esquema.map(function (e) { return "[" + e.bloco + (e.max ? " 1" : "") + "]"; }).join(", ");
        problema(prob, "erro", lido.arquivo, b.linha, "Bloco [" + b.nome + "] desconhecido. Os blocos possíveis são: " + nomes + ".");
        return;
      }
      if (idx && (idx < 1 || idx > def.max)) {
        problema(prob, "erro", lido.arquivo, b.linha, "[" + b.nome + "]: cabem no máximo " + def.max + " blocos [" + base + "] (de 1 a " + def.max + ").");
        return;
      }
      Object.keys(b.campos).forEach(function (c) {
        if (!(c in def.campos)) problema(prob, "aviso", lido.arquivo, b.campos[c].linha, "Campo \"" + c + "\" não existe no bloco [" + b.nome + "] e foi ignorado. Campos possíveis: " + Object.keys(def.campos).join(", ") + ".");
      });
      Object.keys(def.campos).forEach(function (c) {
        if (def.campos[c] && !(b.campos[c] && b.campos[c].valor)) problema(prob, "erro", lido.arquivo, b.linha, "Bloco [" + b.nome + "]: o campo \"" + c + "\" é obrigatório e está vazio ou faltando.");
      });
      var v = { _linha: b.linha, _nome: b.nome, _linhas: {} };
      Object.keys(def.campos).forEach(function (c) { v[c] = b.campos[c] ? b.campos[c].valor : ""; v._linhas[c] = b.campos[c] ? b.campos[c].linha : b.linha; });
      if (idx) { (listas[base] = listas[base] || []).push({ idx: idx, v: v }); }
      else simples[base] = v;
    });
    esquema.forEach(function (e) {
      if (e.obrigatorio && !simples[e.bloco]) problema(prob, "erro", lido.arquivo, 0, "Falta o bloco [" + e.bloco + "].");
    });
    Object.keys(listas).forEach(function (k) { listas[k] = listas[k].sort(function (a, b) { return a.idx - b.idx; }).map(function (x) { return x.v; }); });
    return { simples: simples, listas: listas };
  }

  /* =================================================================== */
  /* 3. LINKS                                                             */
  /* =================================================================== */

  var CTA = {
    peca: { rotulo: "Ver peça&nbsp;&#8594;", texto: "Ver peça", alt: "Ver peça" },
    video: { rotulo: "&#9654;&nbsp;Assistir", texto: "Assistir", alt: "Assistir ao vídeo" },
    projeto: { rotulo: "Ver projeto&nbsp;&#8594;", texto: "Ver projeto", alt: "Ver projeto" },
    demo: { rotulo: "Ver demonstração&nbsp;&#8594;", texto: "Ver demonstração", alt: "Ver demonstração" }
  };
  /* Qual parte da imagem fica no recorte. */
  var ENQUADRAMENTOS = ["centro", "topo", "baixo", "esquerda", "direita"];

  function ehPendencia(s) { return /\[[^\]]*\]/.test(s); }
  /* Conteúdo PROVISÓRIO do modelo: Lorem Ipsum nos textos e "X" nos números (X%, R$ X, +X p.p., XX/XX).
     Aparece com visual de template, mas conta como pendência: a versão final só sai com dados reais. */
  var CAMPOS_NUMERICOS = ["valor", "detalhe", "variacao", "anterior", "atual", "data", "status", "resultado", "periodo", "referencia"];
  /* "X" no lugar de um número (X%, +X p.p., R$ X, XX, X,X): texto do modelo. Não conta quando faz parte de um nome
     ("Creative X 64%") ou de um número ("3X mais"). */
  function xDeExemplo(t) {
    t = String(t || ""); var re = /X{1,2}(?:[,.]X{1,2})?/g, m;
    while ((m = re.exec(t))) {
      var a = t.slice(0, m.index), d = t.slice(m.index + m[0].length);
      if (/[A-Za-zÀ-ÿ0-9]$/.test(a) || /^[A-Za-zÀ-ÿ0-9]/.test(d)) continue;
      if (/[A-Za-zÀ-ÿ]\s$/.test(a) && !/^\s*(%|p\.?\s?p\b)/.test(d)) continue;
      return true;
    }
    return false;
  }
  function provisorio(s, campo) {
    s = String(s || "");
    if (/\blorem\b|\bipsum\b/i.test(s)) return "texto de exemplo (Lorem Ipsum)";
    if (CAMPOS_NUMERICOS.indexOf(campo) >= 0 && xDeExemplo(s)) return "valor de exemplo (X)";
    if (/AAAA|\bMM\b/.test(s) && campo === "pasta_imagens") return "pasta do mês (AAAA-MM)";
    return "";
  }

  /* Confere um link. Devolve [] (ok) ou [{nivel, msg}]. */
  function conferirLink(url, tipo, dominios) {
    var p = [];
    if (!url) return p;
    if (ehPendencia(url)) return [{ nivel: "pendencia", msg: "ainda não preenchido: " + url }];
    if (/^\\\\|^[a-z]:\\/i.test(url) || /^file:/i.test(url))
      return [{ nivel: "erro", msg: "é um caminho de rede ou de arquivo (" + url.slice(0, 40) + "…). Ele só abre no seu computador e o Outlook bloqueia esse tipo de endereço. Use o link de compartilhamento do SharePoint/Stream." }];
    if (/^(javascript|data|vbscript):/i.test(url)) return [{ nivel: "erro", msg: "endereço não permitido em e-mail." }];
    if (/\s/.test(url)) return [{ nivel: "erro", msg: "o link tem espaço. Copie de novo pelo botão \"Copiar link\" do SharePoint/Stream." }];
    var u;
    try { u = new URL(url); } catch (e) { return [{ nivel: "erro", msg: "não é um endereço válido. Ele precisa começar com https://" }]; }
    if (u.protocol === "http:") p.push({ nivel: "aviso", msg: "começa com http:// (sem segurança). Prefira o endereço https://." });
    else if (u.protocol !== "https:") return [{ nivel: "erro", msg: "precisa começar com https://" }];
    var host = u.hostname.toLowerCase();
    if (dominios.length && !dominios.some(function (d) { return host === d || host.slice(-(d.length + 1)) === "." + d; }))
      p.push({ nivel: "aviso", msg: "aponta para " + host + ", que não está em dominios_permitidos (config/marca.txt). Confirme que é um endereço interno aprovado." });
    if (/\/_layouts\/15\/embed|embed\.aspx|[?&]embed=|\/embed\//i.test(url))
      p.push({ nivel: "aviso", msg: "é um link de incorporação (embed). Em e-mail ele não toca; use o link de compartilhamento (\"Copiar link\")." });
    if (/[?&]download=1/i.test(url)) p.push({ nivel: "aviso", msg: "é um link de download: o arquivo baixa em vez de abrir. Use o link de compartilhamento." });
    if (/(^|\.)microsoftstream\.com$/i.test(host)) p.push({ nivel: "aviso", msg: "é do Stream (Clássico), que a Microsoft desativou. Use o link do vídeo no novo Stream (SharePoint/OneDrive)." });
    if (tipo === "video" && /\.(mp4|mov|m4v|webm)(\?|$)/i.test(u.pathname)) p.push({ nivel: "aviso", msg: "aponta direto para o arquivo de vídeo. Prefira o link de compartilhamento do Stream: abre o player com som, legendas e as permissões do arquivo." });
    return p;
  }

  /*
   * normalizarLink(texto) → { url, tipo: "web" | "arquivo" | "outro" | "relativo", avisos: [], info, erro }
   *   O link que a pessoa cola no emulador (botão do e-mail-resumo, links da página) ou escreve nos dados.
   *   Aceita qualquer link, sem aviso: https:// e http://; qualquer outro esquema (mailto:, tel:, msteams:,
   *   ms-word:, sip:, ftp:…); endereço sem "https://" (www.…, empresa.sharepoint.com/…: ganha o https://);
   *   texto com um link dentro ("Link: https://…": vale o link); caminho de arquivo (file:///…, C:\…,
   *   \\servidor\…, com ou sem aspas: vira file:///…) e endereço relativo (report-2026-10.html).
   *   Espaços viram %20. Só recusa vazio e javascript:/data:/vbscript: (executam código).
   *   info: nota informativa, não é aviso (link de arquivo ou relativo: onde ele abre).
   */
  function normalizarLink(entrada) {
    var s = String(entrada || "").replace(/[\u200b\u00a0]/g, " ").trim().replace(/^["'\u201c\u201d<(\[]+|["'\u201c\u201d>)\].,;]+$/g, "").trim(), url = "", tipo = "", info = "";
    if (!s) return { url: "", tipo: "", avisos: [], info: "", erro: "" };
    if (/^\s*(javascript|data|vbscript):/i.test(s)) return { url: "", tipo: "", avisos: [], info: "", erro: "esse tipo de endereço não é permitido (pode executar código)." };
    /* texto com um link no meio (ex.: "Link do report: https://…"): vale o link */
    var dentro = /\s/.test(s) && !/^(https?:|file:|[a-z]:[\\/]|\\\\)/i.test(s) && /(https?:\/\/[^\s"'<>]+)/i.exec(s);
    if (dentro) s = dentro[1].replace(/[.,;)\]]+$/, "");
    /* Caminho de arquivo vira file:/// no formato que o Outlook (Word) grava num link para arquivo: espaço e os
       caracteres que não podem ir num endereço viram %XX, mas os acentos ficam como estão (Produção, não
       Produ%C3%A7%C3%A3o), porque o Office pode ler %XX acima de 127 na página de código do Windows e não achar o arquivo. */
    function caminho(x) { return x.replace(/[\s%#?"<>`{}|^\[\]]/g, function (c) { return "%" + ("0" + c.charCodeAt(0).toString(16).toUpperCase()).slice(-2); }); }
    function acentos(x) { return x.replace(/(?:%[89a-f][0-9a-f])+/gi, function (m) { try { return decodeURIComponent(m); } catch (e) { return m; } }); }
    function espacos(x) { return x.replace(/\s/g, "%20"); }
    if (/^https?:\/\//i.test(s)) { url = espacos(s); tipo = "web"; }
    else if (/^file:/i.test(s)) { url = acentos(espacos(s.replace(/\\/g, "/"))); tipo = "arquivo"; }
    else if (/^[a-z]:[\\/]/i.test(s)) { url = "file:///" + caminho(s.replace(/\\/g, "/")); tipo = "arquivo"; }
    else if (/^\\\\[^\\/]+/.test(s)) { url = "file:" + caminho(s.replace(/\\/g, "/")); tipo = "arquivo"; }
    else if (/^\/\/[\w-]+(\.[\w-]+)+/.test(s)) { url = "https:" + espacos(s); tipo = "web"; }
    else if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^[^:]+:\d+(\/|$)/.test(s)) { url = espacos(s); tipo = "outro"; }
    else if (/^www\./i.test(s) || /^[\w-]+:\d+/.test(s) || (/^[\w-]+(\.[\w-]+)*\.[a-z]{2,24}(:\d+)?([\/?#]|$)/i.test(s) && !/^[^\/?#]*\.(html?|pdf|eml|msg|txt|csv|png|jpe?g|gif|svg|webp|mp4|zip|docx?|xlsx?|pptx?)([?#]|$)/i.test(s))) { url = "https://" + espacos(s); tipo = "web"; }
    else { url = espacos(s.replace(/\\/g, "/")); tipo = "relativo"; info = "Endereço relativo: abre a partir da pasta onde o report estiver publicado."; }
    if (tipo === "arquivo") info = "Caminho de arquivo: abre onde esse arquivo existe (neste computador, ou na mesma pasta de rede). No e-mail recebido, o Outlook pode bloquear link para arquivo: para quem recebe, prefira o link de compartilhamento (https://…).";
    return { url: url, tipo: tipo, avisos: [], info: info, erro: "" };
  }

  /* Link do report completo (o botão do e-mail-resumo e a meta "report-completo"): vale qualquer link, como nos itens:
     o link de compartilhamento (https://…) ou o caminho do arquivo (C:\…, \\servidor\…, file:///…, ex.: a pasta do OneDrive
     no computador), que vai para o botão no formato que o Outlook abre (normalizarLink). Só o que executa código é recusado.
     A nota (info) avisa que o caminho de arquivo não abre no e-mail recebido (o Outlook bloqueia; 4.12.1); sem link, o e-mail-resumo não sai (nunca um botão vazio). Nada é
     publicado por aqui: o report fica onde a pessoa salvou ou publicou. */
  function linkDoReport(entrada) {
    var nl = normalizarLink(entrada);
    return { url: nl.erro ? "" : nl.url, erro: nl.erro ? "não é permitido (pode executar código)." : "", tipo: nl.tipo,
      info: nl.tipo === "arquivo" ? "Caminho de arquivo: no e-mail recebido, o Outlook para Windows bloqueia esse link (aviso \"O Outlook bloqueou o acesso a links para os arquivos de zona da Internet\"), e um caminho C:\\… só existe no seu computador. O Outlook na Web, o novo Outlook e o celular também não abrem link de arquivo. Para quem recebe, use o link do OneDrive: botão direito no arquivo › Compartilhar › Copiar link (https://…)." :
        nl.tipo === "relativo" ? "Endereço relativo: no e-mail, só o nome do arquivo não abre o report. Cole o caminho completo (C:\\…) ou o link de compartilhamento (https://…)." : "" };
  }

  /* =================================================================== */
  /* 4. HTML SEGURO                                                       */
  /* =================================================================== */

  function Seguro(s) { this.s = String(s); }
  Seguro.prototype.toString = function () { return this.s; };
  function seguro(s) { return new Seguro(s); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  /* "O que aprendemos" dentro da campanha (4.13): rótulo na cor do grupo Aprendizado, filete fino e uma ou duas frases.
     O mesmo HTML sai do motor (template) e do emulador (quando a pessoa cria o aprendizado num report de antes).
     variante: "capa" (faixa dos números do projeto principal), "destaque" (texto do destaque) ou "card" (lançamento). */
  function htmlAprendizado(textoHtml, campo, variante, f) {
    var card = variante === "card", c = f.cor || {};
    var filete = variante === "capa" ? (c.abertura_linha || CR.mexico) : (c.linha || CR.linha);
    return '<table role="presentation" class="apr" data-apr="' + campo + '" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:' + (card ? 12 : variante === "capa" ? 20 : 16) + 'px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ' + filete + ';padding-top:' + (card ? 10 : 12) + 'px;">' +
      '<p class="fx" style="margin:0;font-family:' + f.fonte + ';font-size:' + (card ? 9 : 10) + 'px;line-height:14px;font-weight:bold;color:' + (c.grupo_aprendizado || CR.rosa) + ';letter-spacing:1.5px;">O QUE APRENDEMOS</p>' +
      '<p class="fx tm" data-campo="' + campo + '" style="margin:' + (card ? 3 : 4) + 'px 0 0 0;font-family:' + f.fonte + ';font-size:' + (card ? 12 : 13) + 'px;line-height:' + (card ? 17 : 19) + 'px;color:' + (c.texto || CR.texto) + ';">' + textoHtml + '</p>' +
      '</td></tr></table></td></tr></table>';
  }
  /* Texto do usuário → HTML. Só <br> é aceito como marcação. */
  function textoSeguro(s) { return seguro(esc(s || "").replace(/&lt;br\s*\/?&gt;/gi, "<br>")); }
  function semBr(s) { return String(s || "").replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim(); }
  /* Números: "R$ 29" não quebra entre R$ e 29; "-12%" usa o sinal de menos tipográfico. */
  function numeroSeguro(s) { return seguro(esc(s || "").replace(/^-\s*/, "&minus;").replace(/R\$ /g, function () { return "R$&nbsp;"; })); }
  function maiusculas(s) { return String(s || "").toLocaleUpperCase("pt-BR"); }
  function categoria(s) { return seguro(esc(maiusculas(s)).replace(/\s+·\s+/g, "&nbsp;&nbsp;·&nbsp;&nbsp;")); }

  /* =================================================================== */
  /* 5. MINI-TEMPLATE (subconjunto do Mustache)                           */
  /* =================================================================== */
  /*  {{campo}}   valor (escapado, exceto o que já é HTML seguro)
      {{#campo}}…{{/campo}}  lista: repete · valor: mostra se não vazio
      {{^campo}}…{{/campo}}  mostra se vazio
      {{! comentário }}                                                  */

  function compilar(tpl) {
    tpl = tpl.replace(/\{\{![\s\S]*?\}\}/g, "");
    var re = /\{\{\s*([#^\/]?)\s*([\w.@]+)\s*\}\}/g, raiz = { filhos: [] }, pilha = [raiz], ult = 0, m;
    while ((m = re.exec(tpl))) {
      if (m.index > ult) pilha[pilha.length - 1].filhos.push(tpl.slice(ult, m.index));
      ult = re.lastIndex;
      if (m[1] === "#" || m[1] === "^") {
        var no = { tipo: m[1], nome: m[2], filhos: [] };
        pilha[pilha.length - 1].filhos.push(no); pilha.push(no);
      } else if (m[1] === "/") {
        var aberto = pilha.pop();
        if (!aberto || aberto.nome !== m[2]) throw new Error("Template: {{/" + m[2] + "}} fecha " + (aberto ? "{{#" + aberto.nome + "}}" : "nada") + ".");
      } else pilha[pilha.length - 1].filhos.push({ tipo: "v", nome: m[2] });
    }
    if (pilha.length > 1) throw new Error("Template: {{#" + pilha[pilha.length - 1].nome + "}} não foi fechado.");
    if (ult < tpl.length) raiz.filhos.push(tpl.slice(ult));
    return raiz;
  }
  function busca(nome, pilha) {
    if (nome === ".") return pilha[pilha.length - 1];
    var partes = nome.split(".");
    for (var i = pilha.length - 1; i >= 0; i--) {
      var o = pilha[i];
      if (o !== null && typeof o === "object" && !(o instanceof Seguro) && partes[0] in o) {
        for (var j = 0; j < partes.length; j++) {
          if (o === null || o === undefined || typeof o !== "object" || !(partes[j] in o)) throw new Error("Template: campo inexistente {{" + nome + "}}.");
          o = o[partes[j]];
        }
        return o;
      }
    }
    throw new Error("Template: campo inexistente {{" + nome + "}}.");
  }
  function cheio(v) { return v instanceof Seguro ? v.s !== "" : Array.isArray(v) ? v.length > 0 : !!v; }
  function saida(v) { return v === null || v === undefined || v === false ? "" : v instanceof Seguro ? v.s : typeof v === "number" ? String(v) : esc(v); }
  function desenhar(no, pilha) {
    var r = "";
    no.filhos.forEach(function (f) {
      if (typeof f === "string") { r += f; return; }
      var v = busca(f.nome, pilha);
      if (f.tipo === "v") { r += saida(v); return; }
      if (f.tipo === "^") { if (!cheio(v)) r += desenhar(f, pilha); return; }
      if (!cheio(v)) return;
      if (Array.isArray(v)) v.forEach(function (it) { r += desenhar(f, pilha.concat([it])); });
      else if (typeof v === "object" && !(v instanceof Seguro)) r += desenhar(f, pilha.concat([v]));
      else r += desenhar(f, pilha);
    });
    return r;
  }
  function aplicar(tpl, modelo) { return desenhar(compilar(tpl), [modelo]); }

  /* Remove comentários de edição, mantendo os condicionais do Outlook (<!--[if mso]>). */
  /* Tira os comentários do template, menos os condicionais do Outlook e as marcas de seção
     (<!--secao:nome-->), que o converter-html-eml.html usa para montar o e-mail resumido. */
  /* Ficam: comentários condicionais do Outlook, marcas de seção ("secao:") e os "EDITAR AQUI" (guia para quem abre a página no editor). */
  function semComentarios(html) { return html.replace(/<!--(?!\[if|<!\[endif\]|>|secao:| EDITAR AQUI)[\s\S]*?-->/g, ""); }

  /* =================================================================== */
  /* 6. MODELO DO E-MAIL                                                  */
  /* =================================================================== */

  /* GRADE do e-mail (computador): 600 px de conteúdo = 3 colunas de 184 px + 2 espaços de 24 px.
     Todas as seções usam essas linhas, para tudo ficar alinhado de cima a baixo. */
  var COL = 184, ESP = 24, LARGURA = 600;
  /* Foto da capa (projeto principal): 20% maior que a coluna (184 → 220 px), quadrada.
     O texto ao lado fica com o resto da linha: 600 − 24 − 220 = 356 px. */
  var FOTO_CAPA = 220;
  /* Imagem ampliada (só na página do navegador, clique na peça): até 1400 px de largura, sem recorte. */
  var AMPLIADA = 1400;
  /* Divide "total" em n colunas com espaços de 24 px entre elas (a soma fecha exata). */
  function colunas(total, n) {
    var base = Math.floor((total - ESP * (n - 1)) / n), sobra = total - ESP * (n - 1) - base * n, r = [];
    for (var i = 0; i < n; i++) r.push(base + (i < sobra ? 1 : 0));
    return r;
  }

  function lerNumero(s) { var m = String(s || "").replace(/\s/g, "").match(/^(-?\d+(?:[.,]\d+)?)%?$/); return m ? parseFloat(m[1].replace(",", ".")) : null; }
  function fmtPP(n) { var r = Math.round(n * 10) / 10; return (r > 0 ? "+" : r < 0 ? "-" : "") + String(Math.abs(r)).replace(".", ",") + " p.p."; }

  /*
   * montar(entrada) → { ok, problemas, modelo, imagens, html, texto, assunto, nomeArquivo, links }
   *   entrada.dados, entrada.arquivoDados, entrada.marca, entrada.template
   *   entrada.existe(caminho) → true/false  (o arquivo existe na pasta do projeto?)
   *   entrada.medidas[caminho] → {w, h}     (tamanho real da imagem, se já lido)
   */
  function montar(entrada) {
    var prob = [];
    var arqD = entrada.arquivoDados || "dados", arqM = "config/marca.txt";
    var lidoD = ler(entrada.dados, arqD), lidoM = ler(entrada.marca, arqM);
    prob = prob.concat(lidoD.problemas, lidoM.problemas);
    var D = conferirEsquema(lidoD, ESQUEMA_DADOS, prob), M = conferirEsquema(lidoM, ESQUEMA_MARCA, prob);
    var existe = entrada.existe || function () { return true; }, medidas = entrada.medidas || {};
    if (prob.some(function (p) { return p.nivel === "erro"; })) return { ok: false, problemas: prob };

    /* ---- Marca ---- */
    var cor = {};
    var todas = junta(M.simples.CORES, M.simples["CORES DE APOIO"]);
    CORES.concat(CORES_APOIO).forEach(function (k) {
      var v = todas[k];
      if (!/^#[0-9a-f]{6}$/i.test(v)) problema(prob, "erro", arqM, todas._linhas[k], "Cor \"" + k + "\" inválida (" + v + "). Use # e 6 dígitos hexadecimais, ex.: #9E1218.");
      cor[k] = seguro(String(v).toUpperCase());
    });
    /* ---- Campos ainda não preenchidos ([INSERIR …]) ----
       No rascunho eles aparecem marcados em âmbar, para ninguém confundir com conteúdo.
       Números, scores e variações viram uma etiqueta pequena (não um número falso).
       A versão final nunca tem pendências: a ferramenta não deixa gerar. */
    var PEND = "background:" + cor.atencao_fundo + ";color:" + cor.atencao + ";border-radius:3px;";
    function marcarPendencias(html) { return html.replace(/\[[^\]<]*\]/g, function (m) { return '<span style="' + PEND + '">' + m + "</span>"; }); }
    /* "R$ 10" e "29 p.p." não quebram no meio da linha */
    function texto(s) { return seguro(marcarPendencias(textoSeguro(s).s).replace(/R\$ (?=\d)/g, function () { return "R$&nbsp;"; }).replace(/(\d) (?=p\.p\.)/g, "$1&nbsp;")); }
    function chip(s) {
      return seguro('<span style="display:inline-block;' + PEND + "font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;font-weight:bold;font-style:normal;letter-spacing:0;white-space:normal;vertical-align:middle;padding:3px 6px;border:1px dashed " + cor.placeholder_borda + ';">' + esc(s) + "</span>");
    }
    function numero(s) { return ehPendencia(s) ? chip(s) : numeroSeguro(s); }
    var F = M.simples.FONTES, fonte = {};
    if (!F.impacto) F.impacto = F.titulos;
    ["titulos", "texto", "impacto", "titulos_outlook_windows", "texto_outlook_windows"].forEach(function (k) {
      var v = F[k];
      if (/["<>;{}]/.test(v)) problema(prob, "erro", arqM, F._linhas[k], "Fonte \"" + k + "\": não use aspas duplas, ponto e vírgula nem < >. Para nomes com espaço use aspas simples: 'Nome da Fonte'.");
      if (/outlook/.test(k)) {
        var unica = v.split(",")[0].trim().replace(/^'|'$/g, "");
        if (v.indexOf(",") >= 0) problema(prob, "aviso", arqM, F._linhas[k], "\"" + k + "\": o Outlook para Windows usa só a 1ª fonte (" + unica + "). As outras foram ignoradas.");
        v = (/\s/.test(unica) ? "'" + unica + "'" : unica) + (k === "titulos_outlook_windows" ? ",serif" : ",sans-serif");
      }
      fonte[k] = seguro(v);
    });
    var I = M.simples.IMAGENS, modo = chaveCampo(I.modo);
    if (modo !== "embutidas" && modo !== "hospedadas") problema(prob, "erro", arqM, I._linhas.modo, "modo de imagens deve ser \"embutidas\" ou \"hospedadas\".");
    var base = I.endereco_base;
    if (modo === "hospedadas" && !/^https:\/\/\S+$/i.test(base)) problema(prob, "erro", arqM, I._linhas.endereco_base, "No modo hospedadas, preencha endereco_base com um endereço https:// interno (VALIDAR COM TI).");
    var qualidade = I.qualidade_jpg ? parseInt(I.qualidade_jpg, 10) : 82;
    if (!(qualidade >= 60 && qualidade <= 95)) { problema(prob, "aviso", arqM, I._linhas.qualidade_jpg, "qualidade_jpg deve ficar entre 60 e 95. Usei 82."); qualidade = 82; }
    var dominios = ((M.simples.LINKS || {}).dominios_permitidos || "").split(",").map(function (d) { return d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""); }).filter(Boolean);
    /* Link escrito nos dados (links dos itens, link do report completo): qualquer link vale (normalizarLink);
       o endereço web passa ainda pela conferência de domínio, embed e download, só como aviso. */
    function qualquerLink(url) {
      if (ehPendencia(url)) return { url: "", problemas: [{ nivel: "pendencia", msg: "ainda não preenchido: " + url }] };
      var nl = normalizarLink(url);
      if (nl.erro) return { url: "", problemas: [{ nivel: "erro", msg: nl.erro }] };
      var pr = [];
      if (nl.tipo === "web") conferirLink(nl.url, "projeto", dominios).forEach(function (x) { if (x.nivel !== "erro" && !/http:\/\//.test(x.msg)) pr.push(x); });
      return { url: nl.url, problemas: pr };
    }

    /* ---- Pendências: qualquer [texto entre colchetes] nos dados ---- */
    lidoD.ordem.forEach(function (k) {
      var b = lidoD.blocos[k];
      Object.keys(b.campos).forEach(function (c) {
        var v = b.campos[c].valor, m = v.match(/\[[^\]]*\]/g), pv = provisorio(v, c);
        if (m && c !== "link" && c !== "imagem") problema(prob, "pendencia", arqD, b.campos[c].linha, "[" + b.nome + "] " + c + ": " + m.join(" "));
        else if (pv) problema(prob, "pendencia", arqD, b.campos[c].linha, "[" + b.nome + "] " + c + ": " + pv + ". Troque pelo conteúdo do mês.");
        if (/<(?!br\s*\/?>)[a-z\/!]/i.test(v)) problema(prob, "aviso", arqD, b.campos[c].linha, "[" + b.nome + "] " + c + ": o texto tem uma marcação HTML. Só <br> é aceito; o resto aparece como texto.");
      });
    });

    /* ---- Imagens ---- */
    var E = D.simples.EDICAO, pasta = E.pasta_imagens.replace(/\\/g, "/").replace(/^\.?\/+|\/+$/g, "");
    var imagens = [], porCaminho = {}, videos = [], anexos = [];
    function caminhoImagem(nome) { return nome.indexOf("/") >= 0 ? nome.replace(/^\.?\/+/, "") : pasta + "/" + nome; }
    /* Registra uma imagem do e-mail. w/h = tamanho na tela (px). recorte = encaixa exatamente em w × h.
       fluida = no celular ocupa a largura da tela, então é exportada com até 700 px. */
    function imagem(caminho, w, h, op) {
      op = op || {};
      var med = medidas[caminho];
      if (op.ampliada) { w = med ? Math.min(med.w, AMPLIADA) : AMPLIADA; h = 0; }
      if (!h && med) h = Math.round(w * med.h / med.w);
      var chave = caminho + "|" + w + "|" + (h || "") + "|" + (op.play ? 1 : 0) + "|" + (op.ancora || "") + "|" + (op.ampliada ? "z" : "") + "|" + (op.soPagina ? "p" : "");
      var reg = porCaminho[chave];
      if (!reg) {
        reg = { id: imagens.length + 1, caminho: caminho, w: w, h: h || 0, recorte: !!op.recorte, play: !!op.play, papel: op.papel || "", fluida: !!op.fluida, ancora: op.ancora || "centro", ampliada: !!op.ampliada, soPagina: !!op.soPagina };
        reg.token = "@@IMG" + reg.id + "@@";
        imagens.push(reg); porCaminho[chave] = reg;
      }
      return { src: seguro(reg.token), w: w, h: h || "", alt: op.alt || "", zoom: "", legenda: "", video: "", thumb: "" };
    }
    /* Espaço da imagem ainda não escolhida: superfície Lisboa com a indicação do formato (só no rascunho). */
    function placeholder(w, h, rotulo, raio, video) {
      var bg = cor.placeholder_fundo.s, bd = cor.placeholder_borda.s, larg = typeof w === "number" ? w + "px" : w;
      return seguro('<table role="presentation" width="' + w + '" cellpadding="0" cellspacing="0" border="0" style="width:' + larg + ';"><tr>' +
        '<td height="' + h + '" align="center" valign="middle" bgcolor="' + bg + '" style="height:' + h + "px;background:" + bg + ";border:1px solid " + bd + ";border-radius:" + raio + 'px;">' +
        '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:bold;color:' + cor.marca.s + ';letter-spacing:1.5px;">' + (video ? "&#9654; VÍDEO" : "IMAGEM") + "</p>" +
        '<p style="margin:3px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:12px;color:' + cor.texto_apoio.s + ';">' + esc(rotulo) + "</p></td></tr></table>");
    }

    /* Peça (imagem + link + CTA) de um item */
    function peca(v, nomeBloco, w, h, raio, op, tipoPadrao) {
      var tipo = chaveCampo(v.tipo || tipoPadrao || "peca");
      if (!CTA[tipo]) { problema(prob, "erro", arqD, v._linhas.tipo, "[" + nomeBloco + "] tipo \"" + v.tipo + "\" não existe. Use: peca, video, projeto ou demo."); tipo = "peca"; }
      var link = v.link || "", r = { tipo: tipo, img: null, img_m: null, placeholder: null, placeholder_m: null, cta: seguro(""), link: "" };
      conferirLink(link, tipo, dominios).forEach(function (x) { problema(prob, x.nivel, arqD, v._linhas.link, "[" + nomeBloco + "] link: " + x.msg); });
      var href = !link || ehPendencia(link) || /^(javascript|data|vbscript|file):/i.test(link) || /^\\\\|^[a-z]:\\/i.test(link) ? "" : link;
      if (link && !href) {
        /* Link ainda não preenchido (só no rascunho): mostra onde o botão vai ficar, sem ser clicável. */
        r.cta = seguro('<span title="Link ainda não definido" style="color:' + ((op && op.corCtaPendente) || cor.texto_apoio) + ';font-weight:bold;white-space:nowrap;">' + CTA[tipo].rotulo + "</span>");
      } else if (href) {
        r.link = href;
        r.cta = seguro('<a href="' + esc(href) + '" target="_blank" class="cta" style="color:' + ((op && op.corCta) || cor.marca.s) + ';font-weight:bold;text-decoration:none;white-space:nowrap;">' + CTA[tipo].rotulo + "</a>");
      } else if (link === "" && v.tipo !== undefined) {
        problema(prob, "info", arqD, v._linhas.link, "[" + nomeBloco + "] sem link: a peça aparece sem \"" + CTA[tipo].texto + "\".");
      }
      var nome = v.imagem || "", desc = v.descricao_imagem || semBr(v.nome || v.titulo || "");
      if (nome && ehPendencia(nome)) {
        r.placeholder = placeholder(w, h || Math.round(w * 1.6), (op && op.dica) || (w * 2) + " px de largura", raio, tipo === "video");
        if (op && op.celular) r.placeholder_m = placeholder("100%", op.celular.h, "horizontal no celular", raio, tipo === "video");
        problema(prob, "pendencia", arqD, v._linhas.imagem, "[" + nomeBloco + "] imagem: " + nome);
      } else if (nome) {
        var cam = caminhoImagem(nome);
        if (!existe(cam)) problema(prob, "erro", arqD, v._linhas.imagem, "[" + nomeBloco + "] imagem não encontrada: " + cam + ". Confira o nome do arquivo (maiúsculas, acentos, extensão .jpg/.png).");
        var alt = (tipo === "video" ? "Vídeo: " : "") + desc + (href ? " (" + CTA[tipo].alt.toLowerCase() + ")" : "");
        var anc = chaveCampo(v.enquadramento || "centro");
        if (ENQUADRAMENTOS.indexOf(anc) < 0) { problema(prob, "aviso", arqD, v._linhas.enquadramento, "[" + nomeBloco + "] enquadramento deve ser " + ENQUADRAMENTOS.join(", ") + ". Usei centro."); anc = "centro"; }
        r.img = imagem(cam, w, h, { recorte: !!h, play: tipo === "video", alt: alt, papel: nomeBloco, fluida: !!(op && op.fluida), ancora: anc });
        r.img.link = href;
        /* Miniatura de vídeo SEM o ▶ (só vai na página, em data-thumb): é a que o e-mail resumido usa,
           para não dar a entender que o vídeo toca ali. Não entra no .eml completo. */
        if (tipo === "video") r.img.thumb = imagem(cam, w, h, { recorte: !!h, alt: desc, papel: nomeBloco + " (miniatura sem ▶, para o resumo)", fluida: !!(op && op.fluida), ancora: anc, soPagina: true }).src;
        /* Versão ampliada da peça (inteira, sem recorte), para o clique na página do navegador.
           Não vai no e-mail: lá a imagem só clica quando tem link (paraEmail tira o atributo). */
        /* Vídeo da peça (campo "video", arquivo .mp4 na pasta do mês): na página do navegador, o clique toca o vídeo
           por cima do report. No e-mail não vai (nenhum cliente toca vídeo): a miniatura com ▶ abre o link. */
        var vid = v.video && !ehPendencia(v.video) ? caminhoImagem(v.video) : "";
        if (vid && !/\.(mp4|webm)$/i.test(vid)) { problema(prob, "erro", arqD, v._linhas.video, "[" + nomeBloco + "] video: use um arquivo .mp4 (ou .webm)."); vid = ""; }
        if (vid && !existe(vid)) { problema(prob, "erro", arqD, v._linhas.video, "[" + nomeBloco + "] vídeo não encontrado: " + vid + "."); vid = ""; }
        if (vid) { videos.push({ id: videos.length + 1, caminho: vid }); r.img.video = seguro("@@VID" + videos.length + "@@"); r.img.legenda = seguro(esc(desc)); }
        /* Foto do banco de imagens (assets/fotos/) é ilustrativa: não abre ampliada. */
        if (tipo !== "video" && !vid && !(op && op.semAmpliar) && !/^assets\/fotos\//.test(cam)) {
          var z = imagem(cam, 0, 0, { ampliada: true, alt: desc, papel: nomeBloco + " (ampliada)" });
          r.img.zoom = z.src; r.img.legenda = seguro(esc(desc));
        }
        /* Versão para celular (outro formato, ex.: horizontal no lugar da vertical) */
        if (op && op.celular) { r.img_m = imagem(cam, op.celular.w, op.celular.h, { recorte: true, play: tipo === "video", alt: alt, papel: nomeBloco + " (celular)", fluida: true, ancora: op.celular.ancora || anc }); r.img_m.link = href; r.img_m.zoom = r.img.zoom; r.img_m.legenda = r.img.legenda; r.img_m.video = r.img.video;
          if (tipo === "video") r.img_m.thumb = imagem(cam, op.celular.w, op.celular.h, { recorte: true, alt: desc, papel: nomeBloco + " (celular, miniatura sem ▶)", fluida: true, ancora: op.celular.ancora || anc, soPagina: true }).src; }
      }
      return r;
    }
    function comCta(txt, p) {
      var t = texto(txt).s, c = p.cta.s;
      return seguro(t && c ? t + " " + c : t || c);
    }
    function etiqueta(texto_, corNome, simbolo) {
      var verde = chaveCampo(corNome || "verde") !== "ambar";
      /* Etiqueta: não quebra no computador; no celular pode quebrar (classe wrap-m) para nunca vazar da tela. */
      return seguro('<span class="wrap-m" data-tom="' + (verde ? "verde" : "ambar") + '" style="display:inline-block;background:' + (verde ? cor.positivo_fundo : cor.atencao_fundo) + ";color:" + (verde ? cor.positivo : cor.atencao) +
        ';font-weight:bold;padding:0 7px;border-radius:999px;white-space:' + (ehPendencia(texto_) ? "normal" : "nowrap") + ';">' + simbolo + " " + texto(texto_).s + "</span>");
    }
    function variacao(v, nomeBloco) {
      if (!v.variacao) return seguro("");
      if (ehPendencia(v.variacao)) return chip(v.variacao);
      if (v.variacao_cor && ["verde", "ambar"].indexOf(chaveCampo(v.variacao_cor)) < 0) problema(prob, "aviso", arqD, v._linhas.variacao_cor, "[" + nomeBloco + "] variacao_cor deve ser verde ou ambar.");
      var desce = /^[-−]/.test(v.variacao);
      var t = v.variacao.replace(/^[-−]\s*/, "");
      var verde = chaveCampo(v.variacao_cor || "verde") !== "ambar";
      return seguro('<span data-tom="' + (verde ? "verde" : "ambar") + '" style="display:inline-block;background:' + (verde ? cor.positivo_fundo : cor.atencao_fundo) + ";color:" + (verde ? cor.positivo : cor.atencao) +
        ';font-weight:bold;padding:0 7px;border-radius:999px;white-space:nowrap;">' + (desce ? "&#9660; " + (/^\d/.test(t) ? "&minus;" : "") : "&#9650; ") + esc(t) + "</span>");
    }
    function status(v, nomeBloco) {
      if (!v.status) return seguro("");
      curto(v, "status", 30, nomeBloco);
      var c = chaveCampo(v.status_cor || "ambar");
      if (["verde", "ambar"].indexOf(c) < 0) problema(prob, "aviso", arqD, v._linhas.status_cor, "[" + nomeBloco + "] status_cor deve ser verde ou ambar.");
      return etiqueta(v.status, c, c === "verde" ? "&#9679;" : "&#9675;");
    }
    function curto(v, campo, max, nomeBloco) {
      var s = semBr(v[campo]);
      if (s.length > max && !ehPendencia(s)) problema(prob, "aviso", arqD, v._linhas[campo], "[" + nomeBloco + "] " + campo + " com " + s.length + " caracteres (recomendado até " + max + "). Pode quebrar em mais linhas.");
    }
    /* "O que aprendemos" da campanha: só sai com texto (nada de bloco vazio); uma ou duas frases curtas. */
    function aprendizado(v, nomeBloco, campo, variante) {
      if (!v || !v.aprendizado) return null;
      curto(v, "aprendizado", variante === "card" ? 100 : 180, nomeBloco);
      return seguro(htmlAprendizado(texto(v.aprendizado).s, campo, variante, { fonte: fonte.texto.s,
        cor: { abertura_linha: cor.abertura_linha.s, linha: cor.linha.s, grupo_aprendizado: cor.grupo_aprendizado.s, texto: cor.texto.s } }));
    }
    /* Formiguinha (config/marca.txt, bloco [FORMIGUINHA]): o arquivo original, no encerramento (rodapé). */
    var FM = M.simples.FORMIGUINHA || {}, camFormiga = (FM.arquivo || "").replace(/\\/g, "/").replace(/^\.?\/+/, "");
    if (camFormiga && !existe(camFormiga)) { problema(prob, "erro", arqM, FM._linhas.arquivo, "Formiguinha não encontrada: " + camFormiga + ". Confira o nome do arquivo em config/marca.txt."); camFormiga = ""; }
    function formiga(w, papel) { return camFormiga ? imagem(camFormiga, w, 0, { alt: FM.descricao || "Formiguinha", papel: papel }) : null; }

    /* Logo (config/marca.txt, bloco [LOGO]) */
    var LG = M.simples.LOGO || {}, logo = null, rodapeLogo = null;
    if (LG.arquivo) {
      var lw = parseInt(LG.largura || "32", 10);
      if (!(lw >= 20 && lw <= 200)) { problema(prob, "aviso", arqM, LG._linhas.largura, "Logo: largura deve ficar entre 20 e 200 px. Usei 32."); lw = 32; }
      var caminhoLogo = LG.arquivo.replace(/\\/g, "/").replace(/^\.?\/+/, "");
      if (existe(caminhoLogo)) {
        logo = { img: imagem(caminhoLogo, lw, 0, { alt: LG.descricao || "Santander", papel: "logo" }), placeholder: null };
        rodapeLogo = imagem(caminhoLogo, lw, 0, { alt: LG.descricao || "Santander", papel: "logo" });
      }
      else {
        problema(prob, "pendencia", arqM, LG._linhas.arquivo, "Logo não encontrado: " + caminhoLogo + ". Salve o logo oficial (versão branca, PNG) nesse caminho ou ajuste o nome em config/marca.txt.");
        logo = { img: null, placeholder: seguro('<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td height="20" align="center" valign="middle" style="height:20px;width:' + lw + "px;border:1px dashed " + cor.foco_rotulo.s +
          ';border-radius:4px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:12px;font-weight:bold;color:' + cor.foco_rotulo.s + ';letter-spacing:1.5px;">LOGO</p></td></tr></table>') };
      }
    }

    var A = D.simples.ABERTURA, P = D.simples["PROJETO PRINCIPAL"], L = D.listas;
    var mes = E.mes.trim(), ano = E.ano.trim(), prox = E.proximo_mes.trim();
    var periodoOk = mesNumero(mes) > 0 && /^\d{4}$/.test(ano);
    if (!ehPendencia(mes) && !mesNumero(mes)) problema(prob, "pendencia", arqD, E._linhas.mes, "[EDICAO] mes: escreva o nome do mês (ex.: Outubro).");
    if (!ehPendencia(ano) && !/^\d{4}$/.test(ano)) problema(prob, "pendencia", arqD, E._linhas.ano, "[EDICAO] ano: escreva o ano com 4 dígitos (ex.: 2026).");
    if (!ehPendencia(prox) && !mesNumero(prox)) problema(prob, "pendencia", arqD, E._linhas.proximo_mes, "[EDICAO] proximo_mes: escreva o nome do mês seguinte (ex.: Novembro).");
    curto(A, "frase", 28, "ABERTURA");
    var secoes = 0;
    function proxSecao() { secoes++; return (secoes < 10 ? "0" : "") + secoes; }

    /* 01 · Abertura */
    var pp = peca(P, "PROJETO PRINCIPAL", FOTO_CAPA, FOTO_CAPA, 20, { dica: "440 x 440 px", fluida: true, corCta: "#FFFFFF", corCtaPendente: "#F5DECF" });
    var nums = (L.NUMERO || []);
    /* Grade: até 3 números, um por coluna de 184 px (alinhados com as seções de baixo); 4 números, 4 colunas iguais. */
    var larg = nums.length <= 3 ? nums.map(function () { return COL; }) : colunas(LARGURA, nums.length);
    var sobra = nums.length && nums.length < 3 ? LARGURA - nums.length * COL - (nums.length - 1) * ESP : 0;
    var abertura = {
      n: proxSecao(), frase: texto(A.frase), frase_final: texto(A.frase_final),
      /* rótulo acima do nome (4.13): "CAMPANHA" por padrão, editável (o do mês nem sempre é um "projeto principal") */
      rotulo: texto(maiusculas(semBr(P.rotulo || "") || "Campanha")),
      nome: texto(P.nome), resumo_cta: comCta(P.resumo, pp), peca: pp, aprendizado: aprendizado(P, "PROJETO PRINCIPAL", "principal.aprendizado", "capa"),
      numeros: nums.map(function (v, i) {
        curto(v, "valor", 11, "NUMERO " + (i + 1));
        return {
          valor: numero(v.valor), titulo: texto(v.titulo), detalhe: texto(v.detalhe), variacao: variacao(v, "NUMERO " + (i + 1)),
          idx: i + 1, largura: larg[i], principal: i === 0, primeiro: i === 0,
          cor_valor: i === 0 ? cor.marca : cor.texto, cor_filete: i === 0 ? cor.marca : cor.texto,
          classe_m: nums.length === 3 ? "third" : "half",
          estilo: "padding:0 0 20px 0;"
        };
      }),
      sobra: sobra
    };

    /* 02 · O que lançamos */
    var DS = D.simples.DESTAQUE, lanc = L.LANCAMENTO || [], res = L.RESULTADO || [];
    var lancamos = null;
    if (DS || lanc.length) {
      /* Destaque: peça na coluna 1 (184 x 300, recortada) e texto nas colunas 2 e 3 (392 px). */
      /* No celular a coluna da peça some; a mesma imagem entra em formato horizontal, na largura da tela, acima do texto. */
      var dsp = DS ? peca(DS, "DESTAQUE", COL, 300, 20, { dica: "368 x 600 px", celular: { w: 350, h: 200 } }) : null;
      var textoDestaque = dsp && (dsp.img || dsp.placeholder) ? LARGURA - COL - ESP : LARGURA;
      var lr = res.length ? colunas(textoDestaque, res.length) : [];
      var lc = lanc.length ? colunas(LARGURA, lanc.length) : [];
      lancamos = {
        n: proxSecao(), titulo: texto((D.simples.LANCAMOS || {}).titulo || ""), tem_compactos: lanc.length > 0, colunas_compactos: Math.min(lanc.length, 3) * 2 - 1,
        destaque: DS ? {
          categoria: seguro(marcarPendencias(categoria(DS.categoria).s)), titulo: texto(DS.titulo), texto_cta: comCta(DS.texto, dsp), peca: dsp, nota: texto(DS.nota), tem_resultados: res.length > 0,
          aprendizado: aprendizado(DS, "DESTAQUE", "destaque.aprendizado", "destaque"),
          largura_texto: textoDestaque, colunas: res.length * 3 - 2,
          resultados: res.map(function (v, i) {
            /* No celular os resultados ficam em terços (~110 px): número longo (ex.: "R$ 1.234,56") invade a coluna ao lado. */
            curto(v, "valor", res.length === 3 ? 7 : 11, "RESULTADO " + (i + 1));
            return {
              idx: i + 1, valor: numero(v.valor), titulo: texto(v.titulo), detalhe: texto(v.detalhe), variacao: variacao(v, "RESULTADO " + (i + 1)),
              largura: lr[i], primeiro: i === 0, estilo: "padding:14px 0 0 0;", classe_m: res.length === 3 ? "third" : "half"
            };
          })
        } : null,
        /* Até 3: uma linha dividida igualmente. De 4 a 6: linhas de 3 colunas de 184 px (a última completa com espaço vazio). */
        linhas_compactos: (function () {
          var itens = lanc.map(function (v, i) {
            var nb = "LANCAMENTO " + (i + 1), p = peca(v, nb, COL, 72, 20, { dica: "700 x 274 px", fluida: true }), ult = i === lanc.length - 1;
            return { idx: i + 1, status: status(v, nb), nome: texto(v.nome), texto_cta: comCta(v.texto, p), aprendizado: aprendizado(v, nb, "lancamento-" + (i + 1) + ".aprendizado", "card"), peca: p, largura: lanc.length > 3 ? COL : lc[i], classe: (ult ? "col" : "col gap") + (i >= 3 ? " pt0" : ""), vazio: false, estilo: i >= 3 ? "padding-top:28px;" : "" };
          }), linhas = [];
          for (var k = 0; k < itens.length; k += 3) {
            var linha = itens.slice(k, k + 3);
            while (lanc.length > 3 && linha.length < 3) linha.push({ vazio: true, largura: COL });
            linha.forEach(function (c, j) { c.primeiro = j === 0; });
            linhas.push({ itens: linha });
          }
          return linhas;
        })()
      };
    }

    /* 03 · Creative X */
    var CX = D.simples["CREATIVE X"], cx = null, CXT = D.simples["CREATIVE X TRIMESTRE"], cxi = L["CREATIVE X TRIMESTRE"] || [];
    if (!CX && (CXT || cxi.length)) problema(prob, "aviso", arqD, (CXT || cxi[0])._linha, "[CREATIVE X TRIMESTRE] entra na seção Creative X, abaixo do resultado do mês: preencha também o bloco [CREATIVE X]. O trimestral ficou de fora.");
    if (CX) {
      var at = lerNumero(CX.atual), an = lerNumero(CX.anterior);
      if (at === null && !provisorio(CX.atual, "atual") && !ehPendencia(CX.atual)) problema(prob, "aviso", arqD, CX._linhas.atual, "[CREATIVE X] atual \"" + CX.atual + "\" não é um número em %: a barra fica vazia.");
      var vari = CX.variacao, dif = at !== null && an !== null ? at - an : null;
      if (!vari && dif === null && !ehPendencia(CX.anterior) && !ehPendencia(CX.atual)) problema(prob, "pendencia", arqD, CX._linhas.variacao, "[CREATIVE X] variacao: preencha \"anterior\" com um número em % (ou escreva a variação).");
      /* Sem os dois números, nada é calculado: aparece a etiqueta [INSERIR EVOLUÇÃO], nunca um valor inventado. */
      if (!vari) vari = dif !== null ? fmtPP(dif) : "[INSERIR EVOLUÇÃO]";
      var queda = /^[-−]/.test(vari), pend = ehPendencia(vari);
      var barra = at === null ? 0 : Math.max(1, Math.min(99, Math.round(at)));
      cx = {
        n: proxSecao(), subtitulo: texto(CX.subtitulo), anterior: numero(CX.anterior), atual: numero(CX.atual),
        variacao: pend ? chip(vari) : seguro(esc(vari).replace(/^[-−]\s*/, "&minus;")), variacao_pendente: pend,
        variacao_cor: queda ? cor.atencao : cor.positivo, variacao_fundo: queda ? cor.atencao_fundo : cor.positivo_fundo, variacao_tom: queda ? "ambar" : "verde",
        periodo: texto(CX.periodo), referencia: texto(CX.referencia), significado: texto(CX.significado), nota: texto(CX.nota),
        tem_barra: barra > 0, barra: barra + "%", resto: (100 - barra) + "%", trimestre: null
      };
      /* Trimestral: rótulo, título, até 3 indicadores (como os resultados do destaque, com separador fino), uma leitura curta
         e a estimativa, que sai com a etiqueta "Estimativa" para não se misturar ao que foi alcançado. Com ele, o resultado do
         mês ganha o rótulo "MENSAL · <MÊS> <ANO>" (ou o "rotulo" de [CREATIVE X]), e os dois ficam fáceis de separar. */
      if (CXT || cxi.length) {
        var T = CXT || { _linhas: {} }, lt = cxi.length ? colunas(LARGURA, cxi.length) : [];
        curto(T, "titulo", 60, "CREATIVE X TRIMESTRE");
        cx.trimestre = {
          rotulo: texto(maiusculas(T.rotulo || "Trimestral")), titulo: texto(T.titulo), texto: texto(T.texto), estimativa: texto(T.estimativa),
          tem_indicadores: cxi.length > 0,
          indicadores: cxi.map(function (v, i) {
            var nb = "CREATIVE X TRIMESTRE " + (i + 1);
            curto(v, "valor", cxi.length === 3 ? 7 : 11, nb);
            return {
              idx: i + 1, valor: numero(v.valor), titulo: texto(v.titulo), detalhe: texto(v.detalhe), variacao: variacao(v, nb),
              largura: lt[i], primeiro: i === 0, classe_m: cxi.length === 3 ? "third" : "half"
            };
          })
        };
      }
      cx.rotulo = texto(maiusculas(CX.rotulo || (cx.trimestre ? "Mensal · " + mes + " " + ano : "")));
    }

    /* Links extras de um item (Transformation Hub, novo tópico): "Texto | https://…", vários separados por ";" (na página, um embaixo do outro).
       PDF na pasta do mês vai DENTRO da página e abre em nova aba; no e-mail vira texto. */
    function linksDoItem(v, nb, onde) {
      return (v.links || "").split(";").map(function (x) { return x.trim(); }).filter(Boolean).map(function (par) {
        var k = par.lastIndexOf("|"), rot = k > 0 ? par.slice(0, k).trim() : "", url = k > 0 ? par.slice(k + 1).trim() : par;
        if (rot && /\.pdf$/i.test(url) && !/^[a-z]+:/i.test(url) && !ehPendencia(url)) {
          var camA = caminhoImagem(url);
          if (!existe(camA)) { problema(prob, "erro", arqD, v._linhas.links, "[" + nb + "] links: documento não encontrado: " + camA + "."); return ""; }
          anexos.push({ id: anexos.length + 1, caminho: camA });
          return '<a href="#" data-anexo="@@ANX' + anexos.length + '@@" target="_blank" class="cta" title="Abre o documento (PDF) em nova aba" style="color:' + cor.marca.s + ';font-weight:bold;text-decoration:none;">' + esc(rot) + "&nbsp;&#8594;</a>";
        }
        if (!rot) { problema(prob, "erro", arqD, v._linhas.links, "[" + nb + "] links: escreva \"Texto do link | endereço\" (ex.: Agente de exemplo | https://…). Vários, separados por ;"); return ""; }
        var lk = qualquerLink(url), ok = !!lk.url;
        lk.problemas.forEach(function (x) { problema(prob, x.nivel, arqD, v._linhas.links, "[" + nb + "] links (" + rot + "): " + x.msg); });
        url = lk.url;
        if (ok) linksReport.push({ onde: onde + " · " + rot, tipo: "projeto", rotulo: rot, url: url });
        return ok ? '<a href="' + esc(url) + '" target="_blank" class="cta" style="color:' + cor.marca.s + ';font-weight:bold;text-decoration:none;">' + esc(rot) + "&nbsp;&#8594;</a>"
          : '<span title="Link ainda não definido" style="color:' + cor.texto_apoio.s + ';font-weight:bold;">' + esc(rot) + "&nbsp;&#8594;</span>";
      }).filter(Boolean);
    }
    /* Um link por linha: lista longa não quebra no meio de um link e fica fácil de tocar no celular. */
    function juntaLinks(lista) { return seguro(lista.join("<br>")); }
    /* Imagens de um item (até 3), lado a lado nas larguras dadas (1, 2 ou 3); no celular, empilhadas.
       Na página do navegador, abrem inteiras e maiores no clique. */
    function printsDoItem(v, nb, campo, campoDesc, larguras) {
      var nomesP = (v[campo] || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      var ehPrint = campo === "prints", nomeIm = ehPrint ? "print" : "imagem";
      if (nomesP.length > 3) { problema(prob, "aviso", arqD, v._linhas[campo], "[" + nb + "] " + campo + ": até 3. Usei " + (ehPrint ? "os 3 primeiros." : "as 3 primeiras.")); nomesP = nomesP.slice(0, 3); }
      var descP = (v[campoDesc] || "").split("|").map(function (x) { return x.trim(); });
      var largP = larguras[nomesP.length];
      return nomesP.map(function (nm, j) {
        var it = { pidx: j + 1, img: null, placeholder: seguro(""), largura: largP, primeiro: j === 0, classe: j < nomesP.length - 1 ? "col gap" : "col" };
        if (ehPendencia(nm)) {
          it.placeholder = placeholder("100%", Math.round(largP * 0.4), nomeIm + " · " + (largP * 2) + " px", 12, false);
          return it;
        }
        var cam = caminhoImagem(nm), d = descP[j] || (ehPrint ? "Print: " : "Imagem: ") + semBr(v.nome || "");
        if (!existe(cam)) problema(prob, "erro", arqD, v._linhas[campo], "[" + nb + "] " + nomeIm + " não encontrad" + (ehPrint ? "o" : "a") + ": " + cam + ".");
        it.img = imagem(cam, largP, 0, { alt: d, papel: nb + " (" + nomeIm + " " + (j + 1) + ")", fluida: true });
        var z = imagem(cam, 0, 0, { ampliada: true, alt: d, papel: nb + " (" + nomeIm + " " + (j + 1) + (ehPrint ? ", ampliado)" : ", ampliada)") });
        it.img.zoom = z.src; it.img.legenda = seguro(esc(d));
        return it;
      });
    }

    /* 04 · Transformation Hub */
    var tr = L.TRANSFORMATION || [], transformation = null, linksReport = [];
    if (tr.length) {
      transformation = {
        n: proxSecao(), titulo: texto((D.simples.TRANSFORMATION || {}).titulo || ""),
        projetos: tr.map(function (v, i) {
          var nb = "TRANSFORMATION " + (i + 1), p = peca(v, nb, 68, 52, 8, { dica: "136 x 104 px", semAmpliar: true }, "projeto");
          /* Logo do projeto (ex.: logo do agente): PNG original na pasta do mês, 56 px de largura, sem recorte.
             Com logo, os ícones não aparecem (o logo ocupa o lugar deles). */
          var logo = null, logoPend = false;
          if (v.logo && ehPendencia(v.logo)) { logoPend = true; problema(prob, "pendencia", arqD, v._linhas.logo, "[" + nb + "] logo: " + v.logo); }
          else if (v.logo) {
            var camL = caminhoImagem(v.logo);
            if (!existe(camL)) problema(prob, "erro", arqD, v._linhas.logo, "[" + nb + "] logo não encontrado: " + camL + ". Confira o nome do arquivo.");
            logo = imagem(camL, 56, 0, { alt: v.descricao_logo || "Logo: " + semBr(v.nome || ""), papel: nb + " (logo)" });
          }
          var links = linksDoItem(v, nb, "Transformation " + (i + 1));
          var icones = logo || logoPend ? [] : (v.icones || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).map(function (ic, j) {
            var cam = "assets/icones/" + ic.replace(/\.png$/i, "") + ".png";
            if (!existe(cam)) problema(prob, "erro", arqD, v._linhas.icones, "[" + nb + "] ícone não encontrado: " + cam);
            var im = imagem(cam, 32, 32, { alt: "", papel: "icone" });
            im.margem = j ? "margin-left:4px;" : "";
            return im;
          });
          /* Prints (até 3), na largura do cartão (504 px): 1 × 504, 2 × 240 ou 3 × 152, separados por 24 px.
             No celular, um embaixo do outro. Na página do navegador, abrem inteiros e maiores no clique. */
          var prints = printsDoItem(v, nb, "prints", "descricao_prints", [0, 504, 240, 152]);
          return {
            numero: i + 1, prints: prints, tem_prints: prints.length > 0,
            status: status(v, nb), nome: texto(v.nome), texto_cta: comCta(v.texto, p), citacao: texto(v.citacao), resultado: texto(v.resultado),
            icones: icones, logo: logo, logo_placeholder: logoPend, links: juntaLinks(links),
            peca: p, tem_visual: icones.length > 0 || !!logo || logoPend || !!p.img || !!p.placeholder,
            borda: i < tr.length - 1 ? "border-bottom:1px solid " + cor.transformation_linha.s + ";" : ""
          };
        })
      };
    }

    /* 05 · O que aprendemos */
    var ap = L.APRENDIZADO || [], aprendizados = null;
    if (ap.length) {
      var la = colunas(LARGURA, ap.length);
      aprendizados = {
        n: proxSecao(),
        itens: ap.map(function (v, i) {
          var ult = i === ap.length - 1;
          return {
            numero: i + 1, titulo: texto(v.titulo), texto: texto(v.texto), levamos: texto(v.levamos), largura: la[i], primeiro: i === 0, classe: ult ? "col" : "col gap"
          };
        })
      };
    }

    /* Novos tópicos (ex.: Testes): cada um só aparece com [TOPICO 1] (ou [TOPICO B 1]…) preenchido, no layout escolhido. */
    var topicos = TOPICOS.map(function (t) {
      var tp = L[t[0]] || [], TP = D.simples[t[0]] || {};
      if (!tp.length) return null;
      var lay = layoutTopico(TP.layout);
      if (!lay) { problema(prob, "aviso", arqD, (TP._linhas || {}).layout, "[" + t[0] + "] layout deve ser lista, colunas, cartoes ou numeros. Usei lista."); lay = "lista"; }
      var max = LAYOUTS_TOPICO[lay].max;
      if (tp.length > max) { problema(prob, "aviso", arqD, tp[max]._linhas.nome, "[" + t[0] + "] o layout " + lay + " leva até " + max + " itens. Usei os " + max + " primeiros."); tp = tp.slice(0, max); }
      var n = tp.length, larg = lay === "cartoes" ? (n <= 3 ? colunas(LARGURA, n) : [COL, COL, COL]) : colunas(LARGURA, n);
      var itens = tp.map(function (v, i) {
        var nb = t[0] + " " + (i + 1), w = lay === "lista" ? LARGURA : larg[i % larg.length];
        if (lay === "numeros") {
          if (!v.valor) problema(prob, "aviso", arqD, v._linhas.nome, "[" + nb + "] no layout numeros, preencha valor (o número grande).");
          if (v.imagens) problema(prob, "aviso", arqD, v._linhas.imagens, "[" + nb + "] o layout numeros não mostra imagens. Use lista ou cartoes.");
        }
        var prints = lay === "numeros" ? [] : printsDoItem(v, nb, "imagens", "descricao_imagens", lay === "lista" ? [0, 600, 288, 184] : [0, w, w, w]);
        curto(v, "texto", lay === "lista" ? 240 : 140, nb);
        var ult = i === n - 1;
        return {
          numero: i + 1, status: status(v, nb), nome: texto(v.nome), texto: texto(v.texto), valor: numero(v.valor || ""),
          links: lay === "numeros" ? seguro("") : juntaLinks(linksDoItem(v, nb, (TP.rotulo || "Novo tópico") + " " + (i + 1))),
          prints: prints, tem_prints: prints.length > 0, largura: w, primeiro: lay === "cartoes" ? i % 3 === 0 : i === 0,
          classe: (ult ? "col" : "col gap") + (lay === "cartoes" && i >= 3 ? " pt0" : ""), topo: lay === "cartoes" && i >= 3 ? "padding-top:28px;" : "",
          filete: i === 0 ? (lay === "numeros" ? cor.grupo_resultados : cor.texto) : (lay === "numeros" ? cor.texto : cor.linha)
        };
      });
      var tpc = {
        sid: t[1], n: proxSecao(), rotulo: texto(maiusculas(TP.rotulo || "Novo tópico")), titulo: texto(TP.titulo || ""), texto: texto(TP.texto || ""),
        lista: null, colunas: null, cartoes: null, numeros: null
      };
      if (lay === "cartoes") {
        var linhas = [];
        for (var k = 0; k < n; k += 3) {
          var lin = itens.slice(k, k + 3).map(function (x) { x.vazio = false; return x; });
          while (n > 3 && lin.length < 3) lin.push({ vazio: true, primeiro: false, largura: COL });
          linhas.push({ itens: lin });
        }
        tpc.cartoes = { linhas: linhas };
      } else tpc[lay] = { itens: itens };
      return tpc;
    }).filter(Boolean);

    /* 06 · Foco */
    var FO = D.simples.FOCO, foco = null;
    if (FO) {
      /* Selo da campanha (opcional): o PNG original, ao lado do título no computador e acima dele no celular.
         Nunca redesenhado: só reduzido. Use a versão feita para fundo vermelho. */
      var selo = null, camSelo = FO.selo ? caminhoImagem(FO.selo) : "";
      if (camSelo && ehPendencia(FO.selo)) { problema(prob, "pendencia", arqD, FO._linhas.selo, "[FOCO] selo: " + FO.selo); camSelo = ""; }
      if (camSelo && !existe(camSelo)) { problema(prob, "erro", arqD, FO._linhas.selo, "[FOCO] selo não encontrado: " + camSelo + ". Confira o nome do arquivo."); camSelo = ""; }
      if (camSelo) selo = { img: imagem(camSelo, 184, 0, { alt: FO.descricao_selo || "Selo da campanha", papel: "selo (foco)" }), img_m: imagem(camSelo, 160, 0, { alt: FO.descricao_selo || "Selo da campanha", papel: "selo (foco, celular)" }) };
      foco = { n: proxSecao(), mes: texto(maiusculas(prox)), prioridade: texto(FO.prioridade), texto: texto(FO.texto), selo: selo, largura_texto: selo ? 544 - 184 - 24 : 544 };
    }

    /* 07 · Também vem aí */
    var ag = L.AGENDA || [], agenda = null;
    if (ag.length) {
      var linhas = [];
      for (var i = 0; i < ag.length; i += 3) {
        var celulas = ag.slice(i, i + 3).map(function (v, j) {
          var m = String(v.data || "").trim().match(/^(\d{1,2}|XX?)\s+(\S.*)$/);
          return {
            idx: i + j + 1, dia: m ? m[1] : "", mes: m ? maiusculas(m[2]) : "", rotulo: m ? "" : texto(maiusculas(v.data || "")),
            titulo: texto(v.titulo), detalhe: texto(v.detalhe), vazio: false, primeiro: j === 0
          };
        });
        while (celulas.length < 3) celulas.push({ vazio: true, primeiro: false });
        linhas.push({ celulas: celulas, filete: i === 0 ? cor.texto : cor.linha });
      }
      agenda = { n: proxSecao(), linhas: linhas };
    }

    /* Link do report completo (versão interativa no SharePoint): vira a meta "report-completo" da página,
       e o converter-html-eml.html já abre com ele no campo do botão do e-mail-resumo. */
    var linkRC = (E.link_report_completo || "").trim();
    if (linkRC) {
      var lrc = qualquerLink(linkRC);
      lrc.problemas.forEach(function (x) { problema(prob, x.nivel, arqD, E._linhas.link_report_completo, "[EDICAO] link_report_completo: " + x.msg); });
      linkRC = lrc.url;
    }
    var assunto = "Creative Strategy PF | Report de " + mes + " " + ano;
    var modelo = {
      assunto: assunto, icone: seguro(ICONE_TAG), css_celular: seguro(CSS_CELULAR), link_report_completo: linkRC, previa: texto(A.previa || semBr(A.frase + " " + A.frase_final)),
      logo: logo, rodape_logo: rodapeLogo, rodape_formiga: formiga(64, "formiguinha"), edicao: texto(maiusculas(mes + " " + ano)), proximo_mes: prox, proximo_mes_minusculo: texto(ehPendencia(prox) ? prox : prox.toLocaleLowerCase("pt-BR")), contato: texto(E.contato),
      cor: cor, fonte: fonte,
      abertura: abertura, lancamos: lancamos, cx: cx, transformation: transformation, aprendizados: aprendizados, topicos: topicos, foco: foco, agenda: agenda
    };

    if (prob.some(function (p) { return p.nivel === "erro"; })) return { ok: false, problemas: prob };

    var html;
    try { html = aplicar(semComentarios(entrada.template), modelo).replace(/\n[ \t]*\n(\s*\n)+/g, "\n\n"); }
    catch (e) { problema(prob, "erro", "template/report.html", 0, e.message); return { ok: false, problemas: prob }; }

    /* Links do report (para a lista de "testar antes de enviar") */
    var links = [];
    function regLink(onde, p) { if (p && p.link) links.push({ onde: onde, tipo: p.tipo, rotulo: CTA[p.tipo].texto, url: p.link }); }
    regLink("Capa · " + semBr(P.nome), pp);
    if (lancamos) {
      if (lancamos.destaque) regLink("Destaque · " + semBr(DS.titulo), lancamos.destaque.peca);
      lanc.forEach(function (v, i) { regLink("Lançamento " + (i + 1) + " · " + semBr(v.nome), lancamos.linhas_compactos[Math.floor(i / 3)].itens[i % 3].peca); });
    }
    if (transformation) tr.forEach(function (v, i) { regLink("Transformation " + (i + 1) + " · " + semBr(v.nome), transformation.projetos[i].peca); });
    links = links.concat(linksReport);

    /* Nome do arquivo: report-AAAA-MM (no modelo em branco, report-MODELO). */
    var slug = periodoOk ? ano + "-" + String(mesNumero(mes)).padStart(2, "0") : "MODELO";
    return {
      ok: true, problemas: prob, modelo: modelo, imagens: imagens, videos: videos, anexos: anexos, html: html, links: links,
      texto: textoPuro(D, links), assunto: assunto, nomeArquivo: ("report-" + slug).replace(/[^\w-]/g, ""),
      config: { modo: modo, base: base, qualidade: qualidade / 100, dominios: dominios, corMarca: cor.marca.s }
    };
  }

  var MESES = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function mesNumero(m) { return MESES.indexOf(chaveCampo(m)) + 1; }

  /* =================================================================== */
  /* 7. VERSÃO EM TEXTO PURO (vai junto no .eml)                          */
  /* =================================================================== */
  /* Quem não vê HTML (alguns leitores, pré-visualizações, acessibilidade)
     recebe o mesmo conteúdo em texto, com os links escritos por extenso. */
  function textoPuro(D, links) {
    var S = D.simples, L = D.listas, o = [];
    function t(s) { return semBr(s); }
    function num(v) { return "- " + t(v.valor) + (v.titulo ? " · " + t(v.titulo) : "") + (v.detalhe ? " (" + t(v.detalhe) + ")" : "") + (v.variacao ? " · " + t(v.variacao) : ""); }
    function lk(v) { return v.link && !ehPendencia(v.link) ? "  " + (CTA[chaveCampo(v.tipo || "peca")] || CTA.peca).texto + ": " + v.link : ""; }
    var E = S.EDICAO;
    o.push("CREATIVE STRATEGY PF · REPORT MENSAL · " + maiusculas(E.mes + " " + E.ano), "");
    o.push(t(S.ABERTURA.frase + " " + S.ABERTURA.frase_final), "");
    o.push(maiusculas(t(S["PROJETO PRINCIPAL"].rotulo || "") || "Campanha") + ": " + t(S["PROJETO PRINCIPAL"].nome), t(S["PROJETO PRINCIPAL"].resumo));
    (L.NUMERO || []).forEach(function (v) { o.push(num(v)); });
    function apr(v) { if (v && v.aprendizado) o.push("O que aprendemos: " + t(v.aprendizado)); }
    apr(S["PROJETO PRINCIPAL"]);
    var l = lk(S["PROJETO PRINCIPAL"]); if (l) o.push(l);
    if (S.DESTAQUE || (L.LANCAMENTO || []).length) {
      o.push("", "O QUE LANÇAMOS" + (S.LANCAMOS && S.LANCAMOS.titulo ? ": " + t(S.LANCAMOS.titulo) : ""));
      if (S.DESTAQUE) {
        o.push("", t(S.DESTAQUE.titulo) + (S.DESTAQUE.categoria ? " (" + t(S.DESTAQUE.categoria) + ")" : ""), t(S.DESTAQUE.texto));
        (L.RESULTADO || []).forEach(function (v) { o.push(num(v)); });
        apr(S.DESTAQUE);
        l = lk(S.DESTAQUE); if (l) o.push(l);
      }
      (L.LANCAMENTO || []).forEach(function (v) { o.push("", t(v.nome) + (v.status ? " · " + t(v.status) : ""), t(v.texto)); apr(v); l = lk(v); if (l) o.push(l); });
    }
    if (S["CREATIVE X"]) {
      var c = S["CREATIVE X"], ct = S["CREATIVE X TRIMESTRE"], ci = L["CREATIVE X TRIMESTRE"] || [];
      o.push("", "CREATIVE X" + (c.rotulo || ct || ci.length ? " · " + maiusculas(c.rotulo || "Mensal · " + E.mes + " " + E.ano) : "") + ": " + (c.anterior ? t(c.anterior) + " -> " : "") + t(c.atual) + (c.periodo ? " (" + t(c.periodo) + ")" : ""), t(c.referencia), t(c.significado));
      if (ct || ci.length) {
        ct = ct || {};
        o.push("", "CREATIVE X · " + maiusculas(ct.rotulo || "Trimestral") + (ct.titulo ? ": " + t(ct.titulo) : ""));
        ci.forEach(function (v) { o.push(num(v)); });
        if (ct.texto) o.push(t(ct.texto));
        if (ct.estimativa) o.push("Estimativa: " + t(ct.estimativa));
      }
      if (c.nota) o.push(t(c.nota));
    }
    if ((L.TRANSFORMATION || []).length) {
      o.push("", "TRANSFORMATION HUB");
      L.TRANSFORMATION.forEach(function (v) {
        o.push("", t(v.nome) + (v.status ? " · " + t(v.status) : ""), t(v.texto)); if (v.resultado) o.push("Resultado: " + t(v.resultado)); l = lk(v); if (l) o.push(l);
        (v.links || "").split(";").forEach(function (par) { var k = par.lastIndexOf("|"), u = k > 0 ? par.slice(k + 1).trim() : ""; if (u && !ehPendencia(u)) o.push("  " + par.slice(0, k).trim() + ": " + u); });
      });
    }
    if ((L.APRENDIZADO || []).length) { o.push("", "O QUE APRENDEMOS"); L.APRENDIZADO.forEach(function (v, i) { o.push((i + 1) + ". " + t(v.titulo) + ": " + t(v.texto) + (v.levamos ? " Levamos: " + t(v.levamos) : "")); }); }
    TOPICOS.forEach(function (tb) {
      if (!(L[tb[0]] || []).length) return;
      var T = S[tb[0]] || {};
      o.push("", maiusculas(T.rotulo || "Novo tópico") + (T.titulo ? ": " + t(T.titulo) : ""), t(T.texto || ""));
      L[tb[0]].forEach(function (v) {
        o.push("", (v.valor ? t(v.valor) + " · " : "") + t(v.nome) + (v.status ? " · " + t(v.status) : ""), t(v.texto));
        (v.links || "").split(";").forEach(function (par) { var k = par.lastIndexOf("|"), u = k > 0 ? par.slice(k + 1).trim() : ""; if (u && !ehPendencia(u) && !/\.pdf$/i.test(u)) o.push("  " + par.slice(0, k).trim() + ": " + u); });
      });
    });
    if (S.FOCO) o.push("", "FOCO DE " + maiusculas(E.proximo_mes) + ": " + t(S.FOCO.prioridade), t(S.FOCO.texto));
    if ((L.AGENDA || []).length) { o.push("", "TAMBÉM VEM AÍ"); L.AGENDA.forEach(function (v) { o.push("- " + t(v.data) + " · " + t(v.titulo) + (v.detalhe ? " (" + t(v.detalhe) + ")" : "")); }); }
    o.push("", "Até " + E.proximo_mes.toLowerCase() + ".", E.contato ? "Dúvidas, sugestões ou pedidos: " + t(E.contato) : "");
    return o.filter(function (x, i, a) { return !(x === "" && a[i - 1] === ""); }).join("\r\n").trim() + "\r\n";
  }

  /* =================================================================== */
  /* 8. CONFERÊNCIA DE COMPATIBILIDADE DO HTML FINAL                      */
  /* =================================================================== */
  var REGRAS = [
    [/<script/i, "erro", "Tem <script>: nenhum Outlook executa JavaScript."],
    [/<(video|audio|iframe|embed|object|form)\b/i, "erro", "Tem vídeo, iframe ou formulário: o Outlook remove. Use miniatura + link."],
    [/display\s*:\s*(flex|grid)/i, "erro", "Usa flex/grid: o Outlook para Windows ignora."],
    [/position\s*:\s*(absolute|fixed|relative)/i, "erro", "Usa position: o Outlook ignora."],
    [/background-image|url\(/i, "erro", "Imagem de fundo: o Outlook para Windows não mostra."],
    [/rgba?\(/i, "erro", "Cor em rgb()/rgba(): use hexadecimal (#9E1218)."],
    [/src="data:/i, "erro", "Imagem em base64 dentro do HTML: o Outlook bloqueia."],
    [/@import|<link\b|@font-face/i, "erro", "Fonte ou CSS externo: o Outlook não carrega. Use fontes instaladas (config/marca.txt)."],
    [/src="(file:|\\\\|[a-z]:\\)/i, "erro", "Imagem apontando para arquivo local ou caminho de rede: o destinatário não vê e o Outlook bloqueia."],
    [/href="(file:|\\\\|[a-z]:\\)/i, "info", "Link para arquivo local ou de rede: abre onde esse caminho existe."],
    [/<img(?![^>]*\bwidth=")[^>]*>/i, "erro", "Imagem sem o atributo width: o Outlook pode mostrar no tamanho original."],
    [/<img(?![^>]*\balt=")[^>]*>/i, "erro", "Imagem sem alt: quem bloqueia imagens não vê nada no lugar."],
    [/href="#/i, "pendencia", "Link ainda sem endereço (#…)."]
  ];
  function conferirHtml(html) {
    var r = [];
    REGRAS.forEach(function (x) { if (x[0].test(html)) r.push({ nivel: x[1], msg: x[2] }); });
    var t = tamanhoUtf8(html);
    if (t > 102 * 1024) r.push({ nivel: "aviso", msg: "HTML com " + Math.round(t / 1024) + " KB: acima de ~100 KB alguns clientes cortam a mensagem." });
    return r;
  }

  /* =================================================================== */
  /* 9. ARQUIVO .EML (MIME)                                               */
  /* =================================================================== */

  function utf8(s) { return typeof TextEncoder !== "undefined" ? new TextEncoder().encode(s) : Uint8Array.from(Buffer.from(s, "utf8")); }
  function tamanhoUtf8(s) { return utf8(s).length; }
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function base64(bytes) {
    var r = "", i;
    for (i = 0; i + 2 < bytes.length; i += 3) {
      var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      r += B64[n >> 18 & 63] + B64[n >> 12 & 63] + B64[n >> 6 & 63] + B64[n & 63];
    }
    if (i < bytes.length) {
      var a = bytes[i], b = i + 1 < bytes.length ? bytes[i + 1] : 0, m = (a << 16) | (b << 8);
      r += B64[m >> 18 & 63] + B64[m >> 12 & 63] + (i + 1 < bytes.length ? B64[m >> 6 & 63] : "=") + "=";
    }
    return r;
  }
  function quebra76(s) { return s.replace(/.{1,76}/g, "$&\r\n"); }
  /* Assunto com acentos: palavras codificadas (RFC 2047) de no máximo 75 caracteres cada. */
  function assuntoMime(s) {
    if (/^[\x20-\x7e]*$/.test(s)) return s;
    var partes = [], atual = "";
    Array.from(s).forEach(function (ch) {
      if (utf8(atual + ch).length > 42) { partes.push(atual); atual = ""; }
      atual += ch;
    });
    if (atual) partes.push(atual);
    return partes.map(function (p) { return "=?UTF-8?B?" + base64(utf8(p)) + "?="; }).join("\r\n ");
  }
  function tipoMime(nome) {
    var ext = nome.split(".").pop().toLowerCase();
    return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif" }[ext] || "application/octet-stream";
  }

  /*
   * gerarEml({ assunto, html, texto, imagens: [{ cid, nome, bytes }], semente })
   *   Estrutura:  multipart/alternative
   *                 ├─ text/plain           (versão em texto, com links)
   *                 └─ multipart/related
   *                      ├─ text/html       (o report)
   *                      └─ image/* (cid)   (imagens embutidas)
   */
  function gerarEml(o) {
    var s = o.semente || Date.now().toString(36);
    var b1 = "=_alt_" + s, b2 = "=_rel_" + s;
    var L = [
      "X-Unsent: 1",
      "Subject: " + assuntoMime(o.assunto),
      "MIME-Version: 1.0",
      "Content-Language: pt-BR",
      'Content-Type: multipart/alternative; boundary="' + b1 + '"',
      "",
      "This is a multi-part message in MIME format.",
      "",
      "--" + b1,
      'Content-Type: text/plain; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
      "",
      quebra76(base64(utf8(o.texto || ""))),
      "--" + b1,
      'Content-Type: multipart/related; boundary="' + b2 + '"; type="text/html"',
      "",
      "--" + b2,
      'Content-Type: text/html; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
      "",
      quebra76(base64(utf8(o.html)))
    ];
    (o.imagens || []).forEach(function (im) {
      /* Cabeçalhos dobrados (linha seguinte começa com espaço) para nenhuma linha passar de 78 caracteres. */
      L.push("--" + b2, "Content-Type: " + tipoMime(im.nome) + ";", ' name="' + im.nome + '"', "Content-Transfer-Encoding: base64",
        "Content-ID: <" + im.cid + ">", "Content-Disposition: inline;", ' filename="' + im.nome + '"', "", quebra76(im.b64 || base64(im.bytes)));
    });
    L.push("--" + b2 + "--", "", "--" + b1 + "--", "");
    return L.join("\r\n");
  }

  /* Troca os marcadores @@IMGn@@ pelo endereço final de cada imagem. */
  function trocarImagens(html, fn) { return html.replace(/@@IMG(\d+)@@/g, function (m, id) { return fn(+id); }); }

  /* E-mail: sem ampliação (nenhum cliente de e-mail roda script). A peça só clica quando tem link. */
  function paraEmail(html) {
    return anexosSemLink(html).replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>\n?/g, "").replace(/ data-(ampliar|legenda|video|thumb|campo|tom|img|item)="[^"]*"/g, "").replace(/[ \t]*<!-- EDITAR AQUI[\s\S]*?-->\n?/g, "").replace(/<meta name="report-completo"[^>]*>\n?/, "");
  }
  /* Troca os marcadores @@VIDn@@ pelo endereço do vídeo (só na página do navegador). */
  function trocarVideos(html, fn) { return html.replace(/@@VID(\d+)@@/g, function (m, id) { return fn(+id); }); }
  function trocarAnexos(html, fn) { return html.replace(/@@ANX(\d+)@@/g, function (m, id) { return fn(+id); }); }
  /* No e-mail, documento anexado à página (data-anexo) vira texto sem link: ele só abre no report completo. */
  function anexosSemLink(html) {
    return html.replace(/<a\b[^>]*\sdata-anexo="[^"]*"[^>]*>([\s\S]*?)<\/a>/g, function (m, t) {
      return '<span style="color:#767676;font-weight:bold;">' + t.replace(/&nbsp;&#8594;\s*$/, "") + " (no report completo)</span>";
    });
  }

  /* Página do navegador: clicar numa peça sem link abre a imagem inteira, maior, por cima do report.
     Teclado: Tab chega na peça, Enter ou Espaço abre, Esc fecha. Peça com link continua indo para o link. */
  var AMPLIAR_CSS = "img[data-ampliar]{cursor:zoom-in;transition:opacity .15s,box-shadow .15s;}img[data-video]{cursor:pointer;transition:opacity .15s,box-shadow .15s;}" +
    "img[data-video]:hover,img[data-video]:focus-visible,img[data-ampliar]:hover,img[data-ampliar]:focus-visible{opacity:.92;box-shadow:0 0 0 3px #FFFFFF,0 0 0 5px #EC0000;outline:none;}" +
    "a img{transition:opacity .15s;}a:hover img,a:focus-visible img{opacity:.88;}" +
    "#amp{position:fixed;inset:0;z-index:9;display:none;align-items:center;justify-content:center;flex-direction:column;padding:24px;background:#000000D9;}" +
    "#amp video{max-width:min(1100px,100%);max-height:calc(100vh - 120px);border-radius:20px;background:#000000;}" +
    "#amp[open]{display:flex;}#amp img{max-width:min(1100px,100%);max-height:calc(100vh - 120px);width:auto;height:auto;border-radius:20px;background:#FFFFFF;}" +
    "#amp p{margin:12px 0 0;color:#FFFFFF;font:14px/20px Arial,Helvetica,sans-serif;text-align:center;max-width:680px;}" +
    "#amp button{position:absolute;top:16px;right:16px;width:44px;height:44px;border:0;border-radius:999px;background:#FFFFFF;color:#EC0000;font:bold 22px/44px Arial,Helvetica,sans-serif;cursor:pointer;}" +
    "#amp button:focus-visible{outline:3px solid #FFFFFF;outline-offset:3px;}" +
    ".vidpill{display:inline-block;margin-top:10px;padding:8px 16px;border:2px solid #EC0000;border-radius:999px;background:#FFFFFF;color:#EC0000;font:bold 13px/16px Arial,Helvetica,sans-serif;cursor:pointer;animation:vidpulso 1.8s infinite;}" +
    ".vidpill:hover,.vidpill:focus-visible{background:#EC0000;color:#FFFFFF;border-color:#FFFFFF;outline:none;}" +
    "@keyframes vidpulso{0%{box-shadow:0 0 0 0 rgba(255,255,255,.85),0 0 0 0 rgba(236,0,0,.35);}70%{box-shadow:0 0 0 10px rgba(255,255,255,0),0 0 0 10px rgba(236,0,0,0);}100%{box-shadow:0 0 0 0 rgba(255,255,255,0),0 0 0 0 rgba(236,0,0,0);}}" +
    "@media (prefers-reduced-motion:reduce){.vidpill{animation:none;}}";
  var AMPLIAR_JS = "(function(){var d=document,box=d.createElement('div'),im=d.createElement('img'),tx=d.createElement('p'),bt=d.createElement('button'),volta=null;" +
    "box.id='amp';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Peça ampliada');bt.type='button';bt.setAttribute('aria-label','Fechar');bt.textContent='\u00D7';" +
    "var vd=d.createElement('video');vd.controls=true;vd.setAttribute('playsinline','');" +
    /* vídeo otimizado no emulador (WebM gravado no navegador) não traz a duração: o player a descobre indo ao fim e voltando */
    "vd.addEventListener('loadedmetadata',function(){if(vd.duration===Infinity){vd.currentTime=1e101;vd.addEventListener('timeupdate',function f(){vd.removeEventListener('timeupdate',f);vd.currentTime=0;});}});" +
    "box.appendChild(bt);box.appendChild(im);box.appendChild(vd);box.appendChild(tx);d.body.appendChild(box);" +
    "function fecha(){box.removeAttribute('open');im.removeAttribute('src');vd.pause();vd.removeAttribute('src');vd.load();if(volta)volta.focus();}" +
    "function abre(el){volta=el;var v=el.getAttribute('data-video');im.style.display=v?'none':'';vd.style.display=v?'':'none';" +
    "if(v){vd.src=v;vd.play().catch(function(){});}else{im.src=el.getAttribute('data-ampliar')||el.getAttribute('src');im.alt=el.getAttribute('data-legenda')||el.alt||'';}" +
    "tx.textContent=el.getAttribute('data-legenda')||'';box.setAttribute('open','');bt.focus();}" +
    "bt.onclick=fecha;box.onclick=function(e){if(e.target===box)fecha();};d.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.hasAttribute('open'))fecha();});" +
    "Array.prototype.forEach.call(d.querySelectorAll('img[data-ampliar],img[data-video]'),function(el){var v=el.hasAttribute('data-video');if(el.closest('a')&&!v){el.removeAttribute('data-ampliar');return;}" +
    "var a=el.closest('a');if(a){a.addEventListener('click',function(e){e.preventDefault();});}" +
    "if(v){var alvo=a||el,b=d.createElement('button');b.type='button';b.className='vidpill';b.tabIndex=-1;b.innerHTML='&#9654;&nbsp; Assistir ao v&iacute;deo';b.onclick=function(){abre(el);};alvo.parentNode.insertBefore(b,alvo.nextSibling);}" +
    "el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',(v?'Assistir: ':'Ampliar: ')+(el.getAttribute('data-legenda')||el.alt||'peça'));el.title=v?'Clique para assistir':'Clique para ampliar';" +
    "el.addEventListener('click',function(){abre(el);});el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();abre(el);}});});" +
    "Array.prototype.forEach.call(d.querySelectorAll('a[data-anexo]'),function(a){a.addEventListener('click',function(e){e.preventDefault();var u=a.getAttribute('data-anexo')||'',k=u.indexOf(',');if(u.indexOf('data:')!==0||k<0)return;" +
    "var b=atob(u.slice(k+1)),n=b.length,x=new Uint8Array(n);for(var i=0;i<n;i++)x[i]=b.charCodeAt(i);window.open(URL.createObjectURL(new Blob([x],{type:'application/pdf'})),'_blank');});});})();";

  /* Movimento na página do navegador (não vai no e-mail), no estilo das páginas de produto:
     barra de leitura no topo; cada seção aparece ao entrar na tela; os números grandes contam
     do zero até o valor; a barra do Creative X cresce. Desligado com "reduzir movimento" no
     sistema e durante a edição no navegador (designMode). Ao terminar, o texto volta a ser
     exatamente o original, e o conversor tira as marcas (data-rv, data-barra, data-conta,
     data-motion, #leitura) se a página for salva pelo navegador. */
  var MOVIMENTO_CSS = "#leitura{position:fixed;top:0;left:0;right:0;height:4px;background:#EC0000;transform-origin:0 50%;transform:scaleX(0);z-index:8;pointer-events:none;}" +
    "[data-motion] [data-rv]{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .9s cubic-bezier(.2,.8,.2,1);}" +
    "[data-motion] [data-rv=on]{opacity:1;transform:none;}" +
    "[data-motion] td[data-barra]{transform:scaleX(0);transform-origin:0 50%;transition:transform 1.3s cubic-bezier(.2,.8,.2,1) .35s;}" +
    "[data-motion] td[data-barra=on]{transform:none;}" +
    "[data-conta]{font-variant-numeric:tabular-nums;}" +
    "@media print{[data-motion] [data-rv]{opacity:1 !important;transform:none !important;}#leitura{display:none;}}";
  var MOVIMENTO_JS = "(function(){var d=document,w=window,raiz=d.documentElement;" +
    "var bl=d.createElement('div');bl.id='leitura';bl.setAttribute('aria-hidden','true');d.body.appendChild(bl);" +
    "function lendo(){var h=raiz.scrollHeight-raiz.clientHeight;bl.style.transform='scaleX('+(h>0?Math.min(1,(w.pageYOffset||raiz.scrollTop)/h):0)+')';}" +
    "w.addEventListener('scroll',lendo,{passive:true});w.addEventListener('resize',lendo);lendo();" +
    "if((w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches)||!('IntersectionObserver' in w)||d.designMode==='on')return;" +
    "raiz.setAttribute('data-motion','');" +
    /* alvos: as células de cada linha de seção (entre as marcas secao:nome) */
    "var tw=d.createTreeWalker(d.body,128),c,alvos=[];" +
    "while((c=tw.nextNode())){var m=/^secao:([a-z]+)$/.exec(c.nodeValue.trim());if(!m||m[1]==='fim')continue;" +
    "var e=c.nextSibling;while(e&&e.nodeType===3)e=e.nextSibling;if(e&&e.nodeType===1&&e.tagName==='TBODY')e=e.firstChild;" +
    "for(;e&&!(e.nodeType===8&&/^secao:/.test(e.nodeValue.trim()));e=e.nextSibling){if(e.nodeType===1&&e.tagName==='TR'){for(var k=0;k<e.children.length;k++)alvos.push(e.children[k]);}}}" +
    /* barra do Creative X: a parte preenchida (altura 8, largura em %, menor que 100%) */
    "Array.prototype.forEach.call(d.querySelectorAll('td[height=\"8\"]'),function(t){var wd=t.getAttribute('width')||'';if(/%$/.test(wd)&&wd!=='100%'&&!t.previousElementSibling)t.setAttribute('data-barra','');});" +
    "var NUM=/^([^\\d]*?)(\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,(\\d+))?([^\\d]*)$/;" +
    "function conta(el){if(d.designMode==='on')return;var orig=el.textContent,m=NUM.exec(orig.trim());if(!m)return;" +
    "var pre=m[1],inteiro=m[2],dec=m[3]||'',suf=m[4];" +
    "if(!/^[\\s+\\-\\u2212]*(R\\$\\s?)?$/.test(pre)||!/^\\s*(%|x|p\\.p\\.|mil)?\\s*$/i.test(suf))return;" +
    "var alvo=parseFloat(inteiro.replace(/\\./g,'')+'.'+(dec||'0')),casas=dec.length,milhar=inteiro.indexOf('.')>=0;" +
    "if(alvo<10&&!pre.trim()&&!suf.trim())return;" +
    "if(parseFloat(w.getComputedStyle(el).fontSize)<22)return;" +
    "el.setAttribute('data-conta','');var t0=null,dur=1200;" +
    "function fmt(v){var s=v.toFixed(casas).split('.'),i=s[0];if(milhar)i=i.replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.');return pre+i+(casas?','+s[1]:'')+suf;}" +
    "function passo(ts){if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/dur),ez=1-Math.pow(1-p,3);el.textContent=p<1?fmt(alvo*ez):orig;if(p<1)w.requestAnimationFrame(passo);else el.setAttribute('data-conta','ok');}" +
    "el.textContent=fmt(0);w.requestAnimationFrame(passo);}" +
    "function anima(td){Array.prototype.forEach.call(td.querySelectorAll('p,span,b,td'),function(el){if(!el.children.length)conta(el);});" +
    "Array.prototype.forEach.call(td.querySelectorAll('td[data-barra]'),function(b){b.setAttribute('data-barra','on');});}" +
    "var io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;var el=en.target;io.unobserve(el);el.setAttribute('data-rv','on');anima(el);});},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});" +
    "alvos.forEach(function(td){td.setAttribute('data-rv','');io.observe(td);});})();";
  /* Estilo e script que esta função injeta (para trocar, sem duplicar, numa página que já os tem). */
  var INJETADO_CSS = /<style\b[^>]*>\s*\/\* Ampliar peças[\s\S]*?<\/style>\s*/g, INJETADO_JS = /<script\b[^>]*>[^<]*box\.id='amp'[\s\S]*?<\/script>\s*/g;
  function paraNavegador(html) {
    html = html.replace(INJETADO_CSS, "").replace(INJETADO_JS, "");
    if (html.indexOf("data-ampliar=") < 0 && html.indexOf("data-video=") < 0 && html.indexOf("data-anexo=") < 0 && html.indexOf("<!--secao:") < 0) return html;
    return html.replace("</head>", "<style>\n/* Ampliar peças e movimento (só na página do navegador) */\n" + AMPLIAR_CSS + MOVIMENTO_CSS + "\n</style>\n</head>")
      .replace(/<\/body>(?![\s\S]*<\/body>)/, "<script>\n" + AMPLIAR_JS + "\n" + MOVIMENTO_JS + "\n</script>\n</body>");
  }

  /* =================================================================== */
  /* 10. ZIP SIMPLES (sem compressão) para o modo "hospedadas"            */
  /* =================================================================== */
  var CRC = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(arquivos) {
    var partes = [], central = [], pos = 0;
    function u16(v) { return [v & 255, v >> 8 & 255]; }
    function u32(v) { return [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255]; }
    arquivos.forEach(function (f) {
      var nome = utf8(f.nome), crc = crc32(f.bytes), n = f.bytes.length;
      var loc = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(n), u32(n), u16(nome.length), u16(0));
      partes.push(Uint8Array.from(loc), nome, f.bytes);
      central.push([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(n), u32(n), u16(nome.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(pos)), nome);
      pos += loc.length + nome.length + n;
    });
    var tamCentral = 0;
    central.forEach(function (c) { var b = c instanceof Uint8Array ? c : Uint8Array.from(c); partes.push(b); tamCentral += b.length; });
    partes.push(Uint8Array.from([].concat(u32(0x06054b50), u16(0), u16(0), u16(arquivos.length), u16(arquivos.length), u32(tamCentral), u32(pos), u16(0))));
    var total = partes.reduce(function (s, p) { return s + p.length; }, 0), out = new Uint8Array(total), o = 0;
    partes.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }

  /* =================================================================== */
  /* 11. HTML EDITADO NO NAVEGADOR → E-MAIL (converter-html-eml.html)     */
  /* =================================================================== */

  /* Tira do HTML o que só funciona no navegador: script, janela de ampliação, vídeo,
     atributos do clique e da edição. Devolve o HTML do e-mail e o que saiu (para o status). */
  function limparHtmlEditado(html) {
    var saiu = [];
    function tira(re, nome) {
      var n = 0;
      html = html.replace(re, function () { n++; return ""; });
      if (n) saiu.push({ item: nome, n: n });
    }
    tira(/<!-- saved from url=[^>]*-->\s*/gi, "marca do Chrome (saved from url)");
    tira(/<script\b[\s\S]*?<\/script>\s*/gi, "script");
    tira(/<style\b[^>]*>\s*\/\* Ampliar peças[\s\S]*?<\/style>\s*/g, "estilo da ampliação");
    tira(/<div\b[^>]*\bid="amp"[\s\S]*?<\/div>\s*/g, "janela de ampliação");
    tira(/<video\b[\s\S]*?<\/video>\s*/gi, "vídeo");
    tira(/<button\b[^>]*class="vidpill"[^>]*>[\s\S]*?<\/button>\s*/g, "botão \"Assistir ao vídeo\"");
    tira(/<div\b[^>]*\bid="leitura"[^>]*><\/div>\s*/g, "barra de leitura");
    tira(/ data-(?:rv|motion|barra|conta)(?:="[^"]*")?(?=[\s>\/])/g, "marca do movimento");
    tira(/ data-(?:ampliar|legenda|video|thumb)="[^"]*"/g, "atributo de ampliação ou vídeo");
    var na = 0; html = anexosSemLink(html.replace(/data-anexo=/g, function (m) { na++; return m; }));
    if (na) saiu.push({ item: "link de documento anexado à página (vira texto no e-mail)", n: na });
    tira(/ data-(?:campo|tom|img|item)="[^"]*"/g, "marca dos campos do resumo e do editor");
    tira(/[ \t]*<!-- EDITAR AQUI[\s\S]*?-->\n?/g, "comentário \"EDITAR AQUI\"");
    tira(/<meta name="report-completo"[^>]*>\n?/g, "endereço do report completo (meta)");
    html = html.replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>\n?/g, "");
    tira(/ (?:tabindex="0"|role="button"|aria-label="(?:Ampliar|Assistir): [^"]*"|title="Clique para (?:ampliar|assistir)")/g, "atributo do clique");
    tira(/ (?:contenteditable|spellcheck)(?:="[^"]*")?(?=[\s>\/])/gi, "atributo de edição");
    return { html: html, saiu: saiu };
  }

  /* Endereços das imagens (<img src>), sem repetir, na ordem em que aparecem. */
  function imagensDoHtml(html) {
    var vistas = {}, lista = [];
    html.replace(/<img\b[^>]*?\ssrc="([^"]*)"/gi, function (m, src) {
      if (!vistas[src]) { vistas[src] = 1; lista.push(src); }
      return m;
    });
    return lista;
  }

  /* De onde vem a imagem: embutida (data:), já anexada (cid:), internet, blob (prévia, morta) ou arquivo ao lado. */
  function origemImagem(src) {
    if (/^data:image\/(png|jpe?g|gif);base64,/i.test(src)) return "embutida";
    if (/^data:/i.test(src)) return "embutida-incompativel";
    if (/^cid:/i.test(src)) return "cid";
    if (/^https?:\/\//i.test(src)) return "internet";
    if (/^blob:/i.test(src)) return "blob";
    return "arquivo";
  }

  var B64I = {};
  for (var q = 0; q < 64; q++) B64I[B64.charCodeAt(q)] = q;
  function deBase64(s) {
    s = s.replace(/[^A-Za-z0-9+\/]/g, "");
    var out = new Uint8Array(Math.floor(s.length * 3 / 4)), o = 0, i;
    for (i = 0; i + 3 < s.length; i += 4) {
      var v = B64I[s.charCodeAt(i)] << 18 | B64I[s.charCodeAt(i + 1)] << 12 | B64I[s.charCodeAt(i + 2)] << 6 | B64I[s.charCodeAt(i + 3)];
      out[o++] = v >> 16 & 255; out[o++] = v >> 8 & 255; out[o++] = v & 255;
    }
    var r = s.length - i;
    if (r >= 2) {
      var w = B64I[s.charCodeAt(i)] << 18 | B64I[s.charCodeAt(i + 1)] << 12 | (r === 3 ? B64I[s.charCodeAt(i + 2)] << 6 : 0);
      out[o++] = w >> 16 & 255;
      if (r === 3) out[o++] = w >> 8 & 255;
    }
    return out.subarray(0, o);
  }

  /* Imagem embutida (data:image/...;base64,...) → { bytes, ext }. */
  function imagemDeDataUri(src) {
    var m = /^data:image\/(png|jpe?g|gif);base64,(.*)$/i.exec(src);
    if (!m) return null;
    var ext = m[1].toLowerCase() === "jpeg" ? "jpg" : m[1].toLowerCase();
    return { bytes: deBase64(m[2]), ext: ext };
  }

  /* Troca o src das imagens pelo novo endereço (ex.: cid:...). */
  function trocarSrc(html, mapa) {
    return html.replace(/(<img\b[^>]*?\ssrc=")([^"]*)(")/gi, function (m, a, src, c) {
      return Object.prototype.hasOwnProperty.call(mapa, src) ? a + mapa[src] + c : m;
    });
  }

  function desfazEntidades(s) {
    var NOMES = { minus: "\u2212", rarr: "\u2192", larr: "\u2190", middot: "\u00b7", ndash: "\u2013", mdash: "\u2014", hellip: "\u2026", ldquo: "\u201c", rdquo: "\u201d", lsquo: "\u2018", rsquo: "\u2019", bull: "\u2022", times: "\u00d7" };
    s = s.replace(/&([a-z]+);/g, function (m, n) { return NOMES[n] || m; });
    return s.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
      .replace(/&#(\d+);/g, function (m, n) { return String.fromCodePoint(+n); })
      .replace(/&#x([0-9a-f]+);/gi, function (m, n) { return String.fromCodePoint(parseInt(n, 16)); })
      .replace(/&amp;/g, "&");
  }

  /* Assunto do e-mail: o <title> da página. */
  function assuntoDoHtml(html) {
    var m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    return m ? desfazEntidades(m[1]).replace(/\s+/g, " ").trim() : "";
  }

  /* Versão em texto puro (para quem não vê HTML), com os links entre parênteses. */
  function textoDoHtml(html) {
    var t = html.replace(/<head[\s\S]*?<\/head>/i, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, "")
      .replace(/<a\b[^>]*?href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, function (m, u, x) { return x + " (" + u + ")"; })
      .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|tr|h\d|li|div|table)>/gi, "\n").replace(/<[^>]+>/g, " ");
    return desfazEntidades(t).split("\n").map(function (l) { return l.replace(/[ \t ]+/g, " ").trim(); })
      .filter(function (l, i, a) { return l || (i > 0 && a[i - 1]); }).join("\n").trim() + "\n";
  }

  /* Comentário que a ferramenta grava no topo do arquivo: versão e arquivo de dados. */
  function origemDoHtml(html) {
    var m = /Arquivo gerado por gerar-report\.html \(versão ([^)]*\))\) a partir de ([^ ]+)/.exec(html);
    if (m) return { versao: m[1], dados: m[2] };
    m = /BACKUP DO REPORT · versão ([^\n]*?\))/.exec(html);
    return m ? { versao: m[1], dados: "dados/MODELO.txt (backup)" } : null;
  }

  /* ---------- E-mail resumido + versão interativa ---------- */

  /* Nome de cada seção (marcas <!--secao:nome--> do template) e as que o e-mail resumido leva. */
  var SECOES = {
    capa: "Capa (frase do mês, campanha e números)", lancamos: "O que lançamos", cx: "Creative X",
    transformation: "Transformation Hub", aprendizados: "O que aprendemos", foco: "Foco do próximo mês",
    agenda: "Também vem aí", rodape: "Encerramento e assinatura"
  };
  TOPICOS.forEach(function (t, i) { SECOES[t[1]] = "Novo tópico " + (i + 1); });
  var SECOES_RESUMO = ["capa", "foco", "rodape"];
  var MARCA_SECAO = /<!--secao:([a-z]+)-->/g;

  /* Nome da seção; o de um tópico novo é o rótulo que ele tem na página (ex.: "Tópico: TESTES"). */
  function nomeDaSecao(html, id) {
    var m = /^topico[a-z]?$/.test(id) && new RegExp('data-campo="' + id + '\\.rotulo"[^>]*>([^<]*)<').exec(html);
    return m && m[1].trim() ? "Tópico: " + desfazEntidades(m[1].trim()) : SECOES[id] || id;
  }
  /* Seções que a página tem, na ordem: [{ id, nome }]. Vazio = arquivo de antes da versão 3.9 (sem marcas). */
  function secoesDoHtml(html) {
    var r = [], m;
    MARCA_SECAO.lastIndex = 0;
    while ((m = MARCA_SECAO.exec(html))) if (m[1] !== "fim" && m[1] !== "interativo") r.push({ id: m[1], nome: nomeDaSecao(html, m[1]) });
    return r;
  }

  /* Fonte de títulos (classe ft) e de texto (classe fx) usadas na página, para o bloco novo seguir o report. */
  function fonteDaClasse(html, cls, padrao) {
    var m = new RegExp('class="' + cls + '[ "][^>]*?font-family:([^;"]+)').exec(html);
    return m ? m[1].trim() : padrao;
  }
  function escAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* Bloco "Ver o report completo": rótulo, título, o que ficou de fora e o botão (tabela com fundo: funciona no Outlook). */
  function blocoInterativo(html, op) {
    var ft = fonteDaClasse(html, "ft", "Arial, Helvetica, sans-serif"), fx = fonteDaClasse(html, "fx", "Arial, Helvetica, sans-serif");
    var fora = (op.fora || []).map(function (id) { return nomeDaSecao(html, id); });
    var lista = fora.length ? fora.slice(0, -1).join(", ") + (fora.length > 1 ? " e " : "") + fora[fora.length - 1] : "";
    var texto = op.chamada || ((lista ? "Na versão completa estão também: " + lista + ". " : "") +
      (op.temVideo ? "Lá, os vídeos das campanhas tocam e as peças abrem maiores no clique." : "Lá, as peças abrem maiores no clique."));
    return '<!--secao:interativo-->\n' +
      '  <tr>\n    <td class="px" style="padding:40px 40px 0 40px;">\n' +
      '      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #000000;">\n        <tr>\n          <td style="padding:22px 0 0 0;">\n' +
      '            <p class="fx" style="margin:0;font-family:' + fx + ';font-size:10px;line-height:14px;font-weight:bold;color:#EC0000;letter-spacing:2px;">REPORT COMPLETO</p>\n' +
      '            <p class="ft h2" style="margin:8px 0 0 0;font-family:' + ft + ';font-weight:bold;font-size:22px;line-height:27px;color:#EC0000;letter-spacing:-0.5px;">' + textoSeguroSimples(op.titulo || "Este e-mail é o resumo do mês.") + '</p>\n' +
      '            <p class="fx tm" style="margin:6px 0 0 0;font-family:' + fx + ';font-size:13px;line-height:19px;color:#222222;">' + textoSeguroSimples(texto) + '</p>\n' +
      '            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>\n' +
      '              <td bgcolor="#EC0000" style="background:#EC0000;border-radius:999px;padding:13px 26px;">' +
      '<a class="cta" href="' + escAttr(op.link) + '" target="_blank" style="font-family:' + fx + ';font-size:14px;line-height:18px;font-weight:bold;color:#FFFFFF;text-decoration:none;">' + textoSeguroSimples(op.botao || "Ver o report completo (interativo)") + ' &#8594;</a></td>\n' +
      '            </tr></table>\n' +
      '            <p class="fx ts" style="margin:10px 0 0 0;font-family:' + fx + ';font-size:11px;line-height:16px;color:#5F5F5F;">Abre no navegador (Chrome ou Edge).</p>\n' +
      '          </td>\n        </tr>\n      </table>\n    </td>\n  </tr>\n';
  }
  function textoSeguroSimples(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* Miniatura de vídeo (alt "Vídeo: ...") sem link passa a abrir a versão interativa, onde o vídeo toca. */
  function ligarVideos(html, link) {
    var n = 0;
    html = html.replace(/(<a\b[^>]*>\s*)?(<img\b[^>]*?\salt="Vídeo: [^"]*"[^>]*>)/g, function (m, a, img) {
      if (a) return m;
      n++;
      return '<a href="' + escAttr(link) + '" target="_blank" style="text-decoration:none;">' + img + "</a>";
    });
    return { html: html, n: n };
  }

  /* E-mail resumido: a miniatura de vídeo vira só a imagem (a versão sem ▶ guardada em data-thumb),
     sem link e sem "Vídeo:" no texto alternativo, para não dar a entender que o vídeo toca ali.
     Devolve { html, trocadas, comPlay } (comPlay = miniaturas de vídeo sem data-thumb, de páginas antigas). */
  function miniaturasSemPlay(html) {
    var trocadas = 0, comPlay = 0;
    html = html.replace(/<a\b[^>]*>\s*(<img\b[^>]*\sdata-thumb="[^"]*"[^>]*>)\s*<\/a>/g, "$1");
    html = html.replace(/<img\b[^>]*>/gi, function (tag) {
      var t = / data-thumb="([^"]*)"/.exec(tag);
      if (!t) { if (/ alt="Vídeo: /.test(tag) && !/ data-ampliar=/.test(tag)) comPlay++; return tag; }
      trocadas++;
      return tag.replace(/ src="[^"]*"/, function () { return ' src="' + t[1] + '"'; })
        .replace(/ alt="Vídeo: ([^"]*?)(?: \([^)]*\))?"/, ' alt="$1"');
    });
    return { html: html, trocadas: trocadas, comPlay: comPlay };
  }

  /* Renumera as etiquetas de seção (01, 02...) na ordem em que aparecem. */
  function renumerarSecoes(html) {
    var n = 0;
    return html.replace(/(border-radius:999px;padding:0 7px;letter-spacing:1px;">)(\d{2})(<\/span>)/g, function (m, a, x, c) { n++; return a + (n < 10 ? "0" : "") + n + c; });
  }

  /*
   * emailResumido(html, { manter: [ids], link, botao, titulo, chamada })
   *   Corta as seções que não estão em "manter", põe o bloco "Ver o report completo" antes do
   *   encerramento, liga as miniaturas de vídeo ao link e renumera as seções.
   *   Devolve { html, mantidas, fora, videos } ou { erro }.
   */
  function emailResumido(html, op) {
    html = html.replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>\n?/g, "");
    var partes = html.split(/(<!--secao:[a-z]+-->)/);
    if (partes.length < 3) return { erro: "Este arquivo não tem as marcas de seção (foi gerado antes da versão 3.9). Gere a página de novo pelo gerar-report.html." };
    var manter = op.manter || SECOES_RESUMO, mantidas = [], fora = [], out = partes[0], bloco = false;
    var temVideo = /data-video="/.test(html) || /alt="Vídeo: /.test(html);
    for (var i = 1; i < partes.length; i += 2) {
      var id = /secao:([a-z]+)/.exec(partes[i])[1], corpo = partes[i + 1] || "";
      if (id === "interativo") continue;
      if ((id === "rodape" || id === "fim") && !bloco && op.link) {
        out += blocoInterativo(html, { link: op.link, botao: op.botao, titulo: op.titulo, chamada: op.chamada, fora: fora, temVideo: temVideo }) + "  ";
        bloco = true;
      }
      if (id === "fim") { out += partes[i] + corpo; continue; }
      if (manter.indexOf(id) >= 0) { out += partes[i] + corpo; mantidas.push(id); }
      else fora.push(id);
    }
    var v = op.link && op.ligar ? ligarVideos(out, op.link) : { html: out, n: 0 };
    return { html: renumerarSecoes(v.html), mantidas: mantidas, fora: fora, videos: v.n };
  }

  /* Página interativa para hospedar (SharePoint): tira só o que o navegador acrescentou ao salvar
     (janela de ampliação já montada, atributos do clique, marcas da edição). O script fica e roda de novo. */
  function paginaInterativa(html) {
    var saiu = [];
    function tira(re, nome) { var n = 0; html = html.replace(re, function () { n++; return ""; }); if (n) saiu.push({ item: nome, n: n }); }
    tira(/<!-- saved from url=[^>]*-->\s*/gi, "marca do Chrome (saved from url)");
    tira(/<div\b[^>]*\bid="amp"[\s\S]*?<\/div>\s*/g, "janela de ampliação já montada");
    tira(/<button\b[^>]*class="vidpill"[^>]*>[\s\S]*?<\/button>\s*/g, "botão \"Assistir ao vídeo\" já montado");
    tira(/<div\b[^>]*\bid="leitura"[^>]*><\/div>\s*/g, "barra de leitura já montada");
    tira(/ data-(?:rv|motion|barra|conta)(?:="[^"]*")?(?=[\s>\/])/g, "marca do movimento");
    /* Script e estilo da página trocados pelos desta versão (a página ganha o que houver de novo). */
    INJETADO_CSS.lastIndex = INJETADO_JS.lastIndex = 0;
    var antigo = html.search(INJETADO_CSS) >= 0 || html.search(INJETADO_JS) >= 0;
    html = paraNavegador(html);
    if (antigo) saiu.push({ item: "script da página atualizado para a versão " + VERSAO, n: 1 });
    tira(/ (?:tabindex="0"|role="button"|aria-label="(?:Ampliar|Assistir): [^"]*"|title="Clique para (?:ampliar|assistir)")/g, "atributo do clique");
    tira(/ (?:contenteditable|spellcheck)(?:="[^"]*")?(?=[\s>\/])/gi, "atributo de edição");
    /* report de antes da 4.10: ganha o ajuste de largura do celular (nada passa da tela) */
    if (html.indexOf('id="ajuste-celular"') < 0 && /<\/head>/i.test(html)) { html = html.replace(/<\/head>/i, function () { return CSS_CELULAR + "\n</head>"; }); saiu.push({ item: "ajuste de largura do celular acrescentado", n: 1 }); }
    return { html: html, saiu: saiu, interativa: (/data-(ampliar|video)="/.test(html) || /<!--secao:/.test(html)) && /<script/i.test(html) };
  }

  /* =================================================================== */
  /* 12. E-MAIL-RESUMO: PORTA DE ENTRADA PARA O REPORT COMPLETO           */
  /* =================================================================== */
  /*
   * O e-mail-resumo é curto de propósito: cabeçalho com o período, a frase do mês em uma linha de
   * contexto, DOIS OU TRÊS indicadores e uma única chamada, "Acessar report completo". Estático (sem
   * vídeo, ampliação, imagem clicável ou JavaScript), pensado para ser lido em poucos segundos, sem rolar.
   * O conteúdo vem da página do mês (mesma fonte do report completo): cada texto e número marcado no
   * template com data-campo="…". Editou a página? O resumo acompanha.
   *
   * SELEÇÃO DOS INDICADORES: até 3. Padrão = os números do projeto principal (capa), na ordem da página.
   * No emulador, dá para trocar por outros indicadores da página (resultados do destaque, Creative X).
   * Indicador vazio não aparece; nada é inventado nem completado com zero.
   */
  var RESUMO_REGRAS = { indicadores: 3, destaques: 4, itens_topico: 4 };
  /* Paleta do Brand Guide (a mesma de config/marca.txt). */
  var CR = {
    marca: "#EC0000", branco: "#FFFFFF", lisboa: "#FBF1EA", rio: "#F5DECF", mexico: "#F0B998", texto: "#000000", apoio: "#767676", linha: "#E2E2E2",
    positivo: "#21634F", positivo_fundo: "#A3E0CE", atencao: "#945400", atencao_fundo: "#FFE1B9",
    turquesa: "#127277", turquesa_fundo: "#CDECEE", roxo: "#803262", roxo_fundo: "#F0CAE1", rosa: "#A6112F", rosa_fundo: "#FFC3CF"
  };

  /* Todos os elementos com data-campo, na ordem: [{ campo, tag, atributos, interno }]. */
  function elementosComCampo(html) {
    var re = /<([a-z0-9]+)\b([^>]*?)\sdata-campo="([^"]+)"([^>]*)>/gi, r = [], m;
    while ((m = re.exec(html))) {
      var tag = m[1].toLowerCase(), attrs = m[2] + " " + m[4], ini = re.lastIndex, interno = "";
      if (tag !== "img") {
        var abre = new RegExp("<" + tag + "\\b|</" + tag + "\\s*>", "gi"), prof = 1, x;
        abre.lastIndex = ini;
        while (prof && (x = abre.exec(html))) { prof += x[0][1] === "/" ? -1 : 1; if (!prof) interno = html.slice(ini, x.index); }
      }
      r.push({ campo: m[3], tag: tag, atributos: attrs, interno: interno });
    }
    return r;
  }
  function atributo(attrs, nome) { var m = new RegExp("\\s" + nome + '="([^"]*)"').exec(" " + attrs); return m ? desfazEntidades(m[1]) : ""; }
  /* Texto visível de um campo: sem o botão "Ver peça" (o resumo não tem links), sem tags, entidades desfeitas. */
  function textoDoCampo(h) {
    /* Um campo dentro de outro (ex.: frase_final dentro da frase) conta só no dele. */
    h = String(h).replace(/<([a-z0-9]+)\b[^>]*\sdata-campo="[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, "");
    return desfazEntidades(String(h).replace(/<a\b[^>]*class="cta"[\s\S]*?<\/a>/gi, "").replace(/<span title="Link ainda não definido"[\s\S]*?<\/span>/gi, "")
      .replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/[\s\u00a0]+/g, " ").trim();
  }

  /*
   * dadosDoResumo(html) → { ok, d, pendencias } ou { erro }
   *   Lê da página os campos marcados (data-campo), na ordem, e lista os indicadores candidatos.
   */
  function dadosDoResumo(html) {
    var els = elementosComCampo(html);
    if (!els.length) return { erro: "Esta página não tem os campos do resumo (foi gerada antes da versão 4.2). Gere a página de novo pelo gerar-report.html." };
    var c = {}, img = {}, tom = {}, pend = [];
    els.forEach(function (e) {
      if (e.tag === "img") { if (!img[e.campo]) img[e.campo] = { src: atributo(e.atributos, "src"), thumb: atributo(e.atributos, "data-thumb"), alt: atributo(e.atributos, "alt"), w: +atributo(e.atributos, "width") || 0 }; return; }
      if (e.campo in c || e.campo === "previa") return;
      var t = textoDoCampo(e.interno);
      if (!t) return;
      c[e.campo] = t;
      var tm = /data-tom="(verde|ambar)"/.exec(e.atributos + e.interno);
      if (tm) tom[e.campo] = tm[1];
      if (/\[[^\]]*\]|\blorem\b|\bipsum\b/i.test(t) || (/\.(valor|detalhe|variacao|atual|anterior|data)$|^periodo$/.test(e.campo) && (xDeExemplo(t) || /AAAA/.test(t)))) pend.push(e.campo + ": " + t);
    });
    function lista(prefixo, campos) {
      var r = [];
      for (var i = 1; i <= 12; i++) {
        var it = { chave: prefixo + "-" + i }, tem = false;
        campos.forEach(function (k) { var v = c[prefixo + "-" + i + "." + k]; it[k] = v || ""; if (v) tem = true; it["tom_" + k] = tom[prefixo + "-" + i + "." + k] || ""; });
        if (tem) r.push(it);
      }
      return r;
    }
    var d = {
      periodo: c.periodo || "", frase: c.frase || "", frase_final: c.frase_final || "",
      logo: img.logo || null,
      principal: c["principal.nome"] ? { nome: c["principal.nome"], resumo: c["principal.resumo"] || "" } : null,
      numeros: lista("numero", ["valor", "titulo", "detalhe", "variacao"]).filter(function (n) { return n.valor; }),
      destaque: c["destaque.titulo"] ? { titulo: c["destaque.titulo"], resultados: lista("resultado", ["valor", "titulo", "detalhe", "variacao"]).filter(function (n) { return n.valor; }) } : null,
      cx: c["cx.atual"] ? { anterior: c["cx.anterior"] || "", atual: c["cx.atual"], variacao: c["cx.variacao"] || "", tom: tom["cx.variacao"] || "", periodo: c["cx.periodo"] || "", subtitulo: c["cx.subtitulo"] || "" } : null,
      tem: { campanhas: !!(c["destaque.titulo"] || c["lancamento-1.nome"]), aprendizados: !!c["aprendizado-1.titulo"], transformation: !!c["transformation-1.nome"], proximos: !!(c["foco.prioridade"] || c["agenda-1.titulo"]) },
      /* Novos tópicos, na ordem da página: rótulo, título e itens (o layout numeros dá indicadores) */
      topicos: TOPICOS.map(function (t) {
        var sid = t[1], its = lista(sid, ["status", "nome", "texto", "valor"]);
        if (!its.length && !c[sid + ".rotulo"]) return null;
        return { id: sid, rotulo: c[sid + ".rotulo"] || "Novo tópico", titulo: c[sid + ".titulo"] || "", itens: its, pos: html.indexOf("<!--secao:" + sid + "-->") };
      }).filter(Boolean).sort(function (a, b) { return a.pos - b.pos; })
    };
    /* Indicadores candidatos (o e-mail usa até 3): números do projeto principal, resultados do destaque e Creative X. */
    var ind = [];
    d.numeros.forEach(function (n) { ind.push({ chave: n.chave, valor: n.valor, titulo: n.titulo, detalhe: n.detalhe, variacao: n.variacao, tom: n.tom_variacao, origem: d.principal ? d.principal.nome : "Projeto principal", grupo: "Projeto principal" }); });
    if (d.destaque) d.destaque.resultados.forEach(function (n) { ind.push({ chave: n.chave, valor: n.valor, titulo: n.titulo, detalhe: n.detalhe, variacao: n.variacao, tom: n.tom_variacao, origem: d.destaque.titulo, grupo: "Destaque do mês" }); });
    d.topicos.forEach(function (tp) {
      var gr = tp.rotulo.charAt(0) + tp.rotulo.slice(1).toLocaleLowerCase("pt-BR");
      tp.itens.forEach(function (n) { if (n.valor) ind.push({ chave: n.chave, valor: n.valor, titulo: n.nome, detalhe: n.texto, variacao: "", tom: "", origem: tp.titulo || gr, grupo: gr }); });
    });
    if (d.cx) ind.push({ chave: "cx", valor: d.cx.atual, titulo: "Creative X" + (d.cx.subtitulo ? " · " + d.cx.subtitulo.split(" · ")[0] : ""), detalhe: (d.cx.anterior ? "Antes: " + d.cx.anterior : "") + (d.cx.periodo ? (d.cx.anterior ? " · " : "") + d.cx.periodo : ""), variacao: d.cx.variacao, tom: d.cx.tom, origem: "Creative X", grupo: "Creative X" });
    d.indicadores = ind;
    d.campos = c; d.tons = tom;
    /* imagens da página (data-img): a peça, o card, o projeto… A de vídeo já tem o ▶ desenhado (é a capa estática). */
    d.figuras = {};
    html.replace(/<img\b[^>]*\sdata-img="([^"]+)"[^>]*>/g, function (tag, k) {
      if (!d.figuras[k]) d.figuras[k] = { src: atributo(tag, "src"), alt: atributo(tag, "alt"), video: / data-video="/.test(tag), w: +atributo(tag, "width") || 0 };
      return tag;
    });
    return { ok: true, d: d, pendencias: pend };
  }

  /* =================================================================== */
  /* Destaques do e-mail-resumo (4.13): o que o report oferece, a sugestão, e a escolha da pessoa (até 4)        */
  /* =================================================================== */
  /*
   * Cada candidato: { origem, secao, tipo: "indicador" | "texto", valor, titulo, texto, etiqueta, tom, grupo, figura }
   *   origem = a chave na página (numero-1, resultado-2, cx, cxt-1, principal, destaque, lancamento-3,
   *   principal.aprendizado, aprendizado-1, transformation-2, foco, agenda-1, topico-1…). O valor sempre vem da página:
   *   mudar um número no report muda o e-mail. figura = a chave da imagem da página que combina com o item (data-img).
   */
  function candidatosResumo(d) {
    var c = d.campos || {}, tom = d.tons || {}, fig = d.figuras || {}, out = [];
    function v(k) { return c[k] || ""; }
    function semBola(t) { return String(t || "").replace(/^[\u25cf\u25cb]\s*/, ""); }
    function add(x) { if (x.titulo || x.valor || x.texto) out.push(x); }
    /* na etiqueta do cartão, o nome curto da campanha: "Campanha Beta: frase do título" vira "Campanha Beta" */
    function nomeCurto(t) { var m = /^([^:]{2,32}):\s/.exec(String(t || "")); return m ? m[1].trim() : t; }
    var nomeP = v("principal.nome") || "Campanha", nomeD = v("destaque.titulo");
    /* o rótulo da capa ("CAMPANHA", editável) dá nome à seção na lista do emulador e à etiqueta do cartão no e-mail */
    var rotP = (function (r) { r = String(r || "").trim(); r = r ? r.toLocaleLowerCase("pt-BR") : "campanha"; return r.charAt(0).toLocaleUpperCase("pt-BR") + r.slice(1); })(v("principal.rotulo"));
    d.indicadores.forEach(function (n) {
      var sec = n.grupo === "Destaque do mês" ? "Destaque" : n.grupo === "Projeto principal" ? rotP : n.grupo;
      add({ origem: n.chave, secao: sec, tipo: "indicador", valor: n.valor, titulo: n.titulo, texto: n.detalhe, etiqueta: n.variacao, tom: n.tom, grupo: n.grupo === "Destaque do mês" ? nomeCurto(n.origem) : n.origem,
        figura: n.grupo === "Projeto principal" ? "principal" : n.grupo === "Destaque do mês" ? "destaque" : "", capa: n.grupo === "Projeto principal" });
    });
    for (var i = 1; i <= 3; i++) if (v("cxt-" + i + ".valor")) add({ origem: "cxt-" + i, secao: "Creative X", tipo: "indicador", valor: v("cxt-" + i + ".valor"), titulo: v("cxt-" + i + ".titulo"), texto: v("cxt-" + i + ".detalhe"), etiqueta: v("cxt-" + i + ".variacao"), tom: tom["cxt-" + i + ".variacao"] || "", grupo: "Creative X trimestral", figura: "" });
    if (c["principal.nome"]) add({ origem: "principal", secao: rotP, capa: true, tipo: "texto", titulo: nomeP, texto: v("principal.resumo"), grupo: rotP, figura: fig.principal ? "principal" : "" });
    if (v("principal.aprendizado")) add({ origem: "principal.aprendizado", secao: rotP, capa: true, tipo: "texto", titulo: "O que aprendemos", texto: v("principal.aprendizado"), grupo: nomeP, aprendizado: true, figura: "" });
    if (nomeD) add({ origem: "destaque", secao: "Destaque", tipo: "texto", titulo: nomeD, texto: v("destaque.texto"), grupo: v("destaque.categoria") || "Destaque do mês", figura: fig.destaque ? "destaque" : "" });
    if (v("destaque.aprendizado")) add({ origem: "destaque.aprendizado", secao: "Destaque", tipo: "texto", titulo: "O que aprendemos", texto: v("destaque.aprendizado"), grupo: nomeCurto(nomeD) || "Destaque do mês", aprendizado: true, figura: "" });
    for (i = 1; i <= 6; i++) {
      var lk = "lancamento-" + i; if (!v(lk + ".nome")) continue;
      add({ origem: lk, secao: "Lançamentos", tipo: "texto", titulo: v(lk + ".nome"), texto: v(lk + ".texto"), etiqueta: semBola(v(lk + ".status")), tom: tom[lk + ".status"] || "", grupo: "Também neste mês", figura: fig[lk] ? lk : "" });
      if (v(lk + ".aprendizado")) add({ origem: lk + ".aprendizado", secao: "Lançamentos", tipo: "texto", titulo: "O que aprendemos", texto: v(lk + ".aprendizado"), grupo: v(lk + ".nome"), aprendizado: true, figura: "" });
    }
    for (i = 1; i <= 3; i++) {
      var tk = "transformation-" + i; if (!v(tk + ".nome")) continue;
      add({ origem: tk, secao: "Transformation Hub", tipo: "texto", titulo: v(tk + ".nome"), texto: v(tk + ".texto"), etiqueta: semBola(v(tk + ".status")), tom: tom[tk + ".status"] || "", grupo: "Transformation Hub", figura: fig[tk] ? tk : "" });
    }
    for (i = 1; i <= 3; i++) if (v("aprendizado-" + i + ".titulo")) add({ origem: "aprendizado-" + i, secao: "O que aprendemos", tipo: "texto", titulo: v("aprendizado-" + i + ".titulo"), texto: v("aprendizado-" + i + ".texto"), grupo: "O que aprendemos", aprendizado: true, figura: "" });
    if (v("foco.prioridade")) add({ origem: "foco", secao: "Foco", tipo: "texto", titulo: v("foco.prioridade"), texto: v("foco.texto"), grupo: "Foco" + (v("foco.mes") ? " de " + v("foco.mes").charAt(0) + v("foco.mes").slice(1).toLocaleLowerCase("pt-BR") : ""), figura: "" });
    for (i = 1; i <= 6; i++) if (v("agenda-" + i + ".titulo")) add({ origem: "agenda-" + i, secao: "Também vem aí", tipo: "texto", titulo: v("agenda-" + i + ".titulo"), texto: v("agenda-" + i + ".detalhe"), etiqueta: v("agenda-" + i + ".data"), tom: "verde", grupo: "Também vem aí", figura: "" });
    d.topicos.forEach(function (tp) {
      var gr = tp.rotulo.charAt(0) + tp.rotulo.slice(1).toLocaleLowerCase("pt-BR");
      tp.itens.forEach(function (n) { if (!n.valor) add({ origem: n.chave, secao: gr, tipo: "texto", titulo: n.nome || n.texto, texto: n.nome ? n.texto : "", etiqueta: semBola(n.status), tom: n.tom_status || "", grupo: tp.titulo || gr, figura: fig[n.chave] ? n.chave : "" }); });
    });
    return out;
  }
  /* Sugestão (a pessoa decide no fim): os números do projeto principal que a frase do mês ainda não diz, até 3, como
     antes da 4.13; sem eles, os primeiros indicadores da página. */
  function sugerirDestaques(cand, fraseMes) {
    var ind = cand.filter(function (x) { return x.tipo === "indicador"; });
    ind.forEach(function (x) { x.na_frase = repete(fraseMes, x); });
    var livres = ind.filter(function (x) { return !x.na_frase; });
    var s = livres.filter(function (x) { return x.capa; }).slice(0, RESUMO_REGRAS.indicadores);
    if (!s.length) s = (livres.length ? livres : ind).slice(0, RESUMO_REGRAS.indicadores);
    return s.map(function (x) { return { origem: x.origem }; });
  }
  /* Grade: em pares (290 + 20 + 290); com número ímpar, o primeiro ocupa a largura toda. */
  var DESTAQUE_IMG = { metade: [290, 163], larga: [600, 270], lado: [240, 240] };
  function layoutDestaques(n) {
    var r = [];
    for (var i = 0; i < n; i++) r.push({ largo: n % 2 === 1 && i === 0, w: n % 2 === 1 && i === 0 ? LARGURA : 290 });
    return r;
  }
  /* O tamanho da imagem de cada destaque (o emulador recorta nesse tamanho, em dobro para telas nítidas):
     posicao "lado" só no destaque largo; nos outros, a imagem vai em cima. */
  function tamanhoImagemDestaque(i, n, posicao) {
    var l = layoutDestaques(n)[i] || { largo: false };
    return l.largo ? (posicao === "lado" ? DESTAQUE_IMG.lado : DESTAQUE_IMG.larga) : DESTAQUE_IMG.metade;
  }
  /*
   * resolverDestaques(config, cand) → { lista, fora }
   *   config: [{ origem, titulo?, texto?, semEtiqueta?, imagem?: { src, w, h, alt, posicao, video }, link?, link_texto?,
   *              novo?: true, valor?, etiqueta?, tom? }] (até 4). Título e descrição: o texto da pessoa (se houver) ou o da
   *   página. Informação nova (novo): tudo vem da configuração. Item que saiu da página fica de fora (aviso).
   */
  function resolverDestaques(config, cand) {
    var por = {}, lista = [], fora = [];
    cand.forEach(function (x) { por[x.origem] = x; });
    (config || []).slice(0, RESUMO_REGRAS.destaques).forEach(function (cf) {
      if (!cf) return;
      var base = cf.novo ? { origem: cf.origem || "novo", secao: "Informação nova", tipo: cf.valor ? "indicador" : "texto", valor: cf.valor || "", titulo: "", texto: "", etiqueta: cf.etiqueta || "", tom: cf.tom || "verde", grupo: cf.grupo || "" } : por[cf.origem];
      if (!base) { fora.push(cf.origem); return; }
      var t = function (x, y) { return x !== undefined && x !== null && String(x).trim() !== "" ? String(x).trim() : y; };
      var lk = cf.link ? normalizarLink(cf.link) : null;
      lista.push({
        origem: base.origem, secao: base.secao, tipo: cf.novo ? (cf.valor ? "indicador" : "texto") : base.tipo, novo: !!cf.novo,
        valor: cf.novo ? (cf.valor || "") : base.valor || "", titulo: t(cf.titulo, base.titulo), texto: cf.texto !== undefined && cf.texto !== null ? String(cf.texto).trim() : base.texto || "",
        etiqueta: cf.semEtiqueta ? "" : cf.novo ? (cf.etiqueta || "") : base.etiqueta || "", tom: cf.novo ? (cf.tom || "verde") : base.tom || "",
        grupo: t(cf.grupo, base.grupo || ""), aprendizado: !!base.aprendizado,
        imagem: cf.imagem && cf.imagem.src ? cf.imagem : null, link: lk && !lk.erro ? lk.url : "", link_texto: t(cf.link_texto, "Saiba mais"),
        editado: !cf.novo && ((t(cf.titulo, "") && t(cf.titulo, "") !== base.titulo) || (cf.texto !== undefined && cf.texto !== null && String(cf.texto).trim() !== (base.texto || "")))
      });
    });
    return { lista: lista, fora: fora };
  }

  /* Etiqueta (▲ +12%), com o tom verde ou âmbar que veio da página. Célula de tabela com fundo: o Outlook para
     Windows ignora a margem interna de <span>, e a célula sai igual em todos os programas. */
  function etiquetaResumo(texto, tomCampo, fx) {
    if (!texto) return "";
    var ambar = tomCampo === "ambar", corT = ambar ? CR.atencao : CR.positivo, corF = ambar ? CR.atencao_fundo : CR.positivo_fundo;
    return seguro('<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="fx ' + (ambar ? "dm-chip-ambar" : "dm-chip-verde") + '" bgcolor="' + corF + '" style="background:' + corF + ";padding:0 7px;color:" + corT + ";font-family:" + fx +
      ';font-size:10px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;white-space:nowrap;">' + esc(texto) + "</td></tr></table>");
  }

  /* Repetição no e-mail-resumo: textos comparados sem acento, maiúsculas e pontuação. */
  function textoComparavel(s) { return semAcento(String(s || "")).toLowerCase().replace(/[^a-z0-9%$,]+/g, " ").replace(/(\d),(?!\d)/g, "$1 ").replace(/\s+/g, " ").trim(); }
  function contemTexto(a, b) { var x = textoComparavel(b); return !!x && (" " + textoComparavel(a) + " ").indexOf(" " + x + " ") >= 0; }
  /* O texto já diz o indicador: tem o valor e a maior parte das palavras do que ele mede. */
  function repete(texto, x) {
    if (!x.valor || !contemTexto(texto, x.valor)) return false;
    var t = " " + textoComparavel(texto) + " ", ps = textoComparavel(x.titulo).split(" ").filter(function (w) { return w.length >= 4 && !/^\d/.test(w); });
    return !ps.length || ps.filter(function (w) { return t.indexOf(" " + w + " ") >= 0 || t.indexOf(" " + w.replace(/s$/, "") + " ") >= 0; }).length * 2 >= ps.length;
  }

  /* Espaços entre colunas e entre tópicos: células vazias, sem &nbsp;. No modo escuro, o Outlook clássico para Windows
     pinta o caractere invisível e aparecem quadrados entre os indicadores (4.12.1). */
  /* Cantos retos de propósito: ao enviar, o Outlook para Windows reescreve o e-mail e tira os cantos arredondados para
     todos que recebem. Assim a prévia do emulador mostra o que chega na caixa de entrada. */
  var RESUMO_TPL = [
    '<!DOCTYPE html>',
    '<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
    '<meta name="x-apple-disable-message-reformatting">',
    '<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">',
    '<meta name="color-scheme" content="light only">',
    '<meta name="supported-color-schemes" content="light only">',
    '<title>{{assunto}}</title>',
    '{{mso}}',
    '<style>',
    '  :root{color-scheme:light only;supported-color-schemes:light only;}',
    '  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}',
    '  table{border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;}',
    '  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}',
    '  a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}',
    '  .container td,.container p{overflow-wrap:anywhere;word-break:break-word;}',
    '  @media screen and (max-width:700px){',
    '    .container{width:100% !important;}',
    '    .kpiv{white-space:normal !important;}',
    '    .px{padding-left:20px !important;padding-right:20px !important;}',
    '    .col{display:block !important;width:100% !important;box-sizing:border-box !important;padding-left:0 !important;padding-right:0 !important;}',
    '    .hide-m{display:none !important;}',
    '    .kpi{display:block !important;width:100% !important;box-sizing:border-box !important;}',
    '    .kpiv{font-size:26px !important;line-height:30px !important;}',
    '    .dtq2{border-top:14px solid #FFFFFF !important;}',
    '    .dimg{width:100% !important;max-width:100% !important;height:auto !important;}',
    '    .ctat{display:block !important;width:100% !important;box-sizing:border-box !important;padding:18px 20px 0 20px !important;}',
    '    .ctab{display:block !important;width:100% !important;box-sizing:border-box !important;padding:14px 20px 20px 20px !important;text-align:left !important;}',
    '    .btn{width:100% !important;max-width:100% !important;}',
    '    .btn a{white-space:normal !important;}',
    '    .h1{font-size:26px !important;line-height:30px !important;}',
    '    .selo{float:none !important;margin-top:12px !important;}',
    '    .al-l{text-align:left !important;}',
    '  }',
    '{{css_escuro}}',
    '</style>',
    '</head>',
    '<body class="dm-lisboa" style="margin:0;padding:0;background:{{cor.lisboa}};" bgcolor="{{cor.lisboa}}">',
    '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;mso-line-height-rule:exactly;color:{{cor.lisboa}};">{{previa}}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>',
    '<table role="presentation" class="dm-lisboa" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{{cor.lisboa}}" style="background:{{cor.lisboa}};"><tr><td align="center" style="padding:24px 0;">',
    '<!--[if mso]><table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->',
    '<table role="presentation" class="container dm-branco-bg" width="680" cellpadding="0" cellspacing="0" border="0" bgcolor="{{cor.branco}}" style="width:680px;max-width:680px;background:{{cor.branco}};">',
    '',
    '  <!-- CABEÇALHO: identidade, período e a frase do mês (contexto) -->',
    '  <tr><td class="px dm-marca-bg" bgcolor="{{cor.marca}}" style="background:{{cor.marca}};padding:22px 40px 26px 40px;">',
    '    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>',
    '      <td class="col" valign="middle">',
    '        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>',
    '          {{#logo}}<td valign="middle" style="padding-right:14px;"><img src="{{src}}" width="{{w}}" alt="Santander" style="display:block;border:0;width:{{w}}px;height:auto;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#FFFFFF;"></td>{{/logo}}',
    '          <td valign="middle" style="{{#logo}}padding-left:14px;border-left:1px solid #FFFFFF;{{/logo}}"><p class="ft dm-txt-branco" style="margin:0;font-family:{{ft}};font-size:19px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;">Creative Strategy PF</p></td>',
    '        </tr></table>',
    '      </td>',
    '      <td class="col al-l" valign="middle" align="right"><table role="presentation" class="selo" align="right" cellpadding="0" cellspacing="0" border="0"><tr><td class="dm-branco-bg" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:6px 12px;"><p class="fx dm-txt-marca" style="margin:0;font-family:{{fx}};font-size:9px;line-height:12px;mso-line-height-rule:exactly;font-weight:bold;color:{{cor.marca}};letter-spacing:1.5px;">REPORT MENSAL{{#periodo}}&nbsp;&nbsp;·&nbsp;&nbsp;{{periodo}}{{/periodo}}</p></td></tr></table></td>',
    '    </tr>',
    '    <tr><td colspan="2" style="padding:16px 0 18px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="dm-branco-bg" height="1" bgcolor="#FFFFFF" style="height:1px;background:#FFFFFF;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>',
    '    <tr><td colspan="2">',
    '      <p class="ft h1 dm-txt-branco" style="margin:0;font-family:{{fti}};font-size:32px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:-0.8px;">{{frase}}{{#frase_final}}<br><span style="font-weight:normal;">{{frase_final}}</span>{{/frase_final}}</p>',
    '      <p class="fx dm-txt-branco" style="margin:10px 0 0 0;font-family:{{fx}};font-size:13px;line-height:19px;mso-line-height-rule:exactly;color:#FFFFFF;">{{intro}}</p>',
    '    </td></tr></table>',
    '  </td></tr>',
    '',
    '  {{#tem_destaques}}',
    '  <!-- DESTAQUES DO MÊS: até 4, escolhidos no emulador (indicador, campanha, aprendizado, informação nova), com imagem opcional.',
    '       Em pares (290 + 20 + 290); com número ímpar, o primeiro ocupa a largura toda. No celular, um embaixo do outro. -->',
    '  <tr><td class="px" style="padding:26px 40px 20px 40px;">',
    '    <p class="fx dm-txt-turquesa" style="margin:0;font-family:{{fx}};font-size:10px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;color:{{cor.turquesa}};letter-spacing:2px;">DESTAQUES DO MÊS{{#campanha_unica}} · {{campanha_unica}}{{/campanha_unica}}</p>',
    '    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">',
    '      {{#linhas}}{{^primeira}}<tr><td colspan="3" height="20" style="height:20px;"></td></tr>{{/primeira}}<tr>',
    '        {{#cards}}{{^primeiro}}<td class="hide-m" width="20" style="width:20px;"></td>{{/primeiro}}',
    '        <!-- o fundo fica na célula: os dois cartões da linha têm a mesma altura (também no Outlook) -->',
    '        <td class="col kpi dtq dm-lisboa{{^primeiro}} dtq2{{/primeiro}}"{{#largo}} colspan="3"{{/largo}} width="{{w}}" valign="top" bgcolor="{{cor.lisboa}}" style="width:{{w}}px;background:{{cor.lisboa}};">',
    '          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">',
    '            {{#img_topo}}<tr><td colspan="2" style="font-size:0;line-height:0;"><img src="{{src}}" width="{{w}}"{{#h}} height="{{h}}"{{/h}} alt="{{alt}}" class="dimg" style="display:block;border:0;width:{{w}}px;max-width:100%;height:auto;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{{cor.apoio}};"></td></tr>{{/img_topo}}',
    '            <tr>',
    '              {{#img_lado}}<td class="col" width="{{w}}" valign="top" style="width:{{w}}px;font-size:0;line-height:0;"><img src="{{src}}" width="{{w}}"{{#h}} height="{{h}}"{{/h}} alt="{{alt}}" class="dimg" style="display:block;border:0;width:{{w}}px;max-width:100%;height:auto;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{{cor.apoio}};"></td>{{/img_lado}}',
    '              <td class="col" valign="top" style="padding:16px 18px 18px 18px;">',
    '                {{#grupo}}<p class="fx dm-txt-{{dm_grupo}}" style="margin:0 0 6px 0;font-family:{{fx}};font-size:9px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;color:{{cor_grupo}};letter-spacing:1.5px;">{{grupo}}</p>{{/grupo}}',
    '                {{#valor}}<p class="ft kpiv dm-txt-{{dm_valor}}" style="margin:0;font-family:{{ft}};font-size:30px;line-height:34px;mso-line-height-rule:exactly;font-weight:bold;color:{{cor_valor}};white-space:nowrap;letter-spacing:-0.5px;">{{valor}}</p>{{/valor}}',
    /* leitura em ordem (4.13): número → o que é (título) → etiqueta colorida com a referência embaixo; sem número, a etiqueta (status) fica no fim */
    '                {{#titulo}}<p class="ft dm-txt-{{dm_titulo}}" style="margin:{{#valor}}4px{{/valor}}{{^valor}}0{{/valor}} 0 0 0;font-family:{{ft}};font-size:16px;line-height:21px;mso-line-height-rule:exactly;font-weight:bold;color:{{cor_titulo}};">{{titulo}}</p>{{/titulo}}',
    '                {{#valor}}{{#etiqueta}}<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:8px;">{{etiqueta}}</td></tr></table>{{/etiqueta}}{{/valor}}',
    '                {{#texto}}<p class="fx dm-txt-{{dm_texto}}" style="margin:4px 0 0 0;font-family:{{fx}};font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:{{cor_texto}};">{{texto}}</p>{{/texto}}',
    '                {{^valor}}{{#etiqueta}}<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:8px;">{{etiqueta}}</td></tr></table>{{/etiqueta}}{{/valor}}',
    '                {{#link}}<p class="fx" style="margin:10px 0 0 0;font-family:{{fx}};font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;"><a class="fx dm-txt-marca" href="{{link}}" target="_blank" style="color:{{cor.marca}};font-family:{{fx}};text-decoration:none;">{{link_texto}}&nbsp;&#8594;</a></p>{{/link}}',
    '              </td>',
    '            </tr>',
    '          </table>',
    '        </td>{{/cards}}',
    '      </tr>{{/linhas}}',
    '    </table>',
    '  </td></tr>',
    '  {{/tem_destaques}}',
    '',
    '  <!-- CHAMADA PRINCIPAL: o único link do e-mail -->',
    '  <tr><td class="px" style="padding:{{#tem_destaques}}6px{{/tem_destaques}}{{^tem_destaques}}26px{{/tem_destaques}} 40px 28px 40px;">',
    '    <table role="presentation" class="dm-rio" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{{cor.rio}}" style="background:{{cor.rio}};"><tr>',
    '      <td class="ctat" valign="middle" style="padding:20px 0 20px 26px;">',
    '        <p class="ft dm-txt-marca" style="margin:0;font-family:{{ft}};font-size:19px;line-height:24px;mso-line-height-rule:exactly;font-weight:bold;color:{{cor.marca}};">{{cta_titulo}}</p>',
    '        <p class="fx dm-txt-texto" style="margin:4px 0 0 0;font-family:{{fx}};font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:{{cor.texto}};">{{cta_texto}}</p>',
    '      </td>',
    '      <td class="ctab" width="{{botao_w}}" valign="middle" align="right" style="width:{{botao_w}}px;padding:20px 26px 20px 16px;white-space:nowrap;">{{botao_html}}</td>',
    '    </tr></table>',
    '  </td></tr>',
    '',
    '  <!-- ASSINATURA: Vermelho Santander, chama no canto inferior direito (Brand Guide 3.10) -->',
    '  <tr><td class="px dm-marca-bg" bgcolor="{{cor.marca}}" style="background:{{cor.marca}};padding:18px 40px 20px 40px;">',
    '    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>',
    '      <td valign="middle" style="padding-right:16px;">',
    '        <p class="ft dm-txt-branco" style="margin:0;font-family:{{ft}};font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;">Creative Strategy PF</p>',
    '        <p class="fx dm-txt-branco" style="margin:2px 0 0 0;font-family:{{fx}};font-size:9px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:1.5px;">CUSTOMER INTERACTIONS&nbsp;&nbsp;·&nbsp;&nbsp;RESUMO DO REPORT MENSAL{{#contato}}&nbsp;&nbsp;·&nbsp;&nbsp;{{contato}}{{/contato}}</p>',
    '      </td>',
    '      {{#logo}}<td valign="middle" align="right" width="{{w}}"><img src="{{src}}" width="{{w}}" alt="Santander" style="display:block;border:0;width:{{w}}px;height:auto;margin-left:auto;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#FFFFFF;"></td>{{/logo}}',
    '    </tr></table>',
    '  </td></tr>',
    '</table>',
    '<!--[if mso]></td></tr></table><![endif]-->',
    '</td></tr></table>',
    '</body>',
    '</html>'
  ].join("\n");

  /* Modo escuro (4.12): o e-mail-resumo mantém as cores aprovadas (fundo Lisboa, cartão branco, faixas e botão em
     Vermelho Santander com texto branco, indicadores, etiquetas e bordas). Cada elemento colorido tem uma classe dm-…
     e a cor dela é reafirmada (!important) onde o programa de e-mail deixa: no modo escuro do sistema (Apple Mail,
     Outlook para Mac, iOS e Android, que leem prefers-color-scheme) e no Outlook.com / novo Outlook para Windows
     (que marcam o que recoloriram com data-ogsc / data-ogsb). O "light only" do cabeçalho já pede ao Apple Mail para
     não inverter. O Outlook clássico para Windows não aceita nenhum desses recursos: lá vale o botão do próprio
     Outlook para trocar o fundo da mensagem (docs/EMULADOR.md). */
  var DM_FUNDOS = { "dm-lisboa": CR.lisboa, "dm-rio": CR.rio, "dm-branco-bg": CR.branco, "dm-marca-bg": CR.marca, "dm-chip-verde": CR.positivo_fundo, "dm-chip-ambar": CR.atencao_fundo };
  var DM_TEXTOS = { "dm-txt-branco": CR.branco, "dm-txt-marca": CR.marca, "dm-txt-texto": CR.texto, "dm-txt-apoio": CR.apoio, "dm-txt-turquesa": CR.turquesa, "dm-txt-rosa": CR.rosa, "dm-chip-verde": CR.positivo, "dm-chip-ambar": CR.atencao };
  var DM_BORDAS = { "dm-borda-marca": CR.marca, "dm-borda-texto": CR.texto };
  var CSS_ESCURO = (function () {
    function regras(mapa, prop, sel) {
      return Object.keys(mapa).map(function (c) {
        var v = mapa[c], d = prop === "bg" ? "background:" + v + " !important;background-color:" + v + " !important;" : prop === "cor" ? "color:" + v + " !important;" : "border-color:" + v + " !important;";
        return "  " + sel(c) + "{" + d + "}";
      });
    }
    function solto(c) { return "." + c; }
    function ogs(at) { return function (c) { return at.map(function (a) { return "[" + a + "] ." + c + ",." + c + "[" + a + "]"; }).join(","); }; }
    return ["  @media (prefers-color-scheme:dark){"].concat(regras(DM_FUNDOS, "bg", solto), regras(DM_TEXTOS, "cor", solto), regras(DM_BORDAS, "borda", solto), ["  }"],
      regras(DM_FUNDOS, "bg", ogs(["data-ogsb", "data-ogab"])), regras(DM_TEXTOS, "cor", ogs(["data-ogsc", "data-ogac"])), regras(DM_BORDAS, "borda", ogs(["data-ogsc", "data-ogsb"]))).join("\n");
  })();

  /* Largura do botão (px), pelo tamanho do texto (Arial negrito 15px: ~8,6px por letra, mais a seta e a margem
     interna). A coluna do botão reserva esse espaço e o texto não quebra. */
  function larguraBotao(texto) { return Math.max(180, Math.round(texto.length * 8.6) + 56); }
  /* Botão do e-mail-resumo, o único link do e-mail: célula vermelha com o link no texto. Não usa VML (desenho do
     Outlook): ao enviar, o Outlook para Windows reescreve a mensagem e transforma o desenho em imagem sem link, e
     quem recebe não consegue clicar. Célula com fundo e link de texto passam pelo envio sem mudar. */
  function botaoResumo(link, texto, fx) {
    var w = larguraBotao(texto), t = esc(texto) + "&nbsp;&#8594;", l = esc(link);
    return '<table role="presentation" class="btn" width="' + w + '" cellpadding="0" cellspacing="0" border="0" style="width:' + w + 'px;"><tr>' +
      '<td class="dm-marca-bg" align="center" bgcolor="' + CR.marca + '" style="background:' + CR.marca + ';padding:13px 16px;">' +
      '<a class="cta fx dm-txt-branco" href="' + l + '" target="_blank" style="color:#FFFFFF;font-family:' + fx + ';font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;text-decoration:none;">' + t + "</a></td></tr></table>";
  }

  /*
   * emailResumo(html, { link, botao, indicadores: [chaves], assunto }) → { html, indicadores, candidatos, pendencias, temLink, dados } ou { erro }
   *   indicadores: as chaves escolhidas no emulador (até 3). Sem escolha: os números do projeto principal.
   *   Sem link, o botão vira um aviso ("FALTA O LINK") e o emulador não deixa baixar o .eml.
   */
  function emailResumo(html, op) {
    op = op || {};
    var lido = dadosDoResumo(html);
    if (lido.erro) return lido;
    var d = lido.d, ft = fonteDaClasse(html, "ft", "Arial, Helvetica, sans-serif"), fx = fonteDaClasse(html, "fx", "Arial, Helvetica, sans-serif");
    var fti = (/class="ft h1"[^>]*?font-family:([^;"]+)/.exec(html) || [])[1] || ft;
    var mso = (/<!--\[if mso\]>\s*<noscript>[\s\S]*?<!\[endif\]-->/.exec(html) || [""])[0];
    var cand = candidatosResumo(d), fraseMes = [d.frase, d.frase_final].join(" ");
    /* a escolha da pessoa (destaques); sem ela, os indicadores pedidos (como antes da 4.13); sem nada, a sugestão */
    var sugestao = sugerirDestaques(cand, fraseMes);
    var config = op.destaques && op.destaques.length ? op.destaques : op.indicadores && op.indicadores.length ? op.indicadores.map(function (k) { return { origem: k }; }) : sugestao;
    var rd = resolverDestaques(config, cand), sel = rd.lista, n = sel.length, lay = layoutDestaques(n);
    sel.forEach(function (x) { x.na_frase = x.tipo === "indicador" && repete(fraseMes, x); });
    var periodo = d.periodo, mesTxt = periodo ? periodo.charAt(0) + periodo.slice(1).toLocaleLowerCase("pt-BR") : "";
    var nomesTop = d.topicos.map(function (t) { return t.rotulo.toLocaleLowerCase("pt-BR"); });
    var partes = [d.tem.campanhas ? "as campanhas" : "", d.tem.aprendizados ? "os aprendizados" : "", d.tem.transformation ? "o Transformation Hub" : ""].concat(nomesTop, [d.tem.proximos ? "os próximos passos" : ""]).filter(Boolean);
    var lista = partes.length > 1 ? partes.slice(0, -1).join(", ") + " e " + partes[partes.length - 1] : partes[0] || "";
    var temVideo = /data-video="/.test(html) || /alt="Vídeo: /.test(html);
    /* qualquer link (o que executa código, não); sem link, no lugar do botão vai o aviso (e o .eml não é liberado) */
    var link = linkDoReport(op.link).url, txtBotao = op.botao || "Acessar report completo";
    var botao = link ? botaoResumo(link, txtBotao, fx) :
      '<span class="fx" style="display:inline-block;background:' + CR.atencao_fundo + ";color:" + CR.atencao + ";font-family:" + fx + ';font-size:12px;line-height:16px;font-weight:bold;padding:12px 18px;border:1px dashed ' + CR.atencao + ';">FALTA O LINK DO REPORT COMPLETO</span>';
    /* todos os cartões da mesma campanha (ex.: os 3 números do SMusic): o nome vai uma vez, no título da seção */
    var campanhaUnica = "";
    var m = {
      assunto: op.assunto || assuntoDoHtml(html), mso: seguro(mso), cor: CR, ft: ft, fx: fx, fti: fti,
      periodo: periodo, frase: d.frase, frase_final: d.frase_final,
      previa: "Resumo" + (mesTxt ? " de " + mesTxt : "") + ": " + [d.frase, d.frase_final].filter(Boolean).join(" "),
      intro: "Os destaques" + (mesTxt ? " de " + mesTxt : " do mês") + " em poucos segundos. O report completo traz todos os detalhes.",
      logo: d.logo && d.logo.src ? { src: d.logo.src, w: Math.min(d.logo.w || 32, 40) } : null,
      tem_destaques: n > 0,
      linhas: (function () {
        var cards = sel.map(function (x, i) {
          var l = lay[i], ind = x.tipo === "indicador", im = x.imagem, lado = !!(im && l.largo && im.posicao === "lado");
          /* o detalhe que só repete o valor e o título (ex.: "28 contas abertas" embaixo de 28 · Contas abertas) sai;
             o nome do projeto no alto do cartão também, se o título ou a frase do mês já o dizem */
          var texto = ind && x.texto && !x.novo && (repete(x.texto, x) || contemTexto(x.titulo, x.texto)) ? "" : x.texto;
          var grupo = x.grupo && !contemTexto(x.titulo + " " + texto + " " + (ind ? fraseMes : ""), x.grupo) ? maiusculas(x.grupo) : "";
          if (x.aprendizado) grupo = "O QUE APRENDEMOS" + (x.titulo !== "O que aprendemos" || !x.grupo ? "" : " · " + maiusculas(x.grupo));
          var img = im ? { src: im.src, w: lado ? DESTAQUE_IMG.lado[0] : l.w, h: im.h ? Math.round(im.h * (lado ? DESTAQUE_IMG.lado[0] : l.w) / (im.w || l.w)) : "", alt: im.alt || x.titulo } : null;
          return {
            primeiro: false, w: l.w, largo: l.largo, valor: ind ? x.valor : "", titulo: x.aprendizado && x.titulo === "O que aprendemos" ? "" : x.titulo, texto: texto,
            grupo: grupo, dm_grupo: x.aprendizado ? "rosa" : "turquesa", cor_grupo: x.aprendizado ? CR.rosa : CR.turquesa,
            dm_valor: i === 0 ? "marca" : "texto", cor_valor: i === 0 ? CR.marca : CR.texto,
            dm_titulo: ind ? "texto" : "marca", cor_titulo: ind ? CR.texto : CR.marca, mt_titulo: ind ? 6 : x.aprendizado ? 6 : 6,
            dm_texto: ind ? "apoio" : "texto", cor_texto: ind ? CR.apoio : CR.texto,
            etiqueta: etiquetaResumo(x.etiqueta, x.tom, fx), link: x.link, link_texto: x.link_texto,
            img_topo: img && !lado ? img : null, img_lado: img && lado ? img : null
          };
        }), linhas = [], k = 0;
        var gs = cards.map(function (c) { return c.dm_grupo === "turquesa" ? c.grupo : null; });
        if (cards.length > 1 && gs[0] && gs.every(function (g) { return g === gs[0]; })) { campanhaUnica = gs[0]; cards.forEach(function (c) { c.grupo = ""; }); }
        while (k < cards.length) {
          var lin = cards[k].largo ? [cards[k]] : cards.slice(k, k + 2);
          lin.forEach(function (c2, j) { c2.primeiro = j === 0; });
          linhas.push({ cards: lin, primeira: !linhas.length }); k += lin.length;
        }
        return linhas;
      })(),
      campanha_unica: campanhaUnica,
      cta_titulo: op.titulo || "Acesse o report completo.",
      cta_texto: op.chamada || ((lista ? lista.charAt(0).toUpperCase() + lista.slice(1) : "Todas as seções") + ", com as peças" + (temVideo ? " e os vídeos" : "") + "."),
      botao_html: seguro(botao), css_escuro: seguro(CSS_ESCURO), botao_w: link ? larguraBotao(txtBotao) : 260, contato: ""
    };
    var out = aplicar(RESUMO_TPL, m).replace(/\n[ \t]*\n(\s*\n)+/g, "\n\n");
    var escolha = sel.filter(function (x) { return x.tipo === "indicador" && !x.novo; }).map(function (x) { return x.origem; });
    return { html: out, destaques: sel, fora: rd.fora, sugestao: sugestao, candidatos: cand, indicadores: escolha, repetidos: sel.filter(function (x) { return x.na_frase; }),
      pendencias: lido.pendencias, temVideo: temVideo, temLink: !!link, dados: d };
  }


  /* =================================================================== */
  /* 13. EDITOR NO NAVEGADOR: importar conteúdo (ex.: resposta do Copilot) */
  /* =================================================================== */
  /*
   * importarDados(texto) → { campos: { "numero-1.valor": { texto, tipo, tom } … }, lidos, problemas }
   *   Lê um texto no formato do arquivo de dados ("[NUMERO 1]" + "valor: 12,5%") e traduz cada campo para
   *   a marca data-campo da página, já no formato que a página mostra (▲/▼ na variação, ●/○ no status,
   *   mês em maiúsculas). O editor do emulador aplica esses campos na página aberta.
   */
  var IMPORTA = {
    "ABERTURA": { frase: "frase", frase_final: "frase_final" },
    "PROJETO PRINCIPAL": { rotulo: "principal.rotulo", nome: "principal.nome", resumo: "principal.resumo", aprendizado: "principal.aprendizado" },
    "LANCAMOS": { titulo: "lancamos.titulo" },
    "DESTAQUE": { categoria: "destaque.categoria", titulo: "destaque.titulo", texto: "destaque.texto", nota: "destaque.nota", aprendizado: "destaque.aprendizado" },
    "CREATIVE X": { subtitulo: "cx.subtitulo", rotulo: "cx.rotulo", anterior: "cx.anterior", atual: "cx.atual", variacao: "cx.variacao", periodo: "cx.periodo", referencia: "cx.referencia", significado: "cx.significado", nota: "cx.nota" },
    "CREATIVE X TRIMESTRE": { rotulo: "cxt.rotulo", titulo: "cxt.titulo", texto: "cxt.texto", estimativa: "cxt.estimativa" },
    "TRANSFORMATION": { titulo: "transformation.titulo" },
    "FOCO": { prioridade: "foco.prioridade", texto: "foco.texto" }
  };
  var IMPORTA_LISTA = {
    "NUMERO": ["numero", ["valor", "titulo", "detalhe", "variacao"]], "RESULTADO": ["resultado", ["valor", "titulo", "detalhe", "variacao"]],
    "CREATIVE X TRIMESTRE": ["cxt", ["valor", "titulo", "detalhe", "variacao"]],
    "LANCAMENTO": ["lancamento", ["status", "nome", "texto", "aprendizado"]],
    "TRANSFORMATION": ["transformation", ["status", "nome", "texto", "resultado"]], "APRENDIZADO": ["aprendizado", ["titulo", "texto", "levamos"]], "AGENDA": ["agenda", ["data", "titulo", "detalhe"]]
  };
  TOPICOS.forEach(function (t) {
    IMPORTA[t[0]] = { rotulo: t[1] + ".rotulo", titulo: t[1] + ".titulo", texto: t[1] + ".texto" };
    IMPORTA_LISTA[t[0]] = [t[1], ["status", "nome", "texto", "valor"]];
  });
  function importarDados(texto) {
    var lido = ler(texto, "conteúdo colado"), campos = {}, problemas = lido.problemas.slice(), n = 0, secoes = { tirar: [], mostrar: [] };
    function poe(chave, valor, tipo, tom) { campos[chave] = { texto: valor, tipo: tipo || "texto", tom: tom || "" }; n++; }
    lido.ordem.forEach(function (k) {
      var b = lido.blocos[k], m = k.match(/^(.*?)\s+(\d+)$/), base = m ? m[1] : k, idx = m ? m[2] : "";
      var v = {}; Object.keys(b.campos).forEach(function (c) { v[c] = b.campos[c].valor; });
      if (base === "EDICAO" && !idx) {
        if (v.mes && v.ano) poe("periodo", maiusculas(v.mes + " " + v.ano));
        if (v.proximo_mes) { poe("foco.mes", maiusculas(v.proximo_mes)); poe("ate", "Até " + v.proximo_mes.toLocaleLowerCase("pt-BR") + "."); }
        if (v.contato) poe("contato", v.contato);
        return;
      }
      /* [SECOES] tirar: O que aprendemos, Também vem aí · mostrar: … (4.13): seções que a página tira ou volta a mostrar,
         pelo nome que aparece em "Seções do report". Quem aplica é o emulador. */
      if ((base === "SECOES" || base === "SEÇÕES") && !idx) {
        ["tirar", "mostrar"].forEach(function (c) { if (v[c]) String(v[c]).split(/\s*[,;|]\s*/).forEach(function (nome) { if (nome.trim()) secoes[c].push(nome.trim()); }); });
        return;
      }
      var mapa = !idx ? IMPORTA[base] : null, lista = idx ? IMPORTA_LISTA[base] : null;
      if (!mapa && !lista) { problemas.push({ nivel: "aviso", linha: b.linha, msg: RESUMO_SAIU.test(base) ? RESUMO_AVISO : "Bloco [" + b.nome + "] não existe na página e foi ignorado." }); return; }
      Object.keys(v).forEach(function (c) {
        var val = v[c]; if (!val) return;
        var chave = mapa ? mapa[c] : (lista[1].indexOf(c) >= 0 ? lista[0] + "-" + idx + "." + c : "");
        if (!chave) return;
        if (c === "variacao") {
          var desce = /^[-−]/.test(val), t = val.replace(/^[-−]\s*/, "");
          var tom = chaveCampo(v.variacao_cor || (chave === "cx.variacao" && desce ? "ambar" : "verde")) === "ambar" ? "ambar" : "verde";
          poe(chave, chave === "cx.variacao" ? (desce ? "−" : "") + t : (desce ? "▼ " + (/^\d/.test(t) ? "−" : "") : "▲ ") + t, "etiqueta", tom);
        } else if (c === "status") {
          var verde = chaveCampo(v.status_cor || "ambar") === "verde";
          poe(chave, (verde ? "● " : "○ ") + val, "etiqueta", verde ? "verde" : "ambar");
        } else if (c === "categoria") poe(chave, maiusculas(val).replace(/\s+·\s+/g, " · "));
        else if (c === "rotulo") poe(chave, maiusculas(val));
        else if (c === "valor" || c === "anterior" || c === "atual") poe(chave, val.replace(/^-\s*/, "−"));
        else if (c === "data" && base === "AGENDA") poe(chave, maiusculas(val));
        else poe(chave, val);
      });
    });
    return { campos: campos, lidos: n, problemas: problemas, secoes: secoes };
  }
  /* Nome de arquivo sugerido para a página editada, a partir do período (ex.: "OUTUBRO 2026"). */
  function nomeDoReport(periodo) {
    var m = /^\s*([^\d]+?)\s+(\d{4})\s*$/.exec(String(periodo || "")), n = m ? mesNumero(m[1].trim()) : 0;
    return n ? "report-" + m[2] + "-" + String(n).padStart(2, "0") + ".html" : "report.html";
  }

  return {
    VERSAO: VERSAO, ler: ler, montar: montar, aplicar: aplicar, conferirLink: conferirLink, conferirHtml: conferirHtml,
    gerarEml: gerarEml, trocarImagens: trocarImagens, trocarVideos: trocarVideos, trocarAnexos: trocarAnexos, semComentarios: semComentarios, paraEmail: paraEmail, paraNavegador: paraNavegador,
    base64: base64, utf8: utf8, zip: zip, crc32: crc32, assuntoMime: assuntoMime, tipoMime: tipoMime,
    limparHtmlEditado: limparHtmlEditado, imagensDoHtml: imagensDoHtml, origemImagem: origemImagem, deBase64: deBase64,
    imagemDeDataUri: imagemDeDataUri, trocarSrc: trocarSrc, assuntoDoHtml: assuntoDoHtml, textoDoHtml: textoDoHtml, origemDoHtml: origemDoHtml,
    SECOES: SECOES, SECOES_RESUMO: SECOES_RESUMO, secoesDoHtml: secoesDoHtml, emailResumido: emailResumido, ligarVideos: ligarVideos, paginaInterativa: paginaInterativa, miniaturasSemPlay: miniaturasSemPlay,
    RESUMO_REGRAS: RESUMO_REGRAS, ICONE_TAG: ICONE_TAG, CSS_CELULAR: CSS_CELULAR, xDeExemplo: xDeExemplo, TOPICOS: TOPICOS, LAYOUTS_TOPICO: LAYOUTS_TOPICO, importarDados: importarDados, normalizarLink: normalizarLink, linkDoReport: linkDoReport, nomeDoReport: nomeDoReport, renumerarSecoes: renumerarSecoes, conferirLinkSimples: function (u) { return conferirLink(u, "projeto", []); }, dadosDoResumo: dadosDoResumo, emailResumo: emailResumo, htmlAprendizado: htmlAprendizado, candidatosResumo: candidatosResumo, sugerirDestaques: sugerirDestaques, resolverDestaques: resolverDestaques, layoutDestaques: layoutDestaques, tamanhoImagemDestaque: tamanhoImagemDestaque, DESTAQUE_IMG: DESTAQUE_IMG, elementosComCampo: elementosComCampo,
    CTA: CTA, ESQUEMA_DADOS: ESQUEMA_DADOS, ESQUEMA_MARCA: ESQUEMA_MARCA, seguro: seguro, texto: textoSeguro
  };
});
