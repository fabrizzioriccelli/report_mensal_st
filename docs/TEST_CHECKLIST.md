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
- [ ] Tópicos novos (ex.: Testes): só os que o mês tem; rótulo, título e itens sem [colchetes]; layout certo; aparecem também no e-mail-resumo
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
- [ ] Até 3 indicadores escolhidos; botão "Acessar report completo"
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
