// Procedural sound bed for a video: ambience, action foley and (only if wanted) music,
// placed by line ids from the timeline. Voice is NOT in here — tools/mix-audio.mjs adds it.
// node tools/make-sound.mjs [timeline=src/story/timeline.json] [spec=src/story/sound.json] [out=public/sfx/bed.wav]
import path from 'node:path';
import fs from 'node:fs';

const SR = 32000;
const TL_FILE = process.argv[2] ?? 'src/story/timeline.json';
const SPEC_FILE = process.argv[3] ?? 'src/story/sound.json';
const OUT_FILE = process.argv[4] ?? 'public/sfx/bed.wav';
const TL = JSON.parse(fs.readFileSync(TL_FILE, 'utf8'));
const SPEC = fs.existsSync(SPEC_FILE) ? JSON.parse(fs.readFileSync(SPEC_FILE, 'utf8')) : {};
const FPS = TL.fps;
const DUR = TL.total / FPS;
const N = Math.ceil(DUR * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const REV = new Float32Array(N);

const line = (p) => TL.lines.find((l) => l.id.startsWith(p));
const ts = (p, offFrames = 0) => (line(p).from + offFrames) / FPS;
const te = (p) => (line(p).from + line(p).dur) / FPS;

let seed = 99;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = () => rnd() * 2 - 1;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const sm = (t, a, b) => clamp01((t - a) / (b - a));
const put = (i, v, pan = 0, rev = 0) => {
	if (i < 0 || i >= N) return;
	const gl = Math.cos(((pan + 1) * Math.PI) / 4);
	const gr = Math.sin(((pan + 1) * Math.PI) / 4);
	L[i] += v * gl;
	R[i] += v * gr;
	REV[i] += v * rev;
};
class LP {
	constructor() { this.y = 0; }
	f(x, fc) { this.y += (1 - Math.exp((-2 * Math.PI * fc) / SR)) * (x - this.y); return this.y; }
}
class BP {
	constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; }
	f(x, fc, q) {
		const w = (2 * Math.PI * fc) / SR, al = Math.sin(w) / (2 * q), a0 = 1 + al;
		const y = (al * x - al * this.x2 + 2 * Math.cos(w) * this.y1 - (1 - al) * this.y2) / a0;
		this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y;
	}
}
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

/* ------------------------------- voice ducking ------------------------------- */
const voice = new Float32Array(Math.ceil(DUR * 100));
for (const l of TL.lines) for (let k = Math.floor((l.from / FPS) * 100); k < ((l.from + l.dur) / FPS) * 100; k++) voice[k] = 1;
const duckAt = (t) => {
	let v = 0;
	const c = Math.floor(t * 100);
	for (let k = c - 25; k <= c + 10; k++) if (voice[k]) { v = 1; break; }
	return v;
};

