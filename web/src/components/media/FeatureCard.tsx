/**
 * 特集カードコンポーネント。
 *
 * トップページの注目特集、特集一覧ページで使用。
 * 横長の大きめレイアウト（デスクトップでは画像左・テキスト右）。Server Component。
 */

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { WPFeature } from '@/types/wordpress';
import { getFeaturedImage, stripHtml, BLUR_DATA_URL } from '@/lib/utils';

export function FeatureCard({ feature }: { feature: WPFeature }) {
	const image = getFeaturedImage(feature);
	const lead = feature.acf?.lead_text
		? stripHtml(feature.acf.lead_text)
		: stripHtml(feature.content.rendered);

	return (
		<article className="group">
			<Link
				href={`/features/${feature.slug}`}
				className="grid gap-5 sm:grid-cols-2 sm:items-center"
			>
				<div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
					{image ? (
						<Image
							src={image.source_url}
							alt={image.alt_text || feature.title.rendered}
							fill
							sizes="(max-width: 640px) 100vw, 50vw"
							placeholder="blur"
							blurDataURL={BLUR_DATA_URL}
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full items-center justify-center text-sm text-zinc-300 dark:text-zinc-600">
							No Image
						</div>
					)}
				</div>

				<div>
					<p className="text-xs uppercase tracking-widest text-zinc-500">特集</p>
					<h3 className="mt-2 text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-zinc-500">
						{feature.title.rendered}
					</h3>
					<p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{lead}</p>
				</div>
			</Link>
		</article>
	);
}
