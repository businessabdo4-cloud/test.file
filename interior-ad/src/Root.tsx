import React from 'react';
import {Composition} from 'remotion';
import {Ad} from './Ad';
import {FPS, H, TL, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="Ad" component={Ad} durationInFrames={TL.durationInFrames} fps={FPS} width={W} height={H} />
);
