/**
 * お問い合わせフォーム（Client Component）。
 *
 * useActionState で Server Action の状態を受け取り、
 * バリデーションエラー・送信中・成功表示を制御する。
 * アクセシビリティ: label 関連付け・aria-invalid・aria-describedby・aria-live。
 *
 * フィールド: 種別(select) / 氏名 / メール / 会社 / 電話(tel) / 組織規模(select) /
 *             希望の連絡方法(radio) / 本文(textarea) / プライバシー同意(checkbox)。
 */

'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { submitContact, type ContactFormState } from '@/app/actions/contact';

const initialState: ContactFormState = { status: 'idle', message: '' };

const INQUIRY_TYPES = ['service', 'media', 'recruit', 'other'] as const;
const ORG_SIZES = ['lt50', 'to200', 'to1000', 'gt1000'] as const;
const CONTACT_METHODS = ['email', 'phone', 'online'] as const;

const fieldClass =
	'mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';
const labelClass = 'text-sm font-medium text-zinc-700 dark:text-zinc-300';
const requiredMark = <span className="whitespace-nowrap text-red-500">&nbsp;*</span>;

function FieldError({ id, message }: { id: string; message?: string }) {
	if (!message) return null;
	return (
		<p id={id} className="mt-1 text-xs text-red-600 dark:text-red-400">
			{message}
		</p>
	);
}

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
		<form action={formAction} className="space-y-6" noValidate>
			{state.status === 'error' && !Object.keys(err).length && (
				<p
					role="alert"
					className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
				>
					{state.message}
				</p>
			)}

			{/* 種別 */}
			<div>
				<label htmlFor="inquiryType" className={labelClass}>
					{t('inquiryType')}
					{requiredMark}
				</label>
				<select
					id="inquiryType"
					name="inquiryType"
					required
					defaultValue=""
					aria-invalid={Boolean(err.inquiryType)}
					aria-describedby={err.inquiryType ? 'inquiryType-error' : undefined}
					className={fieldClass}
				>
					<option value="" disabled>
						{t('selectPlaceholder')}
					</option>
					{INQUIRY_TYPES.map((key) => (
						<option key={key} value={key}>
							{t(`inquiryTypeOptions.${key}`)}
						</option>
					))}
				</select>
				<FieldError id="inquiryType-error" message={err.inquiryType} />
			</div>

			{/* 氏名・メール */}
			<div className="grid gap-6 sm:grid-cols-2">
				<div>
					<label htmlFor="name" className={labelClass}>
						{t('name')}
						{requiredMark}
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						autoComplete="name"
						aria-invalid={Boolean(err.name)}
						aria-describedby={err.name ? 'name-error' : undefined}
						className={fieldClass}
					/>
					<FieldError id="name-error" message={err.name} />
				</div>
				<div>
					<label htmlFor="email" className={labelClass}>
						{t('email')}
						{requiredMark}
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autoComplete="email"
						aria-invalid={Boolean(err.email)}
						aria-describedby={err.email ? 'email-error' : undefined}
						className={fieldClass}
					/>
					<FieldError id="email-error" message={err.email} />
				</div>
			</div>

			{/* 会社・電話 */}
			<div className="grid gap-6 sm:grid-cols-2">
				<div>
					<label htmlFor="company" className={labelClass}>
						{t('company')}
					</label>
					<input
						id="company"
						name="company"
						type="text"
						autoComplete="organization"
						className={fieldClass}
					/>
				</div>
				<div>
					<label htmlFor="phone" className={labelClass}>
						{t('phone')}
					</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						autoComplete="tel"
						inputMode="tel"
						placeholder="090-1234-5678"
						className={fieldClass}
					/>
				</div>
			</div>

			{/* 組織規模 */}
			<div>
				<label htmlFor="orgSize" className={labelClass}>
					{t('orgSize')}
				</label>
				<select id="orgSize" name="orgSize" defaultValue="" className={fieldClass}>
					<option value="">{t('selectPlaceholder')}</option>
					{ORG_SIZES.map((key) => (
						<option key={key} value={key}>
							{t(`orgSizeOptions.${key}`)}
						</option>
					))}
				</select>
			</div>

			{/* 希望の連絡方法 */}
			<fieldset>
				<legend className={labelClass}>{t('contactMethod')}</legend>
				<div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
					{CONTACT_METHODS.map((key) => (
						<label key={key} className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
							<input
								type="radio"
								name="contactMethod"
								value={key}
								className="h-4 w-4 accent-[var(--accent)]"
							/>
							{t(`contactMethodOptions.${key}`)}
						</label>
					))}
				</div>
			</fieldset>

			{/* 本文 */}
			<div>
				<label htmlFor="message" className={labelClass}>
					{t('message')}
					{requiredMark}
				</label>
				<textarea
					id="message"
					name="message"
					required
					rows={6}
					defaultValue={initialMessage}
					aria-invalid={Boolean(err.message)}
					aria-describedby={err.message ? 'message-error' : undefined}
					className={fieldClass}
				/>
				<FieldError id="message-error" message={err.message} />
			</div>

			{/* プライバシー同意 */}
			<div>
				<label htmlFor="agreement" className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
					<input
						id="agreement"
						name="agreement"
						type="checkbox"
						required
						aria-invalid={Boolean(err.agreement)}
						aria-describedby={err.agreement ? 'agreement-error' : undefined}
						className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
					/>
					<span>
						{tCommon('agreePrefix')}
						<Link
							href="/privacy"
							className="text-accent-text underline underline-offset-2 hover:no-underline"
						>
							{tCommon('agreePolicyLink')}
						</Link>
						{tCommon('agreeSuffix')}
					</span>
				</label>
				<FieldError id="agreement-error" message={err.agreement} />
			</div>

			<button
				type="submit"
				disabled={pending}
				className="block w-full rounded-md bg-accent px-6 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:inline-block sm:w-auto"
			>
				{pending ? tCommon('submitting') : t('submit')}
			</button>
		</form>
	);
}
