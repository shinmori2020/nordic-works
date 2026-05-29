/**
 * 資料請求 詳細＋申込フォームページ — /resources/[slug]
 *
 * 左カラム: 資料の説明・概要・トピック・メタ情報
 * 右カラム: 申込フォーム（Client Component）
 *
 * generateStaticParams で全 whitepaper を事前ビルドする。
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WHITEPAPERS, getWhitepaperBySlug } from '@/lib/whitepapers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { WhitepaperRequestForm } from '@/components/corporate/WhitepaperRequestForm';
import { formatDate } from '@/lib/utils';
import type { SlugPageProps } from '@/types/wordpress';

export const revalidate = 86400;

export async function generateStaticParams() {
	return WHITEPAPERS.map((wp) => ({ slug: wp.slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const wp = getWhitepaperBySlug(slug);
	if (!wp) {
		return { title: '資料が見つかりません' };
	}
	return {
		title: wp.title,
		description: wp.summary,
		alternates: { canonical: `/resources/${wp.slug}` },
	};
}

export default async function WhitepaperDetailPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const wp = getWhitepaperBySlug(slug);

	if (!wp) {
		notFound();
	}

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<Breadcrumbs
				items={[
					{ label: 'ホーム', href: '/' },
					{ label: 'Resources', href: '/resources' },
					{ label: wp.title },
				]}
			/>

			<div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
				{/* 左カラム: 資料説明 */}
				<article>
					<p className="text-xs uppercase tracking-widest text-zinc-500">
						Whitepaper
					</p>
					<h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
						{wp.title}
					</h1>

					<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
						<time dateTime={wp.publishedAt}>{formatDate(wp.publishedAt)} 公開</time>
						<span>· PDF {wp.pageCount} ページ</span>
						<span>· 約 {wp.readingTime} 分で読めます</span>
					</div>

					<div className="mt-4 flex flex-wrap gap-2">
						{wp.topics.map((topic) => (
							<span
								key={topic}
								className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
							>
								{topic}
							</span>
						))}
					</div>

					<div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
						{wp.body.map((paragraph, i) => (
							<p key={i}>{paragraph}</p>
						))}
					</div>

					<aside className="mt-10 rounded-lg bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
						<p className="font-semibold text-zinc-900 dark:text-zinc-100">
							ご利用にあたって
						</p>
						<p className="mt-2">
							記入いただいた情報は、資料送付と関連サービスのご案内のためにのみ
							利用します。詳しくは
							{' '}
							<a
								href="/privacy"
								className="underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
							>
								プライバシーポリシー
							</a>
							{' '}
							をご覧ください。
						</p>
					</aside>
				</article>

				{/* 右カラム: 申込フォーム */}
				<div>
					<div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-6">
						<p className="text-xs uppercase tracking-widest text-zinc-500">
							Download Form
						</p>
						<h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							資料を請求する
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
							下記フォームに必要事項をご記入ください。担当者より2〜3営業日以内に
							PDFをお送りします。
						</p>

						<div className="mt-6">
							<WhitepaperRequestForm
								whitepaperSlug={wp.slug}
								whitepaperTitle={wp.title}
							/>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
