import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {Actor, useShot} from '../kit/core';
import {Pose, frontHand, toLocal} from '../engine/Stickman';
import {Chair, Chick, Pigeon} from '../engine/props';
import {SIT, idle, reach} from '../kit/actions';
import {Floor, Kitchen, KitchenTable, Wall} from '../kit/sets';
import {Layer, Svg, camOn, clamp, ease, flash} from '../kit/kit';
import {Bubble, FONT, HAND} from '../kit/ui';
import {FL, HS, hip} from './common';
import {Crack, FK, GOLD, Hero, PLATE, Plate, Scene, Yard, handTo, kk, lerp} from './parts';
import {CardBG, Egg, Splat} from './parts2';

/* Scenes of parts 7–8 (lines 084–111): belt at twenty, glory.
   The belt is the only intact thing: it never gets a crack. Big fist only on breakages; a hand always grows from a shoulder. */

/* ----------------------------------- belt ----------------------------------- */
const BeltArt: React.FC<{x: number; y: number; s?: number; rot?: number; shine?: number}> = ({x, y, s = 1, rot = 0, shine = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-300} y={-52} width={600} height={104} rx={30} fill="#1d2236" stroke="#0b0d1e" strokeWidth={6} />
		{[-250, -200, 200, 250].map((px) => (
			<rect key={px} x={px - 22} y={-34} width={44} height={68} rx={10} fill="#ffd34a" stroke="#b8830f" strokeWidth={4} />
		))}
		<ellipse cx={0} cy={0} rx={130} ry={84} fill="#ffd34a" stroke="#b8830f" strokeWidth={8} />
		<ellipse cx={0} cy={0} rx={100} ry={62} fill="#f2b21c" stroke="#b8830f" strokeWidth={4} />
		<polygon points="0,-40 12,-12 42,-12 18,6 26,36 0,18 -26,36 -18,6 -42,-12 -12,-12" fill="#fff4c8" stroke="#b8830f" strokeWidth={3} />
		{shine > 0 ? <rect x={-300 + 600 * shine - 40} y={-52} width={50} height={104} fill="#fff" opacity={0.45} transform="skewX(-20)" /> : null}
	</g>
);
/* the belt lying on the hero's shoulder: a strap across the chest and the gold plate */
const HeroBelt: React.FC<{x: number; facing?: 1 | -1; seat?: number; s?: number}> = ({x, facing = 1, seat, s = HS}) => (
	<g transform={`translate(${x},${seat ?? hip(s)}) scale(${s * facing},${s})`}>
		<path d="M-14,-124 L26,-124 L58,-26 L22,-26 Z" fill="#1d2236" stroke="#0b0d1e" strokeWidth={3} />
		<ellipse cx={24} cy={-76} rx={29} ry={21} fill="#ffd34a" stroke="#b8830f" strokeWidth={3} />
		<polygon points="24,-90 28,-80 38,-80 30,-73 33,-63 24,-69 15,-63 18,-73 10,-80 20,-80" fill="#fff4c8" />
		<ellipse cx={-2} cy={-126} rx={26} ry={11} fill="#ffd34a" stroke="#b8830f" strokeWidth={3} />
	</g>
);
const Sparkles: React.FC<{x: number; y: number; t: number; n?: number; r?: number}> = ({x, y, t, n = 8, r = 150}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const a = (i / n) * Math.PI * 2 + random('sp' + i);
			const d = r * (0.5 + random('sd' + i) * 0.6);
			const k = Math.abs(Math.sin(t / 8 + i * 1.7));
			return <polygon key={i} points="0,-14 4,-4 14,0 4,4 0,14 -4,4 -14,0 -4,-4" fill="#fff" opacity={0.3 + 0.7 * k} transform={`translate(${x + Math.cos(a) * d},${y + Math.sin(a) * d * 0.7}) scale(${0.6 + k})`} />;
		})}
	</g>
);

