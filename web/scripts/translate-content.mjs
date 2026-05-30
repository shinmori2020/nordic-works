/**
 * MyMemory API で data/*.json を英訳して data/*.en.json を生成する。
 *
 * - 入力: data/posts.json, services.json, careers.json, features.json, authors.json
 * - 出力: 同名の .en.json
 * - HTML タグは保持し、テキストノードのみ翻訳
 * - 翻訳結果は data/.translation-cache.json にキャッシュ
 *   （同じ文を再翻訳しない → API 節約 + 増分実行が速い）
 * - エラー時は元の JA を保持（破壊的でない）
 *
 * 使い方:
 *   pnpm run translate-content                 # 全部翻訳
 *   TRANSLATION_LIMIT=2 pnpm run translate-content   # 各ファイル先頭2件のみ（テスト用）
 *
 * MyMemory 制限:
 *   - 匿名: 約1000 words/day
 *   - email 付与: 約50,000 words/day（メアドは検証されないが TOS 推奨）
 *   - 1リクエスト ~500 byte (UTF-8) → 長文は文単位でチャンク
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const EMAIL =
	process.env.TRANSLATION_EMAIL ?? 'nordic-works-portfolio@example.com';
const LIMIT = process.env.TRANSLATION_LIMIT
	? Number(process.env.TRANSLATION_LIMIT)
	: Infinity;
const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const CACHE_FILE = path.join(DATA_DIR, '.translation-cache.json');

const TARGETS = ['posts', 'services', 'careers', 'features', 'authors'];

// MyMemory への礼儀としての軽い間隔
const DELAY_MS = 150;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// =============================================================================
// Cache
// =============================================================================

async function loadCache() {
	try {
		const raw = await fs.readFile(CACHE_FILE, 'utf8');
		return new Map(Object.entries(JSON.parse(raw)));
	} catch {
		return new Map();
	}
}

let saveCounter = 0;
async function maybeSaveCache(cache) {
	saveCounter += 1;
	// 10件ごとに保存（途中停止時の損失を最小化）
	if (saveCounter % 10 === 0) {
		const obj = Object.fromEntries(cache);
		await fs.writeFile(CACHE_FILE, JSON.stringify(obj));
	}
}

async function saveCacheFinal(cache) {
	const obj = Object.fromEntries(cache);
	await fs.writeFile(CACHE_FILE, JSON.stringify(obj, null, 2));
}

// =============================================================================
// Translation (MyMemory)
// =============================================================================

/** 1リクエストで翻訳。短い文向け。 */
async function translateOnce(text) {
	const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ja|en-US&de=${encodeURIComponent(EMAIL)}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`MyMemory HTTP ${res.status}`);
	}
	const data = await res.json();
	// responseStatus 200 で成功。429 等は文字列で返るので Number 化
	if (Number(data.responseStatus) !== 200) {
		// QUOTA EXCEEDED 等のメッセージを含む
		throw new Error(
			`MyMemory responseStatus=${data.responseStatus} (${data.responseDetails ?? ''})`,
		);
	}
	return data.responseData?.translatedText ?? text;
}

/** 長文を句点で分割して逐次翻訳。 */
async function translateLong(text) {
	// 句点で分割。末尾の句点は保持される（lookbehind）
	const sentences = text.split(/(?<=。|！|？|\.)\s*/).filter(Boolean);
	const out = [];
	for (const s of sentences) {
		if (s.trim().length === 0) {
			out.push(s);
			continue;
		}
		// 1文が更に長い場合は強制 400 字でカット
		if (s.length > 400) {
			for (let i = 0; i < s.length; i += 400) {
				const chunk = s.slice(i, i + 400);
				out.push(await translateOnce(chunk));
				await sleep(DELAY_MS);
			}
		} else {
			out.push(await translateOnce(s));
			await sleep(DELAY_MS);
		}
	}
	return out.join(' ');
}

/** キャッシュ＋振り分け。空文字はそのまま。 */
async function translateText(text, cache) {
	if (!text || text.trim().length === 0) return text;
	const cached = cache.get(text);
	if (cached !== undefined) return cached;

	let result;
	try {
		result = text.length <= 400 ? await translateOnce(text) : await translateLong(text);
	} catch (err) {
		console.warn(`  ⚠️ translate failed (keeping JA): ${err.message}`);
		result = text;
	}
	cache.set(text, result);
	await maybeSaveCache(cache);
	await sleep(DELAY_MS);
	return result;
}

