/**
 * サイト共通の OGP 画像（1200x630）— /opengraph-image
 *
 * Next.js Metadata Files の規約により app/opengraph-image.tsx は
 * 全ページの og:image のデフォルトになる（各ページが個別指定しない限り）。
 * 生成ロジックは lib/brand-og.tsx に集約（twitter-image.tsx と共用）。
 */

import { SITE_NAME } from '@/lib/site';
import { renderBrandOgImage, OG_SIZE } from '@/lib/brand-og';

export const runtime = 'edge';
export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
	return renderBrandOgImage();
}
