/**
 * 記事一覧 ページネーション — /articles/page/[page]
 *
 * 2ページ目以降を担当する。1ページ目は /articles（親ルート）。
 * 各ページを静的生成し、SEO 上クロール可能にする。
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';
import { Pagination } from '@/components/common/Pagination';
import { ARTICLES_PER_PAGE } from '@/lib/utils';

export const revalidate = 3600;

// 2ページ目以降のページ番号を静的生成する（1ページ目は /articles が担当）。
export async function generateStaticParams() {
	const posts = await getPosts();
	const totalPages = Math.ceil(posts.length / ARTICLES_PER_PAGE);
	const params: { page: string }[] = [];
	for (let p = 2; p <= totalPages; p++) {
		params.push({ page: String(p) });
	}
	return params;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; page: string }>;
}): Promise<Metadata> {
	const { locale, page } = await params;
	const t = await getTranslations({ locale, namespace: 'articles' });
	const posts = await getPosts();
	const totalPages = Math.max(1, Math.ceil(posts.length / ARTICLES_PER_PAGE));
	const pageNum = Number(page);
	return {
		title: t('pageTitle', { page: pageNum, total: totalPages }),
		description: t('metaDescription'),
		alternates: localeAlternates(`/articles/page/${page}`),
	};
}

export default async function ArticlesPaginatedPage({
	params,
}: {
	params: Promise<{ locale: string; page: string }>;
}) {
	const { locale, page } = await params;
	setRequestLocale(locale);

	const pageNum = Number(page);
	// 数値でない・1以下のページは存在しない（1ページ目は /articles）。
	if (!Number.isInteger(pageNum) || pageNum < 2) {
		notFound();
	}

	const t = await getTranslations('articles');
	const posts = await getPosts();
	const totalPages = Math.max(1, Math.ceil(posts.length / ARTICLES_PER_PAGE));

	// 範囲外のページは 404。
	if (pageNum > totalPages) {
		notFound();
	}

	const start = (pageNum - 1) * ARTICLES_PER_PAGE;
	const pagePosts = posts.slice(start, start + ARTICLES_PER_PAGE);

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<header className="mb-10">
				<Link
					href="/articles"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
				>
					{t('backToList')}
				</Link>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('title')}
				</h1>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
					{t('pageTitle', { page: pageNum, total: totalPages })}
				</p>
			</header>

			<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
				{pagePosts.map((post) => (
					<ArticleCard key={post.id} post={post} />
				))}
			</div>

			<Pagination
				currentPage={pageNum}
				totalPages={totalPages}
				basePath="/articles"
			/>
		</main>
	);
}
