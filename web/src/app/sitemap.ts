/**
 * 動的サイトマップ — /sitemap.xml
 *
 * 静的ルート（一覧ページ）と、各CPTの全エントリ、タクソノミー各タームを列挙する。
 * about / contact は未実装のため、敢えて含めない。
 */

import type { MetadataRoute } from 'next';
import {
	getAuthors,
	getCareers,
	getFeatures,
	getIndustries,
	getPosts,
	getReadingLevels,
	getServices,
	getTopics,
} from '@/lib/wordpress';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();

	const staticRoutes: SitemapEntry[] = [
		{ url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
		{ url: absoluteUrl('/articles'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
		{ url: absoluteUrl('/features'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
		{ url: absoluteUrl('/services'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
		{ url: absoluteUrl('/careers'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
		{ url: absoluteUrl('/authors'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
	];

	// 全エントリを並行取得（失敗しても空配列で続行）
	const [posts, services, careers, features, authors, topics, industries, readingLevels] =
		await Promise.all([
			getPosts(),
			getServices(),
			getCareers(),
			getFeatures(),
			getAuthors(),
			getTopics(),
			getIndustries(),
			getReadingLevels(),
		]);

	const dynamicRoutes: SitemapEntry[] = [
		...posts.map<SitemapEntry>((p) => ({
			url: absoluteUrl(`/articles/${p.slug}`),
			lastModified: p.modified ? new Date(p.modified) : now,
			changeFrequency: 'weekly',
			priority: 0.7,
		})),
		...services.map<SitemapEntry>((s) => ({
			url: absoluteUrl(`/services/${s.slug}`),
			lastModified: s.modified ? new Date(s.modified) : now,
			changeFrequency: 'monthly',
			priority: 0.7,
		})),
		...careers.map<SitemapEntry>((c) => ({
			url: absoluteUrl(`/careers/${c.slug}`),
			lastModified: c.modified ? new Date(c.modified) : now,
			changeFrequency: 'weekly',
			priority: 0.6,
		})),
		...features.map<SitemapEntry>((f) => ({
			url: absoluteUrl(`/features/${f.slug}`),
			lastModified: f.modified ? new Date(f.modified) : now,
			changeFrequency: 'weekly',
			priority: 0.6,
		})),
		...authors.map<SitemapEntry>((a) => ({
			url: absoluteUrl(`/authors/${a.slug}`),
			lastModified: a.modified ? new Date(a.modified) : now,
			changeFrequency: 'monthly',
			priority: 0.4,
		})),
		...topics.map<SitemapEntry>((t) => ({
			url: absoluteUrl(`/topic/${decodeURIComponent(t.slug)}`),
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.5,
		})),
		...industries.map<SitemapEntry>((t) => ({
			url: absoluteUrl(`/industry/${decodeURIComponent(t.slug)}`),
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.5,
		})),
		...readingLevels.map<SitemapEntry>((t) => ({
			url: absoluteUrl(`/reading-level/${decodeURIComponent(t.slug)}`),
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.4,
		})),
	];

	return [...staticRoutes, ...dynamicRoutes];
}
