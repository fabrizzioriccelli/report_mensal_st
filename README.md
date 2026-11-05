# Report Mensal · Creative Strategy PF e PJ

Modelo do report mensal da Creative Strategy PF (Customer Interactions), em duas experiências que saem **da mesma página**:

- **o report completo** (HTML): movimento ao rolar, vídeos, peças e documentos no clique;
- **o e-mail-resumo** (Outlook): a porta de entrada, estático, com a frase do mês, até 4 destaques escolhidos por você (números, campanhas, "O que aprendemos" ou uma informação nova revisada, com imagem e link opcionais) e um único botão principal, "Acessar report completo". Também sai como imagem (`.png`), para prévia.

O time atualiza tudo no **emulador**: um arquivo só, que abre no Chrome ou no Edge, sem instalar nada.

**Versão 5.3 (2026-11-05).** Histórico em [CHANGELOG.md](CHANGELOG.md).

**Dois emuladores, o mesmo sistema:** o **Emulador Report PF** (Creative Strategy PF) e o **Emulador Report PJ** (Santander Empresas, pelo capítulo 6 do Brand Guide). As funções são as mesmas e, a partir da 5.1, **o esqueleto da página também** (o do PJ): muda a identidade (cores e formiguinha), o ícone da aba e os nomes das seções. Um não abre o report do outro. Detalhes do PJ: [docs/REPORT_PJ.md](docs/REPORT_PJ.md).

<p>
<img src="docs/preview-modelo.jpg" width="420" alt="Prévia do modelo em branco no computador">
&nbsp;
<img src="docs/preview-modelo-celular.jpg" width="200" alt="Prévia do modelo em branco no celular">
</p>

