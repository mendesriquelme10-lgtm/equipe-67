# AvaliaProjetos

Aplicativo público de avaliação de projetos, sem tela de login. A interface é servida pelo Google Apps Script e os dados são armazenados na planilha Google Sheets configurada em `Code.gs`.

## Recursos
- Cadastro de projetos e equipes.
- Avaliação por cinco critérios configuráveis no arquivo `index.html`.
- Notas de 0 a 10, média automática e comentários.
- Classificação pela média das avaliações.
- Persistência compartilhada no Google Sheets.

## Instalação
1. Abra a planilha configurada em `Code.gs` e vá em **Extensões > Apps Script**.
2. No editor, crie um arquivo HTML chamado exatamente `index` e cole o conteúdo de `index.html`.
3. No arquivo `Code.gs`, cole o código deste repositório.
4. Salve o projeto. Execute uma vez `initializeSheets_` no editor e autorize o acesso à planilha.
5. Clique em **Implantar > Nova implantação > Aplicativo da Web**.
6. Configure **Executar como: você** e **Quem pode acessar: qualquer pessoa** (a opção pode depender da conta/organização).
7. Implante e compartilhe a URL do aplicativo.

## Importante: acesso sem login
Qualquer pessoa com o link público poderá cadastrar projetos e enviar avaliações. Não há autenticação nem proteção contra envios repetidos. Não armazene dados pessoais sensíveis. Para uso em seleção oficial, adicione controles contra abuso, trilha de auditoria e regras de avaliação antes de divulgar o link.

## Personalização
Edite a constante `CRITERIA` no início do JavaScript em `index.html` e mantenha cinco critérios, pois a validação do backend espera cinco notas.