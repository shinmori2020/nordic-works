/**
 * ニュースレター購読者宛 ウェルカムメール。
 *
 * 登録の事実 + 次号配信タイミングを案内する。
 * 解除リンクは将来的に / unsubscribe?token=... のような形を想定するが、
 * 現状はお問い合わせフォーム経由のお願い記載のみ。
 */

import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Text,
} from '@react-email/components';

interface Props {
	email: string;
}

export function NewsletterWelcomeEmail({ email }: Props) {
	return (
		<Html>
			<Head />
			<Preview>Nordic Works ニュースレター登録ありがとうございます</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>登録ありがとうございます</Heading>

					<Text style={paragraph}>
						Nordic Works のニュースレター（{email}）にご登録いただき、
						ありがとうございます。
					</Text>

					<Text style={paragraph}>
						月2回、北欧式の働き方・組織設計に関する記事のハイライトと、
						公開直後の新着レポートを配信します。次号は次の第2金曜日に
						お届け予定です。
					</Text>

					<Hr style={hr} />

					<Heading as="h2" style={h2}>
						配信内容
					</Heading>
					<Text style={paragraph}>
						・編集部おすすめ記事 3〜5本<br />
						・新規ホワイトペーパーのお知らせ<br />
						・採用情報の更新トピックス<br />
						・読者から寄せられた質問への回答（不定期）
					</Text>

					<Hr style={hr} />

					<Text style={muted}>
						配信解除をご希望の場合は、本メールへの返信、または
						サイトのお問い合わせフォームよりご連絡ください。
					</Text>

					<Text style={footer}>Nordic Works — Editorial Team</Text>
				</Container>
			</Body>
		</Html>
	);
}

const body: React.CSSProperties = {
	backgroundColor: '#f4f4f5',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
	margin: 0,
	padding: '24px 0',
};
const container: React.CSSProperties = {
	backgroundColor: '#ffffff',
	maxWidth: 560,
	margin: '0 auto',
	padding: '32px',
	borderRadius: 8,
};
const h1: React.CSSProperties = { color: '#18181b', fontSize: 20, margin: 0 };
const h2: React.CSSProperties = { color: '#18181b', fontSize: 14, marginTop: 12 };
const paragraph: React.CSSProperties = {
	color: '#27272a',
	fontSize: 14,
	lineHeight: 1.7,
	margin: '16px 0',
};
const muted: React.CSSProperties = {
	color: '#71717a',
	fontSize: 12,
	lineHeight: 1.6,
	margin: '12px 0',
};
const hr: React.CSSProperties = { borderColor: '#e4e4e7', margin: '20px 0' };
const footer: React.CSSProperties = {
	color: '#a1a1aa',
	fontSize: 11,
	marginTop: 16,
};
