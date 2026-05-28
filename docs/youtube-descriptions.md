# YouTube 概要欄テンプレート

録画した動画を YouTube（**限定公開** unlisted 推奨）にアップする際の、概要欄（説明文）テンプレート。
そのままコピペできる形にしてあります。

---

## 🎬 動画 1: 下書きプレビュー機能

### タイトル候補
- `Nordic Works | 下書きプレビュー機能（Headless WordPress + Next.js 16）`
- `Headless WP draftMode デモ — Nordic Works ポートフォリオ`

### 概要欄（コピペ用）

```
このデモは、Headless WordPress 構成のポートフォリオサイト
「Nordic Works」の下書きプレビュー機能の動作確認です。

公開サイト → https://nordic-works.vercel.app
GitHub    → https://github.com/shinmori2020/nordic-works

WordPress 管理画面の「プレビュー」ボタンから、Next.js 側で
下書き記事を表示する一連の流れを実演しています。

▼ 実装のポイント
・WP 側: post_link / post_type_link フィルターで REST 上の
  link 自体を Next.js の /api/preview に書き換え
・Next.js 側: secret token 検証 → draftMode() 有効化 →
  認証付きで draft+publish を取得
・ブロックエディタの「プレビュー」ボタンも JS 経由で
  PHP フィルターを通らない問題に対応
・下書きで slug が空になる WP の挙動に
  wp_insert_post_data フィルター + /api/preview の
  id フォールバックで両面対応

▼ 技術スタック
Next.js 16 (App Router) / TypeScript / WordPress + ACF / Vercel

▼ チャプター
0:00 オープニング
0:10 公開URLで下書きが見えないことの確認
0:25 WP 管理画面で下書き作成
0:55 プレビューボタンで Next.js 側に遷移
1:15 設計のポイント解説（preview_post_link / draftMode）
1:45 プレビュー終了 → 通常モードに戻る
2:00 クロージング

#NextJS #WordPress #Headless #TypeScript #ポートフォリオ
```

---

## 🎬 動画 2: On-demand Revalidation

### タイトル候補
- `Nordic Works | On-demand Revalidation（WP 更新 → Next.js 即時反映）`
- `Headless WP の即時反映実装デモ — Nordic Works`

### 概要欄（コピペ用）

```
このデモは、Headless WordPress 構成のポートフォリオサイト
「Nordic Works」の On-demand Revalidation の動作確認です。

公開サイト → https://nordic-works.vercel.app
GitHub    → https://github.com/shinmori2020/nordic-works

WordPress で記事を更新した瞬間に、Next.js 側のキャッシュが
クリアされ、リロードで即時反映される動作を実演しています。

▼ 実装のポイント
・WP 側: save_post / transition_post_status フックから
  wp_remote_post で非同期 webhook（blocking=false）
・Next.js 側: /api/revalidate が secret token 検証後、
  投稿タイプに応じた revalidatePath + revalidateTag を実行
・Next.js 16 の revalidateTag シグネチャ変更
  （第2引数 'max' 必須化）に対応
・取得関数（getPostBySlug 等）に tags を付けて
  タグ単位の正確なパージを実現

▼ 技術スタック
Next.js 16 (App Router) / TypeScript / WordPress + ACF / Vercel

▼ チャプター
0:00 オープニング & 問題提起（時間ベース ISR の限界）
0:20 反映前の状態を見せる
0:40 WP 側でタイトル更新 → 即時反映確認
1:10 開発者ツールで webhook を確認
1:40 コード解説（WP プラグイン / Next.js API / 取得関数）
2:20 公開URLでは webhook が到達しない理由
2:40 クロージング

#NextJS #WordPress #ISR #Webhook #ポートフォリオ
```

---

## アップロード手順

### 1. YouTube Studio へ
<https://studio.youtube.com/> にログイン → 右上「作成」→「動画をアップロード」

### 2. ファイル選択 → 詳細入力
- **タイトル**: 上のテンプレートからコピペ
- **説明**: 上の「概要欄」をコピペ
- **サムネイル**: 自動生成のもので OK（こだわるなら Canva 等で 1280x720 を作る）

### 3. 視聴者設定
- 「いいえ、子ども向けではありません」を選択

### 4. 公開設定
- **「限定公開」（unlisted）** を選択 ✅
  - 検索結果には出ないが URL を知る人は視聴可能
  - ポートフォリオ用途として最も適切

### 5. アップロード完了後
- 動画 URL（`https://youtu.be/XXXXXXXXXXX` の `XXX...` 部分が動画 ID）をコピー
- README.md 内の `YOUR_VIDEO_ID_1` / `YOUR_VIDEO_ID_2` を実 ID に置換
- コミット → push → 完成 🎉

---

## チャプター（タイムスタンプ）について

YouTube の概要欄に `0:00 オープニング` のようにタイムスタンプ付き行を3つ以上書くと、
プレーヤーに「チャプター」として表示され、視聴体験が大きく向上します。

録画後の実際の長さに合わせて、上のテンプレートの数字を調整してください。

---

## 補足: サムネイル制作 Tips（任意）

凝らなくても OK ですが、もしサムネで差別化するなら:

- **無料ツール**: Canva（テンプレート豊富）/ Figma（フリープラン）
- **サイズ**: 1280 × 720（YouTube 推奨）
- **要素**:
  - 大きな日本語タイトル（2〜4行、ゴシック太字）
  - スクリーンショット 1〜2枚
  - 「DEMO」「Headless WP」などのバッジ風文字
- ダーク背景 + 白文字が視認性◎

ポートフォリオ用途なら**自動生成サムネで全く問題ありません**。中身が大事です。
