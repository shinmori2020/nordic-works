/**
 * Twitter Card 用画像 — /twitter-image
 *
 * opengraph-image と同一デザイン。生成ロジックは lib/brand-og.tsx を共用。
 */

import { SITE_NAME } from '@/lib/site';
import { renderBrandOgImage, OG_SIZE } from '@/lib/brand-og';

export const runtime = 'edge';
export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function TwitterImage() {
	return renderBrandOgImage();
}
