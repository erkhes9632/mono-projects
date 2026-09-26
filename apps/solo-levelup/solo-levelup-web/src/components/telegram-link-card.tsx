'use client';

import { useState } from 'react';

interface TelegramLinkCardProps {
  linkCode: string | null;
  telegramChatId: string | null;
  telegramUsername: string | null;
  onLink?: (chatId: string, username: string) => void;
  linking?: boolean;
}

export function TelegramLinkCard({
  linkCode,
  telegramChatId,
  telegramUsername,
  onLink,
  linking,
}: TelegramLinkCardProps) {
  const [copied, setCopied] = useState(false);

  // Already linked
  if (telegramChatId) {
    return (
      <div className="telegram-card telegram-card--connected">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L17.59 17 15 14.41 12.41 17 11 15.59 13.41 13 11 10.59 12.41 12 15 9.59 17.59 12 19 13.41 16.59 16 14.41 13.41 17 14.41z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-emerald-300">
              Telegram Connected
            </h3>
            <p className="text-xs text-emerald-400/60 mt-0.5 truncate">
              @{telegramUsername || telegramChatId}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400/50">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Tasks arriving on Telegram
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No link code yet
  if (!linkCode) {
    return (
      <div className="telegram-card telegram-card--disconnected">
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => {
              onLink?.('/start ' + linkCode, '@sololevelup');
            }}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-40"
            disabled={linking}
          >
            {linking ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Linking...
              </span>
            ) : (
              'Link Telegram'
            )}
          </button>
        </div>
      </div>
    );
  }
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => {
              onLink?.('/start ' + linkCode, '@sololevelup');
            }}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-40"
            disabled={linking}
          >
            {linking ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Linking...
              </span>
            ) : (
              'Link Telegram'
            )}
          </button>
        </div>
      </div>
    );
  }
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800/60 border border-zinc-700/40">
            <svg className="h-5 w-5 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L17.59 17 15 14.41 12.41 17 11 15.59 13.41 13 11 10.59 12.41 12 15 9.59 17.59 12 19 13.41 16.59 16 14.41 13.41 17 14.41z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-300">
              Link Your Telegram
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Open{' '}
              <span className="font-mono text-xs bg-zinc-800/60 px-1 rounded text-zinc-400">@SoloLevelUpBot</span>
              {' '}in Telegram and send{' '}
              <code className="font-mono text-xs bg-zinc-800/60 px-1 rounded text-zinc-400">/start</code>
              {' '}to get a link code.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Has link code — pending link
  const command = `/start ${linkCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="telegram-card telegram-card--pending">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
          <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L17.59 17 15 14.41 12.41 17 11 15.59 13.41 13 11 10.59 12.41 12 15 9.59 17.59 12 19 13.41 16.59 16 14.41 13.41 17 14.41z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-amber-300">
            Connect Telegram
          </h3>
          <p className="text-xs text-amber-400/60 mt-0.5">
            Copy the command and send it to the bot
          </p>
        </div>
      </div>

      {/* Command pill */}
      <div className="command-pill w-full">
        <span className="key">/</span>
        <span>start {linkCode}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleCopy}
          className={`copy-btn ${copied ? 'copied' : ''}`}
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Command
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleCopy}
          className={`copy-btn ${copied ? 'copied' : ''}${connecting ? ' opacity-50 cursor-not-allowed' : ''}`}
          disabled={connecting}
        >
          {connecting ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-zinc-500/30 border-t-zinc-500 animate-spin" />
              Linking...
            </>
          ) : copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy & Link
            </>
          )}
        </button>
      </div>

      {copied && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => {
              onLink?.('/start ' + linkCode, '@sololevelup');
            }}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-40"
            disabled={linking}
          >
            {linking ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Linking...
              </span>
            ) : (
              'Complete Link'
            )}
          </button>
        </div>
      )}

      <p className="mt-2 text-[11px] text-zinc-500">
        Send the command to the bot, then click Complete Link.
      </p>
    </div>
  );
}
