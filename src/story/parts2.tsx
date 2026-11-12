import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {Actor, useShot} from '../kit/core';
import {Pose, frontHand, toLocal} from '../engine/Stickman';
import {Chair, Pigeon} from '../engine/props';
import {gesture, idle, reach} from '../kit/actions';
import {Floor, Kitchen, KitchenTable, Wall} from '../kit/sets';
import {Layer, Svg, camOn, clamp, ease, flash} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {FL, HS, hip} from './common';
import {Crack, FK, GOLD, Hero, Mug, PLATE, Plate, Roof, Scene, Shards, Yard, handTo, kk, lerp} from './parts';

/* Scenes of parts 4–6 (lines 040–083): trainer, first fights, empty chair.
   Same rules as parts 1–3: plates 60 px from the edges, large small-text, big fist only on breakages and where the
   knuckle colour is the point (egg stopped a centimetre away, the bottle), a hand always grows from a shoulder or the frame edge. */

/* ----------------------------- the basement gym ----------------------------- */
const Cap: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<path d="M-36,0 C-36,-40 36,-40 36,0 Z" fill="#8c2a2a" stroke="#4a1414" strokeWidth={3} />
		<path d="M16,-2 Q66,-8 70,8 L14,8 Z" fill="#6b1f1f" stroke="#4a1414" strokeWidth={3} />
		<circle cx={0} cy={-36} r={5} fill="#4a1414" />
	</g>
);
export const Egg: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<ellipse cx={x} cy={y} rx={24 * s} ry={31 * s} fill="#fbf3dc" stroke="#d9c89a" strokeWidth={3} transform={`rotate(${rot} ${x} ${y})`} />
);
export const Splat: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
	<g opacity={k > 0 ? 1 : 0}>
		<ellipse cx={x} cy={y} rx={70 * k} ry={26 * k} fill="#f2c94a" />
		<ellipse cx={x} cy={y - 6} rx={44 * k} ry={14 * k} fill="#fff4d0" />
		{[0, 1, 2, 3, 4].map((i) => (
			<circle key={i} cx={x + (i - 2) * 46 * k} cy={y + 8 + (i % 2) * 14} r={7 * k} fill="#f2c94a" />
		))}
	</g>
);
const Towel: React.FC<{x: number; y: number; rot?: number; c?: string}> = ({x, y, rot = 0, c = '#4aa8d8'}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-52} y={-15} width={104} height={30} rx={8} fill="#f4f6fa" stroke="#9aa3b5" strokeWidth={3} />
		<rect x={-52} y={-4} width={104} height={9} fill={c} />
	</g>
);
const Mitt: React.FC<{r?: number}> = ({r = 0}) => (
	<g transform={`rotate(${r})`}>
		<rect x={-14} y={-36} width={60} height={72} rx={16} fill="#d94a3a" stroke="#7a1f18" strokeWidth={4} />
		<circle cx={16} cy={0} r={13} fill="none" stroke="#7a1f18" strokeWidth={3} />
	</g>
);

export const Gym: React.FC<{f: number; handle?: boolean; cap?: boolean; chair?: boolean; light?: number; bag?: 'whole' | 'burst' | 'none'; nail2?: 'plain' | 'bent'}> = ({f, handle = true, cap, chair, light = 1, bag = 'whole', nail2 = 'plain'}) => (
	<Svg>
		<Wall id="gy" top="#3a3550" bot="#4e4866" trim="#2a263c" trimY={760} />
		{Array.from({length: 9}).map((_, i) => (
			<line key={i} x1={-100} y1={120 + i * 90} x2={2100} y2={120 + i * 90} stroke="#2f2b45" strokeWidth={3} opacity={0.6} />
		))}
		<rect x={170} y={110} width={260} height={110} fill="#9fd2f0" stroke="#2a263c" strokeWidth={12} />
		<line x1={300} y1={110} x2={300} y2={220} stroke="#2a263c" strokeWidth={8} />
		<polygon points="170,220 430,220 700,900 120,900" fill="#fff6d8" opacity={0.13 * light} />
		<Floor y={900} c="#6a5444" plank />
		{/* ring corner */}
		<g>
			{[560, 650, 740].map((y, i) => (
				<line key={i} x1={1100} y1={y} x2={1620} y2={y} stroke={['#d94a3a', '#f2f2f2', '#2f6fd8'][i]} strokeWidth={12} />
			))}
			<rect x={1088} y={520} width={24} height={380} fill="#47506a" />
			<rect x={1546} y={600} width={80} height={170} rx={14} fill="#2f6fd8" stroke="#1d3f8a" strokeWidth={4} />
			<rect x={1588} y={540} width={36} height={360} fill="#47506a" />
		</g>
		{/* bags */}
		{bag !== 'none' ? (
			<g>
				<line x1={860} y1={-40} x2={860} y2={470} stroke="#9aa3b5" strokeWidth={6} />
				<rect x={812} y={470} width={96} height={bag === 'burst' ? 150 : 290} rx={32} fill="#8a3a2a" stroke="#4a1a10" strokeWidth={4} />
			</g>
		) : null}
		<line x1={1000} y1={-40} x2={1000} y2={480} stroke="#9aa3b5" strokeWidth={6} />
		<rect x={952} y={480} width={96} height={280} rx={32} fill="#3a5a8a" stroke="#1a2a4a" strokeWidth={4} />
		{/* nails: the door handle and the second one for the cap */}
		<circle cx={430} cy={430} r={7} fill="#c9cfdd" />
		{handle ? (
			<g>
				<path d="M430,430 q30,10 30,40" stroke="#c9cfdd" strokeWidth={5} fill="none" />
				<rect x={410} y={466} width={74} height={24} rx={11} fill="#c9cfdd" stroke="#6b7388" strokeWidth={3} />
			</g>
		) : null}
		{nail2 === 'plain' ? <rect x={598} y={426} width={30} height={8} rx={3} fill="#c9cfdd" /> : <path d="M598,430 q30,0 34,20 q2,16 -14,20" stroke="#c9cfdd" strokeWidth={9} fill="none" strokeLinecap="round" />}
		{cap ? <Cap x={618} y={nail2 === 'plain' ? 424 : 480} s={0.9} rot={nail2 === 'plain' ? 0 : -10} /> : null}
		{chair ? (
			<g>
				<Chair x={1360} y={780} seat="#8a6a44" />
				{cap ? null : <Cap x={1370} y={766} s={0.95} />}
			</g>
		) : null}
	</Svg>
);

const stance = (f: number, seed: number, lean = 6): Pose => ({...idle(f, seed), lean});
const coachAt = (f: number, x: number, facing: 1 | -1 = -1, pose?: Pose, extra: Record<string, any> = {}) => (
	<Actor who="coach" x={x} floor={FL} s={HS} facing={facing} uid={'co' + Math.round(x)} pose={pose ?? idle(f, 4)} faceTurn={0.3} {...extra} />
);

/* ================================ PART 4 ================================ */
export const S040: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('040');
	const hide = kk(t, 60, 100);
	const hold = idle(f, 1);
	const hands = reach(reach(hold, 'F', [66, -32], 1), 'B', [46, -28], 1);
	const co = reach(reach(idle(f, 4), 'F', [-28, -50], hide), 'B', [-36, -46], hide);
	return (
		<Scene from={camOn(900, 640, 1.0)} to={camOn(900, 650, 1.2)}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={660} uid="h40" pose={hands} expr="worried" />
					{coachAt(f, 1080, -1, co)}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S041: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('041');
	const nod = Math.sin(kk(t, 6, 30) * Math.PI) * 8;
	return (
		<Scene from={camOn(760, 620, 1.1)} to={camOn(800, 620, 1.35)}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={640} uid="h41" pose={idle(f, 2)} />
					{coachAt(f, 1000, -1, {...idle(f, 4), head: nod, armF: [lerp(8, 70, kk(t, 20, 40)), 30]})}
				</Svg>
			</Layer>
		</Scene>
	);
};

