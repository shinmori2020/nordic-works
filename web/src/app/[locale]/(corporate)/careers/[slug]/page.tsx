/**
 * 採用情報詳細ページ — /careers/[slug]
 *
 * 雇用形態・勤務地・給与・必須/歓迎スキル・待遇を表示する。
 * スキル・待遇は ACF textarea の「1行1項目」形式を parseLines() で配列化する。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCareerBySlug, getCareers } from '@/lib/wordpress';
import { stripHtml, parseLines } from '@/lib/utils';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ApplicationForm } from '@/components/corporate/ApplicationForm';

// ISR: 採用情報は更新頻度が低いため24時間
export const revalidate = 86400;

export async function generateStaticParams() {
	const careers = await getCareers();
	return careers.map((career) => ({ slug: career.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const career = await getCareerBySlug(slug);
	if (!career) {
		return { title: 'Not found' };
	}
	return {
		title: career.title.rendered,
		description: stripHtml(career.content.rendered).slice(0, 120),
		alternates: localeAlternates(`/careers/${career.slug}`),
	};
}

/** ラベル付きの定義リスト行 */
function MetaRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 py-3">
			<dt className="w-24 shrink-0 text-sm text-zinc-500">{label}</dt>
			<dd className="text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
		</div>
	);
}

/** スキル・待遇などの箇条書きセクション */
function ListSection({ title, items }: { title: string; items: string[] }) {
	if (items.length === 0) return null;
	return (
		<section className="mt-10">
			<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
			<ul className="mt-4 space-y-2">
				{items.map((item, i) => (
					<li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
						<span className="text-zinc-400">•</span>
						<span>{item}</span>
					</li>
				))}
			</ul>
		</section>
	);
}

/** position_type の値 → 翻訳キーのサフィックス */
const POSITION_TYPE_KEY: Record<string, string> = {
	full_time: 'positionTypeFullTime',
	contract: 'positionTypeContract',
	freelance: 'positionTypeFreelance',
};

export default async function CareerDetailPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	setRequestLocale(locale);
	const career = await getCareerBySlug(slug);

	if (!career) {
		notFound();
	}

	const t = await getTranslations('careers');
	const acf = career.acf;
	const requiredSkills = parseLines(acf?.required_skills);
	const preferredSkills = parseLines(acf?.preferred_skills);
	const benefits = parseLines(acf?.benefits);
	const positionTypeText =
		acf?.position_type && POSITION_TYPE_KEY[acf.position_type]
			? t(POSITION_TYPE_KEY[acf.position_type])
			: (acf?.position_type ?? '');

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<Breadcrumbs
				items={[
					{ label: 'Careers', href: '/careers' },
					{ label: stripHtml(career.title.rendered) },
				]}
			/>

			<article className="mt-6">
				{/* ヘッダー */}
				<p className="text-xs uppercase tracking-widest text-zinc-500">Careers</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{career.title.rendered}
				</h1>

				{/* 募集要項メタ */}
				<dl className="mt-8">
					{acf?.position_type && (
						<MetaRow label={t('positionType')} value={positionTypeText} />
					)}
					{acf?.location && <MetaRow label={t('location')} value={acf.location} />}
					{acf?.salary_range && <MetaRow label={t('salary')} value={acf.salary_range} />}
				</dl>

				{/* 募集概要（本文） */}
				{career.content.rendered && (
					<div
						className="article-body mt-10 text-zinc-800 dark:text-zinc-200"
						dangerouslySetInnerHTML={{ __html: career.content.rendered }}
					/>
				)}

				<ListSection title={t('requiredSkills')} items={requiredSkills} />
				<ListSection title={t('preferredSkills')} items={preferredSkills} />
				<ListSection title={t('benefits')} items={benefits} />

				{/* 応募導線。
				    application_url が ACF に設定されていれば外部応募サイトへのリンクのみ、
				    なければインライン応募フォームを表示する（外部システム未連携の場合の標準ルート）。 */}
				{acf?.application_url ? (
					<section className="mt-14 rounded-lg bg-zinc-900 px-8 py-10 text-center dark:bg-zinc-100">
						<p className="text-lg font-medium text-white dark:text-zinc-900">
							{t('externalCtaTitle')}
						</p>
						<Link
							href={acf.application_url}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-4 block w-full rounded-md bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 sm:inline-block sm:w-auto dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-700"
						>
							{t('externalCtaButton')}
						</Link>
					</section>
				) : (
					<section
						id="apply"
						className="mt-14 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
					>
						<p className="text-xs uppercase tracking-widest text-zinc-500">
							{t('applicationFormLabel')}
						</p>
						<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('applicationFormTitle')}
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
							{t('applicationFormDescription')}
						</p>

						<div className="mt-6">
							<ApplicationForm
								careerSlug={career.slug}
								careerTitle={stripHtml(career.title.rendered)}
							/>
						</div>
					</section>
				)}
			</article>
		</main>
	);
}