/* --------------------------------- part 7 ---------------------------------- */
export const S084: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('084');
	return (
		<CardBG t={t} push={0.26} html={<><Plate x={960} y={70} w={1000} h={140} text="22.11.1986" t={t} size={100} /><Plate x={960} y={800} w={760} h={140} text="2 РАУНД" t={t - 24} size={96} /></>}>
			<BeltArt x={960} y={500} s={1.45} shine={interpolate(t, [20, 90], [0, 1], clamp)} />
		</CardBG>
	);
};
export const S085: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('085');
	const roll = (to: number, a: number, b: number) => Math.round(interpolate(t, [a, b], [0, to], {...clamp, easing: ease}));
	const cell = (x: number, v: number, label: string) => (
		<g transform={`translate(${x},470)`}>
			<rect x={-190} y={-170} width={380} height={340} rx={30} fill={PLATE} stroke={GOLD} strokeWidth={7} />
			<text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190} fill="#fff">{v}</text>
			<text y={130} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={GOLD}>{label}</text>
		</g>
	);
	return (
		<CardBG t={t} push={0.14} html={<Plate x={960} y={800} w={1100} h={140} text="САМЫЙ МОЛОДОЙ" t={t - 90} size={92} />}>
			{cell(400, roll(20, 4, 60), 'ГОДА')}
			{cell(960, roll(4, 24, 70), 'МЕСЯЦА')}
			{cell(1520, roll(22, 40, 100), 'ДНЯ')}
		</CardBG>
	);
};
const Arena: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<rect x={-100} y={-100} width={2200} height={1300} fill="#0c0a1c" />
		{[360, 960, 1560].map((x, i) => (
			<polygon key={i} points={`${x - 40},-20 ${x + 40},-20 ${x + 300 - i * 20},900 ${x - 300 - i * 20},900`} fill="#fff6d8" opacity={0.1 + 0.04 * Math.sin(f / 20 + i)} />
		))}
		<Floor y={900} c="#4a2a3a" />
		{[0, 1, 2].map((i) => <line key={i} x1={300} y1={560 + i * 90} x2={1640} y2={560 + i * 90} stroke={['#d94a3a', '#f2f2f2', '#2f6fd8'][i]} strokeWidth={12} />)}
		<rect x={290} y={520} width={24} height={380} fill="#47506a" />
		<rect x={1626} y={520} width={24} height={380} fill="#47506a" />
		{Array.from({length: 14}).map((_, i) => <ellipse key={i} cx={80 + i * 150} cy={1040} rx={56} ry={78} fill="#05040e" />)}
	</Svg>
);
export const S086: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('086');
	const series = Math.abs(Math.sin(t / 5));
	const down = kk(t, 90, 120);
	return (
		<Scene from={camOn(960, 640, 1.0)} to={camOn(980, 640, 1.2)} ov={<Plate x={330} y={70} w={540} h={130} text="10 000" t={t} size={92} />}>
			<Layer depth={1}>
				<Arena f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={820} uid="h86" pose={reach({...idle(f, 1), lean: 12}, 'F', toLocal(980, 640, 820, hip(HS), HS, 1), down < 0.1 ? series : 0.2)} expr="angry" />
					<g transform={down > 0.05 ? `rotate(${84 * down} 1140 ${FL})` : undefined}>
						<Actor who="rival" x={1140} floor={FL} s={1.2} facing={-1} uid="rv86" pose={{...idle(f, 3), lean: -8 * down}} expr={down > 0.3 ? 'sleepy' : 'angry'} shadow={down < 0.2} />
					</g>
					<Actor who="referee" x={1380} floor={FL} s={1.1} facing={-1} uid="rf86" pose={{...idle(f, 5), lean: 8 * down, armF: [110 + Math.sin(t / 5) * 30 * down, 20], armB: [-110 - Math.sin(t / 5) * 30 * down, 20]}} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S087: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('087');
	const land = kk(t, 40, 80);
	const bx = lerp(1180, 826, land);
	const by = lerp(470, 640, land) - Math.sin(land * Math.PI) * 60;
	return (
		<Scene from={camOn(960, 640, 1.1)} to={camOn(920, 620, 1.4)}>
			<Layer depth={1}>
				<Arena f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="referee" x={1240} floor={FL} s={HS} facing={-1} uid="rf87" pose={reach(idle(f, 5), 'F', toLocal(1180, 470, 1240, hip(HS), HS, -1), 1 - land)} />
					<Hero x={800} uid="h87" blink={1} pose={{...idle(f, 1), head: -14 * kk(t, 60, 90), lean: -2, armF: [10, 20], armB: [-8, 20]}} expr="worried" mouth="flat" />
					{land < 1 ? <BeltArt x={bx} y={by} s={0.42} rot={lerp(-15, 40, land)} /> : <HeroBelt x={800} />}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S088: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('088');
	return (
		<Scene from={camOn(840, 640, 1.5)} to={camOn(850, 650, 1.85)}>
			<Layer depth={1}>
				<Arena f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={800} uid="h88" pose={{...idle(f, 1), head: -8, armF: [8, 16], armB: [-8, 16]}} expr="wide" mouth="open" look={[0.5, 0.7]} />
					<HeroBelt x={800} />
					<Sparkles x={830} y={640} t={t} n={9} r={150} />
				</Svg>
			</Layer>
		</Scene>
	);
};

const HomeScene: React.FC<{from: [number, number, number]; to: [number, number, number]; water?: number; children?: React.ReactNode; ov?: React.ReactNode}> = ({from, to, water = 0, children, ov}) => (
	<Scene from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])} ov={ov}>
		<Layer depth={1}>
			<Kitchen mug={false} />
		</Layer>
		<Layer depth={1}>
			<Svg>
				<KitchenTable mugs={0} />
				{water > 0 ? (
					<g opacity={0.8}>
						<ellipse cx={1000} cy={920} rx={420 * water + 20} ry={44 * water + 4} fill="#6fb4e8" />
						<ellipse cx={1000} cy={918} rx={300 * water} ry={24 * water} fill="#9fd2f0" />
					</g>
				) : null}
				{children}
			</Svg>
		</Layer>
	</Scene>
);
const Glasses: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<circle cx={-44} cy={0} r={34} fill="#cfeaf6" opacity={0.7} stroke="#14162a" strokeWidth={7} />
		<circle cx={44} cy={0} r={34} fill="#cfeaf6" opacity={0.7} stroke="#14162a" strokeWidth={7} />
		<line x1={-10} y1={-4} x2={10} y2={-4} stroke="#14162a" strokeWidth={7} />
		<line x1={-78} y1={-6} x2={-120} y2={-14} stroke="#14162a" strokeWidth={6} />
		<line x1={78} y1={-6} x2={120} y2={-14} stroke="#14162a" strokeWidth={6} />
	</g>
);
export const S089: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('089');
	const drop = kk(t, 4, 14);
	const pick = kk(t, 12, 30);
	const gy = lerp(660, 876, drop * drop);
	const gp = pick < 1 ? 1 : 0;
	const hp = reach({...idle(f, 1), lean: 6 + 30 * (1 - Math.abs(1 - 2 * pick))}, 'F', toLocal(lerp(980, 920, pick), lerp(880, 660, pick), 760, hip(HS), HS, 1), 1);
	const [hx, hy] = frontHand(hp, 760, hip(HS), HS, 1);
	const gx = t < 12 ? 1010 : pick < 1 ? lerp(1010, hx + 20, pick) : hx + 24;
	const gyy = t < 12 ? gy : pick < 1 ? lerp(876, hy - 10, pick) : hy - 10;
	return (
		<HomeScene from={[960, 640, 1.1]} to={[940, 650, 1.4]}>
			<Actor who="mama" x={1200} floor={FL} s={HS} facing={-1} uid="m89" pose={reach(idle(f, 5), 'F', toLocal(1030, 660, 1200, hip(HS), HS, -1), 1 - drop)} faceTurn={0.2} expr="worried" />
			<Hero x={760} big={t > 28} fist="white" uid="h89" pose={hp} expr={t > 30 ? 'wide' : 'normal'} />
			<HeroBelt x={760} />
			<Glasses x={gx} y={gyy} s={1.2} rot={t > 30 ? -8 : 0} />
			{t > 30 ? <Crack x={gx - 70} y={gyy - 30} len={110} ang={50} n={12} t={t - 32} w={9} plate={[110, -140]} /> : null}
		</HomeScene>
	);
};

