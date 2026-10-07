# Compatibilidade com o Outlook

O report é distribuído por Outlook. O ponto crítico é o **Outlook clássico para Windows**, que desenha e-mails com o **motor do Word**, e não com um navegador. O que funciona nele funciona nos outros. Por isso o template foi escrito para esse motor.

| Cliente | Motor | Observação |
|---|---|---|
| Outlook clássico para Windows (2016, 2019, 2021, Microsoft 365) | Word | O mais restritivo. A Microsoft mantém suporte a ele pelos próximos anos |
| Novo Outlook para Windows | Navegador (Edge) | Aceita mais CSS; remove scripts |
| Outlook na Web | Navegador | Igual ao novo Outlook |
| Outlook para iOS e Android | Nativo/WebView | Aceita CSS de celular (media queries) |
| Outlook para Mac | WebKit | Bom suporte |

## Funciona (usado no report)

| Recurso | Como o report usa |
|---|---|
| ✓ Texto, negrito, itálico | Todo o conteúdo |
| ✓ Tabelas para layout | Toda a grade (colunas, faixas, caixas) |
| ✓ Estilo inline (`style="..."`) | Cores, tamanhos e espaçamentos em cada elemento |
| ✓ Cor de fundo em células | Faixa vermelha, caixas de aprendizado, selo CreativeX (`bgcolor` + `background`) |
| ✓ Bordas em células | Linhas de seção, divisórias, caixas tracejadas dos placeholders |
| ✓ `margin` em parágrafos e `padding` em células | Espaçamentos (o Word não respeita `padding` em `<p>`/`<div>` nem `margin` em tabelas) |
| ✓ Imagens JPG/PNG com `width` | Peças em JPG; formiguinha e ícones em PNG com fundo transparente (`AllowPNG` declarado para o Outlook); tudo anexado ao e-mail (CID) |
| ✓ Links | Botões e vídeos |
| ✓ Arial | Única fonte; existe em todos os computadores |
| ✓ Caracteres especiais (▶ → ● ○) | Ícones de play, setas e status, sem imagem |

## Usar com cuidado

| Recurso | Comportamento | Como o report trata |
|---|---|---|
| △ Responsividade (`@media`) | Ignorada no Outlook para Windows; funciona no celular e na web | Layout fixo de 680 px no computador; colunas empilham no celular |
| △ Cantos arredondados (`border-radius`) | Funcionam no novo Outlook, Outlook na Web, iOS, Android e Mac. O Outlook para Windows ignora e mostra cantos retos | Usados em um sistema de 4 tamanhos (6, 12, 16 px e pílula). Sem eles, o layout e as cores continuam iguais: o fallback é o mesmo bloco com canto reto. Não usamos VML para arredondar, para não complicar a edição |
| △ Etiquetas em pílula (`span` com fundo e `padding`) | O Outlook para Windows mostra o fundo colado ao texto, sem o respiro lateral | A etiqueta continua legível e colorida; só fica mais justa |
| △ GIF animado | Versões antigas do Outlook para Windows mostram só o 1º quadro | Não usado. Se usar, o 1º quadro precisa funcionar sozinho |
| △ Modo escuro | Cada Outlook escurece cores de um jeito (alguns invertem fundos claros e textos escuros) | Texto branco sobre vermelho e texto escuro sobre claro continuam legíveis. Imagens não são invertidas; a formiguinha tem fundo transparente e contorno próprio, então funciona em fundo claro ou escuro. O Creative X já é escuro por design. **Conferir em cada envio** |
| △ Imagem hospedada (link `https://`) | Bloqueada até "Baixar imagens" | Imagens vão anexadas (CID) |
| △ Tamanho do e-mail | Mensagens grandes demoram e podem ser barradas | HTML ~50 KB; imagens até ~200 KB cada, ~3 MB no total |
| △ Botão | Botão com `<a>` estilizado perde o fundo no Word | Botão feito com célula de tabela colorida (pílula fora do Windows) e link dentro |

## Não depender

| Recurso | Por quê | Alternativa no report |
|---|---|---|
| ✕ JavaScript | Nenhum Outlook executa | Conteúdo escrito direto no HTML; nada é gerado por script |
| ✕ Vídeo (`<video>`) | Nenhum Outlook reproduz | Miniatura + botão ASSISTIR com link para o Stream |
| ✕ iframe / incorporar Stream | Removido por todos | Link para o Stream |
| ✕ Flexbox, Grid, `position` | Ignorados pelo motor do Word | Tabelas |
| ✕ Imagem de fundo (`background-image`) | Não aparece no Outlook para Windows sem VML | Fundos em cor sólida |
| ✕ SVG | Não aparece no Outlook para Windows | JPG/PNG e caracteres de texto |
| ✕ Fontes externas (Google Fonts, fonte Santander) | Bloqueadas | Arial |
| ✕ Cores `rgba()` / transparência | O Word não entende | Cores em hexadecimal (`#9E1218`) |
| ✕ Imagem em base64 (`data:`) | Bloqueada no Outlook para Windows | Anexo inline (CID) |
| ✕ Formulários, animações CSS, hover | Removidos ou ignorados | Não usados |

## Decisões específicas para Outlook no template

1. **Largura de 680 px**, com uma tabela "fantasma" condicional (`<!--[if mso]>`) que trava a largura no Outlook para Windows, que não entende `max-width`.
2. **`font-family` repetido** em cada célula de texto, além de um estilo condicional para o Outlook. Sem isso o Word volta para Times New Roman.
3. **`line-height` em px** em todo texto, para o Word não inventar espaçamento.
4. **Espaçadores** (`<div style="font-size:Npx;line-height:Npx">`) no lugar de `margin` em tabelas.
5. **Barras do Creative X** feitas com duas células de tabela coloridas, em porcentagem. Funcionam em qualquer Outlook, sem imagem nem gráfico.
6. **Placeholders em HTML puro** (célula com borda tracejada e texto), sem arquivos de imagem extras.
7. **Texto de pré-visualização** escondido (`display:none; mso-hide:all`) para controlar o que aparece ao lado do assunto na caixa de entrada.
8. **`alt` em todas as imagens**, para quem recebe com imagens bloqueadas ver um texto no lugar. A formiguinha decorativa usa `alt=""`.
9. **Comentários de edição removidos** no `.eml`: o arquivo enviado fica menor e sem instruções internas.

## Celular

No celular (Outlook iOS/Android e Outlook na Web em tela pequena), uma regra `@media (max-width:620px)`:

- empilha as colunas (classe `col`);
- coloca as 4 métricas da visão geral em pares, acima e abaixo do visual central (classe `half`);
- esconde as setas entre as caixas de aprendizado (classe `hide-m`);
- reduz a manchete.

Onde a regra não é aceita, o e-mail mostra o layout de computador reduzido, sem quebrar.

## O que foi testado e o que não foi

| Verificação | Status |
|---|---|
| Renderização no Chromium a 760 px (computador) e 390 px (celular) | Testado, screenshots conferidos |
| Ausência de recursos incompatíveis (script, flex, grid, position, fundo, rgba, base64, fonte externa) | Testado pela ferramenta |
| Estrutura do `.eml` (MIME, UTF-8, CIDs, imagens) | Testado com o leitor de e-mail do Python |
| Outlook clássico, novo Outlook, Outlook na Web, Outlook iOS/Android, Mac | **Não testado** (sem Outlook neste ambiente) |
| Modo escuro | **Não testado** |

Antes do primeiro envio, faça o teste descrito em [TEST_CHECKLIST.md](TEST_CHECKLIST.md).
