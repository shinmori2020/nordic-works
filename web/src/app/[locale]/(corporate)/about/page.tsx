/**
 * 会社概要ページ — /about
 *
 * 架空企業 Nordic Works のミッション・バリュー・会社情報を紹介する静的ページ。
 * すべてのテキストは next-intl の翻訳キー経由（ja/en）。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const VALUE_KEYS = ['transparency', 'safety', 'data'] as const;
const COMPANY_ROW_KEYS = ['name', 'business', 'founded', 'location', 'note'] as const;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'about' });
	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		alternates: localeAlternates('/about'),
	};
}

export default async function AboutPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('about');
	const tHome = await getTranslations('home');

	return (
		<main>
			{/* ヒーロー */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
					<p className="text-sm font-medium uppercase tracking-widest text-accent-text">
						{t('hero.label')}
					</p>
					<h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
						{t('hero.title')}
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
						{t('hero.description')}
					</p>
				</div>
			</section>

			{/* ミッション */}
			<section className="mx-auto max-w-6xl px-6 py-16">
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{t('mission.label')}
				</p>
				<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('mission.title')}
				</h2>
				<p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
					{t('mission.body')}
				</p>
			</section>

			{/* バリュー */}
			<section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-16">
					<p className="text-xs uppercase tracking-widest text-accent-text">
						{t('values.label')}
					</p>
					<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
						{t('values.title')}
					</h2>
					<div className="mt-8 grid gap-6 sm:grid-cols-3">
						{VALUE_KEYS.map((key) => (
							<div
								key={key}
								className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
							>
								<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
									{t(`values.items.${key}.title`)}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
									{t(`values.items.${key}.body`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 会社情報 */}
			<section className="mx-auto max-w-6xl px-6 py-16">
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{t('companyInfo.label')}
				</p>
				<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('companyInfo.title')}
				</h2>
				<dl className="mt-8">
					{COMPANY_ROW_KEYS.map((key) => (
						<div
							key={key}
							className="flex flex-col gap-1 border-b border-zinc-200 py-4 sm:flex-row sm:gap-6 dark:border-zinc-800"
						>
							<dt className="w-32 shrink-0 text-sm text-zinc-500">
								{t(`companyInfo.rows.${key}.label`)}
							</dt>
							<dd className="text-sm text-zinc-900 dark:text-zinc-200">
								{t(`companyInfo.rows.${key}.value`)}
							</dd>
						</div>
					))}
				</dl>
			</section>

			{/* CTA */}
			<section className="border-t border-zinc-200 dark:border-zinc-800">
				<div className="mx-auto grid max-w-6xl gap-px bg-zinc-200 sm:grid-cols-2 dark:bg-zinc-800">
					<Link
						href="/careers"
						className="group bg-white p-10 transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-accent-text">
							Careers
						</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{tHome('careersCta.title')}
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{tHome('careersCta.description')}
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 group-hover:underline dark:text-zinc-100">
							{tHome('careersCta.link')}
						</span>
					</Link>
					<Link
						href="/contact"
						className="group bg-white p-10 transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-accent-text">
							Contact
						</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{tHome('contactCta.title')}
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{tHome('contactCta.description')}
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 group-hover:underline dark:text-zinc-100">
							{tHome('contactCta.link')}
						</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
