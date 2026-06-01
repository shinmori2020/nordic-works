/**
 * サービスカードコンポーネント。
 *
 * トップページのサービス紹介、サービス一覧ページで使用。Server Component。
 */

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { WPService } from '@/types/wordpress';
import { getFeaturedImage, BLUR_DATA_URL } from '@/lib/utils';

export function ServiceCard({ service }: { service: WPService }) {
	const image = getFeaturedImage(service);

	return (
		<article className="group">
			<Link href={`/services/${service.slug}`} className="block">
				<div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
					{image ? (
						<Image
							src={image.source_url}
							alt={image.alt_text || service.title.rendered}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

				<div className="mt-4">
					<h3 className="font-semibold text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-zinc-500">
						{service.title.rendered}
					</h3>
					{service.acf?.subtitle && (
						<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{service.acf.subtitle}</p>
					)}
				</div>
			</Link>
		</article>
	);
}
