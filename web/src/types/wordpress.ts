/**
 * WordPress REST API response types.
 *
 * src/lib/wordpress.ts の取得関数が返すデータの型を集約管理する。
 * (CLAUDE.md の方針「型は src/types/wordpress.ts で集約管理」に準拠)
 */

// =============================================================================
// 基本型 / Primitives
// =============================================================================

/** WordPress の rendered フィールド (title / content / excerpt 等) */
export interface WPRendered {
	rendered: string;
}

/** 投稿ステータス */
export type WPPostStatus = 'publish' | 'draft' | 'pending' | 'private' | 'future';

// =============================================================================
// メディア・タクソノミー / Media & Taxonomy
// =============================================================================

/** メディア (アイキャッチ画像など) */
export interface WPMedia {
	id: number;
	source_url: string;
	alt_text: string;
	media_details: {
		width: number;
		height: number;
	};
}

/** タクソノミーターム (industry / topic / reading_level) */
export interface WPTerm {
	id: number;
	name: string;
	slug: string;
	taxonomy: string;
	count?: number;
}

/** WP デフォルトの投稿者 (WordPress ユーザー。CPT author_profile とは別物) */
export interface WPAuthorRef {
	id: number;
	name: string;
	slug: string;
}

/** _embed パラメータで埋め込まれる関連データ */
export interface WPEmbedded {
	'wp:featuredmedia'?: WPMedia[];
	'wp:term'?: WPTerm[][];
	author?: WPAuthorRef[];
}

// =============================================================================
// ACF テキストエリアのパース後の型
//
// ACF 無料版にはリピーター機能が無いため、複数行データはテキストエリアに
// 区切り文字形式（1行1項目、項目内は ` | ` 区切り）で保存する。
// 下記はフロント側でパースした「後」の型。パースは src/lib/utils.ts。
// =============================================================================

/** サービス: 機能リストの1項目（パース後） */
export interface ServiceFeature {
	title: string;
	description: string;
}

/** サービス: 料金プランの1項目（パース後） */
export interface PricingPlan {
	name: string;
	price: string;
	includedFeatures: string[];
}

/** サービス: FAQ の1項目（パース後） */
export interface FaqItem {
	question: string;
	answer: string;
}

/** サービス: 導入事例リンクの1項目（パース後） */
export interface CaseStudyLink {
	label: string;
	url: string;
}

/** 採用情報: 雇用形態 (ACF select フィールドの値) */
export type PositionType = 'full_time' | 'contract' | 'freelance';

// =============================================================================
// ACF フィールドグループ型
//
// 注1: ACF の post_object / relationship / image フィールドは、REST API 上では
//      実体オブジェクトではなく数値 ID（または ID 配列）で返る。未設定時は
//      `false` が返ることがあるため、型に `| false` を含める。
//      ID を実体に解決するには src/lib/wordpress.ts の getPostsByIds() /
//      getAuthorById() を使う。アイキャッチ画像は ACF ではなく `_embedded`
//      （wp:featuredmedia）から getFeaturedImage() で取得する。
// 注2: 旧リピーターフィールド（features 等）は ACF 無料版の制約で textarea に
//      変更したため、生の値は string。利用側で src/lib/utils.ts のパーサに通す。
// =============================================================================

/** 記事 (post) の ACF フィールド群 — group_nordic_post */
export interface PostAcf {
	/** 著者プロフィールの投稿ID。getAuthorById() で解決する */
	author_profile?: number | false;
	reading_time?: number;
	featured_image_caption?: string;
	/** 関連記事の投稿ID配列。getPostsByIds() で解決する */
	related_posts?: number[] | false;
}

/** サービス (service) の ACF フィールド群 — group_nordic_service */
export interface ServiceAcf {
	subtitle?: string;
	/** メディアID。表示にはアイキャッチ（getFeaturedImage）を使う */
	hero_image?: number | false;
	/** textarea 生値。parseServiceFeatures() でパースする */
	features?: string;
	/** textarea 生値。parsePricingPlans() でパースする */
	pricing_plans?: string;
	/** textarea 生値。parseFaq() でパースする */
	faq?: string;
	/** textarea 生値。parseCaseStudyLinks() でパースする */
	case_study_links?: string;
	cta_text?: string;
	cta_url?: string;
}

