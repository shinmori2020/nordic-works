/**
 * 記事本文（WordPress content.rendered の HTML 文字列）から目次を生成する。
 *
 * h2 / h3 を抽出し、各見出しに一意な id を注入した HTML と、
 * 目次データ（id・テキスト・レベル）を返す。
 */

export interface TocHeading {
	id: string;
	text: string;
	level: 2 | 3;
}

export interface TocResult {
	/** 各見出しに id を付与した HTML */
	html: string;
	headings: TocHeading[];
}

export function buildTableOfContents(html: string): TocResult {
	const headings: TocHeading[] = [];
	let index = 0;

	const withIds = html.replace(
		/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g,
		(_match, level: string, attrs: string, inner: string) => {
			const id = `section-${++index}`;
			const text = inner.replace(/<[^>]+>/g, '').trim();
			headings.push({ id, text, level: Number(level) as 2 | 3 });
			// 既存属性は保持しつつ id を追加
			return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
		},
	);

	return { html: withIds, headings };
}
