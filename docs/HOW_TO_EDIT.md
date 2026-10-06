# Atualizando o report em 10 minutos

Guia para o dia a dia. Você só precisa de um editor de texto (VS Code recomendado; o Bloco de Notas também funciona) e do Edge ou Chrome.

> **Regra de ouro:** troque só o texto que fica entre `>` e `<`. Não apague `<`, `>`, aspas `"` nem o que está dentro de `style="..."`.
>
> ```html
> <p style="margin:0;font-size:28px;...">3,6x</p>
>                                        ^^^^  ← só isto muda
> ```

---

## PASSO 1 · Duplique o report do mês anterior

Na pasta `reports/`, copie o arquivo do último mês e renomeie com o novo mês, no formato `AAAA-MM`:

```
reports/2026-09.html  →  reports/2026-10.html
```

Crie também a pasta de imagens do mês: `assets/2026-10/`.

> Primeiro mês ou quer começar limpo? Copie `template/report-template.html` para `reports/AAAA-MM.html`. Ele já vem com todos os campos como placeholder.

## PASSO 2 · Altere o mês

Abra o novo arquivo e pesquise (Ctrl+F) por **`01 MÊS`**. São 6 pontos:

1. assunto do e-mail (`<title>`)
2. cabeçalho: `REPORT | OUTUBRO 2026`
3. visão geral: `VISÃO GERAL · OUTUBRO 2026`
4. "Foco de…" (o mês seguinte)
5. "Até…" no encerramento (o mês seguinte)
6. rodapé: `Report | Outubro 2026`

Depois, atualize a manchete (`02 TÍTULO`) e o resumo (`03 RESUMO`, dois lugares: a síntese visível e o texto de pré-visualização, que aparece na caixa de entrada ao lado do assunto).

## PASSO 3 · Atualize as métricas

Pesquise **`04 MÉTRICAS`**.

- **Visão geral:** 4 métricas ao redor do visual central. A primeira é a principal do mês. Valor curto (até ~11 caracteres, ex.: `~R$ 100 mil`) e rótulo em 2 linhas: **o que é** + contexto.
- **Faixa vermelha:** resultado principal à esquerda; à direita, os resultados de cada case.
- **Cases:** a tabela "antes → depois". Para mais uma linha, copie um `<tr>...</tr>` inteiro.

Padrão de escrita: `3,6x`, `+89%`, `R$ 0,68`, `&minus;12%` (sinal de menos).

## PASSO 4 · Troque as imagens

Pesquise **`07 IMAGENS`**. Cada espaço diz o tamanho certo.

1. Exporte a imagem em **JPG**, com o **dobro da largura** indicada (nitidez em telas de alta resolução) e até ~200 KB.
2. Salve em `assets/AAAA-MM/` com nome simples, sem espaço nem acento (ex.: `visual-principal.jpg`).
3. No HTML, **apague a tabela do placeholder**: começa logo depois de `<!-- PLACEHOLDER · ... -->` e termina no `</table>` correspondente.
4. **Ative a linha `<img>`** que está comentada logo acima: apague o `<!--` do começo e o `-->` do fim.
5. Ajuste o caminho (`../assets/AAAA-MM/nome.jpg`) e o `alt` (descrição curta da imagem).

```html
<!-- antes -->
<!-- <img src="../assets/2026-09/visual-principal.jpg" width="240" alt="[Descreva a imagem]" style="..."> -->
<!-- PLACEHOLDER · visual central -->
<table ...> ... caixa tracejada ... </table>

<!-- depois -->
<img src="../assets/2026-10/visual-principal.jpg" width="240" alt="KV de Dia das Crianças" style="...">
```

Não tem a imagem ainda? Deixe o placeholder. A ferramenta de .eml vai lembrar você.

## PASSO 5 · Atualize os vídeos e links

Pesquise **`08 VÍDEOS`** e **`10 LINKS`**.

- Título, categoria, acessos (`12.450 acessos`), duração (`1:32`) e uma frase de descrição.
- Troque `#COLE-O-LINK-DO-STREAM` pelo **link de compartilhamento** do Stream.
- Miniatura: print do vídeo em 16:9, 440 x 248 px. Use a linha comentada `<a href="LINK"><img ...></a>`, que deixa a imagem clicável.
- Ordene do mais visto para o menos visto e atualize a posição (`01`, `02`, `03`).

Confira se o vídeo está compartilhado com **o mesmo público do e-mail**. Quem não tem acesso vê a tela "solicitar acesso".

## PASSO 6 · Atualize Creative X

