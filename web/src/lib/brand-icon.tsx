/**
 * ブランドアイコン（北極星）の共通レンダラ。
 *
 * apple-icon / icon-192 / icon-512 から呼ぶ。フィヨルドブルー地に
 * 白い北極星を中央配置した正方形アイコンを ImageResponse で生成する。
 * 形状はヘッダー/フッターの StarMark と同じ path。
 */

import { ImageResponse } from 'next/og';

const ACCENT = '#3d5a80';

// 白い北極星の SVG（Satori 用に <img> base64 data URI で渡す）
const STAR_SVG =
	"<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='#ffffff'><path d='M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z'/></svg>";
const STAR_DATA_URI = 'data:image/svg+xml;base64,' + btoa(STAR_SVG);

export function renderStarIcon(px: number) {
	const star = Math.round(px * 0.62);
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: ACCENT,
				}}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img width={star} height={star} src={STAR_DATA_URI} alt="" />
			</div>
		),
		{ width: px, height: px },
	);
}
