require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../frontend")));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sheetTool = {
  type: "function",
  name: "manage_google_sheet",
  description: "Lê ou altera uma planilha Google autorizada pelo usuário.",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      action: { type: "string", enum: ["read_range", "update_cell", "append_row"] },
      sheet: { type: "string", description: "Nome exato da aba da planilha." },
      range: { type: "string", description: "Intervalo A1, usado em read_range." },
      cell: { type: "string", description: "Célula A1, usada em update_cell." },
      value: { description: "Novo valor da célula, usado em update_cell." },
      values: { type: "array", items: {}, description: "Valores da linha, usado em append_row." }
    },
    required: ["action", "sheet"]
  }
};

async function callAppsScript(args) {
  if (!process.env.APPS_SCRIPT_URL || !process.env.SHEETS_API_TOKEN) {
    throw new Error("Configure APPS_SCRIPT_URL e SHEETS_API_TOKEN no arquivo .env.");
  }

  const response = await fetch(process.env.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...args, token: process.env.SHEETS_API_TOKEN })
  });

  if (!response.ok) throw new Error("O Apps Script respondeu com erro HTTP " + response.status);
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Falha ao acessar a planilha.");
  return data.result;
}

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();
    if (!message) return res.status(400).json({ error: "Digite uma mensagem." });

    const first = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: [
        "Você é um assistente que ajuda o usuário a consultar e editar sua planilha Google.",
        "Responda em português brasileiro, de forma clara e simples.",
        "Só altere dados quando o usuário pedir explicitamente a alteração.",
        "Antes de executar update_cell ou append_row, explique exatamente o que será alterado e peça confirmação.",
        "Não execute exclusões. Não invente nomes de abas, intervalos ou valores."
      ].join(" "),
      input: message,
      tools: [sheetTool]
    });

    const toolCalls = (first.output || []).filter(item => item.type === "function_call");
    if (toolCalls.length === 0) {
      return res.json({ reply: first.output_text || "Não consegui gerar uma resposta." });
    }

    const outputs = [];
    for (const call of toolCalls) {
      const args = JSON.parse(call.arguments || "{}");
      // O backend bloqueia alterações nesta primeira versão até haver confirmação explícita
      // em uma etapa posterior da interface.
      if (args.action === "update_cell" || args.action === "append_row") {
        outputs.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify({ pending_confirmation: true, requested: args })
        });
      } else {
        const result = await callAppsScript(args);
        outputs.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result)
        });
      }
    }

    const second = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      previous_response_id: first.id,
      input: outputs
    });

    res.json({ reply: second.output_text || "Concluído." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Não foi possível processar a solicitação." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Aplicação disponível em http://localhost:" + port));
