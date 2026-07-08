// src/app/legal/disclaimer/page.tsx
// 免責事項（エンターテインメント目的の明示）

export const metadata = {
  title: '免責事項 | Oracle V',
  description: 'Oracle V の占い結果の位置づけおよび免責事項について。',
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-slate-200">
      <h1 className="mb-2 text-2xl font-bold text-white">免責事項</h1>
      <p className="mb-8 text-sm text-slate-400">最終更新日：2026年7月7日</p>

      <section className="space-y-6 text-[15px] leading-relaxed">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">占い結果の位置づけ</h2>
          <p>
            当サービス（Oracle V）が提供する星座占い・タロット・血液型などの結果は、
            すべて<strong className="text-white">エンターテインメントを目的</strong>としたものです。
            科学的・医学的な根拠を保証するものではありません。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">専門的助言ではありません</h2>
          <p>
            占い結果は、医療・法律・財務・投資・恋愛その他いかなる分野においても、
            専門家による助言に代わるものではありません。
            重要な意思決定は、必ず有資格の専門家にご相談のうえ、ご自身の責任で行ってください。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">損害の免責</h2>
          <p>
            当サービスの利用によって生じたいかなる損害についても、
            運営者は責任を負いかねます。あらかじめご了承ください。
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">外部リンク</h2>
          <p>
            当サービスから外部サイトへのリンクが含まれる場合がありますが、
            リンク先の内容について運営者は責任を負いません。
          </p>
        </div>
      </section>
    </main>
  );
}
