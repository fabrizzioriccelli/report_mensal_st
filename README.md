# Report Mensal · Creative Strategy PF

Report mensal da área em **uma única página HTML**, feita para ser enviada **por Outlook, como arquivo .eml**.

<img src="docs/preview-2026-09.jpg" width="320" alt="Prévia do report de setembro 2026">

---

## O que é

Um template de e-mail HTML que substitui o report em slide. Ele tem uma visão geral no topo, os principais resultados, o Creative X, os destaques do mês, as peças e vídeos, os aprendizados e o que vem a seguir. A identidade da área (vermelho, tipografia forte, numeração das seções e a formiguinha) foi mantida.

## Por que existe

O report precisava:

- caber em **uma página vertical**, sem abas, menus ou várias telas;
- abrir **igual no Outlook** (o canal real de distribuição), sem depender de JavaScript;
- ser **atualizado todo mês por uma pessoa só**, com conhecimento básico de HTML;
- ter **espaços prontos** para peças, imagens e vídeos.

## Como funciona

```
reports/AAAA-MM.html  ──(tools/gerar-eml.html)──►  AAAA-MM.eml  ──(Outlook)──►  área
   você edita aqui          confere e embute            abre como          envio
                            as imagens                  mensagem nova
```

1. **Todo o conteúdo fica direto no HTML.** Não existe banco de dados, JSON nem etapa de build. O que você vê no arquivo é o que vai no e-mail.
2. **Comentários `EDITAR AQUI`** marcam cada texto, número, imagem e link que muda no mês.
3. **A ferramenta `tools/gerar-eml.html`** (abre no Edge ou Chrome, sem instalar nada) confere as pendências, embute as imagens no e-mail e gera o `.eml`.
4. **O Outlook abre o `.eml` como mensagem nova.** Você preenche os destinatários e envia.

## Estrutura

```
/
├── README.md                    ← este arquivo
├── reports/
│   └── 2026-09.html             ← report de setembro (um arquivo por mês)
├── template/
│   └── report-template.html     ← modelo em branco, só com placeholders
├── assets/
│   ├── mascote/formiga.jpg      ← a formiguinha (fixa)
│   ├── marca/creativex.jpg      ← logo CreativeX (fixo)
│   ├── icones/                  ← ícones reutilizáveis
│   └── 2026-09/                 ← imagens do mês (peças, miniaturas)
├── tools/
│   └── gerar-eml.html           ← confere e gera o .eml (abre no navegador)
├── examples/
│   └── report-2026-09.eml       ← exemplo real gerado pela ferramenta
└── docs/
    ├── HOW_TO_EDIT.md           ← atualizando o report em 10 minutos
    ├── HOW_TO_EXPORT_EML.md     ← o que é o .eml, como gerar, abrir e enviar
    ├── OUTLOOK_COMPATIBILITY.md ← o que funciona e o que evitar no Outlook
    ├── TEST_CHECKLIST.md        ← checklist antes de cada envio
    ├── ANALISE_E_DECISOES.md    ← análise do esboço e decisões de UX/UI
    └── preview-2026-09.jpg      ← imagem de prévia usada neste README
```

Não há vídeos no repositório: eles ficam no Microsoft Stream, e o report leva só a miniatura e o link.

## Como editar o report mensal

Resumo abaixo; o passo a passo completo está em [docs/HOW_TO_EDIT.md](docs/HOW_TO_EDIT.md).

1. Copie o report do mês anterior: `reports/2026-09.html` → `reports/2026-10.html`.
2. Abra o arquivo no **VS Code** ou no **Bloco de Notas**.
3. Pesquise (Ctrl+F) por **`EDITAR AQUI`** e atualize cada ponto. Os marcadores são numerados:

