import React, {createContext, useContext} from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {Actor, useShot} from '../kit/core';
import {Cam} from '../engine/camera';
import {Fist, Knuckles, Pose} from '../engine/Stickman';
import {Chick, Pigeon} from '../engine/props';
import {blend, gesture, idle, reach, SIT} from '../kit/actions';
import {Bedroom, Blanket as _Blanket, Floor, Kitchen, KitchenTable, Wall} from '../kit/sets';
import {Layer, Sleeper, Stage, Svg, camOn, clamp, ease, flash, usePush} from '../kit/kit';
import {Bubble, FONT, HAND} from '../kit/ui';
import {FL, HS, hip} from './common';
import {toLocal} from '../engine/Stickman';

/* Scenes of parts 1–3 (lines 001–039). Rules kept everywhere:
   - plates and cards sit at least 60 px from the frame edge, on the dark #11142c fill the edge checker looks for;
   - small text is large (plate text 56+ px, bubbles 46+ px);
   - white knuckles in every breakage scene, normal-coloured knuckles in successes and quiet moments;
   - medium shots enlarge the fist (fistK), every still frame gets a slow camera push. */
export const FK = 2.2;
export const PLATE = '#11142c';
export const GOLD = '#ffc94a';

/* ------------------------------- helpers ------------------------------- */
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const kk = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

type ShotProps = {from: Cam; to?: Cam; bg?: string; children: React.ReactNode; ov?: React.ReactNode; night?: boolean; still?: boolean; light?: false};
/* one scene: camera pushes from `from` to `to` over the shot (a push of 8–14 % if `to` is omitted) */
type PlateInfo = {x: number; y: number; n: number; t: number};
const PlateReg = createContext<{list: PlateInfo[]} | null>(null);
/* crack-number plates are collected while the scene renders and drawn last, on top of every layer (characters, furniture) */
const TopPlates: React.FC<{reg: {list: PlateInfo[]}}> = ({reg}) => (
	<Svg>
		{reg.list.map((p, i) => (
			<g key={i} transform={`translate(${p.x},${p.y}) scale(${0.6 + 0.4 * interpolate(p.t, [4, 14], [0, 1], clamp)})`} opacity={interpolate(p.t, [4, 10], [0, 1], clamp)}>
				<rect x={-86} y={-44} width={172} height={88} rx={20} fill={PLATE} stroke={GOLD} strokeWidth={6} />
				<text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={GOLD}>
					№{p.n}
				</text>
			</g>
		))}
	</Svg>
);
export const Scene: React.FC<ShotProps> = ({from, to, bg, children, ov, night, still, light}) => {
	const end = to ?? {...from, zoom: from.zoom * 1.1};
	const cam = usePush(from, end);
	const reg = {list: [] as PlateInfo[]};
	return (
		<PlateReg.Provider value={reg}>
			<AbsoluteFill>
				<Stage cam={cam} bg={bg ?? '#1b2038'} light={light === false ? false : night ? {night: true} : {}} still={still} dust={night ? undefined : '#ffe9b8'}>
					{children}
					<Layer depth={1}>
						<TopPlates reg={reg} />
					</Layer>
				</Stage>
				{ov}
			</AbsoluteFill>
		</PlateReg.Provider>
	);
};