export const CardBG: React.FC<{t: number; push?: number; children?: React.ReactNode; html?: React.ReactNode}> = ({t, push = 0.3, children, html}) => {
	const u = interpolate(t, [0, 200], [0, 1], {...clamp, easing: ease});
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2c3566 0%, #131736 75%)'}}>
			<AbsoluteFill style={{transform: `scale(${1 + push * u})`, transformOrigin: '50% 55%'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>{children}</svg>
			</AbsoluteFill>
			{html}
		</AbsoluteFill>
	);
};
export const S042: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('042');
	return (
		<CardBG t={t} push={0.28} html={<Plate x={960} y={800} w={900} h={130} text="КЭТСКИЛЛ" t={t - 8} size={84} />}>
			<rect x={240} y={110} width={1440} height={640} rx={26} fill="#dfe8f0" stroke="#fff" strokeWidth={10} />
			<path d="M360,620 L520,260 L900,200 L1240,340 L1500,300 L1560,560 L1100,700 Z" fill="#b9d6a8" stroke="#6a8a5a" strokeWidth={6} />
			<path d="M720,420 L1010,380 L1100,520 L800,560 Z" fill="#9ec48a" stroke="#6a8a5a" strokeWidth={5} />
			<text x={1180} y={270} fontFamily={FONT} fontWeight={800} fontSize={72} fill="#2b3366">ГОРЫ</text>
			<g transform="translate(960,470)">
				<circle r={34} fill="#d94a3a" stroke="#fff" strokeWidth={8} />
			</g>
			<g transform="translate(1420,600)">
				<rect x={-90} y={-50} width={180} height={100} fill="#8a6a44" stroke="#47362a" strokeWidth={5} />
				<polygon points="-110,-50 0,-110 110,-50" fill="#c9402f" stroke="#47362a" strokeWidth={5} />
				<rect x={-26} y={-6} width={52} height={56} fill="#2a263c" />
			</g>
		</CardBG>
	);
};
export const S043: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('043');
	const sway = Math.sin(t / 9) * 12;
	const hits: [number, number, number][] = [[1230, 380, 1], [1010, 520, 2], [1240, 560, 3], [700, 470, 7]];
	return (
		<CardBG t={t} push={0.18} html={<Plate x={960} y={70} w={760} h={120} text="ПИКАБУ" t={t} size={78} />}>
			<g transform={`translate(0,0)`}>
				<g transform={`rotate(${sway} 960 900)`}>
					<Actor who="referee" x={960} floor={900} s={1.2} facing={1} uid="dm" color="#9aa3b5" hair="none" outfit="tee" rim="#e8ecf5" pose={{...idle(f, 3), armF: [70, 90], armB: [60, 95]}} shadow={false} />
				</g>
			</g>
			{hits.map(([x, y, n], i) => {
				const on = ((t + i * 14) % 56) < 28;
				return (
					<g key={i} transform={`translate(${x},${y})`} opacity={on ? 1 : 0.3}>
						<circle r={on ? 54 : 44} fill={PLATE} stroke={GOLD} strokeWidth={7} />
						<text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={GOLD}>{n}</text>
					</g>
				);
			})}
		</CardBG>
	);
};
export const S044: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('044');
	const ph = Math.floor(t / 9);
	const hit = Math.abs(Math.sin((t / 9) * Math.PI));
	const side = ph % 2 === 0 ? 'F' : 'B';
	const dodge = kk(t, 30, 44) * (1 - kk(t, 44, 54));
	const padF: [number, number] = [868, 640];
	const padB: [number, number] = [860, 715];
	const hp = reach(reach({...idle(f, 1), lean: 8 + 22 * dodge}, 'F', toLocal(padF[0], padF[1], 740, hip(HS), HS, 1), side === 'F' ? hit : 0.2), 'B', toLocal(padB[0], padB[1], 740, hip(HS), HS, 1), side === 'B' ? hit : 0.2);
	const cp = reach(reach(idle(f, 4), 'F', toLocal(padF[0] + 8 + (dodge > 0 ? 40 * dodge : 0), padF[1], 970, hip(HS), HS, -1), 1), 'B', toLocal(padB[0] + 8, padB[1], 970, hip(HS), HS, -1), 1);
	return (
		<Scene from={camOn(860, 640, 1.1)} to={camOn(880, 640, 1.4)}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={740} uid="h44" pose={hp} expr="angry" />
					{coachAt(f, 970, -1, cp, {handItem: <Mitt r={-90} />})}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S045: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('045');
	const seg = Math.min(2, Math.floor(t / 44));
	const u = t % 44;
	const jump = Math.abs(Math.sin(u / 2.4)) * 40;
	const swing = Math.sin(u / 3) * 16;
	const punch = Math.abs(Math.sin(u / 3.4));
	return (
		<Scene from={camOn(880, 640, 1.0)} to={camOn(880, 650, 1.25)}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{seg === 0 ? (
						<g>
							<Hero x={800} uid="h45a" bob={jump} pose={{...idle(f, 1), armF: [52, 72], armB: [52, 72], legF: [4, 20 * (jump / 40)], legB: [-4, 20 * (jump / 40)]}} />
							<path d={`M730,${700 - jump} Q800,${u % 22 < 11 ? 1000 : 400} 870,${700 - jump}`} stroke="#ffd34a" strokeWidth={7} fill="none" />
						</g>
					) : null}
					{seg === 1 ? (
						<g>
							<g transform={`rotate(${swing} 1000 -40)`}>
								<line x1={1000} y1={-40} x2={1000} y2={480} stroke="#9aa3b5" strokeWidth={6} />
								<rect x={952} y={480} width={96} height={280} rx={32} fill="#3a5a8a" stroke="#1a2a4a" strokeWidth={4} />
							</g>
							<Hero x={820} uid="h45b" pose={reach({...idle(f, 2), lean: 10}, 'F', toLocal(946, 620, 820, hip(HS), HS, 1), punch)} />
						</g>
					) : null}
					{seg === 2 ? (
						<g>
							<g opacity={0.5}>
								<Actor who="hero" x={1060} floor={FL} s={HS} facing={-1} uid="shd" color="#0b0d1e" rim="#6a7088" pose={reach({...idle(f, 2), lean: 10}, 'F', toLocal(960, 620, 1060, hip(HS), HS, -1), Math.abs(Math.sin(u / 3.4)))} shadow={false} />
							</g>
							<Hero x={820} uid="h45c" pose={reach({...idle(f, 2), lean: 10}, 'F', toLocal(920, 640, 820, hip(HS), HS, 1), 0.6 * Math.abs(Math.sin(u / 3.4)))} expr="worried" />
							<circle cx={940} cy={620} r={16} fill="none" stroke={GOLD} strokeWidth={6} />
						</g>
					) : null}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S046: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('046');
	const slap = Math.abs(Math.sin(kk(t, 20, 36) * Math.PI));
	const late = kk(t, 50, 66) * (1 - kk(t, 66, 80));
	const cp = reach(idle(f, 4), 'F', toLocal(780, 470, 1000, hip(HS), HS, -1), slap * 0.9);
	return (
		<Scene from={camOn(860, 620, 1.1)} to={camOn(840, 620, 1.4)}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={740} uid="h46" pose={{...idle(f, 1), lean: 6 + 24 * late, head: 8 * slap}} expr={slap > 0.5 ? 'wide' : 'worried'} />
					{coachAt(f, 1000, -1, cp, {handItem: <Mitt r={-90} />})}
				</Svg>
			</Layer>
		</Scene>
	);
};

/* shoulders raised to the ears (blobs beside the neck) with optional towels */
const Shoulders: React.FC<{x: number; k: number; towel?: number}> = ({x, k, towel = 0}) => {
	const dy = lerp(36, 0, k);
	return (
		<g transform={`translate(${x},${hip(HS)}) scale(${HS})`}>
			{[-1, 1].map((sd) => (
				<g key={sd}>
					<ellipse cx={sd * 58} cy={-112 + dy} rx={34} ry={26} fill="#f2b21c" stroke="#b8830f" strokeWidth={3} />
					{towel > 0 ? <Towel x={sd * 58} y={-134 + dy - towel * 0} rot={sd * 10} c={sd < 0 ? '#4aa8d8' : '#d94a3a'} /> : null}
				</g>
			))}
		</g>
	);
};
const chestPose = (f: number): Pose => reach(reach({...idle(f, 2), lean: 0, head: 0}, 'F', [52, -62], 1), 'B', [38, -56], 1);
export const S047: React.FC = () => {
	const {f} = useShot();
	return (
		<Scene from={camOn(900, 620, 1.6)} to={camOn(900, 610, 1.9)} ov={<Plate x={400} y={460} w={500} h={120} text="ПЛЕЧИ" size={80} />}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={900} big fist="white" uid="h47" pose={chestPose(f)} expr="worried" mouth="flat" faceTurn={0.1} />
					<Shoulders x={900} k={1} />
					{coachAt(f, 1300, -1, {...idle(f, 4), armF: [6, 20]}, {})}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S048: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('048');
	const put = kk(t, 20, 44);
	const cp = reach(reach(idle(f, 4), 'F', toLocal(1000, 480, 1160, hip(HS), HS, -1), put), 'B', toLocal(1000, 480, 1160, hip(HS), HS, -1), put);
	return (
		<Scene from={camOn(1000, 600, 1.4)} to={camOn(1000, 590, 1.7)}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={900} big fist="white" uid="h48" pose={chestPose(f)} expr="worried" mouth="flat" faceTurn={0.1} />
					<Shoulders x={900} k={1} towel={put > 0.3 ? 1 : 0} />
					{coachAt(f, 1160, -1, cp)}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S049: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('049');
	const k = 1 - kk(t, 8, 22) * (1 - kk(t, 112, 128));
	const slide = kk(t, 126, 150);
	const fallK = kk(t, 150, 170);
	const hx = 900;
	const pick = kk(t, 170, 190);
	return (
		<Scene from={camOn(1000, 620, 1.2)} to={camOn(1000, 640, 1.35)}>
			<Layer depth={1}>
				<Gym f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={hx} uid="h49" pose={chestPose(f)} expr={k < 0.5 ? 'normal' : 'worried'} mouth="flat" faceTurn={0.1} big={k > 0.5} fist="white" />
					<Shoulders x={hx} k={k} />
					{/* towels slide off and fall */}
					<g transform={`translate(${hx},${hip(HS)}) scale(${HS})`}>
						{[-1, 1].map((sd) => {
							const y0 = -134 + lerp(36, 0, k);
							const y = y0 + slide * 40 + fallK * fallK * 330;
							return <Towel key={sd} x={sd * 58 + sd * slide * 30} y={Math.min(y, 150)} rot={sd * (10 + slide * 40 + fallK * 80)} c={sd < 0 ? '#4aa8d8' : '#d94a3a'} />;
						})}
					</g>
					{coachAt(f, 1260, -1, {...idle(f, 4), lean: 4 + 30 * pick, armF: [6 + 40 * pick, 30]})}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S050: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('050');
	return (
		<CardBG t={t} push={0.3}>
			<g transform="translate(960,540) rotate(-3) scale(0.82)">
				<rect x={-560} y={-380} width={1120} height={760} rx={18} fill="#fbf8ef" stroke="#9aa3b5" strokeWidth={8} />
				{Array.from({length: 17}).map((_, i) => <line key={'a' + i} x1={-560 + i * 70} y1={-380} x2={-560 + i * 70} y2={380} stroke="#bcd3ee" strokeWidth={3} />)}
				{Array.from({length: 12}).map((_, i) => <line key={'b' + i} x1={-560} y1={-380 + i * 70} x2={560} y2={-380 + i * 70} stroke="#bcd3ee" strokeWidth={3} />)}
				<path d="M-440,-210 q40,-30 80,0 t80,0 t80,0 t80,0" stroke="#2b3366" strokeWidth={9} fill="none" strokeLinecap="round" />
				<path d="M-440,-110 q40,-30 80,0 t80,0 t80,0" stroke="#2b3366" strokeWidth={9} fill="none" strokeLinecap="round" />
				{/* the word under the trainer's finger, two lines under it */}
				<g opacity={interpolate(t, [20, 34], [0, 1], clamp)}>
					<line x1={-300} y1={100} x2={300} y2={100} stroke="#d94a3a" strokeWidth={12} strokeLinecap="round" />
					<line x1={-300} y1={140} x2={300} y2={140} stroke="#d94a3a" strokeWidth={12} strokeLinecap="round" />
					<line x1={150} y1={10} x2={760} y2={120} stroke="#6b7f8e" strokeWidth={110} strokeLinecap="round" />
					<rect x={-190} y={-60} width={380} height={130} rx={60} fill="#e9a373" stroke="#a85a32" strokeWidth={8} transform="rotate(-8)" />
					<rect x={-210} y={-20} width={140} height={120} rx={50} fill="#e9a373" stroke="#a85a32" strokeWidth={8} transform="rotate(-8)" />
				</g>
			</g>
		</CardBG>
	);
};

/* egg scenes: pad at x 1560, hero at 1330 */
const EGGX = 1560;
const EGGY = 566;
const HX = 1330;
const eggFist = (f: number, k: number, stopGap = 0): Pose => reach({...idle(f, 2), lean: 6 + 8 * k}, 'F', toLocal(EGGX - 98 - stopGap, EGGY + 18, HX, hip(HS), HS, 1), k);
const Box: React.FC<{n: number}> = ({n}) => (
	<g transform="translate(1180,860)">
		<rect x={-70} y={-30} width={140} height={34} rx={6} fill="#c9a06a" stroke="#6a4a2a" strokeWidth={3} />
		{Array.from({length: n}).map((_, i) => <Egg key={i} x={-40 + i * 40} y={-48} s={0.72} />)}
	</g>
);
const Bucket: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},900)`}>
		<path d="M-40,-80 L40,-80 L32,0 L-32,0 Z" fill="#7a8794" stroke="#47506a" strokeWidth={4} />
		<ellipse cx={0} cy={-80} rx={40} ry={9} fill="#9fc0d6" />
	</g>
);
const EggScene: React.FC<{from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; f: number; box?: number; bucket?: boolean}> = ({from, to, children, f, box = 4, bucket}) => (
	<Scene from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])}>
		<Layer depth={1}>
			<Gym f={f} />
		</Layer>
		<Layer depth={1}>
			<Svg>
				{box ? <Box n={box} /> : null}
				{bucket ? <Bucket x={1010} /> : null}
				{children}
			</Svg>
		</Layer>
	</Scene>
);
export const S051: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('051');
	const put = kk(t, 24, 52);
	const cp = reach(idle(f, 4), 'F', toLocal(lerp(1700, EGGX, put), lerp(700, EGGY, put), 1740, hip(HS), HS, -1), kk(t, 10, 24));
	return (
		<EggScene f={f} from={[1420, 640, 1.0]} to={[1480, 640, 1.2]} box={3}>
			<Hero x={HX} uid="h51" pose={idle(f, 1)} />
			{coachAt(f, 1740, -1, cp)}
			<Egg x={put > 0.98 ? EGGX : lerp(1700, EGGX, put)} y={put > 0.98 ? EGGY : lerp(700, EGGY, put)} />
		</EggScene>
	);
};
export const S052: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('052');
	const away = kk(t, 20, 50);
	return (
		<EggScene f={f} from={[1460, 640, 1.05]} to={[1500, 640, 1.25]} box={3} bucket>
			<Egg x={EGGX} y={EGGY} />
			<Hero x={HX} uid="h52" pose={stance(f, 2, 8)} expr="worried" />
			{coachAt(f, lerp(1740, 1860, away), -1, reach(idle(f, 4), 'F', toLocal(1700, 720, lerp(1740, 1860, away), hip(HS), HS, -1), kk(t, 30, 56)), {handItem: <rect x={-20} y={-10} width={60} height={34} rx={8} fill="#9aa3b5" stroke="#47506a" strokeWidth={3} />})}
		</EggScene>
	);
};
export const S053: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('053');
	const charge = kk(t, 14, 52);
	const hit = kk(t, 64, 72);
	const shake = hit < 1 && charge > 0.8 ? Math.sin(t * 2.2) * 2 : 0;
	return (
		<EggScene f={f} from={[1480, 640, 1.2]} to={[1500, 630, 1.5]} box={3} bucket>
			{hit < 0.5 ? <Egg x={EGGX} y={EGGY} /> : <Splat x={EGGX + 6} y={EGGY + 40} k={hit} />}
			<Hero x={HX + shake} big fist="white" uid="h53" pose={eggFist(f, hit > 0 ? 1 : 0.55 + 0.2 * charge)} expr={hit > 0.3 ? 'wide' : 'angry'} />
			{coachAt(f, 1860, -1, idle(f, 4))}
		</EggScene>
	);
};
export const S054: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('054');
	const second = kk(t, 4, 12);
	const third = kk(t, 24, 32);
	const wipe = Math.sin(t / 4) * 18;
	return (
		<EggScene f={f} from={[1500, 700, 1.1]} to={[1500, 700, 1.3]} box={1} bucket>
			<Splat x={EGGX + 6} y={EGGY + 40} k={1} />
			<Splat x={EGGX - 120} y={EGGY + 140} k={second} />
			<Splat x={EGGX - 260} y={EGGY + 240} k={third} />
			<Hero x={HX} big fist="white" uid="h54" pose={eggFist(f, 1)} expr="worried" />
			{coachAt(f, 1790 - wipe, -1, reach(idle(f, 4), 'F', toLocal(1620 - wipe, 880, 1790 - wipe, hip(HS), HS, -1), 1), {handItem: <rect x={-20} y={-10} width={60} height={34} rx={8} fill="#9aa3b5" stroke="#47506a" strokeWidth={3} />})}
		</EggScene>
	);
};
export const S055: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('055');
	const p1 = kk(t, 24, 40);
	const p2 = kk(t, 48, 64);
	const cp = reach(idle(f, 4), 'F', toLocal(lerp(EGGX + 40, 1700, p2), lerp(EGGY, 640, p2), 1760, hip(HS), HS, -1), p1);
	return (
		<EggScene f={f} from={[1500, 640, 1.1]} to={[1520, 640, 1.35]} box={0} bucket>
			<Splat x={EGGX + 6} y={EGGY + 40} k={1} />
			<Egg x={EGGX} y={EGGY} />
			<Hero x={HX} uid="h55" pose={stance(f, 2, 4)} expr="worried" />
			{coachAt(f, 1760, -1, cp)}
			<g opacity={interpolate(t, [70, 82], [0, 1], clamp)}>
				{[0, 1, 2].map((i) => <path key={i} d={`M${HX + 70 + i * 22},${540 + i * 8} q30,${-10 + i * 6} 60,${-4}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />)}
			</g>
		</EggScene>
	);
};
export const S056: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('056');
	const approach = kk(t, 4, 60);
	const gap = lerp(50, 16, approach);
	return (
		<EggScene f={f} from={[1480, 630, 1.3]} to={[1510, 620, 1.6]} box={0}>
			<Egg x={EGGX} y={EGGY} />
			<Hero x={HX} big fist="skin" uid="h56" pose={eggFist(f, 1, gap - 16 + 0)} expr="normal" mouth="open" />
			<g opacity={interpolate(t, [46, 58], [0, 1], clamp)}>
				<line x1={EGGX - 24 - gap} y1={EGGY + 90} x2={EGGX - 24} y2={EGGY + 90} stroke={GOLD} strokeWidth={8} />
				<line x1={EGGX - 24 - gap} y1={EGGY + 74} x2={EGGX - 24 - gap} y2={EGGY + 106} stroke={GOLD} strokeWidth={8} />
				<line x1={EGGX - 24} y1={EGGY + 74} x2={EGGX - 24} y2={EGGY + 106} stroke={GOLD} strokeWidth={8} />
			</g>
			<foreignObject x={EGGX - 40} y={EGGY - 230} width={300} height={110}>
				<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#fff', background: PLATE, border: `5px solid ${GOLD}`, borderRadius: 20, textAlign: 'center', padding: '10px 0', opacity: interpolate(t, [46, 58], [0, 1], clamp)}}>1 СМ</div>
			</foreignObject>
		</EggScene>
	);
};
export const S057: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('057');
	const u = kk(t, 12, 46);
	const cp = reach(idle(f, 4), 'F', toLocal(1700, lerp(640, 300, Math.min(1, u * 1.6)), 1760, hip(HS), HS, -1), kk(t, 8, 24));
	return (
		<EggScene f={f} from={[1500, 520, 1.0]} to={[1520, 500, 1.2]} box={0}>
			<Hero x={HX} uid="h57" pose={{...stance(f, 2, 2), armF: [150, 20]}} expr="wide" />
			{coachAt(f, 1760, -1, cp)}
			<Egg x={lerp(1690, 1560, u)} y={300 - Math.sin(u * Math.PI) * 340 + 340 * 0.0} />
		</EggScene>
	);
};

