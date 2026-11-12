import React, {createContext} from 'react';
import {AgeBadge} from '../kit/ui';

/* Locations and set pieces of the story. Stub: only what the shared code needs (HideHud, Tag). */
export const HideHud = createContext(false);

export const Tag: React.FC<{x: number; y: number; value: number; f: number; s?: number; warn?: boolean; ok?: boolean; grey?: boolean; bpm?: number; label?: string; pop?: number; heart?: boolean; auto?: boolean; showBpm?: boolean; heartK?: number}> = ({x, y, value, s = 0.8, label = 'ДЕНЬ', pop = 1}) => (
	<AgeBadge x={x} y={y} value={value} s={s} pop={pop} label={label} c="#ffc94a" />
);
