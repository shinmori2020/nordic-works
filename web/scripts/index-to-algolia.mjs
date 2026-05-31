/**
 * 既存記事を一括で Algolia にインデックスする一回限りのスクリプト。
 *
 * JA / EN の2インデックスを作る:
 *   - data/posts.json    → <INDEX_NAME>      （例: nordic_works）
 *   - data/posts.en.json → <INDEX_NAME>_en   （例: nordic_works_en）
 *
 * EN ファイルが無い場合は EN インデックスをスキップ（JA だけ更新）。
 * 検索 UI は現在ロケールに応じてインデックスを切り替える（lib/algolia.ts）。
 *
 * 使い方:  pnpm run index-algolia
 *
 * 必要な環境変数:
 *   NEXT_PUBLIC_ALGOLIA_APP_ID
 *   ALGOLIA_ADMIN_KEY        （Admin Key、サーバー側のみ）
 *   NEXT_PUBLIC_ALGOLIA_INDEX_NAME
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { algoliasearch } from 'algoliasearch';

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'nordic_works';

if (!APP_ID || !ADMIN_KEY) {
	console.error(
		'❌ NEXT_PUBLIC_ALGOLIA_APP_ID と ALGOLIA_ADMIN_KEY を .env.local に設定してください。',
	);
	process.exit(1);
}

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

/** 簡易 HTML→テキスト変換（タグ除去 + 連続空白の正規化） */
function stripHtml(html) {
	if (!html) return '';
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

/** _embedded['wp:term'] から指定タクソノミーのターム名一覧を取り出す */
function getTermNames(post, taxonomy) {
	const groups = post._embedded?.['wp:term'] ?? [];
	return groups
		.flat()
		.filter((t) => t?.taxonomy === taxonomy)
		.map((t) => t.name);
}

/** 投稿1件 → Algolia オブジェクトに整形 */
function toAlgoliaRecord(post) {
	const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
	return {
		objectID: String(post.id),
		title: stripHtml(post.title?.rendered),
		excerpt: stripHtml(post.excerpt?.rendered),
		// 本文は検索用に短縮（Algolia のレコードサイズ上限 10KB を守るため）
		content: stripHtml(post.content?.rendered).slice(0, 5000),
		slug: post.slug,
		date: post.date,
		modified: post.modified,
		image,
		topics: getTermNames(post, 'topic'),
		industries: getTermNames(post, 'industry'),
		readingLevels: getTermNames(post, 'reading_level'),
		readingTime: post.acf?.reading_time ?? null,
		url: `/articles/${post.slug}`,
	};
}

const INDEX_SETTINGS = {
	searchableAttributes: ['title', 'excerpt', 'content', 'topics', 'industries'],
	attributesForFaceting: [
		'searchable(topics)',
		'searchable(industries)',
		'searchable(readingLevels)',
	],
	attributesToSnippet: ['content:30', 'excerpt:30'],
	highlightPreTag: '<mark>',
	highlightPostTag: '</mark>',
	snippetEllipsisText: '…',
	ranking: ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
	customRanking: ['desc(date)'],
};

/** 1つのインデックスを設定 + 全件投入する */
async function indexOne(client, indexName, jsonPath) {
	let raw;
	try {
		raw = await fs.readFile(jsonPath, 'utf8');
	} catch {
		console.log(`⏭️  ${path.basename(jsonPath)} が無いのでスキップ（index=${indexName}）`);
		return;
	}

	const posts = JSON.parse(raw);
	const records = posts.map(toAlgoliaRecord);
	console.log(`📦 ${indexName}: ${records.length} 件を整形`);

	await client.setSettings({ indexName, indexSettings: INDEX_SETTINGS });
	const responses = await client.saveObjects({ indexName, objects: records });
	const batches = Array.isArray(responses) ? responses : [];
	console.log(`  ✅ ${indexName}: ${records.length} 件アップロード（${batches.length} バッチ）`);
}

async function main() {
	console.log(`📡 Algolia: app=${APP_ID}`);
	const client = algoliasearch(APP_ID, ADMIN_KEY);

	// JA（デフォルトインデックス）
	await indexOne(client, INDEX_NAME, path.join(DATA_DIR, 'posts.json'));

	// EN（_en サフィックス）
	await indexOne(client, `${INDEX_NAME}_en`, path.join(DATA_DIR, 'posts.en.json'));

	console.log('\n✨ Algolia インデックス完了');
}

main().catch((err) => {
	console.error('❌ Algolia インデックス失敗:', err);
	process.exit(1);
});
