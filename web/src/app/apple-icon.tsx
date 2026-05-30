/**
 * iOS ホーム画面追加時のアイコン（180x180）。
 *
 * Next.js Metadata Files の規約により app/apple-icon.tsx は
 * <link rel="apple-touch-icon"> として自動で <head> に注入される。
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
					fontSize: 110,
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
