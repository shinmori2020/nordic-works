/**
 * Cookie 同意バナー（Client Component）。
 *
 * - 初回アクセス時のみ画面下部に表示
 * - 「同意」または「拒否」を選ぶと localStorage に記録、以後表示しない
 * - 同意状態は他コンポーネントから getCookieConsent() で参照可能
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const STORAGE_KEY = 'nordic-cookie-consent';
type Consent = 'accepted' | 'declined';

/** 他コンポーネントから同意状態を読む（"未選択" は null） */
export function getCookieConsent(): Consent | null {
	if (typeof window === 'undefined') return null;
	const v = window.localStorage.getItem(STORAGE_KEY);
	return v === 'accepted' || v === 'declined' ? v : null;
}

export function CookieConsent() {
	const t = useTranslations('cookie');
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (getCookieConsent() === null) {
			setVisible(true);
		}
	}, []);

	const decide = (consent: Consent) => {
		window.localStorage.setItem(STORAGE_KEY, consent);
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div
			role="dialog"
			aria-label={t('privacyLink')}
			className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
		>
			<div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					{t('message')}
					{' '}
					<Link
						href="/privacy"
						className="underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						{t('privacyLink')}
					</Link>
					{t('messageSuffix')}
				</p>
				<div className="flex shrink-0 gap-2">
					<button
						type="button"
						onClick={() => decide('declined')}
						className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
					>
						{t('decline')}
					</button>
					<button
						type="button"
						onClick={() => decide('accepted')}
						className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
					>
						{t('accept')}
					</button>
				</div>
			</div>
		</div>
	);
}
