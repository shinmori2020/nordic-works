/**
 * 著者一覧ページ — /authors
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAuthors } from '@/lib/wordpress';
import { AuthorCard } from '@/components/media/AuthorCard';

// ISR: 著者情報は更新頻度が低いため24時間
export const revalidate = 86400;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'authors' });
	return {
		title: t('title'),
		description: t('description'),
		alternates: localeAlternates('/authors'),
	};
}

export default async function AuthorsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('authors');
	const tArticles = await getTranslations('articles');
	const authors = await getAuthors();

	return (
		<main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
			<header className="mb-10">
				<Link
					href="/"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
				>
					{tArticles('backHome')}
				</Link>
				<p className="mt-2 text-xs uppercase tracking-widest text-accent-text">
					{t('label')}
				</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('title')}
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					{t('description')}
				</p>
			</header>

			{authors.length === 0 ? (
				<p className="text-sm text-red-600">⚠️ {tArticles('fetchError')}</p>
			) : (
				<div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
					{authors.map((author) => (
						<AuthorCard key={author.id} author={author} />
					))}
				</div>
			)}
		</main>
	);
}
