/**
 * 業界別記事一覧ページ — /industry/[slug]
 */

import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { localeAlternates } from '@/lib/site';
import { notFound } from 'next/navigation';
import {
	getIndustries,
	getPostsByTerm,
	getTermBySlug,
} from '@/lib/wordpress';
import { TaxonomyArticleList } from '@/components/media/TaxonomyArticleList';
import { localizeTermName, termSlug } from '@/lib/taxonomy';
import type { SlugPageProps } from '@/types/wordpress';

export const revalidate = 3600;

export async function generateStaticParams() {
	const terms = await getIndustries();
	return terms.map((term) => ({ slug: termSlug(term) }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const t = await getTranslations('taxonomy');
	const term = await getTermBySlug('industry', slug);
	if (!term) return { title: t('notFound') };
	const name = localizeTermName(term.name, await getLocale());
	return {
		title: t('metaTitle', { name }),
		description: t('metaDescription', { name }),
		alternates: localeAlternates(`/industry/${termSlug(term)}`),
	};
}

export default async function IndustryPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const term = await getTermBySlug('industry', slug);
	if (!term) notFound();

	const posts = await getPostsByTerm('industry', term.id);

	return <TaxonomyArticleList taxonomyLabel="Industry" term={term} posts={posts} />;
}
