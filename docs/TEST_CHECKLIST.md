# Checklist de testes

Copie esta lista a cada mês (ou marque direto aqui no GitHub). A primeira coluna é para você; a última mostra o que já foi verificado na construção do template.

## Antes de gerar o .eml

| ✓ | Item | Como verificar | Verificado na construção do template |
|---|---|---|---|
| [ ] | HTML abre corretamente | Dois cliques em `reports/AAAA-MM.html` | Sim (Chromium) |
| [ ] | Mês certo em todos os lugares | Ctrl+F `01 MÊS`: 4 pontos + a frase do foco | Sim (setembro) |
| [ ] | Números conferidos com a fonte | Compare com o painel/planilha de origem | Números de set/2026 copiados do esboço |
| [ ] | Placeholders zerados | `tools/gerar-eml.html` → "Pendências de conteúdo" | Não: o report de setembro ainda tem placeholders de propósito |
| [ ] | Imagens | Nenhum quadro vazio no navegador; ferramenta sem "não encontrada" | Sim (5 peças do esboço, 3 formiguinhas e 2 ícones em PNG) |
| [ ] | Formiguinha | No máximo 3: versão do tema no projeto principal, tablet no Creative Transformation, alvo no Foco. Mãos legíveis, sem gesto ambíguo | Sim |
| [ ] | Etiquetas de resultado | Verde só para resultado bom (inclusive custo que caiu); âmbar para previsto | Sim |
| [ ] | Cada projeto uma vez | O projeto principal não volta em "O que lançamos"; nenhum número aparece em dois lugares | Sim |
| [ ] | Creative X | Anterior, atual, variação e barras batem entre si | Estrutura sim; score anterior ainda é placeholder |
| [ ] | Aprendizados e foco | Até 3 aprendizados com título, 1 frase e "→ Levamos"; o foco sai deles | Estrutura sim; conteúdo é placeholder |
| [ ] | Celular | F12 → Ctrl+Shift+M → 390 px: nada cortado, sem rolagem lateral | Sim (Chromium, 390 px) |
| [ ] | Compatibilidade | Ferramenta → "Nenhum problema encontrado" | Sim |

## Depois de gerar (envie só para você)

| ✓ | Item | Como verificar | Verificado na construção do template |
|---|---|---|---|
| [ ] | .eml | Abre no Outlook como mensagem nova (ou use Encaminhar) | Estrutura validada; **não aberto em Outlook** |
| [ ] | Outlook Desktop (clássico) | Layout em 680 px, títulos em Georgia e texto em Arial, bloco vermelho do Foco inteiro (cantos retos são esperados) | **Não testado** |
| [ ] | Outlook Web | Mesmo layout; imagens aparecem sem "Baixar imagens" | **Não testado** |
| [ ] | Novo Outlook | Mesmo layout | **Não testado** |
| [ ] | Mobile (Outlook iOS/Android) | Colunas empilhadas, números da abertura em pares, texto legível | **Não testado** em app real |
| [ ] | Imagens | Todas visíveis, nítidas, sem "x" vermelho | **Não testado** em Outlook |
| [ ] | Links | Cada botão/link abre o destino certo | Não há links reais ainda (`#COLE-O-LINK...`) |
| [ ] | Vídeos | A miniatura e "▶ Assistir" abrem o Stream; uma pessoa de fora do time consegue ver | **Não testado** |
| [ ] | Dark Mode | Ative o modo escuro no Outlook e no celular: textos legíveis, superfícies e bloco do Foco visíveis | **Não testado** |
| [ ] | Pré-visualização | Na caixa de entrada, o texto ao lado do assunto é a frase do mês | **Não testado** |
| [ ] | Imagens bloqueadas | Com imagens desligadas, os textos alternativos aparecem e o report ainda se entende | **Não testado** |

## Atualização mensal

| ✓ | Item |
|---|---|
| [ ] | Arquivo novo em `reports/AAAA-MM.html` (o do mês anterior ficou intacto) |
| [ ] | Imagens do mês em `assets/AAAA-MM/` |
| [ ] | Envio de teste aprovado |
| [ ] | Envio para a área |
| [ ] | Commit no repositório: `report: [mês] AAAA` |
