/**
 * WordPress REST API connection layer.
 *
 * Week 3 では REST API ベースで実装。GraphQL は将来の選択肢として残す。
 * 各 fetch のキャッシュ戦略は docs/06-features.md の方針に準拠。
 *
 * DATA_SOURCE 環境変数で動作切替:
 *   - "api"    : ライブ取得（開発時）
 *   - "static" : data/*.json から読み込み（Week 8 で実装）
 */

import { draftMode } from 'next/headers';
import type {
	WPPost,
	WPService,
	WPCareer,
	WPFeature,
	WPAuthorProfile,
	WPTerm,
} from '@/types/wordpress';

// =============================================================================
// Configuration
// =============================================================================

const API_URL = process.env.WORDPRESS_API_URL ?? '';
const USE_STATIC = process.env.DATA_SOURCE === 'static';

if (!API_URL && !USE_STATIC && typeof window === 'undefined') {
	// 起動時に1回だけ警告（fetchが呼ばれた時にも個別に出る）
	console.warn(
		'[wordpress.ts] WORDPRESS_API_URL is not configured. ' +
			'Set it in web/.env.local or switch DATA_SOURCE=static.',
	);
}

// =============================================================================
// Fetch helper
// =============================================================================

type CacheOptions = {
	/** Number of seconds, or `false` for permanent cache (force-cache). */
	revalidate?: number | false;
	tags?: string[];
	/** プレビュー（下書き取得）。true なら no-store + Basic 認証ヘッダを付与する。 */
	draft?: boolean;
};

/**
 * プレビュー時の Basic 認証ヘッダ。Application Password を使う。
 * 未設定の場合は付与しない（公開記事のみ取得できる）。
 */
function draftAuthHeaders(): Record<string, string> {
	const user = process.env.WP_USERNAME;
	const pass = process.env.WP_APPLICATION_PASSWORD;
	if (!user || !pass) return {};
	const token = Buffer.from(`${user}:${pass}`).toString('base64');
	return { Authorization: `Basic ${token}` };
}

/**
 * REST API への基本フェッチ。エラーは null を返して呼び出し側で扱う。
 */
async function wpFetch<T>(resource: string, cache: CacheOptions = {}): Promise<T | null> {
	if (!API_URL) {
		console.error('[wp] WORDPRESS_API_URL is not configured.');
		return null;
	}

	const url = `${API_URL}/wp/v2/${resource}`;

	const fetchOpts: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {};

	if (cache.draft) {
		// プレビュー: キャッシュせず、認証付きで下書きを取得する
		fetchOpts.cache = 'no-store';
		fetchOpts.headers = draftAuthHeaders();
	} else if (cache.revalidate === false) {
		fetchOpts.cache = 'force-cache';
	} else {
		fetchOpts.next = {
			revalidate: cache.revalidate ?? 3600,
			tags: cache.tags,
		};
	}

	try {
		const res = await fetch(url, fetchOpts);
		if (!res.ok) {
			console.error(`[wp] ${resource} returned ${res.status}`);
			return null;
		}
		return (await res.json()) as T;
	} catch (err) {
		console.error(`[wp] ${resource} fetch error:`, err);
		return null;
	}
}

/**
 * slug 指定の単一エンティティ取得を、プレビュー（draftMode）対応で行う共通ヘルパー。
 *
 * - 通常時: 公開記事のみ。ISR キャッシュ（revalidate + tags）。
 * - プレビュー時: 下書きも含めて取得（status=draft,publish）。no-store + 認証。
 */
async function fetchBySlug<T>(
	restBase: string,
	slug: string,
	tags: string[],
	revalidate: number,
): Promise<T | null> {
	if (USE_STATIC) return null;
	const { isEnabled: isDraft } = await draftMode();
	const statusParam = isDraft ? '&status=draft,publish' : '';
	const data = await wpFetch<T[]>(
		`${restBase}?slug=${encodeURIComponent(slug)}${statusParam}&_embed`,
		isDraft ? { draft: true } : { revalidate, tags },
	);
	return data?.[0] ?? null;
}

// =============================================================================
// Posts (通常記事)
// =============================================================================

/**
 * 指定タクソノミーのタームに属する記事を取得する。
 * taxonomy はREST上のキー（topic / industry / reading_level）、termIdはタームのID。
 */
export async function getPostsByTerm(
	taxonomy: string,
	termId: number,
): Promise<WPPost[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPPost[]>(
		`posts?${taxonomy}=${termId}&_embed&per_page=100`,
		{ revalidate: 3600, tags: ['posts', `${taxonomy}-${termId}`] },
	);
	return data ?? [];
}

