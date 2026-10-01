import React from 'react';
import {Composition} from 'remotion';
import {Ad} from './Ad';
import {VIDEO} from './config';
import {TOTAL_FRAMES} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GlasseMaxAd"
    component={Ad}
    durationInFrames={TOTAL_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
