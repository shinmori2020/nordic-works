/**
 * お問い合わせ「送信者宛 自動返信」メールテンプレート。
 *
 * フォーム送信者に「受け付けました」を伝える。
 * 本人が入力した内容も再掲しておくと安心感がある。
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
	message: string;
}

export function ContactAutoReplyEmail({ name, message }: Props) {
	return (
		<Html>
			<Head />
			<Preview>お問い合わせを受け付けました — Nordic Works</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>お問い合わせを受け付けました</Heading>
					<Text style={text}>
						{name} 様
						<br />
						<br />
						この度は Nordic Works へお問い合わせいただきありがとうございます。
						<br />
						下記の内容で受け付けました。通常2〜3営業日以内に担当者よりご返信いたします。
					</Text>

					<Hr style={hr} />

					<Heading as="h2" style={h2}>
						お問い合わせ内容
					</Heading>
					<Text style={messageStyle}>{message}</Text>

					<Hr style={hr} />

					<Text style={footer}>
						このメールは Nordic Works のお問い合わせフォームから自動送信されました。
						<br />
						本メールに心当たりがない場合は破棄してください。
					</Text>
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
const h2: React.CSSProperties = { color: '#18181b', fontSize: 16, marginTop: 16 };
const text: React.CSSProperties = {
	color: '#27272a',
	fontSize: 14,
	lineHeight: 1.8,
	margin: '16px 0 0 0',
};
const messageStyle: React.CSSProperties = {
	color: '#27272a',
	fontSize: 14,
	lineHeight: 1.7,
	whiteSpace: 'pre-wrap',
};
const hr: React.CSSProperties = { borderColor: '#e4e4e7', margin: '20px 0' };
const footer: React.CSSProperties = { color: '#71717a', fontSize: 12, marginTop: 16 };
