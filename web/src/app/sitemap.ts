/**
 * 動的サイトマップ — /sitemap.xml
 *
 * 静的ルート（一覧ページ）と、各CPTの全エントリ、タクソノミー各タームを列挙する。
 * 各エントリを ja / en の両ロケールで出力し、hreflang を alternates.languages に格納する。
 */

import type { MetadataRoute } from 'next';
import {
	getAuthors,
	getCareers,
	getCaseStudies,
	getFeatures,
	getIndustries,
	getPosts,
	getReadingLevels,
	getServices,
	getTopics,
} from '@/lib/wordpress';
import { absoluteUrl } from '@/lib/site';
import { getWhitepapers } from '@/lib/whitepapers';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * 同じパスに対し、ja（プレフィックス無し）と en（/en プレフィックス）の
 * 2エントリを返し、互いを hreflang alternates として参照させる。
 */
function withLocaleAlternates(
	path: string,
	options: Omit<SitemapEntry, 'url' | 'alternates'>,
): SitemapEntry[] {
	const jaUrl = absoluteUrl(path);
	const enUrl = absoluteUrl(`/en${path === '/' ? '' : path}`);
	const languages: Record<string, string> = {
		ja: jaUrl,
		en: enUrl,
		'x-default': jaUrl,
	};
	return [
		{ ...options, url: jaUrl, alternates: { languages } },
		{ ...options, url: enUrl, alternates: { languages } },
	];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();

	const staticPaths: { path: string; opts: Omit<SitemapEntry, 'url' | 'alternates'> }[] =
		[
			{ path: '/', opts: { lastModified: now, changeFrequency: 'weekly', priority: 1 } },
			{ path: '/articles', opts: { lastModified: now, changeFrequency: 'daily', priority: 0.9 } },
			{ path: '/features', opts: { lastModified: now, changeFrequency: 'weekly', priority: 0.8 } },
			{ path: '/services', opts: { lastModified: now, changeFrequency: 'monthly', priority: 0.8 } },
			{ path: '/careers', opts: { lastModified: now, changeFrequency: 'weekly', priority: 0.7 } },
			{ path: '/authors', opts: { lastModified: now, changeFrequency: 'monthly', priority: 0.5 } },
			{ path: '/case-studies', opts: { lastModified: now, changeFrequency: 'monthly', priority: 0.7 } },
			{ path: '/resources', opts: { lastModified: now, changeFrequency: 'monthly', priority: 0.7 } },
		];

	const staticRoutes: SitemapEntry[] = staticPaths.flatMap((s) =>
		withLocaleAlternates(s.path, s.opts),
	);

	// 一覧用 metadata は locale 非依存（slug, publishedAt のみ使う）。
	// 'ja' を渡しているが、URL/日付しか参照しないのでロケールに依存しない。
	const whitepaperRoutes: SitemapEntry[] = getWhitepapers('ja').flatMap((wp) =>
		withLocaleAlternates(`/resources/${wp.slug}`, {
			lastModified: new Date(wp.publishedAt),
			changeFrequency: 'monthly',
			priority: 0.6,
		}),
	);

	const [
		posts,
		services,
		careers,
		features,
		authors,
		caseStudies,
		topics,
		industries,
		readingLevels,
	] = await Promise.all([
		getPosts(),
		getServices(),
		getCareers(),
		getFeatures(),
		getAuthors(),
		getCaseStudies(),
		getTopics(),
		getIndustries(),
		getReadingLevels(),
	]);

	const dynamicRoutes: SitemapEntry[] = [
		...posts.flatMap((p) =>
			withLocaleAlternates(`/articles/${p.slug}`, {
				lastModified: p.modified ? new Date(p.modified) : now,
				changeFrequency: 'weekly',
				priority: 0.7,
			}),
		),
		...services.flatMap((s) =>
			withLocaleAlternates(`/services/${s.slug}`, {
				lastModified: s.modified ? new Date(s.modified) : now,
				changeFrequency: 'monthly',
				priority: 0.7,
			}),
		),
		...careers.flatMap((c) =>
			withLocaleAlternates(`/careers/${c.slug}`, {
				lastModified: c.modified ? new Date(c.modified) : now,
				changeFrequency: 'weekly',
				priority: 0.6,
			}),
		),
		...features.flatMap((f) =>
			withLocaleAlternates(`/features/${f.slug}`, {
				lastModified: f.modified ? new Date(f.modified) : now,
				changeFrequency: 'weekly',
				priority: 0.6,
			}),
		),
		...authors.flatMap((a) =>
			withLocaleAlternates(`/authors/${a.slug}`, {
				lastModified: a.modified ? new Date(a.modified) : now,
				changeFrequency: 'monthly',
				priority: 0.4,
			}),
		),
		...caseStudies.flatMap((cs) =>
			withLocaleAlternates(`/case-studies/${cs.slug}`, {
				lastModified: cs.modified ? new Date(cs.modified) : now,
				changeFrequency: 'monthly',
				priority: 0.7,
			}),
		),
		...topics.flatMap((t) =>
			withLocaleAlternates(`/topic/${decodeURIComponent(t.slug)}`, {
				lastModified: now,
				changeFrequency: 'weekly',
				priority: 0.5,
			}),
		),
		...industries.flatMap((t) =>
			withLocaleAlternates(`/industry/${decodeURIComponent(t.slug)}`, {
				lastModified: now,
				changeFrequency: 'weekly',
				priority: 0.5,
			}),
		),
		...readingLevels.flatMap((t) =>
			withLocaleAlternates(`/reading-level/${decodeURIComponent(t.slug)}`, {
				lastModified: now,
				changeFrequency: 'weekly',
				priority: 0.4,
			}),
		),
	];

	// 参照されていない（lint回避）
	void routing;

	return [...staticRoutes, ...whitepaperRoutes, ...dynamicRoutes];
}
