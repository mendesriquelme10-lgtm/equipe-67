# Assistente de Planilhas Google

Aplicação experimental para conversar com um assistente de IA e consultar uma planilha do Google Drive. A integração com o Google Sheets é feita pelo Google Apps Script.

## Estrutura

- `frontend/`: interface web do chat.
- `backend/`: servidor Node.js, integração com a API da OpenAI e chamadas ao Apps Script.
- `apps-script/`: API que lê e altera a planilha Google.
- `config/.env.example`: modelo das variáveis locais (sem segredos reais).

## Requisitos

- Node.js 18 ou superior.
- Uma chave da API da OpenAI.
- Uma planilha Google com uma aba criada.
- Uma implantação do projeto Apps Script como Aplicativo da Web.

## Configuração local

1. Entre na pasta `backend` e instale as dependências:

   ```bash
   npm install
   ```

2. Copie `config/.env.example` para um arquivo `.env` na raiz do projeto.
3. Preencha `OPENAI_API_KEY`, `APPS_SCRIPT_URL` e `SHEETS_API_TOKEN` no arquivo local `.env`.
4. Configure no Apps Script as propriedades `SPREADSHEET_ID` e `SHEETS_API_TOKEN`.
5. Inicie o servidor a partir da pasta `backend`:

   ```bash
   npm start
   ```

6. Acesse `http://localhost:3000`.

## Configuração do Apps Script

1. Crie um projeto em https://script.google.com/.
2. Copie o conteúdo de `apps-script/Code.gs` e `apps-script/Sheets.gs` para arquivos do projeto.
3. Em **Configurações do projeto > Propriedades do script**, adicione:
   - `SPREADSHEET_ID`: ID da planilha (entre `/d/` e `/edit` no link).
   - `SHEETS_API_TOKEN`: segredo aleatório forte, igual ao valor local usado pelo backend.
4. Implante como **Aplicativo da Web** e copie a URL terminada em `/exec` para `APPS_SCRIPT_URL`.

## Operações disponíveis inicialmente

- `read_range`: ler um intervalo A1 de uma aba.
- `update_cell`: atualizar uma célula.
- `append_row`: adicionar uma linha.

**Atenção:** nesta primeira versão, apenas a leitura está liberada pelo backend. As alterações ficam bloqueadas até implementarmos uma etapa de confirmação na interface. Não publique o servidor aberto à internet sem adicionar autenticação para os usuários.

## Segurança

- Nunca envie `.env`, chaves de API ou tokens para o GitHub.
- O arquivo `.gitignore` ignora arquivos `.env` e dependências locais.
- Use somente uma planilha que você controla e conceda ao Apps Script as permissões necessárias.
- Revise os dados antes de habilitar operações de escrita.

## Próximas etapas

1. Configurar e testar o Apps Script com a planilha.
2. Conectar o backend à API da OpenAI.
3. Implementar confirmação explícita antes de editar células ou adicionar linhas.
4. Melhorar a interface e adicionar autenticação.
