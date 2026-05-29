/**
 * プライバシーポリシーページ — /privacy
 *
 * 架空のポートフォリオサイトとしての位置付けを明記しつつ、
 * 実運用想定での取得情報・利用目的・第三者提供・問い合わせ窓口を提示する。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const metadata: Metadata = {
	title: 'プライバシーポリシー',
	description:
		'Nordic Works が取得する情報、利用目的、Cookie の取り扱い、お問い合わせ窓口について。',
	alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = '2026-05-28';

const SECTIONS: { heading: string; body: string }[] = [
	{
		heading: '1. 取得する情報',
		body:
			'お問い合わせフォームを通じて、お名前・メールアドレス・会社名・お問い合わせ内容を取得します。' +
			'加えて、サイトの改善のために、ページ閲覧情報・参照元 URL・ブラウザ種類・OS・端末情報を' +
			'Vercel Web Analytics / Speed Insights によって匿名化された形で収集します。',
	},
	{
		heading: '2. 利用目的',
		body:
			'取得した情報は、(1) お問い合わせへの対応、(2) サービスに関する情報提供、' +
			'(3) サイトのコンテンツ改善とパフォーマンス測定の目的でのみ利用します。マーケティング目的の' +
			'第三者への提供は行いません。',
	},
	{
		heading: '3. Cookie および類似技術',
		body:
			'サイト改善および機能提供のため、Cookie および localStorage を使用します。' +
			'Cookie 利用への同意は初回アクセス時に確認します。同意状況はいつでもブラウザの' +
			'設定から変更可能です。',
	},
	{
		heading: '4. 第三者サービス',
		body:
			'本サイトは Vercel（ホスティング・解析）、Algolia（検索）、Resend（メール送信）を' +
			'利用しています。各サービスの個人情報の取り扱いは、各社の方針に従います。',
	},
	{
		heading: '5. 第三者提供',
		body:
			'法令に基づく開示要求がある場合を除き、取得した個人情報を本人の同意なく第三者に' +
			'提供することはありません。',
	},
	{
		heading: '6. 保存期間',
		body:
			'お問い合わせ情報は、対応完了から原則として1年間保存し、その後削除します。' +
			'アクセス解析データは、Vercel の標準保存期間に従います。',
	},
	{
		heading: '7. 開示・訂正・削除請求',
		body:
			'ご自身の個人情報について、開示・訂正・削除をご希望の場合は、お問い合わせフォームから' +
			'ご連絡ください。本人確認の上、合理的な期間内に対応いたします。',
	},
	{
		heading: '8. ポリシーの変更',
		body:
			'本ポリシーは、法令の変更やサービスの改善に応じて改訂されることがあります。' +
			'重要な変更があった場合は、サイト上で告知します。',
	},
];

export default function PrivacyPage() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-12">
			<Breadcrumbs
				items={[
					{ label: 'ホーム', href: '/' },
					{ label: 'プライバシーポリシー' },
				]}
			/>

			<header className="mt-6">
				<p className="text-xs uppercase tracking-widest text-zinc-500">Privacy</p>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
					プライバシーポリシー
				</h1>
				<p className="mt-2 text-sm text-zinc-500">最終更新日: {LAST_UPDATED}</p>
			</header>

			{/* 架空サイトであることの明示 */}
			<aside className="mt-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
				本サイトはポートフォリオ目的で制作された架空企業のウェブサイトです。
				掲載内容は実運用を想定した参考例であり、実際の事業活動を反映するものではありません。
			</aside>

			<div className="mt-10 space-y-8">
				{SECTIONS.map((section) => (
					<section key={section.heading}>
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
							{section.heading}
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
							{section.body}
						</p>
					</section>
				))}
			</div>

			<section className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
				<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
					お問い合わせ窓口
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					本ポリシーに関するご質問は、
					<Link
						href="/contact"
						className="underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						お問い合わせフォーム
					</Link>
					からご連絡ください。
				</p>
			</section>
		</main>
	);
}
