'use server';

/**
 * ニュースレター登録の Server Action。
 *
 * Contact / Whitepaper / Application と同じ Resend ベースのパターン。
 * 入力は email + agree のみと最小限。重複チェックや配信リスト管理は
 * Resend Audiences API などへの移行余地として残す。
 *
 * 未設定環境では success を返すスタブ動作。
 */

import { Resend } from 'resend';
import { z } from 'zod';
import { NewsletterNoticeEmail } from '@/emails/NewsletterNoticeEmail';
import { NewsletterWelcomeEmail } from '@/emails/NewsletterWelcomeEmail';

const newsletterSchema = z.object({
	email: z.string().trim().email('メールアドレスの形式が正しくありません'),
	agreed: z
		.string()
		.optional()
		.refine((v) => v === 'on', {
			message: '個人情報の取り扱いへの同意が必要です',
		}),
});

export type NewsletterFormState = {
	status: 'idle' | 'success' | 'error';
	message: string;
	fieldErrors?: Partial<Record<'email' | 'agreed', string>>;
};

export async function subscribeNewsletter(
	_prev: NewsletterFormState,
	formData: FormData,
): Promise<NewsletterFormState> {
	const parsed = newsletterSchema.safeParse({
		email: formData.get('email'),
		agreed: formData.get('agreed'),
	});

	if (!parsed.success) {
		const fieldErrors: NewsletterFormState['fieldErrors'] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0] as keyof NonNullable<
				NewsletterFormState['fieldErrors']
			>;
			if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
		}
		return {
			status: 'error',
			message: '入力内容を確認してください。',
			fieldErrors,
		};
	}

	const { email } = parsed.data;

	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.CONTACT_EMAIL_FROM;
	const to = process.env.CONTACT_EMAIL_TO;

	if (!apiKey || !from || !to) {
		console.warn(
			'[newsletter] Resend 環境変数が未設定。送信をスキップしました。',
		);
		return {
			status: 'success',
			message:
				'ニュースレターの登録を受け付けました。次号より配信を開始します。',
		};
	}

	const resend = new Resend(apiKey);
	const subscribedAt = new Date().toLocaleString('ja-JP', {
		timeZone: 'Asia/Tokyo',
	});

	try {
		// 1. 運営宛通知（新規購読者の記録）
		const notice = await resend.emails.send({
			from,
			to,
			subject: `【NewsLetter】新規購読者: ${email}`,
			react: NewsletterNoticeEmail({ email, subscribedAt }),
		});
		if (notice.error) throw notice.error;

		// 2. 購読者宛 ウェルカムメール。Resend 無料枠で失敗しても運営通知は維持する。
		const welcome = await resend.emails.send({
			from,
			to: email,
			subject: 'Nordic Works ニュースレター登録ありがとうございます',
			react: NewsletterWelcomeEmail({ email }),
		});
		if (welcome.error) {
			console.warn(
				'[newsletter] ウェルカム送信失敗（運営通知は成功）:',
				welcome.error,
			);
		}

		return {
			status: 'success',
			message:
				'ニュースレターの登録を受け付けました。次号より配信を開始します。',
		};
	} catch (err) {
		console.error('[newsletter] 送信エラー:', err);
		return {
			status: 'error',
			message:
				'登録に失敗しました。時間をおいて再度お試しいただくか、お問い合わせフォームよりご連絡ください。',
		};
	}
}
