# Ferramentas

## gerar-eml.html

Confere um report e gera o `.eml` que o Outlook abre como mensagem nova. Funciona no Edge e no Chrome, direto do arquivo, sem instalação e sem enviar nada para a internet.

1. Abra `gerar-eml.html` no navegador.
2. Selecione a pasta principal do projeto (a que contém `reports/` e `assets/`).
3. Leia a conferência:
   - **Pendências de conteúdo:** textos `[ENTRE COLCHETES]`, valores de exemplo (`00%`, `0.000`), caixas tracejadas e links `#COLE-O-LINK`;
   - **Imagens:** arquivos usados e peso de cada um;
   - **Compatibilidade com Outlook:** recursos que o Outlook não aceita.
4. Clique em **Baixar .eml**.

O `.eml` leva o HTML sem os comentários de edição e as imagens como anexos inline (`cid:`). Imagem não encontrada bloqueia a geração.

Detalhes: [docs/HOW_TO_EXPORT_EML.md](../docs/HOW_TO_EXPORT_EML.md).
