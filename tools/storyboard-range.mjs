// Storyboard sheets for a time range: a frame every N seconds, 12 frames (4x3) per file.
//   node tools/storyboard-range.mjs --secs 1.3,13.8,51.3 --name chg   (chosen moments, in seconds)
//   node tools/storyboard-range.mjs --to 148 --every 2.5 [--from 0] [--per 12] [--name sb]
// Output: out/<name>_1.jpg, out/<name>_2.jpg ... (open them and LOOK at them).
import path from 'node:path';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {ROOT, say} from './lib.mjs';
const require = createRequire(path.join(ROOT, 'package.json'));
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderStill} = require('@remotion/renderer');
const a = process.argv.slice(2);
const val = (k, d) => (a.includes(k) ? Number(a[a.indexOf(k) + 1]) : d);
const name = a.includes('--name') ? a[a.indexOf('--name') + 1] : 'sb';
const from = val('--from', 0), to = val('--to', 148), every = val('--every', 2.5), per = val('--per', 12);
let frames = [];
if (a.includes('--secs')) frames = a[a.indexOf('--secs') + 1].split(',').map((x) => Math.round(Number(x) * 30));
else for (let t = from + every / 2; t < to; t += every) frames.push(Math.round(t * 30));
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts')});
fs.mkdirSync(path.join(ROOT, 'out'), {recursive: true});
for (let i = 0; i * per < frames.length; i++) {
	const part = frames.slice(i * per, (i + 1) * per);
	const props = {comp: 'Long', frames: part, cols: 4, title: `${name} ${i + 1}: ${(part[0] / 30).toFixed(1)}–${(part[part.length - 1] / 30).toFixed(1)} с, кадр каждые ${every} с`};
	const sheet = await selectComposition({serveUrl, id: 'Sheet', inputProps: props, chromiumOptions: {gl: 'angle'}});
	const output = path.join(ROOT, 'out', `${name}_${i + 1}.jpg`);
	await renderStill({composition: sheet, serveUrl, output, inputProps: props, imageFormat: 'jpeg', jpegQuality: 82, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 300000});
	say(`sheet ${i + 1}: ${path.relative(ROOT, output)} (${part.length} frames)`);
}
