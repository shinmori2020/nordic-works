/**
 * 検索ページ — /search
 *
 * Algolia による全文検索。URL ?q= を初期値として SearchClient に渡す。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchClient } from '@/components/search/SearchClient';

export const metadata: Metadata = {
	title: '検索',
	description: 'Nordic Works の記事を全文検索する。',
	alternates: { canonical: '/search' },
	robots: { index: false, follow: true },
};

interface PageProps {
	searchParams: Promise<{ q?: string; topic?: string; industry?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
	const { q = '' } = await searchParams;

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<header className="mb-8">
				<Link
					href="/articles"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
				>
					← 記事一覧に戻る
				</Link>
				<p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">Search</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
					検索
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					Algolia による全文検索。トピックや業界で絞り込みもできます。
				</p>
			</header>

			<SearchClient initialQuery={q} />
		</main>
	);
}
