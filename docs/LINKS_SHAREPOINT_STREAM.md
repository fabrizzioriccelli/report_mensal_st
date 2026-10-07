# Links: SharePoint e Stream

Guia para não colar o tipo errado de link. Vale para os campos `link:` do arquivo de dados.

> **Resumo em uma linha:** abra o arquivo no SharePoint (ou o vídeo no Stream), clique em **Compartilhar**, escolha **"Pessoas em [nome da empresa]"** e clique em **Copiar link**. Cole esse link no campo `link:`.

## Onde guardar as peças e os vídeos

| Lugar | Recomendado? | Por quê |
|---|---|---|
| **Biblioteca de um site do SharePoint do time** (ex.: "Creative Strategy PF › Report mensal › 2026-10") | **Sim** | O arquivo é do time, não de uma pessoa. As permissões ficam organizadas e o link continua funcionando se alguém mudar de área |
| OneDrive pessoal | Evite | Se a pessoa sair da empresa, os arquivos e links podem deixar de existir |
| Pasta de rede (`\\servidor\...`) ou o seu computador (`C:\...`) | **Não** | Só funciona para quem tem aquele acesso e o Outlook bloqueia. A ferramenta recusa esse tipo de endereço |
| Site público, Google Drive, WeTransfer, YouTube | **Não** | Conteúdo interno fora do ambiente aprovado. Também costuma ser bloqueado na rede do banco |

Sugestão de organização no SharePoint, espelhando o projeto:

```text
Report mensal/
├── 2026-09/
│   ├── seguro-conta-cartao.jpg      (peça em alta)
│   ├── copa-do-mundo.jpg
│   └── creator-reneg.mp4            (vídeo: abre no Stream)
└── 2026-10/
```

## Qual link usar

| Tipo de link | Exemplo de formato | Usar? |
|---|---|---|
| **Link de compartilhamento** (botão "Copiar link") | `https://empresa.sharepoint.com/:i:/s/site/E...` (imagem) · `https://empresa.sharepoint.com/:v:/s/site/E...` (vídeo) · `.../:b:/...` (PDF) · `.../:p:/...` (PowerPoint) | **Sim** |
| Endereço da barra do navegador, com o arquivo aberto | `https://empresa.sharepoint.com/sites/site/Documentos%20Compartilhados/...` | Funciona para quem já tem acesso à biblioteca. Prefira o de compartilhamento |
| Código de incorporação (embed/iframe) | `<iframe src=".../embed.aspx...">` | **Não**: e-mail não toca vídeo incorporado. A ferramenta avisa |
| Link de download | termina em `?download=1` | **Não**: baixa o arquivo em vez de abrir. A ferramenta avisa |
| Link direto do arquivo de vídeo | termina em `.mp4` | Evite: abre sem o player do Stream (legendas, controles). A ferramenta avisa |
| Stream (Clássico) | `https://web.microsoftstream.com/...` | **Não**: a Microsoft desativou. A ferramenta avisa |
| Caminho de rede ou local | `\\servidor\...`, `C:\...`, `file://` | **Não**: a ferramenta recusa |

As letras depois do domínio indicam o tipo de arquivo: `:i:` imagem, `:v:` vídeo, `:b:` PDF, `:p:` PowerPoint, `:w:` Word, `:f:` pasta. Elas ajudam a conferir se você copiou o link certo: uma peça deveria ter `:i:` e um vídeo, `:v:`.

## Quem pode abrir: as opções de compartilhamento

Ao clicar em **Compartilhar → Configurações do link** (o texto pode variar conforme a versão do Microsoft 365), aparecem opções como estas:

| Opção | O que acontece | Usar no report? |
|---|---|---|
| **Pessoas em [empresa]** | Qualquer pessoa logada na conta da empresa abre | **Sim, recomendado** (se a política permitir para esse conteúdo) |
| **Pessoas com acesso existente** | Só quem já tem permissão na pasta ou no site abre | Sim, **se** o público do e-mail já tiver acesso ao site do time |
| Pessoas específicas | Só as pessoas digitadas abrem | **Não**: o resto da lista recebe "Você precisa de permissão" |
| Qualquer pessoa (Anyone) | Qualquer um com o link, sem login | **Não** para conteúdo interno. Geralmente é desativado pela TI |