/* --------------------------------- instruments -------------------------------- */
// Karplus-Strong pluck (pizzicato / piano-ish when long)
const pluck = (t0, midi, amp, decay = 0.996, pan = 0, rev = 0.25, bright = 0.5, len = 1.2) => {
	const f = mtof(midi);
	const P = Math.max(2, Math.round(SR / f));
	const buf = new Float32Array(P);
	for (let i = 0; i < P; i++) buf[i] = noise() * (0.5 + bright * 0.5);
	const i0 = Math.floor(t0 * SR);
	let idx = 0, prev = 0;
	const n = Math.floor(len * SR);
	for (let j = 0; j < n; j++) {
		const v = buf[idx];
		const nv = decay * (0.5 * (v + prev));
		prev = v;
		buf[idx] = nv;
		idx = (idx + 1) % P;
		const env = Math.min(1, j / 40) * (j > n - 800 ? (n - j) / 800 : 1);
		put(i0 + j, v * amp * env, pan, rev);
	}
};
const kick = (t0, amp = 0.5) => {
	const i0 = Math.floor(t0 * SR);
	let p = 0;
	for (let j = 0; j < 0.3 * SR; j++) {
		const t = j / SR;
		p += (2 * Math.PI * (45 + 90 * Math.exp(-t * 28))) / SR;
		put(i0 + j, Math.sin(p) * Math.exp(-t * 9) * amp);
	}
};
const hat = (t0, amp = 0.08, open = false) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP();
	const len = open ? 0.18 : 0.05;
	for (let j = 0; j < len * SR; j++) put(i0 + j, b.f(noise(), 8000, 0.8) * Math.exp(-(j / SR) / (len / 4)) * amp * 3, 0.25);
};
const snare = (t0, amp = 0.2) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP();
	for (let j = 0; j < 0.2 * SR; j++) {
		const t = j / SR;
		put(i0 + j, (b.f(noise(), 2200, 0.7) * 2 + Math.sin(2 * Math.PI * 190 * t) * 0.6) * Math.exp(-t * 22) * amp, -0.1, 0.2);
	}
};
const pad = (t0, t1, midis, amp, cutoff = 900, pan = 0) => {
	const i0 = Math.floor(t0 * SR), i1 = Math.floor(t1 * SR);
	const lps = midis.map(() => new LP());
	const ph = midis.map(() => [rnd(), rnd()]);
	for (let i = i0; i < i1; i++) {
		const t = (i - i0) / SR;
		const env = Math.min(1, t / 1.5) * Math.min(1, (i1 - i) / SR / 1.5);
		let v = 0;
		midis.forEach((m, k) => {
			const f = mtof(m);
			ph[k][0] = (ph[k][0] + (f * 1.003) / SR) % 1;
			ph[k][1] = (ph[k][1] + (f * 0.997) / SR) % 1;
			v += lps[k].f(ph[k][0] * 2 - 1 + ph[k][1] * 2 - 1, cutoff);
		});
		put(i, (v / midis.length) * amp * env, pan, 0.4);
	}
};

/* ---------------------------------- music ---------------------------------- */
// quirky pizzicato theme (C major), ducked under voice
const PIZZ_MEL = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 74, 71];
const PIZZ_BASS = [48, 48, 53, 53, 48, 48, 55, 55];
const pizzSection = (t0, t1, bpm = 104, amp = 0.26) => {
	const beat = 60 / bpm;
	let k = 0;
	for (let t = t0; t < t1 - 0.5; t += beat / 2, k++) {
		const fade = Math.min(sm(t, t0, t0 + 2), 1 - sm(t, t1 - 2, t1));
		const duck = duckAt(t) ? 0.45 : 1;
		const a = amp * fade * duck;
		if (a < 0.003) continue;
		if (k % 2 === 0) pluck(t, PIZZ_BASS[(k / 2) % PIZZ_BASS.length], a * 1.3, 0.992, -0.2, 0.15, 0.3, 0.6);
		const m = PIZZ_MEL[k % PIZZ_MEL.length];
		if (k % 4 !== 3) pluck(t, m, a * (k % 4 === 0 ? 0.9 : 0.6), 0.99, 0.3, 0.3, 0.6, 0.4);
		if (k % 8 === 4) pluck(t + beat / 4, m + 7, a * 0.4, 0.99, 0.5, 0.35, 0.7, 0.3);
	}
};
const discoSection = (t0, t1, amp = 0.26) => {
	const bpm = 122, beat = 60 / bpm;
	const bass = [36, 36, 48, 36, 39, 39, 51, 39, 34, 34, 46, 34, 41, 41, 53, 41];
	let k = 0;
	for (let t = t0; t < t1; t += beat / 2, k++) {
		const fade = Math.min(sm(t, t0, t0 + 1), 1 - sm(t, t1 - 0.4, t1));
		const duck = duckAt(t) ? 0.5 : 1;
		const a = amp * fade * duck;
		if (k % 2 === 0) kick(t, a * 1.2);
		hat(t + (k % 2 ? 0 : beat / 4), a * 0.5, k % 2 === 1);
		if (k % 4 === 2) snare(t, a * 0.6);
		pluck(t, bass[k % 16], a * 0.9, 0.985, 0, 0.05, 0.9, 0.3);
		if (k % 8 === 0) {
			const ch = [[60, 63, 67], [58, 62, 65], [56, 60, 63], [58, 62, 65]][Math.floor(k / 8) % 4];
			ch.forEach((m, i) => pluck(t, m + 12, a * 0.3, 0.995, -0.4 + i * 0.4, 0.4, 0.8, 0.9));
		}
	}
};
const pianoSection = (t0, t1, amp = 0.2) => {
	const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
	const bar = 3.2;
	let k = 0;
	for (let t = t0; t < t1 - 1; t += bar, k++) {
		const fade = Math.min(sm(t, t0, t0 + 3), 1 - sm(t, t1 - 3, t1));
		const c = chords[k % 4];
		pluck(t, c[0] - 12, amp * fade * 0.9, 0.9993, -0.2, 0.5, 0.25, 3.2);
		c.forEach((m, i) => pluck(t + 0.4 + i * 0.35, m + 12, amp * fade * 0.5, 0.9992, -0.3 + i * 0.3, 0.6, 0.3, 2.8));
		pluck(t + 1.9, c[2] + 12, amp * fade * 0.4, 0.9992, 0.3, 0.6, 0.3, 2.2);
	}
};

