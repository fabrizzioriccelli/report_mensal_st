# Ferramentas (técnico)

| Arquivo | O que é |
|---|---|
| `motor.js` | O motor do report: lê `dados/AAAA-MM.txt` e `config/marca.txt`, confere tudo, aplica o `template/report.html` e monta o `.eml` (versão em texto + HTML + imagens embutidas). JavaScript puro, sem dependências |

Ele é carregado pela página **`gerar-report.html`**, na pasta principal, que é o que você usa no dia a dia. Você não precisa abrir este arquivo.

| `montar-avulso.js` | Monta `kit/emulador-report.html` (o emulador avulso, com o motor e o modelo em branco embutidos) |
| `atualizar-coringa.js` | Depois de mudar o template ou `dados/CORINGA.txt`: gera o modelo em branco pelo `gerar-report.html` e grava `kit/report-coringa.html` e `tools/coringa.js` (precisa do Playwright) |

Testes: `node tests/motor.test.js` (71 testes), `node tests/ferramenta.e2e.js` (página de ponta a ponta, 7 larguras de tela), `node tests/emulador.e2e.js`, `node tests/emulador-extras.e2e.js` `node tests/grade.e2e.js` (grid depois de cada adicionar e tirar) `node tests/leveza.e2e.js` (arquivos leves, quadros sem rolagem, resumo sem repetição, ícones, links) `node tests/desempenho.e2e.js` (report pesado com a CPU 4× mais lenta; `GIGANTE=1` para ~600 MB), `node tests/trabalhador.test.js` (Web Worker: ida e volta da mídia idêntica) e `node tests/celular.e2e.js` (conteúdo longo em 320 a 430 px) (emulador: edição, salvar, e-mail-resumo; links e imagens extras e os tópicos novos). Decisões técnicas: [docs/ARQUITETURA.md](../docs/ARQUITETURA.md).