> Este repositório é um **modelo sem dados**: o modelo em branco tem textos [entre colchetes] e números em **X**; o exemplo de treinamento é **fictício** (Janeiro 2099). Nada disso é resultado real. Os dados de cada mês ficam só no ambiente corporativo autorizado (veja [Segurança dos dados](#segurança-dos-dados)).
>
> Identidade visual conforme o **Brand Guide Santander Brasil (maio/2026)**: paleta, tipografia, chama, cantos e tom de voz ([ARQUITETURA.md › Brand Guide](docs/ARQUITETURA.md#brand-guide-como-foi-aplicado-num-e-mail)).

---

## Para o time: o kit

Tudo o que o time usa está em **[`kit/`](kit/)**:

| Arquivo | Para quê |
|---|---|
| [`emulador-report.html`](kit/emulador-report.html) | **Emulador Report PF.** Abre o modelo em branco ou o report salvo, edita textos, indicadores, imagens e links na própria página, salva o report do mês e gera o e-mail-resumo (`.eml`) |
| [`emulador-report-pj.html`](kit/emulador-report-pj.html) | **Emulador Report PJ** (Santander Empresas): o mesmo emulador, para o report PJ |
| [`guia-operacional.pdf`](kit/guia-operacional.pdf) | **O guia unificado PF + PJ**, passo a passo, com telas reais dos dois emuladores e a biblioteca de prompts do Copilot ([.pptx](kit/guia-operacional.pptx) editável) |
| [`apresentacao-executiva.pdf`](kit/apresentacao-executiva.pdf) | A apresentação da nova experiência, 10 slides ([.pptx](kit/apresentacao-executiva.pptx)). As chamadas abrem os arquivos desta pasta |
| [`report-exemplo.html`](kit/report-exemplo.html) | Um report completo de exemplo (fictício), para ver a experiência |
| [`report-coringa.html`](kit/report-coringa.html) · [`report-coringa-pj.html`](kit/report-coringa-pj.html) | Os modelos em branco do PF e do PJ (os mesmos que cada emulador abre em "Começar do modelo em branco") |
| [`report-exemplo-pj.html`](kit/report-exemplo-pj.html) | Um report PJ completo de exemplo (fictício) |

**O mês em 8 passos** (detalhes no guia e em [docs/COMO_ATUALIZAR_O_MES.md](docs/COMO_ATUALIZAR_O_MES.md)):

1. **Organizar:** imagens do mês numa pasta, com nomes no padrão (`black_friday_selo.png`, `one_brief_icone.png`).
2. **Abrir** o `emulador-report.html` no Chrome ou no Edge.
3. **Editar** na própria página: clique no texto e escreva; passe o mouse na imagem e "Trocar imagem"; **+ Adicionar item** (assistente: tipo, onde entra, conteúdo e prévia antes de confirmar) ou **+ Adicionar** embaixo de cada grupo; "← Antes / Depois →" para mudar um item de lugar; a alça **⠿ Mover seção** (ou ↑ ↓ Posição… em "Seções do report") para mudar a ordem das seções; "Tirar item" no que não vale no mês (a grade se ajusta no computador e no celular). Ou cole o conteúdo organizado pelo Copilot em **Importar conteúdo**.
4. **Salvar** o report do mês (`report-AAAA-MM.html`).
5. **Conferir:** reabrir o arquivo salvo, no computador e no celular.
6. **Link do report:** colar no emulador **qualquer link**: o caminho do arquivo salvo (`C:\…`, ex.: a pasta do OneDrive no computador; Explorador › botão direito › Copiar como caminho) ou o link de compartilhamento (`https://…`). O botão do e-mail sai no formato que o Outlook abre (espaço e acento funcionam). Para enviar, use o **link do OneDrive** (botão direito no arquivo › Compartilhar › Copiar link): no e-mail recebido, o Outlook para Windows bloqueia link para arquivo ("O Outlook bloqueou o acesso a links para os arquivos de zona da Internet"), e um caminho `C:\…` só existe no seu computador. O emulador aceita o caminho, mas avisa.
7. **E-mail-resumo:** em "Selecionar destaques do e-mail", partir da sugestão (os números do projeto principal) e escolher, ordenar e ajustar até 4 destaques; incluir imagem, link ou uma informação nova (marcada para revisão); baixar o `.eml` (e, se quiser, a imagem `.png`).
8. **Enviar** pelo Outlook: primeiro para você, depois para a área.

Regras que o emulador segue: não cria nem calcula número; indicador sem dado é ocultado (nunca 0 nem o número do mês anterior); ao mudar o período de um report antigo, lista os números que ninguém mexeu antes de salvar; sem o link do report completo, o e-mail-resumo não é liberado: nunca sai um botão vazio.

## Como o report conta o mês

Sempre na mesma ordem:

| | Seção | Pergunta que responde |
|---|---|---|
| 01 | **O mês em uma frase** | O que aconteceu? Qual foi o principal resultado? |
| 02 | **O que lançamos** | O que foi para o ar e o que evoluiu? |
| 03 | **Creative X** | Como está a qualidade criativa (antes → agora)? |
| 04 | **Transformation Hub** | O que estamos mudando na forma de criar? |
| 05 | **O que aprendemos** | O que os dados ensinaram? (opcional desde a 4.13: cada campanha pode ter o seu "O que aprendemos", curto, dentro da própria seção) |
| 06 | **Foco do próximo mês** | Qual é a prioridade agora? |
| 07 | **Também vem aí** | O que está na agenda? |

## Segurança dos dados

- **Este repositório não tem dados reais.** Só o modelo, o exemplo fictício, a chama, a formiguinha e os ícones.
- **Não ficam aqui:** o Brand Guide (interno), os `.otf` das fontes (proprietários), as fotos do banco de imagens (licenciadas; `assets/fotos/` está no `.gitignore`) e os reports reais de cada mês.
- **Resultados, peças, vídeos e documentos reais** ficam só no ambiente corporativo autorizado. Nunca em repositório pessoal, computador pessoal ou ferramenta externa. O Copilot usado é o corporativo.
- O emulador não envia nada para a internet: só lê e grava os arquivos que você escolhe. A cópia da edição em andamento fica no navegador do próprio computador, até salvar.
- O histórico antigo deste repositório tem versões com dados reais. Veja [docs/BACKUP.md › Histórico do Git](docs/BACKUP.md#histórico-do-git-e-dados-antigos).

## Documentação

| Guia | Para quê |
|---|---|
| [kit/guia-operacional.pdf](kit/guia-operacional.pdf) | **O guia do time** (comece por aqui) |
| [COMO_ATUALIZAR_O_MES.md](docs/COMO_ATUALIZAR_O_MES.md) | O mesmo passo a passo, em texto |
| [EMULADOR.md](docs/EMULADOR.md) | Cada função do emulador, o e-mail-resumo e o status |
| [PROMPTS_COPILOT.md](docs/PROMPTS_COPILOT.md) | Biblioteca de 12 prompts do Microsoft Copilot (com o formato para importar) |
| [TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md) | Checklist antes de enviar |
| [HOW_TO_EXPORT_EML.md](docs/HOW_TO_EXPORT_EML.md) | O que é o `.eml`, como abrir e enviar |
| [OUTLOOK_COMPATIBILITY.md](docs/OUTLOOK_COMPATIBILITY.md) | O que funciona em cada Outlook |
| [FAQ.md](docs/FAQ.md) | Perguntas frequentes |
| [GUIA_TIPOGRAFIA.md](docs/GUIA_TIPOGRAFIA.md) | Fontes Santander, arquivos `.otf` e a alternativa |
| [LINKS_SHAREPOINT_STREAM.md](docs/LINKS_SHAREPOINT_STREAM.md) | Qual link copiar, permissões, como testar |
| [CORPORATE_SETUP.md](docs/CORPORATE_SETUP.md) | Primeiro uso no banco e teste piloto |
| [BACKUP.md](docs/BACKUP.md) | Backup, versões e recuperação |
| [ARQUITETURA.md](docs/ARQUITETURA.md) | Decisões técnicas, Brand Guide aplicado e o que foi testado |

## Limitações conhecidas

- **Não testado num Outlook real, no Edge nem no Windows** (o ambiente de desenvolvimento é Linux com Chromium, a base do Chrome e do Edge). Layout, edição, salvamento, `.eml` e links foram verificados no Chromium (de 320 a 1440 px). Antes do primeiro envio, faça o **teste piloto** ([CORPORATE_SETUP.md](docs/CORPORATE_SETUP.md)).
- **Salvar por cima do mesmo arquivo** usa a janela "Salvar como" do Chrome e do Edge. Em navegadores sem esse recurso, o report vai para Downloads.
- **Fontes Santander:** os `.otf` não estão no projeto; aparece a fonte instalada ou Arial ([GUIA_TIPOGRAFIA.md](docs/GUIA_TIPOGRAFIA.md)).
- **Brand Guide em e-mail:** a margem de 8% e o Botão de Início "Começa agora" não foram aplicados ([ARQUITETURA.md](docs/ARQUITETURA.md#brand-guide-como-foi-aplicado-num-e-mail)). **VALIDAR COM MARCA**.
- No Outlook para Windows, os cantos aparecem retos e o layout é sempre o de computador.
- Links, permissões e vídeo dependem do ambiente corporativo e só podem ser testados lá.

---

## Para quem mantém a ferramenta

| Parte | Arquivo |
|---|---|
| Emulador (fonte) | `converter-html-eml.html` (usa `tools/motor.js` e `tools/coringa.js`) |
| Emulador avulso (o do kit) | `node tools/montar-avulso.js` → `kit/emulador-report.html` (motor e modelo embutidos) |
| Motor (template, resumo, `.eml`, importação) | `tools/motor.js` |
| Layout | `template/report.html` (com `{{campos}}`; marcas `data-campo`, `data-img`, `data-item`) |
| Modelo em branco | `dados/CORINGA.txt` + `assets/coringa/` → página gerada → `tools/coringa.js` ([ARQUITETURA.md](docs/ARQUITETURA.md#modelo-em-branco-coringa)) |
| Geração por arquivo de dados (caminho técnico) | `gerar-report.html` + `dados/*.txt` + `config/marca.txt` |
| Backup do layout | `report_backup.html` ([BACKUP.md](docs/BACKUP.md)) |

Testes (Node.js; os `e2e` também precisam do Playwright):

- `node tests/motor.test.js`: motor (79 testes).
- `node tests/pj.e2e.js`: o Emulador Report PJ de ponta a ponta (aba e ícone Santander + PJ, modelo em branco PJ, editar, imagem vertical, itens com a grade em Preto, seções, + Novo tópico, celular sem rolagem para o lado, importar, salvar com o ícone e a marca do PJ, reabrir, rascunho separado do PF, recusa do report do outro segmento nos dois sentidos, e-mail-resumo no tema Empresas com 4 destaques, `.eml`, `.png` e e-mail completo).
- `node tests/resumo.e2e.js`: e-mail-resumo com destaques escolhidos (sugestão, ordem, título ajustado, informação nova com revisão, imagem do computador, capa de vídeo, link, número vindo do report, `.eml`, `.png`, salvar e reabrir, celular).
- `node tests/aprendizado.e2e.js`: "O que aprendemos" dentro de cada campanha (criar pela barra, importar do Copilot, tirar e desfazer, salvar e reabrir, celular).
- `node tests/assistente.e2e.js`: + Adicionar item (os 7 tipos, posição, prévia, Voltar e ajustar, Cancelar, campos obrigatórios, Creative X trimestral), mover itens e a ordem das seções (↑ ↓ Posição…, arrastar no painel e na página, Esc, rolagem automática), leveza do arrasto com a CPU 4× mais lenta, salvar, reabrir, e-mail-resumo e celular.
- `node tests/escuro.e2e.js`: e-mail-resumo no modo escuro: igual ao claro (pixel a pixel) no modo escuro do sistema e, numa simulação do Outlook.com / novo Outlook, as cores aprovadas voltam.
- `node tests/emulador.e2e.js`: o fluxo completo do emulador como uma pessoa faria (abrir, editar, imagem, link, ocultar, importar, salvar, reabrir, recuperar, resumo, `.eml`). Com `EMULADOR=kit/emulador-report.html`, testa a versão avulsa.
- `node tests/emulador-extras.e2e.js`: + Link e + Imagem em vários tipos de item (até 3 imagens), tirar e desfazer, os tópicos novos (+ Novo tópico com os 4 layouts, numa página nova e numa antiga, adicionar e ocultar itens, numeração, salvar, e-mail-resumo, reabrir, celular) e o report de antes da 4.11 com o "Resumo das campanhas" (a seção sai ao abrir, sem vão).
- `node tests/desempenho.e2e.js`: abrir, editar e salvar um report sintético pesado (~27 MB) com a CPU 4× mais lenta; falha se a página voltar a travar. Confere também o aviso de andamento, vídeo e PDF idênticos no arquivo salvo e a imagem desfeita saindo da memória. Com `GIGANTE=1`, abre, edita e salva um report de ~600 MB (precisa do ffmpeg).
- `node tests/trabalhador.test.js`: o trabalho pesado do emulador (Web Worker) sem navegador: separar e juntar a mídia devolve o arquivo idêntico, byte a byte.
- `node tests/celular.e2e.js`: conteúdo longo (valores de 15 caracteres, títulos e nomes longos, palavras sem espaço) em 320, 375, 390 e 430 px: report, e-mail-resumo e emulador sem passar da tela; os 3 indicadores normais seguem lado a lado.
- `node tests/leveza.e2e.js`: imagem e vídeo pesados otimizados, report pesado mais leve ao abrir, edição e prévia sem rolagem dentro do quadro, nomes dos projetos e aviso de repetição no resumo, ícones da aba (precisa do ffmpeg para gerar os arquivos de teste).
- `node tests/barras.e2e.js`: as barras de botões que aparecem ao passar o mouse (imagem, link, item, bloco, etiqueta), em todos os alvos, no computador e no Celular: o mouse anda como uma pessoa (em passos, reto, em curva e devagar) até cada botão, e a barra não pode trocar no caminho.
- `node tests/grade.e2e.js`: o grid depois de cada adicionar e tirar (itens de todos os grupos, os 4 layouts de tópico, imagens, links, seções), medido no computador e no celular (89 passos).
- `node tests/ferramenta.e2e.js`: geração pelo arquivo de dados, em 7 larguras de tela.
- `node tests/movimento.e2e.js`: o movimento da página (números contando, seções aparecendo, "reduzir movimento").

Commits por assunto (`tools: …`, `docs: …`, `kit: …`). Registre mudanças de layout ou de motor no [CHANGELOG.md](CHANGELOG.md).
