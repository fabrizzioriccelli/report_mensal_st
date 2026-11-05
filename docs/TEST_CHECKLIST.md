# Checklist antes de enviar

Copie esta lista a cada mês. Leva uns 10 minutos.

## ANTES DE ENVIAR

**Conteúdo** (no emulador)

- [ ] Período correto (muda em toda a página)
- [ ] Frase do mês e projeto principal (nome, resumo, imagem)
- [ ] Indicadores conferidos com a fonte aprovada: valor, base de comparação, variação e cor; sem dado, item oculto (nunca 0 nem o número do mês anterior)
- [ ] Creative X atualizado (anterior, atual, variação em p.p.)
- [ ] Campanhas: destaque, resultados e lançamentos; o que não vale no mês, oculto
- [ ] Transformation Hub (status/previsão, logo, links ou PDF), conferido com a área
- [ ] Links e imagens adicionados (+ Link / + Imagem): cada link abre o lugar certo; cada imagem tem descrição
- [ ] Depois de adicionar ou tirar itens, imagens ou seções: no computador e no modo Celular, tudo alinhado, sem nada colado nem vazando para o lado
- [ ] Tópicos novos (ex.: Testes): só os que o mês tem; rótulo, título e itens sem [colchetes]; layout certo; os itens podem ser escolhidos como destaque do e-mail-resumo
- [ ] "O que aprendemos" de cada campanha: uma ou duas frases, sem [colchetes]; a seção geral oculta se ficou repetida
- [ ] Aprendizados, foco do próximo mês e agenda
- [ ] Nenhum texto de exemplo [entre colchetes] nem `X` (o estado avisa depois de salvar)
- [ ] Imagens trocadas, nítidas, com descrição; links com `https://`
- [ ] Salvo como `report-AAAA-MM.html`, reaberto no emulador e conferido

**No navegador (report salvo)**

- [ ] Movimento: seções aparecem, números contam até o valor certo, barra do Creative X cresce
- [ ] Vídeo toca no clique; peças abrem maiores; PDF abre em nova aba; Esc fecha
- [ ] Celular (botão "Celular" no emulador; depois, o link no celular): nada sai da tela

**Publicação e e-mail-resumo**

- [ ] Report publicado no ambiente corporativo autorizado; link de compartilhamento colado no emulador
- [ ] Link testado em janela anônima (Ctrl+Shift+N); uma pessoa de outra equipe também abriu
- [ ] Até 4 destaques escolhidos, na ordem certa; números iguais aos do report; informação nova conferida com os resultados e marcada "Revisei"; um único botão, "Acessar report completo"
- [ ] Status sem ✕; prévia conferida em Computador e Celular

**Envio de teste (só para você)**

- [ ] `-resumo.eml` baixado e aberto no Outlook
- [ ] Layout, imagens, assunto e pré-visualização corretos (computador, web se a área usa, celular)
- [ ] O botão "Acessar report completo" abre o report (computador e celular)

**Envio para a área**

- [ ] `-resumo.eml` aberto de novo, destinatários autorizados, enviado pelo Outlook corporativo
- [ ] `report-AAAA-MM.html` guardado na pasta do mês

## Permissões (quando houver peça ou vídeo novo)

- [ ] O arquivo existe na pasta do mês no SharePoint
- [ ] O link é de compartilhamento ("Copiar link"), não de download nem de incorporação
- [ ] A opção de compartilhamento é "Pessoas em [empresa]" (ou o público tem acesso ao site)
- [ ] Nenhuma permissão individual restringindo o arquivo ("Gerenciar acesso" mostra o link da empresa)
- [ ] Uma pessoa de **outra equipe** abriu a peça e o vídeo (com som)

Como fazer cada verificação: [LINKS_SHAREPOINT_STREAM.md](LINKS_SHAREPOINT_STREAM.md).

## Primeira vez no banco

