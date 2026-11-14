/** Universo IF Avalia API. Propriedades: SPREADSHEET_ID e TOKEN_SALT.
 * Abas: Tokens(hash_codigo, ativo); Votos(id_recibo,id_projeto,hash_codigo,c1,c2,c3,c4,nota_ponderada,criado_em,idempotency_key).
 * Não publicar como Web App antes da revisão e autorização explícita.
 */
const CFG={TOKENS_SHEET:'Tokens',VOTES_SHEET:'Votos',MIN_VOTES:5,WEIGHTS:[.30,.30,.25,.15],TOKEN_BATCH_MAX:100};

function onOpen(){
 SpreadsheetApp.getUi().createMenu('Universo IF Avalia')
  .addItem('Gerar lote de tokens','abrirGeradorTokens')
  .addToUi();
}
function abrirGeradorTokens(){
 const html=HtmlService.createHtmlOutputFromFile('TokenGenerator').setWidth(520).setHeight(480);
 SpreadsheetApp.getUi().showModalDialog(html,'Gerar códigos de avaliação');
}
function gerarLoteTokens(quantidade){
 const qtd=Number(quantidade);
 if(!Number.isInteger(qtd)||qtd<1||qtd>CFG.TOKEN_BATCH_MAX)throw Error('Informe uma quantidade entre 1 e '+CFG.TOKEN_BATCH_MAX+'.');
 const props=PropertiesService.getScriptProperties(),id=props.getProperty('SPREADSHEET_ID'),salt=props.getProperty('TOKEN_SALT');
 if(!id||!salt)throw Error('SERVER_NOT_CONFIGURED');
 const ss=SpreadsheetApp.openById(id),sh=ss.getSheetByName(CFG.TOKENS_SHEET);
 if(!sh)throw Error('SHEETS_NOT_CONFIGURED');
 const headers=sh.getRange(1,1,1,2).getValues()[0];
 if(headers[0]!=='hash_codigo'||headers[1]!=='ativo')throw Error('INVALID_TOKENS_HEADERS');
 const tokens=[],rows=[];
 for(let i=0;i<qtd;i++){
  const token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
  tokens.push(token);rows.push([sha256_(token+salt),true]);
 }
 sh.getRange(sh.getLastRow()+1,1,rows.length,2).setValues(rows);
 SpreadsheetApp.flush();
 return tokens;
}
function doGet(e){
 try{
  const data=publicRanking_(),callback=e&&e.parameter&&e.parameter.callback;
  if(callback){
   if(!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback))return ContentService.createTextOutput('/* invalid callback */').setMimeType(ContentService.MimeType.JAVASCRIPT);
   return ContentService.createTextOutput(callback+'('+JSON.stringify(data)+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(data);
 }catch(e){return json_({ok:false,error:'SERVICE_UNAVAILABLE'});}
}
function doPost(e){
 const lock=LockService.getScriptLock();
 try{
  const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
  if(body.action!=='evaluate')return json_({ok:false,error:'INVALID_ACTION'});
  validate_(body);
  const props=PropertiesService.getScriptProperties(),id=props.getProperty('SPREADSHEET_ID'),salt=props.getProperty('TOKEN_SALT');
  if(!id||!salt)throw Error('SERVER_NOT_CONFIGURED');
  lock.waitLock(15000);
  const ss=SpreadsheetApp.openById(id),tokens=ss.getSheetByName(CFG.TOKENS_SHEET),votes=ss.getSheetByName(CFG.VOTES_SHEET);
  if(!tokens||!votes)throw Error('SHEETS_NOT_CONFIGURED');
  const hash=sha256_(body.token+salt),tokenRows=tokens.getDataRange().getValues();
  if(!tokenRows.slice(1).some(r=>String(r[0])===hash&&r[1]===true))return json_({ok:false,error:'INVALID_TOKEN'});
  const rows=votes.getDataRange().getValues(),prior=rows.slice(1).find(r=>String(r[2])===hash&&String(r[1])===body.projectId);
  if(prior){if(String(prior[9])===body.idempotencyKey)return json_({ok:true,duplicate:true,receipt:String(prior[0])});return json_({ok:false,error:'ALREADY_EVALUATED'});}
  const score=weighted_(body.scores),receipt=Utilities.getUuid();
  votes.appendRow([receipt,body.projectId,hash,...body.scores,score,new Date(),body.idempotencyKey]);
  SpreadsheetApp.flush();
  return json_({ok:true,duplicate:false,receipt});
 }catch(e){return json_({ok:false,error:safeError_(e&&e.message)});}
 finally{if(lock.hasLock())lock.releaseLock();}
}
function validate_(b){
 if(typeof b.token!=='string'||b.token.length<20||b.token.length>256)throw Error('INVALID_TOKEN_FORMAT');
 if(typeof b.projectId!=='string'||!isKnownProject_(b.projectId))throw Error('INVALID_PROJECT');
 if(typeof b.idempotencyKey!=='string'||b.idempotencyKey.length<16||b.idempotencyKey.length>100)throw Error('INVALID_IDEMPOTENCY_KEY');
 if(!Array.isArray(b.scores)||b.scores.length!==4||b.scores.some(n=>!Number.isInteger(n)||n<1||n>5))throw Error('INVALID_SCORES');
}
function isKnownProject_(id){const m=id.match(/^(EXT|NAC)-(\d{3})$/);if(!m)return false;const n=Number(m[2]);return m[1]==='EXT'?n>=1&&n<=22:n>=1&&n<=24;}
function weighted_(s){return Math.round(s.reduce((a,n,i)=>a+n*CFG.WEIGHTS[i],0)*100)/100;}
function publicRanking_(){
 const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw Error('SERVER_NOT_CONFIGURED');
 const sh=SpreadsheetApp.openById(id).getSheetByName(CFG.VOTES_SHEET);if(!sh)throw Error('SHEETS_NOT_CONFIGURED');
 const groups={};
 for(let n=1;n<=22;n++)groups['EXT-'+String(n).padStart(3,'0')]={projectId:'EXT-'+String(n).padStart(3,'0'),votes:0,sum:0,criteria:[0,0,0,0]};
 for(let n=1;n<=24;n++)groups['NAC-'+String(n).padStart(3,'0')]={projectId:'NAC-'+String(n).padStart(3,'0'),votes:0,sum:0,criteria:[0,0,0,0]};
 sh.getDataRange().getValues().slice(1).forEach(r=>{
  const k=String(r[1]),g=groups[k];if(!g)return;
  const score=Number(r[7]),criteria=r.slice(3,7).map(Number);
  if(!Number.isFinite(score)||criteria.length!==4||criteria.some(n=>!Number.isFinite(n)))return;
  g.votes++;g.sum+=score;for(let i=0;i<4;i++)g.criteria[i]+=criteria[i];
 });
 return {ok:true,ranking:Object.values(groups).map(g=>({projectId:g.projectId,votes:g.votes,average:g.votes?Math.round(g.sum/g.votes*100)/100:null,criteriaAverage:g.votes?g.criteria.map(n=>Math.round(n/g.votes*100)/100):null,status:g.votes>=CFG.MIN_VOTES?'ranked':'pending'}))};
}
function sha256_(v){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,v,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function safeError_(m){return ['INVALID_ACTION','INVALID_TOKEN_FORMAT','INVALID_PROJECT','INVALID_IDEMPOTENCY_KEY','INVALID_SCORES','INVALID_TOKEN','ALREADY_EVALUATED','SERVER_NOT_CONFIGURED','SHEETS_NOT_CONFIGURED','INVALID_TOKENS_HEADERS'].includes(m)?m:'INTERNAL_ERROR';}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}