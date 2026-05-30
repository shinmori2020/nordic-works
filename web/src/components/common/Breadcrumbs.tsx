/**
 * パンくずリスト（Server Component）。
 *
 * - 最後の項目は現在ページ（href なし）として描画
 * - schema.org BreadcrumbList の JSON-LD を同時出力（SEO 構造化データ）
 * - 内部リンクは next-intl の Link を使い、現在ロケールのプレフィックスを保持
 * - ホーム項目（"ホーム" / "Home"）は自動で先頭に付与する（includeHome=false で抑制可）
 */

import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { absoluteUrl } from '@/lib/site';

export interface BreadcrumbItem {
	/** 表示ラベル */
	label: string;
	/** リンク先。最後の項目（現在ページ）は省略 */
	href?: string;
}

interface Props {
	items: BreadcrumbItem[];
	className?: string;
	/** デフォルト true。先頭に「ホーム / Home」を自動付与する。 */
	includeHome?: boolean;
}

export async function Breadcrumbs({ items, className, includeHome = true }: Props) {
	if (items.length === 0) return null;

	const t = await getTranslations('breadcrumbs');
	const tCommon = await getTranslations('common');

	const allItems: BreadcrumbItem[] = includeHome
		? [{ label: tCommon('home'), href: '/' }, ...items]
		: items;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: allItems.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			...(item.href ? { item: absoluteUrl(item.href) } : {}),
		})),
	};

	return (
		<nav aria-label={t('label')} className={className}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<ol className="flex flex-wrap items-center gap-x-1.5 text-xs text-zinc-500">
				{allItems.map((item, index) => {
					const isLast = index === allItems.length - 1;
					return (
						<li
							key={`${item.label}-${index}`}
							className="flex items-center gap-x-1.5"
						>
							{item.href && !isLast ? (
								<Link
									href={item.href}
									className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
								>
									{item.label}
								</Link>
							) : (
								<span
									className="text-zinc-700 dark:text-zinc-300"
									aria-current={isLast ? 'page' : undefined}
								>
									{item.label}
								</span>
							)}
							{!isLast && (
								<span
									aria-hidden="true"
									className="text-zinc-300 dark:text-zinc-700"
								>
									/
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
