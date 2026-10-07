# Ferramentas (técnico)

| Arquivo | O que é |
|---|---|
| `motor.js` | O motor do report: lê `dados/AAAA-MM.txt` e `config/marca.txt`, confere tudo, aplica o `template/report.html` e monta o `.eml` (versão em texto + HTML + imagens embutidas). JavaScript puro, sem dependências |

Ele é carregado pela página **`gerar-report.html`**, na pasta principal, que é o que você usa no dia a dia. Você não precisa abrir este arquivo.

Testes: `node tests/motor.test.js`. Decisões técnicas: [docs/ARQUITETURA.md](../docs/ARQUITETURA.md).
