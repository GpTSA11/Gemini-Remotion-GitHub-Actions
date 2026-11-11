import React from 'react';
import {Composition} from 'remotion';
import {Video} from './video';
import content from './scenes.json';
const durationInFrames = content.scenes.reduce((sum, scene) => sum + scene.frames, 0);
export const Root: React.FC = () => <>
  <Composition id="MainVideo" component={Video} durationInFrames={durationInFrames} fps={30} width={1080} height={1920} />
  <Composition id="HorizontalVideo" component={Video} durationInFrames={durationInFrames} fps={30} width={1920} height={1080} />
</>;
