/**
 * 業界別記事一覧ページ — /industry/[slug]
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getIndustries,
	getPostsByTerm,
	getTermBySlug,
} from '@/lib/wordpress';
import { TaxonomyArticleList } from '@/components/media/TaxonomyArticleList';
import type { SlugPageProps } from '@/types/wordpress';

export const revalidate = 3600;

export async function generateStaticParams() {
	const terms = await getIndustries();
	return terms.map((term) => ({ slug: decodeURIComponent(term.slug) }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const term = await getTermBySlug('industry', slug);
	if (!term) return { title: '業界が見つかりません' };
	return {
		title: `${term.name} の記事`,
		description: `「${term.name}」業界に関連する Nordic Works の記事一覧。`,
	};
}

export default async function IndustryPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const term = await getTermBySlug('industry', slug);
	if (!term) notFound();

	const posts = await getPostsByTerm('industry', term.id);

	return <TaxonomyArticleList taxonomyLabel="Industry" term={term} posts={posts} />;
}
