# Checklist antes de enviar

Copie esta lista a cada mês. Leva uns 10 minutos.

## ANTES DE ENVIAR

**Conteúdo** (no arquivo `dados/AAAA-MM.txt`)

- [ ] Mês correto (`mes`, `ano`, `proximo_mes`, `pasta_imagens`)
- [ ] Projeto principal correto (nome, resumo, peça, formiguinha)
- [ ] Métricas atualizadas e conferidas com a fonte (painel ou planilha)
- [ ] Creative X atualizado (anterior, atual, período)
- [ ] Creative Transformation atualizado (status, resultado)
- [ ] Aprendizados e foco do próximo mês escritos
- [ ] Agenda atualizada

**Na página `gerar-report.html`**

- [ ] Conferência sem **erros** e sem **pendências** (faixa verde: "Tudo certo")
- [ ] Miniaturas atualizadas (seção "Imagens preparadas" com os arquivos do mês)
- [ ] Prévia conferida em **Computador** e em **Celular**
- [ ] Todas as imagens abrem: "Ver peça" de cada uma abre a peça grande
- [ ] Todos os vídeos abrem: "▶ Assistir" toca **com som**
- [ ] Todos os links funcionam (seção "Teste os links" → **Abrir** em cada linha)
- [ ] Nenhum placeholder restante (`[...]`)

**Envio de teste (só para você)**

- [ ] `.eml` final gerado (o nome **não** tem "RASCUNHO")
- [ ] Outlook Desktop revisado: layout, imagens e links
- [ ] Outlook Web revisado (se a área usa)
- [ ] Celular revisado: tudo legível, sem rolar para o lado, botões funcionam
- [ ] Assunto e pré-visualização corretos na caixa de entrada

**Envio para a área**

- [ ] `.eml` final aberto de novo, destinatários preenchidos, enviado
- [ ] `.html` do mês guardado em `reports/`

## Permissões (quando houver peça ou vídeo novo)

- [ ] O arquivo existe na pasta do mês no SharePoint
- [ ] O link é de compartilhamento ("Copiar link"), não de download nem de incorporação
- [ ] A opção de compartilhamento é "Pessoas em [empresa]" (ou o público tem acesso ao site)
- [ ] Nenhuma permissão individual restringindo o arquivo ("Gerenciar acesso" mostra o link da empresa)
- [ ] Uma pessoa de **outra equipe** abriu a peça e o vídeo (com som)

Como fazer cada verificação: [LINKS_SHAREPOINT_STREAM.md](LINKS_SHAREPOINT_STREAM.md).

## Primeira vez no banco

Antes do **primeiro** envio real, faça o **teste piloto com outro usuário** (computador, web e celular, com a tabela de verificação) descrito em [CORPORATE_SETUP.md](CORPORATE_SETUP.md#8-teste-piloto-com-outro-usuário-obrigatório-antes-do-1º-envio).

## O que já foi verificado na construção do projeto

| Verificação | Status |
|---|---|
| Motor: 19 testes automáticos | Passam |
| Página de geração de ponta a ponta no Chromium | Passa |
| E-mail gerado igual ao layout aprovado, em 760 px e 390 px | Conferido |
| Estrutura do `.eml` (texto + HTML, imagens embutidas) | Conferida |
| Imagens grandes reduzidas e recortadas com boa qualidade | Conferido |
| Outlook Desktop, Outlook Web, novo Outlook, celular | **Não testado** (sem Outlook neste ambiente) |
| Links reais, permissões, vídeo com som | **Não testado** (depende do SharePoint do banco) |
| Modo escuro | **Não testado** |
