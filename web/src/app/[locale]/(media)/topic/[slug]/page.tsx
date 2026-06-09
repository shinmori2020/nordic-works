/**
 * トピック別記事一覧ページ — /topic/[slug]
 */

import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { localeAlternates } from '@/lib/site';
import { notFound } from 'next/navigation';
import {
	getPostsByTerm,
	getTermBySlug,
	getTopics,
} from '@/lib/wordpress';
import { TaxonomyArticleList } from '@/components/media/TaxonomyArticleList';
import { localizeTermName, termSlug } from '@/lib/taxonomy';
import type { SlugPageProps } from '@/types/wordpress';

export const revalidate = 3600;

export async function generateStaticParams() {
	const terms = await getTopics();
	// API の slug は URL エンコード済み（日本語）。Next.js が再エンコードしないよう
	// デコードした値で静的パスを生成する。
	return terms.map((term) => ({ slug: termSlug(term) }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const t = await getTranslations('taxonomy');
	const term = await getTermBySlug('topic', slug);
	if (!term) return { title: t('notFound') };
	const name = localizeTermName(term.name, await getLocale());
	return {
		title: t('metaTitle', { name }),
		description: t('metaDescription', { name }),
		alternates: localeAlternates(`/topic/${termSlug(term)}`),
	};
}

export default async function TopicPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const term = await getTermBySlug('topic', slug);
	if (!term) notFound();

	const posts = await getPostsByTerm('topic', term.id);

	return <TaxonomyArticleList taxonomyLabel="Topic" term={term} posts={posts} />;
}
