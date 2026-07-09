// src/app/about/page.tsx
// ホシドタロについて — 運営者の自己紹介・サービスの背景。
// ⚠️ 公開前に「サービスを作った理由」の段落をご自身の言葉で書き換えてください
//   （このページの信頼性・独自性がAdSense審査でも評価されます）。

import Link from 'next/link';

export const metadata = {
  title: 'ホシドタロについて',
  description: 'ホシドタロというサービスと、その背景にある想いについてご紹介します。',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-slate-200">
      <p className="mb-2 text-sm tracking-widest text-indigo-300">ABOUT</p>
      <h1 className="mb-8 text-2xl font-bold text-white font-mincho">ホシドタロについて</h1>

      <section className="space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-lg font-semibold text-white">このサービスについて</h2>
        <p>
          ホシドタロは、星座・タロット・血液型という3つの視点から「今日のあなた」を占う
          Webサービスです。難しい知識がなくても、数タップで気軽に占える体験を目指しています。
        </p>
        <p>
          「今日の運勢」は総合運・恋愛運・金運・仕事運・健康運・対人運の6テーマから選んで
          占うことができ、「する・しない」はイエス・ノーで迷う場面にタロット1枚で
          方向性のヒントをお届けします。
        </p>

        {/* ↓↓↓ 公開前に、あなた自身の言葉に差し替えてください ↓↓↓ */}
        <h2 className="text-lg font-semibold text-white">作った理由</h2>
        <p>
          占いは「当たる・当たらない」で判断するものではなく、忙しい毎日の中で
          少し立ち止まり、自分の気持ちや行動を見つめ直すきっかけになるものだと考えています。
          その体験を、思い立ったときにすぐ・気軽に試せる形にしたいという思いから、
          ホシドタロを一人で企画・開発しました。
        </p>
        <p>
          タロットの解釈や星座の運勢は、伝統的な意味づけを踏まえながら、
          現代の日本の読者にとって分かりやすく前向きな言葉になるよう心がけて作成しています。
        </p>
        {/* ↑↑↑ ここまで ↑↑↑ */}

        <h2 className="text-lg font-semibold text-white">大切にしていること</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-300">
          <li>結果は明るく前向きなトーンで — 不安を煽る表現は避けています</li>
          <li>入力情報は保存しない — 生年月日・血液型などはその場限りの計算にのみ使用</li>
          <li>エンターテインメント目的であることの明示 — 医学・法律・財務等の助言ではありません</li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-sm">
        <Link href="/legal/contact" className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:border-indigo-400/50">
          お問い合わせ
        </Link>
        <Link href="/faq" className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:border-indigo-400/50">
          よくある質問
        </Link>
        <Link href="/flow?mode=fortune" className="rounded-lg bg-[#C9A227] px-4 py-2 font-medium text-[#14152B]">
          今日の運勢を占う →
        </Link>
      </div>
    </main>
  );
}