/* --------------------------------- ambience --------------------------------- */
const amb = (t0, t1, kind, gain) => {
	const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor(t1 * SR));
	const a = new LP(), b = new LP(), bp = new BP();
	for (let i = i0; i < i1; i++) {
		const t = i / SR;
		const env = Math.min(sm(t, t0, t0 + 1), 1 - sm(t, t1 - 1, t1)) * gain;
		let v = 0;
		if (kind === 'room') v = a.f(noise(), 300) * 0.6;
		if (kind === 'hall') v = bp.f(noise(), 500 + 200 * Math.sin(t * 0.7), 0.6) * 0.5 + a.f(noise(), 200) * 0.4; // murmur
		if (kind === 'night') v = a.f(noise(), 180) * 0.5 + b.f(noise(), 3000) * 0.05;
		if (kind === 'fridge') v = Math.sin(2 * Math.PI * 50 * t) * 0.08 + a.f(noise(), 250) * 0.4;
		if (kind === 'crowd') v = bp.f(noise(), 700 + 300 * Math.sin(t * 1.3), 0.5) * 1.2;
		put(i, v * env, 0, 0.1);
	}
};

/* ------------------------------------ sfx ------------------------------------ */
const blip = (t0, f1, f2, amp, len = 0.12, pan = 0, rev = 0.2) => {
	const i0 = Math.floor(t0 * SR);
	let p = 0;
	for (let j = 0; j < len * SR; j++) {
		const tt = j / SR;
		p += (2 * Math.PI * (f1 + (f2 - f1) * Math.min(1, tt / (len * 0.4)))) / SR;
		put(i0 + j, Math.sin(p) * Math.exp(-tt / (len / 4)) * amp, pan, rev);
	}
};
const click = (t0, amp = 0.35) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP();
	for (let j = 0; j < 0.05 * SR; j++) put(i0 + j, b.f(noise(), 3200, 1.5) * Math.exp(-(j / SR) / 0.006) * amp * 3, 0.1, 0.4);
	blip(t0 + 0.01, 1568, 1568, amp * 0.35, 0.5, 0.1, 0.5); // little chime
	blip(t0 + 0.01, 2349, 2349, amp * 0.2, 0.4, 0.1, 0.5);
};
const whoosh = (t0, dur, fa, fb, amp, rev = false) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP();
	for (let j = 0; j < dur * SR; j++) {
		const u = j / (dur * SR);
		const env = rev ? u ** 2.5 : Math.sin(Math.PI * u) ** 2;
		put(i0 + j, b.f(noise(), fa + (fb - fa) * u, 1.1) * env * amp * 2.5, 0, 0.3);
	}
};
const ring = (t0, t1, amp = 0.12) => {
	for (let t = t0; t < t1; t += 0.5)
		for (let j = 0; j < 0.3 * SR; j++) {
			const tt = j / SR;
			put(Math.floor(t * SR) + j, Math.sign(Math.sin(2 * Math.PI * 1800 * tt)) * (Math.floor(tt * 24) % 2) * amp * 0.5, 0.2, 0.1);
		}
};
const siren = (t0, t1, amp, f0 = 700) => {
	const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor(t1 * SR));
	let p = 0;
	for (let i = i0; i < i1; i++) {
		const t = i / SR;
		p += (2 * Math.PI * (f0 + 250 * Math.sin(t * 2 * Math.PI * 0.6))) / SR;
		const env = Math.min(sm(t, t0, t0 + 0.5), 1 - sm(t, t1 - 0.8, t1));
		put(i, (Math.sin(p) * 0.7 + Math.sin(p * 2) * 0.2) * amp * env, 0.2, 0.3);
	}
};
const alarmBeeps = (t0, t1, amp) => {
	for (let t = t0; t < t1; t += 0.9) { blip(t, 980, 980, amp, 0.35, 0, 0.3); blip(t + 0.4, 820, 820, amp, 0.35, 0, 0.3); }
};
const crackle = (t0, t1, amp) => {
	for (let t = t0; t < t1; t += 0.02 + rnd() * 0.08) {
		const i0 = Math.floor(t * SR), a = amp * (0.3 + rnd());
		for (let j = 0; j < 0.01 * SR; j++) put(i0 + j, noise() * Math.exp(-(j / SR) / 0.002) * a, (rnd() - 0.5) * 0.6, 0.2);
	}
};
const heartbeat = (t0, t1, amp) => {
	for (let t = t0; t < t1; t += 0.9) { kick(t, amp); kick(t + 0.22, amp * 0.7); }
};