const Hall: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="hl" top="#e7d8bc" bot="#d4c09a" trim="#8a7a5a" trimY={760} />
		<Floor y={900} c="#bfae8a" tiles />
		<rect x={1500} y={200} width={300} height={700} rx={10} fill="#8a5a3a" />
		<rect x={1530} y={240} width={240} height={250} rx={8} fill="#7a4c30" />
		<rect x={1530} y={540} width={240} height={300} rx={8} fill="#7a4c30" />
	</Svg>
);
const FrameArt: React.FC<{x: number; y: number; cracked?: boolean}> = ({x, y, cracked}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-150} y={-115} width={300} height={230} rx={8} fill="#6b4a2a" stroke="#3a2a18" strokeWidth={6} />
		<rect x={-124} y={-90} width={248} height={180} fill="#9fd2f0" />
		<g transform="translate(-34,20)"><circle cx={0} cy={-34} r={20} fill="#000" /><rect x={-16} y={-14} width={32} height={60} rx={10} fill="#f2b21c" /></g>
		<g transform="translate(44,20)"><circle cx={0} cy={-34} r={20} fill="#000" /><rect x={-18} y={-14} width={36} height={60} rx={10} fill="#8e5cd9" /></g>
		{cracked ? <rect x={-124} y={-90} width={248} height={180} fill="#fff" opacity={0.18} /> : null}
	</g>
);
export const S090: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('090');
	const k = kk(t, 4, 24);
	return (
		<Scene from={camOn(960, 620, 1.1)} to={camOn(1000, 600, 1.4)}>
			<Layer depth={1}>
				<Hall f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<FrameArt x={1060} y={540} cracked={t > 26} />
					{t > 26 ? <Crack x={950} y={470} len={220} ang={36} n={13} t={t - 26} w={10} plate={[110, 150]} /> : null}
					{t > 26 ? Array.from({length: 7}).map((_, i) => <polygon key={i} points="0,0 18,-6 10,14" fill="#cfeaf6" opacity={0.8} transform={`translate(${1000 + i * 28},${640 + Math.min(220, (t - 26) * (4 + i)) }) rotate(${i * 40})`} />) : null}
					<Hero x={900} big fist="white" uid="h90" pose={handTo({...idle(f, 1), lean: 4}, 900, HS, 1, [1000, 545], k)} expr={t > 26 ? 'wide' : 'worried'} />
					<HeroBelt x={900} />
				</Svg>
			</Layer>
		</Scene>
	);
};

const Beat: React.FC<{bg: string; floor: string; children: React.ReactNode}> = ({bg, floor, children}) => (
	<Svg>
		<rect x={-100} y={-100} width={2200} height={1300} fill={bg} />
		<rect x={-100} y={900} width={2200} height={300} fill={floor} />
		{children}
	</Svg>
);
export const S091: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('091');
	const seg = Math.min(2, Math.floor(t / 26));
	const u = t - seg * 26;
	const fk = kk(u, 2, 10);
	const jet = interpolate(u, [8, 16], [0, 1], clamp);
	const spark = Math.abs(Math.sin(u / 2));
	return (
		<Scene from={camOn(960, 620, 1.0)} to={camOn(980, 620, 1.18)} ov={<AbsoluteFill style={{background: '#fff', opacity: flash(u, 0, 4) * 0.6}} />}>
			<Layer depth={1}>
				{seg === 0 ? (
					<Beat bg="#cfe3e4" floor="#b9c9c9">
						<rect x={-100} y={680} width={2200} height={30} fill="#9aa8a8" />
						<rect x={760} y={700} width={420} height={200} rx={10} fill="#e9f4f1" stroke="#9aa8a8" strokeWidth={5} />
					</Beat>
				) : seg === 1 ? (
					<Beat bg="#e7d8bc" floor="#bfae8a">
						<rect x={1000} y={400} width={200} height={300} rx={20} fill="#f4f6fa" stroke="#9aa3b5" strokeWidth={6} />
					</Beat>
				) : (
					<Beat bg="#b9a9d6" floor="#8a7aa8">
						<rect x={760} y={640} width={700} height={160} rx={30} fill="#6a4a9a" stroke="#3a2a5a" strokeWidth={6} />
						<rect x={1260} y={560} width={200} height={240} rx={30} fill="#7a5aaa" />
					</Beat>
				)}
			</Layer>
			<Layer depth={1}>
				<Svg>
					{seg === 0 ? (
						<g>
							<rect x={940} y={600} width={40} height={100} rx={10} fill="#c9cfdd" stroke="#6b7388" strokeWidth={4} />
							<path d="M940,600 q-60,-10 -80,30 l40,16 q20,-24 40,-10 z" fill="#c9cfdd" stroke="#6b7388" strokeWidth={4} />
							<rect x={950} y={-40} width={20 + 30 * jet} height={640 * jet} fill="#8fcdf2" opacity={0.9} transform={`translate(${-15 * jet},${600 - 640 * jet})`} />
							{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={960 + (i - 2.5) * 40 * jet} cy={20 + (i % 3) * 30} r={14} fill="#8fcdf2" opacity={jet} />)}
							<Crack x={934} y={650} len={90} ang={-70} n={14} t={u - 8} w={9} plate={[60, -150]} />
						</g>
					) : seg === 1 ? (
						<g>
							<rect x={1060} y={470} width={80} height={150} rx={10} fill="#e9eef7" stroke="#9aa3b5" strokeWidth={4} />
							<rect x={1090} y={500} width={20} height={50} rx={6} fill="#2b2f3a" transform={`rotate(${25 * fk} 1100 525)`} />
							{spark > 0.5 && u > 6 ? <polygon points="1100,430 1112,462 1146,458 1120,480 1130,512 1100,492 1070,512 1082,480 1056,458 1090,462" fill="#ffe04a" /> : null}
							<Crack x={1020} y={470} len={160} ang={55} n={15} t={u - 8} w={9} plate={[-130, 180]} />
						</g>
					) : (
						<g>
							<rect x={1000} y={600} width={280} height={70} rx={14} fill="#2b2f3a" stroke="#0b0d1e" strokeWidth={5} transform="rotate(-6 1140 640)" />
							{[0, 1, 2, 3].map((i) => <circle key={i} cx={1040 + i * 56} cy={630 - i * 4} r={11} fill={['#d94a3a', '#3aa37a', '#f2b21c', '#3d6fd6'][i]} />)}
							<Crack x={1080} y={590} len={130} ang={70} n={16} t={u - 8} w={9} plate={[70, -140]} />
						</g>
					)}
					<Hero x={seg === 0 ? 820 : seg === 1 ? 900 : 860} big fist="white" uid={'h91' + seg} pose={handTo({...idle(f, 1), lean: 8}, seg === 0 ? 820 : seg === 1 ? 900 : 860, HS, 1, seg === 0 ? [946, 640] : seg === 1 ? [1030, 560] : [1000, 590], fk)} expr="wide" />
					<HeroBelt x={seg === 0 ? 820 : seg === 1 ? 900 : 860} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S092: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('092');
	const walk = kk(t, 0, 50);
	return (
		<HomeScene from={[1000, 640, 1.0]} to={[1040, 640, 1.2]} water={1}>
			<Hero x={720} uid="h92" pose={idle(f, 1)} expr="worried" />
			<HeroBelt x={720} />
			<Actor who="mama" x={lerp(1700, 1180, walk)} floor={FL} s={HS} facing={-1} uid="m92" pose={{...idle(f, 5), armF: [96, 20], armB: [100, 20]}} faceTurn={0.2} mouth="smile" />
		</HomeScene>
	);
};
export const S093: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('093');
	const hug = kk(t, 8, 30);
	const mp = reach(reach(idle(f, 5), 'F', toLocal(1090, 690, 800, hip(HS), HS, 1), hug), 'B', toLocal(1090, 640, 800, hip(HS), HS, 1), hug);
	return (
		<HomeScene from={[960, 640, 1.1]} to={[960, 640, 1.45]} water={1}>
			<Actor who="mama" x={800} floor={FL} s={HS} facing={1} uid="m93" pose={mp} faceTurn={0.1} mouth="smile" />
			<Hero x={980} facing={-1} big fist="white" uid="h93" pose={{...idle(f, 1), armF: [4, 6], armB: [-4, 6], lean: 0}} expr="worried" mouth="flat" faceTurn={0.1} />
			<HeroBelt x={980} facing={-1} />
		</HomeScene>
	);
};
export const S094: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('094');
	const back = kk(t, 4, 26);
	return (
		<HomeScene from={[960, 620, 1.2]} to={[960, 610, 1.5]} water={1}>
			<Actor who="mama" x={lerp(820, 720, back)} floor={FL} s={HS} facing={1} uid="m94" pose={{...idle(f, 5), lean: 14 * back, head: 14 * back}} faceTurn={0.1} expr="worried" />
			<Hero x={980} facing={-1} uid="h94" pose={{...idle(f, 1), head: -8}} expr="sad" look={[-0.8, -0.2]} />
			<HeroBelt x={980} facing={-1} />
		</HomeScene>
	);
};
export const S095: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('095');
	return (
		<Scene from={camOn(900, 600, 1.1)} to={camOn(1000, 570, 1.5)}>
			<Layer depth={1}>
				<Hall f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<FrameArt x={1160} y={540} cracked />
					<Crack x={1050} y={470} len={220} ang={36} n={13} t={99} w={10} plate={[110, 150]} />
					<Hero x={760} uid="h95" pose={{...idle(f, 1), head: 6}} expr="sad" look={[0.95, 0]} />
					<HeroBelt x={760} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* --------------------------------- part 8 ---------------------------------- */
export const S096: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('096');
	const rise = (i: number) => interpolate(t, [10 + i * 14, 34 + i * 14], [160, 0], {...clamp, easing: ease});
	const secs = Math.round(interpolate(t, [150, 240], [0, 91], {...clamp, easing: ease}));
	const mm = Math.floor(secs / 60);
	const ss = String(secs % 60).padStart(2, '0');
	return (
		<CardBG t={t} push={0.04} html={<Plate x={960} y={800} w={1000} h={140} text={`СПИНКС: ${mm}:${ss}`} t={t - 150} size={92} />}>
			{[0, 1, 2].map((i) => (
				<g key={i} opacity={interpolate(t, [10 + i * 14, 24 + i * 14], [0, 1], clamp)}>
					<BeltArt x={350 + i * 610} y={330 + rise(i)} s={0.78} rot={[-4, 2, -2][i]} />
				</g>
			))}
			<g transform="translate(960,640)" opacity={interpolate(t, [140, 156], [0, 1], clamp)}><circle r={110} fill="#f4f6fa" stroke="#9aa3b5" strokeWidth={10} /><rect x={-14} y={-140} width={28} height={30} rx={6} fill="#9aa3b5" /><line x1={0} y1={0} x2={0} y2={-80} stroke="#d94a3a" strokeWidth={9} strokeLinecap="round" transform={`rotate(${secs * 3.95})`} /><circle r={10} fill="#14162a" /></g>
		</CardBG>
	);
};

