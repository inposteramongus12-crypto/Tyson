import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {Actor, useShot} from '../kit/core';
import {Fist, Pose, frontHand, toLocal} from '../engine/Stickman';
import {Chick} from '../engine/props';
import {SIT, idle, reach, walkTo} from '../kit/actions';
import {Kitchen, KitchenTable} from '../kit/sets';
import {Layer, Svg, camOn, clamp, ease, flash} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {FL, HS, hip} from './common';
import {Crack, GOLD, Hero, PLATE, Plate, Scene, handTo, kk, lerp} from './parts';
import {CardBG, Egg, Gym, Palm, coachAt, palmAt, palmPose, Shoulders} from './parts2';
import {Arena, FrameArt, NewRoof} from './parts3';

/* Scenes of part 11 (lines 146–161): the finale. Knuckles: white only in the flash of Tokyo and the replay; every success is normal-coloured. */

const OpenHand: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{[0, 1, 2, 3].map((i) => <rect key={i} x={-33 + i * 17} y={-70 + (i === 1 || i === 2 ? -10 : 0)} width={15} height={72} rx={7.5} fill="#e9a373" stroke="#a85a32" strokeWidth={3.5} />)}
		<rect x={-52} y={-20} width={16} height={56} rx={8} fill="#e9a373" stroke="#a85a32" strokeWidth={3.5} transform="rotate(-38 -44 30)" />
		<rect x={-38} y={-14} width={76} height={76} rx={22} fill="#e9a373" stroke="#a85a32" strokeWidth={3.5} />
	</g>
);
/* 146: «ПРАВИЛО 1» cracks along the old crack and crumbles */
const ZIG: [number, number][] = [[1100, 100], [1040, 260], [1130, 420], [980, 580], [1070, 740], [900, 880], [960, 990]];
const CardFace: React.FC = () => (
	<g>
		<rect x={140} y={110} width={1640} height={860} rx={24} fill="#fbf8ef" stroke="#6b4a2a" strokeWidth={22} />
		<text x={960} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill="#14162a">ПРАВИЛО 1</text>
		<text x={960} y={560} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={104} fill="#2b3366">чем ты сильнее,</text>
		<text x={960} y={690} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={104} fill="#2b3366">тем мир вокруг хрупче</text>
		<g transform="translate(1450,820) rotate(-12)">
			<rect x={-190} y={-60} width={380} height={120} rx={14} fill="none" stroke="#d94a3a" strokeWidth={12} />
			<text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#d94a3a">ЗАКОН</text>
		</g>
	</g>
);
export const S146: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('146');
	const draw = kk(t, 10, 42);
	const split = kk(t, 50, 130);
	const d = 'M' + ZIG.map((p) => p.join(',')).join(' L');
	const left = `0,0 ${ZIG.map((p) => p.join(',')).join(' ')} 0,1080`;
	const right = `1920,0 ${ZIG.map((p) => p.join(',')).join(' ')} 1920,1080`;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2f4a3d 0%, #1b2b24 70%, #101a15 100%)'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="rl"><polygon points={left} /></clipPath>
					<clipPath id="rr"><polygon points={right} /></clipPath>
				</defs>
				<g transform={`translate(${-60 * split},${split * split * 1200}) rotate(${-14 * split} 500 700)`}><g clipPath="url(#rl)"><CardFace /></g></g>
				<g transform={`translate(${60 * split},${split * split * 1500}) rotate(${18 * split} 1400 700)`}><g clipPath="url(#rr)"><CardFace /></g></g>
				<path d={d} stroke="#0b0d1e" strokeWidth={12} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} opacity={split < 0.3 ? 1 : 0} />
				{Array.from({length: 26}).map((_, i) => {
					const k = interpolate(t, [60 + i, 130 + i], [0, 1], clamp);
					return <rect key={i} x={900 + (random('cx' + i) - 0.5) * 700 * (0.2 + k)} y={200 + (random('cy' + i)) * 600 + k * k * 900} width={26 + random('cw' + i) * 40} height={22 + random('ch' + i) * 30} fill="#fbf8ef" stroke="#6b4a2a" strokeWidth={3} opacity={k > 0 && k < 1 ? 1 : 0} transform={`rotate(${k * 300 * (random('cr' + i) - 0.5)})`} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};
export const S147: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('147');
	const xs = [280, 620, 960, 1300, 1640];
	return (
		<Scene from={camOn(960, 600, 1.0)} to={camOn(960, 600, 1.12)} bg="#2a2f4a">
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#2a2f4a" />
					{xs.map((x, i) => {
						const open = kk(t, 12 + i * 36, 40 + i * 36);
						return (
							<g key={i}>
								<line x1={x} y1={1180} x2={x} y2={720} stroke="#f2b21c" strokeWidth={96} strokeLinecap="round" />
								<g opacity={1 - open}><Fist at={[x, 700]} ang={180} k="white" size={3.2} /></g>
								<g opacity={open}><OpenHand x={x} y={690} s={2.4} /></g>
							</g>
						);
					})}
				</Svg>
			</Layer>
		</Scene>
	);
};
const Graph: React.FC<{t: number; trough?: number}> = ({t, trough = 0}) => {
	const d = 'M700,700 C760,700 820,420 900,420 C980,420 1020,640 1100,640 C1180,640 1220,380 1300,380 C1380,380 1420,690 1500,700 L1760,700';
	const k = interpolate(t, [10, 90], [0, 1], clamp);
	return (
		<g>
			<line x1={660} y1={700} x2={1780} y2={700} stroke="#8fa0e8" strokeWidth={6} />
			<line x1={660} y1={260} x2={660} y2={700} stroke="#8fa0e8" strokeWidth={6} />
			{trough > 0 ? <rect x={1000} y={300} width={200} height={400} rx={20} fill={GOLD} opacity={0.28 * trough} /> : null}
			<path d={d} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
			<g opacity={k > 0.4 ? 1 : 0}><circle cx={900} cy={420} r={18} fill={GOLD} /><circle cx={1300} cy={380} r={18} fill={GOLD} /></g>
		</g>
	);
};
export const S148: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('148');
	const hit = Math.abs(Math.sin(t / 7));
	return (
		<CardBG t={t} push={0.1} html={<><Plate x={330} y={60} w={360} h={130} text="2010" t={t} size={90} /><Plate x={1180} y={60} w={1100} h={130} text="Макгилл с коллегами" t={t - 10} size={72} /><Plate x={960} y={915} w={1100} h={100} text="схема, не измерения" t={t - 20} size={56} /></>}>
			<Actor who="hero" x={340} floor={820} s={1.0} facing={1} uid="h148" pose={reach({...idle(f, 1), lean: 8 + 10 * hit}, 'F', [118, -112], hit)} shadow={false} />
			<Graph t={t} />
		</CardBG>
	);
};
export const S149: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('149');
	const k = kk(t, 8, 40);
	return (
		<CardBG t={t} push={0.1} html={<><Plate x={330} y={60} w={360} h={130} text="2010" t={99} size={90} /><Plate x={1180} y={60} w={1100} h={130} text="Макгилл с коллегами" t={99} size={72} /><Plate x={1100} y={745} w={620} h={130} text="СКОРОСТЬ" t={t - 24} size={84} /><Plate x={960} y={915} w={1100} h={100} text="схема, не измерения" t={99} size={56} /></>}>
			<Actor who="hero" x={340} floor={820} s={1.0} facing={1} uid="h149" pose={reach({...idle(f, 1), lean: 8}, 'F', [118, -112], 0.2)} shadow={false} />
			<Graph t={200} trough={k} />
		</CardBG>
	);
};
export const S150: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('150');
	const wood = t < 100;
	const relax = kk(t, 120, 170);
	return (
		<Scene from={camOn(900, 640, 1.1)} to={camOn(920, 640, 1.3)} ov={<AbsoluteFill style={{background: '#fff', opacity: flash(t, 0, 6) * 0.6 + flash(t, 100, 6) * 0.5}} />}>
			{wood ? (
				<>
					<Layer depth={1}><Arena f={f} /></Layer>
					<Layer depth={1}>
						<Svg>
							<Hero x={760} big fist="white" uid="h150a" pose={reach(reach({...idle(f, 1), lean: 0}, 'F', [54, -66], 1), 'B', [40, -60], 1)} expr="worried" mouth="flat" faceTurn={0.1} />
							<Shoulders x={760} k={1} />
							<g transform="translate(380,784)"><rect x={-58} y={-76} width={116} height={76} rx={6} fill="#8a6a44" /><rect x={-58} y={-150} width={22} height={74} rx={5} fill="#8a6a44" /></g>
						</Svg>
					</Layer>
				</>
			) : (
				<>
					<Layer depth={1}><Gym f={f} handle bag="none" /></Layer>
					<Layer depth={1}>
						<Svg>
							<Hero x={760} big fist="skin" uid="h150b" pose={reach({...idle(f, 1), lean: 10 * relax}, 'F', toLocal(lerp(800, 1040, relax), 630, 760, hip(HS), HS, 1), relax)} expr="normal" />
							{relax > 0.4 ? [0, 1, 2].map((i) => <line key={i} x1={820 + i * 30} y1={600 + i * 20} x2={940 + i * 30} y2={600 + i * 20} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.7} />) : null}
						</Svg>
					</Layer>
				</>
			)}
		</Scene>
	);
};
export const S151: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('151');
	const take = kk(t, 24, 64);
	const hp = reach(idle(f, 4), 'F', toLocal(618, 480, 760, hip(HS), HS, -1), take);
	const [cx, cy] = frontHand(hp, 760, hip(HS), HS, -1);
	return (
		<Scene from={camOn(900, 640, 1.0)} to={camOn(900, 640, 1.2)}>
			<Layer depth={1}><Gym f={f} bag="none" cap={take < 0.8} nail2="bent" /></Layer>
			<Layer depth={1}>
				<Svg>
					{coachAt(f, 760, -1, hp, {hair: 'grey', hairColor: '#d8d8d8'})}
					{take >= 0.8 ? <g transform={`translate(${cx - 6},${cy - 6})`}><path d="M-30,0 C-30,-34 30,-34 30,0 Z" fill="#8c2a2a" stroke="#4a1414" strokeWidth={3} /><path d="M12,-2 Q56,-6 60,6 L10,6 Z" fill="#6b1f1f" stroke="#4a1414" strokeWidth={3} /></g> : null}
					<Hero x={1100} uid="h151" facing={-1} pose={reach({...idle(f, 1), lean: 4}, 'F', [90, -20], 1)} expr="normal" />
					{(() => {
						const p = reach({...idle(f, 1), lean: 4}, 'F', [90, -20], 1);
						const [px, py] = frontHand(p, 1100, hip(HS), HS, -1);
						return <g><Palm x={px - 6} y={py} ang={180} /><Egg x={px - 6} y={py - 36} s={0.9} /></g>;
					})()}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S152: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('152');
	const p = reach({...idle(f, 1), lean: 4}, 'F', [90, -20], 1);
	const [px, py] = frontHand(p, 1100, hip(HS), HS, -1);
	return (
		<Scene from={camOn(930, 640, 1.2)} to={camOn(930, 640, 1.5)}>
			<Layer depth={1}><Gym f={f} bag="none" nail2="bent" /></Layer>
			<Layer depth={1}>
				<Svg>
					{coachAt(f, 760, 1, {...idle(f, 4), head: 6}, {look: [0.9, 0.6]})}
					<Hero x={1100} facing={-1} uid="h152" pose={p} expr="worried" />
					<Palm x={px - 6} y={py} ang={180} />
					<Egg x={px - 6} y={py - 36} s={0.9} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S153: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('153');
	const give = kk(t, 4, 20);
	const w = walkTo(f, at('153') + 16, at('153') + 44, 1100, 1330, 3);
	return (
		<Scene from={camOn(1000, 640, 1.1)} to={camOn(1100, 640, 1.2)}>
			<Layer depth={1}><Gym f={f} bag="none" nail2="bent" /></Layer>
			<Layer depth={1}>
				<Svg>
					{coachAt(f, 760, 1, reach(idle(f, 4), 'F', toLocal(1020, 640, 760, hip(HS), HS, 1), give))}
					<Hero x={w.x} facing={w.x > 1100 && t > 16 ? 1 : -1} uid="h153" pose={t < 16 ? reach({...idle(f, 1), lean: 4}, 'F', [90 - 60 * give, -20], 1) : w.pose} expr="normal" />
					{t < 12 ? <Egg x={1020} y={620} s={0.9} /> : <Egg x={lerp(1020, 860, give)} y={620} s={0.9} />}
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S154: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('154');
	const up = kk(t, 6, 40);
	const dn = kk(t, 40, 76);
	const hammock = kk(t, 76, 130);
	const palmY = lerp(470, 700, hammock);
	const pose = palmPose(f, palmY);
	const [px, py] = palmAt(f, palmY);
	const ex = t < 40 ? lerp(900, 1440, up) : 1440;
	const ey = t < 40 ? lerp(600, -80, up) - Math.sin(up * Math.PI) * 0 : t < 76 ? lerp(-80, py - 40, dn * dn) : py - 40;
	return (
		<Scene from={camOn(1300, 520, 1.0)} to={camOn(1360, 660, 1.45)}>
			<Layer depth={1}><Gym f={f} bag="none" nail2="bent" /></Layer>
			<Layer depth={1}>
				<Svg>
					{coachAt(f, 1000, 1, reach(idle(f, 4), 'F', toLocal(900, 620, 1000, hip(HS), HS, 1), 1 - up))}
					<Hero x={1330} uid="h154" pose={pose} expr="normal" look={[0.3, -0.8]} />
					<Palm x={px + 6} y={py} ang={0} />
					<Egg x={Math.abs(ex - 1440) < 2 && t >= 40 ? px + 10 : ex} y={ey} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S155: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('155');
	const tap = Math.abs(Math.sin(t / 5)) * 18;
	return (
		<CardBG t={t} push={0.1}>
			<g transform="translate(960,540) rotate(-3) scale(0.82)">
				<rect x={-560} y={-380} width={1120} height={760} rx={18} fill="#fbf8ef" stroke="#9aa3b5" strokeWidth={8} />
				{Array.from({length: 17}).map((_, i) => <line key={'a' + i} x1={-560 + i * 70} y1={-380} x2={-560 + i * 70} y2={380} stroke="#bcd3ee" strokeWidth={3} />)}
				{Array.from({length: 12}).map((_, i) => <line key={'b' + i} x1={-560} y1={-380 + i * 70} x2={560} y2={-380 + i * 70} stroke="#bcd3ee" strokeWidth={3} />)}
				<text x={0} y={60} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={260} fill="#2b3366">ПЛЕЧИ</text>
				<line x1={-330} y1={110} x2={330} y2={110} stroke="#d94a3a" strokeWidth={14} strokeLinecap="round" />
				<line x1={-330} y1={160} x2={330} y2={160} stroke="#d94a3a" strokeWidth={14} strokeLinecap="round" />
				<g transform={`translate(${190},${-40 - tap})`}>
					<line x1={150} y1={200} x2={720} y2={420} stroke="#6b7f8e" strokeWidth={110} strokeLinecap="round" />
					<rect x={-70} y={-40} width={230} height={90} rx={45} fill="#e9a373" stroke="#a85a32" strokeWidth={8} transform="rotate(62 40 0)" />
				</g>
			</g>
		</CardBG>
	);
};
export const S156: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('156');
	const w = kk(t, 20, 80);
	const cx = lerp(1100, 1760, w);
	const p = w > 0 ? {...idle(f, 4)} : idle(f, 4);
	return (
		<Scene from={camOn(1000, 620, 1.0)} to={camOn(900, 600, 1.4)}>
			<Layer depth={1}><Gym f={f} bag="none" nail2="bent" /></Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={1330} uid="h156" pose={idle(f, 1)} expr="normal" />
					{coachAt(f, cx, 1, {...p, armF: [30, 80]})}
					<Egg x={cx + 60} y={hip(HS) - 40} s={0.7} />
				</Svg>
			</Layer>
		</Scene>
	);
};
const Evening: React.FC<{f: number; from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; ov?: React.ReactNode}> = ({f, from, to, children, ov}) => (
	<Scene night from={camOn(from[0], from[1], from[2])} to={camOn(to[0], to[1], to[2])} ov={ov}>
		<Layer depth={1}><Kitchen night mug={false} /></Layer>
		<Layer depth={1}>
			<Svg>
				<KitchenTable night mugs={0} />
				<g transform="translate(1640,290) scale(0.8)"><FrameArt x={0} y={0} cracked /></g>
				<Crack x={1560} y={250} len={180} ang={36} n={13} t={99} w={9} plate={[80, 150]} ox={0} oy={0} />
				{children}
			</Svg>
		</Layer>
	</Scene>
);
export const S157: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('157');
	const w = walkTo(f, at('157'), at('157') + 80, 360, 700, 1);
	return (
		<Evening f={f} from={[960, 620, 1.0]} to={[1000, 620, 1.25]}>
			<Hero x={w.x} uid="h157" pose={w.pose} expr="normal" />
			<Actor who="mama" x={1250} floor={FL} s={HS} facing={-1} uid="m157" pose={{...idle(f, 5), armF: [kk(t, 30, 60) * 96, 20], armB: [kk(t, 30, 60) * 100, 20]}} faceTurn={0.2} mouth="smile" />
		</Evening>
	);
};
const OldCrackField: React.FC = () => (
	<g>
		{Array.from({length: 40}).map((_, i) => {
			const x = 120 + random('oc' + i) * 1700;
			const y = 180 + random('od' + i) * 720;
			return <Crack key={i} noPlate x={x} y={y} len={60 + random('ol' + i) * 60} ang={(random('oa' + i) - 0.5) * 80} n={200 + i} t={99} w={6} />;
		})}
	</g>
);
export const S158: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('158');
	const hug = kk(t, 8, 36);
	const mp = reach(reach(idle(f, 5), 'F', toLocal(980, 650, 750, hip(HS), HS, 1), hug), 'B', toLocal(980, 700, 750, hip(HS), HS, 1), hug);
	return (
		<Evening f={f} from={[860, 620, 1.1]} to={[860, 620, 1.35]} ov={<Plate x={960} y={905} w={1000} h={110} text="40 СТАРЫХ · 0 НОВЫХ" size={64} t={t} />}>
			<OldCrackField />
			<Actor who="mama" x={750} floor={FL} s={HS} facing={1} uid="m158" pose={mp} faceTurn={0.1} mouth="smile" />
			<Hero x={lerp(960, 880, hug)} facing={-1} big fist="skin" uid="h158" pose={reach(reach({...idle(f, 1), lean: 6}, 'F', toLocal(715, 650, lerp(960, 880, hug), hip(HS), HS, -1), hug), 'B', toLocal(715, 710, lerp(960, 880, hug), hip(HS), HS, -1), hug)} expr="normal" mouth="smile" />
		</Evening>
	);
};
export const S159: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('159');
	const lean = kk(t, 4, 24);
	return (
		<Evening f={f} from={[820, 600, 1.5]} to={[820, 600, 1.9]}>
			<Actor who="mama" x={770} floor={FL} s={HS} facing={1} uid="m159" pose={{...reach(reach(idle(f, 5), 'F', toLocal(980, 650, 770, hip(HS), HS, 1), 1), 'B', toLocal(980, 700, 770, hip(HS), HS, 1), 1), lean: 12 * lean, head: 16 * lean}} faceTurn={0.1} mouth="smile" blink={1} />
			<Hero x={850} facing={-1} uid="h159" pose={reach(reach({...idle(f, 1), lean: 4}, 'F', toLocal(730, 650, 850, hip(HS), HS, -1), 1), 'B', toLocal(730, 710, 850, hip(HS), HS, -1), 1)} expr="normal" mouth="smile" />
		</Evening>
	);
};
export const S160: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('160');
	const close = kk(t, 44, 66);
	const pose = reach({...idle(f, 1), lean: 4}, 'F', [96, -52], 1);
	const [px, py] = frontHand(pose, 700, hip(HS), HS, 1);
	return (
		<Scene from={camOn(840, 660, 1.2)} to={camOn(860, 660, 1.6)}>
			<Layer depth={1}><NewRoof f={f} crack={99} crumble={1} /></Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={700} uid="h160" pose={pose} expr="smile" mouth="smile" look={[0.7, 0.6]} />
					{close < 0.5 ? <Palm x={px + 6} y={py} ang={0} /> : <Fist at={[px + 6, py + 10]} ang={-90} k="skin" size={2.2} />}
					<Chick x={px + 6 + 8 * close} y={py - (close < 0.5 ? 8 : 40 * close)} s={1.9} band flap={Math.sin(t / 6) * 0.2} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export const S161: React.FC = () => {
	const {f, at} = useShot();
	const t = f - at('161');
	const pose = reach({...idle(f, 1), lean: 2}, 'F', [70, -128], 1);
	const [px, py] = frontHand(pose, 960, 1040 - 157 * 1.0, 1.0, 1);
	return (
		<Scene from={camOn(960, 640, 1.0)} to={camOn(960, 650, 1.08)} bg="#ffe9c8" ov={<Plate x={960} y={70} w={1700} h={300} text="Что тебе страшно сломать, если ты сильный?" size={96} t={t - 4} />}>
			<Layer depth={1}><NewRoof f={f} crack={99} crumble={1} /></Layer>
			<Layer depth={1}>
				<Svg>
					<Hero x={960} s={1.0} floor={1040} uid="h161" pose={pose} expr="smile" mouth="smile" look={[0.5, -0.6]} />
					<Fist at={[px + 4, py + 4]} ang={-90} k="skin" size={2.4} />
					<Chick x={px + 6} y={py - 36} s={2.2} band flap={Math.sin(t / 8) * 0.12} />
				</Svg>
			</Layer>
		</Scene>
	);
};
export {Egg, SIT, Chick};
