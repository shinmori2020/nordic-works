/**
 * 記事一覧のトピック・チップ（絞り込み導線）。
 * /articles と /articles/page/[page] で共通利用する。Server Component。
 * 見出しは各ページの PageHero（扉ヘッダー）が担当し、ここはチップ行のみ。
 */
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localizeTermName, termSlug } from '@/lib/taxonomy';
import type { WPTerm } from '@/types/wordpress';

export async function ArticleListIntro({
	topics,
	locale,
}: {
	topics: WPTerm[];
	locale: string;
}) {
	if (topics.length === 0) return null;
	const t = await getTranslations('articles');

	return (
		<nav aria-label={t('topicsLabel')} className="mb-12 flex flex-wrap gap-2">
			{topics.map((topic) => (
				<Link
					key={topic.id}
					href={`/topic/${termSlug(topic)}`}
					className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-accent hover:text-accent-text dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-accent"
				>
					{localizeTermName(topic.name, locale)}
				</Link>
			))}
		</nav>
	);
}
