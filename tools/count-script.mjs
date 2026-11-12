// Counts voiced words/characters in script.md: only lines "**N|HERO|LEHA|COACH|MAMA:** text".
// Bubbles (*Облачко*) and [notes] are not counted. Flags lines over the limits (N 25, others 10).
//   node tools/count-script.mjs [script.md]
import fs from 'node:fs';
const t = fs.readFileSync(process.argv[2] ?? 'script.md', 'utf8');
const re = /^\*\*(N|HERO|LEHA|COACH|MAMA):\*\* (.+)$/gm;
let words = 0, chars = 0, n = 0;
const per = {};
for (const m of t.matchAll(re)) {
	const w = m[2].replace(/—/g, ' ').split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
	words += w; chars += m[2].length; n++;
	per[m[1]] = (per[m[1]] ?? 0) + w;
	if (w > (m[1] === 'N' ? 25 : 10)) console.log(`OVER ${m[1]} ${w}: ${m[2]}`);
}
console.log(`lines ${n}, words ${words}, chars ${chars}`, per);
