/**
 * 汎用スケルトン（ローディングプレースホルダー）。
 *
 * animate-pulse で点滅。prefers-reduced-motion 時は点滅を止める。
 * 装飾要素なので aria-hidden。読み上げは loading.tsx 側の role="status" が担う。
 */

export function Skeleton({ className = '' }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={`animate-pulse rounded bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800 ${className}`}
		/>
	);
}
