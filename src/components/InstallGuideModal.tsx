// src/components/InstallGuideModal.tsx
// ホシドタロ — 브라우저별 설치 안내 모달 (일본 시장 대응)
//
// beforeinstallprompt가 안 잡히는 모든 환경을 브라우저별 맞춤 단계로 커버:
// - Samsung Internet: 주소창 설치 아이콘 or 메뉴 → ページを追加 → ホーム画面
// - Firefox (Android): 메뉴(⋮) → アプリをインストール
// - LINE 등 인앱 브라우저: 설치 자체가 불가 → 외부 브라우저로 열도록 유도
// - iOS Safari: 共有 → ホーム画面に追加
// - iOS 타사 브라우저(Chrome 등): 共有 → ホーム画面に追加 / 안 보이면 Safari로
// - 데스크톱: 주소창 설치 아이콘
'use client';

import type { InstallBrowser } from '@/lib/useInstallApp';

type Props = {
  browser: InstallBrowser;
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

const Hi = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#F6F1E4]">{children}</span>
);

function getGuide(browser: InstallBrowser): { title: string; steps: React.ReactNode[] } {
  switch (browser) {
    case 'samsung':
      return {
        title: 'ホーム画面に追加する方法（Samsung Internet）',
        steps: [
          <>アドレスバー右側のインストールアイコン <Hi>⬇</Hi>（端末に矢印のマーク）をタップ</>,
          <>アイコンがない場合は、下部メニュー <Hi>≡</Hi> → <Hi>「ページを追加」</Hi>（または「現在のページを追加」）→ <Hi>「ホーム画面」</Hi> を選択</>,
          <>確認画面で <Hi>「追加」</Hi> をタップして完了</>,
        ],
      };
    case 'firefox-android':
      return {
        title: 'ホーム画面に追加する方法（Firefox）',
        steps: [
          <>右上（または右下）のメニュー <Hi>⋮</Hi> をタップ</>,
          <><Hi>「アプリをインストール」</Hi>（または「ホーム画面に追加」）を選択</>,
          <>確認画面で <Hi>「追加」</Hi> をタップして完了</>,
        ],
      };
    case 'inapp':
      return {
        title: 'ブラウザで開いてから追加してください',
        steps: [
          <>今開いているアプリ内ブラウザでは、ホーム画面への追加ができません</>,
          <>画面の <Hi>「⋯」</Hi> または共有アイコンから <Hi>「他のアプリで開く」「ブラウザで開く」</Hi> を選択（Chrome / Safari 推奨）</>,
          <>開き直したページで、もう一度 <Hi>「ホーム画面に追加」</Hi> ボタンをタップ</>,
        ],
      };
    case 'ios-safari':
      return {
        title: 'ホーム画面に追加する方法',
        steps: [
          <>Safariの下部にある共有アイコン <Hi>⬆️</Hi> をタップ</>,
          <>メニューから <Hi>「ホーム画面に追加」</Hi> を選択</>,
          <>右上の <Hi>「追加」</Hi> をタップして完了</>,
        ],
      };
    case 'ios-other':
      return {
        title: 'ホーム画面に追加する方法',
        steps: [
          <>共有アイコン <Hi>⬆️</Hi>（またはメニュー）をタップ</>,
          <><Hi>「ホーム画面に追加」</Hi> を選択（見当たらない場合は、このページを <Hi>Safari</Hi> で開いてからお試しください）</>,
          <><Hi>「追加」</Hi> をタップして完了</>,
        ],
      };
    case 'desktop':
      return {
        title: 'アプリとしてインストールする方法',
        steps: [
          <>ブラウザのアドレスバー右側にあるインストールアイコン <Hi>⊕</Hi> をクリック</>,
          <>アイコンが見当たらない場合は、メニュー（⋮）から <Hi>「アプリをインストール」</Hi> を選択</>,
          <>確認ダイアログで <Hi>「インストール」</Hi> をクリック</>,
        ],
      };
    default:
      // chrome-android(프롬프트 실패 시) · android-other · other
      return {
        title: 'ホーム画面に追加する方法',
        steps: [
          <>ブラウザのメニュー <Hi>⋮</Hi>（または ≡）をタップ</>,
          <><Hi>「アプリをインストール」</Hi> または <Hi>「ホーム画面に追加」</Hi> を選択</>,
          <>確認画面で <Hi>「追加」</Hi>（インストール）をタップして完了</>,
        ],
      };
  }
}

export default function InstallGuideModal({ browser, onClose }: Props) {
  const guide = getGuide(browser);

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
        <p className="text-center text-[15px] font-semibold text-[#F6F1E4]">{guide.title}</p>

        <ol className="mt-4 space-y-3 text-[13px] text-[#B8B4D9]">
          {guide.steps.map((s, i) => (
            <Step key={i} n={i + 1}>
              {s}
            </Step>
          ))}
        </ol>

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