export async function getPosts(): Promise<WPPost[]> {
	if (USE_STATIC) {
		// Week 8 で data/posts.json から読み込む実装に置き換え
		return [];
	}
	const data = await wpFetch<WPPost[]>('posts?_embed&per_page=100', {
		revalidate: 3600,
		tags: ['posts'],
	});
	return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
	return fetchBySlug<WPPost>('posts', slug, ['posts', `post-${slug}`], 86400);
}

/**
 * 投稿IDの配列から投稿を取得する。
 * ACF の relationship フィールド（related_articles 等）は ID 配列で返るため、
 * それを実体の投稿に解決するのに使う。`orderby=include` で指定順を保持する。
 */
export async function getPostsByIds(ids: number[]): Promise<WPPost[]> {
	if (USE_STATIC || ids.length === 0) return [];
	const data = await wpFetch<WPPost[]>(
		`posts?include=${ids.join(',')}&orderby=include&_embed&per_page=100`,
		{ revalidate: 3600, tags: ['posts'] },
	);
	return data ?? [];
}

// =============================================================================
// Services (CPT: service)
// =============================================================================

export async function getServices(): Promise<WPService[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPService[]>('service?_embed&per_page=100', {
		revalidate: 86400,
		tags: ['services'],
	});
	return data ?? [];
}

export async function getServiceBySlug(slug: string): Promise<WPService | null> {
	return fetchBySlug<WPService>('service', slug, ['services', `service-${slug}`], 86400);
}

// =============================================================================
// Careers (CPT: career)
// =============================================================================

export async function getCareers(): Promise<WPCareer[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPCareer[]>('career?_embed&per_page=100', {
		revalidate: 86400,
		tags: ['careers'],
	});
	return data ?? [];
}

export async function getCareerBySlug(slug: string): Promise<WPCareer | null> {
	return fetchBySlug<WPCareer>('career', slug, ['careers', `career-${slug}`], 86400);
}

// =============================================================================
// Features (CPT: feature)
// =============================================================================

export async function getFeatures(): Promise<WPFeature[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPFeature[]>('feature?_embed&per_page=100', {
		revalidate: 3600,
		tags: ['features'],
	});
	return data ?? [];
}

export async function getFeatureBySlug(slug: string): Promise<WPFeature | null> {
	return fetchBySlug<WPFeature>('feature', slug, ['features', `feature-${slug}`], 86400);
}

// =============================================================================
// Authors (CPT: author_profile)
// =============================================================================

export async function getAuthors(): Promise<WPAuthorProfile[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPAuthorProfile[]>('author_profile?_embed&per_page=100', {
		revalidate: 86400,
		tags: ['authors'],
	});
	return data ?? [];
}

export async function getAuthorBySlug(slug: string): Promise<WPAuthorProfile | null> {
	if (USE_STATIC) return null;
	const data = await wpFetch<WPAuthorProfile[]>(
		`author_profile?slug=${encodeURIComponent(slug)}&_embed`,
		{
			revalidate: 86400,
			tags: ['authors', `author-${slug}`],
		},
	);
	return data?.[0] ?? null;
}

/**
 * 著者IDから著者プロフィールを取得する。
 * 記事の ACF post_object フィールド author_profile は ID で返るため、
 * それを実体の著者に解決するのに使う。
 */
export async function getAuthorById(id: number): Promise<WPAuthorProfile | null> {
	if (USE_STATIC) return null;
	return wpFetch<WPAuthorProfile>(`author_profile/${id}?_embed`, {
		revalidate: 86400,
		tags: ['authors', `author-${id}`],
	});
}

// =============================================================================
// Taxonomies (industry, topic, reading_level)
// =============================================================================

export async function getIndustries(): Promise<WPTerm[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPTerm[]>('industry?per_page=100', {
		revalidate: 86400,
		tags: ['taxonomies', 'industries'],
	});
	return data ?? [];
}

export async function getTopics(): Promise<WPTerm[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPTerm[]>('topic?per_page=100', {
		revalidate: 86400,
		tags: ['taxonomies', 'topics'],
	});
	return data ?? [];
}

export async function getReadingLevels(): Promise<WPTerm[]> {
	if (USE_STATIC) return [];
	const data = await wpFetch<WPTerm[]>('reading_level?per_page=100', {
		revalidate: 86400,
		tags: ['taxonomies', 'reading-levels'],
	});
	return data ?? [];
}

/**
 * 指定タクソノミーから slug でタームを1件取得する。
 * URL の [slug] パラメータから実体ターム（ID・name 等）を解決するのに使う。
 */
export async function getTermBySlug(
	taxonomy: string,
	slug: string,
): Promise<WPTerm | null> {
	if (USE_STATIC) return null;
	const data = await wpFetch<WPTerm[]>(
		`${taxonomy}?slug=${encodeURIComponent(slug)}`,
		{ revalidate: 86400, tags: ['taxonomies', taxonomy] },
	);
	return data?.[0] ?? null;
}
