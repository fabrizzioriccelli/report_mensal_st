# Report Mensal · Creative Strategy PF

Modelo do report mensal da Creative Strategy PF (Customer Interactions), em duas experiências que saem **da mesma página**:

- **o report completo** (HTML): movimento ao rolar, vídeos, peças e documentos no clique;
- **o e-mail-resumo** (Outlook): a porta de entrada, estático, com a frase do mês, até 3 indicadores e um único botão, "Acessar report completo".

O time atualiza tudo no **emulador**: um arquivo só, que abre no Chrome ou no Edge, sem instalar nada.

**Versão 4.5 (2026-10-16).** Histórico em [CHANGELOG.md](CHANGELOG.md).

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
| [`emulador-report.html`](kit/emulador-report.html) | **O emulador.** Abre o modelo em branco ou o report salvo, edita textos, indicadores, imagens e links na própria página, salva o report do mês e gera o e-mail-resumo (`.eml`) |
| [`guia-operacional.pdf`](kit/guia-operacional.pdf) | **O guia**, passo a passo, com telas reais do emulador e a biblioteca de 12 prompts do Copilot ([.pptx](kit/guia-operacional.pptx) editável) |
| [`apresentacao-executiva.pdf`](kit/apresentacao-executiva.pdf) | A apresentação da nova experiência, 10 slides ([.pptx](kit/apresentacao-executiva.pptx)). As chamadas abrem os arquivos desta pasta |
| [`report-exemplo.html`](kit/report-exemplo.html) | Um report completo de exemplo (fictício), para ver a experiência |
| [`report-coringa.html`](kit/report-coringa.html) | O modelo em branco (o mesmo que o emulador abre em "Começar do modelo em branco") |

**O mês em 8 passos** (detalhes no guia e em [docs/COMO_ATUALIZAR_O_MES.md](docs/COMO_ATUALIZAR_O_MES.md)):

1. **Organizar:** imagens do mês numa pasta, com nomes no padrão (`black_friday_selo.png`, `one_brief_icone.png`).
2. **Abrir** o `emulador-report.html` no Chrome ou no Edge.
3. **Editar** na própria página: clique no texto e escreva; passe o mouse na imagem e "Trocar imagem"; **+ Adicionar** (embaixo de cada grupo) para mais um item e "Ocultar item" no que não vale no mês (a grade se ajusta no computador e no celular). Ou cole o conteúdo organizado pelo Copilot em **Importar conteúdo**.
4. **Salvar** o report do mês (`report-AAAA-MM.html`).
5. **Conferir:** reabrir o arquivo salvo, no computador e no celular.
6. **Publicar** no ambiente corporativo autorizado e colar o link no emulador (para testar no seu computador, vale também o caminho do arquivo: `C:\…` ou `file:///…`).
7. **E-mail-resumo:** escolher até 3 indicadores e baixar o `.eml`.
8. **Enviar** pelo Outlook: primeiro para você, depois para a área.

Regras que o emulador segue: não cria nem calcula número; indicador sem dado é ocultado (nunca 0 nem o número do mês anterior); ao mudar o período de um report antigo, lista os números que ninguém mexeu antes de salvar; sem o link do report completo, o e-mail-resumo não é liberado.

## Como o report conta o mês

Sempre na mesma ordem:

| | Seção | Pergunta que responde |
|---|---|---|
| 01 | **O mês em uma frase** | O que aconteceu? Qual foi o principal resultado? |
| 02 | **O que lançamos** | O que foi para o ar e o que evoluiu? |
| 03 | **Creative X** | Como está a qualidade criativa (antes → agora)? |
| 04 | **Transformation Hub** | O que estamos mudando na forma de criar? |
| 05 | **O que aprendemos** | O que os dados ensinaram? |
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

- `node tests/motor.test.js`: motor (66 testes).
- `node tests/emulador.e2e.js`: o fluxo completo do emulador como uma pessoa faria (abrir, editar, imagem, link, ocultar, importar, salvar, reabrir, recuperar, resumo, `.eml`). Com `EMULADOR=kit/emulador-report.html`, testa a versão avulsa.
- `node tests/ferramenta.e2e.js`: geração pelo arquivo de dados, em 7 larguras de tela.
- `node tests/movimento.e2e.js`: o movimento da página (números contando, seções aparecendo, "reduzir movimento").

Commits por assunto (`tools: …`, `docs: …`, `kit: …`). Registre mudanças de layout ou de motor no [CHANGELOG.md](CHANGELOG.md).
