# Apps Script — preparação, ainda não publicado

1. Criar uma planilha privada aprovada para o projeto.
2. Criar abas `Tokens` (hash_codigo, ativo) e `Votos` (id_recibo, id_projeto, hash_codigo, c1, c2, c3, c4, nota_ponderada, criado_em, idempotency_key).
3. Configurar nas propriedades do script `SPREADSHEET_ID` e `TOKEN_SALT` (segredo longo e aleatório).
4. Cadastrar apenas hashes SHA-256(token + TOKEN_SALT), nunca tokens em texto puro.
5. Testar em cópia de homologação, confirmar recibo e leitura posterior na planilha.
6. Publicar como Web App somente após aprovação explícita e revisão da política de acesso.

O frontend ainda não envia avaliações para este endpoint. Não há planilha conectada, segredo armazenado ou implantação publicada.