# Gerando e enviando o .eml

## O que é um .eml

Um `.eml` é **uma mensagem de e-mail inteira salva num único arquivo de texto**, no formato padrão da internet (MIME, RFC 5322). Ele contém o assunto, o corpo em HTML e os anexos. O Outlook, o Windows Mail e o Thunderbird abrem esse formato.

O `.eml` gerado aqui leva o cabeçalho `X-Unsent: 1`. Com ele, o Outlook clássico para Windows abre o arquivo **como mensagem nova, pronta para enviar**, e não como um e-mail recebido.

## Como o HTML entra no .eml

A ferramenta `tools/gerar-eml.html` monta o arquivo assim:

```
X-Unsent: 1
Subject: Creative Strategy PF | Report de Setembro 2026
MIME-Version: 1.0
Content-Type: multipart/related; boundary="..."; type="text/html"

--boundary
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: base64
(o HTML do report, sem os comentários de edição)

--boundary
Content-Type: image/jpeg; name="img01-formiga.jpg"
Content-ID: <img01-formiga.jpg@report>
Content-Disposition: inline; filename="img01-formiga.jpg"
(a imagem)

--boundary--
```

- O **assunto** vem do `<title>` do report.
- Os **comentários** (`EDITAR AQUI`, instruções) são removidos. Os comentários condicionais do Outlook (`<!--[if mso]>`) são mantidos, porque fazem parte do layout.
- Cada `<img src="../assets/...">` vira `<img src="cid:img01-...@report">`, apontando para a imagem anexada na mesma mensagem.

## Como os assets funcionam: anexada (CID) × hospedada × base64

| Forma | Como aparece no Outlook | Decisão |
|---|---|---|
| **Anexada inline (CID)** | A imagem viaja dentro do e-mail e aparece sem precisar de internet nem clicar em "Baixar imagens" | **Usada** |
| Hospedada num site público (`https://...`) | Bloqueada até a pessoa clicar em "Baixar imagens", conforme a política da empresa | Evitada |
| Hospedada no SharePoint/OneDrive | Geralmente **não aparece**: o Outlook não envia o login do SharePoint ao buscar a imagem | Evitada |
| Base64 dentro do HTML (`data:`) | Bloqueada no Outlook clássico para Windows | Evitada |

O custo da imagem anexada é o tamanho da mensagem. Por isso o limite recomendado é ~200 KB por imagem e ~3 MB no total; a ferramenta avisa quando passa.

## Links externos

- Links (`<a href="https://...">`) funcionam em todos os Outlooks. Em empresas com Microsoft 365, o **Safe Links** pode reescrever o endereço para verificação; isso é normal.
- Links de vídeo do **Stream** abrem no navegador, com o login da empresa. O vídeo precisa estar **compartilhado com o mesmo público** do e-mail.
- Link ainda não preenchido aparece como `#COLE-O-LINK-...`. Ele não leva a lugar nenhum, e a ferramenta lista todos antes do envio.

## Passo a passo

### 1. Gerar

1. Abra `tools/gerar-eml.html` no **Edge** ou **Chrome** (dois cliques).
2. Clique em **Selecionar pasta do projeto** e escolha a pasta principal (a que contém `reports/` e `assets/`). O navegador pode perguntar se você quer "carregar" os arquivos: confirme. Nada é enviado para a internet.
3. O report mais recente é selecionado sozinho. Troque no seletor, se quiser outro.
4. Leia a **conferência**:
   - **Pendências de conteúdo:** placeholders `[...]`, valores de exemplo (`00%`, `0.000`), caixas tracejadas e links vazios.
   - **Imagens:** cada arquivo usado, com o peso. Imagem não encontrada bloqueia a geração.
   - **Compatibilidade com Outlook:** script, vídeo, iframe, flex/grid, imagem de fundo, cores rgba, fonte externa, imagem sem `width` ou `alt`.
5. Confira a **prévia** (botões Computador/Celular).
6. Clique em **Baixar .eml**. O arquivo vai para a pasta Downloads com o nome do mês (`report-2026-10.eml`).

### 2. Abrir e enviar

**Outlook clássico para Windows** (o caminho principal):

1. Dê dois cliques no `.eml`.
2. Abre uma **mensagem nova** com o report no corpo e o assunto preenchido.
3. Preencha **Para** (de preferência a lista de distribuição da área) e envie.

**Novo Outlook para Windows / Outlook para Mac:** dependendo da versão, o `.eml` abre como **mensagem recebida** (só leitura). Nesse caso:

1. Clique em **Encaminhar**.
2. Apague o cabeçalho "De / Enviado / Para / Assunto" que o Outlook insere no topo.
3. Ajuste o assunto (tire o "ENC:") e envie.

O encaminhamento mantém o HTML e as imagens embutidas.

**Outlook na Web:** não abre `.eml` como rascunho. Gere e envie pelo Outlook do computador.

### 3. Testar antes do envio geral

1. Envie o primeiro só para você.
2. Abra o e-mail recebido no **Outlook do computador**, no **Outlook na Web** e no **celular**.
3. Clique em todos os links e vídeos, de preferência com alguém de fora do time.
4. Siga [TEST_CHECKLIST.md](TEST_CHECKLIST.md).

## Por que não colar o HTML direto no Outlook

O Outlook não tem campo para colar código HTML. Copiar a página aberta no navegador e colar na mensagem perde parte do layout (larguras, espaçamentos) e, no novo Outlook e no Outlook na Web, as imagens que estão no seu computador não vão junto. O `.eml` preserva o HTML exatamente como foi feito e leva as imagens dentro.

## Exemplo

[`examples/report-2026-09.eml`](../examples/report-2026-09.eml) foi gerado pela ferramenta a partir de `reports/2026-09.html`. A estrutura foi validada com um leitor de e-mail padrão (Python `email`):

- 1 parte HTML (UTF-8) + 4 imagens JPEG inline;
- todas as referências `cid:` do HTML têm a imagem correspondente, e nenhuma imagem sobra;
- nenhum comentário de edição e nenhum caminho local no HTML final.

Esse exemplo **não foi aberto num Outlook real** (este ambiente não tem Outlook). Faça o teste do passo 3 antes do primeiro envio.

## Possíveis problemas

| Problema | O que fazer |
|---|---|
| Dois cliques no `.eml` abrem outro programa | Clique com o botão direito → Abrir com → Outlook |
| O `.eml` abre como recebido, sem botão Enviar | Use **Encaminhar** (veja acima) |
| Imagens aparecem como anexos no rodapé, além do corpo | Alguns clientes listam imagens inline como anexos; o corpo continua certo |
| Imagem com um "x" vermelho | A imagem não foi embutida: gere o `.eml` de novo e confira a lista de imagens da ferramenta |
| Mensagem bloqueada por tamanho | Reduza as imagens (JPG, ~200 KB cada, no máximo ~3 MB no total) |
| Assunto com caracteres estranhos | Gere de novo; o assunto é codificado em UTF-8 pela ferramenta |
| A ferramenta não mostra nenhum report | A pasta escolhida não é a principal; escolha a que contém `reports/` |
