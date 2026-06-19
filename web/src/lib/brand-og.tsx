/**
 * OGP / Twitter カード共通のブランド画像レンダラ。
 *
 * opengraph-image.tsx と twitter-image.tsx の両方から呼ぶ。
 * （metadata route の default を直接 re-export すると Turbopack が
 *  ビルドエラーになるため、生成ロジックをここに集約する。）
 *
 * ImageResponse のデフォルトフォントは日本語非対応のため、文字は英語表記。
 */

import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const OG_SIZE = { width: 1200, height: 630 };

// アクセント色（フィヨルドブルー）の北極星。白い角丸スクエアの中に配置する。
const STAR_ACCENT_DATA_URI =
	'data:image/svg+xml;base64,' +
	btoa(
		"<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='#3d5a80'><path d='M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z'/></svg>",
	);

export function renderBrandOgImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					background: '#09090b',
					color: '#ffffff',
					padding: '72px',
					fontFamily: 'system-ui, sans-serif',
				}}
			>
				{/* 上部: ブランドマーク */}
				<div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
					<div
						style={{
							width: 64,
							height: 64,
							borderRadius: 12,
							background: '#ffffff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img width={40} height={40} src={STAR_ACCENT_DATA_URI} alt="" />
					</div>
					<span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
						{SITE_NAME}
					</span>
				</div>

				{/* 中央: タグライン */}
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span
						style={{
							fontSize: 68,
							fontWeight: 700,
							lineHeight: 1.1,
							letterSpacing: '-0.03em',
						}}
					>
						Design the way you work,
					</span>
					<span
						style={{
							fontSize: 68,
							fontWeight: 700,
							lineHeight: 1.1,
							letterSpacing: '-0.03em',
							color: '#a1a1aa',
						}}
					>
						with Nordic wisdom.
					</span>
				</div>

				{/* 下部: 補足 */}
				<span style={{ fontSize: 26, color: '#71717a' }}>
					Remote work · Psychological safety · Organisation design
				</span>
			</div>
		),
		{ ...OG_SIZE },
	);
}
