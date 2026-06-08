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
import { getLocale } from 'next-intl/server';
import type {
	WPPost,
	WPService,
	WPCareer,
	WPFeature,
	WPAuthorProfile,
	WPCaseStudy,
	WPTerm,
} from '@/types/wordpress';
import { termSlug } from '@/lib/taxonomy';

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
// Static data loaders (DATA_SOURCE=static 時の web/data/*.json 読み込み)
//
// 各 JSON は scripts/export-wp-data.mjs が生成（JA = 原文）し、
// scripts/translate-content.mjs が MyMemory 経由で .en.json を生成する。
// 画像URLは /wp-uploads/... に書き換え済み。dynamic import は webpack によって
// 個別チャンクに分割され、static モードのときだけ評価される。
//
// 現在ロケールは next-intl の getLocale() から取得する。
// en 用ファイルが何らかの理由で読めない場合は JA にフォールバック。
// =============================================================================

async function currentLocale(): Promise<'ja' | 'en'> {
	try {
		const l = await getLocale();
		return l === 'en' ? 'en' : 'ja';
	} catch {
		return 'ja';
	}
}

const loadPostsStatic = async () => {
	const locale = await currentLocale();
	if (locale === 'en') {
		const m = await import('../../data/posts.en.json');
		return m.default as unknown as WPPost[];
	}
	const m = await import('../../data/posts.json');
	return m.default as unknown as WPPost[];
};
const loadServicesStatic = async () => {
	const locale = await currentLocale();
	if (locale === 'en') {
		const m = await import('../../data/services.en.json');
		return m.default as unknown as WPService[];
	}
	const m = await import('../../data/services.json');
	return m.default as unknown as WPService[];
};
const loadCareersStatic = async () => {
	const locale = await currentLocale();
	if (locale === 'en') {
		const m = await import('../../data/careers.en.json');
		return m.default as unknown as WPCareer[];
	}
	const m = await import('../../data/careers.json');
	return m.default as unknown as WPCareer[];
};
const loadFeaturesStatic = async () => {
	const locale = await currentLocale();
	if (locale === 'en') {
		const m = await import('../../data/features.en.json');
		return m.default as unknown as WPFeature[];
	}
	const m = await import('../../data/features.json');
	return m.default as unknown as WPFeature[];
};
const loadAuthorsStatic = async () => {
	const locale = await currentLocale();
	if (locale === 'en') {
		const m = await import('../../data/authors.en.json');
		return m.default as unknown as WPAuthorProfile[];
	}
	const m = await import('../../data/authors.json');
	return m.default as unknown as WPAuthorProfile[];
};
// case_study.en.json はまだ存在しないので JA のみ。en 用は translate-content.mjs で生成される
const loadCaseStudiesStatic = async () => {
	const locale = await currentLocale();
	if (locale === 'en') {
		try {
			const m = await import('../../data/case-studies.en.json');
			return m.default as unknown as WPCaseStudy[];
		} catch {
			// EN 未生成時は JA フォールバック
		}
	}
	try {
		const m = await import('../../data/case-studies.json');
		return m.default as unknown as WPCaseStudy[];
	} catch {
		return [] as WPCaseStudy[];
	}
};
// タクソノミー（ターム名）は短く、訳しても誤訳しやすいので原文のまま使う方針
const loadIndustriesStatic = () =>
	import('../../data/industries.json').then((m) => m.default as unknown as WPTerm[]);
const loadTopicsStatic = () =>
	import('../../data/topics.json').then((m) => m.default as unknown as WPTerm[]);
const loadReadingLevelsStatic = () =>
	import('../../data/reading-levels.json').then(
		(m) => m.default as unknown as WPTerm[],
	);

/** タクソノミーキー → 対応するタームJSONのローダ */
const TAXONOMY_LOADERS: Record<string, () => Promise<WPTerm[]>> = {
	industry: loadIndustriesStatic,
	topic: loadTopicsStatic,
	reading_level: loadReadingLevelsStatic,
};

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
	if (USE_STATIC) {
		const posts = await loadPostsStatic();
		// 投稿オブジェクトの taxonomy フィールドは term ID 配列（topic: [12,15] 等）
		return posts.filter((p) => {
			const ids = (p as unknown as Record<string, unknown>)[taxonomy];
			return Array.isArray(ids) && (ids as number[]).includes(termId);
		});
	}
	const data = await wpFetch<WPPost[]>(
		`posts?${taxonomy}=${termId}&_embed&per_page=100`,
		{ revalidate: 3600, tags: ['posts', `${taxonomy}-${termId}`] },
	);
	return data ?? [];
}

