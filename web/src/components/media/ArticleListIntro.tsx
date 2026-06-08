/**
 * 記事一覧の導入部（見出し＋トピックのチップ）。
 * /articles と /articles/page/[page] で共通利用する。Server Component。
 */
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localizeTermName } from '@/lib/taxonomy';
import type { WPTerm } from '@/types/wordpress';

export async function ArticleListIntro({
	topics,
	locale,
}: {
	topics: WPTerm[];
	locale: string;
}) {
	const t = await getTranslations('articles');

	return (
		<>
			<header className="mb-8">
				<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{t('label')}
				</p>
				<h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{t('title')}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					{t('description')}
				</p>
			</header>

			{topics.length > 0 && (
				<nav aria-label={t('topicsLabel')} className="mb-12 flex flex-wrap gap-2">
					{topics.map((topic) => (
						<Link
							key={topic.id}
							href={`/topic/${decodeURIComponent(topic.slug)}`}
							className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-accent hover:text-accent-text dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-accent"
						>
							{localizeTermName(topic.name, locale)}
						</Link>
					))}
				</nav>
			)}
		</>
	);
}
