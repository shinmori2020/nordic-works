/**
 * Web App Manifest — /manifest.webmanifest
 *
 * Next.js Metadata Files の規約により app/manifest.ts は
 * 自動で /manifest.webmanifest にホストされる。
 * <link rel="manifest"> も自動で <head> に注入される。
 *
 * アイコンは app/icon-192.tsx / app/icon-512.tsx で
 * ImageResponse により動的生成（同一PNGを2サイズで提供）。
 */

import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: SITE_NAME,
		short_name: SITE_NAME,
		description: SITE_DESCRIPTION,
		start_url: '/',
		scope: '/',
		display: 'standalone',
		orientation: 'portrait',
		background_color: '#ffffff',
		theme_color: '#18181b',
		lang: 'ja',
		categories: ['business', 'productivity', 'education'],
		icons: [
			{
				src: '/icon-192',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icon-512',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icon-512',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	};
}
