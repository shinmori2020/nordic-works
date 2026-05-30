/**
 * ライト/ダーク切替ボタン（Client Component）。
 *
 * マウント前は実際のテーマが不明（SSRとの不一致を避ける）ため、
 * プレースホルダーを描画してから本物のアイコンに差し替える。
 */

'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const t = useTranslations('nav');

	useEffect(() => setMounted(true), []);

	const isDark = resolvedTheme === 'dark';

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
			aria-label={mounted ? (isDark ? t('toLightMode') : t('toDarkMode')) : t('toggleTheme')}
		>
			{!mounted ? (
				<span className="h-5 w-5" aria-hidden="true" />
			) : isDark ? (
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
					<path
						d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinecap="round"
					/>
				</svg>
			) : (
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinejoin="round"
					/>
				</svg>
			)}
		</button>
	);
}
