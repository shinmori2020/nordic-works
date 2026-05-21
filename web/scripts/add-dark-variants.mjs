/**
 * 既存の .tsx に Tailwind の dark: バリアントを機械的に付与する一回限りのスクリプト。
 *
 * zinc パレットの light 用クラスに対応する dark: クラスを末尾に追記する。
 * すでに dark: 対応済みのファイル（手書きで付与済み）は除外する。
 *
 * 使い方:  node scripts/add-dark-variants.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** src 配下の .tsx を再帰収集する */
function collectTsx(dir) {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...collectTsx(full));
		else if (entry.name.endsWith('.tsx')) out.push(full);
	}
	return out;
}

// すでに dark: を手書きで入れたファイルは除外（二重付与防止）
const EXCLUDE = [
	'layout.tsx',
	'about/page.tsx',
	'contact/page.tsx',
	'ContactForm.tsx',
	'Header.tsx',
	'ThemeToggle.tsx',
	'ThemeProvider.tsx',
];

// 変換規則。lookbehind (?<![:-]) で variant 接頭辞付き・既存 dark: クラスを除外する。
const RULES = [
	// hover 系。(?<!dark:) で「挿入済みの dark:hover:...」を再マッチしないようにする。
	[/(?<!dark:)\bhover:bg-zinc-50\b/g, 'hover:bg-zinc-50 dark:hover:bg-zinc-900'],
	[/(?<!dark:)\bhover:bg-zinc-100\b/g, 'hover:bg-zinc-100 dark:hover:bg-zinc-800'],
	[/(?<!dark:)\bhover:bg-zinc-200\b/g, 'hover:bg-zinc-200 dark:hover:bg-zinc-700'],
	[/(?<!dark:)\bhover:bg-zinc-700\b/g, 'hover:bg-zinc-700 dark:hover:bg-zinc-300'],
	[/(?<!dark:)\bhover:bg-white\b/g, 'hover:bg-white dark:hover:bg-zinc-900'],
	[/(?<!dark:)\bhover:text-zinc-900\b/g, 'hover:text-zinc-900 dark:hover:text-zinc-100'],
	[/(?<!dark:)\bhover:border-zinc-400\b/g, 'hover:border-zinc-400 dark:hover:border-zinc-500'],
	// base text
	[/(?<![:-])\btext-zinc-900\b/g, 'text-zinc-900 dark:text-zinc-100'],
	[/(?<![:-])\btext-zinc-800\b/g, 'text-zinc-800 dark:text-zinc-200'],
	[/(?<![:-])\btext-zinc-700\b/g, 'text-zinc-700 dark:text-zinc-300'],
	[/(?<![:-])\btext-zinc-600\b/g, 'text-zinc-600 dark:text-zinc-400'],
	[/(?<![:-])\btext-zinc-300\b/g, 'text-zinc-300 dark:text-zinc-600'],
	[/(?<![:-])\btext-white\b/g, 'text-white dark:text-zinc-900'],
	// base bg
	[/(?<![:-])\bbg-white\b/g, 'bg-white dark:bg-zinc-950'],
	[/(?<![:-])\bbg-zinc-50\b/g, 'bg-zinc-50 dark:bg-zinc-900'],
	[/(?<![:-])\bbg-zinc-100\b/g, 'bg-zinc-100 dark:bg-zinc-800'],
	[/(?<![:-])\bbg-zinc-900\b/g, 'bg-zinc-900 dark:bg-zinc-100'],
	// borders
	[/(?<![:-])\bborder-zinc-200\b/g, 'border-zinc-200 dark:border-zinc-800'],
	[/(?<![:-])\bborder-zinc-300\b/g, 'border-zinc-300 dark:border-zinc-700'],
];

const files = collectTsx('src');
let changed = 0;

for (const file of files) {
	if (EXCLUDE.some((ex) => file.replace(/\\/g, '/').endsWith(ex))) continue;
	const before = readFileSync(file, 'utf8');
	let after = before;
	for (const [re, to] of RULES) after = after.replace(re, to);
	if (after !== before) {
		writeFileSync(file, after);
		changed++;
		console.log('updated:', file);
	}
}
console.log(`\nDone. ${changed} files changed.`);
