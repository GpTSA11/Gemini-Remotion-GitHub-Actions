import fs from 'node:fs';
import {GoogleGenAI} from '@google/genai';
const topic=process.env.VIDEO_TOPIC?.trim();
if(!topic){console.log('VIDEO_TOPIC absent, rendering curated demo');process.exit(0)}
if(!process.env.GEMINI_API_KEY)throw Error('GEMINI_API_KEY secret is required when VIDEO_TOPIC is set');
const duration=Number(process.env.VIDEO_DURATION)||15;
if(![15,30,60].includes(duration))throw Error('VIDEO_DURATION must be 15, 30 or 60');
const style=String(process.env.VIDEO_STYLE||'auto');
const voice=String(process.env.VOICE_PREFERENCE||'none');
const frameCounts=duration===15?[120,120,120,90]:duration===30?[240,240,240,180]:[480,480,480,360];
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
const prompt=`أنت مخرج موشن جرافيكس عربي. حوّل الموضوع إلى أربعة مشاهد محددة واضحة تنفذ في فيديو ${duration} ثانية. الأسلوب المختار: ${style}. اختر ألواناً مناسبة للموضوع. تجنّب الحقائق غير المؤكدة أو الآيات والأحاديث والاقتباسات دون تحقق. انتبه أن التوليد الحالي رسوم وكلمات متحركة فقط ولا ينتج تعليقاً صوتياً حتى لو كان التفضيل ${voice}. الموضوع: ${topic.slice(0,2500)}. أجب فقط JSON صالحا بهذا الشكل: {"title":"...", "palette":{"background":"#123456","panel":"#123456","accent":"#123456","text":"#ffffff"}, "scenes":[{"heading":"...","subheading":"..."},{"heading":"...","subheading":"..."},{"heading":"...","subheading":"..."},{"heading":"...","subheading":"..."}]}. لا تضف حقولا إضافية. تجنب النصوص الطويلة؛ عنوان كل مشهد بحد أقصى 85 حرفا والوصف 160 حرفا.`;
const response=await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-2.5-flash',contents:prompt,config:{responseMimeType:'application/json'}});
let data;try{data=JSON.parse(response.text)}catch{throw Error('Gemini did not return valid JSON')}
const hex=/^#[0-9a-f]{6}$/i;
if(!data.palette||!['background','panel','accent','text'].every(k=>typeof data.palette[k]==='string'&&hex.test(data.palette[k]))||!Array.isArray(data.scenes)||data.scenes.length!==4)throw Error('Invalid Gemini structure');
for(const s of data.scenes)if(typeof s.heading!=='string'||s.heading.length>85||!s.heading.trim()||typeof s.subheading!=='string'||s.subheading.length>160)throw Error('Invalid title');
data.scenes=data.scenes.map((s,i)=>({heading:s.heading,subheading:s.subheading,variant:['orbit','path','rings','reveal'][i],frames:frameCounts[i]}));
fs.writeFileSync('src/scenes.json',JSON.stringify({title:String(data.title||topic).slice(0,100),palette:data.palette,scenes:data.scenes},null,2));
console.log('Generated storyboard:',duration,'seconds, style:',style,'voice preference:',voice,'(no TTS yet)');
console.log('Review factual accuracy before publication.');
