/**
 * <html lang> を現在ロケールに同期する（Client Component）。
 *
 * ルート app/layout.tsx は [locale] の外側にあり、静的生成では正しい
 * ロケールを取得できず lang が既定値になってしまう。このコンポーネントを
 * NextIntlClientProvider 配下に置き、クライアントで lang を補正する。
 */
'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export function HtmlLang() {
	const locale = useLocale();
	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);
	return null;
}
