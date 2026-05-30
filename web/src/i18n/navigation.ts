/**
 * ロケール対応の Link / redirect / usePathname / useRouter ラッパー。
 *
 * 内部ナビゲーションでは next/link の代わりにこれをインポートする。
 * 自動で現在のロケールを保持してくれる。
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
