# Arquitetura: report mensal por e-mail + versão interativa

## Princípio

O layout é fixo e fiel ao report original. A tecnologia muda conforme o canal:

| Canal | O que entrega | Tecnologia |
|---|---|---|
| **E-mail** (canal principal) | O report inteiro, com dados, imagens e vídeos clicáveis | HTML de e-mail: tabelas, estilos inline, imagens anexadas inline (`cid:`), sem JavaScript |
| **Stream** | O vídeo tocando, com login automático e permissões | Link de compartilhamento do Stream (on SharePoint) |
| **Versão interativa** (opcional) | O mesmo layout com vídeo dentro da página e ampliação de imagens | `report.html` publicado como página do SharePoint (web part SPFx) |

Fluxo do leitor: abre o e-mail, vê o report completo no Outlook e clica na miniatura de um vídeo. O Stream abre no navegador já logado e o vídeo toca.

## O que funciona dentro de um e-mail

| Recurso | Outlook clássico (Windows) | Novo Outlook / Outlook na Web | Outlook iOS e Android | Decisão |
|---|---|---|---|---|
| Layout em tabelas + estilos inline | Sim | Sim | Sim | **Usado** |
| `<style>` com media queries | Ignora (largura fixa de 800 px) | Sim | Sim, na maior parte | Usado só para o empilhamento no celular |
| Flexbox, grid, `position` | Não (motor do Word) | Parcial | Parcial | **Evitado** |
| JavaScript | Não | Não (removido) | Não | **Nenhum script no e-mail** |
| `<video>` / iframe | Não | Não | Não | **Miniatura + link para o Stream** |
| Imagem anexada inline (`cid:`) | Sim | Sim | Sim | **Usado**: aparece sem clicar em "baixar imagens" |
| Imagem externa por URL pública | Bloqueada até o clique em "Baixar imagens" | Pode ser bloqueada | Pode ser bloqueada | Evitado |
| Imagem hospedada no SharePoint | Não carrega: o Outlook não envia o login do SharePoint | Não confiável | Não confiável | **Evitado** |
| Imagem em base64 (`data:`) | Bloqueada | Parcial | Parcial | **Evitado** |
| GIF animado | Versões antigas mostram só o 1º quadro | Sim | Sim | Opcional (prévia do vídeo em destaque) |
| Botão com cantos arredondados | Só com VML | Sim | Sim | VML + fallback já no template |

O Outlook clássico usa o motor de renderização do Word. A Microsoft anunciou suporte a ele por pelo menos mais alguns anos, então o template trata esse motor como o pior caso a atender.

## Peso

| Item | Orçamento | Este mês |
|---|---|---|
| HTML do e-mail | até ~100 KB | 44 KB |
| Cada imagem | até ~200 KB, 2x o tamanho exibido, JPEG | 3 a 30 KB (placeholders) |
| Pacote completo (HTML + imagens) | até ~3 MB num único envio pelo Graph | 318 KB |

Vídeos nunca vão dentro do e-mail. O peso de um vídeo fica no Stream, que entrega streaming adaptativo.

## Vídeos

- **No e-mail:** miniatura com o botão de play gravado na própria imagem (o Outlook não sobrepõe elementos), número de acessos, duração e link de compartilhamento do Stream.
- **Na versão web:** `embed` (iframe do Stream) toca dentro do report; `arquivo` (MP4 direto, mesma origem) toca com a tag de vídeo; sem nenhum dos dois, abre o link do Stream.
- **Permissão:** o vídeo precisa estar compartilhado com o mesmo público do e-mail (o grupo/lista de distribuição). Quem não tem acesso vê a tela de "solicitar acesso" do SharePoint.
- **Prévia animada (opcional):** um GIF curto do vídeo de maior acesso dá movimento ao e-mail onde há suporte. Exemplo com ffmpeg:
  `ffmpeg -ss 2 -t 3 -i video.mp4 -vf "fps=10,scale=528:-1:flags=lanczos" -loop 0 preview.gif` (mire em até ~600 KB).

## Separação template + conteúdo

```
conteudo/AAAA-MM.json   ← conteúdo do mês (o único arquivo editado)
assets/AAAA-MM/         ← imagens do mês
template/render.js      ← layout fixo: gera e-mail e versão web
build.js                ← automação (Node): JSON → dist/
gerador.html            ← edição e exportação no navegador, sem instalar nada
dist/AAAA-MM/           ← saídas: email.html, sendmail.json, report.html
```

O mesmo `render.js` roda no navegador, no Node e pode ser portado para Office Scripts (TypeScript), o que abre o caminho de automação abaixo.

## Automação no Microsoft 365 (proposta, não construída)

1. **Dados:** uma planilha Excel no SharePoint do time (abas: métricas, cases, temas, vídeos, vem aí) substitui o JSON. As métricas podem vir de exportações ou do Power BI.
2. **Acessos dos vídeos:** a API de análise de itens do Microsoft Graph (`/analytics/allTime` de um arquivo) retorna contagem de acessos de cada vídeo no SharePoint. O número pode diferir do painel do Stream; validar antes de usar no ranking.
3. **Imagens:** pasta `/Report Mensal/AAAA-MM/` no SharePoint, já exportadas no tamanho certo pelo time.
4. **Geração:** Power Automate executa um Office Script (ação "Executar script" do Excel Online) que monta o HTML com o mesmo template e devolve o texto.
5. **Envio:** Power Automate lê as imagens da pasta, monta os anexos inline e chama `POST /me/sendMail` pelo conector Office 365 Outlook ("Enviar uma solicitação HTTP"). Antes do envio geral, uma etapa de aprovação manda a prévia para a gerente.
6. **Versão web:** o fluxo publica o JSON do mês na biblioteca; a web part SPFx lê esse JSON e a página sempre mostra o mês corrente.

Pontos a validar com a TI: políticas de DLP de conectores do Power Automate, permissão do conector para chamar o Graph, limites de execução de Office Scripts e aprovação de web parts SPFx (o SharePoint Online aplica CSP desde 2026 e bloqueia script inline).