const Palm: React.FC<{x: number; y: number; ang?: number}> = ({x, y, ang = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${ang})`}>
		<rect x={-44} y={-10} width={92} height={20} rx={10} fill="#e9a373" stroke="#a85a32" strokeWidth={4} />
		{[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 8 - 4} y={-8 + i} width={34} height={8} rx={4} fill="#e9a373" stroke="#a85a32" strokeWidth={3} />)}
	</g>
);
const palmPose = (f: number, y: number): Pose => reach({...idle(f, 2), lean: 0}, 'F', toLocal(HX + 100, y, HX, hip(HS), HS, 1), 1);
const palmAt = (f: number, y: number) => {
	const [px, py] = frontHand(palmPose(f, y), HX, hip(HS), HS, 1);
	return [px, py] as const;
};
export const S058: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('058');
	const dy = lerp(470, 700, kk(t, 20, 150));
	const [px, py] = palmAt(f, dy);
	const eggY = t < 20 ? lerp(300, 450, kk(t, 0, 20)) : py - 40;
	return (
		<EggScene f={f} from={[1480, 560, 1.2]} to={[1480, 620, 1.5]} box={0}>
			<Hero x={HX} uid="h58" pose={palmPose(f, dy)} expr="wide" mouth="open" />
			<Palm x={px + 6} y={py} />
			<Egg x={px + 10} y={Math.min(eggY, py - 40)} />
		</EggScene>
	);
};
export const S059: React.FC = () => {
	const {f} = useShot();
	const [px, py] = palmAt(f, 700);
	return (
		<EggScene f={f} from={[1470, 640, 1.3]} to={[1470, 640, 1.65]} box={0}>
			<Hero x={HX} uid="h59" pose={palmPose(f, 700)} expr="wide" mouth="open" look={[0.5, 0.8]} />
			<Palm x={px + 6} y={py} />
			<Egg x={px + 10} y={py - 40} />
		</EggScene>
	);
};
export const S060: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('060');
	const go = kk(t, 40, 100);
	const [px, py] = palmAt(f, 700);
	const cx = lerp(1560, 1880, go);
	const take = kk(t, 6, 30);
	return (
		<EggScene f={f} from={[1500, 640, 1.2]} to={[1540, 640, 1.4]} box={0}>
			<Hero x={HX} uid="h60" pose={palmPose(f, 700)} expr="wide" />
			<Palm x={px + 6} y={py} />
			{take < 1 ? <Egg x={px + 10} y={py - 40} /> : null}
			{coachAt(f, cx, 1, reach(idle(f, 4), 'F', toLocal(px + 10, py - 36, 1560, hip(HS), HS, 1), 1 - take))}
			{take >= 1 ? <Egg x={cx + 70} y={hip(HS) - 70} s={0.7} /> : null}
		</EggScene>
	);
};
export const S061: React.FC = () => {
	const {f} = useShot();
	const [px, py] = palmAt(f, 690);
	return (
		<Scene from={camOn(1000, 620, 1.0)} to={camOn(1250, 640, 1.5)}>
			<Layer depth={1}>
				<Gym f={f} light={0.6} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={HX} uid="h61" pose={palmPose(f, 690)} expr="sad" look={[0.5, 0.9]} />
					<Palm x={px + 6} y={py} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* ================================ PART 5 ================================ */
const Dk: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="dk" top="#2a2036" bot="#4a3a4a" />
		<rect x={0} y={0} width={240} height={900} fill="#8c2a3a" />
		<rect x={1680} y={0} width={240} height={900} fill="#8c2a3a" />
		{Array.from({length: 6}).map((_, i) => <line key={i} x1={40 * i + 20} y1={0} x2={40 * i + 20} y2={900} stroke="#6a1f2c" strokeWidth={6} />)}
		{Array.from({length: 6}).map((_, i) => <line key={i} x1={1700 + 40 * i + 20} y1={0} x2={1700 + 40 * i + 20} y2={900} stroke="#6a1f2c" strokeWidth={6} />)}
		<Floor y={900} c="#7a5a4a" plank />
		{[0, 1, 2].map((i) => <line key={i} x1={420} y1={560 + i * 90} x2={1500} y2={560 + i * 90} stroke={['#d94a3a', '#f2f2f2', '#2f6fd8'][i]} strokeWidth={12} />)}
		<rect x={410} y={520} width={24} height={380} fill="#47506a" />
		<rect x={1486} y={520} width={24} height={380} fill="#47506a" />
		{[0, 1, 2, 3, 4, 5, 6].map((i) => (
			<ellipse key={i} cx={260 + i * 220} cy={1040} rx={60} ry={80} fill="#0e0b16" opacity={0.85} />
		))}
	</Svg>
);
export const S062: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('062');
	const neck = Math.sin(t / 5) * 10;
	return (
		<Scene from={camOn(960, 640, 1.0)} to={camOn(1010, 630, 1.3)}
			ov={<>{t < 90 ? <Plate x={960} y={70} w={900} h={120} text="ДОМ КУЛЬТУРЫ" size={70} t={t} c="#c9a640" /> : null}<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				<Bubble x={1330} y={250} w={760} h={150} t={t - 120} tail={[-90, 130]}>
					<text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#14162a">Мальчик, ты чей?</text>
				</Bubble>
			</svg></>}>
			<Layer depth={1.3}>
				<Dk f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={700} uid="h62" pose={idle(f, 1)} expr="worried" />
					<Actor who="rival" x={1180} floor={FL} s={1.2} facing={-1} uid="rv62" pose={{...idle(f, 3), head: neck, armF: [150, 70], armB: [140, 70]}} mouth="smirk" faceTurn={0.3} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S063: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('063');
	const hits = Math.abs(Math.sin(t / 5));
	const down = kk(t, 56, 76);
	const roar = kk(t, 150, 180);
	const count = Math.min(9, Math.floor(Math.max(0, t - 90) / 12));
	return (
		<Scene from={camOn(960, 640, 1.0)} to={camOn(960, 640, 1.2)} ov={<Plate x={330} y={70} w={420} h={130} text="1:00" size={96} t={t - 100} />}>
			<Layer depth={1.3}>
				<Dk f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={820} uid="h63" pose={reach({...idle(f, 1), lean: 12}, 'F', toLocal(960, 640, 820, hip(HS), HS, 1), down < 0.1 ? hits : 0.2)} expr="angry" />
					<g transform={down > 0.05 ? `rotate(${84 * down} 1120 ${FL})` : undefined}>
						<Actor who="rival" x={1120} floor={FL} s={1.2} facing={-1} uid="rv63" pose={{...idle(f, 3), lean: -8 * down}} expr={down > 0.3 ? 'sleepy' : 'angry'} shadow={down < 0.2} />
					</g>
					<Actor who="referee" x={1330} floor={FL} s={1.1} facing={-1} uid="rf63" pose={{...idle(f, 5), lean: 10 * down, armF: [100 + Math.sin(t / 6) * 24 * down, 20]}} />
					{[300, 520, 1400, 1620].map((x, i) => (
						<g key={i} opacity={roar}>
							<Actor who="svita1" sp="X" x={x} floor={FL + 60} s={0.8} facing={i < 2 ? 1 : -1} uid={'cr' + i} color={['#7a8794', '#a39b8a', '#8a9ba3', '#b5a98c'][i]} hair="short" acc={[]} outfit="tee" pose={{...idle(f, i), armF: [150, 20], armB: [-150, 20]}} shadow={false} />
						</g>
					))}
					{count > 0 ? <text x={1500} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={GOLD} stroke={PLATE} strokeWidth={8} paintOrder="stroke">{count}</text> : null}
				</Svg>
			</Layer>
		</Scene>
	);
};

const KitchenScene: React.FC<{from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; cracked?: number}> = ({from, to, children, cracked}) => (
	<Scene from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])}>
		<Layer depth={1.25}>
			<Kitchen mug={false} />
		</Layer>
		<Layer depth={1}>
			<Svg>
				<KitchenTable mugs={0} />
				{cracked !== undefined ? <Crack x={760} y={716} len={400} ang={0} n={5} t={cracked} w={11} plate={[200, 72]} /> : null}
				{children}
			</Svg>
		</Layer>
	</Scene>
);
export const S064: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('064');
	const k = kk(t, 6, 26);
	return (
		<KitchenScene from={[900, 560, 1.15]} to={[850, 600, 1.55]}>
			<Mug x={860} y={712} />
			<Hero x={640} big fist={k > 0.55 ? 'white' : 'skin'} uid="h64" pose={handTo(idle(f, 1), 640, HS, 1, [868, 640], k)} />
		</KitchenScene>
	);
};
export const S065: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('065');
	const snap = 14;
	const fall = kk(t, snap, snap + 14);
	return (
		<KitchenScene from={[860, 660, 1.45]} to={[840, 700, 1.15]} cracked={t - snap - 10}>
			{t < snap ? <Mug x={860} y={712} /> : null}
			{t >= snap ? (
				<g>
					<g transform={`translate(860,${lerp(712, 900, fall * fall)}) rotate(${fall * 40})`} opacity={fall < 1 ? 1 : 0}>
						<rect x={-34} y={-70} width={68} height={70} rx={12} fill="#f2f2f2" />
					</g>
					<Shards x={860} y={900} k={kk(t, snap + 13, snap + 26)} />
				</g>
			) : null}
			<Hero x={640} big fist="white" uid="h65" pose={handTo(idle(f, 1), 640, HS, 1, [868, 650], 1)} handItem={t >= snap ? <path d="M0,0 q34,0 34,22 q0,22 -34,22" stroke="#f2f2f2" strokeWidth={12} fill="none" /> : undefined} expr={t >= snap ? 'wide' : 'normal'} />
		</KitchenScene>
	);
};
export const S066: React.FC = () => {
	const {f} = useShot();
	return (
		<KitchenScene from={[760, 640, 1.2]} to={[780, 620, 1.5]} cracked={99}>
			<Shards x={860} y={900} k={1} />
			<Hero x={640} big fist="white" uid="h66" pose={reach(idle(f, 2), 'F', [-26, -48], 1)} expr="worried" mouth="open" />
		</KitchenScene>
	);
};
export const S067: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('067');
	const walk = kk(t, 0, 24);
	const back = kk(t, 30, 44);
	return (
		<KitchenScene from={[960, 620, 1.1]} to={[1000, 620, 1.35]} cracked={99}>
			<Shards x={860} y={900} k={1} />
			<Hero x={640} uid="h67" pose={idle(f, 2)} expr="worried" />
			<Actor who="mama" x={lerp(1500, 1150, walk)} floor={FL} s={HS} facing={-1} uid="m67" pose={handTo(idle(f, 5), lerp(1500, 1150, walk), HS, -1, [980, 700], 0.8)} faceTurn={0.2} />
			<g transform="translate(980,700)">
				<rect x={-50} y={-60} width={100} height={64} rx={8} fill="#7a8794" stroke="#47506a" strokeWidth={4} />
				<rect x={-60} y={-40} width={24} height={10} rx={4} fill="#47506a" />
				<rect x={30} y={-90 + back * 60} width={10} height={80} rx={4} fill="#c9cfdd" />
			</g>
		</KitchenScene>
	);
};
export const S068: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('068');
	return (
		<CardBG t={t} push={0.22} html={<Plate x={960} y={820} w={1400} h={130} text="12 из 19 — в первом раунде" t={t - 30} size={78} />}>
			{Array.from({length: 19}).map((_, i) => {
				const row = i < 10 ? 0 : 1;
				const col = row ? i - 10 : i;
				const x = 280 + col * 150 + (row ? 75 : 0);
				const y = 330 + row * 190;
				const lit = i < 12 && interpolate(t, [40 + i * 3, 52 + i * 3], [0, 1], clamp) > 0.5;
				const pop = interpolate(t, [i * 3, i * 3 + 8], [0, 1], clamp);
				return (
					<g key={i} transform={`translate(${x},${y}) scale(${pop})`}>
						<circle r={56} fill={lit ? '#ffc94a' : '#47506a'} stroke={lit ? '#fff4c8' : '#9aa3b5'} strokeWidth={7} />
						<circle r={26} fill={lit ? '#b8830f' : '#2a3050'} />
					</g>
				);
			})}
		</CardBG>
	);
};

/* split screens: ring on the left, home on the right */
const Split: React.FC<{t: number; left: React.ReactNode; right: React.ReactNode; f: number; to?: [number, number, number]}> = ({t, left, right, f, to}) => (
	<Scene from={camOn(960, 620, 1.0)} to={to ? camOn(to[0], to[1], to[2]) : camOn(960, 620, 1.12)}>
		<Layer depth={1.3}>
			<Svg>
				<clipPath id="spl"><rect x={-1000} y={-400} width={1960} height={2000} /></clipPath>
				<clipPath id="spr"><rect x={966} y={-400} width={2000} height={2000} /></clipPath>
			</Svg>
		</Layer>
		<Layer depth={1}>
			<Svg>
				<g clipPath="url(#spl)">
					<rect x={-1000} y={-400} width={1960} height={2000} fill="#2a2036" />
					<rect x={-1000} y={900} width={1960} height={400} fill="#6b3a3a" />
					{[0, 1, 2].map((i) => <line key={i} x1={-1000} y1={560 + i * 90} x2={960} y2={560 + i * 90} stroke={['#d94a3a', '#f2f2f2', '#2f6fd8'][i]} strokeWidth={12} />)}
					{left}
				</g>
				<g clipPath="url(#spr)">
					<rect x={966} y={-400} width={2000} height={2000} fill="#e9dcc3" />
					<rect x={966} y={900} width={2000} height={400} fill="#cdbb98" />
					{right}
				</g>
				<rect x={954} y={-400} width={12} height={2000} fill={GOLD} />
			</Svg>
		</Layer>
	</Scene>
);
export const S069: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('069');
	const fold = kk(t, 40, 60);
	return (
		<Split f={f} t={t}
			left={<g>
				<Actor who="hero" x={560} floor={FL} s={HS} facing={1} uid="h69a" pose={{...idle(f, 1), armF: [150, 20]}} mouth="smile" />
				<Actor who="referee" x={720} floor={FL} s={HS} facing={-1} uid="rf69" pose={reach(idle(f, 5), 'F', toLocal(600, 440, 720, hip(HS), HS, -1), 1)} />
			</g>}
			right={<g>
				<Hero x={1260} big fist="white" uid="h69" pose={handTo(idle(f, 2), 1260, HS, 1, [1420, 700], 1)} expr="wide" />
				<g transform={`translate(1480,660)`}>
					<g transform={`rotate(${-fold * 18})`}>
						<rect x={-70} y={-130} width={140} height={260} rx={18} fill="#2b2f3a" stroke="#0b0d1e" strokeWidth={5} />
						<rect x={-56} y={-112} width={112} height={200} rx={8} fill="#3d6fd6" />
					</g>
					<rect x={-70} y={-130} width={140} height={260} rx={18} fill="#2b2f3a" stroke="#0b0d1e" strokeWidth={5} transform={`translate(${fold * 140},0) scale(${1 - fold * 0.0},1)`} opacity={fold} />
					<Crack x={-60} y={-60} len={150} ang={32} n={6} t={t - 50} w={10} plate={[170, 140]} />
				</g>
			</g>}
		/>
	);
};
export const S070: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('070');
	const fall = kk(t, 20, 54);
	return (
		<Split f={f} t={t}
			left={<g>
				<Actor who="hero" x={620} floor={FL} s={HS} facing={1} uid="h70a" pose={reach({...idle(f, 1), lean: 12}, 'F', toLocal(740, 640, 620, hip(HS), HS, 1), t < 24 ? 1 : 0.2)} expr="angry" />
				<g transform={`rotate(${84 * fall} 800 ${FL})`}>
					<Actor who="rival" x={800} floor={FL} s={1.1} facing={-1} uid="rv70" pose={idle(f, 2)} expr={fall > 0.3 ? 'sleepy' : 'angry'} shadow={fall < 0.1} />
				</g>
			</g>}
			right={<g>
				<rect x={1180} y={180} width={560} height={720} rx={14} fill="#8a5a3a" />
				<rect x={1240} y={240} width={440} height={260} rx={10} fill="#7a4c30" />
				<circle cx={1460} cy={560} r={70} fill="#c9cfdd" stroke="#6b7388" strokeWidth={6} />
				<rect x={1424} y={540} width={72} height={40} rx={6} fill="#2a2036" />
				<path d="M1460,552 L1560,512 L1580,540 L1500,574 Z" fill="#c9a640" stroke="#7a5a10" strokeWidth={4} />
				<Crack x={1380} y={470} len={200} ang={70} n={7} t={t - 50} w={11} plate={[250, 40]} />
				<Hero x={1060} big fist="white" uid="h70" pose={handTo(idle(f, 2), 1060, HS, 1, [1180, 640], 1)} expr="wide" />
			</g>}
		/>
	);
};
export const S071: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('071');
	const knot = kk(t, 20, 48);
	const walk = kk(t, 30, 54);
	return (
		<Split f={f} t={t}
			left={<g>
				<Actor who="hero" x={620} floor={FL} s={HS} facing={1} uid="h71a" pose={idle(f, 1)} />
				<g transform={`translate(780,520)`}>
					<circle r={90} fill="#c9a640" stroke="#7a5a10" strokeWidth={8} opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 5))} />
					<circle r={52} fill="none" stroke="#7a5a10" strokeWidth={6} />
				</g>
			</g>}
			right={<g>
				<rect x={966} y={700} width={960} height={40} fill="#c98a5a" />
				<g transform="translate(1440,650)">
					<path d={`M-160,0 Q-60,${-40 * knot} 0,0 T${160 - 90 * knot},${-30 * knot}`} stroke="#c9cfdd" strokeWidth={22} fill="none" strokeLinecap="round" />
					<circle cx={-170} cy={0} r={30} fill="#c9cfdd" />
					<Crack x={-90} y={-8} len={150} ang={-8} n={8} t={t - 50} w={10} plate={[80, -90]} />
				</g>
				<Hero x={1100} big fist="white" uid="h71" pose={handTo(idle(f, 2), 1100, HS, 1, [1250, 660], 1)} expr="worried" />
				<Actor who="mama" x={lerp(1840, 1700, walk)} floor={FL} s={HS} facing={-1} uid="m71" pose={handTo(idle(f, 5), lerp(1840, 1700, walk), HS, -1, [1580, 700], walk)} faceTurn={0.2} handItem={walk > 0.8 ? <rect x={0} y={-30} width={10} height={70} rx={4} fill="#e86aa0" /> : undefined} />
			</g>}
		/>
	);
};
export const S072: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('072');
	const x = lerp(300, 1200, kk(t, 0, 120));
	const ph = t * 0.3;
	const arms: Pose = {lean: 4, head: 0, armF: [40, 120], armB: [40, 120], legF: [28 * Math.sin(ph), 6 + 38 * Math.max(0, Math.cos(ph))], legB: [-28 * Math.sin(ph), 6 + 38 * Math.max(0, -Math.cos(ph))]};
	return (
		<Scene from={camOn(760, 640, 1.0)} to={camOn(1000, 640, 1.12)}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{[1480, 1610].map((nx, i) => (
						<Actor key={i} who={i ? 'svita3' : 'svita1'} sp="X" x={nx} floor={FL} s={HS} facing={-1} uid={'nb' + i} color={i ? '#8a9ba3' : '#a39b8a'} hair={i ? 'short' : 'grey'} acc={[]} outfit={i ? 'tee' : 'gown'} pose={idle(f, i)} shadow={false} />
					))}
					<Hero x={x} uid="h72" pose={arms} expr="worried" bob={Math.abs(Math.sin(ph)) * 4} />
					{[-1, 1].map((sd) => (
						<g key={sd} transform={`translate(${x + 56 + sd * 4},${hip(HS) + 64 + Math.sin(ph) * 4})`}>
							<rect x={-26} y={0} width={52} height={64} rx={8} fill={sd < 0 ? '#e86aa0' : '#2f6fd8'} stroke="#14162a" strokeWidth={3} />
						</g>
					))}
				</Svg>
			</Layer>
		</Scene>
	);
};

const Bottle: React.FC<{lvl?: number; wob?: number}> = ({lvl = 0.6, wob = 0}) => (
	<g transform={`translate(0,-92) rotate(${wob})`}>
		<rect x={-18} y={0} width={36} height={104} rx={9} fill="#bfe6c9" opacity={0.92} stroke="#6aa88a" strokeWidth={3} />
		<rect x={-14} y={104 * (1 - lvl)} width={28} height={104 * lvl - 4} rx={6} fill="#f2e23a" opacity={0.85} />
		<rect x={-9} y={-24} width={18} height={26} rx={4} fill="#bfe6c9" stroke="#6aa88a" strokeWidth={3} />
		<rect x={-11} y={-32} width={22} height={10} rx={3} fill="#d94a3a" />
	</g>
);
const RoofScene: React.FC<{f: number; from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; ov?: React.ReactNode}> = ({f, from, to, children, ov}) => (
	<Scene from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])} ov={ov}>
		<Layer depth={1.3}>
			<Roof f={f} />
		</Layer>
		<Layer depth={1}>
			<Svg>{children}</Svg>
		</Layer>
	</Scene>
);
export const S073: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('073');
	const wave = Math.sin(t / 4) * 20;
	return (
		<RoofScene f={f} from={[860, 640, 1.0]} to={[900, 630, 1.25]}>
			{[0, 1, 2, 3, 4].map((i) => <Pigeon key={i} x={1300 + i * 70 + Math.max(0, t - 40) * 6} y={880 - Math.max(0, t - 40) * 7 * (1 + i * 0.1)} s={0.9} facing={1} wing={Math.abs(Math.sin(t / 2 + i))} />)}
			<Actor who="leha" x={1100} floor={FL} s={HS} facing={-1} uid="l73" pose={{...idle(f, 2), armF: [130 + wave, 40]}} faceTurn={0.3} expr="angry" />
			<Hero x={640} uid="h73" pose={{...idle(f, 1), armF: [60, 80]}} handItem={<Bottle wob={Math.sin(t / 8) * 2} />} expr="angry" />
		</RoofScene>
	);
};
export const S074: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('074');
	return (
		<RoofScene f={f} from={[860, 640, 1.1]} to={[900, 630, 1.35]}>
			<Hero x={640} uid="h74" pose={{...idle(f, 1), armF: [60, 80]}} handItem={<Bottle />} expr="normal" />
			<Actor who="leha" x={1060} floor={FL} s={HS} facing={-1} uid="l74" pose={handTo(idle(f, 2), 1060, HS, -1, [960, 640], kk(t, 6, 24))} faceTurn={0.3} mouth="open" />
			<g transform="translate(900,560) rotate(-5)">
				<rect x={-110} y={-80} width={150} height={190} rx={10} fill="#fbf8ef" stroke="#2b4a8a" strokeWidth={8} />
				<ellipse cx={-34} cy={20} rx={34} ry={50} fill="#14162a" />
				<ellipse cx={-34} cy={30} rx={20} ry={36} fill="#fbf8ef" />
				<path d="M-70,10 l-30,26 l30,0 z" fill="#14162a" />
				<circle cx={-34} cy={-42} r={20} fill="#14162a" />
				<polygon points="-16,-44 6,-38 -16,-34" fill="#f2b21c" />
			</g>
		</RoofScene>
	);
};
export const S075: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('075');
	const sw = Math.sin(t / 3) * 14;
	return (
		<RoofScene f={f} from={[780, 600, 1.2]} to={[760, 590, 1.55]}>
			<Hero x={640} big fist="skin" uid="h75" pose={{...idle(f, 1), armF: [96 + sw, 70]}} handItem={<Bottle lvl={0.6} wob={0} />} expr="angry" mouth="open" />
			<Actor who="leha" x={1000} floor={FL} s={HS} facing={-1} uid="l75" pose={idle(f, 2)} faceTurn={0.3} />
		</RoofScene>
	);
};
export const S076: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('076');
	return (
		<RoofScene f={f} from={[700, 600, 1.5]} to={[700, 620, 1.9]}>
			<Hero x={640} big fist="skin" uid="h76" pose={{...idle(f, 1), armF: [70, 80]}} handItem={<Bottle lvl={0.6} wob={0} />} expr="normal" look={[0.9, 0]} />
			<Actor who="leha" x={940} floor={FL} s={HS} facing={-1} uid="l76" pose={{...idle(f, 2), armF: [100 + Math.sin(t / 4) * 20, 40]}} faceTurn={0.3} mouth="open" />
		</RoofScene>
	);
};
export const S077: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('077');
	const white = t > 66;
	return (
		<RoofScene f={f} from={[700, 600, 1.6]} to={[700, 620, 2.0]}>
			<Hero x={640} big fist={white ? 'white' : 'skin'} uid="h77" pose={{...idle(f, 1), armF: [70, 80], head: 14}} handItem={<Bottle lvl={0.6} wob={0} />} expr="wide" look={[0.5, 0.9]} />
		</RoofScene>
	);
};
export const S078: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('078');
	const brk = t > 6;
	return (
		<RoofScene f={f} from={[780, 700, 1.15]} to={[780, 740, 1.4]}>
			<g>
				<rect x={900} y={770} width={600} height={160} fill="#9aa0b8" stroke="#5a6078" strokeWidth={5} />
				<rect x={890} y={750} width={620} height={30} fill="#b9bfd6" stroke="#5a6078" strokeWidth={5} />
				<Crack x={940} y={830} len={520} ang={-2} n={9} t={t - 8} w={12} plate={[260, -130]} />
			</g>
			{[0, 1, 2, 3].map((i) => <Pigeon key={i} x={1400 + i * 90 + Math.max(0, t - 6) * 10} y={880 - Math.max(0, t - 6) * 9 * (1 + i * 0.2)} s={0.9} facing={1} wing={Math.abs(Math.sin(t / 2 + i))} />)}
			<Hero x={640} big fist="white" uid="h78" pose={{...idle(f, 1), armF: [70, 80]}} handItem={brk ? undefined : <Bottle lvl={0.6} wob={0} />} expr="wide" />
			{brk ? <Shards x={800} y={900} k={kk(t, 6, 24)} /> : null}
		</RoofScene>
	);
};
export const S079: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('079');
	return (
		<RoofScene f={f} from={[900, 700, 1.0]} to={[960, 700, 1.2]}>
			<g>
				<rect x={900} y={770} width={600} height={160} fill="#9aa0b8" stroke="#5a6078" strokeWidth={5} />
				<rect x={890} y={750} width={620} height={30} fill="#b9bfd6" stroke="#5a6078" strokeWidth={5} />
				<Crack x={940} y={830} len={520} ang={-2} n={9} t={99} w={12} plate={[260, -130]} />
			</g>
			<Shards x={800} y={900} k={1} />
			<Hero x={640} uid="h79" pose={{...idle(f, 1), armF: [16, 20]}} expr="sad" faceTurn={0.2} />
			<Actor who="leha" x={1720} floor={FL - 0} s={HS} facing={-1} uid="l79" pose={{...idle(f, 2), armF: [60, 100], head: 20}} faceTurn={0.1} />
			<g transform={`translate(1560,700) rotate(-8)`}>
				<rect x={-70} y={-48} width={140} height={96} rx={8} fill="#2b4a8a" stroke="#0b1530" strokeWidth={4} />
				<path d={`M-40,0 q20,-14 40,0 t40,0`} stroke="#fbf8ef" strokeWidth={6} fill="none" strokeDasharray={200} strokeDashoffset={200 - Math.min(200, t * 3)} />
			</g>
		</RoofScene>
	);
};

/* ================================ PART 6 ================================ */
const Note: React.FC<{t: number}> = ({t}) => {
	const k = interpolate(t, [0, 10], [0, 1], clamp);
	return (
		<div style={{position: 'absolute', left: 1020, top: 90, width: 840, borderRadius: 18, background: '#fbf8ef', border: '6px solid #6b4a2a', padding: '22px 30px', transform: `rotate(-2deg) scale(${0.9 + 0.1 * k})`, opacity: k, boxShadow: '0 10px 30px rgba(0,0,0,.4)'}}>
			<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 56, lineHeight: 1.15, color: '#14162a', textAlign: 'center'}}>Уехал лечить спину. Надолго. Выдыхай.</div>
		</div>
	);
};
export const S080: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('080');
	return (
		<Scene from={camOn(960, 640, 1.0)} to={camOn(1100, 650, 1.25)} ov={t > 70 ? <Note t={t - 70} /> : null}>
			<Layer depth={1}>
				<Gym f={f} chair light={1.4} bag="whole" />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={560} uid="h80" pose={{...idle(f, 1), head: 8}} expr="sad" faceTurn={0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S081: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('081');
	const hit = Math.abs(Math.sin(t / 7));
	const BURST = 70;
	const burst = t > BURST;
	const sand = kk(t, BURST, BURST + 60);
	const bigFist = t >= BURST - 14 && t < BURST + 12;
	return (
		<Scene from={camOn(900, 700, 1.1)} to={camOn(940, 690, 1.3)} ov={t < 60 ? <Note t={t + 40} /> : null}>
			<Layer depth={1}>
				<Gym f={f} bag="none" light={1.4} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`rotate(${burst ? 0 : hit * 6} 860 -40)`}>
						<line x1={860} y1={-40} x2={860} y2={470} stroke="#9aa3b5" strokeWidth={6} />
						{burst ? <path d="M812,500 L812,470 L908,470 L908,500 L880,540 L860,512 L836,556 Z" fill="#8a3a2a" stroke="#4a1a10" strokeWidth={4} /> : <rect x={812} y={470} width={96} height={290} rx={32} fill="#8a3a2a" stroke="#4a1a10" strokeWidth={4} />}
					</g>
					{burst ? (
						<g>
							<path d={`M860,540 L${860 - 30 * sand},900 L${860 + 30 * sand},900 Z`} fill="#d9c89a" opacity={0.9} />
							<ellipse cx={860} cy={900} rx={40 + 170 * sand} ry={10 + 40 * sand} fill="#d9c89a" />
							<path d={`M${700},900 Q860,${900 - 120 * sand} 1020,900 Z`} fill="#d9c89a" />
							<Crack x={850} y={480} len={120} ang={90} n={10} t={t - BURST - 4} w={11} plate={[60, -170]} />
						</g>
					) : null}
					<Hero x={640} big={bigFist} fist="white" uid="h81" pose={reach({...idle(f, 1), lean: 10}, 'F', toLocal(804, 600, 640, hip(HS), HS, 1), t < BURST + 10 ? (burst ? 1 : hit) : 0)} expr={t > BURST ? 'wide' : 'angry'} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S082: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('082');
	return (
		<CardBG t={t} push={0.26} html={<Plate x={960} y={110} w={900} h={150} text="4.11.1985" t={t - 6} size={110} />}>
			{/* empty corner of a ring, a towel on the rope */}
			<rect x={1500} y={300} width={40} height={520} fill="#47506a" />
			{[0, 1, 2].map((i) => <line key={i} x1={520} y1={430 + i * 120} x2={1520} y2={430 + i * 120} stroke={['#d94a3a', '#f2f2f2', '#2f6fd8'][i]} strokeWidth={14} />)}
			<rect x={1420} y={560} width={120} height={200} rx={16} fill="#2f6fd8" stroke="#1d3f8a" strokeWidth={5} />
			<g transform="translate(900,550) rotate(8)">
				<rect x={-60} y={-8} width={120} height={150} rx={10} fill="#f4f6fa" stroke="#9aa3b5" strokeWidth={4} />
				<rect x={-60} y={50} width={120} height={14} fill="#4aa8d8" />
			</g>
			<rect x={400} y={820} width={1200} height={30} fill="#6a5444" />
		</CardBG>
	);
};
export const S083: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('083');
	const k = kk(t, 10, 60);
	const bend = kk(t, 100, 124);
	const nailBent = bend > 0.5;
	return (
		<Scene from={camOn(640, 560, 1.2)} to={camOn(620, 560, 1.55)}>
			<Layer depth={1}>
				<Gym f={f} cap={bend > 0.9} nail2={nailBent ? 'bent' : 'plain'} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Crack x={520} y={430} len={220} ang={20} n={11} t={t - 124} w={11} plate={[130, -90]} />
					{bend <= 0.9 ? <Cap x={lerp(760, 618, k)} y={lerp(560, 424 + bend * 40, k)} s={0.9} rot={nailBent ? -8 : 0} /> : null}
					<Hero x={820} facing={-1} big fist="white" uid="h83" pose={reach({...idle(f, 1), lean: 6}, 'F', toLocal(lerp(760, 640, k), lerp(580, 440, k), 820, hip(HS), HS, -1), 1)} expr="worried" mouth="flat" />
				</Svg>
			</Layer>
		</Scene>
	);
};

export {flash, random};
