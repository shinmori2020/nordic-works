/**
 * 言語切替ドロップダウン（Client Component）。
 *
 * 現在ロケールを表示し、クリックで他ロケールへ。
 * URL のパス部分（locale を除く）を維持したまま遷移する。
 * 動的セグメント（[slug] 等）も保持される — next-intl の Link が自動処理。
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher() {
	const locale = useLocale();
	const pathname = usePathname();
	const t = useTranslations('languageSwitcher');
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// 外側クリックで閉じる
	useEffect(() => {
		if (!open) return;
		const onDocClick = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, [open]);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-label={t('label')}
				aria-haspopup="menu"
				aria-expanded={open}
				className="flex h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
					<path
						d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"
						stroke="currentColor"
						strokeWidth="1.4"
					/>
				</svg>
				<span className="uppercase">{locale}</span>
			</button>

			{open && (
				<ul
					role="menu"
					className="absolute right-0 top-full z-50 mt-1 min-w-32 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
				>
					{routing.locales.map((loc) => {
						const isActive = loc === locale;
						return (
							<li key={loc} role="none">
								<Link
									href={pathname}
									locale={loc}
									onClick={() => setOpen(false)}
									role="menuitem"
									aria-current={isActive ? 'true' : undefined}
									className={`block px-4 py-2 text-sm transition-colors ${
										isActive
											? 'bg-zinc-50 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
											: 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
									}`}
								>
									{t(loc)}
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