export async function getPosts(): Promise<WPPost[]> {
	if (USE_STATIC) return loadPostsStatic();
	const data = await wpFetch<WPPost[]>('posts?_embed&per_page=100', {
		revalidate: 3600,
		tags: ['posts'],
	});
	return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
	if (USE_STATIC) {
		const posts = await loadPostsStatic();
		return posts.find((p) => p.slug === slug) ?? null;
	}
	return fetchBySlug<WPPost>('posts', slug, ['posts', `post-${slug}`], 86400);
}

/**
 * 投稿IDの配列から投稿を取得する。
 * ACF の relationship フィールド（related_articles 等）は ID 配列で返るため、
 * それを実体の投稿に解決するのに使う。指定順を保持する。
 */
export async function getPostsByIds(ids: number[]): Promise<WPPost[]> {
	if (ids.length === 0) return [];
	if (USE_STATIC) {
		const posts = await loadPostsStatic();
		const byId = new Map(posts.map((p) => [p.id, p]));
		return ids
			.map((id) => byId.get(id))
			.filter((p): p is WPPost => p !== undefined);
	}
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
	if (USE_STATIC) return loadServicesStatic();
	const data = await wpFetch<WPService[]>('service?_embed&per_page=100', {
		revalidate: 86400,
		tags: ['services'],
	});
	return data ?? [];
}

export async function getServiceBySlug(slug: string): Promise<WPService | null> {
	if (USE_STATIC) {
		const items = await loadServicesStatic();
		return items.find((s) => s.slug === slug) ?? null;
	}
	return fetchBySlug<WPService>('service', slug, ['services', `service-${slug}`], 86400);
}

// =============================================================================
// Careers (CPT: career)
// =============================================================================

export async function getCareers(): Promise<WPCareer[]> {
	if (USE_STATIC) return loadCareersStatic();
	const data = await wpFetch<WPCareer[]>('career?_embed&per_page=100', {
		revalidate: 86400,
		tags: ['careers'],
	});
	return data ?? [];
}

export async function getCareerBySlug(slug: string): Promise<WPCareer | null> {
	if (USE_STATIC) {
		const items = await loadCareersStatic();
		return items.find((c) => c.slug === slug) ?? null;
	}
	return fetchBySlug<WPCareer>('career', slug, ['careers', `career-${slug}`], 86400);
}

// =============================================================================
// Features (CPT: feature)
// =============================================================================

export async function getFeatures(): Promise<WPFeature[]> {
	if (USE_STATIC) return loadFeaturesStatic();
	const data = await wpFetch<WPFeature[]>('feature?_embed&per_page=100', {
		revalidate: 3600,
		tags: ['features'],
	});
	return data ?? [];
}

export async function getFeatureBySlug(slug: string): Promise<WPFeature | null> {
	if (USE_STATIC) {
		const items = await loadFeaturesStatic();
		return items.find((f) => f.slug === slug) ?? null;
	}
	return fetchBySlug<WPFeature>('feature', slug, ['features', `feature-${slug}`], 86400);
}

// =============================================================================
// Authors (CPT: author_profile)
// =============================================================================

export async function getAuthors(): Promise<WPAuthorProfile[]> {
	if (USE_STATIC) return loadAuthorsStatic();
	const data = await wpFetch<WPAuthorProfile[]>('author_profile?_embed&per_page=100', {
		revalidate: 86400,
		tags: ['authors'],
	});
	return data ?? [];
}

export async function getAuthorBySlug(slug: string): Promise<WPAuthorProfile | null> {
	if (USE_STATIC) {
		const items = await loadAuthorsStatic();
		return items.find((a) => a.slug === slug) ?? null;
	}
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
	if (USE_STATIC) {
		const items = await loadAuthorsStatic();
		return items.find((a) => a.id === id) ?? null;
	}
	return wpFetch<WPAuthorProfile>(`author_profile/${id}?_embed`, {
		revalidate: 86400,
		tags: ['authors', `author-${id}`],
	});
}

