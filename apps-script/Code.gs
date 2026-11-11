/**
 * API do Google Apps Script.
 * Configure SPREADSHEET_ID e SHEETS_API_TOKEN em:
 * Configurações do projeto > Propriedades do script.
 */
function doPost(e) {
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var expectedToken = PropertiesService.getScriptProperties().getProperty("SHEETS_API_TOKEN");

    if (!expectedToken || payload.token !== expectedToken) {
      return jsonResponse({ ok: false, error: "Não autorizado." });
    }

    var result = handleSheetAction(payload);
    return jsonResponse({ ok: true, result: result });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || "Erro interno." });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
