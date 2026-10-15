# Converter uma página editada no navegador em e-mail (.eml)

Use quando você ajustou o report **direto no Chrome ou no Edge** e quer enviar essa versão por e-mail.
A página `converter-html-eml.html` lê o `.html` salvo e gera o `.eml` que o Outlook abre como mensagem nova.
Nada é enviado para a internet: a página só lê o arquivo que você escolher.

> O caminho normal continua sendo editar `dados/AAAA-MM.txt` e gerar pelo `gerar-report.html`.
> Edições feitas no navegador **não voltam** para o arquivo de dados: passe as mesmas mudanças para lá, senão elas somem quando o report for gerado de novo.

## 1. Editar no navegador

1. Abra a página do mês (`.html`) no Chrome ou no Edge.
2. Para editar os textos clicando neles: aperte **F12**, vá na aba **Console**, digite `document.designMode = "on"` e Enter. Feche o F12 e clique no texto que quer mudar.
3. Salve com **Ctrl+S** → tipo **"Página da Web, completa"**. Pode salvar por cima do mesmo arquivo.
   - "Página da Web, somente HTML" **perde as edições** (salva o arquivo original).

## 2. Converter

1. Abra `converter-html-eml.html` (dois cliques, na pasta do projeto).
   - Também funciona por um endereço local: na pasta do projeto, rode `python -m http.server 8000` e abra `http://localhost:8000/converter-html-eml.html`.
2. Clique em **Escolher o arquivo .html** (ou arraste o arquivo para a página).
3. Acompanhe o **Status**: cada etapa mostra o que está fazendo, em tempo real, com o tempo gasto:

| Etapa | O que acontece |
|---|---|
| Ler o arquivo | Lê o `.html` (mostra nome e tamanho) |
| Reconhecer o report | Mostra a versão da ferramenta e o arquivo de dados que geraram a página |
| Tirar o que o e-mail não aceita | Remove script, janela de ampliação, vídeo, marcas do clique e da edição. Lista o que saiu |
| Colocar as imagens dentro do e-mail | Cada imagem vira anexo embutido (`cid:`), com contador "Imagem 3 de 11" |
| Conferir para o Outlook | As mesmas regras da página de geração (sem flex/grid, tamanho do HTML…) |
| Montar o .eml | Tamanho final da mensagem |

   ✓ = pronto · ! = ponto para olhar (deixa baixar) · ✕ = problema (não deixa baixar).
4. Confira a **Prévia do e-mail** (Computador e Celular) e o **Assunto** (vem do título da página).
5. Clique em **Baixar e-mail (.eml)** e abra na pasta Downloads. Envie primeiro só para você.

## 3. Acompanhar o arquivo (tempo real)

Com **Acompanhar o arquivo** marcado (Chrome ou Edge, arquivo escolhido pelo botão ou arrastado), a página confere o arquivo a cada 1,5 s.
Quando você salvar o `.html` de novo, ela converte sozinha a versão nova; o ponto verde e a linha "Acompanhando…" mostram a hora da última versão salva.
Abra a página editada numa aba e o conversor em outra: edite, Ctrl+S, volte e baixe o `.eml` atualizado.

## Problemas comuns

| Status | O que fazer |
|---|---|
| "Faltam N imagens que o Chrome salvou numa pasta ao lado" | Clique em **Escolher a pasta das imagens** e escolha a pasta criada ao lado do `.html` (nome terminando em `_files` ou `_arquivos`) |
| "endereço temporário da prévia (blob:)" | Você salvou a prévia da página de geração. Baixe a página pelo botão **Baixar página do mês (.html)** e edite essa |
| "Não achei a marca da ferramenta" | O arquivo não foi gerado pelo `gerar-report.html`. A conversão segue; confira a prévia com atenção |
| "E-mail com mais de 10 MB" | Alguma imagem grande entrou na edição. Troque por uma menor ou gere pelo `gerar-report.html` |
| "vem da internet" | A imagem fica como link; o Outlook pode pedir para baixar as imagens |

O vídeo e a ampliação das peças não vão para o e-mail (nenhum cliente de e-mail roda script): no e-mail fica a miniatura com ▶, que abre o `link` da peça.
