# Week 2 / Task 4 — ACFフィールドグループ設計・実装

**所属Week**: Week 2（WordPress側の作り込み）
**該当タスク番号**: `07-roadmap.md` の Task 4
**実施日**: 2026-05-14
**ステータス**: ✅ 完了
**前提**: Task 2-3 完了（CPT・タクソノミー登録済み）

---

## タスクの目的

`docs/04-wordpress.md` で設計された各CPTのACFフィールド定義（合計30フィールド）を、Git管理可能な形でWordPressに反映する。

具体的には:
- 5つのACFフィールドグループを作成（post / service / career / feature / author_profile 用）
- Repeater・post_object・relationship など複雑な型を含む構造を実装
- 各フィールドを REST API および GraphQL に公開
- 設定の保存先を**プラグイン内**に集約し、Headless運用と整合させる

---

## 完了基準

- [x] 5つのフィールドグループが ACF 管理画面に表示される
- [x] 各CPTの編集画面で対応するフィールドが入力可能
- [x] フィールド定義がJSON形式で `plugins/nordic-works-core/acf-json/` に保存される
- [x] GraphQL スキーマに各 `*Fields` が反映される（`postFields`, `serviceFields` 等）
- [x] 全フィールドの「ローカル JSON」が `保存しました` 状態になる

---

## 実装方針の判断

### 3つのアプローチから「JSON直接生成」を選択

ACF フィールドの管理方式には3つの選択肢があった:

| 方式 | 内容 | 採否 |
|---|---|---|
| A. GUI で設定（DB保存のみ） | ACF管理画面でポチポチ作成、保存先はDB | ❌ Git管理不可 |
| B. PHP コードで `acf_add_local_field_group()` | プラグインに登録コードを書く | △ フィールドキー管理が複雑 |
| C. ACF Local JSON（採用） | JSONファイルでフィールド定義を管理、ACFが自動読み込み | ⭕ |

C方式の中でも、さらに2つのパスがある:
- **C-1**: GUIで作成 → ACFが自動でJSONを書き出す
- **C-2**: 最初からJSONを直接書く → ACFの「同期」でDBへ反映

今回は **C-2（JSON直接生成）** を採用。理由:
- 5グループ・30フィールドを手作業でGUI入力すると数時間かかる
- 最終成果物（JSONファイル）は C-1 と完全に同じ
- 後から GUI で編集して JSON 上書きすることも可能（C-1 とのハイブリッド運用が可能）

### ACF Local JSON の保存先をプラグイン内に変更

ACFのデフォルト保存先は **「現在有効化されているテーマの `acf-json/` フォルダ」** 。しかしHeadless構成ではテーマがほぼ使われないため、テーマ依存の構成は不適切。

`acf/settings/save_json` / `acf/settings/load_json` の2つのフィルターで、保存先・読み込み元を **プラグイン内 `acf-json/` フォルダ** に変更した。

---

## 作業手順

### Step 1: フィルター関数を Nordic Works Core プラグインに追記

`nordic-works-core.php` に以下を追加:

```php
function nordic_acf_json_save_point( $path ) {
    return __DIR__ . '/acf-json';
}
add_filter( 'acf/settings/save_json', 'nordic_acf_json_save_point' );

function nordic_acf_json_load_point( $paths ) {
    $paths[] = __DIR__ . '/acf-json';
    return $paths;
}
add_filter( 'acf/settings/load_json', 'nordic_acf_json_load_point' );
```

### Step 2: 保存先フォルダの作成

```
plugins/nordic-works-core/acf-json/   ← 空フォルダで作成
```

### Step 3: 5つのフィールドグループJSONを直接生成

各ファイルは以下の構造で記述:

```json
{
  "key": "group_nordic_xxx",        // 一意のグループキー
  "title": "...フィールド",
  "fields": [
    {
      "key": "field_nordic_xxx_yyy", // 一意のフィールドキー
      "label": "ラベル",
      "name": "yyy",                 // ACF内部名（プログラマブルアクセスに使う）
      "type": "text|textarea|image|...",
      "show_in_graphql": 1,
      "graphql_field_name": "fieldName"
    }
  ],
  "location": [[{"param": "post_type", "operator": "==", "value": "xxx"}]],
  "show_in_rest": 1,
  "show_in_graphql": 1,
  "graphql_field_name": "xxxFields",
  "map_graphql_types_from_location_rules": 1,
  "modified": 1747200000
}
```

#### 5グループの内訳

| ファイル | 対象CPT | フィールド数 | 主要フィールド型 |
|---|---|---|---|
| `group_nordic_post.json` | post | 4 | post_object, number, text, relationship |
| `group_nordic_service.json` | service | 8 | text, image, repeater × 4, url |
| `group_nordic_career.json` | career | 7 | select, text, repeater × 3, url |
| `group_nordic_feature.json` | feature | 5 | image, textarea, relationship, date_picker × 2 |
| `group_nordic_author_profile.json` | author_profile | 6 | image, text, textarea, url × 3 |

