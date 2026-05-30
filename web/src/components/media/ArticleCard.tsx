/**
 * 記事カードコンポーネント。
 *
 * 記事一覧ページ等で1記事を表示する。Server Component。
 */

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { WPPost } from '@/types/wordpress';
import { getFeaturedImage, getTerms, stripHtml, formatDate } from '@/lib/utils';

export function ArticleCard({ post }: { post: WPPost }) {
	const image = getFeaturedImage(post);
	const topics = getTerms(post, 'topic');
	const excerpt = stripHtml(post.excerpt.rendered);

	return (
		<article className="group">
			<Link href={`/articles/${post.slug}`} className="block">
				<div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
					{image ? (
						<Image
							src={image.source_url}
							alt={image.alt_text || post.title.rendered}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full items-center justify-center text-sm text-zinc-300 dark:text-zinc-600">
							No Image
						</div>
					)}
				</div>

				<div className="mt-3">
					{topics.length > 0 && (
						<p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
							{topics[0].name}
						</p>
					)}
					<h2 className="font-semibold leading-snug text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-zinc-500">
						{post.title.rendered}
					</h2>
					<p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{excerpt}</p>
					<div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
						<time dateTime={post.date}>{formatDate(post.date)}</time>
						{typeof post.acf?.reading_time === 'number' && (
							<span>· {post.acf.reading_time}分で読めます</span>
						)}
					</div>
				</div>
			</Link>
		</article>
	);
}
