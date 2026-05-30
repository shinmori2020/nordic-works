'use server';

/**
 * ホワイトペーパー DL リクエストの Server Action。
 *
 * Contact フォーム（actions/contact.ts）と同様、Zod + Resend で
 * 「運営宛通知 + 申込者宛 自動返信」の2通を送信する。
 *
 * 環境変数: RESEND_API_KEY / CONTACT_EMAIL_FROM / CONTACT_EMAIL_TO
 * 未設定時はスタブ動作（success を返す）。
 */

import { Resend } from 'resend';
import { z } from 'zod';
import { WhitepaperNoticeEmail } from '@/emails/WhitepaperNoticeEmail';
import { WhitepaperDeliveryEmail } from '@/emails/WhitepaperDeliveryEmail';
import { getWhitepaperBySlug } from '@/lib/whitepapers';

const requestSchema = z.object({
	whitepaperSlug: z.string().min(1),
	name: z.string().trim().min(1, 'お名前を入力してください').max(100),
	email: z.string().trim().email('メールアドレスの形式が正しくありません'),
	company: z.string().trim().min(1, '会社名を入力してください').max(100),
	role: z.string().trim().max(100).optional(),
	agreed: z
		.string()
		.optional()
		.refine((v) => v === 'on', { message: '個人情報の取り扱いへの同意が必要です' }),
});

export type WhitepaperFormState = {
	status: 'idle' | 'success' | 'error';
	message: string;
	fieldErrors?: Partial<
		Record<'name' | 'email' | 'company' | 'role' | 'agreed', string>
	>;
};

export async function requestWhitepaper(
	_prev: WhitepaperFormState,
	formData: FormData,
): Promise<WhitepaperFormState> {
	const parsed = requestSchema.safeParse({
		whitepaperSlug: formData.get('whitepaperSlug'),
		name: formData.get('name'),
		email: formData.get('email'),
		company: formData.get('company'),
		role: formData.get('role'),
		agreed: formData.get('agreed'),
	});

	if (!parsed.success) {
		const fieldErrors: WhitepaperFormState['fieldErrors'] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0] as keyof NonNullable<
				WhitepaperFormState['fieldErrors']
			>;
			if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
		}
		return {
			status: 'error',
			message: '入力内容を確認してください。',
			fieldErrors,
		};
	}

	const { whitepaperSlug, name, email, company, role } = parsed.data;
	// メールタイトル等にはオリジナル（JA）の資料タイトルを使う
	const whitepaper = getWhitepaperBySlug(whitepaperSlug, 'ja');

	if (!whitepaper) {
		return { status: 'error', message: '資料が見つかりませんでした。' };
	}

	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.CONTACT_EMAIL_FROM;
	const to = process.env.CONTACT_EMAIL_TO;

	// 環境変数未設定時はスタブ動作（ローカル動作確認用）
	if (!apiKey || !from || !to) {
		console.warn(
			'[whitepaper] Resend 環境変数が未設定。送信をスキップしました。',
		);
		return {
			status: 'success',
			message:
				'資料請求を受け付けました。担当者より2〜3営業日以内にメールにてお送りいたします。',
		};
	}

	const resend = new Resend(apiKey);
	const requestedAt = new Date().toLocaleString('ja-JP', {
		timeZone: 'Asia/Tokyo',
	});

	try {
		// 1. 運営宛通知
		const notice = await resend.emails.send({
			from,
			to,
			replyTo: email,
			subject: `【Nordic Works】資料請求 - ${whitepaper.title}`,
			react: WhitepaperNoticeEmail({
				name,
				email,
				company,
				role,
				whitepaperTitle: whitepaper.title,
				requestedAt,
			}),
		});
		if (notice.error) throw notice.error;

		// 2. 申込者宛 自動返信。Resend 無料枠では失敗することがあるが、
		//    その場合も運営通知の成功を打ち消さない（contact と同じ方針）。
		const autoReply = await resend.emails.send({
			from,
			to: email,
			subject: `資料請求を受け付けました — ${whitepaper.title}`,
			react: WhitepaperDeliveryEmail({
				name,
				whitepaperTitle: whitepaper.title,
			}),
		});
		if (autoReply.error) {
			console.warn(
				'[whitepaper] 自動返信送信失敗（運営通知は成功）:',
				autoReply.error,
			);
		}

		return {
			status: 'success',
			message:
				'資料請求を受け付けました。担当者より2〜3営業日以内にメールにてお送りいたします。',
		};
	} catch (err) {
		console.error('[whitepaper] 送信エラー:', err);
		return {
			status: 'error',
			message:
				'送信に失敗しました。時間をおいて再度お試しいただくか、お問い合わせフォームよりご連絡ください。',
		};
	}
}
