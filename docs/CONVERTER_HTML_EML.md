# Converter a página do mês em e-mail (.eml): resumido ou completo

A página `converter-html-eml.html` lê a página do mês (`.html`, editada ou não no navegador) e gera:

- o **e-mail resumido** (`.eml`): só o essencial e um botão **"Ver o report completo (interativo)"**;
- ou o **e-mail completo** (`.eml`), o report inteiro;
- a **versão interativa** (`.html`), com os vídeos tocando e as peças abrindo maiores no clique. É ela que vai para o SharePoint e é para lá que o botão leva.

Por que dois arquivos: nenhum e-mail roda vídeo ou script (o Outlook bloqueia por segurança). O e-mail leva a mensagem para todo mundo; a versão interativa fica a um clique.
Nada é enviado para a internet: a página só lê o arquivo que você escolher.

> O caminho normal continua sendo editar `dados/AAAA-MM.txt` e gerar pelo `gerar-report.html`.
> Edições feitas no navegador **não voltam** para o arquivo de dados: passe as mesmas mudanças para lá, senão elas somem quando o report for gerado de novo.

## 1. Editar no navegador (opcional)

1. Abra a página do mês (`.html`) no Chrome ou no Edge.
2. Para editar os textos clicando neles: aperte **F12**, vá na aba **Console**, digite `document.designMode = "on"` e Enter. Feche o F12 e clique no texto que quer mudar.
3. Salve com **Ctrl+S** → tipo **"Página da Web, completa"**. Pode salvar por cima do mesmo arquivo.
   - "Página da Web, somente HTML" **perde as edições** (salva o arquivo original).

## 2. E-mail resumido + versão interativa (recomendado)

1. Abra `converter-html-eml.html` e escolha o `.html` do mês (passo 1 da página).
2. Em **O que gerar**, deixe **E-mail resumido + versão interativa** e marque as seções que vão no e-mail. O padrão é capa e números, resumo das campanhas, foco do próximo mês e encerramento.
3. Clique em **Baixar versão interativa (.html)** e suba o arquivo numa pasta do SharePoint (ou OneDrive) que o público do e-mail consiga abrir.
4. Copie o **link de compartilhamento** e cole no campo **Link da versão interativa**. O e-mail se monta sozinho.
5. Confira a prévia e baixe o `.eml`.

No e-mail resumido:
- o bloco **"Este e-mail é o resumo do mês"** fica antes do encerramento, lista o que está só na versão completa e tem o botão (funciona no Outlook);
- as etiquetas das seções são renumeradas (01, 02…);
- a miniatura de vídeo sem link passa a abrir a versão interativa, onde o vídeo toca.

> **SharePoint e arquivos .html:** em muitos SharePoint, por segurança da Microsoft, o `.html` **baixa** em vez de abrir direto no navegador. Quem clicar abre o arquivo baixado (Chrome ou Edge) e ele funciona igual, com vídeo e ampliação. Teste o link com uma pessoa de outra equipe antes do envio geral.

O e-mail completo também pode ganhar o botão: escolha **E-mail completo** e preencha o link.

A página precisa ter sido gerada pela versão 3.9 ou mais nova (ela marca onde começa cada seção). Se o conversor avisar que faltam as marcas de seção, gere a página de novo pelo `gerar-report.html`.

## 3. Converter (passo a passo do status)

1. Abra `converter-html-eml.html` (dois cliques, na pasta do projeto).
   - Também funciona por um endereço local: na pasta do projeto, rode `python -m http.server 8000` e abra `http://localhost:8000/converter-html-eml.html`.
2. Clique em **Escolher o arquivo .html** (ou arraste o arquivo para a página).
3. Acompanhe o **Status**: cada etapa mostra o que está fazendo, em tempo real, com o tempo gasto:

| Etapa | O que acontece |
|---|---|
| Ler o arquivo | Lê o `.html` (mostra nome e tamanho) |
| Reconhecer o report | Mostra a versão da ferramenta e o arquivo de dados que geraram a página |
| Tirar o que o e-mail não aceita | Remove script, janela de ampliação, vídeo, marcas do clique e da edição. Lista o que saiu |
| Montar a versão do e-mail | Resumido: quais seções ficam, quais vão só para a versão interativa, e o botão com o link |
| Colocar as imagens dentro do e-mail | Cada imagem vira anexo embutido (`cid:`), com contador "Imagem 3 de 11" |
| Conferir para o Outlook | As mesmas regras da página de geração (sem flex/grid, tamanho do HTML…) |
| Montar o .eml | Tamanho final da mensagem |
| Preparar a versão interativa (.html) | O arquivo para subir no SharePoint, com vídeos e ampliação |

   ✓ = pronto · ! = ponto para olhar (deixa baixar) · ✕ = problema (não deixa baixar).
4. Confira a **Prévia do e-mail** (Computador e Celular) e o **Assunto** (vem do título da página).
5. Clique em **Baixar e-mail (.eml)** e abra na pasta Downloads. Envie primeiro só para você.

## 4. Acompanhar o arquivo (tempo real)

Com **Acompanhar o arquivo** marcado (Chrome ou Edge, arquivo escolhido pelo botão ou arrastado), a página confere o arquivo a cada 1,5 s.
Quando você salvar o `.html` de novo, ou mudar o tipo de e-mail, as seções, o link ou o texto do botão, ela converte sozinha; o ponto verde e a linha "Acompanhando…" mostram a hora da última versão salva.
Abra a página editada numa aba e o conversor em outra: edite, Ctrl+S, volte e baixe o `.eml` atualizado.

## Problemas comuns

| Status | O que fazer |
|---|---|
| "Faltam N imagens que o Chrome salvou numa pasta ao lado" | Clique em **Escolher a pasta das imagens** e escolha a pasta criada ao lado do `.html` (nome terminando em `_files` ou `_arquivos`) |
| "endereço temporário da prévia (blob:)" | Você salvou a prévia da página de geração. Baixe a página pelo botão **Baixar página do mês (.html)** e edite essa |
| "Não achei a marca da ferramenta" | O arquivo não foi gerado pelo `gerar-report.html`. A conversão segue; confira a prévia com atenção |
| "Falta só o link da versão interativa" | Baixe a versão interativa, suba no SharePoint e cole o link (seção 2) |
| "não tem as marcas de seção" | A página é de antes da versão 3.9: gere de novo pelo `gerar-report.html` |
| "E-mail com mais de 10 MB" | Alguma imagem grande entrou na edição. Troque por uma menor ou gere pelo `gerar-report.html` |
| "vem da internet" | A imagem fica como link; o Outlook pode pedir para baixar as imagens |

O vídeo e a ampliação das peças não vão para o e-mail (nenhum cliente de e-mail roda script): no e-mail fica a miniatura com ▶, que abre o `link` da peça.
