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
							color: '#09090b',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 44,
							fontWeight: 700,
						}}
					>
						N
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
