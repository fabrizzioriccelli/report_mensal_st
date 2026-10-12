# Histórico de versões

A versão atual aparece na página `gerar-report.html`, no topo de `report_backup.html` e em `tools/motor.js` (`VERSAO`).

## 3.0 · 2026-10-12 · Modelo reutilizável no Brand Guide

**Identidade visual (Brand Guide Santander Brasil, maio/2026)**
- Paleta do guia: fundos só em Branco, Lisboa, Rio e Vermelho Santander; títulos em vermelho e textos em preto sobre branco; cores de apoio só em indicadores. Rodapé passou de vermelho-escuro para Vermelho Santander.
- Tipografia: Santander Headline Bold (títulos e números), Santander Micro Text (textos), Santander Condensed (frase da capa). Alternativa: Arial. Sem itálicos (o guia não tem).
- `assets/fonts/fontes-santander.css`: `@font-face` das 4 famílias, com os pesos do guia, pronto para receber os `.otf`.
- Chama do Santander (só o símbolo), do vetor oficial, em branco sobre vermelho.
- Formiguinha: arquivo original, só na abertura e no rodapé. Variações antigas retiradas.
- Cantos: imagens com metade da margem (20 px); retângulos com 5% do lado menor.
- Selo do mês em pílula branca com texto vermelho; ícones com traço vermelho.

**Template e motor**
- Parte 2 (destaque) no celular: a peça aparece na horizontal, na largura da tela (antes sumia).
- Novo enquadramento: `esquerda` e `direita`.
- Modelo em branco com Lorem Ipsum curto e `X%` / `R$ X` / `X p.p.`; tudo isso conta como pendência e bloqueia a versão final.
- Estados vazios: nada de `NaN`, cálculo com dado ausente ou link falso; botão sem link aparece em cinza e não clica.
- Cabeçalhos do `.eml` com no máximo 78 caracteres por linha; nomes de imagem curtos.
- Comentários `EDITAR AQUI` no template apontando o campo de cada texto.

**Segurança e organização**
- Todos os dados reais removidos (setembro de 2026, peças, apresentação, exemplos e capturas).
- Fotos do banco de imagens fora do GitHub (licença); `.gitignore` revisado.
- `report_backup.html`, guias novos (PyCharm, tipografia, FAQ, prompts do Copilot, backup) e guia mensal revisado.

## 2.x · até 2026-10-07

Ferramenta `gerar-report.html`, motor, `.eml` com imagens embutidas, links para SharePoint/Stream, grade de 3 colunas, capa vermelha e rodapé assinado como Customer Interactions. Continha o report de setembro de 2026 com dados reais (removido na 3.0; veja [docs/BACKUP.md](docs/BACKUP.md#histórico-do-git-e-dados-antigos)).

## 1.x

Primeira versão do layout em HTML de e-mail.
