// src/app/faq/page.tsx
// よくある質問 — サービス理解を助け、AdSense審査でも「利用者のためのサイト」という
// 信号になるページ。FAQPage構造化データも付与。

import Link from 'next/link';

export const metadata = {
  title: 'よくある質問',
  description: 'ホシドタロの使い方、無料範囲、占いの当たり方についてよくある質問にお答えします。',
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'この占いは当たりますか？',
    a: 'ホシドタロは星座・タロット・血液型といった伝統的な占いの考え方をもとに、楽しみながら今日一日のヒントを得ていただくエンターテインメントサービスです。結果は医学的・科学的な根拠に基づくものではなく、当たり外れを保証するものではありません。気分転換や行動の後押しとして気軽にお楽しみください。',
  },
  {
    q: '毎日結果は変わりますか？',
    a: 'はい。星座・血液型の解釈は日付をもとに毎日切り替わり、タロットは占うたびにシャッフルして新しいカードを引きます。「今日の運勢」の総合的な結論部分もAIがその日の組み合わせに合わせて生成しているため、同じ日でも占う内容（テーマや質問）が違えば結果も変わります。',
  },
  {
    q: '無料で何回使えますか？',
    a: '「今日の運勢」「する・しない」はそれぞれ1日1回まで無料でご利用いただけます。同じ日に2回目以降をご覧になる場合は、短い広告を表示したのちに結果をご覧いただく仕組みになっています。日付が変わる（日本時間の0時）と、また1回無料でご利用いただけます。',
  },
  {
    q: '生年月日や血液型などの情報は保存されますか？',
    a: 'いいえ。入力いただいた星座・血液型・性別などの情報は、その場で占い結果を計算するためだけに使用し、サーバーに保存することはありません。詳しくはプライバシーポリシーをご覧ください。',
  },
  {
    q: '「する・しない」はどういう占いですか？',
    a: 'イエス・ノーで迷っている質問に対し、タロットカードを1枚引いて「する」寄りか「しない」寄りかの方向性をお示しする占いです。重要な決断そのものを代行するものではなく、最後の一押しやもうひとつの視点として活用いただくためのものです。',
  },
  {
    q: 'タロットカードの意味を詳しく知りたいです。',
    a: '当サイトの占いガイドに、タロットの基本や78枚全カードの正位置・逆位置の意味をまとめた記事があります。占う前後にぜひ読んでみてください。',
  },
  {
    q: '結果をSNSでシェアできますか？',
    a: 'はい。結果画面にLINE・X（旧Twitter）・Threads・リンクコピー、そしてスマートフォンでは標準の共有機能（インスタグラムやLINEを含む、お使いの端末にインストールされたアプリへの共有）をご用意しています。',
  },
  {
    q: '不具合の報告や要望はどこに送ればいいですか？',
    a: 'お問い合わせページのメールアドレス宛にご連絡ください。内容を確認のうえ、可能な範囲で改善に努めます。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-slate-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="mb-2 text-sm tracking-widest text-indigo-300">FAQ</p>
      <h1 className="mb-3 text-2xl font-bold text-white font-mincho">よくある質問</h1>
      <p className="mb-10 text-[15px] leading-relaxed text-slate-300">
        ホシドタロの使い方や占いの考え方について、よくいただくご質問にお答えします。
      </p>

      <div className="space-y-4">
        {FAQS.map((f, i) => (
          <details
            key={i}
            className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 open:bg-white/[0.05]"
          >
            <summary className="cursor-pointer list-none text-[15px] font-semibold text-white">
              <span className="mr-2 text-indigo-300">Q.</span>
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              <span className="mr-2 text-slate-500">A.</span>
              {f.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-sm">
        <Link href="/guide" className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:border-indigo-400/50">
          占いガイドを見る
        </Link>
        <Link href="/flow?mode=fortune" className="rounded-lg bg-[#C9A227] px-4 py-2 font-medium text-[#14152B]">
          今日の運勢を占う →
        </Link>
      </div>
    </main>
  );
}
