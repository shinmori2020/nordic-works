/**
 * 翻訳キャッシュから「失敗エントリ」を除去する。
 *
 * MyMemory がレート制限 (HTTP 429) で失敗した時、
 * scripts/translate-content.mjs は元の JA テキストをキャッシュに保存する
 * （フォールバック保護のため）。これにより、再実行しても
 * 失敗した文は再翻訳されない。
 *
 * このスクリプトは「キー == 値」のエントリを削除し、
 * 次回の translate-content.mjs 実行時に再翻訳されるようにする。
 *
 * Usage:
 *   node scripts/clean-translation-cache.mjs           # 削除実行
 *   node scripts/clean-translation-cache.mjs --dry     # 何件削除されるかだけ確認
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const DRY_RUN = process.argv.includes('--dry');
const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_FILE = path.join(ROOT, 'data', '.translation-cache.json');

const raw = await fs.readFile(CACHE_FILE, 'utf8');
const cache = JSON.parse(raw);

let total = 0;
let removed = 0;
const cleaned = {};

for (const [key, value] of Object.entries(cache)) {
	total += 1;
	if (key === value) {
		removed += 1;
		continue;
	}
	cleaned[key] = value;
}

console.log(`📦 Total cache entries: ${total}`);
console.log(`❌ Failed entries (key == value): ${removed}`);
console.log(`✅ Kept: ${Object.keys(cleaned).length}`);

if (DRY_RUN) {
	console.log('\n[dry-run] no changes written');
} else {
	await fs.writeFile(CACHE_FILE, JSON.stringify(cleaned, null, 2));
	console.log(`\n✨ Wrote cleaned cache (${removed} failed entries removed)`);
	console.log('   Next translate-content run will retry these chunks.');
}
