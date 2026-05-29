/**
 * パンくずリスト（Server Component）。
 *
 * - 最後の項目は現在ページ（href なし）として描画
 * - schema.org BreadcrumbList の JSON-LD を同時出力（SEO 構造化データ）
 */

import Link from 'next/link';
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
}

export function Breadcrumbs({ items, className }: Props) {
	if (items.length === 0) return null;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			...(item.href ? { item: absoluteUrl(item.href) } : {}),
		})),
	};

	return (
		<nav aria-label="パンくず" className={className}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<ol className="flex flex-wrap items-center gap-x-1.5 text-xs text-zinc-500">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<li key={`${item.label}-${index}`} className="flex items-center gap-x-1.5">
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
								<span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
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