export const NewHouse: React.FC<{f: number; open?: number[]}> = ({f, open = [0, 0, 0]}) => (
	<Svg>
		<Wall id="nh" top="#7fc0ea" bot="#e9f4fb" />
		<Floor y={900} c="#9aa3b5" />
		{/* five floors under the cornice, tile band under the eaves */}
		<rect x={440} y={250} width={1040} height={650} fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={6} />
		<rect x={420} y={220} width={1080} height={50} fill="#b9bfd6" stroke="#5a6078" strokeWidth={5} />
		{Array.from({length: 26}).map((_, i) => <rect key={i} x={446 + i * 40} y={274} width={36} height={40} fill={i % 2 ? '#4a7fb8' : '#6a9fd8'} stroke="#2a4a78" strokeWidth={2} />)}
		{Array.from({length: 4}).map((_, r) =>
			Array.from({length: 5}).map((__, c) => (
				<g key={`${r}${c}`}>
					<rect x={500 + c * 190} y={334 + r * 118} width={110} height={78} fill="#a9d4ee" stroke="#5a6078" strokeWidth={5} />
					<line x1={555 + c * 190} y1={334 + r * 118} x2={555 + c * 190} y2={412 + r * 118} stroke="#5a6078" strokeWidth={4} />
				</g>
			)),
		)}
		<rect x={440} y={800} width={1040} height={100} fill="#d6c6a0" />
		{[0, 1, 2].map((i) => {
			const x = 560 + i * 300;
			return (
				<g key={i}>
					<rect x={x} y={790} width={130} height={110} fill="#2a263c" />
					<g transform={`translate(${x},790) scale(${1 - open[i] * 0.8},1)`}>
						<rect x={0} y={0} width={130} height={110} fill="#8a5a3a" stroke="#4a2a18" strokeWidth={4} />
						<circle cx={112} cy={58} r={6} fill="#ffd34a" />
					</g>
				</g>
			);
		})}
		{/* coop on the roof */}
		<rect x={1080} y={110} width={340} height={110} rx={8} fill="#8a5a3a" stroke="#4a2a18" strokeWidth={4} />
		<path d="M1060,120 L1250,40 L1440,120 Z" fill="#c9402f" stroke="#7a1f18" strokeWidth={4} />
		{[0, 1, 2].map((i) => <circle key={i} cx={1140 + i * 100} cy={170} r={22} fill="#1a1020" />)}
	</Svg>
);
export const S097: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('097');
	const doors = [kk(t, 20, 36), kk(t, 66, 82), kk(t, 112, 128)];
	const run = kk(t, 0, 150);
	return (
		<Scene from={camOn(960, 560, 1.0)} to={camOn(960, 580, 1.0)} still ov={t > 12 ? <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
			<Bubble x={1240} y={210} w={800} h={150} t={t - 18} tail={[-120, 130]}>
				<text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#14162a">Чемпион, не трогайте, мы сами!</text>
			</Bubble>
		</svg> : null}>
			<Layer depth={1}>
				<NewHouse f={f} open={doors} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{[0, 1, 2].map((i) => {
						const x = lerp(i === 0 ? 300 : 360, 520 + i * 300, run);
						return <Actor key={i} who={['svita1', 'svita2', 'svita3'][i]} sp="X" x={x + (doors[i] > 0.1 ? 0 : 0)} floor={FL + 20} s={0.85} facing={1} uid={'sv' + i} pose={reach({...idle(f, i), lean: 14 * (1 - run)}, 'F', toLocal(560 + i * 300 + 60, 840, x, FL + 20 - 157 * 0.85, 0.85, 1), doors[i])} shadow={false} />;
					})}
					<Hero x={lerp(160, 760, run)} uid="h97" s={0.85} floor={FL + 20} pose={{...idle(f, 1), lean: 6}} expr="normal" mouth="smile" />
					<HeroBelt x={lerp(160, 760, run)} s={0.85} seat={FL + 20 - 157 * 0.85} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S098: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('098');
	const bend = kk(t, 20, 150);
	return (
		<Scene from={camOn(960, 640, 1.0)} to={camOn(980, 640, 1.2)}>
			<Layer depth={1}>
				<Svg>
					<Wall id="gar" top="#5a5a6a" bot="#7a7a8a" />
					<Floor y={900} c="#4a4a58" />
					<rect x={980} y={720} width={700} height={90} rx={14} fill="#2b2f3a" stroke="#0b0d1e" strokeWidth={6} />
					<rect x={980} y={800} width={700} height={110} fill="#1d2030" />
					<Crack x={1060} y={760} len={170} ang={-4} n={17} t={t - 30} w={11} plate={[85, -130]} />
					<Crack x={1310} y={760} len={170} ang={4} n={18} t={t - 70} w={11} plate={[85, 100]} />
					<Crack x={1520} y={760} len={140} ang={-3} n={19} t={t - 110} w={11} plate={[70, -130]} />
					<g transform={`translate(880,640) rotate(${-20 + 40 * bend})`}>
						<ellipse cx={0} cy={0} rx={lerp(46, 20, bend)} ry={lerp(150, 190, bend)} fill="none" stroke="#14162a" strokeWidth={22} />
						{bend > 0.5 ? <ellipse cx={0} cy={0} rx={lerp(20, 70, bend - 0.5)} ry={lerp(60, 110, bend)} fill="none" stroke="#14162a" strokeWidth={20} transform="rotate(60)" /> : null}
					</g>
					<Hero x={690} big fist="white" uid="h98" pose={handTo(reach({...idle(f, 1), lean: 10}, 'B', toLocal(880, 700, 690, hip(HS), HS, 1), 1), 690, HS, 1, [878, 590], 1)} expr="angry" />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S099: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('099');
	const seg = Math.min(2, Math.floor(t / 44));
	const u = t - seg * 44;
	return (
		<Scene from={camOn(960, 620, 1.0)} to={camOn(980, 620, 1.18)} ov={<AbsoluteFill style={{background: '#fff', opacity: flash(u, 0, 4) * 0.5}} />}>
			<Layer depth={1}>
				<Svg>
					<Wall id="wl" top="#d6c9e6" bot="#b9a9d6" />
					<Floor y={900} c="#8a7aa8" />
					{[330, 960, 1590].map((x, i) => <BeltArt key={i} x={x} y={300} s={0.4} />)}
					{seg === 0 ? (
						<g>
							<line x1={760} y1={820} x2={1500} y2={520} stroke="#5a4a2a" strokeWidth={22} />
							<line x1={760} y1={900} x2={1500} y2={600} stroke="#8a6a44" strokeWidth={14} />
							{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={800 + i * 150} y1={810 - i * 60} x2={800 + i * 150} y2={890 - i * 60} stroke="#8a6a44" strokeWidth={10} />)}
							<Crack x={1020} y={670} len={240} ang={-22} n={20} t={u - 8} w={11} plate={[120, -130]} />
							<Hero x={880} big fist="white" uid="h99a" pose={handTo({...idle(f, 1), lean: 8}, 880, HS, 1, [1010, 690], kk(u, 2, 10))} expr="wide" />
						</g>
					) : seg === 1 ? (
						<g>
							<rect x={700} y={680} width={560} height={120} rx={30} fill="#f4f6fa" stroke="#9aa3b5" strokeWidth={6} />
							<rect x={1170} y={560} width={50} height={130} rx={10} fill="#c9cfdd" stroke="#6b7388" strokeWidth={4} />
							<path d="M1170,570 q-110,-30 -150,20" stroke="#c9cfdd" strokeWidth={30} fill="none" strokeLinecap="round" />
							<rect x={1000} y={-40} width={30 + 20 * kk(u, 6, 16)} height={660 * kk(u, 6, 16)} fill="#8fcdf2" opacity={0.9} transform={`translate(${-10},${620 - 660 * kk(u, 6, 16)})`} />
							<Crack x={1130} y={600} len={110} ang={-60} n={21} t={u - 8} w={10} plate={[40, -160]} />
							<Hero x={1020} big fist="white" uid="h99b" pose={handTo({...idle(f, 1), lean: 8}, 1020, HS, 1, [1170, 630], kk(u, 2, 10))} expr="wide" />
						</g>
					) : (
						<g>
							<path d="M700,780 L700,640 Q700,560 800,560 L1460,520 L1620,640 L1620,780 Z" fill="#14162a" stroke="#0b0d1e" strokeWidth={6} />
							<path d="M720,560 L1440,500 L1620,620" stroke="#2a2f4a" strokeWidth={24} fill="none" />
							<rect x={700} y={790} width={80} height={110} fill="#14162a" />
							<rect x={1540} y={790} width={80} height={110} fill="#14162a" />
							<Crack x={920} y={540} len={270} ang={-6} n={22} t={u - 6} w={11} plate={[130, -110]} />
							<Crack x={1220} y={515} len={210} ang={-6} n={23} t={u - 22} w={11} plate={[100, 130]} />
							<Hero x={1020} big fist="white" uid="h99c" pose={handTo({...idle(f, 1), lean: 8}, 1020, HS, 1, [1130, 520], kk(u, 2, 10))} expr="wide" />
						</g>
					)}
				</Svg>
			</Layer>
		</Scene>
	);
};

