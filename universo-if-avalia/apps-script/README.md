# Apps Script — preparação, ainda não publicado

## Estrutura da planilha privada

Criar duas abas com a primeira linha exatamente assim:

- `Tokens`: `hash_codigo | ativo`
- `Votos`: `id_recibo | id_projeto | hash_codigo | c1 | c2 | c3 | c4 | nota_ponderada | criado_em | idempotency_key`

A coluna `ativo` da aba Tokens deve usar checkbox (valor booleano `TRUE/FALSE`). Não cadastrar tokens em texto puro.

## Configuração

1. Criar uma planilha privada exclusiva para este projeto.
2. Criar o projeto Apps Script vinculado ou independente.
3. Configurar em **Configurações do projeto → Propriedades do script**:
   - `SPREADSHEET_ID`: ID da planilha privada.
   - `TOKEN_SALT`: segredo aleatório forte, exclusivo deste projeto.
4. Cadastrar hashes SHA-256 de `token + TOKEN_SALT`; guardar os tokens originais fora da planilha e entregá-los por canal seguro.
5. Conferir se os IDs enviados correspondem ao catálogo: `EXT-001` a `EXT-022` e `NAC-001` a `NAC-024`.

## Homologação obrigatória antes de liberar votos

- Executar em uma cópia de homologação, nunca na planilha oficial.
- Testar token válido, token inválido, notas fora de 1–5 e projeto inexistente.
- Enviar duas vezes a mesma chave de idempotência e confirmar que o mesmo recibo é retornado.
- Tentar votar novamente no mesmo projeto com outra chave e confirmar rejeição.
- Confirmar que um token pode avaliar outro projeto, mas não repetir o mesmo projeto.
- Conferir recibo e leitura posterior da linha gravada na planilha.
- Conferir que o endpoint público retorna apenas agregados, sem tokens, hashes, recibos ou chaves de idempotência.
- Testar chamadas reais em navegador desktop e celular. Não usar `mode: "no-cors"` nem tratar resposta opaca como confirmação.
- Validar a política da conta Google para acesso anônimo antes de qualquer publicação.

## Estado atual

O endpoint ainda não foi publicado. Não existe planilha conectada, segredo configurado, token real emitido ou voto de teste registrado. O frontend permanece sem envio de avaliações. A integração de navegador/CORS ainda precisa ser testada; se o fluxo cross-origin do Apps Script não for confiável, usar uma interface HTML Service hospedada pelo próprio Apps Script como alternativa.

**Não publicar como Web App nem habilitar votação real sem aprovação explícita e homologação completa.**
