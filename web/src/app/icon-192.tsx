/**
 * PWA 用 192x192 アイコン。manifest.ts の icons 配列から参照。
 * デザインはブランドの北極星（lib/brand-icon）で統一。
 */

import { renderStarIcon } from '@/lib/brand-icon';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
	return renderStarIcon(192);
}
