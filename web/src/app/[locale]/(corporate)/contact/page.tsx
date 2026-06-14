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
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

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
		<main>
			{/* ヒーロー: 左に特大 CONTACT、右に説明（about と統一の扉ページ） */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
					<Breadcrumbs items={[{ label: t('title') }]} />
					<div className="mt-6">
						<h1 className="text-6xl font-semibold uppercase leading-none tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-7xl md:text-8xl">
							{t('label')}
						</h1>
						<div className="mt-6">
							<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
							<p className="text-xl font-medium leading-snug tracking-tight text-zinc-700 dark:text-zinc-300 sm:text-2xl">
								{t('tagline')}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* フォーム: 補足文 → 全幅カード */}
			<section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
				<p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					{t('description')}
				</p>
				<div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
					<ContactForm initialMessage={initialMessage} />
				</div>
			</section>
		</main>
	);
}
