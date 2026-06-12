'use server';

/**
 * お問い合わせフォームの Server Action。
 *
 * 1. Zod で入力をバリデーション
 * 2. Resend で「運営宛通知」+「送信者宛 自動返信」の2通を送信
 * 3. 結果を useActionState 経由でフォームに返す
 *
 * 必要な環境変数: RESEND_API_KEY / CONTACT_EMAIL_FROM / CONTACT_EMAIL_TO
 * 未設定時はバリデーションだけ通して success を返す（ローカル動作確認用）。
 */

import { Resend } from 'resend';
import { z } from 'zod';
import { ContactAutoReplyEmail } from '@/emails/ContactAutoReplyEmail';
import { ContactNoticeEmail } from '@/emails/ContactNoticeEmail';

const contactSchema = z.object({
	name: z.string().trim().min(1, 'お名前を入力してください').max(100),
	email: z.string().trim().email('メールアドレスの形式が正しくありません'),
	company: z.string().trim().max(100).optional(),
	phone: z.string().trim().max(40).optional(),
	inquiryType: z.string().trim().min(1, 'お問い合わせ種別を選択してください').max(40),
	orgSize: z.string().trim().max(40).optional(),
	contactMethod: z.string().trim().max(40).optional(),
	message: z
		.string()
		.trim()
		.min(10, 'お問い合わせ内容は10文字以上で入力してください')
		.max(2000),
	agreement: z
		.string()
		.refine((v) => v === 'on', 'プライバシーポリシーへの同意が必要です'),
});

type FieldKey =
	| 'name'
	| 'email'
	| 'company'
	| 'phone'
	| 'inquiryType'
	| 'orgSize'
	| 'contactMethod'
	| 'message'
	| 'agreement';

export type ContactFormState = {
	status: 'idle' | 'success' | 'error';
	message: string;
	fieldErrors?: Partial<Record<FieldKey, string>>;
};

// 通知メール（日本語）用に、select/radio のキーを表示名へ変換する。
const INQUIRY_LABELS: Record<string, string> = {
	service: 'サービス導入のご相談',
	media: '取材・登壇のご依頼',
	recruit: '採用について',
	other: 'その他',
};
const ORG_LABELS: Record<string, string> = {
	lt50: '〜50名',
	to200: '51〜200名',
	to1000: '201〜1,000名',
	gt1000: '1,001名以上',
};
const METHOD_LABELS: Record<string, string> = {
	email: 'メール',
	phone: '電話',
	online: 'オンライン面談',
};
const labelOf = (map: Record<string, string>, key?: string) =>
	key ? (map[key] ?? key) : undefined;

export async function submitContact(
	_prev: ContactFormState,
	formData: FormData,
): Promise<ContactFormState> {
	const parsed = contactSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		company: formData.get('company') ?? undefined,
		phone: formData.get('phone') ?? undefined,
		inquiryType: formData.get('inquiryType') ?? '',
		orgSize: formData.get('orgSize') ?? undefined,
		contactMethod: formData.get('contactMethod') ?? undefined,
		message: formData.get('message'),
		agreement: (formData.get('agreement') as string | null) ?? '',
	});

	if (!parsed.success) {
		const fieldErrors: ContactFormState['fieldErrors'] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0] as FieldKey;
			if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
		}
		return {
			status: 'error',
			message: '入力内容を確認してください。',
			fieldErrors,
		};
	}

	const { name, email, company, phone, inquiryType, orgSize, contactMethod, message } =
		parsed.data;

	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.CONTACT_EMAIL_FROM;
	const to = process.env.CONTACT_EMAIL_TO;

	// 環境変数未設定時はスタブ動作（ローカル開発時の暫定）
	if (!apiKey || !from || !to) {
		console.warn('[contact] Resend 環境変数が未設定。送信をスキップしました。');
		return {
			status: 'success',
			message: 'お問い合わせを受け付けました。担当者より折り返しご連絡いたします。',
		};
	}

	const resend = new Resend(apiKey);
	const receivedAt = new Date().toLocaleString('ja-JP', {
		timeZone: 'Asia/Tokyo',
	});

	try {
		// 1. 運営宛通知
		const notice = await resend.emails.send({
			from,
			to,
			replyTo: email, // 返信は問い合わせ者に直接届くように
			subject: `【Nordic Works】お問い合わせ - ${name} 様`,
			react: ContactNoticeEmail({
				name,
				email,
				company,
				phone,
				inquiryType: labelOf(INQUIRY_LABELS, inquiryType) ?? inquiryType,
				orgSize: labelOf(ORG_LABELS, orgSize),
				contactMethod: labelOf(METHOD_LABELS, contactMethod),
				message,
				receivedAt,
			}),
		});
		if (notice.error) throw notice.error;

		// 2. 送信者宛 自動返信
		//    Resend 無料枠（独自ドメイン未設定）は to を自分のアカウント宛しか送れないため、
		//    自動返信の送信失敗は運営通知の成功を打ち消さない設計にする。
		const autoReply = await resend.emails.send({
			from,
			to: email,
			subject: 'お問い合わせを受け付けました — Nordic Works',
			react: ContactAutoReplyEmail({ name, message }),
		});
		if (autoReply.error) {
			console.warn('[contact] 自動返信送信失敗（運営通知は成功）:', autoReply.error);
		}

		return {
			status: 'success',
			message:
				'お問い合わせを受け付けました。担当者より折り返しご連絡いたします。',
		};
	} catch (err) {
		console.error('[contact] 送信エラー:', err);
		return {
			status: 'error',
			message:
				'送信に失敗しました。時間をおいて再度お試しいただくか、メールで直接ご連絡ください。',
		};
	}
}