| Marcador | O que muda |
|---|---|
| `01 MÊS` | assunto, cabeçalho, visão geral, "Foco de…", "Até…" e rodapé |
| `02 TÍTULO` | manchete da visão geral |
| `03 RESUMO` | síntese do mês e texto de pré-visualização da caixa de entrada |
| `04 MÉTRICAS` | os 4 números da visão geral, a faixa vermelha e as métricas das peças |
| `05 CREATIVE X` | escopo, referências e principal ganho |
| `06 SCORES` | score anterior, atual, variação e as barras |
| `07 IMAGENS` | visual central, peças dos cases, destaques e peças |
| `08 VÍDEOS` | título, categoria, acessos, duração e miniatura |
| `09 APRENDIZADOS` | o que aconteceu, o que aprendemos, o que levamos e o foco do mês |
| `10 LINKS` | links dos botões e dos vídeos |

Regra de ouro: **troque só o texto entre `>` e `<`**. Não apague tags nem o que está dentro de `style="..."`.

## Como trocar uma imagem

1. Salve a imagem em `assets/AAAA-MM/` como **JPG**, no **dobro da largura** indicada no comentário (ex.: espaço de 240 px → exporte com 480 px), até ~200 KB.
2. No HTML, ache o `EDITAR AQUI · 07 IMAGENS` daquele espaço.
3. Apague a tabela que vem depois de `<!-- PLACEHOLDER · ... -->` (a caixa tracejada).
4. Tire os sinais de comentário da linha `<img ...>` que está logo acima e ajuste o nome do arquivo e o `alt`:

```html
<!-- antes -->
<!-- <img src="../assets/2026-09/visual-principal.jpg" width="240" alt="[Descreva a imagem]" ...> -->

<!-- depois -->
<img src="../assets/2026-10/visual-principal.jpg" width="240" alt="Campanha Dia das Crianças" ...>
```

Mantenha o `width="..."`: é ele que o Outlook usa para o tamanho.

## Como adicionar um vídeo

O vídeo **não toca dentro do e-mail** em nenhuma versão do Outlook. O report mostra uma miniatura e um botão **ASSISTIR**, que abrem o vídeo no Stream.

1. No Stream, copie o **link de compartilhamento** do vídeo (o mesmo público do e-mail precisa ter acesso).
2. No HTML, ache o bloco `INÍCIO BLOCO · CONTEÚDO (VÍDEO)`.
3. Troque título, categoria, acessos, duração e descrição (`08 VÍDEOS`).
4. Troque `#COLE-O-LINK-DO-STREAM` pelo link (`10 LINKS`).
5. Para a miniatura, tire um print do vídeo em 16:9, salve com 440 x 248 px e siga "Como trocar uma imagem". Envolva a imagem no mesmo link: `<a href="LINK"><img ...></a>` (o exemplo já está no comentário).

Mais um vídeo? Copie o bloco inteiro, do `INÍCIO BLOCO` ao `FIM BLOCO`, e cole logo abaixo. Ordene do mais visto para o menos visto.

## Como atualizar métricas

Cada número é um texto comum dentro de um `<p>`. Ache o `EDITAR AQUI · 04 MÉTRICAS` e troque o valor e o rótulo. Use o padrão brasileiro: `3,6x`, `+89%`, `R$ 0,68`, `&minus;12%` (o `&minus;` desenha o sinal de menos tipográfico).

Para mais uma linha "antes → depois" num case, copie um `<tr>...</tr>` inteiro da tabela de resultado.

## Como atualizar Creative X

Busque `06 SCORES`:

1. **Anterior → Atual → Variação**: troque `00%`, `80%` e `+00 p.p.` (variação = atual − anterior, em pontos percentuais).
2. **Barras**: cada barra tem duas células que somam 100%. Score de 85% → `width="85%"` na primeira e `width="15%"` na segunda.
3. **Referências** (`05 CREATIVE X`): média do ano, meta ou média global, com uma frase de comparação.
4. **Principal ganho**: uma frase sobre o que puxou o score.

## Como atualizar aprendizados

Busque `09 APRENDIZADOS`. Cada linha segue a mesma lógica:

| O que aconteceu? | O que aprendemos? | O que levamos? |
|---|---|---|
| resultado observado, com número | o que isso nos ensina | o que muda daqui para frente |

Escreva o aprendizado como uma conclusão, não como um número repetido. Mais um aprendizado: copie o bloco `INÍCIO BLOCO · APRENDIZADO`.

