/**
 * お問い合わせページ — /contact
 *
 * 料金プランCTAから来た場合は ?service=...&plan=... を読んで
 * メッセージ欄に下書きを入れる。検索パラメータは Next.js 15+ で Promise。
 */

import type { Metadata } from 'next';
import { ContactForm } from '@/components/corporate/ContactForm';

export const metadata: Metadata = {
	title: 'お問い合わせ',
	description:
		'Nordic Works へのサービス導入のご相談・取材のご依頼はこちらのフォームから。',
	alternates: { canonical: '/contact' },
};

interface PageProps {
	searchParams: Promise<{ service?: string; plan?: string }>;
}

/** クエリから自動入力するメッセージ下書きを組み立てる */
function buildInitialMessage(service?: string, plan?: string): string {
	if (!service && !plan) return '';
	const head =
		service && plan
			? `「${service}」の ${plan} プランについてご相談したいです。`
			: service
				? `「${service}」についてご相談したいです。`
				: '';
	return `${head}\n\n（以下に詳細をご記入ください）\n`;
}

export default async function ContactPage({ searchParams }: PageProps) {
	const { service, plan } = await searchParams;
	const initialMessage = buildInitialMessage(service, plan);

	return (
		<main className="mx-auto max-w-6xl px-6 py-16">
			<p className="text-xs uppercase tracking-widest text-zinc-500">Contact</p>
			<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
				お問い合わせ
			</h1>
			<p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
				サービス導入のご相談、取材・登壇のご依頼、その他お問い合わせは
				下記フォームよりお送りください。通常2〜3営業日以内にご返信します。
			</p>

			<div className="mt-10">
				<ContactForm initialMessage={initialMessage} />
			</div>
		</main>
	);
}
