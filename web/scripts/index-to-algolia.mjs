/**
 * 既存記事を一括で Algolia にインデックスする一回限りのスクリプト。
 *
 * web/data/posts.json（静的エクスポート済みのデータ）から記事を読み、
 * 検索しやすい形に整形して Algolia にアップロードする。
 * 通常運用では WordPress プラグインの save_post フックが個別に同期するが、
 * 初回投入時や全件再投入したいときにこのスクリプトを使う。
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
const POSTS_JSON = path.join(ROOT, 'data', 'posts.json');

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

async function main() {
	console.log(`📡 Algolia: app=${APP_ID} index=${INDEX_NAME}`);

	const raw = await fs.readFile(POSTS_JSON, 'utf8');
	const posts = JSON.parse(raw);
	const records = posts.map(toAlgoliaRecord);
	console.log(`📦 ${records.length} 件の投稿をインデックス対象として整形`);

	const client = algoliasearch(APP_ID, ADMIN_KEY);

	// インデックス設定（検索対象・絞り込み・ハイライト等）
	console.log('⚙️  インデックス設定を反映...');
	await client.setSettings({
		indexName: INDEX_NAME,
		indexSettings: {
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
		},
	});

	console.log('🚀 オブジェクトをアップロード...');
	const responses = await client.saveObjects({
		indexName: INDEX_NAME,
		objects: records,
	});
	// v5 の saveObjects は BatchResponse[] を返す（バッチ毎の {taskID, objectIDs}）
	const batches = Array.isArray(responses) ? responses : [];
	console.log(
		`  ✅ ${records.length} 件アップロード完了（${batches.length} バッチ）`,
	);

	console.log('\n✨ Algolia インデックス完了');
}

main().catch((err) => {
	console.error('❌ Algolia インデックス失敗:', err);
	process.exit(1);
});
