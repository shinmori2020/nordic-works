/**
 * iOS ホーム画面追加時のアイコン（180x180）。
 *
 * Next.js Metadata Files の規約により app/apple-icon.tsx は
 * <link rel="apple-touch-icon"> として自動で <head> に注入される。
 * デザインはブランドの北極星（lib/brand-icon）で統一。
 */

import { renderStarIcon } from '@/lib/brand-icon';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
	return renderStarIcon(180);
}
