// src/components/InstallGuideModal.tsx
// ホシドタロ — 플랫폼별 설치 안내 모달 (iOS / 데스크톱 / 기타 공용)
// Android는 네이티브 팝업이 있어서 이 모달이 필요 없고,
// iOS·데스크톱처럼 수동 설치가 필요한 환경에서만 표시한다.
'use client';

import type { InstallPlatform } from '@/lib/useInstallApp';

type Props = {
  platform: InstallPlatform;
  onClose: () => void;
};

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#26284F] text-[12px] font-bold text-[#C9A227]">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function InstallGuideModal({ platform, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-3 pb-3 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A] p-5"
      >
        <p className="text-center text-[15px] font-semibold text-[#F6F1E4]">
          ホーム画面に追加する方法
        </p>

        {platform === 'ios' ? (
          <ol className="mt-4 space-y-3 text-[13px] text-[#B8B4D9]">
            <Step n={1}>
              Safariの下部にある共有アイコン <span className="text-[#F6F1E4]">⬆️</span> をタップ
            </Step>
            <Step n={2}>
              メニューから <span className="text-[#F6F1E4]">「ホーム画面に追加」</span> を選択
            </Step>
            <Step n={3}>
              右上の <span className="text-[#F6F1E4]">「追加」</span> をタップして完了
            </Step>
          </ol>
        ) : (
          <ol className="mt-4 space-y-3 text-[13px] text-[#B8B4D9]">
            <Step n={1}>
              ブラウザのアドレスバー右側にあるインストールアイコン{' '}
              <span className="text-[#F6F1E4]">⊕</span> をクリック
            </Step>
            <Step n={2}>
              アイコンが見当たらない場合は、メニュー（⋮）から{' '}
              <span className="text-[#F6F1E4]">「アプリをインストール」</span> を選択
            </Step>
            <Step n={3}>
              確認ダイアログで <span className="text-[#F6F1E4]">「インストール」</span> をクリック
            </Step>
          </ol>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#C9A227] py-2.5 text-[13px] font-semibold text-[#14152B]"
        >
          わかりました
        </button>
      </div>
    </div>
  );
}
