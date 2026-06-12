/**
 * プライバシーポリシーページ — /privacy
 *
 * 架空のポートフォリオサイトとしての位置付けを明記しつつ、
 * 実運用想定での取得情報・利用目的・第三者提供・問い合わせ窓口を提示する。
 *
 * レイアウトは about と統一: 扉ヘッダー（大きな PRIVACY ＋ タグライン）＋
 * 番号インデックスナビ（各条項へアンカー）＋読みやすい幅の本文。
 * 本文は日本語固定（i18n 対象外）。
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localeAlternates } from '@/lib/site';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'privacy' });
	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		alternates: localeAlternates('/privacy'),
	};
}

const LAST_UPDATED = '2026-05-28';

const SECTIONS: { title: string; body: string }[] = [
	{
		title: '取得する情報',
		body:
			'お問い合わせフォームを通じて、お名前・メールアドレス・会社名・お問い合わせ内容を取得します。' +
			'加えて、サイトの改善のために、ページ閲覧情報・参照元 URL・ブラウザ種類・OS・端末情報を' +
			'Vercel Web Analytics / Speed Insights によって匿名化された形で収集します。',
	},
	{
		title: '利用目的',
		body:
			'取得した情報は、(1) お問い合わせへの対応、(2) サービスに関する情報提供、' +
			'(3) サイトのコンテンツ改善とパフォーマンス測定の目的でのみ利用します。マーケティング目的の' +
			'第三者への提供は行いません。',
	},
	{
		title: 'Cookie および類似技術',
		body:
			'サイト改善および機能提供のため、Cookie および localStorage を使用します。' +
			'Cookie 利用への同意は初回アクセス時に確認します。同意状況はいつでもブラウザの' +
			'設定から変更可能です。',
	},
	{
		title: '第三者サービス',
		body:
			'本サイトは Vercel（ホスティング・解析）、Algolia（検索）、Resend（メール送信）を' +
			'利用しています。各サービスの個人情報の取り扱いは、各社の方針に従います。',
	},
	{
		title: '第三者提供',
		body:
			'法令に基づく開示要求がある場合を除き、取得した個人情報を本人の同意なく第三者に' +
			'提供することはありません。',
	},
	{
		title: '保存期間',
		body:
			'お問い合わせ情報は、対応完了から原則として1年間保存し、その後削除します。' +
			'アクセス解析データは、Vercel の標準保存期間に従います。',
	},
	{
		title: '開示・訂正・削除請求',
		body:
			'ご自身の個人情報について、開示・訂正・削除をご希望の場合は、お問い合わせフォームから' +
			'ご連絡ください。本人確認の上、合理的な期間内に対応いたします。',
	},
	{
		title: 'ポリシーの変更',
		body:
			'本ポリシーは、法令の変更やサービスの改善に応じて改訂されることがあります。' +
			'重要な変更があった場合は、サイト上で告知します。',
	},
];

const no = (i: number) => String(i + 1).padStart(2, '0');

export default function PrivacyPage() {
	return (
		<main>
			{/* ヒーロー: 扉（大きな PRIVACY ＋ タグライン）＋番号インデックス */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
					<Breadcrumbs items={[{ label: 'プライバシーポリシー' }]} />

					<div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr] md:items-end md:gap-12">
						<h1 className="text-6xl font-semibold uppercase leading-none tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-7xl md:text-8xl">
							Privacy
						</h1>
						<div className="md:pb-2">
							<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
							<p className="text-xl font-medium leading-snug tracking-tight text-zinc-700 dark:text-zinc-300 sm:text-2xl">
								個人情報の取り扱いについて。
							</p>
							<p className="mt-2 text-sm text-zinc-500">最終更新日: {LAST_UPDATED}</p>
						</div>
					</div>

					{/* 番号インデックスナビ（各条項へアンカー） */}
					<nav
						aria-label="プライバシーポリシー目次"
						className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:mt-12"
					>
						<ul className="flex flex-wrap gap-x-6 gap-y-3">
							{SECTIONS.map((section, i) => (
								<li key={section.title}>
									<a
										href={`#privacy-${i + 1}`}
										className="group inline-flex items-baseline gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
									>
										<span className="font-mono text-xs text-accent-text">{no(i)}</span>
										<span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-zinc-400 dark:group-hover:border-zinc-500">
											{section.title}
										</span>
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</section>

			{/* 本文 */}
			<section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
				<div>
					{/* 架空サイトであることの明示 */}
					<aside className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
						本サイトはポートフォリオ目的で制作された架空企業のウェブサイトです。
						掲載内容は実運用を想定した参考例であり、実際の事業活動を反映するものではありません。
					</aside>

					<div className="mt-10 space-y-10">
						{SECTIONS.map((section, i) => (
							<section key={section.title} id={`privacy-${i + 1}`} className="scroll-mt-24">
								<div className="flex items-baseline gap-3">
									<span className="font-mono text-sm font-semibold text-accent-text">{no(i)}</span>
									<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
										{section.title}
									</h2>
								</div>
								<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
									{section.body}
								</p>
							</section>
						))}
					</div>

					{/* 問い合わせ窓口 */}
					<section className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
							お問い合わせ窓口
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
							本ポリシーに関するご質問は、
							<Link
								href="/contact"
								className="text-accent-text underline underline-offset-2 transition-colors hover:no-underline"
							>
								お問い合わせフォーム
							</Link>
							からご連絡ください。
						</p>
					</section>
				</div>
			</section>
		</main>
	);
}
