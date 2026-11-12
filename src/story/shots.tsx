import React from 'react';
import {Actor} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn} from '../kit/kit';
import {FONT} from '../kit/ui';
import {FL, HS} from './common';

/* Empty story: one placeholder shot with the hero from cast.ts so the project builds and renders.
   Replace with real scenes (shots*.tsx) once the script and voice-over exist. */
const Empty: React.FC = () => (
	<Stage cam={camOn(960, 560, 1)} bg="#2a3550">
		<Layer depth={1}>
			<Svg>
				<rect x={0} y={FL} width={1920} height={180} fill="#1a2238" />
				<text x={960} y={300} textAnchor="middle" fontSize={96} fontFamily={FONT} fontWeight={800} fill="#fff">TYSON</text>
				<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0} uid="h0" />
			</Svg>
		</Layer>
	</Stage>
);

export const SHOTS: ShotDef[] = [{at: '001', C: Empty}];
