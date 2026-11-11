import fs from 'node:fs';
const x=JSON.parse(fs.readFileSync('src/scenes.json','utf8'));
if(!Array.isArray(x.scenes)||!x.scenes.length||x.scenes.length>12)throw Error('Invalid scenes count');
for(const s of x.scenes){if(typeof s.heading!=='string'||!s.heading.trim()||s.heading.length>85||typeof s.subheading!=='string'||s.subheading.length>160||!Number.isInteger(s.frames)||s.frames<30||s.frames>720)throw Error('Invalid scene')}
const frames=x.scenes.reduce((t,s)=>t+s.frames,0);
if(frames>1800)throw Error('Video duration exceeds 60s limit');
console.log('Valid project:',x.scenes.length,'scenes',frames/30,'seconds');
