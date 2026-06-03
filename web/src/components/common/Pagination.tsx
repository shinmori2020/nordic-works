/**
 * Pagination — パスベースのページ送り
 *
 * 1ページ目は basePath（例 /articles）、2ページ目以降は
 * {basePath}/page/{n} を指す。next-intl の Link を使うためロケールは保持される。
 * SSR で完結し JS なしでも動作する（純粋なリンク）。
 */
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	/** 1ページ目のパス。2ページ目以降は `${basePath}/page/${n}` */
	basePath: string;
};

function hrefFor(basePath: string, page: number): string {
	return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

export async function Pagination({
	currentPage,
	totalPages,
	basePath,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const t = await getTranslations('pagination');

	// 表示するページ番号: 現在ページの前後1つ + 先頭・末尾。間は省略記号。
	const pages: (number | 'ellipsis')[] = [];
	for (let p = 1; p <= totalPages; p++) {
		if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
			pages.push(p);
		} else if (pages[pages.length - 1] !== 'ellipsis') {
			pages.push('ellipsis');
		}
	}

	const linkBase =
		'inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors';
	const inactive =
		'border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600';
	const active =
		'border-accent bg-accent text-white';
	const disabled =
		'cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-900 dark:text-zinc-700';

	return (
		<nav
			aria-label={t('label')}
			className="mt-14 flex items-center justify-center gap-2"
		>
			{/* 前へ */}
			{currentPage > 1 ? (
				<Link
					href={hrefFor(basePath, currentPage - 1)}
					rel="prev"
					className={`${linkBase} ${inactive}`}
				>
					<span aria-hidden="true">←</span>
					<span className="sr-only">{t('previous')}</span>
				</Link>
			) : (
				<span aria-hidden="true" className={`${linkBase} ${disabled}`}>
					←
				</span>
			)}

			{/* ページ番号 */}
			{pages.map((p, i) =>
				p === 'ellipsis' ? (
					<span
						key={`e${i}`}
						aria-hidden="true"
						className="px-1 text-zinc-400"
					>
						…
					</span>
				) : p === currentPage ? (
					<span
						key={p}
						aria-current="page"
						className={`${linkBase} ${active}`}
					>
						{p}
					</span>
				) : (
					<Link
						key={p}
						href={hrefFor(basePath, p)}
						aria-label={t('goToPage', { page: p })}
						className={`${linkBase} ${inactive}`}
					>
						{p}
					</Link>
				),
			)}

			{/* 次へ */}
			{currentPage < totalPages ? (
				<Link
					href={hrefFor(basePath, currentPage + 1)}
					rel="next"
					className={`${linkBase} ${inactive}`}
				>
					<span aria-hidden="true">→</span>
					<span className="sr-only">{t('next')}</span>
				</Link>
			) : (
				<span aria-hidden="true" className={`${linkBase} ${disabled}`}>
					→
				</span>
			)}
		</nav>
	);
}
