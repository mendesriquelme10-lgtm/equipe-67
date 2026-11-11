/**
 * Operações permitidas inicialmente:
 * - read_range: lê um intervalo A1
 * - update_cell: atualiza uma célula
 * - append_row: adiciona uma linha ao final
 */
function handleSheetAction(payload) {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("SPREADSHEET_ID não configurado.");

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheetName = String(payload.sheet || "").trim();
  if (!sheetName) throw new Error("Informe o nome da aba.");

  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error("A aba informada não foi encontrada.");

  switch (payload.action) {
    case "read_range": {
      var rangeA1 = String(payload.range || "").trim();
      if (!rangeA1 || rangeA1.length > 80) throw new Error("Intervalo inválido.");
      var values = sheet.getRange(rangeA1).getDisplayValues();
      return { sheet: sheetName, range: rangeA1, values: values };
    }

    case "update_cell": {
      var cell = String(payload.cell || "").trim();
      if (!/^[A-Z]+[1-9][0-9]*$/i.test(cell)) throw new Error("Célula inválida.");
      if (!Object.prototype.hasOwnProperty.call(payload, "value")) {
        throw new Error("O valor da célula não foi informado.");
      }
      sheet.getRange(cell).setValue(payload.value);
      return { sheet: sheetName, cell: cell, updated: true };
    }

    case "append_row": {
      if (!Array.isArray(payload.values) || payload.values.length === 0) {
        throw new Error("Informe os valores da nova linha.");
      }
      if (payload.values.length > 50) throw new Error("Máximo de 50 colunas por linha.");
      sheet.appendRow(payload.values);
      return { sheet: sheetName, appended: true };
    }

    default:
      throw new Error("Ação não permitida.");
  }
}
