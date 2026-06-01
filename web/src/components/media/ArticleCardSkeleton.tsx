/**
 * ArticleCard のスケルトン版。記事一覧/グリッドのローディング表示に使う。
 * 実際の ArticleCard と同じ比率・余白に合わせ、レイアウトシフトを最小化する。
 */

import { Skeleton } from '@/components/common/Skeleton';

export function ArticleCardSkeleton() {
	return (
		<div>
			<Skeleton className="aspect-[16/9] w-full rounded-lg" />
			<div className="mt-3 space-y-2">
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-3 w-28" />
			</div>
		</div>
	);
}
