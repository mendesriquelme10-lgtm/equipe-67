/** Universo IF Avalia API. Propriedades: SPREADSHEET_ID e TOKEN_SALT.
 * Abas: Tokens(hash_codigo, ativo); Votos(id_recibo,id_projeto,hash_codigo,c1,c2,c3,c4,nota_ponderada,criado_em,idempotency_key).
 * Não publicar como Web App antes da revisão e autorização explícita.
 */
const CFG={TOKENS_SHEET:'Tokens',VOTES_SHEET:'Votos',MIN_VOTES:5,WEIGHTS:[.30,.30,.25,.15]};
function doGet(){try{return json_(publicRanking_());}catch(e){return json_({ok:false,error:'SERVICE_UNAVAILABLE'});}}
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
function isKnownProject_(id){const m=id.match(/^(EXT|NAC)-(\d{3})$/);if(!m)return false;const n=Number(m[2]);return m[1]==='EXT'?n>=1&&n<=22:n>=1&&n<=24;}\nfunction weighted_(s){return Math.round(s.reduce((a,n,i)=>a+n*CFG.WEIGHTS[i],0)*100)/100;}
function publicRanking_(){
 const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw Error('SERVER_NOT_CONFIGURED');
 const sh=SpreadsheetApp.openById(id).getSheetByName(CFG.VOTES_SHEET);if(!sh)throw Error('SHEETS_NOT_CONFIGURED');
 const groups={};sh.getDataRange().getValues().slice(1).forEach(r=>{const k=String(r[1]);if(!groups[k])groups[k]={projectId:k,votes:0,sum:0,criteria:[0,0,0,0]};const g=groups[k];g.votes++;g.sum+=Number(r[7]);for(let i=0;i<4;i++)g.criteria[i]+=Number(r[3+i]);});
 return {ok:true,ranking:Object.values(groups).map(g=>({projectId:g.projectId,votes:g.votes,average:Math.round(g.sum/g.votes*100)/100,criteriaAverage:g.criteria.map(n=>Math.round(n/g.votes*100)/100),status:g.votes>=CFG.MIN_VOTES?'ranked':'pending'}))};
}
function sha256_(v){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,v,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function safeError_(m){return ['INVALID_ACTION','INVALID_TOKEN_FORMAT','INVALID_PROJECT','INVALID_IDEMPOTENCY_KEY','INVALID_SCORES','INVALID_TOKEN','ALREADY_EVALUATED','SERVER_NOT_CONFIGURED','SHEETS_NOT_CONFIGURED'].includes(m)?m:'INTERNAL_ERROR';}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}