import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {Actor, useShot} from '../kit/core';
import {Fist, Pose, frontHand, toLocal} from '../engine/Stickman';
import {Chair, Chick} from '../engine/props';
import {SIT, idle, reach} from '../kit/actions';
import {Floor, Wall} from '../kit/sets';
import {Layer, Svg, camOn, clamp, ease, flash} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {FL, HS, hip} from './common';
import {Crack, GOLD, Hero, LehaUp, PLATE, Plate, Scene, handTo, kk, lerp} from './parts';
import {Cap, CardBG, Egg, Gym, Palm, Shoulders, Splat, coachAt, palmAt, palmPose} from './parts2';
import {Arena, BeltArt, Glasses, Lounger, NB9, NewHouse, NewRoof, Shovel, SelfieStick} from './parts3';

/* Scenes of parts 9–10 (lines 112–145): Tokyo and the chick.
   Douglas is turquoise and 0.1 taller than the hero (scale). In Tokyo the hero is wooden: shoulders at the ears, white fists.
   The pauses from gaps.json are kept: «Птенец срывается» +1.0 s, «Ладонь идёт вниз» +1.2 s, «Тишина» black frame, then 1.5 s. */
const DS = HS + 0.1;
const NOBEL = '#17b3c4';

/* ================================ PART 9 ================================ */
export const S112: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('112');
	return (
		<CardBG t={t} push={0.2} html={<><Plate x={960} y={70} w={1000} h={140} text="11.2.1990" t={t} size={100} /><Plate x={960} y={800} w={760} h={160} text="37 – 0" t={t - 30} size={120} /></>}>
			<path d="M360,720 Q360,260 960,260 Q1560,260 1560,720 Z" fill="#2c3a78" stroke="#8fa0e8" strokeWidth={10} />
			{Array.from({length: 9}).map((_, i) => <line key={i} x1={960} y1={260} x2={430 + i * 130} y2={720} stroke="#8fa0e8" strokeWidth={4} opacity={0.5} />)}
			<rect x={330} y={720} width={1260} height={40} rx={10} fill="#8fa0e8" />
		</CardBG>
	);
};
export const S113: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('113');
	const rot = kk(t, 70, 110) * 180;
	const front = rot < 90;
	return (
		<CardBG t={t} push={0.12} html={<>
			<Plate x={960} y={70} w={900} h={140} text="10 РАУНД" t={t} size={100} />
			<div style={{position: 'absolute', left: 520, top: 380, width: 880, height: 340, background: PLATE, border: `7px solid ${GOLD}`, borderRadius: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `perspective(1400px) rotateY(${rot}deg)`, opacity: interpolate(t, [0, 10], [0, 1], clamp)}}>
				<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 210, color: '#fff', transform: `scaleX(${front ? 1 : -1})`, letterSpacing: 4}}>{front ? '42 : 1' : '1 : 42'}</div>
			</div>
		</>}>
			<g />
		</CardBG>
	);
};

