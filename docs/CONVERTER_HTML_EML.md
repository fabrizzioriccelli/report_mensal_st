# Converter a página do mês em e-mail (.eml): completo, resumido e versão interativa

A página `converter-html-eml.html` lê a página do mês (`.html`, editada ou não no navegador) e gera, **de uma vez**:

| Arquivo | O que é | Para onde vai |
|---|---|---|
| **E-mail completo** (`.eml`) | O report inteiro | Outlook |
| **E-mail resumido** (`-resumido.eml`) | Só o essencial e um botão **"Ver o report completo (interativo)"** | Outlook |
| **Versão interativa** (`-interativo.html`) | O report inteiro, com os vídeos tocando e as peças abrindo maiores no clique | SharePoint (é para lá que o botão leva) |

Por que três arquivos: nenhum e-mail roda vídeo ou script (o Outlook bloqueia por segurança). O e-mail leva a mensagem para todo mundo; a versão interativa fica a um clique.

> O caminho normal continua sendo editar `dados/AAAA-MM.txt` e gerar pelo `gerar-report.html`.
> Edições feitas no navegador **não voltam** para o arquivo de dados: passe as mesmas mudanças para lá, senão elas somem quando o report for gerado de novo.

## 1. Editar no navegador (opcional)

1. Abra a página do mês (`.html`) no Chrome ou no Edge.
2. **Textos:** aperte **F12**, aba **Console**, digite `document.designMode = "on"` e Enter. Feche o F12 e clique no texto que quer mudar.
3. **Código (Inspecionar):** botão direito no ponto da página → **Inspecionar**. No painel, botão direito no elemento → **Edit as HTML**.
4. Salve com **Ctrl+S** → tipo **"Página da Web, completa"** (pode salvar por cima do mesmo arquivo). "Somente HTML" **perde as edições**.

## 2. Prints no Transformation Hub

### Pelo arquivo de dados (o jeito normal)

No bloco do projeto, em `dados/AAAA-MM.txt`:

```text
[TRANSFORMATION 1]
nome: Copy & Agent
texto: Em testes.
prints: print-copy-agent-1.png, print-copy-agent-2.png
descricao_prints: Tela do agente | Resultado do primeiro teste
```

- Até **3 prints** por projeto, na pasta do mês. Ficam abaixo do texto, na largura do cartão: 1 print = 504 px; 2 = 240 px cada; 3 = 152 px cada. No celular, um embaixo do outro.
- `descricao_prints`: o que cada print mostra, separados por `|`, na mesma ordem.
- Na página do mês e na versão interativa, o print abre inteiro e maior no clique.

### Pelo Inspecionar (direto no .html)

1. Coloque os prints (`.png` ou `.jpg`, nomes sem espaço) na **mesma pasta** do `.html`.
2. Abra o `.html` no Chrome, botão direito no projeto do Transformation Hub → **Inspecionar**. No painel, **Ctrl+F** e procure `transformation-1` (ou `-2`, `-3`): é o projeto 1, 2 ou 3.
3. Dentro dele, ache o último parágrafo do texto (`<p …>`), botão direito → **Edit as HTML**, vá até o fim e cole o bloco que o conversor oferece em **"Como colocar prints no HTML"** (botão **Copiar o bloco**, para 1, 2 ou 3 prints). Troque `NOME-DO-PRINT-1.png` pelo nome do arquivo e `DESCREVA O PRINT 1` pela descrição.
4. Salve (Ctrl+S, "Página da Web, completa").
5. No conversor, escolha o `.html` e, no passo 1, **Escolher a pasta das imagens** (a pasta onde estão os prints).

O bloco para 1 print fica assim (largura 420 px, a coluna do texto):

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr>
  <td class="col" width="420" valign="top" style="width:420px;"><img src="NOME-DO-PRINT-1.png" width="420" alt="DESCREVA O PRINT 1" data-ampliar="" data-legenda="DESCREVA O PRINT 1" class="fluid" style="display:block;border:1px solid #F5DECF;width:420px;height:auto;border-radius:12px;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#5F5F5F;"></td>
</tr></table>
```

O que cada parte faz:
- **tabela:** é o que funciona no Outlook (ele ignora layout moderno);
- **`class="fluid"`:** no celular, o print ocupa a largura da tela;
- **`data-ampliar=""`:** na versão interativa, abre maior no clique. O e-mail tira esse atributo sozinho;
- **borda `#F5DECF` e cantos de 12 px:** são as cores e o raio do Transformation Hub (guia da marca).

O conversor reduz prints grandes para 1200 px de largura, coloca-os como anexo nos e-mails e os embute na versão interativa. Por isso o arquivo sobe sozinho para o SharePoint.

