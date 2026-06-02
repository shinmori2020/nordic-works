/**
 * ニュースレター登録フォーム（Client Component）。
 *
 * 2つのバリアント:
 *  - "compact": フッター用。横並びの email + ボタン + 同意チェック
 *  - "standard": 記事末尾・LP用。説明文 + 縦並びフィールド
 *
 * 成功時はインラインで完了メッセージに差し替える。
 */

'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import {
	subscribeNewsletter,
	type NewsletterFormState,
} from '@/app/actions/newsletter';

const initialState: NewsletterFormState = { status: 'idle', message: '' };

type Variant = 'compact' | 'standard';

interface Props {
	variant?: Variant;
	/** 成功表示用のID（同一ページに2箇所置くケースに備え、aria-live重複を避ける） */
	idPrefix?: string;
}

export function NewsletterForm({
	variant = 'standard',
	idPrefix = 'nl',
}: Props) {
	const [state, formAction, pending] = useActionState(
		subscribeNewsletter,
		initialState,
	);
	const t = useTranslations('newsletter');

	if (state.status === 'success') {
		return (
			<div
				role="status"
				aria-live="polite"
				className={
					variant === 'compact'
						? 'rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
						: 'rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
				}
			>
				{state.message}
			</div>
		);
	}

	const err = state.fieldErrors ?? {};

	if (variant === 'compact') {
		return (
			<form action={formAction} className="space-y-2" noValidate>
				<div className="flex gap-2">
					<input
						id={`${idPrefix}-email`}
						name="email"
						type="email"
						required
						autoComplete="email"
						placeholder={t('emailPlaceholder')}
						aria-invalid={Boolean(err.email)}
						aria-label={t('emailPlaceholder')}
						className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					/>
					<button
						type="submit"
						disabled={pending}
						className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
					>
						{pending ? t('submitting') : t('submit')}
					</button>
				</div>
				<label className="flex items-start gap-1.5 text-xs text-zinc-500">
					<input
						name="agreed"
						type="checkbox"
						required
						className="mt-0.5 h-3.5 w-3.5 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
					/>
					<span>{t('agree')}</span>
				</label>
				{err.email && (
					<p className="text-xs text-red-600 dark:text-red-400">{err.email}</p>
				)}
				{err.agreed && (
					<p className="text-xs text-red-600 dark:text-red-400">{err.agreed}</p>
				)}
				{state.status === 'error' && !Object.keys(err).length && (
					<p role="alert" className="text-xs text-red-600 dark:text-red-400">
						{state.message}
					</p>
				)}
			</form>
		);
	}

	// standard
	return (
		<form action={formAction} className="space-y-4" noValidate>
			{state.status === 'error' && !Object.keys(err).length && (
				<p
					role="alert"
					className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
				>
					{state.message}
				</p>
			)}

			<div>
				<label
					htmlFor={`${idPrefix}-email-std`}
					className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
				>
					{t('emailPlaceholder')}<span className="whitespace-nowrap text-red-500">&nbsp;*</span>
				</label>
				<input
					id={`${idPrefix}-email-std`}
					name="email"
					type="email"
					required
					autoComplete="email"
					aria-invalid={Boolean(err.email)}
					className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				/>
				{err.email && (
					<p className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.email}
					</p>
				)}
			</div>

			<label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
				<input
					name="agreed"
					type="checkbox"
					required
					className="mt-0.5 h-4 w-4 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
				/>
				<span>
					{t('agree')}<span className="whitespace-nowrap text-red-500">&nbsp;*</span>
				</span>
			</label>
			{err.agreed && (
				<p className="text-xs text-red-600 dark:text-red-400">{err.agreed}</p>
			)}

			<button
				type="submit"
				disabled={pending}
				className="block w-full rounded-md bg-zinc-900 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-block sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
			>
				{pending ? t('submitting') : t('subscribe')}
			</button>
		</form>
	);
}