const ArenaScene: React.FC<{f: number; from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; ov?: React.ReactNode}> = ({f, from, to, children, ov}) => (
	<Scene from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])} ov={ov}>
		<Layer depth={1}>
			<Arena f={f} />
		</Layer>
		<Layer depth={1}>
			<Svg>
				{/* the trainer's empty chair in the hero's corner */}
				<Chair x={380} y={784} seat="#8a6a44" />
				{children}
			</Svg>
		</Layer>
	</Scene>
);
const woodenPose = (f: number, extra: Partial<Pose> = {}): Pose => ({...reach(reach({...idle(f, 1), lean: 0, head: 0}, 'F', [54, -66], 1), 'B', [40, -60], 1), lean: 0, ...extra});
const WoodHero: React.FC<{x: number; f: number; uid: string; pose?: Pose; expr?: any; big?: boolean}> = ({x, f, uid, pose, expr = 'worried', big = true}) => (
	<g>
		<Hero x={x} big={big} fist="white" uid={uid} pose={pose ?? woodenPose(f)} expr={expr} mouth="flat" faceTurn={0.1} />
		<Shoulders x={x} k={1} />
	</g>
);
const RoundPlate: React.FC<{n: string; t?: number}> = ({n, t = 99}) => <Plate x={330} y={70} w={520} h={130} text={n} t={t} size={80} />;
export const S114: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('114');
	return (
		<ArenaScene f={f} from={[860, 640, 1.0]} to={[880, 640, 1.2]}>
			<WoodHero x={760} f={f} uid="h114" />
			<Actor who="douglas" x={1180} floor={FL} s={DS} facing={-1} uid="dg114" pose={{...idle(f, 3), lean: 2 + Math.sin(t / 10) * 3}} faceTurn={0.2} expr="normal" />
		</ArenaScene>
	);
};
export const S115: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('115');
	const swing = kk(t, 12, 28);
	const miss = kk(t, 20, 36);
	return (
		<ArenaScene f={f} from={[880, 640, 1.1]} to={[900, 640, 1.3]} ov={<RoundPlate n="РАУНД 1" t={t} />}>
			<WoodHero x={760} f={f} uid="h115" pose={reach({...woodenPose(f), lean: 6 * swing}, 'F', toLocal(1000, 620, 760, hip(HS), HS, 1), swing)} />
			<Actor who="douglas" x={lerp(1180, 1240, miss)} floor={FL} s={DS} facing={-1} uid="dg115" pose={{...idle(f, 3), lean: -14 * miss}} faceTurn={0.2} />
			{swing > 0.5 ? <path d="M900,620 q60,-30 120,0" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} /> : null}
		</ArenaScene>
	);
};
export const S116: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('116');
	const jab = (t % 22) / 22;
	const hits = Math.min(3, Math.floor(t / 22) + 1);
	const jabK = Math.sin(Math.min(1, jab * 1.6) * Math.PI);
	return (
		<ArenaScene f={f} from={[880, 640, 1.05]} to={[900, 640, 1.25]} ov={<><RoundPlate n="РАУНД 3" t={t} /><Plate x={1500} y={70} w={620} h={130} text={`ПОПАДАНИЙ: ${t > 22 ? Math.min(9, Math.floor(t / 22)) : 0}`} t={t} size={64} /></>}>
			<WoodHero x={760} f={f} uid="h116" pose={{...woodenPose(f), head: -10 * jabK}} />
			<Actor who="douglas" x={1090} floor={FL} s={DS} facing={-1} uid="dg116" pose={reach({...idle(f, 3), lean: 4}, 'F', toLocal(lerp(960, 840, jabK), 590, 1090, hip(DS), DS, -1), jabK)} faceTurn={0.2} />
			{hits > 0 && jabK > 0.8 ? <polygon points="780,520 800,545 830,535 810,560 830,590 795,575 770,600 775,565 745,550 775,545" fill="#ffe04a" opacity={0.85} /> : null}
		</ArenaScene>
	);
};
export const S117: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('117');
	const jab = (t % 26) / 26;
	const jabK = Math.sin(Math.min(1, jab * 1.6) * Math.PI);
	return (
		<ArenaScene f={f} from={[880, 640, 1.2]} to={[890, 640, 1.5]} ov={<RoundPlate n="РАУНД 5" t={t} />}>
			<WoodHero x={760} f={f} uid="h117" pose={{...woodenPose(f), head: -8 * jabK}} />
			<Actor who="douglas" x={1090} floor={FL} s={DS} facing={-1} uid="dg117" pose={reach({...idle(f, 3), lean: 4}, 'F', toLocal(lerp(960, 840, jabK), 590, 1090, hip(DS), DS, -1), jabK)} faceTurn={0.2} />
		</ArenaScene>
	);
};
export const S118: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('118');
	const n7 = kk(t, 6, 18);
	const n2 = kk(t, 26, 38);
	const tremble = t > 50 ? Math.sin(t * 2.4) * 3 : 0;
	const jabP = (k: number, base: Pose): Pose => reach(base, 'F', toLocal(lerp(800, 940, k), 620, 760, hip(HS), HS, 1), k);
	const k = t < 20 ? Math.sin(n7 * Math.PI) : t < 42 ? Math.sin(n2 * Math.PI) : 0.45;
	return (
		<ArenaScene f={f} from={[880, 620, 1.2]} to={[900, 620, 1.55]} ov={<RoundPlate n="РАУНД 7" t={t} />}>
			<WoodHero x={760 + tremble} f={f} uid="h118" pose={jabP(k, woodenPose(f))} />
			<Actor who="douglas" x={1180} floor={FL} s={DS} facing={-1} uid="dg118" pose={idle(f, 3)} faceTurn={0.2} />
			{[[1010, 330, '7', n7 > 0.5], [1130, 400, '2', n2 > 0.5], [1250, 330, '3', false]].map(([x, y, n, on], i) => (
				<g key={i} transform={`translate(${x},${y}) scale(${on || i === 2 ? 1 : 0.4})`} opacity={on ? 1 : i === 2 && t > 40 ? 0.9 : 0.2} >
					<circle r={58} fill={PLATE} stroke={on ? GOLD : '#9aa3b5'} strokeWidth={8} strokeDasharray={i === 2 ? '14 10' : undefined} />
					<text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={on ? GOLD : '#9aa3b5'}>{n as string}</text>
				</g>
			))}
		</ArenaScene>
	);
};
const RefereeCloud: React.FC<{t: number}> = ({t}) => {
	const words = ['…восемь…', 'девять…', 'десять.'];
	const shown = words.filter((_, i) => t >= i * 22).join(' ');
	return (
		<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
			<Bubble x={1250} y={230} w={900} h={160} t={t + 2} tail={[-120, 140]}>
				<text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#14162a">{shown}</text>
			</Bubble>
		</svg>
	);
};
export const S119: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('119');
	const fall = kk(t, 24, 110);
	const ref = kk(t, 100, 130);
	return (
		<ArenaScene f={f} from={[900, 620, 1.0]} to={[960, 700, 1.35]} ov={<><RoundPlate n="РАУНД 10" t={t} />{t > 150 ? <RefereeCloud t={t - 150} /> : null}</>}>
			<g transform={fall > 0.02 ? `rotate(${-84 * fall} 700 ${FL})` : undefined}>
				<WoodHero x={760} f={f} uid="h119" pose={{...woodenPose(f), lean: -10 * fall}} expr={fall > 0.4 ? 'sleepy' : 'worried'} />
			</g>
			<Actor who="douglas" x={1000} floor={FL} s={DS} facing={-1} uid="dg119" pose={reach({...idle(f, 3), lean: 6}, 'F', toLocal(lerp(900, 830, kk(t, 8, 22)), 580, 1000, hip(DS), DS, -1), kk(t, 6, 22) * (1 - kk(t, 22, 40)))} faceTurn={0.2} />
			<Actor who="referee" x={lerp(1500, 1180, ref)} floor={FL} s={HS} facing={-1} uid="rf119" pose={{...idle(f, 5), lean: 20 * ref, armF: [130 + Math.sin(t / 6) * 20 * ref, 20]}} />
			{ref > 0.5 ? <g transform="translate(980,760)">{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-34 + i * 16} y={-50 - (i % 2) * 8} width={10} height={44} rx={5} fill="#e9a373" stroke="#a85a32" strokeWidth={3} />)}</g> : null}
		</ArenaScene>
	);
};
export const S120: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('120');
	const grab = kk(t, 30, 50);
	const snap = t > 72;
	const whip = kk(t, 72, 100);
	const hx = 880;
	const hp = reach({...idle(f, 1), lean: 8}, 'F', toLocal(920, 650, hx, hip(HS), HS, 1), grab);
	return (
		<ArenaScene f={f} from={[900, 640, 1.1]} to={[940, 640, 1.4]} ov={t < 150 ? <RefereeCloud t={t + 70} /> : null}>
			<g>
				{!snap ? <line x1={300} y1={650} x2={1640} y2={650} stroke="#d94a3a" strokeWidth={14} /> : (
					<g>
						<path d={`M300,650 Q${700},${650 - 60 * (1 - whip)} 920,${650 + 40 * whip}`} stroke="#d94a3a" strokeWidth={14} fill="none" strokeLinecap="round" />
						<path d={`M1640,650 Q${1380},${650 - 120 * whip} ${1020 + 140 * whip},${650 - 200 * whip}`} stroke="#d94a3a" strokeWidth={14} fill="none" strokeLinecap="round" />
					</g>
				)}
			</g>
			<Hero x={hx} big fist="white" uid="h120" pose={hp} expr={snap ? 'wide' : 'worried'} />
			{snap ? <Crack x={920} y={660} len={70} ang={90} n={26} t={t - 74} w={9} plate={[60, -150]} /> : null}
		</ArenaScene>
	);
};