/** HTML を保持しつつテキストノードのみ翻訳。 */
async function translateHtml(html, cache) {
	if (!html) return html;
	// タグとテキストに分割
	const parts = html.split(/(<[^>]+>)/);
	const out = [];
	for (const part of parts) {
		if (part.startsWith('<')) {
			out.push(part); // タグはそのまま
		} else if (part.trim().length === 0) {
			out.push(part); // 空白だけはそのまま
		} else {
			out.push(await translateText(part, cache));
		}
	}
	return out.join('');
}

// =============================================================================
// Entity translation
// =============================================================================

/**
 * WP エンティティ（記事 / サービス / 採用 / 特集 / 著者）の主要フィールドを翻訳。
 * title / content / excerpt / acf の一部（subtitle, lead_text, bio 等）。
 */
async function translateEntity(entity, cache) {
	const out = { ...entity };

	if (entity.title?.rendered) {
		out.title = {
			...entity.title,
			rendered: await translateHtml(entity.title.rendered, cache),
		};
	}
	if (entity.content?.rendered) {
		out.content = {
			...entity.content,
			rendered: await translateHtml(entity.content.rendered, cache),
		};
	}
	if (entity.excerpt?.rendered) {
		out.excerpt = {
			...entity.excerpt,
			rendered: await translateHtml(entity.excerpt.rendered, cache),
		};
	}

	// ACF フィールドのうち、よく使う文字列フィールドを翻訳
	if (entity.acf && typeof entity.acf === 'object') {
		const acfOut = { ...entity.acf };
		const TEXT_FIELDS = [
			'subtitle',
			'lead_text',
			'bio',
			'position',
			'location',
			'salary_range',
			'cta_text',
			'featured_image_caption',
			// 区切り文字形式の textarea。1行ずつ翻訳しても文脈崩れにくい
			'features',
			'pricing_plans',
			'faq',
			'required_skills',
			'preferred_skills',
			'benefits',
			'case_study_links',
		];
		for (const key of TEXT_FIELDS) {
			if (typeof acfOut[key] === 'string' && acfOut[key].length > 0) {
				acfOut[key] = await translateText(acfOut[key], cache);
			}
		}
		out.acf = acfOut;
	}

	return out;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
	console.log(`📡 MyMemory translation`);
	console.log(`   email: ${EMAIL}`);
	console.log(`   limit per file: ${LIMIT === Infinity ? 'all' : LIMIT}`);

	const cache = await loadCache();
	console.log(`📦 Cache: ${cache.size} entries\n`);

	for (const name of TARGETS) {
		const srcPath = path.join(DATA_DIR, `${name}.json`);
		const enPath = path.join(DATA_DIR, `${name}.en.json`);

		let raw;
		try {
			raw = await fs.readFile(srcPath, 'utf8');
		} catch {
			console.log(`⏭️  ${name}.json not found, skipping`);
			continue;
		}

		const items = JSON.parse(raw);
		const slice = items.slice(0, LIMIT);
		console.log(
			`🌐 ${name}.json: translating ${slice.length} / ${items.length} items`,
		);

		const translated = [];
		for (let i = 0; i < slice.length; i++) {
			const item = slice[i];
			const label = item.slug ?? item.id ?? `#${i}`;
			process.stdout.write(`   ${i + 1}/${slice.length} ${label} ... `);
			try {
				translated.push(await translateEntity(item, cache));
				process.stdout.write(`✓\n`);
			} catch (err) {
				process.stdout.write(`✗ ${err.message}\n`);
				translated.push(item); // フォールバック: 原文を保持
			}
		}

		// LIMIT で部分翻訳の場合、残りは原文のまま入れる（en 配列の長さを保つ）
		const result = [...translated, ...items.slice(LIMIT)];
		await fs.writeFile(enPath, JSON.stringify(result, null, 2));
		console.log(`✅ Wrote ${name}.en.json (${result.length} items)\n`);
	}

	await saveCacheFinal(cache);
	console.log(`✨ Translation complete. Cache: ${cache.size} entries`);
}

main().catch((err) => {
	console.error('❌ Failed:', err);
	process.exit(1);
});
