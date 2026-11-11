import fs from 'node:fs';
import {GoogleGenAI} from '@google/genai';
const topic=process.env.VIDEO_TOPIC?.trim();
if(!topic){console.log('VIDEO_TOPIC absent, rendering curated demo');process.exit(0)}
if(!process.env.GEMINI_API_KEY) throw Error('GEMINI_API_KEY secret is required when VIDEO_TOPIC is set');
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
const prompt=`أنت مخرج موشن جرافيكس عربي. حول الموضوع التالي إلى أربعة مشاهد مناسبة لفيديو 15 ثانية، حركة هندسية متجهة ونصوص عربية صحيحة. اختر ألوانا مناسبة للموضوع. لا تخترع حقائق أو اقتباسات أو آيات. الموضوع: ${topic.slice(0,2500)}. أجب فقط JSON صالحا بهذا الشكل: {"title":"...", "palette":{"background":"#123456","panel":"#123456","accent":"#123456","text":"#ffffff"}, "scenes":[{"heading":"...","subheading":"...","variant":"orbit","frames":120}, {"heading":"...","subheading":"...","variant":"path","frames":120}, {"heading":"...","subheading":"...","variant":"rings","frames":120}, {"heading":"...","subheading":"...","variant":"reveal","frames":90}]}. لا تضف حقولا. مجموع الاطارات 450. العبارة القصيرة لا تتجاوز 85 حرفا.`;
const response=await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-2.5-flash',contents:prompt,config:{responseMimeType:'application/json'}});
let data;
try{data=JSON.parse(response.text)}catch{throw Error('Gemini did not return valid JSON')}
const hex=/^#[0-9a-f]{6}$/i;
if(!data.palette||!['background','panel','accent','text'].every(k=>hex.test(data.palette[k]))||!Array.isArray(data.scenes)||data.scenes.length!==4) throw Error('Invalid Gemini structure');
for(const s of data.scenes){if(typeof s.heading!=='string'||s.heading.length>85||!s.heading.trim()||typeof s.subheading!=='string'||s.subheading.length>160)throw Error('Invalid title');}
data.scenes=data.scenes.map((s,i)=>({heading:s.heading,subheading:s.subheading,variant:['orbit','path','rings','reveal'][i],frames:[120,120,120,90][i]}));
fs.writeFileSync('src/scenes.json',JSON.stringify({title:String(data.title||topic).slice(0,100),palette:data.palette,scenes:data.scenes},null,2));
console.log('Gemini storyboard generated. Review factual accuracy before publication.');