const clap = (t0, amp = 0.2) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP();
	for (let j = 0; j < 0.08 * SR; j++) put(i0 + j, b.f(noise(), 1400, 0.9) * Math.exp(-(j / SR) / 0.012) * amp * 3, 0, 0.2);
};
const buzz = (t0, t1, amp) => {
	for (let i = Math.floor(t0 * SR); i < t1 * SR; i++) {
		const t = i / SR;
		put(i, Math.sign(Math.sin(2 * Math.PI * 100 * t)) * amp * (rnd() > 0.02 ? 1 : 0) * Math.min(sm(t, t0, t0 + 0.05), 1 - sm(t, t1 - 0.1, t1)), 0, 0.1);
	}
};

/* breakage foley: crunch (dry crack of wood/plastic/concrete), tink (glass), gong, smack (egg on a hard surface) */
const crunch = (t0, amp = 0.35) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP(), lp = new LP();
	for (let j = 0; j < 0.22 * SR; j++) {
		const tt = j / SR;
		const burst = (Math.floor(tt * 90) % 3 === 0 ? 1 : 0.35) * Math.exp(-tt / 0.06);
		put(i0 + j, (b.f(noise(), 1700, 0.9) * 2.4 * burst + lp.f(noise(), 260) * 1.2 * Math.exp(-tt / 0.03) + Math.sin(2 * Math.PI * 95 * tt) * Math.exp(-tt / 0.05) * 0.8) * amp, 0, 0.12);
	}
};
const tink = (t0, amp = 0.2) => {
	const i0 = Math.floor(t0 * SR);
	const fr = [2637, 3951, 5274, 6720];
	for (let j = 0; j < 0.9 * SR; j++) {
		const tt = j / SR;
		let v = 0;
		fr.forEach((f, k) => { v += Math.sin(2 * Math.PI * f * (1 + 0.003 * k) * tt) * Math.exp(-tt / (0.32 - k * 0.06)) / (k + 1); });
		put(i0 + j, v * amp * Math.min(1, j / 20), 0.15, 0.45);
	}
};
const gong = (t0, amp = 0.25) => {
	const i0 = Math.floor(t0 * SR);
	const part = [[1, 1], [1.51, 0.7], [2.01, 0.6], [2.76, 0.45], [4.1, 0.25], [5.43, 0.15]];
	for (let j = 0; j < 4.2 * SR; j++) {
		const tt = j / SR;
		let v = 0;
		part.forEach(([r, a], k) => { v += Math.sin(2 * Math.PI * 130 * r * tt + Math.sin(tt * 5 + k) * 0.4) * a * Math.exp(-tt / (2.2 - k * 0.25)); });
		put(i0 + j, v * amp * 0.5 * Math.min(1, j / 150), 0, 0.5);
	}
	smackNoise(t0, amp * 0.5);
};
const smackNoise = (t0, amp) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP();
	for (let j = 0; j < 0.04 * SR; j++) put(i0 + j, b.f(noise(), 2400, 0.8) * Math.exp(-(j / SR) / 0.008) * amp * 3, 0, 0.1);
};
const smack = (t0, amp = 0.5) => {
	const i0 = Math.floor(t0 * SR);
	const b = new BP(), c = new BP();
	for (let j = 0; j < 0.3 * SR; j++) {
		const tt = j / SR;
		const wet = c.f(noise(), 380 + 120 * Math.sin(tt * 90), 1.1) * Math.exp(-tt / 0.07) * (tt > 0.02 ? 1 : 0);
		put(i0 + j, (b.f(noise(), 900, 0.7) * 3 * Math.exp(-tt / 0.012) + Math.sin(2 * Math.PI * 70 * tt) * Math.exp(-tt / 0.05) * 1.2 + wet * 1.6) * amp, 0, 0.15);
	}
};
const peep = (t0, amp = 0.05) => {
	const i0 = Math.floor(t0 * SR);
	for (let j = 0; j < 0.14 * SR; j++) {
		const tt = j / SR;
		put(i0 + j, Math.sin(2 * Math.PI * (3600 + 1200 * Math.sin(tt * 38)) * tt) * Math.exp(-tt * 14) * amp, 0.1, 0.25);
	}
};
/* wings (pigeons taking off / landing): bursts of band-passed noise, fast flaps that thin out, a few feather ticks */
const flutter = (t0, dur, amp = 0.06) => {
	for (let t = 0, k = 0; t < dur; k++) {
		const u = t / dur;
		const i0 = Math.floor((t0 + t) * SR), b = new BP(), pan = (rnd() - 0.5) * 0.8;
		const f0 = 1400 + 1800 * rnd();
		for (let j = 0; j < 0.05 * SR; j++) put(i0 + j, b.f(noise(), f0, 1.2) * Math.exp(-(j / SR) / 0.014) * amp * 3 * (1 - u * 0.7) * (0.6 + 0.4 * rnd()), pan, 0.2);
		t += (0.055 + 0.07 * u) * (0.8 + 0.4 * rnd());
	}
};
/* water hissing from a broken tap: bright noise with a slow ripple */
const hiss = (t0, dur, amp = 0.05) => {
	const i0 = Math.floor(t0 * SR), b = new BP(), c = new LP();
	for (let j = 0; j < dur * SR; j++) {
		const tt = j / SR;
		const env = Math.min(sm(tt, 0, 0.12), 1 - sm(tt, dur - 0.3, dur));
		put(i0 + j, (b.f(noise(), 5200 + 800 * Math.sin(tt * 9), 0.6) * 1.6 + (noise() - c.f(noise(), 3000)) * 0.4) * (0.8 + 0.2 * Math.sin(tt * 23)) * env * amp, Math.sin(tt * 3) * 0.2, 0.15);
	}
};
/* dull hit on a heavy bag; hard slap of a glove */
const bagHit = (t0, amp = 0.2) => {
	const i0 = Math.floor(t0 * SR), lp = new LP();
	for (let j = 0; j < 0.25 * SR; j++) {
		const tt = j / SR;
		put(i0 + j, (Math.sin(2 * Math.PI * (58 + 40 * Math.exp(-tt * 30)) * tt) * Math.exp(-tt / 0.07) * 1.3 + lp.f(noise(), 380) * Math.exp(-tt / 0.03) * 1.5) * amp, -0.1, 0.1);
	}
};
const gloveSlap = (t0, amp = 0.2) => {
	const i0 = Math.floor(t0 * SR), b = new BP(), lp = new LP();
	for (let j = 0; j < 0.18 * SR; j++) {
		const tt = j / SR;
		put(i0 + j, (b.f(noise(), 1500, 0.8) * 3 * Math.exp(-tt / 0.01) + lp.f(noise(), 500) * 1.4 * Math.exp(-tt / 0.035) + Math.sin(2 * Math.PI * 105 * tt) * Math.exp(-tt / 0.04)) * amp, 0.05, 0.2);
	}
};
/* silence: everything already in the bed is faded to nothing in [t0, t1]; the warm return is added afterwards */
const muteWindow = (t0, t1, fade = 0.25) => {
	const a = Math.floor((t0 - fade) * SR), b = Math.floor(t1 * SR);
	for (let i = Math.max(0, a); i < Math.min(N, b); i++) {
		const g = i < t0 * SR ? 1 - (i - a) / (fade * SR) : 0;
		L[i] *= g; R[i] *= g; REV[i] *= g;
	}
};
const warmReturn = (t0, dur = 2.6, gain = 0.05) => {
	const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor((t0 + dur + 4) * SR));
	const a = new LP(), b = new LP();
	for (let i = i0; i < i1; i++) {
		const t = i / SR;
		const env = sm(t, t0, t0 + dur) * (1 - sm(t, t0 + dur + 2, t0 + dur + 4) * 0.4) * gain;
		const hum = (Math.sin(2 * Math.PI * 110 * t) + 0.5 * Math.sin(2 * Math.PI * 165 * t) + 0.3 * Math.sin(2 * Math.PI * 220 * t)) * 0.12;
		put(i, (a.f(noise(), 260) * 0.6 + b.f(noise(), 700) * 0.15 + hum) * env, 0, 0.3);
	}
};

