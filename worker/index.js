/**
 * Cloudflare Worker gateway for GitHub Actions. Deploy with secrets:
 * GITHUB_TOKEN: fine-grained GitHub PAT (Actions: read/write) scoped to one repo.
 * STUDIO_PASSWORD: strong independent password (not Gemini key, not GitHub PAT).
 * ALLOWED_ORIGIN: https://gptsa11.github.io (non-secret env var)
 * Uses server-side credentials only. DO NOT disable authentication or open CORS.
 */
const REPO='GpTSA11/Gemini-Remotion-GitHub-Actions';
const WORKFLOW='render.yml';
const GH='https://api.github.com/repos/'+REPO;
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
const allowed=['auto','educational','cinematic','infographic','sports','calm'];
function compare(a,b){if(typeof a!=='string'||typeof b!=='string'||!b)return false;let v=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)v|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return v===0}
function cors(env,origin){const allowedOrigin=env.ALLOWED_ORIGIN||'https://gptsa11.github.io';return origin===allowedOrigin?{'Access-Control-Allow-Origin':allowedOrigin,'Vary':'Origin','Access-Control-Allow-Headers':'Content-Type, X-Studio-Password','Access-Control-Allow-Methods':'GET, POST, OPTIONS'}:{}}
async function github(path,token,options={}){const res=await fetch(GH+path,{...options,headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Gemini-Motion-Studio',...(options.headers||{})}});let data=null;try{data=await res.json()}catch{}return {status:res.status,data}}
export default {async fetch(req,env){
 const origin=req.headers.get('Origin')||'';
 const headers=cors(env,origin);
 if(req.method==='OPTIONS')return new Response(null,{status:origin===(env.ALLOWED_ORIGIN||'https://gptsa11.github.io')?204:403,headers});
 if(origin!==(env.ALLOWED_ORIGIN||'https://gptsa11.github.io'))return json({error:'مصدر الطلب غير مسموح'},403,headers);
 if(!compare(req.headers.get('X-Studio-Password'),env.STUDIO_PASSWORD))return json({error:'كلمة مرور الاستوديو غير صحيحة'},401,headers);
 if(!env.GITHUB_TOKEN)return json({error:'لم يتم إعداد رمز GitHub داخل Worker Secrets'},503,headers);
 const url=new URL(req.url);
 try{
 if(url.pathname==='/api/render'&&req.method==='POST'){
   const body=await req.json();const topic=String(body.topic||'').trim();
   const duration=String(body.duration||'15'),aspect=String(body.aspect||'vertical'),style=String(body.style||'auto'),voice=String(body.voice||'none');
   if(topic.length<8||topic.length>2500||!['15','30','60'].includes(duration)||!['vertical','horizontal'].includes(aspect)||!allowed.includes(style)||!['none','male','female'].includes(voice))return json({error:'راجع موضوع الفيديو والخيارات'},400,headers);
   const id=crypto.randomUUID();
   const result=await github('/actions/workflows/'+WORKFLOW+'/dispatches',env.GITHUB_TOKEN,{method:'POST',body:JSON.stringify({ref:'main',inputs:{topic,duration,aspect,style,voice,request_id:id}})});
   if(result.status!==204)return json({error:'رفض GitHub تشغيل المهمة: '+result.status,detail:result.data?.message||null},502,headers);
   return json({id,actions_url:'https://github.com/'+REPO+'/actions'},202,headers);
 }
 if(url.pathname==='/api/status'&&req.method==='GET'){
   const id=url.searchParams.get('id');if(!id||!/^[0-9a-f-]{36}$/.test(id))return json({error:'رقم الطلب غير صالح'},400,headers);
   const result=await github('/actions/workflows/'+WORKFLOW+'/runs?event=workflow_dispatch&per_page=50',env.GITHUB_TOKEN);
   if(result.status!==200)return json({error:'تعذر قراءة حالة GitHub: '+result.status},502,headers);
   const run=(result.data?.workflow_runs||[]).find(x=>x.display_title==='studio-'+id);
   if(!run)return json({state:'not_found',actions_url:'https://github.com/'+REPO+'/actions'},200,headers);
   return json({state:'found',status:run.status,conclusion:run.conclusion,url:run.html_url,run_id:run.id},200,headers);
 }
 return json({error:'مسار غير معروف'},404,headers);
 }catch(e){return json({error:'تعذر إتمام الطلب. راجع إعداد Worker أو صلاحيات GitHub.'},500,headers)}
}};
