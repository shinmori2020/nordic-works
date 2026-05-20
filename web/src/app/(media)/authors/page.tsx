/**
 * 著者一覧ページ — /authors
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAuthors } from '@/lib/wordpress';
import { AuthorCard } from '@/components/media/AuthorCard';

// ISR: 著者情報は更新頻度が低いため24時間
export const revalidate = 86400;

export const metadata: Metadata = {
	title: '執筆者一覧',
	description: 'Nordic Works の記事を執筆するメンバーの一覧。',
	alternates: { canonical: '/authors' },
};

export default async function AuthorsPage() {
	const authors = await getAuthors();

	return (
		<main className="mx-auto max-w-5xl px-6 py-12">
			<header className="mb-10">
				<Link
					href="/"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
				>
					← ホーム
				</Link>
				<p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">Authors</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900">執筆者一覧</h1>
				<p className="mt-2 text-sm text-zinc-600">
					{authors.length} 名のメンバーが記事を執筆しています。
				</p>
			</header>

			{authors.length === 0 ? (
				<p className="text-sm text-red-600">
					⚠️ 著者情報を取得できませんでした。Local の WordPress が起動しているか確認してください。
				</p>
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
