/**
 * PWA 用 512x512 アイコン。
 *
 * インストール時のスプラッシュ画面・各ストアでの大サイズ表示用。
 * 192x192 と同じビジュアル方針で、サイズだけ拡大する。
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
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
					fontSize: 320,
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