/* ------------------------------ cues from sound.json ------------------------------
   {
     "ambience": [{"from": "001", "to": "006", "kind": "room", "gain": 0.05}],   kinds: room hall night fridge crowd street rain wind sea
     "music":    [{"from": "001", "to": "end", "style": "pizz", "amp": 0.22}],   styles: pizz disco piano pad-tense pad-warm (only if the user wants music)
     "sfx":      [{"at": "004", "off": 12, "type": "click"}]                     at = line id prefix, off = frames into that line
   }
   sfx types: click (counter tick + chime), switch (рубильник/выключатель), splash, pop, ding, whoosh, whooshUp, swoosh, stamp, clap, steps (dur s), buzz (dur),
   heartbeat (dur), alarm (dur), siren (dur), crackle (dur), ring (dur), thud, chat, sent, birds (dur),
   crunch (хрусть), tink (дзынь), break (хрусть + дзынь), gong, smack (шлёп яйца), peep (писк птенца),
   flutter (взлёт/посадка голубей, dur), hiss (вода из крана, dur), bag (глухой удар по мешку), glove (жёсткий шлёп перчатки).
   "silence": [{"from": "140", "to": "141"}] — вся подложка (эмбиент, эффекты, вжухи) гаснет с lead (0,4 с) до начала `to` + until (0,4 с), потом тёплый возврат.
   Auto cues (src/story/auto-cues.json, written by check-plans): whooshes on location changes
   and a click on every counter change — they are added here automatically. */
