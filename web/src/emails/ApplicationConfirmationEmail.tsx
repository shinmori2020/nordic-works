/**
 * 採用応募の応募者宛 自動返信メール。
 *
 * 受領確認 + 次のステップ（5営業日以内に選考結果連絡）を案内する。
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
	careerTitle: string;
}

export function ApplicationConfirmationEmail({ name, careerTitle }: Props) {
	return (
		<Html>
			<Head />
			<Preview>{`応募を受け付けました: ${careerTitle}`}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>応募ありがとうございます</Heading>

					<Text style={paragraph}>{name} 様</Text>

					<Text style={paragraph}>
						このたびは Nordic Works の以下のポジションにご応募いただき、
						ありがとうございます。
					</Text>

					<Text style={highlight}>{careerTitle}</Text>

					<Text style={paragraph}>
						応募内容は人事担当が確認いたします。書類選考の結果は、
						5営業日以内にこのメールアドレス宛にご連絡します。
					</Text>

					<Hr style={hr} />

					<Heading as="h2" style={h2}>
						今後の流れ
					</Heading>
					<Text style={paragraph}>
						1. 書類選考（受付から5営業日以内）<br />
						2. カジュアル面談（30分・オンライン）<br />
						3. 一次面接（現場マネージャー）<br />
						4. 最終面接（経営層）<br />
						5. オファー
					</Text>

					<Hr style={hr} />

					<Text style={paragraph}>
						ご質問やご相談は、このメールへ直接ご返信ください。
					</Text>

					<Text style={footer}>Nordic Works — 採用担当</Text>
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