/** 採用情報 (career) の ACF フィールド群 — group_nordic_career */
export interface CareerAcf {
	position_type?: PositionType;
	location?: string;
	salary_range?: string;
	/** textarea 生値。parseLines() で行配列にパースする */
	required_skills?: string;
	/** textarea 生値。parseLines() で行配列にパースする */
	preferred_skills?: string;
	/** textarea 生値。parseLines() で行配列にパースする */
	benefits?: string;
	application_url?: string;
}

/** 特集 (feature) の ACF フィールド群 — group_nordic_feature */
export interface FeatureAcf {
	/** メディアID。表示にはアイキャッチ（getFeaturedImage）を使う */
	cover_image?: number | false;
	lead_text?: string;
	/** 関連記事の投稿ID配列。getPostsByIds() で解決する */
	related_articles?: number[] | false;
	published_period_start?: string;
	published_period_end?: string;
}

/** 著者プロフィール (author_profile) の ACF フィールド群 — group_nordic_author_profile */
export interface AuthorProfileAcf {
	/** メディアID。表示にはアイキャッチ（getFeaturedImage）を使う */
	photo?: number | false;
	position?: string;
	bio?: string;
	twitter_url?: string;
	linkedin_url?: string;
	website_url?: string;
}

/** 導入事例 (case_study) の ACF フィールド群 — group_nordic_case_study */
export interface CaseStudyAcf {
	client_name?: string;
	client_industry?: string;
	company_size?: string;
	subtitle?: string;
	challenge?: string;
	solution?: string;
	/** 「指標 | 数値 | 補足」を 1 行ずつ書く textarea。表示時に parseOutcomes() を使う */
	outcomes?: string;
	testimonial_body?: string;
	testimonial_author?: string;
	project_period?: string;
	/** 関連サービス（CPT: service）の投稿ID 配列。getServicesByIds() で実体に解決 */
	related_services?: number[] | false;
}

/** 導入事例: 成果（パース後の1項目） */
export interface CaseStudyOutcome {
	label: string;
	value: string;
	note?: string;
}

// =============================================================================
// エンティティ型 (カスタム投稿タイプ)
// =============================================================================

/** 全 CPT 共通のベースフィールド */
export interface WPEntityBase {
	id: number;
	slug: string;
	date: string;
	modified?: string;
	status?: WPPostStatus;
	title: WPRendered;
	content: WPRendered;
	_embedded?: WPEmbedded;
}

/** 通常記事 (post) */
export interface WPPost extends WPEntityBase {
	excerpt: WPRendered;
	acf?: PostAcf;
}

/** サービス (CPT: service) */
export interface WPService extends WPEntityBase {
	acf?: ServiceAcf;
}

/** 採用情報 (CPT: career) */
export interface WPCareer extends WPEntityBase {
	acf?: CareerAcf;
}

/** 特集 (CPT: feature) */
export interface WPFeature extends WPEntityBase {
	acf?: FeatureAcf;
}

/** 著者プロフィール (CPT: author_profile) */
export interface WPAuthorProfile extends WPEntityBase {
	acf?: AuthorProfileAcf;
}

/** 導入事例 (CPT: case_study) */
export interface WPCaseStudy extends WPEntityBase {
	acf?: CaseStudyAcf;
}

/** CPT エンティティのユニオン (汎用処理で使う) */
export type WPEntity =
	| WPPost
	| WPService
	| WPCareer
	| WPFeature
	| WPAuthorProfile
	| WPCaseStudy;

// =============================================================================
// Next.js App Router ルート型
//
// Next.js 15+ では params / searchParams が Promise になっている点に注意。
// =============================================================================

/** 動的ルート [slug] の page.tsx が受け取る props 型 */
export interface SlugPageProps {
	params: Promise<{ slug: string }>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/** generateStaticParams が返す要素の型 */
export interface SlugParam {
	slug: string;
}