const tAt = (lineId, off = 0) => (lineId === 'start' ? off / FPS : lineId === 'end' ? DUR - 0.05 : ts(String(lineId).slice(0, 3), off));
const tEnd = (lineId) => (lineId === 'end' ? DUR : ts(String(lineId).slice(0, 3)) - 0.2);
const birds = (t0, t1) => {
	for (let t = t0 + 0.3; t < t1; t += 0.7 + rnd() * 1.6) {
		const i0 = Math.floor(t * SR), f0 = 2800 + rnd() * 1800;
		for (let j = 0; j < 0.12 * SR; j++) {
			const tt = j / SR;
			put(i0 + j, Math.sin(2 * Math.PI * (f0 + 900 * Math.sin(tt * 60)) * tt) * Math.exp(-tt * 18) * 0.03, 0.6 * (rnd() - 0.5), 0.3);
		}
	}
};
const rain = (t0, t1, gain) => {
	const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor(t1 * SR));
	const a = new LP();
	for (let i = i0; i < i1; i++) {
		const t = i / SR;
		const env = Math.min(sm(t, t0, t0 + 1), 1 - sm(t, t1 - 1, t1)) * gain;
		put(i, (noise() - a.f(noise(), 2500)) * 0.6 * env + (rnd() > 0.9995 ? noise() * 2 * env : 0), (rnd() - 0.5) * 0.4, 0.15);
	}
};
const wind = (t0, t1, gain) => {
	const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor(t1 * SR));
	const b = new BP();
	for (let i = i0; i < i1; i++) {
		const t = i / SR;
		const env = Math.min(sm(t, t0, t0 + 1.5), 1 - sm(t, t1 - 1.5, t1)) * gain;
		put(i, b.f(noise(), 300 + 200 * Math.sin(t * 0.4), 0.7) * 1.4 * env, Math.sin(t * 0.3) * 0.5, 0.2);
	}
};
/* waves on a shore: slow swells of filtered noise with a hiss on each break */
const sea = (t0, t1, gain) => {
	const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor(t1 * SR));
	const a = new LP(), b = new LP();
	for (let i = i0; i < i1; i++) {
		const t = i / SR;
		const swell = 0.35 + 0.65 * Math.max(0, Math.sin((t * 2 * Math.PI) / 6.5)) ** 3;
		const env = Math.min(sm(t, t0, t0 + 1.5), 1 - sm(t, t1 - 1.5, t1)) * gain;
		put(i, (a.f(noise(), 400) * 0.9 + (noise() - b.f(noise(), 3000)) * 0.25 * swell) * swell * env * 1.6, Math.sin(t * 0.2) * 0.4, 0.15);
	}
};
const stepsAt = (t0, dur, amp = 0.15, pan = 0) => {
	for (let t = t0; t < t0 + dur; t += 0.28) {
		const i0 = Math.floor(t * SR);
		const lp = new LP();
		for (let j = 0; j < 0.09 * SR; j++) {
			const tt = j / SR;
			put(i0 + j, (Math.sin(2 * Math.PI * 90 * tt) * 0.6 + lp.f(noise(), 900) * 0.8) * Math.exp(-tt / 0.025) * amp, pan, 0.05);
		}
	}
};
for (const a of SPEC.ambience ?? []) {
	const t0 = tAt(a.from) - 0.2, t1 = tEnd(a.to);
	if (a.kind === 'rain') rain(t0, t1, a.gain ?? 0.05);
	else if (a.kind === 'sea' || a.kind === 'surf') sea(t0, t1, a.gain ?? 0.06);
	else if (a.kind === 'wind') wind(t0, t1, a.gain ?? 0.05);
	else if (a.kind === 'street') { amb(t0, t1, 'night', (a.gain ?? 0.06) * 0.8); amb(t0, t1, 'crowd', (a.gain ?? 0.06) * 0.3); }
	else amb(t0, t1, a.kind, a.gain ?? 0.05);
	if (a.birds) birds(t0, t1);
}
for (const m of SPEC.music ?? []) {
	const t0 = tAt(m.from) - 0.3, t1 = tEnd(m.to);
	if (m.style === 'pizz') pizzSection(t0, t1, m.bpm ?? 104, m.amp ?? 0.24);
	else if (m.style === 'disco') discoSection(t0, t1, m.amp ?? 0.24);
	else if (m.style === 'piano') pianoSection(t0, t1, m.amp ?? 0.2);
	else if (m.style === 'pad-tense') pad(t0, t1, [38, 45, 50], m.amp ?? 0.08, 500);
	else pad(t0, t1, [50, 57, 62, 69], m.amp ?? 0.06, 800);
}
const autoFile = 'src/story/auto-cues.json';
const AUTO = fs.existsSync(autoFile) && TL_FILE.endsWith('/timeline.json') ? JSON.parse(fs.readFileSync(autoFile, 'utf8')) : {whips: [], counter: []};
for (const f of AUTO.whips ?? []) whoosh(f / FPS - 0.2, 0.4, 3200, 500, 0.12);

