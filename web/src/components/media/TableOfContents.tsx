/**
 * 記事目次（Client Component）。
 *
 * buildTableOfContents() が抽出した見出しを一覧表示し、
 * IntersectionObserver で現在地の見出しをハイライトする。
 */

'use client';

import { useEffect, useState } from 'react';
import type { TocHeading } from '@/lib/toc';

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
	const [activeId, setActiveId] = useState('');

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActiveId(entry.target.id);
				}
			},
			// 見出しが画面上部1/3に来たらアクティブ扱い
			{ rootMargin: '0px 0px -66% 0px' },
		);

		for (const h of headings) {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [headings]);

	if (headings.length === 0) return null;

	return (
		<nav
			aria-label="目次"
			className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
		>
			<p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
				目次
			</p>
			<ul className="mt-3 space-y-1.5">
				{headings.map((h) => {
					const active = h.id === activeId;
					return (
						<li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
							<a
								href={`#${h.id}`}
								className={`block text-sm transition-colors ${
									active
										? 'font-medium text-zinc-900 dark:text-zinc-100'
										: 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
								}`}
							>
								{h.text}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
