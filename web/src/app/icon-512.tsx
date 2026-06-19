/**
 * PWA 用 512x512 アイコン。
 *
 * インストール時のスプラッシュ画面・各ストアでの大サイズ表示用。
 * デザインはブランドの北極星（lib/brand-icon）で統一。
 */

import { renderStarIcon } from '@/lib/brand-icon';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
	return renderStarIcon(512);
}
