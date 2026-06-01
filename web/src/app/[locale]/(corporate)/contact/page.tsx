/**
 * お問い合わせページ — /contact
 *
 * 料金プランCTAから来た場合は ?service=...&plan=... を読んで
 * メッセージ欄に下書きを入れる。検索パラメータは Next.js 15+ で Promise。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/corporate/ContactForm';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'contact' });
	return {
		title: t('title'),
		description: t('description'),
		alternates: localeAlternates('/contact'),
	};
}

interface PageProps {
	params: Promise<{ locale: string }>;
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

export default async function ContactPage({ params, searchParams }: PageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('contact');
	const { service, plan } = await searchParams;
	const initialMessage = buildInitialMessage(service, plan);

	return (
		<main className="mx-auto max-w-6xl px-6 py-16">
			<p className="text-xs uppercase tracking-widest text-zinc-500">
				{t('label')}
			</p>
			<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
				{t('title')}
			</h1>
			<p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
				{t('description')}
			</p>

			<div className="mt-10">
				<ContactForm initialMessage={initialMessage} />
			</div>
		</main>
	);
}
