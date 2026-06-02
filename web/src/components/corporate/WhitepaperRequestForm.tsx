/**
 * ホワイトペーパー申込フォーム（Client Component）。
 *
 * ContactForm と同じパターン: useActionState + Zod でステート管理。
 * whitepaperSlug を hidden field で渡し、Server Action 側で resolve する。
 */

'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import {
	requestWhitepaper,
	type WhitepaperFormState,
} from '@/app/actions/whitepaper';

const initialState: WhitepaperFormState = { status: 'idle', message: '' };

const inputClass =
	'mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

interface Props {
	whitepaperSlug: string;
	whitepaperTitle: string;
}

export function WhitepaperRequestForm({
	whitepaperSlug,
	whitepaperTitle,
}: Props) {
	const [state, formAction, pending] = useActionState(
		requestWhitepaper,
		initialState,
	);
	const t = useTranslations('forms.whitepaper');
	const tCommon = useTranslations('forms.common');

	if (state.status === 'success') {
		return (
			<div
				role="status"
				aria-live="polite"
				className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
			>
				<p className="font-medium">{t('successTitle')}</p>
				<p className="mt-2 leading-relaxed">{state.message}</p>
				<p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
					{t('targetLabel')}: {whitepaperTitle}
				</p>
			</div>
		);
	}

	const err = state.fieldErrors ?? {};

	return (
		<form action={formAction} className="space-y-5" noValidate>
			<input type="hidden" name="whitepaperSlug" value={whitepaperSlug} />

			{state.status === 'error' && !Object.keys(err).length && (
				<p
					role="alert"
					className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
				>
					{state.message}
				</p>
			)}

			<div>
				<label htmlFor="wp-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('name')} <span className="text-red-500">*</span>
				</label>
				<input
					id="wp-name"
					name="name"
					type="text"
					required
					autoComplete="name"
					aria-invalid={Boolean(err.name)}
					aria-describedby={err.name ? 'wp-name-error' : undefined}
					className={inputClass}
				/>
				{err.name && (
					<p id="wp-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.name}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="wp-email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('email')} <span className="text-red-500">*</span>
				</label>
				<input
					id="wp-email"
					name="email"
					type="email"
					required
					autoComplete="email"
					aria-invalid={Boolean(err.email)}
					aria-describedby={err.email ? 'wp-email-error' : undefined}
					className={inputClass}
				/>
				{err.email && (
					<p id="wp-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.email}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="wp-company" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('company')} <span className="text-red-500">*</span>
				</label>
				<input
					id="wp-company"
					name="company"
					type="text"
					required
					autoComplete="organization"
					aria-invalid={Boolean(err.company)}
					aria-describedby={err.company ? 'wp-company-error' : undefined}
					className={inputClass}
				/>
				{err.company && (
					<p id="wp-company-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.company}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="wp-role" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('role')}
				</label>
				<input
					id="wp-role"
					name="role"
					type="text"
					autoComplete="organization-title"
					className={inputClass}
				/>
			</div>

			<div className="flex items-start gap-2 pt-2">
				<input
					id="wp-agreed"
					name="agreed"
					type="checkbox"
					required
					aria-invalid={Boolean(err.agreed)}
					aria-describedby={err.agreed ? 'wp-agreed-error' : undefined}
					className="mt-0.5 h-4 w-4 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
				/>
				<label
					htmlFor="wp-agreed"
					className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
				>
					{tCommon('agreePrefix')}
					<a
						href="/privacy"
						target="_blank"
						rel="noopener noreferrer"
						className="underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						{tCommon('agreePolicyLink')}
					</a>
					{tCommon('agreeSuffix')} <span className="text-red-500">*</span>
				</label>
			</div>
			{err.agreed && (
				<p id="wp-agreed-error" className="text-xs text-red-600 dark:text-red-400">
					{err.agreed}
				</p>
			)}

			<button
				type="submit"
				disabled={pending}
				className="block w-full rounded-md bg-zinc-900 px-6 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-block sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
			>
				{pending ? tCommon('submitting') : t('submit')}
			</button>
		</form>
	);
}
