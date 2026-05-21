/**
 * タクソノミー詳細ページの共通レンダラ。
 *
 * /topic/[slug]・/industry/[slug]・/reading-level/[slug] の3ルートで
 * 「ラベル + ターム名 + 該当記事のグリッド」を同じ見た目で描画する。
 */

import Link from 'next/link';
import type { WPPost, WPTerm } from '@/types/wordpress';
import { ArticleCard } from './ArticleCard';

interface Props {
	/** タクソノミー区分の表示ラベル（例: "トピック"） */
	taxonomyLabel: string;
	term: WPTerm;
	posts: WPPost[];
}

export function TaxonomyArticleList({ taxonomyLabel, term, posts }: Props) {
	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<header className="mb-10">
				<Link
					href="/articles"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
				>
					← 記事一覧に戻る
				</Link>
				<p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">
					{taxonomyLabel}
				</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{term.name}</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					このタームに該当する記事 {posts.length} 件
				</p>
			</header>

			{posts.length === 0 ? (
				<p className="text-sm text-zinc-500">該当する記事はまだありません。</p>
			) : (
				<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<ArticleCard key={post.id} post={post} />
					))}
				</div>
			)}
		</main>
	);
}
