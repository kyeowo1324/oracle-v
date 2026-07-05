# Oracle V — Stage 2 パッケージ（広告・法務・SEO・PWA）

Stage 1 の完走確認前でも、ここにあるファイルは**先に入れておいて損がない**ものだけです。
AdSense は「承認後に env を入れるだけで광고が点く」構造にしてあります。

---

## 📁 ファイルの置き場所

| このzip内 | プロジェクト内の配置先 |
|---|---|
| `AdBanner.tsx` | `src/components/AdBanner.tsx` |
| `AdSenseScript.tsx` | `src/components/AdSenseScript.tsx` |
| `legal/privacy/page.tsx` | `src/app/legal/privacy/page.tsx` |
| `legal/disclaimer/page.tsx` | `src/app/legal/disclaimer/page.tsx` |
| `legal/contact/page.tsx` | `src/app/legal/contact/page.tsx` |
| `guide/page.tsx` | `src/app/guide/page.tsx` |
| `guide/astrology-basics/page.tsx` | `src/app/guide/astrology-basics/page.tsx` |
| `layout.tsx` | `src/app/layout.tsx`（既存を置き換え。※下の注意） |
| `sitemap.ts` | `src/app/sitemap.ts` |
| `robots.ts` | `src/app/robots.ts` |
| `public/manifest.json` | `public/manifest.json` |

> **layout.tsx の注意**: 既に自作の layout.tsx がある場合は、丸ごと上書きせず
> `metadata` / `viewport` / `<AdSenseScript />` の3点だけを移植してください。
> `globals.css` の import パスや Provider があなたの構成と違う可能性があります。

---

## 🔑 .env に追加（承認後でOK）

```bash
# 本番ドメイン（OG画像・sitemap の絶対URL用）— 早めに入れてよい
NEXT_PUBLIC_SITE_URL=https://あなたのドメイン

# AdSense クライアントID — ★審査通過後★ に入れる。空の間は広告が一切出ない（正常）
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
```

`NEXT_PUBLIC_ADSENSE_CLIENT` が空の間：
- 開発中は「広告スペース（審査通過後に表示）」の点線枠が出る
- 本番では何も表示されない
- **承認後に値を入れるだけで全ての `<AdBanner>` が一斉に点灯**

---

## ✅ あなたが手を動かす順番（現実の作業）

### 1. 差し替え（審査で自動落ちを防ぐ必須項目）
- [ ] `legal/contact/page.tsx` の `OPERATOR` と `EMAIL` を**実在の情報**に
- [ ] `legal/privacy` `legal/disclaimer` の日付 `[　]` を埋める
- [ ] `layout.tsx` / env の `NEXT_PUBLIC_SITE_URL` を本番ドメインに

### 2. コンテンツを増やす（審査の本丸）
- [ ] `guide/astrology-basics` を**一度読んで、自分の言葉・体験を1〜2段落追加**
- [ ] `guide/page.tsx` の記事リストのうち、書き終えたものを `published: true` に
- [ ] 目標：**独自性のある記事を10〜15本**（各1,500〜2,000字以上）

> ⚠️ 重要：AI が丸のまま出した文章は審査で不利。必ず人の手で編集・加筆を。
> サンプル記事はそのための「土台」であって「完成品」ではありません。

### 3. 広告を差し込む場所（承認後に点灯）
`<AdBanner slot="スロットID" />` を置くのに向いている場所：
- [ ] 結果ページ**下部**（最も自然・高収益）
- [ ] シャッフル/計算の**ローディング画面**（コンテンツと十分離す）
- [ ] ガイド記事の**本文中盤**（サンプルに設置済み）

避ける場所：ヘッダー直下の一等地、ボタンの真横、コンテンツの無いローディング単独画面。

### 4. AdSense 審査を出す
- [ ] Vercel にカスタムドメインを接続（`.vercel.app` より自ドメインが有利）
- [ ] `/legal/privacy` `/legal/disclaimer` `/legal/contact` `/guide` が表示されるか確認
- [ ] AdSense に登録 → サイト追加 → 審査申請（数日〜数週間）

### 5. 承認されたら
- [ ] env に `NEXT_PUBLIC_ADSENSE_CLIENT` を入れて再デプロイ
- [ ] 各広告単位のスロットIDを `<AdBanner slot="..." />` に反映

---

## ⚠️ 商用化タイミングの注意（Runbook 2.5）

広告を載せた時点で**商用サービス**になります。Vercel Hobby プランは非商用向けのため、
このタイミングで **Vercel Pro への転換**、または cron 等の外部化を検討してください。

---

## モデル名について（再掲）

開発原則ドキュメントの `claude-3-5-haiku` / `claude-3-5-sonnet` は旧表記です。
コードは正式な最新ID **`claude-haiku-4-5-20251001`**（基本）/ **`claude-sonnet-4-6`**（複雑推論）を使用します。
Stage 2 のこのパッケージには Claude 呼び出しは含まれません（広告・法務・SEO・PWA のみ）。
