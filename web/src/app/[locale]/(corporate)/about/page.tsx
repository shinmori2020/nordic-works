/**
 * 会社概要ページ — /about
 *
 * 架空企業 Nordic Works のミッション・バリュー・会社情報を紹介する静的ページ。
 * すべてのテキストは next-intl の翻訳キー経由（ja/en）。
 *
 * デザイン: TOP と同じ「水面の波」アニメ背景のヒーロー、Reveal によるスクロール表示、
 *          番号付き（01/02/03）のバリューカードでサイト全体のデザイン言語に揃える。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/common/Reveal';

const VALUE_KEYS = ['transparency', 'safety', 'data'] as const;
const COMPANY_ROW_KEYS = [
	'name',
	'representative',
	'business',
	'founded',
	'capital',
	'employees',
	'location',
	'website',
	'note',
] as const;

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
	const tNav = await getTranslations('nav');

	return (
		<main>
			{/* ヒーロー: 左に特大 ABOUT、右にタグライン（雑誌の扉ページ風・2カラム） */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
					<div>
						<h1 className="text-6xl font-semibold uppercase leading-none tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-7xl md:text-8xl">
							{t('hero.label')}
						</h1>
						<div className="mt-6">
							<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
							<p className="text-xl font-medium leading-snug tracking-tight text-zinc-700 dark:text-zinc-300 sm:text-2xl">
								{t('hero.title')}
							</p>
						</div>
					</div>

					{/* ページ内インデックス（番号付きアンカー） */}
					<nav
						aria-label={t('hero.label')}
						className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:mt-12"
					>
						<ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
							{[
								{ href: '#mission', no: '01', label: t('mission.label') },
								{ href: '#values', no: '02', label: t('values.label') },
								{ href: '#company', no: '03', label: t('companyInfo.label') },
							].map((item) => (
								<li key={item.href}>
									<a
										href={item.href}
										className="group inline-flex items-baseline gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
									>
										<span className="font-mono text-xs text-accent-text">{item.no}</span>
										<span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-zinc-400 dark:group-hover:border-zinc-500">
											{item.label}
										</span>
									</a>
								</li>
							))}
							<li className="sm:ml-auto">
								<Link
									href="/careers"
									className="inline-flex items-center gap-1 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
								>
									{tNav('careers')}
									<span aria-hidden="true">→</span>
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</section>

			{/* ミッション */}
			<section id="mission" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
				<Reveal>
					<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
					<p className="text-xs uppercase tracking-widest text-accent-text">
						{t('mission.label')}
					</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
						{t('mission.title')}
					</h2>
					<p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
						{t('hero.description')}
					</p>
					<p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
						{t('mission.body')}
					</p>
				</Reveal>
			</section>

			{/* バリュー: 番号付き（01/02/03）カード */}
			<section id="values" className="scroll-mt-24 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-20">
					<Reveal>
						<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
						<p className="text-xs uppercase tracking-widest text-accent-text">
							{t('values.label')}
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
							{t('values.title')}
						</h2>
					</Reveal>
					<div className="mt-10 grid gap-6 sm:grid-cols-3">
						{VALUE_KEYS.map((key, i) => (
							<Reveal key={key} delay={i * 0.08}>
								<div className="h-full rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
									<span className="text-3xl font-semibold tabular-nums leading-none text-accent-text">
										{String(i + 1).padStart(2, '0')}
									</span>
									<h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
										{t(`values.items.${key}.title`)}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
										{t(`values.items.${key}.body`)}
									</p>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* 会社情報 */}
			<section id="company" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
				<Reveal>
					<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
					<p className="text-xs uppercase tracking-widest text-accent-text">
						{t('companyInfo.label')}
					</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
						{t('companyInfo.title')}
					</h2>
					<dl className="mt-8 border-t border-zinc-200 dark:border-zinc-800">
						{COMPANY_ROW_KEYS.map((key) => (
							<div
								key={key}
								className="flex flex-col gap-1 border-b border-zinc-200 py-4 sm:flex-row sm:gap-6 dark:border-zinc-800"
							>
								<dt className="w-40 shrink-0 text-sm text-zinc-500">
									{t(`companyInfo.rows.${key}.label`)}
								</dt>
								<dd className="text-sm text-zinc-900 dark:text-zinc-200">
									{t(`companyInfo.rows.${key}.value`)}
								</dd>
							</div>
						))}
					</dl>
				</Reveal>
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
