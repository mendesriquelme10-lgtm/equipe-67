# Universo IF Avalia

Aplicação React + Vite + TypeScript para catálogo e avaliação popular dos projetos do Universo IF 2026.

## Estado desta etapa
- Catálogo oficial incluído em `public/catalogo.json`: 46 projetos (24 Mostra Nacional e 22 Mostra de Extensão).
- Busca sem acentos por título, área ou código.
- Filtros por modalidade, área temática e dia.
- Cartões de projeto e modal com detalhes.
- Auditoria estrutural em `docs/AUDITORIA_CATALOGO.md`.
- Domínio com cálculo ponderado e regra de amostra mínima.
- Testes automatizados para pesos, validação das notas, mínimo de votos e desempate.
- Interface ainda não envia avaliações; endpoint Apps Script preparado, mas sem planilha, segredo ou implantação.

## Desenvolvimento
```bash
npm install
npm run dev
npm test
npm run build
```

## Regras de avaliação
Notas inteiras de 1 a 5; pesos C1=30%, C2=30%, C3=25%, C4=15%. A classificação pública exige pelo menos cinco avaliações por projeto. Empates: média, quantidade de avaliações e título. O ranking final deverá ser separado por modalidade.

## Próximas etapas
1. Completar revisão visual dos PDFs escaneados e confirmar a transcrição dos 46 registros.
2. Desenvolver fluxo de avaliação no frontend e ranking separado por modalidade.
3. Conectar Apps Script à planilha privada aprovada e implementar recibo verificável.
4. Testar integração real em celular, duplicidade e leitura de retorno da planilha.
5. Publicar somente após aprovação explícita.

A aplicação é um protótipo acadêmico de participação popular e não substitui a avaliação oficial do evento.