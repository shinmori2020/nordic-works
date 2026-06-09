/**
 * 読了レベル別記事一覧ページ — /reading-level/[slug]
 *
 * URL は reading-level（ハイフン）だが、REST API のタクソノミーキーは reading_level。
 */

import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { localeAlternates } from '@/lib/site';
import { notFound } from 'next/navigation';
import {
	getPostsByTerm,
	getReadingLevels,
	getTermBySlug,
} from '@/lib/wordpress';
import { TaxonomyArticleList } from '@/components/media/TaxonomyArticleList';
import { localizeTermName, termSlug } from '@/lib/taxonomy';
import type { SlugPageProps } from '@/types/wordpress';

export const revalidate = 3600;

export async function generateStaticParams() {
	const terms = await getReadingLevels();
	return terms.map((term) => ({ slug: termSlug(term) }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const t = await getTranslations('taxonomy');
	const term = await getTermBySlug('reading_level', slug);
	if (!term) return { title: t('notFound') };
	const name = localizeTermName(term.name, await getLocale());
	return {
		title: t('metaTitle', { name }),
		description: t('metaDescription', { name }),
		alternates: localeAlternates(`/reading-level/${termSlug(term)}`),
	};
}

export default async function ReadingLevelPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const term = await getTermBySlug('reading_level', slug);
	if (!term) notFound();

	const posts = await getPostsByTerm('reading_level', term.id);

	return <TaxonomyArticleList taxonomyLabel="Reading Level" term={term} posts={posts} />;
}
