# Como enviar o report

O e-mail precisa levar as imagens **anexadas inline** (`cid:`). Assim elas aparecem no Outlook sem o leitor clicar em "Baixar imagens" e sem depender de login no SharePoint.

## 1. Gerar

- **Sem instalar nada:** abra `gerador.html` no Edge ou Chrome, clique em "Abrir pasta do report", confira a prévia e as pendências e clique em "Gerar pacote de envio".
- **Com Node:** `node build.js conteudo/2026-09.json nome.sobrenome@empresa.com` gera `dist/2026-09/sendmail.json`.

O arquivo `sendmail.json` é o corpo pronto da chamada `POST https://graph.microsoft.com/v1.0/me/sendMail`. Troque o destinatário `[DESTINATARIO@EMPRESA]` antes de enviar.

## 2. Enviar (do mais simples ao automatizado)

1. **Teste para você mesmo:** use o Graph Explorer logado com a conta corporativa, método POST, URL `https://graph.microsoft.com/v1.0/me/sendMail`, corpo = conteúdo do `sendmail.json`. Requer o consentimento `Mail.Send`, que pode estar bloqueado pela TI.
2. **PowerShell (Microsoft Graph PowerShell):**
   ```powershell
   Connect-MgGraph -Scopes Mail.Send
   Invoke-MgGraphRequest -Method POST -Uri "https://graph.microsoft.com/v1.0/me/sendMail" -Body (Get-Content .\dist\2026-09\sendmail.json -Raw) -ContentType "application/json"
   ```
3. **Power Automate:** ação "Enviar uma solicitação HTTP" do conector Office 365 Outlook, método POST, URI `https://graph.microsoft.com/v1.0/me/sendMail`, corpo = `sendmail.json`. Depende da política de conectores do tenant.

## 3. Checklist antes do envio geral

- Enviar primeiro para você e abrir no Outlook clássico, no novo Outlook, no Outlook na Web e no celular.
- Clicar em cada miniatura de vídeo com uma conta de fora do time e confirmar que o Stream abre.
- Conferir o modo escuro do Outlook.
- Zerar as pendências listadas pelo gerador.

## Por que não colar o HTML direto no Outlook

O Outlook não tem campo para colar código HTML. Colar a página renderizada a partir do navegador perde parte da formatação e, no novo Outlook e no Outlook na Web, as imagens locais não são anexadas. O envio pelo Graph preserva o HTML exatamente como foi gerado.
