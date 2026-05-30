/**
 * 著者カードコンポーネント。
 *
 * 著者一覧ページで1名を表示する。Server Component。
 * 顔写真は ACF image フィールド（photo）から取得する。
 */

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { WPAuthorProfile } from '@/types/wordpress';
import { getFeaturedImage } from '@/lib/utils';

export function AuthorCard({ author }: { author: WPAuthorProfile }) {
	const acf = author.acf;
	// 顔写真は ACF photo ではなくアイキャッチ画像（_embedded）から取得する。
	const photo = getFeaturedImage(author);

	return (
		<article className="group">
			<Link
				href={`/authors/${author.slug}`}
				className="flex h-full flex-col items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 text-center transition-colors hover:border-zinc-400 dark:hover:border-zinc-500"
			>
				<div className="relative h-24 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
					{photo ? (
						<Image
							src={photo.source_url}
							alt={photo.alt_text || author.title.rendered}
							fill
							sizes="96px"
							className="object-cover"
						/>
					) : (
						<div className="flex h-full items-center justify-center text-xs text-zinc-300 dark:text-zinc-600">
							No Photo
						</div>
					)}
				</div>

				<h2 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-zinc-500">
					{author.title.rendered}
				</h2>
				{acf?.position && (
					<p className="mt-1 text-sm text-zinc-500">{acf.position}</p>
				)}
			</Link>
		</article>
	);
}