for (const c of AUTO.counter ?? []) {
	click(c.at / FPS, 0.3);
	if (c.roll > 20) for (let i = 0; i < Math.min(20, c.roll / 3); i++) click(c.at / FPS + i * 0.11, 0.1);
}
for (const s of SPEC.sfx ?? []) {
	const t = tAt(s.at, s.off ?? 0);
	const d = s.dur ?? 1;
	const a = s.amp;
	switch (s.type) {
		case 'click': click(t, a ?? 0.32); break;
		case 'pop': blip(t, 500, 1400, a ?? 0.12, 0.18); break;
		case 'ding': blip(t, 1046, 1568, a ?? 0.12, 0.6, 0, 0.5); break;
		case 'chat': blip(t, 1400, 1900, a ?? 0.1, 0.15, 0.2, 0.2); break;
		case 'sent': blip(t, 900, 600, a ?? 0.1, 0.15, 0, 0.2); break;
		case 'whoosh': whoosh(t, d * 0.5, 2600, 500, a ?? 0.14); break;
		case 'whooshUp': whoosh(t, d, 300, 3000, a ?? 0.25); break;
		case 'swoosh': whoosh(t, 0.5, 600, 2400, a ?? 0.12); break;
		case 'stamp': kick(t, a ?? 0.5); clap(t, (a ?? 0.5) * 0.3); break;
		case 'thud': kick(t, a ?? 0.4); break;
		case 'switch': click(t, (a ?? 0.3) * 0.4); kick(t, (a ?? 0.3) * 0.8); break;
		case 'splash': whoosh(t, 0.35, 1800, 300, a ?? 0.16); break;
		case 'clap': clap(t, a ?? 0.22); break;
		case 'steps': stepsAt(t, d, a ?? 0.15, s.pan ?? 0); break;
		case 'buzz': buzz(t, t + d, a ?? 0.012); break;
		case 'heartbeat': heartbeat(t, t + d, a ?? 0.1); break;
		case 'alarm': alarmBeeps(t, t + d, a ?? 0.06); break;
		case 'siren': siren(t, t + d, a ?? 0.03, 650); break;
		case 'crackle': crackle(t, t + d, a ?? 0.05); break;
		case 'ring': ring(t, t + d, a ?? 0.06); break;
		case 'birds': birds(t, t + d); break;
		case 'crunch': crunch(t, a ?? 0.3); break;
		case 'tink': tink(t, a ?? 0.2); break;
		case 'break': crunch(t, a ?? 0.3); tink(t + 0.05, (a ?? 0.3) * 0.6); break;
		case 'gong': gong(t, a ?? 0.25); break;
		case 'smack': smack(t, a ?? 0.45); break;
		case 'flutter': flutter(t, d, a ?? 0.06); break;
		case 'hiss': hiss(t, d, a ?? 0.05); break;
		case 'bag': bagHit(t, a ?? 0.2); break;
		case 'glove': gloveSlap(t, a ?? 0.2); break;
		case 'peep': peep(t, a ?? 0.05); break;
		default: console.warn('unknown sfx type', s.type);
	}
}

