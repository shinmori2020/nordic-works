/**
 * PWA 用 192x192 アイコン。
 *
 * Next.js Metadata Files の規約により app/icon-192.tsx は
 * /icon-192 にホストされる。manifest.ts の icons 配列から参照。
 *
 * ImageResponse による動的生成のため、画像ファイルを別途用意する必要がない。
 * 将来的にブランドロゴ画像が用意できたら static PNG に置き換える。
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#18181b',
					color: '#ffffff',
					fontSize: 120,
					fontWeight: 700,
					letterSpacing: '-0.04em',
					fontFamily: 'system-ui, sans-serif',
				}}
			>
				N
			</div>
		),
		{ ...size },
	);
}
