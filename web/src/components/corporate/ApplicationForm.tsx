/**
 * 採用ポジション応募フォーム（Client Component）。
 *
 * Contact / Whitepaper のフォームと同じ useActionState パターン。
 * 採用文脈なので入力項目が多め（電話・現職・入社時期・志望動機・職務経歴）。
 *
 * ポジション情報（slug / title）は hidden field で渡し、Server Action 側で受ける。
 */

'use client';

import { useActionState } from 'react';
import {
	submitApplication,
	type ApplicationFormState,
} from '@/app/actions/application';

const initialState: ApplicationFormState = { status: 'idle', message: '' };

const inputClass =
	'mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

interface Props {
	careerSlug: string;
	careerTitle: string;
}

export function ApplicationForm({ careerSlug, careerTitle }: Props) {
	const [state, formAction, pending] = useActionState(
		submitApplication,
		initialState,
	);

	if (state.status === 'success') {
		return (
			<div
				role="status"
				aria-live="polite"
				className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
			>
				<p className="font-medium">応募を受け付けました</p>
				<p className="mt-2 leading-relaxed">{state.message}</p>
				<p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
					応募ポジション: {careerTitle}
				</p>
			</div>
		);
	}

	const err = state.fieldErrors ?? {};

	return (
		<form action={formAction} className="space-y-5" noValidate>
			<input type="hidden" name="careerSlug" value={careerSlug} />
			<input type="hidden" name="careerTitle" value={careerTitle} />

			{state.status === 'error' && !Object.keys(err).length && (
				<p
					role="alert"
					className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
				>
					{state.message}
				</p>
			)}

			<div className="grid gap-5 sm:grid-cols-2">
				<div>
					<label htmlFor="ap-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
						お名前 <span className="text-red-500">*</span>
					</label>
					<input
						id="ap-name"
						name="name"
						type="text"
						required
						autoComplete="name"
						aria-invalid={Boolean(err.name)}
						aria-describedby={err.name ? 'ap-name-error' : undefined}
						className={inputClass}
					/>
					{err.name && (
						<p id="ap-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
							{err.name}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="ap-email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
						メールアドレス <span className="text-red-500">*</span>
					</label>
					<input
						id="ap-email"
						name="email"
						type="email"
						required
						autoComplete="email"
						aria-invalid={Boolean(err.email)}
						aria-describedby={err.email ? 'ap-email-error' : undefined}
						className={inputClass}
					/>
					{err.email && (
						<p id="ap-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
							{err.email}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="ap-phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
						電話番号 <span className="text-red-500">*</span>
					</label>
					<input
						id="ap-phone"
						name="phone"
						type="tel"
						required
						autoComplete="tel"
						placeholder="090-1234-5678"
						aria-invalid={Boolean(err.phone)}
						aria-describedby={err.phone ? 'ap-phone-error' : undefined}
						className={inputClass}
					/>
					{err.phone && (
						<p id="ap-phone-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
							{err.phone}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="ap-currentCompany" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
						現職・所属（任意）
					</label>
					<input
						id="ap-currentCompany"
						name="currentCompany"
						type="text"
						autoComplete="organization"
						className={inputClass}
					/>
				</div>
			</div>

			<div>
				<label htmlFor="ap-availableFrom" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					入社可能時期（任意）
				</label>
				<input
					id="ap-availableFrom"
					name="availableFrom"
					type="text"
					placeholder="例: 2026年7月以降 / 即時可能 / 要相談"
					className={inputClass}
				/>
			</div>

			<div>
				<label htmlFor="ap-motivation" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					志望動機 <span className="text-red-500">*</span>
				</label>
				<textarea
					id="ap-motivation"
					name="motivation"
					required
					rows={6}
					placeholder="このポジションに興味を持った理由、入社後に取り組みたいことなど（50文字以上）"
					aria-invalid={Boolean(err.motivation)}
					aria-describedby={err.motivation ? 'ap-motivation-error' : undefined}
					className={inputClass}
				/>
				{err.motivation && (
					<p id="ap-motivation-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
						{err.motivation}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="ap-experience" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					職務経歴の概要（任意）
				</label>
				<textarea
					id="ap-experience"
					name="experience"
					rows={6}
					placeholder="関連する経歴・スキル・実績を箇条書きで記載してください。後日詳しい職務経歴書をご提出いただくため、ここでは概要で結構です。"
					className={inputClass}
				/>
			</div>

			<div className="flex items-start gap-2 pt-2">
				<input
					id="ap-agreed"
					name="agreed"
					type="checkbox"
					required
					aria-invalid={Boolean(err.agreed)}
					aria-describedby={err.agreed ? 'ap-agreed-error' : undefined}
					className="mt-0.5 h-4 w-4 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
				/>
				<label
					htmlFor="ap-agreed"
					className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
				>
					<a
						href="/privacy"
						target="_blank"
						rel="noopener noreferrer"
						className="underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						プライバシーポリシー
					</a>
					に同意します <span className="text-red-500">*</span>
				</label>
			</div>
			{err.agreed && (
				<p id="ap-agreed-error" className="text-xs text-red-600 dark:text-red-400">
					{err.agreed}
				</p>
			)}

			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
			>
				{pending ? '送信中…' : 'このポジションに応募する'}
			</button>
		</form>
	);
}
