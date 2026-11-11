import fs from 'node:fs';
const x=JSON.parse(fs.readFileSync('src/scenes.json','utf8'));
if(!Array.isArray(x.scenes) || !x.scenes.length || x.scenes.length>12) throw Error('Invalid scenes count');
for(const s of x.scenes){if(typeof s.heading!=='string'||!s.heading.trim()||s.heading.length>85||typeof s.subheading!=='string'||s.subheading.length>160||!Number.isInteger(s.frames)||s.frames<30||s.frames>360) throw Error('Invalid scene');}
console.log('Valid project:', x.scenes.length, 'scenes',x.scenes.reduce((t,s)=>t+s.frames,0)/30,'seconds');