// =============================================================================
// Case Studies (CPT: case_study)
// =============================================================================

export async function getCaseStudies(): Promise<WPCaseStudy[]> {
	if (USE_STATIC) return loadCaseStudiesStatic();
	const data = await wpFetch<WPCaseStudy[]>('case_study?_embed&per_page=100', {
		revalidate: 86400,
		tags: ['case-studies'],
	});
	return data ?? [];
}

export async function getCaseStudyBySlug(slug: string): Promise<WPCaseStudy | null> {
	if (USE_STATIC) {
		const items = await loadCaseStudiesStatic();
		return items.find((c) => c.slug === slug) ?? null;
	}
	return fetchBySlug<WPCaseStudy>(
		'case_study',
		slug,
		['case-studies', `case-study-${slug}`],
		86400,
	);
}

/**
 * 関連サービス取得: ACF relationship フィールド related_services は ID 配列で返る。
 * それを実体のサービスに解決する。指定順を保持する。
 */
export async function getServicesByIds(ids: number[]): Promise<WPService[]> {
	if (ids.length === 0) return [];
	if (USE_STATIC) {
		const services = await loadServicesStatic();
		const byId = new Map(services.map((s) => [s.id, s]));
		return ids
			.map((id) => byId.get(id))
			.filter((s): s is WPService => s !== undefined);
	}
	const data = await wpFetch<WPService[]>(
		`service?include=${ids.join(',')}&orderby=include&_embed&per_page=100`,
		{ revalidate: 86400, tags: ['services'] },
	);
	return data ?? [];
}

/**
 * 関連事例: 特定のサービスIDに紐づく case_study を返す。
 * ACF の related_services を逆引きする。
 */
export async function getCaseStudiesByServiceId(serviceId: number): Promise<WPCaseStudy[]> {
	const all = await getCaseStudies();
	return all.filter((cs) => {
		const related = cs.acf?.related_services;
		return Array.isArray(related) && related.includes(serviceId);
	});
}

// =============================================================================
// Taxonomies (industry, topic, reading_level)
// =============================================================================

export async function getIndustries(): Promise<WPTerm[]> {
	if (USE_STATIC) return loadIndustriesStatic();
	const data = await wpFetch<WPTerm[]>('industry?per_page=100', {
		revalidate: 86400,
		tags: ['taxonomies', 'industries'],
	});
	return data ?? [];
}

export async function getTopics(): Promise<WPTerm[]> {
	if (USE_STATIC) return loadTopicsStatic();
	const data = await wpFetch<WPTerm[]>('topic?per_page=100', {
		revalidate: 86400,
		tags: ['taxonomies', 'topics'],
	});
	return data ?? [];
}

export async function getReadingLevels(): Promise<WPTerm[]> {
	if (USE_STATIC) return loadReadingLevelsStatic();
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
/** decodeURIComponent を安全に行う（不正な % シーケンスはそのまま返す）。 */
function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export async function getTermBySlug(
	taxonomy: string,
	slug: string,
): Promise<WPTerm | null> {
	// 受け取る slug はエンコード（大文字/小文字差あり）/デコードのいずれの形もありうる。
	// データ側の slug は日本語が URL エンコード（小文字）で保存されている。
	// 両辺をデコードして正規化し比較することで、日本語 slug の取りこぼしを防ぐ。
	const target = safeDecode(slug);
	if (USE_STATIC) {
		const loader = TAXONOMY_LOADERS[taxonomy];
		if (!loader) return null;
		const terms = await loader();
		// ASCII スラッグ（termSlug）でも、旧来のデコード済み slug でも引けるようにする。
		return (
			terms.find(
				(t) => termSlug(t) === target || safeDecode(t.slug) === target,
			) ?? null
		);
	}
	const data = await wpFetch<WPTerm[]>(
		`${taxonomy}?slug=${encodeURIComponent(target)}`,
		{ revalidate: 86400, tags: ['taxonomies', taxonomy] },
	);
	return data?.[0] ?? null;
}