Pesquise **`06 SCORES`** e **`05 CREATIVE X`**.

| Campo | Exemplo |
|---|---|
| Anterior | `78%` + período (`jul/ago`) |
| Atual | `91%` + período (`ago/set`) |
| Variação | `+13 p.p.` (atual − anterior) |
| Barra "Anterior" | `width="78%"` e `width="22%"` |
| Barra "Atual" | `width="91%"` e `width="9%"` |
| Referências | média do ano, meta, média global |
| Principal ganho | uma frase sobre o que puxou o score |

As duas células de cada barra **sempre somam 100%**.

## PASSO 7 · Atualize os aprendizados

Pesquise **`09 APRENDIZADOS`**. Cada linha tem três caixas:

- **O que aconteceu?** O resultado, com o número. *Ex.: "Criativos com contexto de Copa tiveram CTR 89% maior."*
- **O que aprendemos?** A conclusão, não o número de novo. *Ex.: "Contexto que o cliente já vive aumenta a relevância."*
- **O que levamos?** A implicação prática. *Ex.: "Priorizar gatilhos de contexto nos próximos testes."*

Por fim, o **Foco de [próximo mês]**: uma frase com a principal ação que sai desses aprendizados. E atualize a agenda **Vem aí**.

## PASSO 8 · Abra no navegador para revisar

Dê dois cliques no arquivo `reports/AAAA-MM.html`. Confira:

- textos, números e meses;
- imagens aparecendo (quadro vazio = caminho errado);
- celular: aperte F12, depois Ctrl+Shift+M e escolha um tamanho de celular.

## PASSO 9 · Teste no Outlook

1. Abra `tools/gerar-eml.html`, selecione a pasta do projeto e leia as **pendências**.
2. Gere o `.eml`, abra no Outlook e **envie só para você**.
3. Abra o e-mail recebido no Outlook do computador, no Outlook na Web e no celular. Clique nos links.

Use a lista completa em [TEST_CHECKLIST.md](TEST_CHECKLIST.md).

## PASSO 10 · Gere e envie o .eml

Com as pendências zeradas, gere o `.eml` de novo, abra no Outlook, preencha os destinatários e envie. Passo a passo e alternativas em [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

---

## Referência rápida

### Como duplicar um bloco

Blocos repetíveis começam em `<!-- INÍCIO BLOCO · ... -->` e terminam em `<!-- FIM BLOCO · ... -->`.

1. Selecione do `INÍCIO BLOCO` até o `FIM BLOCO` (inclusive).
2. Copie (Ctrl+C).
3. Clique logo depois do `FIM BLOCO` e cole (Ctrl+V).
4. Edite o conteúdo do bloco novo.

Blocos disponíveis: **CASE**, **LINHA DE DESTAQUES** (2 destaques por linha), **CONTEÚDO (VÍDEO)**, **CONTEÚDO (PEÇA)**, **APRENDIZADO** e **ITEM DA AGENDA**.

### Como remover um bloco

Selecione do `INÍCIO BLOCO` ao `FIM BLOCO` e apague. Na linha de destaques com número ímpar, apague só o conteúdo da segunda célula (`<td ...>` ... `</td>`) e deixe a célula vazia.

### Como remover uma seção inteira

Cada seção começa num comentário `SEÇÃO 0X · ...`. Apague desde esse comentário até o início da seção seguinte e renumere as seções depois dela (`01`, `02`...).

### O que NÃO alterar

| Onde | Por quê |
|---|---|
| Linhas marcadas `ESTRUTURA` | Moldura de 680 px, fundo e barra vermelha |
| O bloco `<style>` no topo | Adaptação para celular |
| Comentários `<!--[if mso]>` | Correções específicas do Outlook para Windows |
| Atributos `width="..."`, `cellpadding`, `cellspacing`, `border` | O Outlook usa esses atributos para montar o layout |
| `font-family:Arial,...` | Sem isso o Outlook troca a fonte por Times New Roman |

### Erros comuns

| Sintoma | Causa | Correção |
|---|---|---|
| Parte da página sumiu | Um `-->` apagado ao ativar uma imagem | Confira se cada `<!--` tem o seu `-->` |
| Coluna desalinhada | Um `</td>` ou `</table>` apagado | Desfaça (Ctrl+Z) e refaça só a troca de texto |
| Barra do Creative X estranha | As duas larguras não somam 100% | Ajuste a segunda célula |
| Acento estranho (Ã©) | Arquivo salvo em outra codificação | Salve como **UTF-8** (no Bloco de Notas: Salvar como → Codificação UTF-8) |
