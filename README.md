# Creative Strategy PF · Report mensal em HTML

Protótipo funcional do report mensal da Creative Strategy PF como experiência web, com vídeo tocando dentro da página e preparado para imagens e vídeos hospedados no Microsoft 365 (SharePoint e Stream).

> Os números, cases e vídeos deste protótipo são **ilustrativos**. O selo "Protótipo · dados ilustrativos" some quando `REPORT_CONFIG.meta.demoData = false`.

## Conteúdo do repositório

| Arquivo | Para que serve |
|---|---|
| `report-mensal.html` | O report completo, em um único arquivo (HTML + CSS + JavaScript, sem CDN e sem fontes externas). |
| `assets/video-teste.mp4` | Vídeo real de teste (H.264 + AAC, 720p, 36 s, com *faststart*). Use para validar o modo `file` e o upload no SharePoint. |
| `assets/video-teste.vtt` | Legenda WebVTT do vídeo de teste. |

## Como abrir e testar

1. Abra `report-mensal.html` no Edge ou no Chrome (duplo clique funciona).
2. Navegue pelos capítulos no topo, pelo botão **Índice** ou rolando a página. A formiga caminha na barra vermelha conforme a leitura avança.
3. Clique em **Assistir ao mês em 45s** ou em qualquer miniatura. O player abre dentro do report com play/pausa, barra com capítulos, prévia de frames, volume, velocidade, legendas e tela cheia.
4. Atalhos no player: `Espaço`/`K` play e pausa, `←` `→` 5 s, `J` `L` 10 s, `M` som, `C` legendas, `F` tela cheia, `Esc` fecha.
5. O vídeo **Bastidores da produção** usa o MP4 real de `assets/` pela tag `<video>`. Se o arquivo não estiver ao lado do HTML, o report mostra a simulação no lugar.
6. No capítulo **06 Bastidores**, o **Teste de mídia** analisa uma URL ou código do Stream colado e abre no player. Também aceita um vídeo do seu computador.

A legenda `.vtt` só carrega quando o report é servido por HTTP/HTTPS (no SharePoint ou num servidor local). Aberto via `file://`, o navegador bloqueia legendas externas e o botão de legenda some para esse vídeo.

## Onde editar

Tudo fica no bloco `<script>` no fim do arquivo:

- `SHAREPOINT_ASSETS`: URLs de imagens e vídeos. Campo vazio usa a arte gerada pelo protótipo, sem quebrar o layout.
- `REPORT_CONFIG`: textos, números, cases, peças, aprendizados e próximos passos do mês. `**negrito**` vira destaque.
- `DEMO_FILMS`: roteiros dos vídeos simulados. Deixam de ser usados quando os vídeos reais entram.

### Tipos de vídeo em `SHAREPOINT_ASSETS.videos`

| `type` | Quando usar | O que colar em `src` |
|---|---|---|
| `stream` | Produção (recomendado). Respeita permissões, streaming adaptativo, legendas e estatísticas do Stream. | O código `<iframe>` de **Compartilhar > Código de inserção** do Stream, ou só o endereço `.../_layouts/15/embed.aspx?UniqueId=...`. |
| `file` | Controle total do player do report. Funciona sem ressalvas com o report publicado no mesmo SharePoint. | A **URL direta** do `.mp4` (H.264 + AAC). Nunca o link de compartilhamento `/:v:/`. |
| `demo` | Protótipo. | Nada. |
| `auto` | Deixar o report detectar. | Qualquer um dos anteriores. |

Campos opcionais: `poster`, `captions` (`.vtt` na mesma origem), `openUrl` (abrir no Stream em nova aba) e `fallback: "demo"`.

## Publicação no SharePoint

O SharePoint Online **não abre arquivos `.html` no navegador**: ele baixa o arquivo. Isso é comportamento de produto e não tem configuração. Por isso há dois caminhos:

- **Opção A, mais simples.** O HTML circula como arquivo (biblioteca do time ou Teams) e cada pessoa abre no navegador. Vídeos entram pelo embed do Stream, que pede login no Microsoft 365 e respeita permissões. Imagens vão embutidas no HTML (base64) para não depender de sessão.
- **Opção B, mais robusta.** O mesmo código empacotado como web part do SharePoint Framework (SPFx), publicado pela TI no catálogo de apps e adicionado a uma página moderna. O report ganha link único, abre com SSO e carrega imagens e vídeos do próprio SharePoint na mesma origem. Desde março de 2026 o SharePoint Online aplica CSP e bloqueia script inline em soluções SPFx: o código precisa ir no pacote SPFx, o que este arquivo já facilita (sem CDN, sem handlers inline).

## Atualização mensal

1. Copiar textos e números do PPT para `REPORT_CONFIG`.
2. Subir imagens e vídeos em `/Report Mensal/AAAA-MM/` no SharePoint do time.
3. Gerar o código de inserção do Stream de cada vídeo.
4. Colar as URLs em `SHAREPOINT_ASSETS` e validar no **Teste de mídia**.
5. Pedir para alguém de fora do time abrir e assistir, para conferir permissões.
6. Publicar e avisar pelo Teams ou e-mail.

## Acessibilidade e compatibilidade

- HTML semântico, navegação por teclado, foco visível, `aria-*` nos controles, legendas nos vídeos e tabela de dados em cada gráfico.
- Respeita `prefers-reduced-motion`. A prévia animada do reel tem botão de pausa.
- Testado em Chromium (desktop 1440 px, tablet 834 px e celular 390 px). Edge e Chrome atuais tocam MP4 H.264; Firefox e Safari atuais também.