/* screen-space plate: its box stays 60 px inside the frame */
export const Plate: React.FC<{x: number; y: number; w: number; h?: number; text: string; sub?: string; t?: number; c?: string; size?: number}> = ({x, y, w, h = 120, text, sub, t = 99, c = GOLD, size = 64}) => {
	const L = Math.max(60, Math.min(1920 - 60 - w, x - w / 2));
	const T = Math.max(60, Math.min(1080 - 60 - h, y));
	const k = interpolate(t, [0, 7], [0, 1], clamp);
	return (
		<div style={{position: 'absolute', left: L, top: T, width: w, height: h, borderRadius: 22, background: PLATE, border: `5px solid ${c}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: k, transform: `scale(${0.85 + 0.15 * k})`}}>
			<div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: '#fff', lineHeight: 1.1, letterSpacing: 1, textAlign: 'center', maxWidth: w - 70}}>{text}</div>
			{sub ? <div style={{fontFamily: FONT, fontWeight: 700, fontSize: Math.round(size * 0.55), color: c, marginTop: 4}}>{sub}</div> : null}
		</div>
	);
};

/* a crack on a thing: jagged line + big number plate on the thing. t = frames since it appeared; it stays. */
export const Crack: React.FC<{x: number; y: number; len: number; ang?: number; n: number; t: number; w?: number; plate?: [number, number]; ox?: number; oy?: number; noPlate?: boolean; wplate?: [number, number]}> = ({x, y, len, ang = 0, n, t, w = 9, plate, ox = 0, oy = 0, noPlate, wplate}) => {
	const reg = useContext(PlateReg);
	if (t < 0) return null;
	const k = interpolate(t, [0, 9], [0, 1], clamp);
	const pts = Array.from({length: 9}).map((_, i) => [(i / 8) * len, (i % 2 ? 1 : -1) * (14 + random('cr' + n + i) * 22) * (i === 0 || i === 8 ? 0.3 : 1)]);
	const d = 'M' + pts.map((p) => p.join(',')).join(' L');
	const px = plate ? plate[0] : len / 2;
	const py = plate ? plate[1] : -90;
	const a = (ang * Math.PI) / 180;
	if (reg && !noPlate) reg.list.push(wplate ? {x: wplate[0], y: wplate[1], n, t} : {x: ox + x + px * Math.cos(a) - py * Math.sin(a), y: oy + y + px * Math.sin(a) + py * Math.cos(a), n, t});
	return (
		<g transform={`translate(${x},${y}) rotate(${ang})`}>
			<path d={d} stroke="#0b0d1e" strokeWidth={w + 6} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
			<path d={d} stroke="#fff4c8" strokeWidth={w - 4} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
			{!reg && !noPlate ? (
				<g transform={`translate(${px},${py}) rotate(${-ang}) scale(${0.6 + 0.4 * interpolate(t, [4, 14], [0, 1], clamp)})`} opacity={interpolate(t, [4, 10], [0, 1], clamp)}>
					<rect x={-86} y={-44} width={172} height={88} rx={20} fill={PLATE} stroke={GOLD} strokeWidth={6} />
					<text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={GOLD}>
						№{n}
					</text>
				</g>
			) : null}
		</g>
	);
};

export const Hero: React.FC<{blink?: number; bob?: number; hideLegs?: boolean; big?: boolean; x: number; s?: number; facing?: 1 | -1; fist?: Knuckles; pose?: Pose; expr?: any; uid: string; floor?: number; seat?: number; mouth?: any; look?: [number, number]; faceTurn?: number; handItem?: React.ReactNode; armOver?: boolean}> = ({x, s = HS, facing = 1, fist = 'skin', big = false, uid, floor = FL, ...rest}) => (
	<Actor who="hero" x={x} floor={floor} s={s} facing={facing} fist={big ? fist : undefined} fistK={big ? FK : undefined} uid={uid} faceTurn={0.3} {...rest} />
);
/* hand of the hero on a world point */
export const handTo = (p: Pose, x: number, s: number, facing: 1 | -1, t: [number, number], k: number, side: 'F' | 'B' = 'F') => reach(p, side, toLocal(t[0], t[1], x, hip(s), s, facing), k);

/* --------------------------------- places -------------------------------- */
export const Yard: React.FC<{f: number; bench?: boolean}> = ({f, bench = true}) => (
	<Svg>
		<Wall id="yd-sky" top="#7fc0ea" bot="#e9f4fb" />
		{[300, 1100, 1650].map((x, i) => (
			<ellipse key={i} cx={x + f * 0.15} cy={110 + i * 28} rx={140} ry={36} fill="#fff" opacity={0.85} />
		))}
		<rect x={-100} y={140} width={2120} height={770} fill="#c4604a" />
		{Array.from({length: 20}).map((_, r) => (
			<line key={r} x1={-100} y1={160 + r * 38} x2={2020} y2={160 + r * 38} stroke="#a94f3c" strokeWidth={3} />
		))}
		{Array.from({length: 5}).map((_, r) =>
			Array.from({length: 11}).map((__, c) => (
				<g key={`${r}${c}`}>
					<rect x={-40 + c * 200} y={170 + r * 140} width={110} height={100} fill="#e9f4fb" />
					<rect x={-32 + c * 200} y={178 + r * 140} width={94} height={84} fill={(r * 3 + c) % 4 === 0 ? '#ffe9a8' : '#a9d4ee'} />
				</g>
			)),
		)}
		<Floor y={900} c="#9aa3b5" />
		{/* swing */}
		<g>
			<line x1={190} y1={560} x2={250} y2={900} stroke="#47506a" strokeWidth={12} />
			<line x1={470} y1={560} x2={410} y2={900} stroke="#47506a" strokeWidth={12} />
			<line x1={180} y1={560} x2={480} y2={560} stroke="#47506a" strokeWidth={14} />
			<line x1={300} y1={560} x2={295} y2={790} stroke="#2b2f3a" strokeWidth={4} />
			<line x1={360} y1={560} x2={365} y2={790} stroke="#2b2f3a" strokeWidth={4} />
			<rect x={280} y={786} width={100} height={14} rx={5} fill="#d94a3a" />
		</g>
		{bench ? <Bench x={1360} y={880} /> : null}
	</Svg>
);
export const Bench: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 380}) => (
	<g>
		<rect x={x - 10} y={y - 190} width={w + 20} height={36} rx={10} fill="#8a6a44" />
		<rect x={x - 10} y={y - 120} width={w + 20} height={30} rx={8} fill="#b98a5a" />
		<rect x={x + 20} y={y - 90} width={22} height={90} fill="#3a3f52" />
		<rect x={x + w - 42} y={y - 90} width={22} height={90} fill="#3a3f52" />
	</g>
);

export const Roof: React.FC<{night?: boolean; f: number; hatch?: boolean}> = ({night, f, hatch}) => (
	<Svg>
		<Wall id={night ? 'rf-n' : 'rf-d'} top={night ? '#070a1e' : '#f08a4a'} bot={night ? '#1d2550' : '#ffd79a'} />
		{night ? (
			<>
				{Array.from({length: 40}).map((_, i) => (
					<circle key={i} cx={random('s' + i) * 1920} cy={random('t' + i) * 520} r={1.5 + random('u' + i) * 2.5} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 20 + i))} />
				))}
				<circle cx={1520} cy={200} r={64} fill="#eef1ff" />
			</>
		) : (
			<circle cx={620} cy={560} r={120} fill="#fff1c0" opacity={0.9} />
		)}
		{/* skyline */}
		{[0, 1, 2, 3, 4, 5, 6].map((i) => (
			<rect key={i} x={i * 300 - 60} y={620 - (i % 3) * 70} width={200} height={400} fill={night ? '#12183a' : '#b86a4a'} />
		))}
		<rect x={-100} y={900} width={2200} height={400} fill={night ? '#252b4a' : '#6b6f86'} />
		<rect x={-100} y={880} width={2200} height={30} fill={night ? '#3a4068' : '#9094ab'} />
		{/* coop */}
		<g>
			<rect x={1380} y={600} width={380} height={280} rx={8} fill={night ? '#4a3a52' : '#8a5a3a'} />
			<path d="M1360,610 L1570,500 L1780,610 Z" fill={night ? '#3a2d44' : '#c9402f'} />
			{[0, 1, 2].map((i) => (
				<circle key={i} cx={1450 + i * 110} cy={720} r={26} fill="#1a1020" />
			))}
			<rect x={1380} y={820} width={380} height={12} fill="#6a4a2a" />
		</g>
		{hatch ? <rect x={330} y={885} width={200} height={20} fill="#15192e" /> : null}
	</Svg>
);

/* ================================ SHOTS ================================= */
/* 001–002: the mug */
export const Mug: React.FC<{x: number; y: number; broken?: number}> = ({x, y, broken = 0}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-34} y={-70} width={68} height={70} rx={12} fill="#f2f2f2" />
		<rect x={-34} y={-70} width={68} height={14} rx={7} fill="#d94a3a" />
		{broken < 0.02 ? <path d="M34,-52 q36,0 36,24 q0,24 -36,24" stroke="#f2f2f2" strokeWidth={12} fill="none" /> : null}
	</g>
);
export const Shards: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
	<g>
		<ellipse cx={x} cy={y} rx={30 + 200 * k} ry={8 + 24 * k} fill="#a9743f" opacity={0.75} />
		{Array.from({length: 11}).map((_, i) => {
			const a = random('sh' + i) * Math.PI;
			const d = (40 + random('sd' + i) * 220) * k;
			return <polygon key={i} points="0,0 26,-8 14,18" fill="#f2f2f2" stroke="#c9c9d3" strokeWidth={2} transform={`translate(${x - Math.cos(a) * d * 1.1 + 30},${y - Math.sin(a) * d * 0.2 - 6}) rotate(${i * 47})`} />;
		})}
	</g>
);

export const S001: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('001');
	const k = kk(t, 6, 26);
	const base = idle(f, 1);
	const p = handTo(base, 640, HS, 1, [868, 640], k);
	return (
		<Scene from={camOn(900, 560, 1.15)} to={camOn(850, 600, 1.55)}>
			<Layer depth={1.25}>
				<Kitchen mug={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<KitchenTable mugs={0} />
					<Mug x={860} y={712} />
					<Hero x={640} big uid="h1" pose={p} fist={k > 0.55 ? 'white' : 'skin'} />
				</Svg>
			</Layer>
		</Scene>
	);
};

export const S002: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('002');
	const snap = 14;
	const fall = kk(t, snap, snap + 14);
	const base = idle(f, 1);
	const p = handTo(base, 640, HS, 1, [868, 650], 1);
	const bodyY = lerp(712, 900, fall * fall);
	return (
		<Scene from={camOn(860, 640, 1.5)} to={camOn(840, 700, 1.1)}>
			<Layer depth={1.25}>
				<Kitchen mug={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<KitchenTable mugs={0} />
					{t < snap ? <Mug x={860} y={712} /> : null}
					{t >= snap ? (
						<g>
							<g transform={`translate(860,${bodyY}) rotate(${fall * 40})`} opacity={fall < 1 ? 1 : 0}>
								<rect x={-34} y={-70} width={68} height={70} rx={12} fill="#f2f2f2" />
							</g>
							<Shards x={860} y={900} k={kk(t, snap + 13, snap + 26)} />
						</g>
					) : null}
					<Hero x={640} big uid="h2" pose={p} fist="white" handItem={t >= snap ? <path d="M0,0 q34,0 34,22 q0,22 -34,22" stroke="#f2f2f2" strokeWidth={12} fill="none" /> : undefined} expr={t >= snap ? 'wide' : 'normal'} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 003: flash to the ring and back to the kitchen */
const RingFlash: React.FC<{t: number}> = ({t}) => {
	const o = interpolate(t, [0, 3, 38, 44], [0, 1, 1, 0], clamp);
	if (o <= 0.01) return null;
	const count = Math.min(9, 1 + Math.floor(t / 4));
	return (
		<AbsoluteFill style={{opacity: o}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				<rect width={1920} height={1080} fill="#1c1236" />
				<ellipse cx={960} cy={560} rx={800} ry={480} fill="#2c2750" opacity={0.7} />
				<rect x={0} y={860} width={1920} height={220} fill="#6b3a3a" />
				{[560, 660, 760].map((y, i) => (
					<line key={i} x1={0} y1={y} x2={1920} y2={y} stroke={['#d94a3a', '#f2f2f2', '#2f6fd8'][i]} strokeWidth={16} />
				))}
				<g transform="rotate(84 700 860)">
					<Actor who="rival" x={700} floor={860} s={1.05} uid="rv" shadow={false} expr="sleepy" />
				</g>
				<Actor who="referee" x={1130} floor={860} s={1.05} facing={-1} uid="rf" shadow={false} pose={{lean: 22, head: 8, armB: [10, 10], armF: [120 + Math.sin(t) * 18, 10], legB: [-4, 2], legF: [4, 2]}} />
				<text x={960} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190} fill="#ffc94a" stroke={PLATE} strokeWidth={10} paintOrder="stroke">
					{count}
				</text>
			</svg>
		</AbsoluteFill>
	);
};
export const S003: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('003');
	const base = idle(f, 1);
	return (
		<Scene from={camOn(840, 700, 1.1)} to={camOn(820, 640, 1.3)} ov={<><RingFlash t={t - 22} /><AbsoluteFill style={{background: '#fff', opacity: flash(t, 20, 6) + flash(t, 66, 6)}} /></>}>
			<Layer depth={1.25}>
				<Kitchen mug={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<KitchenTable mugs={0} />
					<Shards x={860} y={900} k={1} />
					<Hero x={640} big uid="h3" pose={handTo(base, 640, HS, 1, [650, 640], 1)} fist="white" expr="sad" handItem={<path d="M0,0 q34,0 34,22 q0,22 -34,22" stroke="#f2f2f2" strokeWidth={12} fill="none" />} />
				</Svg>
			</Layer>
		</Scene>
	);
};

export const S004: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('004');
	const base = idle(f, 2);
	const back = reach(base, 'F', [-26, -48], 1);
	return (
		<Scene from={camOn(700, 640, 1.2)} to={camOn(760, 620, 1.5)}>
			<Layer depth={1.25}>
				<Kitchen mug={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<KitchenTable mugs={0} />
					<Shards x={860} y={900} k={1} />
					<Hero x={640} big uid="h4" pose={back} fist="white" expr="worried" mouth="open" />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 005: night roof, a feather falls */
export const S005: React.FC = () => {
	const {f, at, dur} = useShot();
	const t = f - at('005');
	const fy = lerp(-60, 560, kk(t, 0, 130));
	const fx = 960 + Math.sin(t / 14) * 70;
	const base = idle(f, 3);
	return (
		<Scene night from={camOn(960, 520, 1.1)} to={camOn(960, 640, 1.6)}>
			<Layer depth={1.3}>
				<Roof night f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={960} big uid="h5" pose={{...base, armF: [96, 76]}} fist="white" faceTurn={0} expr="worried" />
					<g transform={`translate(${fx},${fy}) rotate(${Math.sin(t / 14) * 40 + 20})`}>
						<path d="M0,-40 C26,-20 20,30 0,52 C-20,30 -26,-20 0,-40 Z" fill="#f2f2f2" />
						<line x1={0} y1={-40} x2={0} y2={64} stroke="#c9c9d3" strokeWidth={4} />
					</g>
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 006: title */
export const S006: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('006');
	const k = kk(t, 0, 24);
	const crack = kk(t, 44, 80);
	const sc = 1 + 0.07 * kk(f - at('006'), 0, 150);
	const line = (txt: string, size: number, c: string, d: number) => (
		<div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: c, WebkitTextStroke: '6px #0b0d1e', paintOrder: 'stroke', transform: `translateY(${(1 - interpolate(t, [d, d + 12], [0, 1], clamp)) * 60}px)`, opacity: interpolate(t, [d, d + 8], [0, 1], clamp)}}>{txt}</div>
	);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2c3566 0%, #131736 75%)'}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: `scale(${sc})`, opacity: k}}>
				{line('ЧТО ЕСЛИ', 150, '#fff', 0)}
				{line('ТЫ СТАНЕШЬ', 150, '#fff', 6)}
				{line('МАЙКОМ ТАЙСОНОМ?', 128, GOLD, 12)}
			</AbsoluteFill>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				<path d="M80,300 L360,420 L330,520 L700,600 L640,700 L1040,760 L1000,860 L1420,900 L1700,980" stroke="#0b0d1e" strokeWidth={16} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - crack} />
				<path d="M80,300 L360,420 L330,520 L700,600 L640,700 L1040,760 L1000,860 L1420,900 L1700,980" stroke="#fff4c8" strokeWidth={7} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - crack} />
			</svg>
		</AbsoluteFill>
	);
};

/* 007: rewind */
export const S007: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('007');
	const k = kk(t, 4, 36);
	const days = ['14', '13', '12', '11', '10', '9', '8', '7'];
	return (
		<AbsoluteFill style={{background: '#1b2038'}}>
			<AbsoluteFill style={{background: '#fff', opacity: flash(t, -2, 8)}} />
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				{days.map((d, i) => {
					const u = (t * 0.07 + i / days.length) % 1;
					return (
						<g key={i} transform={`translate(${1900 - u * 2100},${200 + ((i * 97) % 600)}) rotate(${u * 520})`} opacity={0.9}>
							<rect x={-60} y={-70} width={120} height={140} rx={10} fill="#fbf8ef" stroke="#d94a3a" strokeWidth={8} />
							<text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#14162a">{d}</text>
						</g>
					);
				})}
				<Mug x={960} y={640} broken={1 - k} />
				{Array.from({length: 11}).map((_, i) => {
					const a = random('sh' + i) * Math.PI * 2;
					const d = (60 + random('sd' + i) * 400) * (1 - k);
					return <polygon key={i} points="0,0 26,-8 14,18" fill="#f2f2f2" stroke="#c9c9d3" strokeWidth={2} transform={`translate(${960 + Math.cos(a) * d},${620 + Math.sin(a) * d * 0.6}) rotate(${i * 47 * (1 - k)})`} opacity={1 - k * 0.0} />;
				})}
			</svg>
			<Actor who="hero" x={640} floor={FL} s={HS} uid="h7" pose={idle(f, 4)} />
		</AbsoluteFill>
	);
};

/* 008: the jar */
export const S008: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('008');
	const strain = Math.sin(t / 3) * (t < 150 ? 1 : 0);
	const base = idle(f, 5);
	const p = handTo(handTo(base, 880, HS, 1, [1000, 720], 1), 880, HS, 1, [1020, 690], 1, 'B');
	return (
		<Scene from={camOn(960, 600, 1.1)} to={camOn(1000, 640, 1.5)}>
			<Layer depth={1.3}>
				<Yard f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`translate(${1010},${700 + strain * 2}) rotate(${strain * 2})`}>
						<rect x={-44} y={-60} width={88} height={110} rx={14} fill="#bfe6c9" opacity={0.9} />
						<rect x={-48} y={-80} width={96} height={26} rx={8} fill="#d94a3a" />
						{[-18, 0, 18].map((x, i) => <ellipse key={i} cx={x} cy={10 + (i % 2) * 14} rx={10} ry={22} fill="#3d8f3d" />)}
					</g>
					<Hero x={880} uid="h8" pose={{...p, lean: p.lean + strain * 2}} fist="skin" expr="worried" mouth="open" />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 009–012: the roof */
const Grain: React.FC<{t: number}> = ({t}) => (
	<g>
		{Array.from({length: 14}).map((_, i) => {
			const k = interpolate(t, [10 + i * 2, 40 + i * 2], [0, 1], clamp);
			return <circle key={i} cx={780 + k * (80 + i * 10)} cy={640 + k * k * 250 - Math.sin(k * 3) * 40} r={5} fill="#f2c94a" opacity={1 - k * 0.2} />;
		})}
	</g>
);
const Birds: React.FC<{t: number; target?: number}> = ({t, target = 1000}) => (
	<g>
		{[0, 1, 2, 3, 4, 5, 6].map((i) => {
			const k = interpolate(t, [20 + i * 8, 60 + i * 8], [0, 1], clamp);
			const x = lerp(1500 + i * 40, target + (i % 4) * 90 - 120, k);
			const y = lerp(300 - (i % 3) * 60, 900, k * k);
			return <Pigeon key={i} x={x} y={y} s={0.95 + (i % 3) * 0.1} facing={-1} wing={k < 0.95 ? Math.abs(Math.sin(t / 2 + i)) : 0} body={['#8f99ad', '#c9ccd6', '#6f7a93'][i % 3]} />;
		})}
	</g>
);
export const S009: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('009');
	const base = idle(f, 6);
	const p = gesture('presentF', base, kk(t, 5, 30));
	return (
		<Scene from={camOn(900, 620, 1.05)} to={camOn(1150, 600, 1.45)}>
			<Layer depth={1.3}>
				<Roof f={f} hatch />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Birds t={t} target={900} />
					<Grain t={t - 6} />
					<Hero x={700} uid="h9" pose={p} fist="skin" />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const LehaUp: React.FC<{k: number; x: number; uid: string; pose?: Pose; facing?: 1 | -1}> = ({k, x, uid, pose, facing = 1}) => (
	<g>
		<clipPath id={'hc' + uid}>
			<rect x={0} y={0} width={1920} height={896} />
		</clipPath>
		<g clipPath={`url(#hc${uid})`}>
			<Actor who="leha" x={x} floor={FL + (1 - k) * 330} s={HS} facing={facing} uid={uid} pose={pose} shadow={false} faceTurn={0.2} />
		</g>
		<rect x={x - 100} y={890} width={200} height={14} fill="#15192e" />
	</g>
);
export const S010: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('010');
	const k = kk(t, -6, 20);
	const base = idle(f, 7);
	return (
		<Scene from={camOn(880, 620, 1.1)} to={camOn(700, 600, 1.5)}>
			<Layer depth={1.3}>
				<Roof f={f} hatch />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Birds t={200} target={1000} />
					<LehaUp k={k} x={430} uid="l10" pose={{...base, armF: [10 + (k > 0.9 ? Math.sin(t / 3) * 14 : 0), 40]}} />
					<Hero x={1000} uid="h10" facing={-1} pose={base} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S011: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('011');
	const drop = kk(t, 24, 40);
	const base = idle(f, 7);
	return (
		<Scene from={camOn(760, 560, 1.2)} to={camOn(700, 520, 1.6)}>
			<Layer depth={1.3}>
				<Roof f={f} hatch />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<LehaUp k={1} x={430} uid="l11" pose={{...base, armF: [10, 40]}} />
					<Pigeon x={440} y={lerp(120, 330, drop)} s={1.1} wing={drop < 1 ? 0.8 : 0} />
					<Hero x={1000} uid="h11" facing={-1} pose={gesture('presentF', base, kk(t, 4, 18))} expr={drop >= 1 ? 'normal' : 'normal'} mouth={t > 70 ? 'smirk' : 'line'} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const Notebook: React.FC<{x: number; y: number; t: number; sc?: number}> = ({x, y, t, sc = 1}) => (
	<g transform={`translate(${x},${y}) rotate(-6) scale(${sc})`}>
		<rect x={-170} y={-120} width={340} height={240} rx={14} fill="#2b4a8a" stroke="#0b1530" strokeWidth={6} />
		<rect x={-130} y={-90} width={260} height={80} rx={8} fill="#fbf8ef" />
		<text x={0} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#14162a">ТЕОРИИ</text>
		<text x={0} y={-18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#d94a3a">ТОМ 4</text>
		<path d={`M-110,40 q30,-20 60,0 t60,0 t60,0`} stroke="#fbf8ef" strokeWidth={5} fill="none" strokeDasharray={400} strokeDashoffset={400 - Math.min(400, t * 8)} />
	</g>
);
export const S012: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('012');
	const base = idle(f, 8);
	return (
		<Scene from={camOn(700, 640, 1.2)} to={camOn(680, 640, 1.4)}>
			<Layer depth={1.3}>
				<Roof f={f} hatch />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<LehaUp k={1} x={430} uid="l12" pose={{...base, armF: [60 + Math.sin(t / 4) * 6, 60]}} />
					<Pigeon x={438} y={330} s={1.1} />
					<Notebook x={760} y={790} t={t} sc={0.75} />
					<Hero x={1000} uid="h12" facing={-1} pose={base} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 013–015: the bedroom */
const NightStand: React.FC<{sunk: number; f: number}> = ({sunk, f}) => (
	<g>
		<g transform={`translate(1085,${690 + sunk * 40}) rotate(${sunk < 0.1 ? Math.sin(f * 2.6) * 9 : 0})`} opacity={1}>
			<circle r={34} fill="#d94a3a" />
			<circle r={26} fill="#fff8ec" />
			<line x1={0} y1={0} x2={0} y2={-18} stroke="#222" strokeWidth={4} />
			<line x1={0} y1={0} x2={13} y2={4} stroke="#222" strokeWidth={4} />
			<circle cx={-26} cy={-30} r={12} fill="#c7c9d3" />
			<circle cx={26} cy={-30} r={12} fill="#c7c9d3" />
		</g>
		<rect x={1020} y={720} width={130} height={170} rx={8} fill="#a9805a" />
		<rect x={1020} y={720} width={130} height={10} rx={4} fill="#c79a6e" />
	</g>
);
const SEATX = 1230;
const SEATY = 700;
const seated = (f: number, lean: number, target: [number, number], k: number): Pose => {
	const base: Pose = {...idle(f, 9), lean};
	return reach(base, 'F', toLocal(target[0], target[1], SEATX, SEATY, HS, -1), k);
};
export const S013: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('013');
	const up = t >= 62;
	const lean = 35 * kk(t, 62, 82);
	const k = kk(t, 66, 92);
	const lie = t > 40 && t < 62 ? Math.sin(t * 1.8) * 6 : 0;
	return (
		<Scene from={camOn(1380, 650, 1.0)} to={camOn(1300, 660, 1.3)}>
			<Layer depth={1.25}>
				<Bedroom f={f} ring={t < 100} alarm={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<NightStand sunk={kk(t, 92, 100)} f={f} />
					{!up ? <Sleeper x={1560} y={706} s={HS} lift={Math.max(0, lie)} expr={t > 40 ? 'wide' : 'sleepy'} /> : null}
					{up ? <Hero x={SEATX} seat={SEATY} facing={-1} big uid="h13" hideLegs pose={seated(f, lean, [1086, 690], k)} fist={k > 0.6 ? 'white' : 'skin'} expr="wide" faceTurn={0.3} /> : null}
					<_Blanket f={f} lift={!up ? Math.max(0, lie) : 0} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S014: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('014');
	return (
		<Scene from={camOn(1180, 690, 1.35)} to={camOn(1150, 680, 1.6)}>
			<Layer depth={1.25}>
				<Bedroom f={f} alarm={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<NightStand sunk={1} f={f} />
					<rect x={1038} y={690} width={94} height={34} fill="#a9805a" />
					<Hero x={SEATX} seat={SEATY} facing={-1} big uid="h14" hideLegs pose={seated(f, 35, [1086, 690], 1)} fist="white" expr="wide" />
					<_Blanket f={f} />
					<Crack x={1022} y={806} len={126} ang={-8} n={1} t={t - 10} w={11} plate={[63, 56]} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S015: React.FC = () => {
	const {f, at} = useShot();
	const base: Pose = {...idle(f, 9), lean: 8, head: 10};
	const pose = reach(base, 'F', toLocal(1180, 600, SEATX, SEATY, HS, -1), 1);
	return (
		<Scene from={camOn(1250, 680, 1.1)} to={camOn(1230, 660, 1.4)}>
			<Layer depth={1.25}>
				<Bedroom f={f} alarm={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<NightStand sunk={1} f={f} />
					<rect x={1038} y={690} width={94} height={34} fill="#a9805a" />
					<Crack x={1022} y={806} len={126} ang={-8} n={1} t={99} w={11} plate={[63, 56]} />
					<Hero x={SEATX} seat={SEATY} facing={-1} big uid="h15" hideLegs pose={pose} fist="white" expr="worried" faceTurn={0.1} />
					<_Blanket f={f} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 016: the door handle */
export const S016: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('016');
	const k = kk(t, 4, 24);
	const base = idle(f, 10);
	const p = handTo(base, 760, HS, 1, [1000, 620], k);
	const snap = t > 40;
	return (
		<Scene from={camOn(960, 620, 1.1)} to={camOn(1040, 640, 1.6)}>
			<Layer depth={1.25}>
				<Svg>
					<Wall id="dr-w" top="#e7d8bc" bot="#d4c09a" trim="#8a7a5a" trimY={700} />
					<Floor y={900} c="#bfae8a" tiles />
					<rect x={1000} y={180} width={420} height={720} rx={10} fill="#8a5a3a" />
					<rect x={1040} y={230} width={340} height={280} rx={8} fill="#7a4c30" />
					<rect x={1040} y={560} width={340} height={280} rx={8} fill="#7a4c30" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					{!snap ? <rect x={1000} y={600} width={70} height={30} rx={12} fill="#c9cfdd" /> : <rect x={1000} y={600} width={26} height={30} rx={8} fill="#7d8498" />}
					<Crack x={1050} y={440} len={300} ang={88} n={2} t={t - 40} w={12} plate={[150, -110]} />
					<Hero x={760} big uid="h16" pose={p} fist={snap || k > 0.7 ? 'white' : 'skin'} expr={snap ? 'wide' : 'normal'} handItem={snap ? <rect x={0} y={-12} width={64} height={26} rx={12} fill="#c9cfdd" /> : undefined} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 017–021: the yard and Gera */
const Granny: React.FC<{x: number; i: number; f: number; stop: boolean}> = ({x, i, f, stop}) => (
	<g>
		{[0].map(() => null)}
		<Actor who="mama" x={x} floor={FL - 20} s={0.8} uid={'g' + i} seed={i} pose={{...idle(f, i), armF: [30, 80 + (stop ? 0 : Math.sin(f / 3) * 14)]}} shadow={false} />
	</g>
);
export const S017: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('017');
	const base = idle(f, 11);
	return (
		<Scene from={camOn(900, 620, 1.05)} to={camOn(1000, 650, 1.4)}
			ov={<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				<Bubble x={1180} y={230} w={600} h={150} t={t - 22} tail={[-80, 130]}>
					<text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#14162a">Как обычно.</text>
				</Bubble>
			</svg>}>
			<Layer depth={1.3}>
				<Yard f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={640} uid="h17" pose={base} fist="skin" expr="worried" />
					<Actor who="gera" x={1080} floor={FL} s={1.18} facing={-1} uid="g17" pose={{...base, armF: [88, 12]}} faceTurn={0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S018: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('018');
	const sw = kk(t, 50, 72);
	const dive = kk(t, 56, 76);
	const base = idle(f, 12);
	const duck: Pose = {...base, lean: 6 + 24 * dive, head: -8 * dive, legF: [10 + 30 * dive, 40 * dive], legB: [-10 - 10 * dive, 30 * dive]};
	return (
		<Scene from={camOn(900, 640, 1.05)} to={camOn(860, 640, 1.4)}>
			<Layer depth={1.3}>
				<Yard f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={lerp(640, 560, dive)} uid="h18" pose={duck} fist="skin" expr={dive > 0.3 ? 'wide' : 'worried'} />
					<Actor who="gera" x={1080} floor={FL} s={1.18} facing={-1} uid="g18" pose={{...base, lean: -6 * sw, armF: [lerp(10, 130, sw), lerp(20, 4, sw)]}} faceTurn={0.2} expr="angry" />
					{sw > 0.3 ? <path d="M980,560 q-120,-40 -240,0" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} /> : null}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S019: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('019');
	const push = kk(t, 12, 24);
	const fly = kk(t, 20, 56);
	const stand = kk(t, 150, 175);
	const base = idle(f, 13);
	const gx = lerp(980, 1480, fly);
	const gpose: Pose = fly > 0.95 ? {...SIT, lean: -2} : {...base, lean: -20 * fly};
	return (
		<Scene from={camOn(1100, 640, 1.0)} to={camOn(1280, 640, 1.35)}
			ov={<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				<Bubble x={1160} y={250} w={560} h={140} t={t - 170} tail={[100, 130]} thought>
					<text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#14162a">Ну вот…</text>
				</Bubble>
			</svg>}>
			<Layer depth={1.3}>
				<Yard f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={820} big={push > 0.3} uid="h19" pose={handTo(base, 820, HS, 1, [lerp(880, 1010, push), 640], push)} fist="skin" expr="wide" />
					<Actor who="gera" x={fly < 1 ? gx : 1480} floor={FL - (fly >= 1 ? 0 : Math.sin(fly * Math.PI) * 110) - (fly >= 1 && stand < 1 ? 66 : 0)} s={1.18} facing={-1} uid="g19" pose={stand > 0.3 ? idle(f, 3) : gpose} faceTurn={0.2} expr={stand > 0.3 ? 'angry' : 'wide'} shadow={fly >= 1} />
					{Array.from({length: 8}).map((_, i) => {
						const u = interpolate(t, [60 + i * 3, 100 + i * 3], [0, 1], clamp);
						return <circle key={i} cx={1450 + (i - 4) * 36 * u} cy={760 + u * 110 - Math.sin(u * 3) * 50} r={9} fill="#f2c94a" stroke="#a9843a" strokeWidth={3} opacity={u > 0 ? 1 : 0} />;
					})}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S020: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('020');
	const back = kk(t, 4, 30);
	const base = idle(f, 14);
	return (
		<Scene from={camOn(1000, 640, 1.0)} to={camOn(1020, 640, 1.3)}>
			<Layer depth={1.3}>
				<Yard f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={lerp(1120, 900, back)} uid="h20" pose={{...base, armF: [100, 20], armB: [60, 20]}} fist="skin" expr="worried" mouth="open" facing={1} />
					<Actor who="gera" x={1480} floor={FL} s={1.18} facing={-1} uid="g20" pose={idle(f, 3)} faceTurn={0.2} expr="angry" />
					{[1560, 1690, 1810].map((x, i) => (
						<Actor key={i} who="mama" sp="X" x={x} floor={FL - 200} s={0.7} facing={-1} uid={'gr' + i} seed={i} color={['#a39b8a', '#8a9ba3', '#b5a98c'][i]} hair={i === 1 ? 'bun' : 'grey'} hairColor="#d8d8d8" outfit={i === 1 ? 'coat' : 'gown'} rim="#f2f2ea" pose={{...idle(f, i), armF: [30, 80]}} shadow={false} />
					))}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S021: React.FC = () => {
	const {f, at, end} = useShot();
	const t = f - at('021');
	const white = t > 80;
	const base = idle(f, 15);
	return (
		<Scene from={camOn(1000, 600, 1.3)} to={camOn(1080, 640, 2.1)}>
			<Layer depth={1.3}>
				<Yard f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={900} big uid="h21" pose={{...base, armF: [60 + 20 * kk(t, 0, 30), 70], head: 12}} fist={white ? 'white' : 'skin'} expr="worried" look={[0.7, 0.8]} />
					<Actor who="gera" x={1500} floor={FL} s={1.18} facing={-1} uid="g21" pose={idle(f, 3)} shadow={false} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 022: Brownsville card */
export const MapCard: React.FC<{t: number}> = ({t}) => {
	const k = interpolate(t, [0, 14], [0, 1], clamp);
	const push = 1 + 0.22 * interpolate(t, [0, 200], [0, 1], {...clamp, easing: ease});
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2c3566 0%, #131736 75%)'}}>
			<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '1240px 800px'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', opacity: k}}>
					<rect x={120} y={110} width={1680} height={860} rx={26} fill="#dfe8f0" stroke="#fff" strokeWidth={10} />
					<path d="M240,260 L700,200 L860,320 L840,520 L1000,640 L1320,700 L1500,860 L900,900 L560,760 L420,520 Z" fill="#b9d6a8" stroke="#6a8a5a" strokeWidth={6} />
					<path d="M1000,640 L1320,700 L1500,860 L1320,880 L1100,780 Z" fill="#a8c890" stroke="#6a8a5a" strokeWidth={6} />
					<text x={1260} y={640} fontFamily={FONT} fontWeight={800} fontSize={72} fill="#2b3366">БРУКЛИН</text>
					<text x={330} y={430} fontFamily={FONT} fontWeight={800} fontSize={72} fill="#2b3366">НЬЮ-ЙОРК</text>
					<g transform={`translate(1240,${790 - 20 * Math.abs(Math.sin(t / 8)) * (t < 30 ? 1 : 0)})`}>
						<circle r={30} fill="#d94a3a" stroke="#fff" strokeWidth={8} />
					</g>
					{[0, 1, 2].map((i) => (
						<Pigeon key={i} x={1480 + i * 110 + Math.sin(t / 10 + i) * 12} y={440 - i * 20 - Math.abs(Math.sin(t / 6 + i)) * 30} s={0.9} body="#47506a" wing={Math.abs(Math.sin(t / 5 + i))} />
					))}
				</svg>
			</AbsoluteFill>
			<Plate x={960} y={840} w={700} h={130} text="БРАУНСВИЛЛ" t={t - 8} size={80} />
		</AbsoluteFill>
	);
};
export const S022: React.FC = () => {
	const {f, at} = useShot();
	return <MapCard t={f - at('022')} />;
};
export const S023: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('023');
	const base = idle(f, 16);
	return (
		<Scene from={camOn(900, 620, 1.05)} to={camOn(1000, 600, 1.5)}>
			<Layer depth={1.3}>
				<Roof f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={820} uid="h23" pose={{...base, armF: [4, 6], armB: [-4, 6]}} fist="skin" expr="sad" faceTurn={0.3} />
					<Pigeon x={lerp(1500, 1080, kk(t, 4, 40))} y={900 - Math.max(0, 1 - kk(t, 4, 40)) * 300} s={1.5} facing={-1} wing={kk(t, 4, 40) < 1 ? 0.8 : 0} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 024–039: part 3 */
const Items: React.FC<{pencil?: number; glass?: number; egg?: number}> = ({pencil = 1, glass = 1, egg = 1}) => (
	<g>
		{pencil ? <g transform="translate(1440,716) rotate(-6)"><rect x={-60} y={-8} width={120} height={16} rx={3} fill="#f2b21c" /><polygon points="60,-8 84,0 60,8" fill="#e9c9a0" /><rect x={-70} y={-8} width={12} height={16} fill="#e86aa0" /></g> : null}
		{glass ? <g transform="translate(1540,720)"><path d="M-26,-70 L26,-70 L20,0 L-20,0 Z" fill="#cfeaf6" opacity={0.85} stroke="#fff" strokeWidth={3} /></g> : null}
		{egg ? <g transform="translate(1630,708)"><ellipse rx={22} ry={29} fill="#fbf3dc" stroke="#d9c89a" strokeWidth={3} /></g> : null}
	</g>
);
export const S024: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('024');
	const base = idle(f, 17);
	return (
		<Scene from={camOn(1250, 660, 1.0)} to={camOn(1380, 680, 1.2)}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Items pencil={kk(t, 6, 8) > 0 ? 1 : 0} glass={t > 20 ? 1 : 0} egg={t > 34 ? 1 : 0} />
					<Actor who="leha" x={1130} floor={FL} s={HS} facing={1} uid="l24" pose={handTo(base, 1130, HS, 1, [1440, 690], kk(t, 0, 40))} faceTurn={0.2} />
					<Hero x={820} uid="h24" pose={base} />
				</Svg>
			</Layer>
		</Scene>
	);
};
const ExpPlate: React.FC<{n: number; t: number}> = ({n, t}) => <Plate x={960} y={70} w={520} h={120} text={`ОПЫТ ${n}`} t={t} size={76} />;
export const S025: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('025');
	const k = kk(t, 20, 60);
	const base = idle(f, 18);
	const p = handTo(base, 1000, HS, 1, [1420, 706], k);
	return (
		<Scene from={camOn(1250, 660, 1.0)} to={camOn(1380, 680, 1.2)} ov={<ExpPlate n={1} t={t} />}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Items glass={1} egg={1} pencil={1} />
					<Hero x={1000} big uid="h25" pose={p} fist={k > 0.7 ? 'white' : 'skin'} expr="worried" />
					<Actor who="leha" x={1760} floor={FL} s={HS} facing={-1} uid="l25" pose={{...base, armF: [30, 80]}} faceTurn={0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S026: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('026');
	const base = idle(f, 19);
	return (
		<Scene from={camOn(1350, 700, 1.1)} to={camOn(1400, 710, 1.25)}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Items glass={1} egg={1} pencil={0} />
					{Array.from({length: 12}).map((_, i) => {
						const u = interpolate(t, [0, 24], [0, 1], clamp);
						return <rect key={i} x={1440 + (random('sp' + i) - 0.5) * 220 * u} y={700 - 40 * u + u * u * 30} width={14} height={4} fill="#e9c9a0" transform={`rotate(${i * 30} 1440 700)`} />;
					})}
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={t - 4} w={12} plate={[170, 70]} />
					<Hero x={1000} big uid="h26" pose={handTo(base, 1000, HS, 1, [1420, 706], 1)} fist="white" expr="wide" />
					<Actor who="leha" x={1760} floor={FL} s={HS} facing={-1} uid="l26" pose={{...base, armF: [80, 60]}} faceTurn={0.2} mouth="smile" />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S027: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('027');
	const base = idle(f, 20);
	const push = kk(t, 30, 60);
	return (
		<Scene from={camOn(1340, 680, 1.05)} to={camOn(1380, 690, 1.2)}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={99} w={12} plate={[170, 70]} />
					<g transform={`translate(${lerp(1540, 1470, push)},720)`}><path d="M-26,-70 L26,-70 L20,0 L-20,0 Z" fill="#cfeaf6" opacity={0.85} stroke="#fff" strokeWidth={3} /></g>
					<g transform="translate(1630,708)"><ellipse rx={22} ry={29} fill="#fbf3dc" stroke="#d9c89a" strokeWidth={3} /></g>
					<Hero x={1000} uid="h27" pose={base} fist="skin" />
					<Actor who="leha" x={1760} floor={FL} s={HS} facing={-1} uid="l27" pose={handTo(base, 1760, HS, -1, [1560, 700], push)} faceTurn={0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S028: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('028');
	const k = kk(t, 24, 60);
	const base = idle(f, 21);
	return (
		<Scene from={camOn(1280, 670, 1.0)} to={camOn(1360, 690, 1.25)} ov={<ExpPlate n={2} t={t} />}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={99} w={12} plate={[170, 70]} />
					<g transform="translate(1520,720)"><path d="M-26,-70 L26,-70 L20,0 L-20,0 Z" fill="#cfeaf6" opacity={0.85} stroke="#fff" strokeWidth={3} /></g>
					<Hero x={1060} big uid="h28" pose={handTo({...base, lean: base.lean + 8 * k}, 1060, HS, 1, [1500, 676], k)} fist={k > 0.6 ? 'white' : 'skin'} expr="worried" mouth="open" />
					<Actor who="leha" x={1780} floor={FL} s={HS} facing={-1} uid="l28" pose={{...base, armF: [20, 90]}} faceTurn={0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S029: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('029');
	const brk = t > 34;
	return (
		<Scene from={camOn(1380, 700, 1.0)} to={camOn(1400, 720, 1.2)}
			ov={<>
				<Plate x={960} y={70} w={520} h={120} text="1 СЕК" t={t - 30} size={76} />
			</>}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={99} w={12} plate={[170, 70]} />
					{!brk ? <g transform="translate(1500,720)"><path d="M-26,-70 L26,-70 L20,0 L-20,0 Z" fill="#cfeaf6" opacity={0.85} stroke="#fff" strokeWidth={3} /></g> : null}
					{brk ? <Shards x={1500} y={906} k={kk(t, 34, 52)} /> : null}
					<Crack x={1420} y={935} len={420} ang={-2} n={4} t={t - 36} w={12} plate={[210, -60]} />
					<Hero x={1060} big uid="h29" pose={handTo(idle(f, 22), 1060, HS, 1, [1490, 676], 1)} fist="white" expr={brk ? 'wide' : 'worried'} />
					<Actor who="leha" x={1780} floor={FL} s={HS} facing={-1} uid="l29" pose={{...idle(f, 2), armF: [60, 80]}} faceTurn={0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S030: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('030');
	const back = kk(t, 20, 50);
	const open = kk(t, 50, 62);
	const base = idle(f, 23);
	const k = kk(t, 60, 82);
	return (
		<Scene from={camOn(1300, 680, 1.0)} to={camOn(1380, 690, 1.2)} ov={<ExpPlate n={3} t={t} />}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={99} w={12} plate={[170, 70]} />
					<Crack x={1420} y={935} len={420} ang={-2} n={4} t={99} w={12} plate={[210, -60]} />
					<g transform="translate(1520,708)"><ellipse rx={22} ry={29} fill="#fbf3dc" stroke="#d9c89a" strokeWidth={3} /></g>
					<Hero x={1060} big uid="h30" pose={handTo(base, 1060, HS, 1, [1500, 690], k)} fist="skin" expr="worried" />
					<Actor who="leha" x={lerp(1780, 1860, back)} floor={FL} s={HS} facing={-1} uid="l30" pose={{...base, armF: [100 * open, 20]}} faceTurn={0.2} />
					{open > 0.1 ? <path d={`M${lerp(1780, 1860, back) - 110},${620} q80,-110 170,0 z`} fill="#d94a3a" stroke="#14162a" strokeWidth={4} transform={`scale(${open})`} style={{transformOrigin: `${lerp(1780, 1860, back) - 20}px 620px`}} /> : null}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S031: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('031');
	const splat = kk(t, 16, 28);
	return (
		<Scene from={camOn(1500, 690, 1.0)} to={camOn(1480, 690, 1.15)}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={99} w={12} plate={[170, 70]} />
					<Crack x={1420} y={935} len={420} ang={-2} n={4} t={99} w={12} plate={[210, -60]} />
					<Hero x={1060} big uid="h31" pose={handTo(idle(f, 24), 1060, HS, 1, [1540, 690], 1)} fist="white" expr="wide" />
					<path d="M1740,560 q90,-120 190,0 z" fill="#d94a3a" stroke="#14162a" strokeWidth={4} />
					<line x1={1835} y1={560} x2={1835} y2={780} stroke="#14162a" strokeWidth={6} />
					<ellipse cx={1830} cy={600} rx={50 * splat} ry={36 * splat} fill="#f2c94a" />
					<rect x={1814} y={600} width={14} height={lerp(0, 80, kk(t, 20, 80))} rx={7} fill="#f2c94a" />
					<Actor who="leha" x={1880} floor={FL} s={HS} facing={-1} uid="l31" pose={{...idle(f, 3), armF: [100, 20]}} faceTurn={0.2} mouth="smile" />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S032: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('032');
	return (
		<Scene from={camOn(1480, 660, 1.0)} to={camOn(1480, 660, 1.15)}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={99} w={12} plate={[170, 70]} />
					<Crack x={1420} y={935} len={420} ang={-2} n={4} t={99} w={12} plate={[210, -60]} />
					<Hero x={1060} uid="h32" pose={idle(f, 5)} fist="skin" expr="sad" />
					<Actor who="leha" x={1830} floor={FL} s={HS} facing={-1} uid="l32" pose={handTo(idle(f, 2), 1830, HS, -1, [1700, 700], 1)} faceTurn={0.2} />
					<g transform="translate(1700,690) rotate(-6)">
						<rect x={-70} y={-48} width={140} height={96} rx={8} fill="#2b4a8a" stroke="#0b1530" strokeWidth={4} />
						<circle cx={0} cy={0} r={lerp(0, 20, kk(t, 20, 40))} fill="#fbf8ef" />
					</g>
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 033–034: Rule 1 card */
export const S033: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('033');
	const drop = 0;
	const pop = interpolate(t, [0, 12], [1.07, 1], {...clamp, easing: ease});
	const stamp = interpolate(t, [30, 36, 44], [3, 0.9, 1], clamp);
	const crack = interpolate(f - at('034'), [10, 26], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2f4a3d 0%, #1b2b24 70%, #101a15 100%)'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', transform: `translateY(${drop}px) scale(${pop * (1 + 0.04 * interpolate(t, [0, 200], [0, 1], clamp))})`, opacity: interpolate(t, [0, 8], [0, 1], clamp), transformOrigin: '50% 50%'}}>
				<rect x={140} y={110} width={1640} height={860} rx={24} fill="#fbf8ef" stroke="#6b4a2a" strokeWidth={22} />
				<text x={960} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill="#14162a">ПРАВИЛО 1</text>
				<text x={960} y={560} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={104} fill="#2b3366">чем ты сильнее,</text>
				<text x={960} y={690} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={104} fill="#2b3366">тем мир вокруг хрупче</text>
				<g transform={`translate(1450,820) rotate(-12) scale(${stamp})`} opacity={interpolate(t, [30, 34], [0, 1], clamp)}>
					<rect x={-190} y={-60} width={380} height={120} rx={14} fill="none" stroke="#d94a3a" strokeWidth={12} />
					<text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#d94a3a">ЗАКОН</text>
				</g>
				<path d="M1830,560 L1700,640 L1720,700 L1600,780" stroke="#0b0d1e" strokeWidth={10} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - crack} />
			</svg>
		</AbsoluteFill>
	);
};

export const S035: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('035');
	const base = idle(f, 25);
	const up = kk(t, 4, 24);
	return (
		<Scene from={camOn(1000, 620, 1.05)} to={camOn(960, 600, 1.5)}>
			<Layer depth={1.3}>
				<Yard f={f} bench={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bench x={1340} y={880} w={420} />
					<Crack x={1360} y={742} len={340} ang={-3} n={3} t={99} w={12} plate={[170, 70]} />
					<Crack x={1420} y={935} len={420} ang={-2} n={4} t={99} w={12} plate={[210, -60]} />
					<Hero x={900} uid="h35" pose={{...base, armF: [lerp(8, 70, up), lerp(10, 90, up)], armB: [lerp(-8, 50, up), lerp(10, 100, up)]}} fist="skin" expr="worried" mouth="open" />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S036: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('036');
	return (
		<Scene from={camOn(1000, 640, 1.0)} to={camOn(1160, 640, 1.4)}>
			<Layer depth={1.3}>
				<Svg>
					<Wall id="st-w" top="#7fc0ea" bot="#e9f4fb" />
					<rect x={-100} y={170} width={2120} height={740} fill="#7a6f66" />
					{Array.from({length: 6}).map((_, i) => <rect key={i} x={40 + i * 330} y={230} width={160} height={180} fill="#a9d4ee" />)}
					<rect x={1180} y={560} width={420} height={340} fill="#4a4258" />
					<rect x={1240} y={640} width={300} height={260} fill="#1a1630" />
					<rect x={1160} y={500} width={460} height={110} rx={10} fill={PLATE} stroke={GOLD} strokeWidth={6} />
					<text x={1390} y={582} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={GOLD}>БОКС</text>
					<rect x={-100} y={900} width={2120} height={200} fill="#6b6f86" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={640} uid="h36" pose={idle(f, 6)} fist="skin" expr="worried" />
					<Actor who="leha" x={420} floor={FL} s={HS} facing={1} uid="l36" pose={{...idle(f, 2), armF: [kk(t, 6, 22) * 100, 20]}} faceTurn={0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* 037–039: fact card 1984 and the safety margin */
export const Fact: React.FC<{t: number; push?: number; children?: React.ReactNode}> = ({t, push = 0.12, children}) => {
	const kids = React.Children.toArray(children);
	const isPlate = (c: any) => c && c.type === Plate;
	const u = interpolate(t, [0, 200], [0, 1], {...clamp, easing: ease});
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2c3566 0%, #131736 75%)'}}>
			<AbsoluteFill style={{transform: `translateX(${-60 * u * (push > 0.2 ? 1 : 0)}px) scale(${1 + push * u})`, transformOrigin: '50% 45%'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>{kids.filter((c) => !isPlate(c))}</svg>
			</AbsoluteFill>
			{kids.filter(isPlate)}
		</AbsoluteFill>
	);
};
export const S037: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('037');
	const k = interpolate(t, [0, 16], [0, 1], clamp);
	const squeeze = 0.5 + 0.5 * Math.sin(t / 10);
	return (
		<Fact t={t} push={0.4}>
			<g opacity={k}>
				<rect x={760} y={420} width={400} height={180} rx={14} fill="#f2b21c" stroke="#fff" strokeWidth={6} />
				<rect x={640} y={380} width={120} height={260} rx={50} fill="#e9a373" stroke="#a85a32" strokeWidth={6} />
				<rect x={1160} y={380} width={120} height={260} rx={50} fill="#e9a373" stroke="#a85a32" strokeWidth={6} />
				{[0, 1].map((i) => (
					<g key={i} stroke="#ffc94a" strokeWidth={14} strokeLinecap="round" fill="none">
						<path d={`M${i ? 1300 : 620},${510} l${i ? -60 : 60},0`} />
						<path d={`M${i ? 1250 : 670},${492} l${i ? 14 : -14},18 l${i ? -14 : 14},18`} />
					</g>
				))}
				<g transform={`translate(0,${squeeze * 6})`} />
			</g>
			<Plate x={960} y={110} w={420} h={130} text="1984" t={t} size={92} />
			<Plate x={960} y={760} w={1300} h={230} text="Вестлинг и Юханссон: как мы держим вещи" t={t - 8} size={75} />
		</Fact>
	);
};
export const S038: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('038');
	const need = interpolate(t, [4, 24], [0, 1], clamp);
	const spare = interpolate(t, [40, 60], [0, 1], clamp);
	return (
		<Fact t={t}>
			<rect x={260} y={420} width={1400} height={110} rx={20} fill="#2a3358" />
			<rect x={260} y={420} width={1000 * need} height={110} rx={20} fill="#3aa37a" />
			<rect x={1260} y={420} width={120 * spare} height={110} rx={20} fill="#f2b21c" />
			<Plate x={760} y={600} w={440} h={120} text="НУЖНО" t={t - 6} c="#3aa37a" size={70} />
			<Plate x={1380} y={290} w={420} h={120} text="ЗАПАС" t={t - 44} size={70} />
			<Plate x={960} y={800} w={1700} h={140} text="сжимаем чуть сильнее, чем нужно" t={t - 20} size={80} />
		</Fact>
	);
};
export const S039: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('039');
	const grow = interpolate(t, [4, 34], [0, 1], clamp);
	const gone = interpolate(t, [34, 54], [0, 1], clamp);
	const peek = interpolate(t, [50, 74], [0, 1], clamp);
	return (
		<Fact t={t}>
			<rect x={260} y={420} width={1400} height={110} rx={20} fill="#2a3358" />
			<rect x={260} y={420} width={1000} height={110} rx={20} fill="#3aa37a" />
			<rect x={1260} y={420} width={120 + 1400 * grow * (1 + gone * 1.5)} height={110} rx={20} fill="#f2b21c" />
			<Plate x={760} y={600} w={440} h={120} text="НУЖНО" c="#3aa37a" size={70} />
			<Plate x={1380} y={290} w={420} h={120} text="ЗАПАС" size={70} />
			<g transform={`translate(${lerp(2300, 1760, peek)},640)`} opacity={peek}>
				<Actor who="hero" x={0} floor={0} s={0.7} facing={-1} uid="h39" pose={{...idle(f, 1), lean: -6}} expr="wide" shadow={false} />
			</g>
			<Plate x={960} y={760} w={1300} h={230} text="запас как у гидравлического пресса" t={t - 14} size={77} />
		</Fact>
	);
};

export const Pending: React.FC = () => (
	<AbsoluteFill style={{background: '#131736', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 90, color: GOLD}}>Часть 11: сцены впереди</div>
	</AbsoluteFill>
);

export {Chick};