for (const q of SPEC.silence ?? []) {
	const t0 = tAt(q.from) - (q.lead ?? 0.4), t1 = tAt(q.to) + (q.until ?? 0.4);
	muteWindow(t0, t1, q.fade ?? 0.25);
	warmReturn(t1 - 0.2, q.ret ?? 2.6, q.gain ?? 0.05);
	birds(t1 + 0.4, t1 + 3);
}

/* ---------------------------------- mixdown ---------------------------------- */
const out = (() => {
	const combs = [1117, 1188, 1277, 1356].map((d) => ({d, b: new Float32Array(d), i: 0}));
	const aps = [225, 556].map((d) => ({d, b: new Float32Array(d), i: 0}));
	const lp = new LP();
	let peak = 0;
	for (let n = 0; n < N; n++) {
		let s = 0;
		const x = lp.f(REV[n], 4000);
		for (const c of combs) { const y = c.b[c.i]; c.b[c.i] = x + y * 0.8; c.i = (c.i + 1) % c.d; s += y; }
		for (const a of aps) { const y = a.b[a.i]; a.b[a.i] = s + y * 0.5; a.i = (a.i + 1) % a.d; s = y - s * 0.5; }
		const t = n / SR;
		const fade = sm(t, 0, 0.3) * (1 - sm(t, DUR - 1.5, DUR));
		L[n] = Math.tanh((L[n] + s * 0.1) * 1.2) * fade;
		R[n] = Math.tanh((R[n] + s * 0.1) * 1.2) * fade;
		peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
	}
	return peak;
})();
const g = Math.min(0.5 / out, 1.6); // peak at -6 dB; quiet beds are not blown up // leave headroom: the voice sits on top of this bed
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4); }
fs.mkdirSync(path.dirname(OUT_FILE), {recursive: true});
fs.writeFileSync(OUT_FILE, buf);
console.log('bed', DUR.toFixed(1), 's peak', out.toFixed(3));