## Como gerar/testar o HTML

- **Ver o report:** dê dois cliques em `reports/AAAA-MM.html`. O navegador mostra o e-mail como ele vai ficar (com as imagens). Para ver no tamanho de celular, aperte F12 e ative o modo de dispositivo (Ctrl+Shift+M).
- **Conferir:** abra `tools/gerar-eml.html`, selecione a pasta do projeto e leia a lista de pendências e o resultado da checagem de compatibilidade.

## Como transformar/enviar como .eml

1. Abra `tools/gerar-eml.html` no Edge ou Chrome.
2. Clique em **Selecionar pasta do projeto** e escolha a pasta principal (a que contém `reports/`).
3. Confira o report selecionado, as pendências e a prévia.
4. Clique em **Baixar .eml**.
5. Dê dois cliques no `.eml`: o Outlook abre uma mensagem nova com o report. Preencha os destinatários e envie.

Detalhes, alternativas e problemas comuns: [docs/HOW_TO_EXPORT_EML.md](docs/HOW_TO_EXPORT_EML.md).

## Como testar no Outlook

Sempre **envie primeiro para você mesmo** e abra no Outlook do computador, no Outlook na Web e no celular. Use [docs/TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md).

## Limitações

- **Vídeo não toca no e-mail.** Nenhum Outlook reproduz vídeo; o report usa miniatura + link para o Stream.
- **Não testado em Outlook real.** O HTML foi verificado no Chromium (desktop e celular) e o `.eml` foi validado na estrutura, mas este ambiente não tem Outlook. O primeiro envio deve ser um teste para você.
- **Novo Outlook:** o `.eml` pode abrir como mensagem recebida em vez de rascunho. Nesse caso, use **Encaminhar** (veja o guia do .eml).
- **Formiguinha em baixa resolução.** O arquivo atual foi recortado do esboço. Troque pelo arquivo original (PNG ou JPG em alta) mantendo o nome `assets/mascote/formiga.jpg`.
- **Modo escuro:** cada Outlook escurece cores de um jeito; o report foi desenhado para continuar legível, mas o resultado exato precisa ser conferido.
- **Celular:** o empilhamento das colunas funciona onde o cliente aceita CSS de celular (Outlook iOS/Android, Outlook na Web). No Outlook do Windows o layout é sempre o de 680 px.

## Compatibilidade

| Cliente | Situação |
|---|---|
| Outlook clássico para Windows (motor do Word) | Layout em tabelas pensado para ele; principal alvo |
| Novo Outlook para Windows / Outlook na Web | Compatível (motor de navegador) |
| Outlook para iOS e Android | Compatível; colunas empilham |
| Outlook para Mac | Compatível |

O detalhamento por recurso (imagens, fundos, fontes, GIF, SVG, vídeo, modo escuro) está em [docs/OUTLOOK_COMPATIBILITY.md](docs/OUTLOOK_COMPATIBILITY.md).

## Troubleshooting

| Problema | Causa provável | Solução |
|---|---|---|
| Imagem aparece como quadro vazio no navegador | Caminho errado no `src` | Confira o nome do arquivo e a pasta; os reports usam `../assets/...` |
| A ferramenta diz "Imagem não encontrada" | Mesmo motivo acima, ou pasta errada selecionada | Selecione a pasta principal do projeto |
| Layout "quebrou" depois de editar | Uma tag `<` `>` ou aspas `"` apagada | Desfaça (Ctrl+Z) ou compare com o mês anterior |
| Texto aparece em Times New Roman no Outlook | `font-family` removido | Copie o `style` de um parágrafo vizinho |
| O `.eml` abre como "recebido" e não deixa editar | Novo Outlook ou Outlook para Mac | Use **Encaminhar** e apague o cabeçalho de encaminhamento |
| Link do vídeo pede acesso | Vídeo não compartilhado com o público do e-mail | No Stream, compartilhe com o grupo/lista de distribuição |
| Imagem muito grande no Outlook | `width` removido da tag `<img>` | Recoloque `width="..."` com o valor do comentário |
