/**
 * お問い合わせページ — /contact
 */

import type { Metadata } from 'next';
import { ContactForm } from '@/components/corporate/ContactForm';

export const metadata: Metadata = {
	title: 'お問い合わせ',
	description:
		'Nordic Works へのサービス導入のご相談・取材のご依頼はこちらのフォームから。',
	alternates: { canonical: '/contact' },
};

export default function ContactPage() {
	return (
		<main className="mx-auto max-w-2xl px-6 py-16">
			<p className="text-xs uppercase tracking-widest text-zinc-500">Contact</p>
			<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
				お問い合わせ
			</h1>
			<p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
				サービス導入のご相談、取材・登壇のご依頼、その他お問い合わせは
				下記フォームよりお送りください。通常2〜3営業日以内にご返信します。
			</p>

			<div className="mt-10">
				<ContactForm />
			</div>
		</main>
	);
}
