# Histórico de versões

A versão atual aparece na página `gerar-report.html`, no topo de `report_backup.html` e em `tools/motor.js` (`VERSAO`).

## 3.2 · 2026-10-13 · Cantos do Brand Guide e formiguinha integrada

- **Cantos conforme o guia (3.6):** raio de 5% do lado menor do **formato** (e-mail de 680 px = 34 px; no celular, 20 px) em todos os retângulos: cartão do e-mail, capa, faixa de números, Creative Transformation, Foco e rodapé. Antes o raio era calculado pela caixa (8 a 20 px) e o e-mail parecia quadrado.
- **Abertura e encerramento simétricos:** a capa vermelha virou um retângulo arredondado apoiado num painel Rio; a formiguinha cumprimenta ("Olá!") em pé sobre a capa, dentro do cartão. No rodapé, ela se despede em pé sobre a faixa vermelha. As duas ficam no eixo direito da grade (selo, peça da capa e chama).
- **Faixa de números sem divisórias verticais:** cada número tem o seu filete no topo da coluna (vermelho no principal), como na agenda; a coluna 3 alinha com a peça da capa.

## 3.1 · 2026-10-12 · Grade da abertura, rodapé e cores de apoio

- **Abertura em grade:** os números da capa ficam um em cada coluna da grade (184 px), alinhados com as seções de baixo, todos alinhados pelo topo. O modelo passa a ter 3 números (com 4, viram 4 colunas iguais).
- **Formiguinha menor e com contraste:** na abertura, 44 px, em pé sobre o filete da faixa de números; no rodapé, 64 px, sobre fundo claro (antes ficava sobre o vermelho, sem contraste).
- **Rodapé novo**, em duas faixas: clara (Rio), com a despedida, "Dúvidas e sugestões", "Próxima edição" e a formiguinha; e vermelha, com a assinatura da área e a chama no canto inferior direito.
- **Cores de apoio do guia organizando a leitura:** cada momento da história tem uma cor nas etiquetas de seção e nos detalhes: resultados (turquesa), qualidade e transformação (roxo), aprendizado e próximos passos (rosa). Títulos continuam vermelhos.

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
