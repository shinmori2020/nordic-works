/**
 * WordPress REST API から全データを JSON に書き出し、画像も同梱する一回限りのビルド前スクリプト。
 *
 * - 各 CPT / タクソノミーを取得 → web/data/<name>.json に保存
 * - 取得内容に含まれる nordic-works.local の画像URLを web/public/wp-uploads/ にダウンロード
 * - JSON 内の画像URLを `/wp-uploads/...` の相対パスに書き換え
 *
 * 使い方:  pnpm run export-wp
 *
 * 出力されたファイルはコミット対象。本番デプロイ（Vercel）では DATA_SOURCE=static で
 * src/lib/wordpress.ts がこれらの JSON を読む。
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const WP_API = process.env.WORDPRESS_API_URL ?? 'http://nordic-works.local/wp-json';
const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const MEDIA_DIR = path.join(ROOT, 'public', 'wp-uploads');

// WP のメディアURL（書き換え対象）
const WP_HOST = new URL(WP_API).origin; // http://nordic-works.local
const WP_UPLOAD_PREFIX = `${WP_HOST}/wp-content/uploads/`;
const WP_UPLOAD_RE = new RegExp(
	WP_UPLOAD_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
	'g',
);

// 取得対象（REST のエンドポイントキー → 保存ファイル名）
const ENDPOINTS = [
	{ name: 'posts', path: 'posts' },
	{ name: 'services', path: 'service' },
	{ name: 'careers', path: 'career' },
	{ name: 'features', path: 'feature' },
	{ name: 'authors', path: 'author_profile' },
	{ name: 'industries', path: 'industry' },
	{ name: 'topics', path: 'topic' },
	{ name: 'reading-levels', path: 'reading_level' },
];

/** REST から全ページ取得（per_page=100でページング） */
async function fetchAll(endpoint) {
	const all = [];
	for (let page = 1; ; page++) {
		const url = `${WP_API}/wp/v2/${endpoint}?_embed&per_page=100&page=${page}`;
		const res = await fetch(url);
		if (!res.ok) {
			// 範囲外ページは 400、それ以外はエラー
			if (res.status === 400) break;
			throw new Error(`[wp] ${endpoint} page=${page} -> ${res.status}`);
		}
		const data = await res.json();
		all.push(...data);
		if (data.length < 100) break;
	}
	return all;
}

/** 1枚の画像を public/wp-uploads/<rel> にダウンロード（既存はスキップ） */
async function downloadImage(srcUrl) {
	const u = new URL(srcUrl);
	const rel = u.pathname.replace(/^\/wp-content\/uploads\//, '');
	const dest = path.join(MEDIA_DIR, rel);

	// 既存ファイルはスキップ
	try {
		await fs.access(dest);
		return { rel, skipped: true };
	} catch {}

	await fs.mkdir(path.dirname(dest), { recursive: true });
	const res = await fetch(srcUrl);
	if (!res.ok) {
		return { rel, error: res.status };
	}
	const buf = Buffer.from(await res.arrayBuffer());
	await fs.writeFile(dest, buf);
	return { rel };
}

/** JSON 値を再帰的に走査し、画像URLを抽出する */
function collectImageUrls(value, out) {
	if (value == null) return;
	if (typeof value === 'string') {
		const re = new RegExp(
			WP_UPLOAD_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
				`[^\\s"'<>)]+`,
			'g',
		);
		for (const m of value.matchAll(re)) out.add(m[0]);
		return;
	}
	if (Array.isArray(value)) {
		for (const v of value) collectImageUrls(v, out);
		return;
	}
	if (typeof value === 'object') {
		for (const k of Object.keys(value)) collectImageUrls(value[k], out);
	}
}

/** JSON 全体の画像URLを `/wp-uploads/...` に書き換える */
function rewriteUrls(json) {
	const str = JSON.stringify(json);
	const rewritten = str.replace(WP_UPLOAD_RE, '/wp-uploads/');
	return JSON.parse(rewritten);
}

async function main() {
	console.log(`📡 WordPress: ${WP_API}`);
	await fs.mkdir(DATA_DIR, { recursive: true });
	await fs.mkdir(MEDIA_DIR, { recursive: true });

	const imageUrls = new Set();

	for (const { name, path: ep } of ENDPOINTS) {
		process.stdout.write(`📦 ${name.padEnd(16)}`);
		const raw = await fetchAll(ep);
		collectImageUrls(raw, imageUrls);
		const rewritten = rewriteUrls(raw);
		await fs.writeFile(
			path.join(DATA_DIR, `${name}.json`),
			JSON.stringify(rewritten, null, 2),
		);
		console.log(`${raw.length} 件`);
	}

	console.log(`\n📸 画像: ${imageUrls.size} 件をダウンロード`);
	let downloaded = 0;
	let skipped = 0;
	let failed = 0;
	for (const url of imageUrls) {
		const r = await downloadImage(url);
		if (r.error) {
			console.warn(`  ! ${r.rel} (${r.error})`);
			failed++;
		} else if (r.skipped) {
			skipped++;
		} else {
			downloaded++;
		}
	}
	console.log(`  📥 新規 ${downloaded} / スキップ ${skipped} / 失敗 ${failed}`);

	console.log('\n✨ Export 完了');
}

main().catch((err) => {
	console.error('❌ Export 失敗:', err);
	process.exit(1);
});
