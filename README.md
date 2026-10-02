# Creative Strategy PF · Report mensal (template v2)

Template do report mensal, fiel ao layout original, com **e-mail como canal principal** e uma versão web interativa opcional. O conteúdo de cada mês fica num único JSON; o layout não muda.

## Abrir agora

| Arquivo | O que é |
|---|---|
| `dist/2026-09/email.html` | Prévia do e-mail de setembro (o que chega no Outlook). |
| `dist/2026-09/report.html` | Versão web interativa, com vídeo em modal e ampliação de imagens. |
| `gerador.html` | Área de atualização: edite o JSON, veja a prévia e exporte o pacote de envio. |

## Atualizar o mês

1. Copie `conteudo/2026-09.json` para `conteudo/AAAA-MM.json` e troque textos, números, imagens e vídeos.
2. Coloque as imagens em `assets/AAAA-MM/` (JPEG, até ~200 KB, 2x o tamanho exibido). As peças originais podem ser extraídas do .pptx: renomeie para .zip e abra `ppt/media/`.
3. Para cada vídeo, preencha `link` (link de compartilhamento do Stream), `acessos`, `duracao` e `thumb`.
4. Abra `gerador.html` > "Abrir pasta do report" e zere as pendências.
5. Gere o pacote e envie (ver `docs/ENVIO.md`), ou rode `node build.js conteudo/AAAA-MM.json`.

## Estrutura

```
conteudo/2026-09.json   conteúdo do mês (único arquivo editado)
assets/2026-09/         imagens do mês (placeholders recortados do PPT de referência)
template/render.js      layout fixo: gera o e-mail e a versão web
build.js                automação: JSON → dist/
gerador.html            edição e exportação no navegador
dist/2026-09/           email.html, sendmail.json (Graph), report.html
docs/                   ARQUITETURA.md (o que funciona no e-mail, peso, automação) e ENVIO.md
```

## Limites conhecidos

- E-mail não executa JavaScript nem toca vídeo em nenhuma versão do Outlook: o vídeo abre no Stream com um clique.
- Imagens hospedadas no SharePoint não aparecem no e-mail; por isso vão anexadas inline.
- O e-mail foi verificado no Chromium e por checagem automática de compatibilidade. Teste no Outlook clássico, novo Outlook, Outlook na Web e celular antes do envio geral.
- As imagens atuais são recortes da referência, em baixa resolução. Substitua pelas originais.
- `assets/video-teste.mp4` é um vídeo de teste só para demonstrar o player da versão web.
