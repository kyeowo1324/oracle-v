// src/app/legal/contact/page.tsx
// お問い合わせ + 運営者情報

export const metadata = {
  title: 'お問い合わせ | ホシドタロ',
  description: 'ホシドタロ の運営者情報およびお問い合わせ窓口です。',
};

export default function ContactPage() {
  const OPERATOR = 'ホシドタロ';
  const EMAIL = 'hoshidotaro@gmail.com';

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-slate-200">
      <h1 className="mb-2 text-2xl font-bold text-white">お問い合わせ</h1>
      <p className="mb-8 text-sm text-slate-400">
        ご意見・ご要望・不具合のご報告はこちらから承ります。
      </p>

      <section className="mb-10 space-y-3 text-[15px] leading-relaxed">
        <h2 className="text-lg font-semibold text-white">運営者情報</h2>
        <dl className="space-y-1 text-slate-300">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-slate-400">運営者</dt>
            <dd>{OPERATOR}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-slate-400">サービス名</dt>
            <dd>ホシドタロ — 今日の運勢</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-slate-400">連絡先</dt>
            <dd>
              <a href={`mailto:${EMAIL}`} className="text-indigo-300 underline">
                {EMAIL}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3 text-[15px] leading-relaxed">
        <h2 className="text-lg font-semibold text-white">メールでのお問い合わせ</h2>
        <p className="text-slate-300">
          下記アドレス宛に、お名前・お問い合わせ内容を記載のうえご連絡ください。
          通常3〜5営業日以内に返信いたします。
        </p>
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent('ホシドタロ お問い合わせ')}`}
          className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          メールを作成する
        </a>
      </section>
    </main>
  );
}

