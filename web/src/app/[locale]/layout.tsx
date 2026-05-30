/**
 * ロケール別レイアウト — /[locale]/...
 *
 * 役割:
 * - URL パスから取得した locale が許容リスト内か検証（不正なら notFound）
 * - setRequestLocale で next-intl が同期処理を静的化できるよう通知
 * - generateStaticParams で全ロケールを事前ビルド対象に
 *
 * 実際の Header / Footer / プロバイダー類は app/layout.tsx に置く。
 * このレイアウトは locale 検証のためだけに存在する。
 */

import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	// next-intl の静的化（generateStaticParams 対応）のために必須
	setRequestLocale(locale);

	return children;
}
