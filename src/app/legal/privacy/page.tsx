// src/app/legal/privacy/page.tsx
// プライバシーポリシー（個人情報保護法 / APPI 準拠・AdSense Cookie 開示込み）
//
// ⚠️ [　] で囲んだ箇所は公開前に必ず実際の情報に差し替えてください。
//    運営者名・連絡先・ドメインが空欄のままだと AdSense 審査で不利になります。

export const metadata = {
  title: 'プライバシーポリシー | ホシドタロ',
  description: 'ホシドタロ における個人情報の取り扱い、Cookie・広告配信についての方針です。',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-slate-200">
      <h1 className="mb-2 text-2xl font-bold text-white">プライバシーポリシー</h1>
      <p className="mb-8 text-sm text-slate-400">最終更新日：2026年7月7日</p>

      <section className="space-y-6 text-[15px] leading-relaxed">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">1. 基本方針</h2>
          <p>
            ホシドタロ（以下「当サービス」）は、利用者の個人情報の重要性を認識し、
            個人情報の保護に関する法律（個人情報保護法）その他の関連法令を遵守し、
            適切に取り扱います。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">2. 取得する情報</h2>
          <p className="mb-2">当サービスは、占い結果の生成のために以下を取得する場合があります。</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>生年月日（星座の判定に使用）</li>
            <li>血液型・性別（任意。占い解釈の補助に使用）</li>
            <li>選択したタロットカードなどの入力内容</li>
            <li>アクセスログ、IPアドレス、Cookie、端末情報</li>
          </ul>
          <p className="mt-2 text-slate-300">
            これらの入力情報はアカウント登録なしで利用でき、個人を特定する目的では保存しません。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">3. 利用目的</h2>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>占い結果の生成・表示</li>
            <li>サービスの品質改善および不正利用の防止</li>
            <li>広告配信およびアクセス解析</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">4. 広告配信について</h2>
          <p className="mb-2">
            当サービスは第三者配信の広告サービス（Google AdSense）を利用する場合があります。
            広告配信事業者は、利用者の興味に応じた広告を表示するために Cookie を使用することがあります。
          </p>
          <p className="text-slate-300">
            Cookie を無効にする方法や、Google による広告の設定については、
            <a
              href="https://policies.google.com/technologies/ads?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-300 underline"
            >
              Google の広告ポリシー
            </a>
            をご確認ください。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">5. アクセス解析</h2>
          <p>
            当サービスはアクセス状況の把握のため解析ツールを利用する場合があります。
            これらは Cookie を使用しますが、個人を特定する情報は含みません。
            ブラウザの設定から Cookie を無効化することで収集を拒否できます。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">6. 第三者提供</h2>
          <p>
            法令に基づく場合を除き、取得した情報を本人の同意なく第三者に提供することはありません。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">7. 免責事項</h2>
          <p>
            当サービスが提供する占い結果はエンターテインメントを目的としたものであり、
            医学・法律・財務等の専門的助言に代わるものではありません。
            利用者ご自身の判断でご利用ください。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">8. お問い合わせ・改定</h2>
          <p>
            本ポリシーに関するお問い合わせは
            <a href="/legal/contact" className="text-indigo-300 underline">お問い合わせページ</a>
            よりご連絡ください。本ポリシーは必要に応じて改定され、改定後の内容は当ページに掲載した時点で効力を生じます。
          </p>
        </div>
      </section>
    </main>
  );
}
