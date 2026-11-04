# Kit do report mensal

A pasta que o time recebe. **Mantenha os arquivos juntos, na mesma pasta:** as chamadas da apresentação abrem os outros arquivos daqui pelo nome (links relativos), no PowerPoint e no PDF.

| Arquivo | Para quê |
|---|---|
| `emulador-report.html` | **Emulador Report PF**: abrir, editar, salvar o report PF e gerar o e-mail-resumo. Dois cliques (Chrome ou Edge). Funciona sozinho, em qualquer pasta |
| `emulador-report-pj.html` | **Emulador Report PJ** (Santander Empresas): o mesmo emulador, para o report PJ. Só abre reports PJ (e o PF, só reports PF) |
| `guia-operacional.pdf` | O guia unificado PF + PJ, passo a passo, com telas reais dos dois emuladores e a biblioteca de prompts do Copilot. `.pptx` editável ao lado |
| `apresentacao-executiva.pdf` | A nova experiência em 10 slides. Chamadas: **Acessar emulador** › `emulador-report.html` · **Baixar guia operacional** › `guia-operacional.pdf` · **Explorar report completo** › `report-exemplo.html` |
| `apresentacao-executiva-canva.pdf` | A mesma apresentação, para importar no **Canva**: cada slide é uma imagem em alta resolução, então o Canva não troca a fonte nem mexe no layout. O texto não fica editável no Canva; para mudar um texto, edite o `.pptx` e gere o PDF de novo |
| `report-exemplo.html` | Um report completo de exemplo, com conteúdo fictício (Janeiro 2099) |
| `report-coringa.html` | O modelo em branco do PF (o mesmo que o emulador abre em "Começar do modelo em branco") |
| `report-exemplo-pj.html` | Um report PJ completo de exemplo, com conteúdo fictício (Janeiro 2099) |
| `report-coringa-pj.html` | O modelo em branco do PJ |

- Todo o conteúdo deste kit é **fictício** ou modelo em branco. O kit de cada mês, com o report real, fica só no ambiente corporativo autorizado; nele, a chamada "Explorar report completo" aponta para o `report-AAAA-MM.html` do mês.
- Ao publicar a apresentação num ambiente com endereço próprio (intranet), troque as chamadas pelos endereços publicados (PowerPoint: botão direito no botão › **Editar link**).
- `emulador-report.html` e `emulador-report-pj.html` são gerados: `node tools/montar-avulso.js` e `node tools/montar-avulso.js pj` (quem mantém a ferramenta). O guia é gerado com capturas reais dos dois emuladores em execução (`tools/guia/`).
