/**
 * 北極星マーク（ブランドロゴの記号）。
 * ヘッダー／フッターで共有するため、形状（path）をここに一元化する。
 * 色・サイズ・アニメは利用側が className で指定する。
 */

export function StarMark({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
			<path
				pathLength={1}
				d="M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z"
			/>
		</svg>
	);
}
