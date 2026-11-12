import type React from 'react';

/* 9:16 settings. Stub: 'crop' mode (the short is the long cropped to 9:16). Switch to 'recut' when a separate short voice-over exists. */
export type Seg = {
	line: string;
	at?: number;
	ep?: string;
	off?: number;
	cont?: boolean;
	hold?: boolean;
	a?: {cx?: number; cy?: number; z?: number};
	b?: {cx?: number; cy?: number; z?: number};
	C?: React.FC<{f: number; dur: number}>;
	top?: 'hook' | 'p9';
	label?: string;
};

export const SHORT: {mode: 'crop'; hook?: string[]; bed?: string} | {mode: 'recut'; segs: Seg[]; hook?: string[]; bed?: string} = {
	mode: 'crop',
	bed: 'sfx/bed_short.wav',
};
