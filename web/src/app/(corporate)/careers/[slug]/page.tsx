/**
 * 採用情報詳細ページ — /careers/[slug]
 *
 * 雇用形態・勤務地・給与・必須/歓迎スキル・待遇を表示する。
 * スキル・待遇は ACF textarea の「1行1項目」形式を parseLines() で配列化する。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCareerBySlug, getCareers } from '@/lib/wordpress';
import { stripHtml, parseLines, positionTypeLabel } from '@/lib/utils';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ApplicationForm } from '@/components/corporate/ApplicationForm';
import type { SlugPageProps } from '@/types/wordpress';

// ISR: 採用情報は更新頻度が低いため24時間
export const revalidate = 86400;

export async function generateStaticParams() {
	const careers = await getCareers();
	return careers.map((career) => ({ slug: career.slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const career = await getCareerBySlug(slug);
	if (!career) {
		return { title: '採用情報が見つかりません' };
	}
	return {
		title: career.title.rendered,
		description: stripHtml(career.content.rendered).slice(0, 120),
		alternates: { canonical: `/careers/${career.slug}` },
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

export default async function CareerDetailPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const career = await getCareerBySlug(slug);

	if (!career) {
		notFound();
	}

	const acf = career.acf;
	const requiredSkills = parseLines(acf?.required_skills);
	const preferredSkills = parseLines(acf?.preferred_skills);
	const benefits = parseLines(acf?.benefits);

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<Breadcrumbs
				items={[
					{ label: 'ホーム', href: '/' },
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
						<MetaRow label="雇用形態" value={positionTypeLabel(acf.position_type)} />
					)}
					{acf?.location && <MetaRow label="勤務地" value={acf.location} />}
					{acf?.salary_range && <MetaRow label="給与レンジ" value={acf.salary_range} />}
				</dl>

				{/* 募集概要（本文） */}
				{career.content.rendered && (
					<div
						className="article-body mt-10 text-zinc-800 dark:text-zinc-200"
						dangerouslySetInnerHTML={{ __html: career.content.rendered }}
					/>
				)}

				<ListSection title="必須スキル" items={requiredSkills} />
				<ListSection title="歓迎スキル" items={preferredSkills} />
				<ListSection title="待遇・福利厚生" items={benefits} />

				{/* 応募導線。
				    application_url が ACF に設定されていれば外部応募サイトへのリンクのみ、
				    なければインライン応募フォームを表示する（外部システム未連携の場合の標準ルート）。 */}
				{acf?.application_url ? (
					<section className="mt-14 rounded-lg bg-zinc-900 px-8 py-10 text-center dark:bg-zinc-100">
						<p className="text-lg font-medium text-white dark:text-zinc-900">
							このポジションに興味がありますか？
						</p>
						<Link
							href={acf.application_url}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-4 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-700"
						>
							外部応募サイトから応募する ↗
						</Link>
					</section>
				) : (
					<section
						id="apply"
						className="mt-14 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
					>
						<p className="text-xs uppercase tracking-widest text-zinc-500">
							Application Form
						</p>
						<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							このポジションに応募する
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
							下記フォームに必要事項をご記入ください。書類選考の結果は、
							受付から5営業日以内にメールにてご連絡いたします。
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
