/**
 * ロケール配下の汎用ローディングフォールバック。
 *
 * 専用 loading.tsx を持たないルート（services / careers / case-studies /
 * resources / authors など一覧系）のサスペンス境界として機能する。
 * 「ヘッダー + カードグリッド」を模した汎用スケルトン。
 */

import { Skeleton } from '@/components/common/Skeleton';
import { ArticleCardSkeleton } from '@/components/media/ArticleCardSkeleton';

export default function Loading() {
	return (
		<div
			role="status"
			aria-label="Loading"
			className="mx-auto max-w-6xl px-6 py-12"
		>
			<div className="mb-10 space-y-3">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-9 w-56" />
				<Skeleton className="h-4 w-40" />
			</div>
			<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<ArticleCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
