/**
 * 会社概要ページ — /about
 *
 * 架空企業 Nordic Works のミッション・バリュー・会社情報を紹介する静的ページ。
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: '会社概要',
	description:
		'Nordic Works は、北欧式の働き方・組織文化を翻訳的に届ける B2B SaaS 企業です。ミッション・バリュー・会社情報を紹介します。',
	alternates: { canonical: '/about' },
};

const VALUES = [
	{
		title: '透明性 (Transparency)',
		body: '意思決定の過程と根拠を開示する。情報の非対称をなくすことが、信頼と自律の前提だと考えます。',
	},
	{
		title: '心理的安全性 (Psychological Safety)',
		body: '率直に意見を言える環境こそがチームの学習速度を決める。私たち自身が実践し、その知見を製品に還元します。',
	},
	{
		title: 'データと人間性の両立 (Data × Humanity)',
		body: '組織の課題を定量化しつつ、最後は人の文脈で判断する。数字と物語のどちらも手放しません。',
	},
];

const COMPANY_INFO = [
	{ label: '会社名', value: 'Nordic Works 株式会社（架空）' },
	{ label: '事業内容', value: '組織開発・働き方改善を支援する B2B SaaS の開発・提供' },
	{ label: '設立', value: '2021年（設定）' },
	{ label: '所在地', value: '東京（リモートファースト）' },
	{ label: '備考', value: 'これはポートフォリオ用に制作された架空の企業サイトです。' },
];

export default function AboutPage() {
	return (
		<main>
			{/* ヒーロー */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
					<p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
						About
					</p>
					<h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
						北欧の知恵を、日本の現場へ。
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
						Nordic Works は、リモートワーク・心理的安全性・組織デザインといった
						北欧型の働き方を、データと実装に落とし込んで届ける B2B SaaS 企業です。
						「働きやすさ」を感覚論で終わらせず、測定し、設計し、改善するための
						プロダクトと知見を提供します。
					</p>
				</div>
			</section>

			{/* ミッション */}
			<section className="mx-auto max-w-4xl px-6 py-16">
				<p className="text-xs uppercase tracking-widest text-zinc-500">Mission</p>
				<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
					働き方を、再現可能な「設計」にする。
				</h2>
				<p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
					優れた組織文化は一部の名経営者の勘や、特定企業の幸運な歴史に依存しがちです。
					私たちはそれを、誰もが学び・導入・運用できる「設計」へと翻訳します。
					北欧諸国が長年かけて培ってきた働き方の知恵を、日本の組織が今日から
					使える形にすることが Nordic Works の役割です。
				</p>
			</section>

			{/* バリュー */}
			<section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-4xl px-6 py-16">
					<p className="text-xs uppercase tracking-widest text-zinc-500">Values</p>
					<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
						私たちが大切にすること
					</h2>
					<div className="mt-8 grid gap-6 sm:grid-cols-3">
						{VALUES.map((v) => (
							<div
								key={v.title}
								className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
							>
								<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
									{v.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
									{v.body}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 会社情報 */}
			<section className="mx-auto max-w-4xl px-6 py-16">
				<p className="text-xs uppercase tracking-widest text-zinc-500">Company</p>
				<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
					会社情報
				</h2>
				<dl className="mt-8">
					{COMPANY_INFO.map((row) => (
						<div
							key={row.label}
							className="flex flex-col gap-1 border-b border-zinc-200 py-4 sm:flex-row sm:gap-6 dark:border-zinc-800"
						>
							<dt className="w-32 shrink-0 text-sm text-zinc-500">{row.label}</dt>
							<dd className="text-sm text-zinc-900 dark:text-zinc-200">{row.value}</dd>
						</div>
					))}
				</dl>
			</section>

			{/* CTA */}
			<section className="border-t border-zinc-200 dark:border-zinc-800">
				<div className="mx-auto grid max-w-4xl gap-px bg-zinc-200 sm:grid-cols-2 dark:bg-zinc-800">
					<Link
						href="/careers"
						className="group bg-white p-10 transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-zinc-500">Careers</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							一緒に働きませんか
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							北欧式の組織づくりを共に推進するメンバーを募集しています。
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 group-hover:underline dark:text-zinc-100">
							採用情報を見る →
						</span>
					</Link>
					<Link
						href="/contact"
						className="group bg-white p-10 transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-zinc-500">Contact</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							お問い合わせ
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							サービス導入のご相談・取材のご依頼はこちらから。
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 group-hover:underline dark:text-zinc-100">
							お問い合わせフォームへ →
						</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
