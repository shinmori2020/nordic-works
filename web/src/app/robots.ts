/**
 * robots.txt — クローラ向けポリシー
 *
 * 全クローラに公開、Next.js の内部APIルートのみ拒否。
 * sitemap.xml の場所を明示する。
 */

import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: '/api/',
			},
		],
		sitemap: absoluteUrl('/sitemap.xml'),
	};
}
