/**
 * プレビューバナー。
 *
 * draftMode 有効時に画面上部へ固定表示し、下書きを見ていることを明示する。
 * 「プレビューを終了」で /api/exit-preview に遷移して通常表示に戻る。
 */

export function PreviewBanner() {
	return (
		<div className="sticky top-0 z-[70] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
			<span>プレビュー表示中（下書きを含みます）</span>
			<a
				href="/api/exit-preview"
				className="rounded bg-amber-950/10 px-2.5 py-0.5 underline underline-offset-2 transition-colors hover:bg-amber-950/20"
			>
				プレビューを終了
			</a>
		</div>
	);
}
