/**
 * トピック別記事一覧ページ — /topic/[slug]
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getPostsByTerm,
	getTermBySlug,
	getTopics,
} from '@/lib/wordpress';
import { TaxonomyArticleList } from '@/components/media/TaxonomyArticleList';
import type { SlugPageProps } from '@/types/wordpress';

export const revalidate = 3600;

export async function generateStaticParams() {
	const terms = await getTopics();
	// API の slug は URL エンコード済み（日本語）。Next.js が再エンコードしないよう
	// デコードした値で静的パスを生成する。
	return terms.map((term) => ({ slug: decodeURIComponent(term.slug) }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const term = await getTermBySlug('topic', slug);
	if (!term) return { title: 'トピックが見つかりません' };
	return {
		title: `${term.name} の記事`,
		description: `「${term.name}」に関連する Nordic Works の記事一覧。`,
		alternates: { canonical: `/topic/${decodeURIComponent(term.slug)}` },
	};
}

export default async function TopicPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const term = await getTermBySlug('topic', slug);
	if (!term) notFound();

	const posts = await getPostsByTerm('topic', term.id);

	return <TaxonomyArticleList taxonomyLabel="Topic" term={term} posts={posts} />;
}
