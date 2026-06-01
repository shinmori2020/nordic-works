'use client';

/**
 * グローバルエラー境界 — root layout 自体が描画に失敗した時の最終フォールバック。
 *
 * root layout を置き換える形でレンダリングされるため、<html>/<body> を自前で持つ。
 * NextIntlClientProvider の外側なので翻訳は使えない。ロケール不明のため日英併記。
 * globals.css が適用されない可能性も考慮し、最小限の inline style も併用する。
 */

import { useEffect } from 'react';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('[global-error]', error);
	}, [error]);

	return (
		<html lang="ja">
			<body
				style={{
					margin: 0,
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
					background: '#ffffff',
					color: '#18181b',
				}}
			>
				<main style={{ maxWidth: 480, padding: '2rem', textAlign: 'center' }}>
					<p
						style={{
							fontSize: 12,
							letterSpacing: '0.1em',
							textTransform: 'uppercase',
							color: '#71717a',
							margin: 0,
						}}
					>
						Error
					</p>
					<h1 style={{ fontSize: 28, fontWeight: 600, margin: '8px 0 0' }}>
						問題が発生しました
						<br />
						<span style={{ fontSize: 18, color: '#52525b' }}>
							Something went wrong
						</span>
					</h1>
					<p
						style={{
							fontSize: 14,
							lineHeight: 1.7,
							color: '#52525b',
							margin: '16px 0',
						}}
					>
						予期しないエラーが発生しました。もう一度お試しください。
						<br />
						An unexpected error occurred. Please try again.
					</p>

					{error.digest && (
						<p style={{ fontSize: 12, color: '#a1a1aa' }}>
							<code>{error.digest}</code>
						</p>
					)}

					<button
						type="button"
						onClick={reset}
						style={{
							marginTop: 24,
							borderRadius: 6,
							border: 'none',
							background: '#18181b',
							color: '#ffffff',
							fontSize: 14,
							fontWeight: 500,
							padding: '10px 24px',
							cursor: 'pointer',
						}}
					>
						もう一度試す / Try again
					</button>
				</main>
			</body>
		</html>
	);
}
