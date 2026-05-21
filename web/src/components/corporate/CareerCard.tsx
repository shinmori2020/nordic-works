/**
 * 採用情報カードコンポーネント。
 *
 * 採用情報一覧ページで1求人を表示する。Server Component。
 * 求人にはアイキャッチ画像が無いため、テキスト主体のカードレイアウト。
 */

import Link from 'next/link';
import type { WPCareer } from '@/types/wordpress';
import { positionTypeLabel } from '@/lib/utils';

export function CareerCard({ career }: { career: WPCareer }) {
	const acf = career.acf;

	return (
		<article className="group">
			<Link
				href={`/careers/${career.slug}`}
				className="flex h-full flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 transition-colors hover:border-zinc-400 dark:hover:border-zinc-500"
			>
				<div className="flex flex-wrap items-center gap-2">
					{acf?.position_type && (
						<span className="rounded bg-zinc-900 dark:bg-zinc-100 px-2 py-0.5 text-xs text-white dark:text-zinc-900">
							{positionTypeLabel(acf.position_type)}
						</span>
					)}
					{acf?.location && (
						<span className="text-xs text-zinc-500">{acf.location}</span>
					)}
				</div>

				<h2 className="mt-3 font-semibold leading-snug text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-zinc-500">
					{career.title.rendered}
				</h2>

				{acf?.salary_range && (
					<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{acf.salary_range}</p>
				)}

				<span className="mt-4 text-sm text-zinc-500 transition-colors group-hover:text-zinc-900 dark:hover:text-zinc-100">
					詳細を見る →
				</span>
			</Link>
		</article>
	);
}
