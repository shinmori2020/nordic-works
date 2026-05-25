# Week 5 フォローアップ — プレビュー機能の end-to-end 検証完了

**所属Week**: Week 5
**実施日**: 2026-05-23
**ステータス**: ✅ end-to-end 動作確認完了
**前提**: 前回コミット `03ad5cb` の Week 5 コード実装

---

## 目的

前回未解決だった「プレビュー cookie 付きで下書きを取得すると 404」問題を解決し、
下書きプレビュー機能を end-to-end で動作確認する。

---

## 結論

**Week 5 のコードは最初から正しく動いていた。** 前回「404 / 内容が表示されない」と
見えていたのは、検証用に PowerShell から作った下書きの**中身がエンコーディング問題で
文字化けしていた**ためで、コードのバグではなかった。

下書きを正しい UTF-8 で作り直して再検証 → 全項目パスで end-to-end 完成。

---

## デバッグ過程

### 1. 一時診断ログの追加

`fetchBySlug` に `console.log` を仕込み、サーバ側で何が起きているか可視化:

```ts
console.log(`[fetchBySlug] base=${restBase} slug=${slug} draft=${isDraft}`);
console.log(`[fetchBySlug] result count=${(data ?? []).length}`);
```

### 2. ログから判明したこと

```
[fetchBySlug] base=posts slug=preview-test-draft draft=true
[fetchBySlug] result count=1
```

- **draftMode はちゃんと検出されている**（`draft=true`）
- **下書きの取得も成功している**（`count=1`）

つまりサーバ側のロジックは完全に動いていた。

### 3. 真の原因 — 下書きデータの文字化け

WP REST から下書きの中身を取得して確認:

| 項目 | 値 |
|------|----|
| title.rendered の長さ | 15 文字 |
| title.rendered のバイト数 | **15 バイト** |

UTF-8 で日本語は 1文字 3 バイトなので、本来「【プレビューテスト】下書き記事」は
**45 バイト**になるはず。15 バイトということは、**中身が `?` の連続に化けていた**。

化けていた原因: 前回 PowerShell で下書きを POST 作成した際、
`Invoke-RestMethod -Body ($obj | ConvertTo-Json)` の経路で**ボディが UTF-8 で
送られていなかった**ため、WP 側で日本語が `?` に置換されて保存されていた。

ページは下書きを正しく取得していたが、取得した中身が「???...」だったので、
ブラウザ上でも空っぽに見えていた。**「ページが見つかりません」**の文字列が
HTML に含まれて見えたのは、`<title>??????????????? | Nordic Works</title>` の
近辺ではなく、Next.js が同梱する error/not-found ページのチャンクが
ドキュメントに混ざって見えただけ（実害なし）。

### 4. 修正: UTF-8 明示で下書きを作り直し

```powershell
$jsonStr = $bodyObj | ConvertTo-Json -Compress
$bytes   = [Text.Encoding]::UTF8.GetBytes($jsonStr)
Invoke-RestMethod ... -Body $bytes -ContentType "application/json; charset=utf-8"
```

`ConvertTo-Json` の出力をバイトに UTF-8 で変換してから渡す。
結果: タイトル 15 文字 / **45 バイト**（正しい UTF-8）。

### 5. 再検証

| 検証項目 | 結果 |
|---------|------|
| プレビューバナー表示 | ✅ |
| 下書きタイトル表示 | ✅ |
| 下書き本文表示 | ✅ |
| cookie 無し → 404（非公開） | ✅ |

---

## クリーンアップ

- `fetchBySlug` の一時 console.log を削除
- 検証用下書きを REST API から削除（下書き残存ゼロを確認）
- `tsc --noEmit` 通過確認

---

## 学び

### 1. PowerShell からの JSON POST に潜む UTF-8 罠

`Invoke-RestMethod -Body $obj`（ハッシュテーブル直渡し）や、
`ConvertTo-Json` の文字列をそのまま渡す経路では、日本語が ASCII に
ダウングレードされて送られることがある。**バイト変換と Content-Type 明示**が
確実な対処。

### 2. 「コードのバグ」と「テストデータの不備」を切り分ける重要性

サーバログで「draftMode=true / count=1」と出ていれば、コードは動いていて
データ側を疑うべきだった。ログを最初に仕込んでいれば、切り分けがもっと早かった。

### 3. プレビュー機能の本来の使い方

実運用では **WP 管理画面で記事を書いて → 「プレビュー」ボタンを押す**のが
正しいフローで、エディタが UTF-8 で保存するため文字化けは起きない。
今回は PowerShell から無理矢理 POST したことが文字化けの原因だった。

---

## Week 5 完了状況

| Task | 状態 |
|------|------|
| /api/preview ・ /api/exit-preview | ✅ |
| /api/revalidate | ✅ |
| fetchBySlug の draftMode 対応 | ✅ |
| PreviewBanner | ✅ |
| WP プラグインの preview_post_link + revalidate webhook | ✅ |
| **end-to-end 動作確認** | ✅ |

---

## 関連

- 前のタスク: `week-05-preview-revalidation.md`
- コミット: 本フォローアップで `fetchBySlug` の debug log を削除しただけ