#### Repeater フィールドの詳細

`service` 用は特に複雑で、4つの Repeater が含まれる:

- `features` — タイトル + 説明
- `pricing_plans` — プラン名 + 価格 + 含まれる機能
- `faq` — 質問 + 回答
- `case_study_links` — ラベル + URL

各 sub_field にも独立した `key` と `graphql_field_name` を指定する必要がある。

### Step 4: ACF管理画面でJSONを同期

1. WP Admin → ACF → フィールドグループ
2. 画面上部に「5個のフィールドグループが同期可能です」と表示
3. 「同期可能」リンクをクリック
4. 5つ全てにチェック → 一括操作「Sync changes」→ 適用
5. フィールドグループ一覧に5つが表示されることを確認

### Step 5: 動作確認 — 投稿編集画面

`サービス → 新規追加` を開き、タイトル欄の下に以下のフィールドが表示されることを確認:
- サブタイトル
- ヒーロー画像
- 機能リスト（リピーター）
- 料金プラン（リピーター）
- FAQ（リピーター）
- 導入事例リンク（リピーター）
- CTAボタンテキスト
- CTAリンク先

### Step 6: 動作確認 — GraphQL

`VerifyACF` クエリで各CPTのACFフィールドへのアクセスを確認:

```graphql
query VerifyACF {
  services { nodes { id title serviceFields { subtitle ctaText } } }
  careers { nodes { id title careerFields { location positionType } } }
  features { nodes { id title featureFields { leadText } } }
  authorProfiles { nodes { id title authorProfileFields { position bio } } }
  posts { nodes { id title postFields { readingTime } } }
}
```

全フィールドが `"nodes": []` または `"postFields": { "readingTime": null }` などスキーマ通りに返れば成功。

---

## 作成・変更ファイル

```
app/public/wp-content/plugins/nordic-works-core/
├ nordic-works-core.php          (フィルター関数2つ追記)
└ acf-json/                       (新規作成)
   ├ group_nordic_post.json       (新規作成)
   ├ group_nordic_service.json    (新規作成)
   ├ group_nordic_career.json     (新規作成)
   ├ group_nordic_feature.json    (新規作成)
   └ group_nordic_author_profile.json (新規作成)
```

合計 30フィールドを5ファイルで定義。

---

## 詰まったところ・気づき

### 「記事フィールド」の重複登録

ACFの同期操作後、フィールドグループ一覧に `記事フィールド (group_nordic_post)` が2行表示される現象。一覧カウントも「すべて (5)」ではなく「すべて (6)」になっていた。

**原因**: 同期操作中の何らかのタイミングで重複インポートされた。両方とも同じキー `group_nordic_post` を持っていた。

**対処**: 片方をゴミ箱へ移動 → 完全削除。残った1件のステータスが `保存待ち` になっていたため、編集画面を開いて「更新」ボタンで再保存し `保存しました` に修正。

**学び**: GUI操作とJSON同期の両方を行うワークフローでは、こうした重複が起こり得る。一覧画面の項目数を毎回確認する習慣をつける。

### GraphQL Introspection ブロック

最初に `__type(name: "Service") { fields { name } }` で検証しようとしたが、`"GraphQL introspection is not allowed for public requests by default."` エラー。

**原因**: WPGraphQL のセキュリティデフォルト設定。未認証クライアントが GraphQL スキーマ構造を覗き見ることを防ぐため、`__type` や `__schema` のintrospectionクエリがデフォルトで拒否される。

**対処**: introspection に頼らず、**実データクエリ** でスキーマ存在チェックを実現:
```graphql
query { services { nodes { serviceFields { subtitle } } } }
```
GraphQLは実行前にスキーマ検証するため、`serviceFields` が存在しなければ即エラーになる。逆に空配列が返るならスキーマ上は正しく登録されているということ。本番では introspection はブロックしたままで運用できる、より良い検証方法を発見。

### ACFが自動で書き戻すデフォルトプロパティ

JSONを手書きで生成した後、ACF GUI で同期 → 後でフィールドを少し編集 → 保存、を行うと、ACF が自動的に `aria-label`, `conditional_logic: false`, `wrapper: {width:"", class:"", id:""}`, `bidirectional_target: []` などのデフォルトプロパティを追加して書き戻す。

これは正常な挙動で、機能には影響しない。手書きJSON時には最小限のプロパティだけ書けばOK。

---

## 関連ドキュメント

- 仕様: `docs/04-wordpress.md` の ACFフィールド設計セクション
- 前のタスク: `week-02-task-2-3-cpt-taxonomy.md`
- 次のタスク: `week-02-task-5-content-seeder.md`
