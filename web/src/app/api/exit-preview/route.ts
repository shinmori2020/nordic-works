/**
 * プレビュー終了エンドポイント — /api/exit-preview
 *
 * draftMode を無効化し、指定があればその場所に、なければトップへ戻す。
 */

import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	(await draftMode()).disable();
	const redirectTo = request.nextUrl.searchParams.get('redirect') ?? '/';
	// オープンリダイレクト防止: サイト内パスのみ許可
	redirect(redirectTo.startsWith('/') ? redirectTo : '/');
}
