/**
 * 著者一覧ページ — /authors
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAuthors } from '@/lib/wordpress';
import { AuthorCard } from '@/components/media/AuthorCard';
import { PageHero } from '@/components/common/PageHero';

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
	const tNav = await getTranslations('nav');
	const authors = await getAuthors();

	return (
		<main>
			<PageHero
				breadcrumb={t('title')}
				wordmark={t('label')}
				tagline={t('description')}
				anchors={[{ no: '01', label: t('title'), href: '#authors-list' }]}
				bottomLink={{ href: '/articles', label: tNav('insights') }}
			/>

			<section
				id="authors-list"
				className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20"
			>
				{authors.length === 0 ? (
					<p className="text-sm text-red-600">⚠️ {tArticles('fetchError')}</p>
				) : (
					<div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
						{authors.map((author) => (
							<AuthorCard key={author.id} author={author} />
						))}
					</div>
				)}
			</section>
		</main>
	);
}
