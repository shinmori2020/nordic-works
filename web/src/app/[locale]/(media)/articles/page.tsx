/**
 * 記事一覧ページ — /articles
 *
 * WordPress に投入した全記事をカード形式で一覧表示する。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';

// ISR: 1時間ごとに再生成（docs/06-features.md の方針）
export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'articles' });
	return {
		title: t('title'),
		description: t('metaDescription'),
		alternates: localeAlternates('/articles'),
	};
}

export default async function ArticlesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('articles');
	const posts = await getPosts();

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<header className="mb-10">
				<Link
					href="/"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
				>
					{t('backHome')}
				</Link>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('title')}
				</h1>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
					{t('count', { count: posts.length })}
				</p>
			</header>

			{posts.length === 0 ? (
				<p className="text-sm text-red-600">{t('fetchError')}</p>
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