export const S121: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('121');
	const seg = Math.max(0, Math.min(3, Math.floor(t / 53)));
	const u = t - seg * 53;
	const fk = kk(u, 2, 10);
	const crackT = (i: number) => u - 6 - i * 12;
	return (
		<Scene from={camOn(960, 620, 1.0)} to={camOn(980, 620, 1.15)} ov={<AbsoluteFill style={{background: '#fff', opacity: flash(u, 0, 4) * 0.5}} />}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill={['#5a6a7a', '#7a8aa8', '#6a5a4a', '#8a7a6a'][seg]} />
					<rect x={-400} y={900} width={2800} height={300} fill={['#3a4a5a', '#4a5a78', '#4a3a2a', '#5a4a3a'][seg]} />
					{seg === 0 ? (
						<g>
							<rect x={1040} y={220} width={380} height={680} rx={10} fill="#4a5a6a" stroke="#1a2430" strokeWidth={6} />
							<rect x={1060} y={250} width={340} height={300} fill="#3a4a5a" />
							<rect x={1330} y={520} width={50} height={90} rx={8} fill="#c9cfdd" />
							{[0, 1, 2].map((i) => <rect key={i} x={1080 + i * 100} y={280} width={70} height={20} rx={6} fill="#1a2430" />)}
						</g>
					) : seg === 1 ? (
						<g>
							<rect x={760} y={560} width={760} height={140} rx={26} fill="#2f6fd8" stroke="#1d3f8a" strokeWidth={6} />
							<rect x={1100} y={500} width={380} height={50} rx={14} fill="#1d3f8a" />
							<rect x={1380} y={380} width={140} height={320} rx={24} fill="#2f6fd8" stroke="#1d3f8a" strokeWidth={6} />
						</g>
					) : seg === 2 ? (
						<g>
							<rect x={1000} y={420} width={380} height={420} rx={26} fill="#8a3a2a" stroke="#4a1a10" strokeWidth={6} />
							<rect x={1100} y={330} width={180} height={100} rx={30} fill="none" stroke="#14162a" strokeWidth={22} />
						</g>
					) : (
						<g>
							<rect x={1020} y={160} width={400} height={740} rx={12} fill="#8a5a3a" stroke="#4a2a18" strokeWidth={6} />
							<rect x={1060} y={210} width={320} height={260} rx={10} fill="#7a4c30" />
							<rect x={1060} y={510} width={320} height={340} rx={10} fill="#7a4c30" />
							<circle cx={1060} cy={560} r={20} fill="#ffd34a" stroke="#b8830f" strokeWidth={4} />
						</g>
					)}
					{[0, 1, 2].map((i) => {
						const bases: [number, number][][] = [[[1080, 300], [1200, 380], [1300, 500]], [[900, 580], [1200, 560], [1420, 520]], [[1040, 520], [1180, 600], [1300, 700]], [[1070, 420], [1190, 560], [1290, 690]]];
						const [cx, cy] = bases[seg][i];
						return <Crack key={i} x={cx} y={cy} len={130} ang={[-20, 40, -50][i]} n={27 + seg * 3 + i} t={crackT(i)} w={10} plate={[[60, -120], [70, 110], [60, -120]][i] as [number, number]} />;
					})}
					<Hero x={[800, 760, 860, 800][seg]} big fist="white" uid={'h121' + seg} pose={handTo({...idle(f, 1), lean: 8}, [800, 760, 860, 800][seg], HS, 1, [[1030, 560], [980, 600], [1070, 480], [980, 560]][seg] as [number, number], fk)} expr="normal" look={[-0.8, 0.1]} />
					<Shoulders x={[800, 760, 860, 800][seg]} k={1} />
				</Svg>
			</Layer>
		</Scene>
	);
};

