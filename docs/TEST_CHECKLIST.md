# Checklist antes de enviar

Copie esta lista a cada mês. Leva uns 10 minutos.

## ANTES DE ENVIAR

**Conteúdo** (no arquivo `dados/AAAA-MM.txt`)

- [ ] Mês correto (`mes`, `ano`, `proximo_mes`, `pasta_imagens`)
- [ ] Projeto principal correto (nome, resumo, peça)
- [ ] Nenhum conteúdo de exemplo restante: Lorem Ipsum, `X`, "Mês", "AAAA"
- [ ] Métricas atualizadas e conferidas com a fonte (painel ou planilha)
- [ ] Creative X atualizado (anterior, atual, período)
- [ ] Transformation Hub atualizado (status/previsão, logo, links, prints), conferido com a área
- [ ] `link_report_completo` preenchido (link do SharePoint, não caminho do computador) ou link em mãos
- [ ] Aprendizados e foco do próximo mês escritos
- [ ] Agenda atualizada

**Na página `gerar-report.html`**

- [ ] Conferência sem **erros** e sem **pendências** (faixa verde: "Tudo certo")
- [ ] Miniaturas atualizadas (seção "Imagens preparadas" com os arquivos do mês)
- [ ] Prévia conferida em **Computador** e em **Celular**
- [ ] Todas as imagens abrem: "Ver peça" de cada uma abre a peça grande
- [ ] Todos os vídeos abrem: "▶ Assistir" toca **com som**
- [ ] Todos os links funcionam (seção "Teste os links" → **Abrir** em cada linha)
- [ ] Nenhum placeholder restante (`[...]`, Lorem Ipsum, `X`)
- [ ] Prévia no **Celular**: a peça do destaque aparece (na horizontal) e nada sai da tela

**No Chrome (página do mês)**

- [ ] Página do mês salva em `reports/` e aberta no Chrome
- [ ] Movimento: seções aparecem, números contam até o valor certo, barra do Creative X cresce
- [ ] Vídeo toca no clique; peças abrem maiores; Esc fecha
- [ ] Celular (F12 → Ctrl+Shift+M): nada sai da tela

**No conversor (`converter-html-eml.html`)**

- [ ] Versão interativa baixada e enviada ao SharePoint; link copiado e colado
- [ ] Status sem ✕; "Ainda não preenchido" não aparece
- [ ] Prévia do **e-mail-resumo** conferida em Computador e Celular: período, números, campanhas, aprendizados, Transformation Hub, próximos passos
- [ ] Um único botão ("Ver report completo") no fim; nenhuma imagem com ▶

**Envio de teste (só para você)**

- [ ] `-resumo.eml` baixado (e o completo, só se for usar)
- [ ] Outlook Desktop revisado: layout, imagens e links
- [ ] Outlook Web revisado (se a área usa)
- [ ] Celular revisado: tudo legível, sem rolar para o lado, botões funcionam
- [ ] Assunto e pré-visualização corretos na caixa de entrada
- [ ] O botão "Ver report completo" abre o report (no computador e no celular); uma pessoa de outra equipe também conseguiu abrir

**Envio para a área**

- [ ] `-resumo.eml` aberto de novo, destinatários autorizados preenchidos, enviado pelo Outlook corporativo
- [ ] `.html` do mês guardado em `reports/`

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
| Motor: 62 testes automáticos (inclui estado vazio, paleta do Brand Guide, e-mail-resumo e regras de seleção) | Passam |
| Conversor de ponta a ponta (e-mail-resumo com um único destino, versão interativa, e-mail completo, acompanhar o arquivo) | Passa |
| Movimento na versão interativa (contagem, barra, reduzir movimento, edição) | Passa |
| Página de geração de ponta a ponta no Chromium, sem vazar para o lado de 320 a 1440 px | Passa |
| Fonte `.otf` de teste em `assets/fonts/` | Carrega na prévia e no `.html`; fora do `.eml` |
| E-mail gerado com o layout aprovado e os ajustes do Brand Guide | Conferido |
| Estrutura do `.eml` (texto + HTML, imagens embutidas) | Conferida |
| Imagens grandes reduzidas e recortadas com boa qualidade | Conferido |
| Outlook Desktop, Outlook Web, novo Outlook, celular | **Não testado** (sem Outlook neste ambiente) |
| Links reais, permissões, vídeo com som | **Não testado** (depende do SharePoint do banco) |
| Modo escuro | **Não testado** |
