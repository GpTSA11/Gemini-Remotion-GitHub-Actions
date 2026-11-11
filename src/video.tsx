import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import content from './scenes.json';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const MotionScene: React.FC<{scene: (typeof content.scenes)[number]; index: number}> = ({scene, index}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const vertical = height > width;
  const fadeIn = interpolate(frame, [0, 24], [0, 1], clamp);
  const fadeOut = interpolate(frame, [scene.frames - 21, scene.frames], [1, 0], clamp);
  const opacity = Math.min(fadeIn, fadeOut);
  const enter = spring({frame, fps, config: {damping: 200, stiffness: 80}});
  const rotate = frame * (index % 2 === 0 ? 0.33 : -0.33);
  const offsetY = interpolate(enter, [0, 1], [78, 0]);
  const palette = content.palette;
  const circleSize = vertical ? 850 : 660;
  return <AbsoluteFill style={{backgroundColor:palette.background, overflow:'hidden', fontFamily:'"Noto Kufi Arabic", "Noto Sans Arabic", sans-serif'}}>
    <AbsoluteFill style={{opacity: 0.2, background:`radial-gradient(circle at ${index%2? '75% 35%':'30% 70%'}, ${palette.panel} 0%, transparent 60%)`}} />
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{position:'absolute', inset:0, opacity:0.78}}>
      <g transform={`translate(${width/2} ${height/2}) rotate(${rotate})`}>
        <circle r={circleSize/2} fill="none" stroke={palette.accent} strokeWidth="3" strokeDasharray="14 24" opacity={0.4}/>
        <circle r={circleSize/2-72} fill="none" stroke={palette.accent} strokeWidth="2" opacity="0.2" />
        {Array.from({length:8}, (_,i) => {
          const a = (i*45+frame*0.65)*Math.PI/180;
          const r = circleSize/2;
          return <circle key={i} cx={Math.cos(a)*r} cy={Math.sin(a)*r} r={i%2?7:11} fill={palette.accent} opacity={0.4+0.3*Math.sin(frame/30+i)} />;
        })}
      </g>
      <path d={`M ${-100} ${height*.22} Q ${width*.45} ${height*.07} ${width+100} ${height*.26}`} stroke={palette.accent} strokeWidth="2" fill="none" opacity={0.25}/>
      <path d={`M ${-100} ${height*.82} Q ${width*.55} ${height*.92} ${width+100} ${height*.73}`} stroke={palette.accent} strokeWidth="2" fill="none" opacity={0.25}/>
    </svg>
    <AbsoluteFill style={{justifyContent:'center', alignItems:'center', padding: vertical?'100px 82px':'80px 190px', opacity}}>
      <div dir="rtl" lang="ar" style={{width:'100%', maxWidth:vertical?920:1440, textAlign:'center', transform:`translateY(${offsetY}px)`}}>
        <div style={{color:palette.accent, fontSize:vertical?29:26, fontWeight:600, marginBottom:43, letterSpacing:1}}>✦  {String(index+1).padStart(2,'0')} / {content.scenes.length}  ✦</div>
        <div style={{color:palette.text, fontWeight:800, fontSize:vertical?86:96, lineHeight:1.55, overflowWrap:'break-word', textShadow:'0 7px 28px #0008'}}>{scene.heading}</div>
        <div style={{width:Math.min(width*.35,390), height:3, margin:'42px auto', backgroundColor:palette.accent, transform:`scaleX(${enter})`}}/>
        <div style={{color:palette.text, opacity:0.84, fontWeight:500, fontSize:vertical?39:40, lineHeight:1.8}}>{scene.subheading}</div>
      </div>
    </AbsoluteFill>
    <div dir="rtl" style={{position:'absolute', bottom:vertical?85:40, width:'100%', color:palette.accent, fontSize:vertical?22:20, textAlign:'center', opacity:opacity*.7}}>GEMINI × REMOTION | استوديو الفيديو الذكي</div>
  </AbsoluteFill>;
};
export const Video:React.FC = () => {
  let offset = 0;
  return <AbsoluteFill>{content.scenes.map((scene,i)=>{
    const from=offset; offset+=scene.frames;
    return <Sequence key={i} from={from} durationInFrames={scene.frames}><MotionScene scene={scene} index={i}/></Sequence>;
  })}</AbsoluteFill>;
};