/* ================================ PART 10 ================================ */
const CutHouse: React.FC<{f: number; tea?: number}> = ({f}) => (
	<Svg>
		<Wall id="ch" top="#070a1e" bot="#1d2550" />
		{Array.from({length: 30}).map((_, i) => <circle key={i} cx={random('cs' + i) * 1920} cy={random('ct' + i) * 380} r={1.5 + random('cu' + i) * 2} fill="#fff" opacity={0.5} />)}
		<rect x={-100} y={900} width={2200} height={300} fill="#252b48" />
		<rect x={420} y={250} width={1080} height={650} fill="#3a3550" stroke="#8a7a5a" strokeWidth={6} />
		{Array.from({length: 5}).map((_, r) => (
			<g key={r}>
				<rect x={440} y={300 + r * 120} width={1040} height={110} fill={r % 2 ? '#ffe9b8' : '#ffddb0'} />
				<rect x={440} y={402 + r * 120} width={1040} height={10} fill="#8a6a44" />
				<rect x={1280} y={320 + r * 120} width={110} height={70} fill="#a9d4ee" stroke="#5a6078" strokeWidth={4} />
				<rect x={500} y={360 + r * 120} width={120} height={46} rx={6} fill="#8a6a44" />
			</g>
		))}
		<rect x={400} y={250} width={1120} height={50} fill="#b9bfd6" stroke="#5a6078" strokeWidth={5} />
		{Array.from({length: 26}).map((_, i) => <rect key={i} x={426 + i * 42} y={254} width={36} height={40} fill={i % 2 ? '#4a7fb8' : '#6a9fd8'} stroke="#2a4a78" strokeWidth={2} />)}
		<rect x={1080} y={150} width={340} height={100} rx={8} fill="#8a5a3a" stroke="#4a2a18" strokeWidth={4} />
		<path d="M1060,160 L1250,90 L1440,160 Z" fill="#c9402f" stroke="#7a1f18" strokeWidth={4} />
		<rect x={-400} y={-300} width={2800} height={1500} fill="#050818" opacity={0.25} />
	</Svg>
);
const LehaFloor = 3;
const LEHA_Y = 300 + 2 * 120 + 106;
const Pot: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 1}) => (
	<g transform={`translate(${x},${y}) scale(${r})`}>
		<rect x={-26} y={-24} width={52} height={36} rx={6} fill="#9aa3b5" stroke="#47506a" strokeWidth={3} />
		<rect x={-34} y={-18} width={12} height={6} rx={2} fill="#47506a" />
		<rect x={22} y={-18} width={12} height={6} rx={2} fill="#47506a" />
	</g>
);
const MugC: React.FC<{x: number; y: number; s?: number; steam?: number}> = ({x, y, s = 1, steam = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-24} y={-48} width={48} height={48} rx={9} fill="#f2f2f2" stroke="#c9c9d3" strokeWidth={2} />
		<rect x={-24} y={-48} width={48} height={10} rx={5} fill="#d94a3a" />
		<path d="M24,-36 q22,0 22,16 q0,16 -22,16" stroke="#f2f2f2" strokeWidth={8} fill="none" />
		{steam > 0 ? [-10, 4, 16].map((dx, i) => <path key={i} d={`M${dx},-56 q8,-14 0,-28 q-8,-14 0,-28`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.5 * steam} />) : null}
	</g>
);
const NightRoof: React.FC<{f: number; from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; ov?: React.ReactNode; crack?: boolean}> = ({f, from, to, children, ov, crack}) => (
	<Scene night from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])} ov={ov}>
		<Layer depth={1}>
			<NewRoof f={f} night crack={crack ? 99 : undefined} crumble={crack ? 1 : 0} />
		</Layer>
		<Layer depth={1}>
			<Svg>{children}</Svg>
		</Layer>
	</Scene>
);
const NestN: React.FC = () => (
	<g>
		<ellipse cx={1180} cy={790} rx={92} ry={30} fill="#8a6a44" stroke="#4a3a24" strokeWidth={4} />
		<Chick x={1128} y={782} s={1.4} />
		<Chick x={1234} y={780} s={1.3} facing={-1} />
		<path d="M1080,784 q30,34 100,34 q70,0 100,-34 l-8,40 q-92,28 -184,0 z" fill="#a98a5a" stroke="#4a3a24" strokeWidth={4} />
	</g>
);
const OldCracks: React.FC<{n?: number}> = ({n = 6}) => (
	<g>
		{Array.from({length: n}).map((_, i) => <Crack key={i} noPlate x={300 + i * 230} y={920 + (i % 3) * 14} len={150} ang={(i % 2 ? 6 : -8)} n={100 + i} t={99} w={8} />)}
	</g>
);
export const S122: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('122');
	const hp = reach(reach({...SIT, lean: 4}, 'F', [-6, -6], 1), 'B', [-12, -8], 1);
	return (
		<NightRoof f={f} from={[900, 700, 1.0]} to={[860, 720, 1.3]} crack>
			<OldCracks n={6} />
			<NestN />
			<Hero x={640} seat={872} uid="h122" pose={hp} expr="sad" faceTurn={0.2} />
			{[0, 1, 2].map((i) => <ellipse key={i} cx={1740 + (i % 2) * 90} cy={880} rx={34} ry={22} fill="#6f7a93" transform={`rotate(${Math.sin(t / 4 + i) * 6} ${1740 + (i % 2) * 90} 880)`} />)}
		</NightRoof>
	);
};
export const S123: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('123');
	const sway = Math.sin(t / 5) * 2;
	return (
		<Scene night from={camOn(960, 520, 1.0)} to={camOn(900, 560, 1.5)}>
			<Layer depth={1}>
				<CutHouse f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={760} s={0.36} seat={236} hideLegs uid="h123" pose={reach(reach({...SIT, lean: 4}, 'F', [-6, -6], 1), 'B', [-12, -8], 1)} expr="sad" />
					<Actor who="leha" x={960} floor={300 + 3 * 120 - 14} s={0.36} facing={-1} uid="l123" pose={{...idle(f, 2), lean: 2, armF: [64, 70], armB: [60, 70]}} mouth="open" shadow={false} />
					<Pot x={940} y={LEHA_Y - 36 + sway} r={0.5} />
					<MugC x={918} y={LEHA_Y - 52} s={0.3} />
				</Svg>
			</Layer>
		</Scene>
	);
};
const ChickWalk: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 2.2, t}) => <Chick x={x} y={y} s={s} band flap={Math.sin(t / 4) * 0.4} />;
export const S124: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('124');
	const down = kk(t, 60, 150);
	return (
		<Scene night from={camOn(960, 250, 2.0)} to={camOn(960, 520, 1.0)}>
			<Layer depth={1}>
				<NewHouse f={f} />
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#050818" opacity={0.74} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ChickWalk x={lerp(760, 960, kk(t, 0, 90))} y={218} t={t} />
					<Hero x={620} s={0.8} floor={222} uid="h124" pose={{...idle(f, 1), lean: 10}} expr="worried" />
				</Svg>
			</Layer>
		</Scene>
	);
};
const ParapetBox: React.FC<{k: number}> = ({k}) => (
	<g transform="translate(900,840)">
		<g transform={`scale(1,${1 - 0.6 * k})`}>
			<rect x={-60} y={-90} width={120} height={90} rx={6} fill="#c9a06a" stroke="#6a4a2a" strokeWidth={4} />
			{[0, 1, 2, 3].map((i) => <line key={i} x1={-60} y1={-80 + i * 20 * (1 - 0.4 * k)} x2={60} y2={-80 + i * 20 * (1 - 0.4 * k)} stroke="#6a4a2a" strokeWidth={3} />)}
		</g>
	</g>
);
const ChickLedge: React.FC<{x?: number; t: number; foot?: number}> = ({x = 1300, t}) => <Chick x={x} y={780} s={2.0} band flap={Math.sin(t / 5) * 0.3} />;
export const S125: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('125');
	const k = kk(t, 16, 36);
	return (
		<NightRoof f={f} from={[1000, 700, 1.0]} to={[1020, 710, 1.25]} crack>
			<NestN />
			<ChickLedge x={1330} t={t} />
			<ParapetBox k={k} />
			<Crack x={840} y={800} len={130} ang={-4} n={39} t={t - 30} w={11} plate={[70, -120]} />
			<Hero x={640} big fist="white" uid="h125" pose={handTo({...idle(f, 1), lean: 10}, 640, HS, 1, [lerp(760, 830, k), 790], 1)} expr="angry" />
		</NightRoof>
	);
};
export const S126: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('126');
	const snap = t > 34;
	const fall = kk(t, 34, 70);
	return (
		<NightRoof f={f} from={[1000, 700, 1.0]} to={[1040, 720, 1.3]} crack>
			<NestN />
			<ChickLedge x={1330} t={t} />
			<g>
				{!snap ? <g transform="translate(800,780) rotate(-40)"><line x1={0} y1={0} x2={300} y2={0} stroke="#8a6a44" strokeWidth={12} strokeLinecap="round" /><ellipse cx={330} cy={0} rx={50} ry={34} fill="none" stroke="#c9cfdd" strokeWidth={6} /></g> : (
					<g>
						<g transform="translate(800,780) rotate(-40)"><line x1={0} y1={0} x2={150} y2={0} stroke="#8a6a44" strokeWidth={12} strokeLinecap="round" /></g>
						<g transform={`translate(${900 + fall * 160},${690 + fall * fall * 300}) rotate(${-40 + fall * 160})`}><line x1={0} y1={0} x2={150} y2={0} stroke="#8a6a44" strokeWidth={12} strokeLinecap="round" /><ellipse cx={180} cy={0} rx={50} ry={34} fill="none" stroke="#c9cfdd" strokeWidth={6} /></g>
					</g>
				)}
			</g>
			<Crack x={880} y={690} len={90} ang={-40} n={40} t={t - 36} w={10} plate={[40, 120]} />
			<Hero x={640} big fist="white" uid="h126" pose={handTo({...idle(f, 1), lean: 10}, 640, HS, 1, [760, 760], 1)} expr="wide" />
		</NightRoof>
	);
};
export const S127: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('127');
	return (
		<Scene night from={camOn(960, 560, 1.1)} to={camOn(930, 590, 1.6)}>
			<Layer depth={1}>
				<CutHouse f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={760} s={0.36} seat={236} hideLegs uid="h127" pose={reach(reach({...SIT, lean: 4}, 'F', [-6, -6], 1), 'B', [-12, -8], 1)} expr="worried" />
					<rect x={880} y={LEHA_Y - 12} width={90} height={14} fill="#8a6a44" />
					<Actor who="leha" x={930} seat={LEHA_Y - 30} facing={-1} s={0.36} uid="l127" pose={{...SIT, armF: [60, 70]}} mouth="open" shadow={false} hideLegs />
					<MugC x={896} y={LEHA_Y - 52} s={0.3} steam={0.5 + 0.5 * Math.sin(t / 6)} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S128: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('128');
	const slip = kk(t, 20, 50);
	return (
		<NightRoof f={f} from={[1330, 770, 1.8]} to={[1330, 780, 2.3]} crack>
			<ChickLedge x={1330 + 26 * slip} t={t * 2} />
			<g transform={`translate(${1330 + 26 * slip + 36},${782 + 22 * slip}) rotate(${slip * 50})`}><ellipse cx={0} cy={0} rx={10} ry={4} fill="#f0a8a0" /></g>
		</NightRoof>
	);
};
export const S129: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('129');
	const shake = Math.sin(t * 1.9) * 5;
	return (
		<Scene night from={camOn(780, 600, 1.5)} to={camOn(780, 590, 1.9)}>
			<Layer depth={1}>
				<NewRoof f={f} night crack={99} crumble={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={700 + shake} big fist="white" uid="h129" pose={reach({...idle(f, 1), lean: 6}, 'F', [64, -118], 1)} expr="wide" look={[0.7, 0.2]} mouth="open" />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S130: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('130');
	const seg = Math.max(0, Math.min(2, Math.floor(t / 60)));
	const u = t - seg * 60;
	const drip = kk(u, 10, 50);
	return (
		<Scene from={camOn(960, 620, 1.0)} to={camOn(980, 620, 1.2)} ov={<AbsoluteFill style={{background: '#fff', opacity: 0.3 + flash(u, 0, 6) * 0.5}} />}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#e9dcc3" />
					<rect x={-400} y={900} width={2800} height={300} fill="#cdbb98" />
					{seg === 0 ? (
						<g transform="translate(960,640) scale(1.6) translate(-1110,-700)">
							<Lounger x={1100} broken={0} />
							<Actor who="leha" x={1120} seat={760} facing={-1} uid="l130" pose={{...SIT}} mouth="open" shadow={false} hideLegs />
						</g>
					) : seg === 1 ? (
						<g transform="translate(960,560) scale(1.5)">
							<rect x={-140} y={-30} width={280} height={60} rx={30} fill="#c9cfdd" stroke="#6b7388" strokeWidth={6} />
							<circle cx={-110} cy={0} r={46} fill="#c9cfdd" stroke="#6b7388" strokeWidth={6} />
							<circle cx={-110} cy={0} r={14} fill="#14162a" />
							{[0, 1, 2].map((i) => <path key={i} d={`M${150 + i * 40},${-30 + i * 6} q30,-10 40,${i * 10}`} stroke="#14162a" strokeWidth={7} fill="none" strokeLinecap="round" />)}
						</g>
					) : (
						<g transform="translate(960,640) scale(2.2) translate(-960,-640)">
							<Palm x={960} y={640} ang={0} />
							<Splat x={960} y={620} k={1} />
							<path d={`M960,${620 + 60 * drip} l0,${40 * drip}`} stroke="#f2c94a" strokeWidth={14} strokeLinecap="round" />
						</g>
					)}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S131: React.FC = () => {
	const {f} = useShot();
	return (
		<Scene from={camOn(960, 620, 1.1)} to={camOn(980, 620, 1.35)} ov={<AbsoluteFill style={{background: '#fff', opacity: 0.25}} />}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#f6d9a6" />
					<rect x={-400} y={900} width={2800} height={300} fill="#c99a6a" />
					<Hero x={700} big fist="skin" uid="h131" pose={{...idle(f, 1), armF: [70, 80]}} handItem={<g transform="translate(0,0)"><g transform="translate(0,-92)"><rect x={-18} y={0} width={36} height={104} rx={9} fill="#bfe6c9" opacity={0.92} stroke="#6aa88a" strokeWidth={3} /><rect x={-14} y={42} width={28} height={58} rx={6} fill="#f2e23a" opacity={0.85} /><rect x={-9} y={-24} width={18} height={26} rx={4} fill="#bfe6c9" stroke="#6aa88a" strokeWidth={3} /><rect x={-11} y={-32} width={22} height={10} rx={3} fill="#d94a3a" /></g></g>} expr="normal" />
					<g transform="translate(1180,600) rotate(-5)">
						<rect x={-110} y={-80} width={150} height={190} rx={10} fill="#fbf8ef" stroke="#2b4a8a" strokeWidth={8} />
						<ellipse cx={-34} cy={20} rx={34} ry={50} fill="#14162a" />
						<ellipse cx={-34} cy={30} rx={20} ry={36} fill="#fbf8ef" />
						<circle cx={-34} cy={-42} r={20} fill="#14162a" />
						<polygon points="-16,-44 6,-38 -16,-34" fill="#f2b21c" />
					</g>
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S132: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('132');
	const toL = kk(t, 60, 100);
	return (
		<Scene from={camOn(840, 600, 1.3)} to={camOn(880, 600, 1.6)}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#f6d9a6" />
					<rect x={-400} y={900} width={2800} height={300} fill="#c99a6a" />
					<Hero x={680} big fist="skin" uid="h132" pose={{...idle(f, 1), armF: [70, 80]}} handItem={<g transform="translate(0,-92)"><rect x={-18} y={0} width={36} height={104} rx={9} fill="#bfe6c9" opacity={0.92} stroke="#6aa88a" strokeWidth={3} /><rect x={-14} y={42} width={28} height={58} rx={6} fill="#f2e23a" opacity={0.85} /><rect x={-9} y={-24} width={18} height={26} rx={4} fill="#bfe6c9" stroke="#6aa88a" strokeWidth={3} /><rect x={-11} y={-32} width={22} height={10} rx={3} fill="#d94a3a" /></g>} expr="normal" look={[lerp(0.3, 0.9, toL), lerp(0.9, 0, toL)]} />
					<Actor who="leha" x={1160} floor={FL} s={HS} facing={-1} uid="l132" pose={{...idle(f, 2), armF: [100 + Math.sin(t / 4) * 20, 40]}} faceTurn={0.2} mouth="open" />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S133: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('133');
	const idx = Math.max(0, Math.min(4, Math.floor(t / 18)));
	const u = t - idx * 18;
	const showAll = t > 100;
	const items = ['чашка', 'ручка', 'карандаш', 'ключ', 'очки'];
	const drawItem = (i: number, x: number, y: number, s = 1) => (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{i === 0 ? <g><rect x={-34} y={-70} width={68} height={70} rx={12} fill="#f2f2f2" /><path d="M34,-52 q36,0 36,24 q0,24 -36,24" stroke="#f2f2f2" strokeWidth={12} fill="none" strokeDasharray="30 20" /></g> : null}
			{i === 1 ? <g><rect x={-80} y={-14} width={74} height={28} rx={12} fill="#c9cfdd" /><rect x={10} y={-14} width={74} height={28} rx={12} fill="#c9cfdd" /></g> : null}
			{i === 2 ? <g>{[0, 1, 2, 3].map((k) => <rect key={k} x={-70 + k * 36} y={-6 + k * 4} width={30} height={10} rx={3} fill="#f2b21c" transform={`rotate(${k * 24 - 30})`} />)}</g> : null}
			{i === 3 ? <g><rect x={-90} y={-12} width={90} height={24} rx={8} fill="#c9a640" /><circle cx={-92} cy={0} r={26} fill="none" stroke="#c9a640" strokeWidth={10} /><rect x={20} y={-12} width={40} height={24} rx={8} fill="#c9a640" transform="rotate(30)" /></g> : null}
			{i === 4 ? <Glasses x={0} y={0} s={0.9} rot={14} /> : null}
		</g>
	);
	return (
		<Scene from={camOn(900, 620, 1.2)} to={camOn(960, 640, 1.5)}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#3a3550" />
					<rect x={-400} y={900} width={2800} height={300} fill="#252233" />
					{!showAll ? drawItem(idx, 1080, 840) : [0, 1, 2, 3, 4].map((i) => drawItem(i, 760 + i * 130, 880, 0.7))}
					<Hero x={760} big fist="white" uid="h133" pose={handTo({...idle(f, 1), lean: 12}, 760, HS, 1, [1000, 780], 1)} expr="worried" look={[0.5, 0.95]} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S134: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('134');
	const point = kk(t, 4, 20);
	return (
		<Scene from={camOn(1260, 640, 1.1)} to={camOn(1320, 640, 1.35)} ov={<AbsoluteFill style={{background: '#fff', opacity: 0.2 + flash(t, 0, 5) * 0.5}} />}>
			<Layer depth={1}>
				<Gym f={f} handle={false} bag="none" />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Egg x={1560} y={566} />
					{coachAt(f, 1380, 1, reach(idle(f, 4), 'F', toLocal(1530, 590, 1380, hip(HS), HS, 1), point))}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S135: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('135');
	return (
		<NightRoof f={f} from={[860, 700, 1.0]} to={[900, 700, 1.25]} crack>
			<NestN />
			<ChickLedge x={1330} t={t} />
			<rect x={400} y={900} width={200} height={14} fill="#15192e" />
			<Hero x={720} uid="h135" pose={{...idle(f, 1), lean: 12, armF: [100, 20], head: -8}} expr="wide" mouth="open" look={[0.95, 0.1]} />
		</NightRoof>
	);
};
export const S136: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('136');
	const shake = Math.sin(t * 2) * 3;
	return (
		<Scene night from={camOn(960, 560, 1.4)} to={camOn(930, 590, 1.8)}>
			<Layer depth={1}>
				<CutHouse f={f} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="leha" x={900 + shake} floor={300 + 3 * 120 - 14} s={0.36} facing={-1} uid="l136" pose={{...idle(f, 2), lean: 20, armF: [64, 70], armB: [60, 70]}} mouth="open" shadow={false} />
					<Pot x={880 + shake} y={LEHA_Y - 36} r={0.5} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S137: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('137');
	const drop = kk(t, 6, 24);
	return (
		<NightRoof f={f} from={[780, 640, 1.3]} to={[800, 640, 1.5]} crack>
			<ChickLedge x={1330} t={t} />
			<Hero x={720} uid="h137" pose={{...idle(f, 1), lean: 8, armF: [30, 30]}} expr="normal" look={[0.95, 0.15]} mouth="open" />
			<Shoulders x={720} k={1 - drop} />
		</NightRoof>
	);
};

/* the chick over the cornice: facade view, the hero kneels at the roof edge */
const FacadeScene: React.FC<{f: number; from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; ov?: React.ReactNode}> = ({f, from, to, children, ov}) => (
	<Scene night from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])} ov={ov}>
		<Layer depth={1}>
			<NewHouse f={f} />
			<Svg>
				<rect x={-400} y={-300} width={2800} height={1500} fill="#050818" opacity={0.74} />
			</Svg>
		</Layer>
		<Layer depth={1}>
			<Svg>{children}</Svg>
		</Layer>
	</Scene>
);
const kneel = (lean: number, tx: number, ty: number, hx: number, hy: number): Pose => reach(reach({...SIT, lean}, 'F', toLocal(tx, ty, hx, hy, HS, 1), 1), 'B', [-14, -10], 1);
const HX2 = 760;
const HY2 = 150;
export const S138: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('138');
	const slow = kk(t, 4, 80);
	const cy = lerp(210, 330, slow * slow);
	return (
		<FacadeScene f={f} from={[960, 330, 1.0]} to={[960, 340, 1.1]} ov={<Plate x={960} y={60} w={260} h={220} text="2" t={t - 6} size={170} />}>
			<Hero x={HX2} seat={HY2} hideLegs uid="h138" pose={kneel(70, 960, 330, HX2, HY2)} expr="wide" />
			<g transform={`translate(0,${0})`}>
				<Chick x={960 + Math.sin(t / 5) * 4} y={cy} s={2.2} band flap={Math.sin(t / 3)} />
				{Array.from({length: 7}).map((_, i) => <circle key={i} cx={940 + i * 10 + Math.sin(t / 6 + i) * 12} cy={cy - 40 - ((t * 0.5 + i * 11) % 60)} r={3} fill="#efe3b8" opacity={0.8} />)}
			</g>
		</FacadeScene>
	);
};
export const S139: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('139');
	const dn = kk(t, 20, 150);
	const palmY = lerp(330, 430, dn);
	const pose = kneel(70, 960, palmY, HX2, HY2);
	const [px, py] = frontHand(pose, HX2, HY2, HS, 1);
	return (
		<FacadeScene f={f} from={[960, 360, 1.15]} to={[960, 400, 1.5]} ov={<Plate x={960} y={60} w={260} h={220} text="1" t={t - 10} size={170} />}>
			<Hero x={HX2} seat={HY2} hideLegs uid="h139" pose={pose} expr="normal" look={[0.6, 0.8]} />
			<Palm x={px + 6} y={py} ang={0} />
			<Chick x={px + 6} y={py - 8} s={2.2} band flap={0} />
		</FacadeScene>
	);
};
export const S140: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('140');
	const pose = kneel(70, 960, 430, HX2, HY2);
	const [px, py] = frontHand(pose, HX2, HY2, HS, 1);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{opacity: kk(t, 15, 40)}}>
				<FacadeScene f={f} from={[960, 400, 1.5]} to={[960, 410, 1.6]}>
					<Hero x={HX2} seat={HY2} hideLegs uid="h140" pose={pose} expr="normal" look={[0.6, 0.8]} />
					<Palm x={px + 6} y={py} ang={0} />
					<Chick x={px + 6} y={py - 8} s={2.2} band flap={0} />
				</FacadeScene>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
export const S141: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('141');
	const peck = Math.abs(Math.sin(t / 7));
	return (
		<Scene night from={camOn(960, 640, 1.8)} to={camOn(960, 640, 2.3)}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#1d2550" />
					<path d="M960,1100 L1120,900" stroke="#f2b21c" strokeWidth={80} strokeLinecap="round" />
					<Palm x={940} y={820} ang={-8} />
					<Chick x={930} y={812} s={3.6} band flap={0.1} />
					<g transform={`translate(${1130 - 60 * peck},${700 + 10 * peck})`}>
						<path d="M200,260 L60,40" stroke="#f2b21c" strokeWidth={60} strokeLinecap="round" />
						<rect x={-40} y={-26} width={100} height={42} rx={21} fill="#e9a373" stroke="#a85a32" strokeWidth={5} transform="rotate(-24)" />
					</g>
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S142: React.FC = () => {
	const {f, at} = useShot();
	const pose = reach({...SIT, lean: 6, head: 10}, 'F', [90, -20], 1);
	const [px, py] = frontHand(pose, 700, 872, HS, 1);
	return (
		<NightRoof f={f} from={[860, 700, 1.1]} to={[860, 700, 1.45]} crack>
			<OldCracks n={5} />
			<Hero x={700} seat={872} uid="h142" pose={pose} expr="normal" look={[0.7, 0.9]} />
			<Palm x={px + 6} y={py} ang={0} />
			<Chick x={px + 6} y={py - 8} s={1.9} band flap={0} />
		</NightRoof>
	);
};
export const S143: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('143');
	const k = kk(t, -4, 20);
	const base = idle(f, 7);
	return (
		<NightRoof f={f} from={[860, 700, 1.1]} to={[800, 680, 1.4]} crack>
			<LehaUp k={k} x={430} uid="l143" pose={{...base, armF: [60, 80], armB: [50, 90]}} />
			<Pot x={470} y={FL - 150 + (1 - k) * 330} r={1} />
			<MugC x={500} y={FL - 190 + (1 - k) * 330} s={0.7} />
			<Hero x={900} facing={-1} uid="h143" pose={{...idle(f, 1), armF: [60, 70]}} expr="normal" />
			<rect x={380} y={890} width={100} height={14} fill="#15192e" />
		</NightRoof>
	);
};
export const S144: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('144');
	const take = kk(t, 60, 100);
	const pour = kk(t, 10, 50);
	const hp = reach(reach({...idle(f, 1), lean: 4}, 'B', toLocal(980, 700, 860, hip(HS), HS, 1), 1), 'F', toLocal(lerp(1040, 1000, take), 700, 860, hip(HS), HS, 1), 1);
	const [bx, by] = frontHand(hp, 860, hip(HS), HS, 1);
	return (
		<NightRoof f={f} from={[1000, 680, 1.1]} to={[1020, 680, 1.45]} crack>
			<Actor who="leha" x={1250} floor={FL} s={HS} facing={-1} uid="l144" pose={{...idle(f, 2), armF: [80, 50], armB: [60, 50]}} faceTurn={0.2} mouth="smile" />
			<Pot x={1170} y={690} r={0.9} />
			{pour > 0 && pour < 1 ? <path d={`M1130,700 Q1100,${720 + 40 * pour} 1060,740`} stroke="#9a6a3a" strokeWidth={8} fill="none" /> : null}
			<MugC x={lerp(1050, bx + 30, take)} y={lerp(730, by + 10, take)} s={1} steam={0.6} />
			<Hero x={860} big fist="skin" uid="h144" pose={hp} expr="normal" />
			<Palm x={980} y={700} ang={0} />
			<Chick x={982} y={692} s={1.8} band />
		</NightRoof>
	);
};
export const S145: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('145');
	return (
		<Scene night from={camOn(960, 640, 1.7)} to={camOn(960, 640, 2.1)}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#1d2550" />
					<MugC x={900} y={780} s={3.2} steam={1} />
					<g transform={`translate(${1420},${420 + Math.min(300, Math.max(0, t - 6) * 12)}) rotate(${Math.max(0, t - 6) * 6})`}>
						<NB9 x={0} y={0} />
					</g>
				</Svg>
			</Layer>
		</Scene>
	);
};
export {Cap, Egg, Shovel, SelfieStick, BeltArt, Lounger, Fist, Chair, ParapetBox, LehaFloor};
