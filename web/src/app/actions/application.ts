'use server';

/**
 * 採用ポジション応募の Server Action。
 *
 * Contact / Whitepaper と同じパターン: Zod でバリデーション後、
 * Resend で「人事宛通知 + 応募者宛 自動返信」の2通を送る。
 * ポジション情報（slug / title）は hidden field でフォームから受け取る。
 *
 * ファイル添付（履歴書PDF等）は実装範囲外。職務経歴の概要は textarea で受ける。
 * 未設定環境では success を返すスタブ動作（ローカル動作確認用）。
 */

import { Resend } from 'resend';
import { z } from 'zod';
import { ApplicationNoticeEmail } from '@/emails/ApplicationNoticeEmail';
import { ApplicationConfirmationEmail } from '@/emails/ApplicationConfirmationEmail';

const applicationSchema = z.object({
	careerSlug: z.string().min(1),
	careerTitle: z.string().min(1),
	name: z.string().trim().min(1, 'お名前を入力してください').max(100),
	email: z.string().trim().email('メールアドレスの形式が正しくありません'),
	phone: z
		.string()
		.trim()
		.min(10, '電話番号を10桁以上で入力してください')
		.max(20)
		.regex(/^[0-9+\-()\s]+$/, '電話番号は数字とハイフンで入力してください'),
	currentCompany: z.string().trim().max(100).optional(),
	availableFrom: z.string().trim().max(50).optional(),
	motivation: z
		.string()
		.trim()
		.min(50, '志望動機は50文字以上で入力してください')
		.max(3000),
	experience: z.string().trim().max(3000).optional(),
	agreed: z
		.string()
		.optional()
		.refine((v) => v === 'on', {
			message: '個人情報の取り扱いへの同意が必要です',
		}),
});

export type ApplicationFormState = {
	status: 'idle' | 'success' | 'error';
	message: string;
	fieldErrors?: Partial<
		Record<
			| 'name'
			| 'email'
			| 'phone'
			| 'currentCompany'
			| 'availableFrom'
			| 'motivation'
			| 'experience'
			| 'agreed',
			string
		>
	>;
};

export async function submitApplication(
	_prev: ApplicationFormState,
	formData: FormData,
): Promise<ApplicationFormState> {
	const parsed = applicationSchema.safeParse({
		careerSlug: formData.get('careerSlug'),
		careerTitle: formData.get('careerTitle'),
		name: formData.get('name'),
		email: formData.get('email'),
		phone: formData.get('phone'),
		currentCompany: formData.get('currentCompany'),
		availableFrom: formData.get('availableFrom'),
		motivation: formData.get('motivation'),
		experience: formData.get('experience'),
		agreed: formData.get('agreed'),
	});

	if (!parsed.success) {
		const fieldErrors: ApplicationFormState['fieldErrors'] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0] as keyof NonNullable<
				ApplicationFormState['fieldErrors']
			>;
			if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
		}
		return {
			status: 'error',
			message: '入力内容を確認してください。',
			fieldErrors,
		};
	}

	const {
		careerTitle,
		name,
		email,
		phone,
		currentCompany,
		availableFrom,
		motivation,
		experience,
	} = parsed.data;

	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.CONTACT_EMAIL_FROM;
	const to = process.env.CONTACT_EMAIL_TO;

	if (!apiKey || !from || !to) {
		console.warn(
			'[application] Resend 環境変数が未設定。送信をスキップしました。',
		);
		return {
			status: 'success',
			message:
				'応募を受け付けました。書類選考の結果は5営業日以内にメールにてご連絡いたします。',
		};
	}

	const resend = new Resend(apiKey);
	const submittedAt = new Date().toLocaleString('ja-JP', {
		timeZone: 'Asia/Tokyo',
	});

	try {
		// 1. 人事宛通知
		const notice = await resend.emails.send({
			from,
			to,
			replyTo: email,
			subject: `【応募】${careerTitle} - ${name}`,
			react: ApplicationNoticeEmail({
				name,
				email,
				phone,
				currentCompany,
				availableFrom,
				motivation,
				experience,
				careerTitle,
				submittedAt,
			}),
		});
		if (notice.error) throw notice.error;

		// 2. 応募者宛 自動返信。Resend 無料枠で失敗しても運営通知の成功は維持する。
		const autoReply = await resend.emails.send({
			from,
			to: email,
			subject: `応募を受け付けました — ${careerTitle}`,
			react: ApplicationConfirmationEmail({ name, careerTitle }),
		});
		if (autoReply.error) {
			console.warn(
				'[application] 自動返信送信失敗（人事通知は成功）:',
				autoReply.error,
			);
		}

		return {
			status: 'success',
			message:
				'応募を受け付けました。書類選考の結果は5営業日以内にメールにてご連絡いたします。',
		};
	} catch (err) {
		console.error('[application] 送信エラー:', err);
		return {
			status: 'error',
			message:
				'送信に失敗しました。時間をおいて再度お試しいただくか、お問い合わせフォームよりご連絡ください。',
		};
	}
}
