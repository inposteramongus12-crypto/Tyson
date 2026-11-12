/* Story-level settings for the Tyson video. Neutral stub: fill in title, counter and bed when the script exists. */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number};

export const STORY: {
	title: string;
	hero: string; // cast id of the main character
	counter?: {label: string; color?: string; keys: CounterKeyDef[]}; // badge over the hero
	heroAge?: (counter: number) => number;
	heroGrow?: number;
	bed: string; // sound bed in public/ (ambience + sfx, no music)
	musicVolume?: number;
	endCaption?: string[]; // last words on screen (call to action)
} = {
	title: 'Tyson',
	hero: 'hero',
	bed: 'sfx/bed.wav', // built later by tools/make-sound.mjs
};
