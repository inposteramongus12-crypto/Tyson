import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Actor} from './kit/core';
import {idle} from './kit/actions';
import {Chick, Pigeon} from './engine/props';
import {FONT} from './kit/ui';
import {Knuckles, Pose, frontHand} from './engine/Stickman';

// fists held out in front, so the knuckles are seen from the side
const FISTS: Pose = {lean: 4, head: 0, armB: [40, 70], armF: [78, 38], legB: [-4, 2], legF: [4, 2]};

/* Character sheet: every character on the dark-blue and on the warm-light background. */
const COLS = 7;
const CW = 1920 / COLS;
const BAND = 440;
type Slot = {who?: string; label: string; fist?: Knuckles; birds?: 'pigeons' | 'chick'};
const SLOTS: Slot[] = [
	{who: 'hero', label: 'ДАНЯ · обычные', fist: 'skin'},
	{who: 'hero', label: 'ДАНЯ · белые', fist: 'white'},
	{who: 'leha', label: 'ЛЁХА'},
	{who: 'coach', label: 'СЕМЁН ИЛЬИЧ'},
	{who: 'mama', label: 'МАМА'},
	{who: 'gera', label: 'ГЕРА'},
	{who: 'rival', label: 'СОПЕРНИК'},
	{who: 'referee', label: 'РЕФЕРИ'},
	{who: 'douglas', label: 'ДУГЛАС (Токио)'},
	{who: 'svita1', label: 'СВИТА 1'},
	{who: 'svita2', label: 'СВИТА 2'},
	{who: 'svita3', label: 'СВИТА 3'},
	{label: 'ГОЛУБИ', birds: 'pigeons'},
	{label: 'ПТЕНЕЦ', birds: 'chick'},
];
const S = 0.8;
const Cell: React.FC<{slot: Slot; i: number; light: boolean}> = ({slot, i, light}) => {
	const cx = CW / 2;
	const floor = BAND - 90;
	return (
		<g>
			{slot.who ? (
				<Actor who={slot.who} x={cx} floor={floor} s={S} facing={1} faceTurn={0.3} uid={`c${i}${light ? 'l' : 'd'}`} seed={i} fist={slot.fist} pose={slot.fist ? FISTS : idle(0, i)} />
			) : slot.birds === 'pigeons' ? (
				<g>
					<Pigeon x={cx - 60} y={floor} s={1.25} />
					<Pigeon x={cx + 70} y={floor} s={1.1} facing={-1} body="#c9ccd6" />
					<Pigeon x={cx} y={floor - 130} s={1} wing={0.8} body="#6f7a93" />
				</g>
			) : (
				<Chick x={cx} y={floor} s={2.4} />
			)}
			<text x={cx} y={BAND - 28} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={21} fill={light ? '#2a2f3f' : '#fff'}>
				{slot.label}
			</text>
		</g>
	);
};

export const CastSheet: React.FC = () => (
	<AbsoluteFill style={{background: '#2a3550'}}>
		<svg width={1920} height={BAND * 4} viewBox={`0 0 1920 ${BAND * 4}`}>
			{[0, 1, 2, 3].map((band) => {
				const light = band >= 2;
				return (
					<g key={band} transform={`translate(0,${band * BAND})`}>
						<rect x={0} y={0} width={1920} height={BAND} fill={light ? '#e9dcc3' : '#2a3550'} />
						<rect x={0} y={BAND - 90} width={1920} height={90} fill={light ? '#cdbb98' : '#1a2238'} />
						{SLOTS.slice((band % 2) * COLS, (band % 2) * COLS + COLS).map((slot, j) => (
							<g key={j} transform={`translate(${j * CW},0)`}>
								<Cell slot={slot} i={(band % 2) * COLS + j} light={light} />
							</g>
						))}
					</g>
				);
			})}
		</svg>
	</AbsoluteFill>
);

/* Close and medium shots of the hero's fists in one of the two knuckle states. */
export const KnucklesShot: React.FC<{state: Knuckles; mode: 'close' | 'medium'}> = ({state, mode}) => {
	const s = 1.05;
	const p = FISTS;
	const [hx, hy] = frontHand(p, 960, 900 - 157 * s, s, 1);
	const view = mode === 'close' ? {w: 380, cx: hx, cy: hy} : {w: 760, cx: hx - 150, cy: hy + 70};
	const h = (view.w * 9) / 16;
	return (
		<AbsoluteFill style={{background: '#2a3550'}}>
			<svg width={1920} height={1080} viewBox={`${view.cx - view.w / 2} ${view.cy - h / 2} ${view.w} ${h}`}>
				<rect x={-400} y={900} width={3000} height={400} fill="#1a2238" />
				<Actor who="hero" x={960} floor={900} s={s} facing={1} faceTurn={0.3} uid={'k' + state} fist={state} pose={p} shadow />
			</svg>
			<div style={{position: 'absolute', left: 36, top: 28, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff', textShadow: '0 2px 6px #000'}}>
				{state === 'white' ? 'КОСТЯШКИ БЕЛЫЕ (сжат)' : 'КОСТЯШКИ ОБЫЧНЫЕ (расслаблен)'}
			</div>
		</AbsoluteFill>
	);
};
