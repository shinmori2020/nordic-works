/**
 * 資料請求の申込者宛 自動返信メール。
 *
 * 実際のPDFは添付せず、「2〜3営業日以内に担当者からお送りします」と案内する。
 * これにより、リード獲得経路を維持しつつ実運用に近い形に揃える。
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
	name: string;
	whitepaperTitle: string;
}

export function WhitepaperDeliveryEmail({ name, whitepaperTitle }: Props) {
	return (
		<Html>
			<Head />
			<Preview>{`資料請求を受け付けました: ${whitepaperTitle}`}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>資料請求ありがとうございます</Heading>

					<Text style={paragraph}>{name} 様</Text>

					<Text style={paragraph}>
						このたびは Nordic Works の資料請求をいただき、ありがとうございます。
						以下の資料をご請求いただきました。
					</Text>

					<Text style={highlight}>{whitepaperTitle}</Text>

					<Text style={paragraph}>
						担当者より2〜3営業日以内に、ご記入いただいたメールアドレス宛に
						PDFをお送りします。今しばらくお待ちください。
					</Text>

					<Hr style={hr} />

					<Text style={paragraph}>
						資料に関するご質問、または導入についてのご相談がございましたら、
						このメールへ直接ご返信いただくか、サイトのお問い合わせフォームから
						ご連絡ください。
					</Text>

					<Hr style={hr} />

					<Text style={footer}>Nordic Works — 北欧式の働き方・組織設計支援</Text>
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
const paragraph: React.CSSProperties = {
	color: '#27272a',
	fontSize: 14,
	lineHeight: 1.7,
	margin: '16px 0',
};
const highlight: React.CSSProperties = {
	color: '#18181b',
	fontSize: 16,
	fontWeight: 600,
	margin: '8px 0',
	padding: '12px',
	backgroundColor: '#f4f4f5',
	borderRadius: 4,
};
const hr: React.CSSProperties = { borderColor: '#e4e4e7', margin: '20px 0' };
const footer: React.CSSProperties = {
	color: '#a1a1aa',
	fontSize: 11,
	marginTop: 16,
};
