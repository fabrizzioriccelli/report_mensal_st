# Conversor (o "emulador"): e-mail-resumo, versão interativa e e-mail completo

A página `converter-html-eml.html` lê a página do mês (`.html`, editada ou não) e gera, **de uma vez**:

| Arquivo | O que é | Para onde vai |
|---|---|---|
| **E-mail-resumo** (`-resumo.eml`) | A **porta de entrada**: os destaques do mês em uma leitura rápida, estático, com **um único link** (o botão "Ver report completo") | Outlook (é o e-mail que a área recebe) |
| **Versão interativa** (`-interativo.html`) | O **report completo**: movimento ao rolar, vídeos que tocam, peças que abrem maiores | SharePoint (é para lá que o botão leva) |
| **E-mail completo** (`.eml`, opcional) | O report inteiro no corpo do e-mail | Outlook, só se precisar |

Por que assim: nenhum e-mail roda vídeo, animação ou script (o Outlook bloqueia por segurança). O e-mail desperta o interesse e dá o panorama; o HTML aprofunda.

> O conteúdo vem sempre de `dados/AAAA-MM.txt` (gerado pelo `gerar-report.html`). O conversor não pede para digitar nada de novo: o resumo sai da própria página.

## Passo a passo

1. Abra `converter-html-eml.html` (dois cliques, Chrome ou Edge). Não instala nada e nada sai do computador.
2. **Escolher o arquivo .html** → a página do mês (`reports/AAAA-MM.html`). Ou arraste o arquivo para a página.
3. **Baixar versão interativa (.html)** → suba no SharePoint numa pasta que o público do e-mail consiga abrir → **Copiar link**.
4. Cole em **Link do report completo**. Se o link já estiver no arquivo de dados (`[EDICAO] link_report_completo`), o campo vem preenchido ("Veio da página").
5. Confira o **Status** (✓ pronto · ! olhar · ✕ problema) e a **Prévia** → aba **E-mail-resumo** → **Computador** e **Celular**.
6. **Baixar e-mail-resumo (.eml)** → abra na pasta Downloads: o Outlook abre uma mensagem nova, com assunto e imagens. Envie primeiro só para você, clique no botão e confira se o report abre.

## O e-mail-resumo

Diagramação própria, na identidade do report (vermelho Santander, Lisboa, Rio, chama e formiguinha), em leitura vertical simples:

| Bloco | O que mostra |
|---|---|
| Abertura | Período, a frase do mês e uma linha de contexto |
| Visão geral | Projeto principal (nome, resumo e a imagem; vídeo vira só a miniatura, **sem ▶**) e os números do mês |
| Resultados e evolução | Creative X (anterior → atual, variação e barra) e o que foi bem / o que melhorar |
| Campanhas em destaque | O destaque do mês (com seus resultados) e os lançamentos, em lista |
| Aprendizados | Título, texto e "Levamos" |
| Em andamento | Os projetos do Transformation Hub, com o status (ex.: previsão de lançamento) |
| Próximos passos | Foco do próximo mês e a agenda ("Também vem aí") |
| Encerramento | "Veja o report completo." e o botão **Ver report completo** (o único link) |

Sem abas, carrossel, menus, animação, ▶ ou imagem clicável. O botão funciona também no Outlook para Windows (botão arredondado em VML).

### Como o resumo escolhe os destaques

Regras fixas, iguais todo mês (em `tools/motor.js`, `RESUMO_REGRAS`). Nada é resumido por máquina nem inventado:

- Os textos e números saem dos **campos marcados** da página (atributo `data-campo` do template). Editou a página ou o arquivo de dados? O resumo acompanha.
- **A ordem do arquivo de dados é a ordem de prioridade:** o 1º item de cada lista é o primeiro a entrar.
- Visão geral: projeto principal e até **4** números da capa.
- Resultados e evolução: Creative X e os **2** primeiros "foi bem" e **2** primeiros "a melhorar".
- Campanhas: o destaque (com até **3** resultados) e os **3** primeiros lançamentos.
- Aprendizados: até **3**. Em andamento: até **3** projetos do Transformation Hub.
- Próximos passos: o foco e os **3** primeiros itens da agenda.
- Item vazio ou apagado não aparece; bloco sem conteúdo some (a caixa dele fica desligada, com "sem conteúdo nesta edição").
- Em **Blocos do e-mail-resumo**, dá para desmarcar um bloco: ele fica só no report completo.

Ainda tem Lorem Ipsum, `X` ou `[INSERIR …]` na página? O Status avisa em **"Ainda não preenchido"**.

