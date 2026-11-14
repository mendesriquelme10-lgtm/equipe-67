# Apps Script — preparação, ainda não publicado

## Estrutura da planilha privada

A planilha deve manter estas duas abas, com cabeçalhos exatos na primeira linha:

- `Tokens`: `hash_codigo | ativo`
- `Votos`: `id_recibo | id_projeto | hash_codigo | c1 | c2 | c3 | c4 | nota_ponderada | criado_em | idempotency_key`

A coluna `ativo` da aba Tokens deve usar checkbox (valor booleano `TRUE/FALSE`). Não cadastrar tokens em texto puro.

## Configuração

1. Manter a planilha privada e exclusiva para este projeto.
2. No Apps Script vinculado à planilha, manter o código de `Code.gs` e criar também o arquivo HTML `TokenGenerator.html` com o conteúdo correspondente do repositório.
3. Em **Configurações do projeto → Propriedades do script**, configurar:
   - `SPREADSHEET_ID`: ID da planilha privada.
   - `TOKEN_SALT`: segredo aleatório forte, exclusivo deste projeto. Nunca enviar ao GitHub, ao frontend ou ao chat.
4. Recarregar a planilha. O menu **Universo IF Avalia → Gerar lote de tokens** permite emitir de 1 a 100 códigos por vez.
5. O gerador grava apenas `SHA-256(token + TOKEN_SALT)` e o estado ativo na aba Tokens. Os códigos originais são mostrados uma única vez na janela; copiar e guardar em local seguro. Não fechar antes de salvar a lista. Não colocar tokens em URLs, commits, logs ou mensagens públicas.
6. Conferir os IDs: `EXT-001` a `EXT-022` e `NAC-001` a `NAC-024`.

## Comportamento da API

- `doGet` expõe somente agregados e aceita JSONP por parâmetro `callback` para leitura pública sem depender de CORS. A resposta inclui os 46 projetos, inclusive os que ainda têm zero votos.
- `doPost` valida token, projeto, quatro notas inteiras de 1 a 5 e chave de idempotência; usa `LockService` e impede segundo voto do mesmo token no mesmo projeto.
- A confirmação só pode ser apresentada ao participante depois de receber um recibo do servidor. Nunca usar `mode: "no-cors"` nem interpretar resposta opaca como sucesso.
- A classificação deve ser calculada no cliente por modalidade; mínimo de cinco votos válidos para entrar no ranking.

## Homologação obrigatória antes de liberar votos

- Executar primeiro em uma cópia de homologação, nunca na planilha oficial.
- Testar token válido, token inválido, token inativo, notas fora de 1–5 e projeto inexistente.
- Enviar duas vezes a mesma chave de idempotência e confirmar que o mesmo recibo é retornado.
- Tentar votar novamente no mesmo projeto com outra chave e confirmar rejeição.
- Confirmar que um token pode avaliar outro projeto, mas não repetir o mesmo projeto.
- Conferir recibo e leitura posterior da linha gravada na planilha.
- Conferir que o endpoint público retorna apenas agregados, sem tokens, hashes, recibos ou chaves de idempotência.
- Testar chamadas reais em navegador desktop e celular.
- Validar a política da conta Google para acesso anônimo antes de qualquer publicação.

## Estado atual

O endpoint ainda não foi publicado. O acesso à planilha e às abas foi verificado com `testarConfiguracao`. A chave `TOKEN_SALT` foi atualizada pelo responsável. O gerador de tokens foi preparado no repositório, mas ainda precisa ser copiado para o projeto Apps Script e testado. Não existe token real emitido nem voto de teste registrado. A integração do navegador e o fluxo de confirmação ainda precisam ser implementados e testados.

**Não publicar como Web App nem habilitar votação real sem revisão e autorização explícita.**