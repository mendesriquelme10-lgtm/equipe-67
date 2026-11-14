# Universo IF Avalia

Aplicação React + Vite + TypeScript para catálogo e avaliação popular dos projetos do Universo IF 2026.

## Estado desta etapa
- Catálogo oficial incluído em `public/catalogo.json`: 46 projetos (24 Mostra Nacional e 22 Mostra de Extensão).
- Busca sem acentos por título, área ou código e filtros por modalidade, área e dia.
- Detalhes dos projetos e prévia da nota ponderada.
- Cliente de ranking público por JSONP, sem depender de CORS para leitura.
- Formulário de avaliação com código individual, envio JSON em corpo `text/plain`, chave de idempotência e confirmação somente com recibo válido.
- O envio permanece bloqueado até configurar `VITE_API_URL` e homologar o endpoint real.
- Apps Script inclui emissão de tokens em lote: somente hashes são gravados na planilha; códigos originais são exibidos uma única vez.
- Auditoria estrutural do catálogo em `docs/AUDITORIA_CATALOGO.md`.

## Configuração local do endpoint

Criar um arquivo `.env.local` dentro desta pasta, sem adicioná-lo ao Git:

```env
VITE_API_URL=https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec
```

A URL acima é apenas o formato esperado. Não configurar até o Web App ser revisado, implantado e testado. Nunca colocar `TOKEN_SALT`, tokens ou hashes no frontend ou em variáveis `VITE_*`.

## Desenvolvimento
```bash
npm install
npm run dev
npm test
npm run build
```

## Regras de avaliação
Notas inteiras de 1 a 5; pesos C1=30%, C2=30%, C3=25%, C4=15%. A classificação pública exige pelo menos cinco avaliações por projeto. Empates: média, quantidade de avaliações e título. O ranking é separado por modalidade.

## Pendências antes de homologar
1. Revisão visual completa dos PDFs escaneados e confirmação da transcrição dos 46 registros.
2. Copiar e testar `Code.gs` e `TokenGenerator.html` no Apps Script vinculado à planilha.
3. Homologar emissão e validação de tokens, idempotência, recibo e gravação/readback em uma planilha de teste.
4. Verificar CORS real do POST em navegadores desktop e celular. Se o navegador não liberar a leitura da resposta, não usar `no-cors`; adotar transporte alternativo com confirmação verificável.
5. Testar ranking JSONP público e verificar que somente agregados são expostos.
6. Publicar o site e liberar votos somente após aprovação explícita.

A aplicação é um protótipo acadêmico de participação popular e não substitui a avaliação oficial do evento.
