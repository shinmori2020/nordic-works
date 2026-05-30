/**
 * お問い合わせフォーム（Client Component）。
 *
 * useActionState で Server Action の状態を受け取り、
 * バリデーションエラー・送信中・成功表示を制御する。
 * アクセシビリティ: label 関連付け・aria-invalid・aria-describedby・aria-live。
 */

'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { submitContact, type ContactFormState } from '@/app/actions/contact';

const initialState: ContactFormState = { status: 'idle', message: '' };

const inputClass =
	'mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

/**
 * @param initialMessage - 遷移元から伝えたい本文の下書き（例: 料金プランCTAから）。
 *   defaultValue で初期表示するだけなので、ユーザーが自由に編集できる。
 */
export function ContactForm({ initialMessage = '' }: { initialMessage?: string }) {
	const [state, formAction, pending] = useActionState(submitContact, initialState);
	const t = useTranslations('forms.contact');
	const tCommon = useTranslations('forms.common');

	if (state.status === 'success') {
		return (
			<div
				role="status"
				aria-live="polite"
				className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
			>
				<p className="font-medium">{t('successTitle')}</p>
				<p className="mt-1">{state.message}</p>
			</div>
		);
	}

	const err = state.fieldErrors ?? {};

	return (
		<form action={formAction} className="space-y-5" noValidate>
			{state.status === 'error' && !Object.keys(err).length && (
				<p
					role="alert"
					className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
				>
					{state.message}
				</p>
			)}

			<div>
				<label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('name')} <span className="text-red-500">*</span>
				</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					autoComplete="name"
					aria-invalid={Boolean(err.name)}
					aria-describedby={err.name ? 'name-error' : undefined}
					className={inputClass}
				/>
				{err.name && (
					<p id="name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.name}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('email')} <span className="text-red-500">*</span>
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autoComplete="email"
					aria-invalid={Boolean(err.email)}
					aria-describedby={err.email ? 'email-error' : undefined}
					className={inputClass}
				/>
				{err.email && (
					<p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.email}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="company" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('company')}
				</label>
				<input
					id="company"
					name="company"
					type="text"
					autoComplete="organization"
					className={inputClass}
				/>
			</div>

			<div>
				<label htmlFor="message" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					{t('message')} <span className="text-red-500">*</span>
				</label>
				<textarea
					id="message"
					name="message"
					required
					rows={6}
					defaultValue={initialMessage}
					aria-invalid={Boolean(err.message)}
					aria-describedby={err.message ? 'message-error' : undefined}
					className={inputClass}
				/>
				{err.message && (
					<p id="message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.message}
					</p>
				)}
			</div>

			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
			>
				{pending ? tCommon('submitting') : t('submit')}
			</button>
		</form>
	);
}
