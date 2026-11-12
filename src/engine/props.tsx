import React from 'react';
import {darken, lighten} from './color';

// Desk: (x, y) = top-left corner of the desktop slab.
export const Desk: React.FC<{x: number; y: number; w?: number; h?: number; top?: string; body?: string; front?: boolean}> = ({
	x,
	y,
	w = 300,
	h = 170,
	top = '#e2b67e',
	body = '#4b5161',
	front = false,
}) => (
	<g>
		<rect x={x + 16} y={y + 18} width={10} height={h} fill={darken(body, 0.25)} />
		<rect x={x + w - 26} y={y + 18} width={10} height={h} fill={darken(body, 0.25)} />
		{front ? <rect x={x + 6} y={y + 16} width={w - 12} height={h * 0.62} rx={4} fill={body} /> : <rect x={x + 10} y={y + 16} width={w - 20} height={56} rx={3} fill={body} />}
		{front ? <rect x={x + 6} y={y + 16} width={w - 12} height={8} fill={lighten(body, 0.15)} /> : null}
		<rect x={x} y={y} width={w} height={20} rx={4} fill={top} />
		<rect x={x} y={y} width={w} height={6} rx={3} fill={lighten(top, 0.25)} />
		<rect x={x} y={y + 16} width={w} height={4} fill={darken(top, 0.2)} />
	</g>
);

// Chair: (x, y) = seat center.
export const Chair: React.FC<{x: number; y: number; facing?: 1 | -1; seat?: string; leg?: string}> = ({x, y, facing = 1, seat = '#c99a62', leg = '#2c2f38'}) => (
	<g transform={`translate(${x},${y}) scale(${facing},1)`}>
		<rect x={-52} y={-150} width={12} height={150} fill={leg} />
		<rect x={-58} y={-150} width={22} height={74} rx={5} fill={seat} />
		<rect x={-48} y={6} width={9} height={128} fill={leg} />
		<rect x={42} y={6} width={9} height={128} fill={leg} />
		<rect x={-58} y={-6} width={116} height={16} rx={5} fill={seat} />
		<rect x={-58} y={-6} width={116} height={5} rx={3} fill={lighten(seat, 0.25)} />
	</g>
);

export const Bottle: React.FC<{x: number; y: number; c: string}> = ({x, y, c}) => (
	<g>
		<rect x={x - 9} y={y - 48} width={18} height={48} rx={4} fill={c} />
		<rect x={x - 9} y={y - 54} width={18} height={9} rx={2} fill={darken(c, 0.3)} />
		<rect x={x - 5} y={y - 40} width={4} height={30} rx={2} fill={lighten(c, 0.4)} opacity={0.7} />
	</g>
);

export const Badge: React.FC<{x: number; y: number; text: string; border: string; s?: number}> = ({x, y, text, border, s = 1}) => {
	const w = text.length * 19 + 36;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<rect x={-w / 2 - 4} y={-26} width={w + 8} height={52} rx={14} fill={border} />
			<rect x={-w / 2} y={-22} width={w} height={44} rx={11} fill="#23232a" />
			<text x={0} y={10} textAnchor="middle" fontFamily="'Rubik', sans-serif" fontWeight={900} fontSize={28} fill={lighten(border, 0.45)} letterSpacing={1}>
				{text}
			</text>
		</g>
	);
};

/* Pigeon: (x, y) = feet on the perch, faces +x. wing 0..1 flaps. */
export const Pigeon: React.FC<{x: number; y: number; s?: number; facing?: 1 | -1; wing?: number; body?: string}> = ({x, y, s = 1, facing = 1, wing = 0, body = '#8f99ad'}) => (
	<g transform={`translate(${x},${y}) scale(${s * facing},${s})`}>
		<line x1={-4} y1={-16} x2={-5} y2={0} stroke="#e8708a" strokeWidth={3} strokeLinecap="round" />
		<line x1={6} y1={-16} x2={7} y2={0} stroke="#e8708a" strokeWidth={3} strokeLinecap="round" />
		<path d="M-34,-34 L-52,-22 L-34,-24 Z" fill={darken(body, 0.3)} />
		<ellipse cx={0} cy={-34} rx={34} ry={20} fill={body} />
		<ellipse cx={22} cy={-44} rx={14} ry={11} fill="#3f9d8e" />
		<circle cx={32} cy={-56} r={13} fill={lighten(body, 0.15)} />
		<path d="M43,-57 L56,-53 L43,-51 Z" fill="#f2b45a" />
		<circle cx={36} cy={-58} r={3.2} fill="#111" />
		<path d={`M-18,-38 Q-2,${-62 - wing * 40} 16,-38 Q0,${-26 + wing * 10} -18,-38 Z`} fill={darken(body, 0.22)} />
	</g>
);

/* Chick (a young pigeon): a separate item. (x, y) = feet. Sparse pale down, big beak, bare pink skin. */
export const Chick: React.FC<{x: number; y: number; s?: number; facing?: 1 | -1; flap?: number; band?: boolean}> = ({x, y, s = 1, facing = 1, flap = 0, band}) => (
	<g transform={`translate(${x},${y}) scale(${s * facing},${s})`}>
		<line x1={-4} y1={-8} x2={-5} y2={0} stroke="#f0a8a0" strokeWidth={3} strokeLinecap="round" />
		<line x1={5} y1={-8} x2={6} y2={0} stroke="#f0a8a0" strokeWidth={3} strokeLinecap="round" />
		{band ? <rect x={3} y={-6} width={6} height={5} rx={1.5} fill="#17b3c4" stroke="#0b6a74" strokeWidth={1} /> : null}
		<ellipse cx={0} cy={-20} rx={18} ry={15} fill="#d8c27c" stroke="#7a6a3c" strokeWidth={2} />
		<path d="M-16,-26 Q-2,-30 12,-16" fill="none" stroke="#f0a8a0" strokeWidth={4} strokeLinecap="round" />
		<g stroke="#b59e5a" strokeWidth={2} strokeLinecap="round">
			<line x1={-8} y1={-34} x2={-11} y2={-41} />
			<line x1={0} y1={-35} x2={0} y2={-43} />
			<line x1={8} y1={-33} x2={11} y2={-40} />
		</g>
		<circle cx={12} cy={-32} r={10} fill="#d8c27c" stroke="#7a6a3c" strokeWidth={2} />
		<path d="M20,-33 L33,-29 L20,-26 Z" fill="#f2a24a" />
		<circle cx={15} cy={-35} r={3.3} fill="#111" />
		<path d={`M-10,-20 Q-26,${-26 - flap * 14} -22,-10 Q-14,-12 -10,-20 Z`} fill="#f0a8a0" />
	</g>
);
