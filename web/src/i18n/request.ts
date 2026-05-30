/**
 * Server Component / generateMetadata で next-intl が
 * 現在ロケールの messages を読み込むためのリクエスト設定。
 *
 * next.config.ts で `createNextIntlPlugin()` に渡す。
 */

import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