**VALIDAR COM TI / SEGURANÇA / ADMINISTRAÇÃO MICROSOFT 365:**
- qual opção é permitida para peças de campanha e vídeos internos;
- se os links da empresa **expiram** (algumas empresas configuram validade). Se expirarem, o report antigo perde os links depois desse prazo;
- se uma **lista de distribuição** pode receber permissão direta num site do SharePoint.

## O que acontece quando a pessoa clica

1. O Outlook abre o navegador padrão (ou o app, no celular).
2. O **Safe Links** da Microsoft pode passar o endereço por uma verificação de segurança antes. É normal e não muda nada.
3. Se a pessoa **já está logada** na conta da empresa (o normal no computador do banco), o arquivo abre direto.
4. Se não está, aparece o login da Microsoft. Depois de entrar, o arquivo abre.
5. **Imagem:** abre no visualizador do SharePoint, em tamanho grande, com zoom.
6. **Vídeo:** abre no player do Stream, com som, controles, velocidade e legendas (se houver).

No celular, o link pode abrir no app do SharePoint/Stream ou no navegador. Políticas de segurança do celular corporativo podem exigir um navegador específico (por exemplo, o Edge). VALIDAR COM TI.

## Como colar o link no arquivo de dados

```text
[LANCAMENTO 2]
nome: Creator em Reneg
imagem: creator-reneg.jpg
tipo: video
link: https://empresa.sharepoint.com/:v:/s/creative/EaBcD123...
```

- Cole o link inteiro, numa linha só, logo depois de `link: `.
- `tipo: video` faz aparecer "▶ Assistir" e o ▶ na miniatura. Para imagem, use `tipo: peca` ("Ver peça →").
- Sem link? Deixe `link:` vazio: a peça aparece sem botão.

## Como verificar se todo mundo vai conseguir abrir

**Antes de colar o link:**
1. No SharePoint, abra o arquivo → **Compartilhar** → confira que a opção é "Pessoas em [empresa]" (ou "acesso existente" num site que o público já acessa).
2. Para ver quem tem acesso: menu **⋯ → Gerenciar acesso**. Não deve haver só nomes individuais se a ideia é a área toda abrir.

**Depois de gerar o e-mail:**
1. Na página `gerar-report.html`, seção **3 · Teste os links**, clique em **Abrir** em cada linha:
   - imagem: abre grande?
   - vídeo: dá play? **tem som?** os controles funcionam?
2. **Teste com outra pessoa** (o passo mais importante). Envie o rascunho para um colega de **outra equipe**, que não participou da produção, e peça para ele clicar em todos os botões. Ninguém consegue testar a permissão dos outros só pela própria conta.
3. Se aparecer "Você precisa de permissão" para alguém, corrija o compartilhamento no SharePoint. **O link continua o mesmo**: não precisa gerar o e-mail de novo.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| "Você precisa de permissão" | Link de "Pessoas específicas" ou pasta sem acesso | Troque para "Pessoas em [empresa]" e copie o link de novo |
| O vídeo abre, mas não toca ou fica processando | Vídeo recém-enviado ainda em processamento | Espere alguns minutos e teste de novo |
| O vídeo toca sem som | Áudio do arquivo original, ou som do computador | Teste em outro computador; confira o arquivo original |
| O arquivo baixa em vez de abrir | Link de download | Copie o link pelo botão "Copiar link" |
| Abre a pasta em vez do arquivo | Link copiado da pasta | Abra o arquivo e copie o link dele |
| Pede login toda vez no celular | Política de dispositivo móvel | Normal em ambiente corporativo; VALIDAR COM TI se for um problema |
| Funcionou para você e não para os outros | Você é dono do arquivo e tem acesso total | Sempre teste com outra pessoa |