Antes do **primeiro** envio real, faça o **teste piloto com outro usuário** (computador, web e celular, com a tabela de verificação) descrito em [CORPORATE_SETUP.md](CORPORATE_SETUP.md#9-teste-piloto-com-outro-usuário-obrigatório-antes-do-1º-envio).

## O que já foi verificado na construção do projeto

| Verificação | Status |
|---|---|
| Motor: 67 testes automáticos (estado vazio, paleta do Brand Guide, e-mail-resumo, indicadores, importação do Copilot, PDF anexo, link de arquivo) | Passam |
| Emulador de ponta a ponta, como uma pessoa faria, com conteúdo fictício: abrir o modelo, editar texto, número e cor, trocar imagem, colocar link (e recusar caminho do computador), ocultar e adicionar itens com a grade refeita (agenda, lançamentos, indicadores; celular sem vazar), ocultar seção, tirar imagem opcional, link de arquivo no `.eml`, importar conteúdo, salvar, reabrir, aviso do mês anterior, recuperar a edição, e-mail-resumo (3 indicadores, um único destino, sem link bloqueado), `.eml` MIME; também na versão avulsa | Passa |
| Chamadas da apresentação (PDF) abrindo o emulador, o guia e o report no visualizador do Chromium | Passa |
| Emulador Report PJ de ponta a ponta (`tests/pj.e2e.js`): aba e ícone Santander + PJ, modelo em branco PJ, edição, imagem vertical, itens e grade, seções, novo tópico, celular, importação, salvar (ícone e marca do PJ), reabrir, rascunho separado do PF, recusa do outro segmento nos dois sentidos, e-mail-resumo no tema Empresas, `.eml`, `.png` e e-mail completo | Passa |
| Funil e peça embaixo no Emulador Report PJ (`tests/funil.e2e.js`, 5.4): Ver como funil (degraus 100/88/76%, nome e total), editar no clique, + Adicionar e Tirar degrau, ↑/↓, Tirar o total e + Total ao lado, Ver em colunas, Desfazer, Imagem embaixo (600 px, sem recorte) e ao lado, salvar e reabrir, e-mail-resumo e e-mail completo sem erro, celular (390, 640, 690 px), "Vem aí" num report da 5.3, PF sem o botão | Passa |
| PF sem mudança na 5.0: HTML, texto puro, e-mail-resumo, página interativa e e-mail resumido idênticos byte a byte aos da 4.13; suíte inteira do PF (repositório e kit) | Passa |
| PF e PJ no mesmo esqueleto (5.1): mesmas seções, na mesma ordem, e a mesma marcação de campos com os mesmos dados; cores e nomes de cada segmento; marca de antes sem as cores novas; report PF salvo antes da 5.1 (`tests/dados/report-exemplo-4.12.html`) abre, é atualizado e funciona; suíte inteira do PF (repositório e kit) e do PJ | Passa |
| PJ com fundo Rio (5.2): página Rio, painéis Brancos, balões nas duas variações do Brand Guide Empresas; PF idêntico byte a byte ao da 5.1 (HTML, texto puro, página interativa e e-mail); report PJ salvo na 5.1 segue com as cores dele no emulador; suíte inteira do PF (repositório e kit) e do PJ | Passa |
| Hierarquia de cores do PJ (5.3): fundo do HTML Branco, conteúdo Rio, 5 painéis Brancos recuados (borda Rio de 20 px; 8 px no celular); e-mail-resumo PJ na mesma hierarquia; PF (report e e-mail-resumo) idêntico byte a byte ao da 5.2; suíte inteira do PF (repositório e kit) e do PJ | Passa |
| Movimento na versão interativa (contagem, barra, reduzir movimento, edição) | Passa |
| Página de geração de ponta a ponta no Chromium, sem vazar para o lado de 320 a 1440 px | Passa |
| Fonte `.otf` de teste em `assets/fonts/` | Carrega na prévia e no `.html`; fora do `.eml` |
| E-mail gerado com o layout aprovado e os ajustes do Brand Guide | Conferido |
| Estrutura do `.eml` (texto + HTML, imagens embutidas) | Conferida |
| Imagens grandes reduzidas e recortadas com boa qualidade | Conferido |
| Outlook Desktop, Outlook Web, novo Outlook, celular | **Não testado** (sem Outlook neste ambiente) |
| Links reais, permissões, vídeo com som | **Não testado** (depende do ambiente corporativo) |
| Microsoft Edge, Windows (Explorador, janela "Salvar como"), PowerPoint | **Não testado** (ambiente Linux com Chromium) |
| Modo escuro | **Não testado** |
