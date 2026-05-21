/**
 * next-themes のラッパー（Client Component）。
 *
 * <html class="dark"> をクラスで切り替える。OS設定を初期値にしつつ手動切替も可能。
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
