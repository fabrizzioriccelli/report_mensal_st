# Kit do report mensal

A pasta que o time recebe. **Mantenha os arquivos juntos, na mesma pasta:** as chamadas da apresentação abrem os outros arquivos daqui pelo nome (links relativos), no PowerPoint e no PDF.

| Arquivo | Para quê |
|---|---|
| `emulador-report.html` | **O emulador**: abrir, editar, salvar o report e gerar o e-mail-resumo. Dois cliques (Chrome ou Edge). Funciona sozinho, em qualquer pasta |
| `guia-operacional.pdf` | O guia passo a passo, com telas reais e a biblioteca de 12 prompts do Copilot. `.pptx` editável ao lado |
| `apresentacao-executiva.pdf` | A nova experiência em 10 slides. Chamadas: **Acessar emulador** › `emulador-report.html` · **Baixar guia operacional** › `guia-operacional.pdf` · **Explorar report completo** › `report-exemplo.html` |
| `report-exemplo.html` | Um report completo de exemplo, com conteúdo fictício (Janeiro 2099) |
| `report-coringa.html` | O modelo em branco (o mesmo que o emulador abre em "Começar do modelo em branco") |

- Todo o conteúdo deste kit é **fictício** ou modelo em branco. O kit de cada mês, com o report real, fica só no ambiente corporativo autorizado; nele, a chamada "Explorar report completo" aponta para o `report-AAAA-MM.html` do mês.
- Ao publicar a apresentação num ambiente com endereço próprio (intranet), troque as chamadas pelos endereços publicados (PowerPoint: botão direito no botão › **Editar link**).
- `emulador-report.html` é gerado: `node tools/montar-avulso.js` (quem mantém a ferramenta). O guia e a apresentação são gerados com as capturas do emulador em execução.
