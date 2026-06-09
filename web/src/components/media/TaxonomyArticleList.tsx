/**
 * タクソノミー詳細ページの共通レンダラ。
 *
 * /topic/[slug]・/industry/[slug]・/reading-level/[slug] の3ルートで
 * 「ラベル + ターム名 + 該当記事のグリッド」を同じ見た目で描画する。
 */

import { getLocale, getTranslations } from 'next-intl/server';
import type { WPPost, WPTerm } from '@/types/wordpress';
import { ArticleCard } from './ArticleCard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { localizeTermName } from '@/lib/taxonomy';

interface Props {
	/** タクソノミー区分の表示ラベル（例: "トピック"） */
	taxonomyLabel: string;
	term: WPTerm;
	posts: WPPost[];
}

export async function TaxonomyArticleList({ taxonomyLabel, term, posts }: Props) {
	const locale = await getLocale();
	const t = await getTranslations('taxonomy');
	const termName = localizeTermName(term.name, locale);
	return (
		<main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
			<header className="mb-10">
				<Breadcrumbs
					items={[
						{ label: 'Insights', href: '/articles' },
						{ label: termName },
					]}
				/>
				<div className="mt-5 mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{taxonomyLabel}
				</p>
				<h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{termName}
				</h1>
				<p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
					{t('count', { count: posts.length })}
				</p>
			</header>

			{posts.length === 0 ? (
				<p className="text-sm text-zinc-500">{t('empty')}</p>
			) : (
				<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<ArticleCard key={post.id} post={post} />
					))}
				</div>
			)}
		</main>
	);
}
