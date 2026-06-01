/**
 * 記事詳細ページのローディングスケルトン。
 * パンくず・タイトル・メタ・アイキャッチ・本文行を模した表示。
 */

import { Skeleton } from '@/components/common/Skeleton';

export default function Loading() {
	return (
		<div
			role="status"
			aria-label="Loading"
			className="mx-auto max-w-6xl px-6 py-12"
		>
			{/* パンくず */}
			<Skeleton className="h-3 w-48" />

			<div className="mt-6">
				{/* タグ */}
				<div className="flex gap-2">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-20" />
				</div>

				{/* タイトル */}
				<Skeleton className="mt-3 h-9 w-3/4" />
				<Skeleton className="mt-2 h-9 w-1/2" />

				{/* メタ */}
				<Skeleton className="mt-4 h-4 w-64" />

				{/* アイキャッチ */}
				<Skeleton className="mt-6 aspect-[16/9] w-full rounded-lg" />

				{/* 本文行 */}
				<div className="mt-8 space-y-3">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton
							key={i}
							className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
