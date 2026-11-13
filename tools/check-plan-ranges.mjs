// Checks every render range against the timeline BEFORE a CI run: ids are numbered 001..N without gaps, each part's range
// plans successfully, chunks cover the range without holes, and the whole video plans as lines and as frames.
//   node tools/check-plan-ranges.mjs
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const TL = JSON.parse(fs.readFileSync('src/story/timeline.json', 'utf8'));
const ids = TL.lines.map((l) => parseInt(l.id, 10));
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL: ' + m); };
ids.forEach((n, i) => { if (n !== i + 1) fail(`line ${i} has number ${n}, expected ${i + 1}`); });
const N = ids.length, pad = (n) => String(n).padStart(3, '0');
const ranges = [`lines:001-011`, `lines:001-${pad(N)}`, 'lines:001-039', 'lines:040-083', 'lines:084-111', 'lines:112-121', 'lines:122-145', 'lines:146-161', `lines:${pad(N)}-${pad(N)}`, `frames:0-${TL.total - 1}`, 'frames:0-3212'];
for (const r of ranges) {
	const out = spawnSync('node', ['tools/plan-chunks.mjs', '--range', r, '--chunk', '150', '--write-timeline', 'out/_range_check.json'], {encoding: 'utf8'});
	if (out.status !== 0) { fail(`${r}: ${out.stderr.trim()}`); continue; }
	const m = /frames (\d+)-(\d+) .* (\d+) chunks/.exec(out.stdout);
	const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
	if (c !== Math.ceil((b - a + 1) / 150)) fail(`${r}: ${c} chunks do not cover frames ${a}-${b}`);
	console.log(`ok   ${r}: frames ${a}-${b}, ${c} chunks`);
}
for (const r of ['lines:162-170', `lines:001-011`]) {
	const out = spawnSync('node', ['tools/plan-chunks.mjs', '--range', r, '--chunk', '150', '--timeline', 'src/story/short-timeline.json'], {encoding: 'utf8'});
	const empty = JSON.parse(fs.readFileSync('src/story/short-timeline.json', 'utf8')).lines.length === 0;
	console.log(`info Short ${r}: ${out.status === 0 ? 'plans' : 'refused'}${empty ? ' (short-timeline.json is the empty scaffold)' : ''}`);
}
console.log(bad ? `${bad} problem(s)` : `OK: ${N} lines numbered 001..${pad(N)}, ${ranges.length} ranges plan correctly`);
process.exit(bad ? 1 : 0);
