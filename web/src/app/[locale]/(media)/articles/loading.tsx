/**
 * 記事一覧ページのローディングスケルトン。
 * ヘッダー + カードグリッド（6枚）を模した表示。
 */

import { Skeleton } from '@/components/common/Skeleton';
import { ArticleCardSkeleton } from '@/components/media/ArticleCardSkeleton';

export default function Loading() {
	return (
		<div
			role="status"
			aria-label="Loading"
			className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
		>
			<div className="mb-10 space-y-3">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-4 w-32" />
			</div>
			<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<ArticleCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
