const SPREADSHEET_ID = "1zK740keT5pssAEqKJcGG-Z8k5oylrN4Syg7WNSjwdIw";
const PROJECTS_TAB = "Projetos";
const EVALUATIONS_TAB = "Avaliacoes";

function doGet() {
  initializeSheets_();
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("AvaliaProjetos")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function initializeSheets_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let p = ss.getSheetByName(PROJECTS_TAB);
  if (!p) { p = ss.insertSheet(PROJECTS_TAB); p.appendRow(["ID","Projeto","Responsável/equipe","Descrição","Contato","Criado em"]); }
  let a = ss.getSheetByName(EVALUATIONS_TAB);
  if (!a) { a = ss.insertSheet(EVALUATIONS_TAB); a.appendRow(["ID","Projeto ID","Avaliador","Notas (JSON)","Média","Observações","Data"]); }
}

function getAppData() {
  initializeSheets_();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const p = ss.getSheetByName(PROJECTS_TAB).getDataRange().getValues();
  const a = ss.getSheetByName(EVALUATIONS_TAB).getDataRange().getValues();
  return {
    projects: p.slice(1).filter(r=>r[0]).map(r=>({id:String(r[0]),name:String(r[1]),team:String(r[2]||""),description:String(r[3]||""),contact:String(r[4]||"")})),
    evaluations: a.slice(1).filter(r=>r[0]).map(r=>({id:String(r[0]),projectId:String(r[1]),evaluator:String(r[2]||""),scores:parseJson_(r[3]),average:Number(r[4])||0,comments:String(r[5]||""),createdAt:r[6]?new Date(r[6]).toISOString():""}))
  };
}

function createProject(data) {
  data = data || {};
  const name = clean_(data.name,120);
  if (!name) throw new Error("Informe o nome do projeto.");
  initializeSheets_();
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const id = Utilities.getUuid();
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROJECTS_TAB)
      .appendRow([id,name,clean_(data.team,120),clean_(data.description,1500),clean_(data.contact,120),new Date()]);
    return {ok:true,id};
  } finally { lock.releaseLock(); }
}

function saveEvaluation(data) {
  data = data || {};
  if (!data.projectId) throw new Error("Selecione um projeto.");
  if (!Array.isArray(data.scores) || data.scores.length !== 5) throw new Error("Informe as cinco notas.");
  data.scores.forEach(s=>{if (!s.name || !Number.isFinite(Number(s.score)) || Number(s.score)<0 || Number(s.score)>10) throw new Error("As notas devem estar entre 0 e 10.");});
  initializeSheets_();
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const exists=ss.getSheetByName(PROJECTS_TAB).getDataRange().getValues().slice(1).some(r=>String(r[0])===String(data.projectId));
  if (!exists) throw new Error("Projeto não encontrado.");
  const average=data.scores.reduce((sum,s)=>sum+Number(s.score),0)/data.scores.length;
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try {
    ss.getSheetByName(EVALUATIONS_TAB).appendRow([Utilities.getUuid(),String(data.projectId),clean_(data.evaluator,100),JSON.stringify(data.scores),average,clean_(data.comments,1500),new Date()]);
    return {ok:true,average};
  } finally {lock.releaseLock();}
}

function clean_(value,max) {
  return String(value==null?"":value).replace(/[\\u0000-\\u001F]/g," ").trim().slice(0,max);
}
function parseJson_(value) { try { return JSON.parse(value||"[]"); } catch(e) { return []; } }