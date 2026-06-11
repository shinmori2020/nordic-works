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
		<main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
			<div className="lg:grid lg:grid-cols-2 lg:gap-16">
				{/* 左: 見出し＋説明 */}
				<div className="lg:py-2">
					<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
					<p className="text-xs uppercase tracking-widest text-accent-text">
						{t('label')}
					</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
						{t('title')}
					</h1>
					<p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
						{t('description')}
					</p>
				</div>

				{/* 右: フォーム（カード） */}
				<div className="mt-10 lg:mt-0">
					<div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
						<ContactForm initialMessage={initialMessage} />
					</div>
				</div>
			</div>
		</main>
	);
}
