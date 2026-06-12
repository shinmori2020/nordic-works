/**
 * 各ページ共通の扉ヘッダー（Server Component）。
 *
 * 構成: パンくず → 大きな英字ワードマーク＋タグライン（2カラム）
 *       → 区切り線＋右下リンク（＋必要なら左側にチップ等）。
 *
 * about / contact / privacy と同じデザイン言語に、一覧・インデックス系ページの
 * 先頭を揃えるための共通部品。地色帯（bg-zinc-50）で全幅、内側は max-w-6xl。
 */

import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

interface PageHeroProps {
	/** パンくずの現在ページ名（「ホーム / ◯◯」の ◯◯）。 */
	breadcrumb: string;
	/** 大きな英字ワードマーク（例: Features）。uppercase 表示。 */
	wordmark: string;
	/** ワードマーク右のタグライン（説明の1文）。 */
	tagline: string;
	/** 区切り線の行・右下のリンク（例: Insights →）。 */
	bottomLink?: { href: string; label: string };
	/** 区切り線の行・左側に置く要素（例: トピックチップ・索引ナビ）。 */
	bottomStart?: ReactNode;
}

export function PageHero({
	breadcrumb,
	wordmark,
	tagline,
	bottomLink,
	bottomStart,
}: PageHeroProps) {
	const hasBottom = Boolean(bottomLink || bottomStart);
	return (
		<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
			<div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
				<Breadcrumbs items={[{ label: breadcrumb }]} />

				<div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr] md:items-end md:gap-12">
					<h1 className="text-6xl font-semibold uppercase leading-none tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-7xl md:text-8xl">
						{wordmark}
					</h1>
					<div className="md:pb-2">
						<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
						<p className="text-xl font-medium leading-snug tracking-tight text-zinc-700 dark:text-zinc-300 sm:text-2xl">
							{tagline}
						</p>
					</div>
				</div>

				{hasBottom && (
					<div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:mt-12">
						{bottomStart}
						{bottomLink && (
							<Link
								href={bottomLink.href}
								className="ml-auto inline-flex items-center gap-1 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
							>
								{bottomLink.label}
								<span aria-hidden="true">→</span>
							</Link>
						)}
					</div>
				)}
			</div>
		</section>
	);
}
