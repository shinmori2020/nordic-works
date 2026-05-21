'use server';

/**
 * お問い合わせフォームの Server Action。
 *
 * Zod でバリデーションし、結果を呼び出し側（useActionState）に返す。
 * 実際のメール送信（Resend）は Week 6 で接続する。現状はバリデーション成功で
 * 受付完了とみなすスタブ実装。
 */

import { z } from 'zod';

const contactSchema = z.object({
	name: z.string().trim().min(1, 'お名前を入力してください').max(100),
	email: z.string().trim().email('メールアドレスの形式が正しくありません'),
	company: z.string().trim().max(100).optional(),
	message: z
		.string()
		.trim()
		.min(10, 'お問い合わせ内容は10文字以上で入力してください')
		.max(2000),
});

export type ContactFormState = {
	status: 'idle' | 'success' | 'error';
	message: string;
	/** フィールドごとのバリデーションエラー */
	fieldErrors?: Partial<Record<'name' | 'email' | 'company' | 'message', string>>;
};

export async function submitContact(
	_prev: ContactFormState,
	formData: FormData,
): Promise<ContactFormState> {
	const parsed = contactSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		company: formData.get('company'),
		message: formData.get('message'),
	});

	if (!parsed.success) {
		const fieldErrors: ContactFormState['fieldErrors'] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0] as keyof NonNullable<ContactFormState['fieldErrors']>;
			if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
		}
		return {
			status: 'error',
			message: '入力内容を確認してください。',
			fieldErrors,
		};
	}

	// TODO(Week 6): ここで Resend を使い、運営宛通知 + 送信者への自動返信を送る。
	// 現状はポートフォリオのデモのため、検証成功をもって受付完了とする。
	return {
		status: 'success',
		message: 'お問い合わせを受け付けました。担当者より折り返しご連絡いたします。',
	};
}
