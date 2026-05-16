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
};

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

	if (cache.revalidate === false) {
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

// =============================================================================
// Posts (通常記事)
// =============================================================================

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
	if (USE_STATIC) return null;
	const data = await wpFetch<WPPost[]>(`posts?slug=${encodeURIComponent(slug)}&_embed`, {
		revalidate: 86400,
		tags: ['posts', `post-${slug}`],
	});
	return data?.[0] ?? null;
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
	if (USE_STATIC) return null;
	const data = await wpFetch<WPService[]>(`service?slug=${encodeURIComponent(slug)}&_embed`, {
		revalidate: 86400,
		tags: ['services', `service-${slug}`],
	});
	return data?.[0] ?? null;
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
	if (USE_STATIC) return null;
	const data = await wpFetch<WPCareer[]>(`career?slug=${encodeURIComponent(slug)}&_embed`, {
		revalidate: 86400,
		tags: ['careers', `career-${slug}`],
	});
	return data?.[0] ?? null;
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
	if (USE_STATIC) return null;
	const data = await wpFetch<WPFeature[]>(`feature?slug=${encodeURIComponent(slug)}&_embed`, {
		revalidate: 86400,
		tags: ['features', `feature-${slug}`],
	});
	return data?.[0] ?? null;
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