/* new roof: parapet with tile band, nest on the corner, coop */
const NEST = {x: 1180, y: 770};
const NewRoof: React.FC<{f: number; crack?: number; crumble?: number}> = ({f, crack, crumble = 0}) => (
	<Svg>
		<Wall id="nr" top="#7fc0ea" bot="#ffe9c8" />
		{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * 440 - 60} y={560 - (i % 3) * 80} width={260} height={400} fill="#9fb0c8" opacity={0.7} />)}
		<rect x={-100} y={900} width={2200} height={300} fill="#8a8ea6" />
		{/* parapet with tile band */}
		<rect x={900} y={800} width={600} height={110} fill="#c9ced8" stroke="#5a6078" strokeWidth={5} />
		<rect x={890} y={782} width={620} height={26} fill="#dfe3ee" stroke="#5a6078" strokeWidth={5} />
		{Array.from({length: 15}).map((_, i) => <rect key={i} x={906 + i * 39} y={820} width={35} height={36} fill={i % 2 ? '#4a7fb8' : '#6a9fd8'} stroke="#2a4a78" strokeWidth={2} />)}
		{crack !== undefined ? <Crack x={930} y={868} len={540} ang={-2} n={24} t={crack} w={13} plate={[380, -110]} /> : null}
		{crumble > 0 ? Array.from({length: 10}).map((_, i) => <polygon key={i} points="0,0 14,-4 8,12" fill="#c9ced8" stroke="#5a6078" strokeWidth={2} transform={`translate(${1010 + i * 36},${880 + crumble * (20 + random('cr' + i) * 120)}) rotate(${i * 50})`} opacity={1 - crumble * 0.4} />) : null}
		{/* coop */}
		<g>
			<rect x={1640} y={600} width={340} height={300} rx={8} fill="#8a5a3a" stroke="#4a2a18" strokeWidth={4} />
			<path d="M1620,610 L1810,500 L2000,610 Z" fill="#c9402f" stroke="#7a1f18" strokeWidth={4} />
			{[0, 1, 2].map((i) => <circle key={i} cx={1700 + i * 100} cy={720} r={26} fill="#1a1020" />)}
		</g>
	</Svg>
);
const Nest: React.FC<{k?: number; neck?: number; fluff?: number}> = ({k = 1, neck = 0, fluff = 0}) => (
	<g>
		<ellipse cx={NEST.x} cy={NEST.y + 20} rx={92 * k} ry={30 * k} fill="#8a6a44" stroke="#4a3a24" strokeWidth={4} />
		<Chick x={NEST.x - 52 * k} y={NEST.y + 12} s={1.5 * k} facing={1} flap={Math.sin(neck * 6)} />
		<Chick x={NEST.x + 54 * k} y={NEST.y + 10} s={1.4 * k} facing={-1} flap={Math.cos(neck * 5)} />
		<g transform={`translate(0,${-neck * 12})`}>
			<Chick x={NEST.x} y={NEST.y + 16} s={2.1 * k + fluff * 0.1} band flap={Math.sin(neck * 8)} />
		</g>
		<path d={`M${NEST.x - 100 * k},${NEST.y + 14} q30,34 100,34 q70,0 100,-34 l-8,40 q-92,28 -184,0 z`} fill="#a98a5a" stroke="#4a3a24" strokeWidth={4} />
	</g>
);
const Shovel: React.FC<{grain?: number}> = ({grain = 1}) => (
	<g>
		<line x1={-20} y1={0} x2={330} y2={0} stroke="#8a6a44" strokeWidth={14} strokeLinecap="round" />
		<path d="M330,-30 L420,-34 L420,34 L330,30 Q300,0 330,-30 Z" fill="#9aa3b5" stroke="#47506a" strokeWidth={4} />
		{grain > 0 ? [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={350 + i * 14} cy={-30 + (i % 2) * 8} r={6} fill="#f2c94a" />) : null}
	</g>
);
const shovelPose = (f: number, x: number): Pose => reach(reach({...idle(f, 1), lean: 0}, 'F', toLocal(x + 106, 640, x, hip(HS), HS, 1), 1), 'B', toLocal(x + 70, 664, x, hip(HS), HS, 1), 1);
export const S100: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('100');
	const sow = Math.sin(t / 5) * 6;
	return (
		<Scene from={camOn(1050, 640, 1.0)} to={camOn(1100, 650, 1.25)}>
			<Layer depth={1}>
				<NewRoof f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Nest neck={t / 20} />
					{[0, 1, 2, 3].map((i) => <Pigeon key={i} x={1640 + (i % 2) * 90} y={880} s={0.9} facing={-1} body={['#8f99ad', '#c9ccd6', '#6f7a93', '#8f99ad'][i]} />)}
					<Hero x={700} uid="h100" pose={shovelPose(f, 700)} handItem={<g transform={`rotate(${sow})`}><Shovel /></g>} expr="normal" />
					<HeroBelt x={700} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S101: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('101');
	return (
		<Scene from={camOn(1180, 740, 1.6)} to={camOn(1180, 730, 2.3)}>
			<Layer depth={1}>
				<NewRoof f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Nest neck={t / 14 + 1} fluff={Math.abs(Math.sin(t / 6)) * 2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S102: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('102');
	const k = kk(t, 20, 120);
	const white = t > 84;
	return (
		<Scene from={camOn(1100, 700, 1.3)} to={camOn(1130, 720, 1.7)}>
			<Layer depth={1}>
				<NewRoof f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Nest neck={t / 18} />
					<Hero x={1010} big fist={white ? 'white' : 'skin'} uid="h102" pose={reach({...idle(f, 1), lean: 4 + 10 * k}, 'F', toLocal(lerp(1010, 1088, k), lerp(700, 722, k), 1010, hip(HS), HS, 1), 1)} expr="worried" look={[0.8, 0.4]} />
					<HeroBelt x={1010} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S103: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('103');
	const back = kk(t, 4, 20);
	const slam = kk(t, 22, 34);
	const hx = lerp(1088, 1090, back);
	return (
		<Scene from={camOn(1150, 760, 1.3)} to={camOn(1180, 760, 1.6)}>
			<Layer depth={1}>
				<NewRoof f={f} crack={t - 36} crumble={kk(t, 34, 80)} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Nest neck={t / 12} />
					<Hero x={1010} big fist="white" uid="h103" pose={reach({...idle(f, 1), lean: 4 + 10 * (1 - back) + 12 * slam}, 'F', toLocal(hx, lerp(722, 800, slam) - 30 * (1 - back) * 0, 1010, hip(HS), HS, 1), 1)} expr="wide" />
					<HeroBelt x={1010} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S104: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('104');
	const slide = kk(t, 30, 70);
	const behind = kk(t, 90, 110);
	const base: Pose = behind > 0 ? reach(reach({...idle(f, 1), lean: 2}, 'F', [-24, -50], behind), 'B', [-34, -46], behind) : shovelPose(f, 860);
	return (
		<Scene from={camOn(1050, 700, 1.1)} to={camOn(1110, 710, 1.5)}>
			<Layer depth={1}>
				<NewRoof f={f} crack={99} crumble={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Nest neck={t / 10} />
					{slide < 1 || behind < 1 ? <circle cx={lerp(1150, 1180, slide)} cy={lerp(730, 760, slide * slide)} r={7} fill="#f2c94a" opacity={slide > 0 ? 1 : 0} /> : null}
					<Hero x={860} uid="h104" pose={base} handItem={behind < 0.3 ? <Shovel grain={1 - slide} /> : undefined} expr="smile" mouth="smile" />
					<HeroBelt x={860} />
					{behind >= 0.3 ? <g transform="translate(1000,660) rotate(-70)"><Shovel grain={0} /></g> : null}
				</Svg>
			</Layer>
		</Scene>
	);
};

/* Leha in a lounger */
const Lounger: React.FC<{x: number; broken?: number}> = ({x, broken = 0}) => (
	<g>
		<polygon points={`${x - 100},900 ${x - 40},770 ${x + 20},770 ${x - 30},900`} fill="#6a4a2a" />
		<polygon points={`${x + 130},900 ${x + 80},770 ${x + 40},770 ${x + 100},900`} fill="#6a4a2a" />
		<rect x={x - 70} y={750} width={200} height={26} rx={10} fill="#3d8f9a" stroke="#1d4a52" strokeWidth={4} />
		<rect x={x + 100} y={560} width={34} height={200} rx={10} fill="#3d8f9a" stroke="#1d4a52" strokeWidth={4} transform={`rotate(14 ${x + 117} 760)`} />
		{/* armrest on the near side */}
		{broken < 0.05 ? <rect x={x - 90} y={690} width={190} height={20} rx={8} fill="#8a6a44" stroke="#4a3a24" strokeWidth={4} /> : (
			<g>
				<rect x={x - 90} y={690 + broken * 6} width={90} height={20} rx={8} fill="#8a6a44" stroke="#4a3a24" strokeWidth={4} transform={`rotate(${broken * 24} ${x - 90} 700)`} />
				<rect x={x + 10} y={690 + broken * 20} width={90} height={20} rx={8} fill="#8a6a44" stroke="#4a3a24" strokeWidth={4} transform={`rotate(${-broken * 50} ${x + 100} 700)`} />
			</g>
		)}
		<rect x={x - 90} y={700} width={14} height={70} fill="#6a4a2a" />
	</g>
);
const LX = 1440;
const lehaSit = (f: number, extra: Partial<Pose> = {}): Pose => ({...SIT, ...extra});
const SelfieStick: React.FC<{x0: number; y0: number; x1: number; y1: number; egg?: boolean}> = ({x0, y0, x1, y1, egg = true}) => (
	<g>
		<line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#2b2f3a" strokeWidth={9} strokeLinecap="round" />
		<line x1={x0} y1={y0} x2={x0 - (x0 - x1) * 0.15} y2={y0 - (y0 - y1) * 0.15} stroke="#9aa3b5" strokeWidth={14} strokeLinecap="round" />
		{egg ? <Egg x={x1} y={y1 - 34} s={0.9} /> : null}
	</g>
);
const NB9: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y}) rotate(-6)`}>
		<rect x={-80} y={-56} width={160} height={112} rx={8} fill="#2b4a8a" stroke="#0b1530" strokeWidth={5} />
		<rect x={-60} y={-40} width={120} height={46} rx={4} fill="#fbf8ef" />
		<text y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#14162a">ТЕОРИИ</text>
		<text y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#d94a3a">ТОМ 9</text>
	</g>
);
const RoofLeha: React.FC<{f: number; from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; ov?: React.ReactNode}> = ({f, from, to, children, ov}) => (
	<Scene from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])} ov={ov}>
		<Layer depth={1}>
			<NewRoof f={f} crack={99} crumble={1} />
		</Layer>
		<Layer depth={1}>
			<Svg>{children}</Svg>
		</Layer>
	</Scene>
);
export const S105: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('105');
	const reachK = kk(t, 12, 50);
	return (
		<RoofLeha f={f} from={[1250, 700, 1.0]} to={[1320, 690, 1.2]}>
			<Lounger x={LX} />
			<Actor who="leha" x={LX + 20} seat={760} facing={-1} uid="l105" pose={lehaSit(f)} faceTurn={0.2} mouth="open" hideLegs />
			<NB9 x={LX + 30} y={730} />
			<SelfieStick x0={LX - 40} y0={700} x1={lerp(LX - 80, 1370, reachK)} y1={lerp(700, 640, reachK)} />
			<Hero x={1250} uid="h105" pose={{...idle(f, 1), armF: [96, 10]}} expr="worried" />
			<HeroBelt x={1250} />
		</RoofLeha>
	);
};
export const S106: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('106');
	const wave = Math.sin(t / 3) * 18;
	return (
		<RoofLeha f={f} from={[1330, 690, 1.15]} to={[1360, 680, 1.45]}>
			<Lounger x={LX} />
			<Actor who="leha" x={LX + 20} seat={760} facing={-1} uid="l106" pose={lehaSit(f, {armB: [90 + wave, 30]})} faceTurn={0.2} mouth="open" hideLegs />
			<rect x={LX - 62} y={612} width={26} height={9} rx={4} fill="#d94a3a" />
			<NB9 x={LX + 30} y={730} />
			<SelfieStick x0={LX - 40} y0={700} x1={1370} y1={640} />
			<Hero x={1250} uid="h106" pose={{...idle(f, 1), armF: [96, 10]}} expr="worried" mouth="flat" />
			<HeroBelt x={1250} />
		</RoofLeha>
	);
};
export const S107: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('107');
	const tremble = Math.sin(t * 1.6) * 3;
	return (
		<RoofLeha f={f} from={[1330, 650, 1.35]} to={[1330, 650, 1.75]}>
			<Lounger x={LX} />
			<Actor who="leha" x={LX + 20} seat={760} facing={-1} uid="l107" pose={lehaSit(f)} faceTurn={0.2} hideLegs />
			<SelfieStick x0={LX - 40} y0={700} x1={1370} y1={640} />
			<Hero x={1250 + tremble} big fist="white" uid="h107" pose={reach(reach({...idle(f, 1), lean: 4}, 'F', toLocal(1352, 646, 1250, hip(HS), HS, 1), 1), 'B', toLocal(1290, 700, 1250, hip(HS), HS, 1), 1)} expr="angry" mouth="open" />
			<HeroBelt x={1250} />
			{/* red face rim, veins on the neck */}
			<g transform={`translate(${1250 + tremble},${hip(HS)}) scale(${HS})`}>
				<circle cx={0} cy={-164} r={58} fill="none" stroke="#ff4a3a" strokeWidth={9} opacity={0.5 + 0.4 * Math.sin(t / 4)} />
				<path d="M-14,-118 l8,-12 l-8,-10 M10,-118 l-8,-12 l8,-10" stroke="#ff6a5a" strokeWidth={5} fill="none" strokeLinecap="round" />
			</g>
		</RoofLeha>
	);
};
export const S108: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('108');
	const splat = kk(t, 20, 30);
	const brk = kk(t, 26, 40);
	const jerk = kk(t, 24, 32);
	return (
		<RoofLeha f={f} from={[1360, 660, 1.2]} to={[1380, 680, 1.5]}>
			<Lounger x={LX} broken={brk} />
			{brk > 0.1 ? <Crack x={LX - 90} y={720} len={190} ang={-3} n={25} t={t - 34} w={11} plate={[95, 120]} /> : null}
			<Actor who="leha" x={LX + 20} seat={760 + brk * 40} facing={-1} uid="l108" pose={lehaSit(f, {lean: -4 - 24 * brk})} faceTurn={0.2} mouth="open" hideLegs expr={brk > 0.3 ? 'wide' : 'normal'} />
			<SelfieStick x0={LX - 40} y0={700 + brk * 40} x1={lerp(1370, 1310, brk)} y1={lerp(640, 780, brk)} egg={splat < 0.1} />
			{splat > 0.1 ? <Splat x={1352} y={690} k={splat} /> : null}
			<Hero x={1250} big fist="white" uid="h108" pose={reach({...idle(f, 1), lean: 4 + 14 * jerk}, 'F', toLocal(lerp(1352, LX - 116, jerk), lerp(646, 700, jerk), 1250, hip(HS), HS, 1), 1)} expr="wide" />
			<HeroBelt x={1250} />
		</RoofLeha>
	);
};
export const S109: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('109');
	return (
		<RoofLeha f={f} from={[1380, 700, 1.05]} to={[1400, 700, 1.25]}>
			<Lounger x={LX} broken={1} />
			<Crack x={LX - 90} y={720} len={190} ang={-3} n={25} t={99} w={11} plate={[95, 120]} />
			<Actor who="leha" x={LX + 20} seat={800} facing={-1} uid="l109" pose={lehaSit(f, {lean: -28})} faceTurn={0.2} hideLegs />
			<g transform={`translate(${LX + 70},770) rotate(-6)`}>
				<rect x={-60} y={-40} width={120} height={80} rx={6} fill="#2b4a8a" stroke="#0b1530" strokeWidth={4} />
				<path d="M-34,0 q18,-14 34,0 t34,0" stroke="#fbf8ef" strokeWidth={5} fill="none" strokeDasharray={160} strokeDashoffset={160 - Math.min(160, t * 3)} />
			</g>
			<Hero x={1250} uid="h109" pose={{...idle(f, 1), armF: [14, 20]}} expr="sad" faceTurn={0.2} />
			<HeroBelt x={1250} />
		</RoofLeha>
	);
};
const Poster: React.FC<{x: number; y: number; w?: number; h?: number; s?: number; rip?: number}> = ({x, y, w = 360, h = 480, s = 1, rip = 0}) => {
	const body = (clip: string) => (
		<g clipPath={`url(#${clip})`}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#7a1f2c" stroke="#ffc94a" strokeWidth={8} />
			<text y={-h / 2 + 80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#ffc94a">ТОКИО</text>
			<g transform={`translate(0,10)`}>
				<circle cx={0} cy={-30} r={36} fill="#14070a" />
				<rect x={-34} y={0} width={68} height={130} rx={20} fill="#14070a" />
				<circle cx={-58} cy={40} r={22} fill="#14070a" />
				<circle cx={58} cy={40} r={22} fill="#14070a" />
			</g>
			<text y={h / 2 - 36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill="#fff">42 : 1</text>
		</g>
	);
	const id = 'pc' + Math.round(x);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<defs>
				<clipPath id={id + 'a'}><polygon points={`${-w / 2 - 20},${-h / 2 - 20} ${rip ? 8 : w},${-h / 2 - 20} ${rip ? -14 : w},0 ${rip ? 20 : w},${h / 2 + 20} ${-w / 2 - 20},${h / 2 + 20}`} /></clipPath>
				<clipPath id={id + 'b'}><polygon points={`${rip ? 8 : w},${-h / 2 - 20} ${w / 2 + 20},${-h / 2 - 20} ${w / 2 + 20},${h / 2 + 20} ${rip ? 20 : w},${h / 2 + 20} ${rip ? -14 : w},0`} /></clipPath>
			</defs>
			<g transform={`translate(${-rip * 80},${rip * 30}) rotate(${-rip * 16})`}>{body(id + 'a')}</g>
			{rip ? <g transform={`translate(${rip * 80},${rip * 50}) rotate(${rip * 20})`}>{body(id + 'b')}</g> : null}
		</g>
	);
};
export const S110: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('110');
	const clench = kk(t, 120, 170);
	return (
		<Scene from={camOn(1000, 620, 1.0)} to={camOn(1060, 610, 1.2)}>
			<Layer depth={1}>
				<Svg>
					<Wall id="ps" top="#d6c9e6" bot="#b9a9d6" />
					<Floor y={900} c="#8a7aa8" />
					<Poster x={1240} y={560} w={440} h={580} />
					<Hero x={640} big={clench > 0.5} fist="white" uid="h110" pose={{...idle(f, 1), armF: [lerp(8, 60, clench), lerp(10, 110, clench)], armB: [lerp(-8, 40, clench), lerp(10, 110, clench)]}} expr="angry" look={[0.9, -0.1]} />
					<HeroBelt x={640} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S111: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('111');
	const rip = kk(t, 12, 36);
	return (
		<Scene from={camOn(800, 620, 1.2)} to={camOn(820, 600, 1.55)}>
			<Layer depth={1}>
				<Svg>
					<Wall id="ps2" top="#d6c9e6" bot="#b9a9d6" />
					<Floor y={900} c="#8a7aa8" />
					<Hero x={640} big fist="white" uid="h111" pose={reach(reach({...idle(f, 1), lean: 2}, 'F', [88, -86], 1), 'B', [74, -84], 1)} mouth="smirk" expr="angry" />
					<HeroBelt x={640} />
					<Poster x={816} y={540} w={300} h={400} s={0.8} rip={rip} />
				</Svg>
			</Layer>
		</Scene>
	);
};

export {Hall, HomeScene, random, Yard, Chair, Floor, HAND, Bubble, Splat as _Splat};