## A versão interativa (report completo)

É a página do mês com o movimento e os cliques: barra de leitura, seções aparecendo ao rolar, números contando até o valor, barra do Creative X crescendo, "▶ Assistir ao vídeo" e peças que abrem maiores. Quem usa "reduzir movimento" no sistema vê tudo parado. Prints colocados à mão (pasta das imagens) vão embutidos.

> **SharePoint e arquivos .html:** em muitos SharePoint, por segurança da Microsoft, o `.html` **baixa** em vez de abrir direto. Quem clicar abre o arquivo baixado (Chrome ou Edge) e ele funciona igual. Teste o link com uma pessoa de outra equipe antes do envio geral.

## Editar no navegador (opcional)

1. Abra a página do mês no Chrome. **Textos:** F12 → aba **Console** → `document.designMode = "on"` → Enter. Clique no texto e edite (o movimento fica parado durante a edição).
2. **Código (Inspecionar):** botão direito no ponto da página → **Inspecionar** → no painel, botão direito no elemento → **Edit as HTML**.
3. Salve com **Ctrl+S** → **"Página da Web, completa"**. "Somente HTML" perde as edições.
4. Não apague os atributos `data-campo` (levam o texto para o resumo). E passe a mesma mudança para o arquivo de dados, senão ela some na próxima geração.

### Prints no Transformation Hub pelo Inspecionar

O jeito normal é o arquivo de dados (`prints:` e `descricao_prints:`). Pelo Inspecionar:

1. Coloque os prints (`.png`/`.jpg`, nomes sem espaço) na **mesma pasta** do `.html`.
2. Botão direito no projeto → **Inspecionar** → Ctrl+F → `transformation-1` (ou `-2`, `-3`).
3. No último parágrafo do texto, **Edit as HTML** → cole, no fim, o bloco de **"Como colocar prints no HTML"** (botão **Copiar o bloco**) e troque o nome do arquivo e a descrição.
4. Salve e, no conversor, **Escolher a pasta das imagens** (a pasta dos prints).

O conversor reduz prints grandes para 1200 px, coloca-os como anexo no e-mail completo e embutidos na versão interativa. No e-mail-resumo, prints não entram (ficam no report completo).

## Status (tempo real)

| Etapa | O que acontece |
|---|---|
| Ler o arquivo | Nome e tamanho do `.html` |
| Reconhecer o report | Versão da ferramenta e arquivo de dados que geraram a página |
| Tirar o que o e-mail não aceita | Script, ampliação, vídeo, "Assistir ao vídeo", marcas do movimento, da edição e dos campos do resumo |
| Montar o e-mail-resumo | O que entrou em cada bloco, o que ficou de fora, o que ainda é modelo e o link do botão |
| Colocar as imagens dentro dos e-mails | Cada imagem vira anexo embutido (`cid:`), com contador; prints grandes são reduzidos |
| Montar o e-mail completo / o e-mail-resumo | Conferência do Outlook e tamanho final |
| Preparar a versão interativa | O arquivo para o SharePoint |

Com **Acompanhar o arquivo** marcado (Chrome/Edge, arquivo escolhido pelo botão ou arrastado), a página confere o arquivo a cada 1,5 s e converte de novo sozinha quando você salva o `.html`.

## Problemas comuns

| Status | O que fazer |
|---|---|
| "Falta o link do report completo" | Suba a versão interativa no SharePoint e cole o link (passo 4). A prévia mostra o aviso no lugar do botão |
| "O link precisa começar com https://" | Copie o link de compartilhamento do SharePoint, não o caminho da pasta |
| "Esta página não tem os campos do resumo" | A página é de antes da versão 4.2: o resumo sai no formato antigo. Gere a página de novo pelo `gerar-report.html` |
| "Ainda não preenchido na página" | Há Lorem Ipsum, `X` ou `[INSERIR …]`. Corrija no arquivo de dados e gere de novo |
| "Faltam N imagens que estão em arquivo ao lado do .html" | **Escolher a pasta das imagens** (a pasta dos prints ou a `_files` que o Chrome cria) |
| "endereço temporário da prévia (blob:)" | Você salvou a prévia da página de geração. Use **Baixar página do mês (.html)** |
| "Acima de 10 MB" | Alguma imagem grande entrou no e-mail completo. Troque por uma menor |
| O resumo deixou um item de fora | É a regra de seleção (os primeiros de cada lista). Mude a ordem dos blocos no arquivo de dados |