## 3. Gerar os e-mails

1. Abra `converter-html-eml.html` (dois cliques) e escolha o `.html` do mês. Ou arraste o arquivo para a página.
2. **E-mail completo:** sai na hora → **Baixar e-mail completo (.eml)**.
3. **E-mail resumido:**
   1. Marque as seções que vão nele. O padrão é capa e números, resumo das campanhas, foco do próximo mês e encerramento.
   2. Clique em **Baixar versão interativa (.html)** e suba o arquivo numa pasta do SharePoint (ou OneDrive) que o público do e-mail consiga abrir.
   3. Copie o **link de compartilhamento** e cole em **Link da versão interativa**. O resumido se monta sozinho → **Baixar e-mail resumido (.eml)**.
4. Confira as prévias (**E-mail completo** / **E-mail resumido**, no computador e no celular) e o **Assunto**.

No e-mail resumido:
- o bloco **"Este e-mail é o resumo do mês"** fica antes do encerramento. Ele lista o que está só na versão completa e tem o botão (funciona no Outlook);
- as etiquetas das seções são renumeradas (01, 02…);
- **a miniatura do vídeo aparece sem ▶ e sem link**. É só a imagem, para não dar a entender que o vídeo toca ali; ele só toca na versão interativa;
- quer o botão também no completo? Marque **"Pôr o botão também no e-mail completo"**.

Na versão interativa, cada vídeo ganha, abaixo da miniatura, o botão **"▶ Assistir ao vídeo"**, que abre o vídeo por cima do report.

> **SharePoint e arquivos .html:** em muitos SharePoint, por segurança da Microsoft, o `.html` **baixa** em vez de abrir direto no navegador. Quem clicar abre o arquivo baixado (Chrome ou Edge) e ele funciona igual, com vídeo e ampliação. Teste o link com uma pessoa de outra equipe antes do envio geral.

A página precisa ter sido gerada pela **versão 4.0** ou mais nova: ela marca as seções e guarda a miniatura do vídeo sem ▶. Se o conversor avisar, gere a página de novo pelo `gerar-report.html`.

## 4. Status (tempo real)

| Etapa | O que acontece |
|---|---|
| Ler o arquivo | Lê o `.html` (nome e tamanho) |
| Reconhecer o report | Versão da ferramenta e arquivo de dados que geraram a página |
| Tirar o que o e-mail não aceita | Remove script, janela de ampliação, vídeo, botão "Assistir ao vídeo", marcas do clique e da edição. Lista o que saiu |
| Escolher as seções do resumido | Quais seções ficam, quais vão só para a versão completa, miniaturas de vídeo sem ▶, link do botão |
| Colocar as imagens dentro dos e-mails | Cada imagem vira anexo embutido (`cid:`), com contador "Imagem 3 de 11"; prints grandes são reduzidos |
| Montar o e-mail completo / resumido | Conferência do Outlook e tamanho final de cada um |
| Preparar a versão interativa | O arquivo para o SharePoint, com os prints embutidos |

✓ = pronto · ! = ponto para olhar (deixa baixar) · ✕ = problema (não deixa baixar).

## 5. Acompanhar o arquivo

Com **Acompanhar o arquivo** marcado (Chrome ou Edge, arquivo escolhido pelo botão ou arrastado), a página confere o arquivo a cada 1,5 s.
Ela converte sozinha quando você salva o `.html` de novo, ou quando muda as seções, o link ou o texto do botão. O ponto verde mostra a hora da última versão salva.
Deixe a página editada numa aba e o conversor em outra: edite, Ctrl+S, volte e baixe.

Também funciona por um endereço local: na pasta do projeto, rode `python -m http.server 8000` e abra `http://localhost:8000/converter-html-eml.html`.

## Problemas comuns

| Status | O que fazer |
|---|---|
| "Faltam N imagens que estão em arquivo ao lado do .html" | **Escolher a pasta das imagens** (passo 1): a pasta dos prints ou a que o Chrome cria ao salvar (`_files`/`_arquivos`) |
| "Para o resumido, falta o link" | Baixe a versão interativa, suba no SharePoint e cole o link |
| "miniatura(s) de vídeo continuam com ▶" | A página é de antes da 4.0: gere de novo pelo `gerar-report.html` |
| "não tem as marcas de seção" | A página é de antes da 3.9: gere de novo pelo `gerar-report.html` |
| "endereço temporário da prévia (blob:)" | Você salvou a prévia da página de geração. Baixe a página pelo botão **Baixar página do mês (.html)** |
| "Acima de 10 MB" | Alguma imagem grande entrou. Troque por uma menor |
| "vem da internet" | A imagem fica como link; o Outlook pode pedir para baixar as imagens |
