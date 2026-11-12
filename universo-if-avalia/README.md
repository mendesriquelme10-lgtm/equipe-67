# Universo IF Avalia

Aplicação React + Vite + TypeScript para catálogo e avaliação popular dos projetos do Universo IF 2026.

## Estado desta etapa
- Interface inicial responsiva e catálogo com busca/filtro/modal de detalhes.
- Domínio com cálculo ponderado e regra de amostra mínima.
- O arquivo de catálogo ainda precisa ser adicionado como `public/catalogo.json` a partir do JSON validado fornecido no kit. A aplicação deliberadamente não inventa projetos caso o arquivo esteja ausente.
- Envio de votos não está habilitado nesta etapa. Não há endpoint real nem credenciais configuradas.

## Desenvolvimento
```bash
npm install
npm run dev
npm test
npm run build
```

## Regras de avaliação
Notas inteiras de 1 a 5; pesos C1=30%, C2=30%, C3=25%, C4=15%. A classificação pública exige pelo menos cinco avaliações por projeto. Empates: média, quantidade de avaliações e título.

## Próximas etapas
1. Incluir o catálogo oficial e testar a renderização de todos os 46 registros.
2. Implementar backend Apps Script com token de uso único por projeto, hash, LockService e idempotência.
3. Integrar recibo verificável e leitura de retorno da planilha privada.
4. Configurar testes de integração e publicação somente após aprovação explícita.

A aplicação é um protótipo acadêmico de participação popular e não substitui a avaliação oficial do evento.