'use client';

import { useState } from 'react';

const WORKFLOWS = [
  {
    name: 'Goal Decomposition',
    trigger: 'Webhook (goal-created)',
    description:
      'When a new goal is created, n8n calls the LLM to decompose it into 3-6 objectives, then creates daily tasks for each objective.',
    nodes: [
      'Webhook Trigger → AI (LLM Decompose) → HTTP: bulkCreateObjectives → HTTP: bulkCreateTasks',
    ],
    envVars: ['GOAL_SERVICE_GRAPHQL_URL', 'N8N_SERVICE_KEY'],
  },
  {
    name: 'Daily Task Dispatcher',
    trigger: 'Cron (every 15 min)',
    description:
      "Fetches SCHEDULED tasks due in the next window and sends each to the user's Telegram chat.",
    nodes: [
      'Cron → HTTP: getTasksDueNow → Loop → Telegram: sendMessage → HTTP: recordTaskSent',
    ],
    envVars: ['GOAL_SERVICE_GRAPHQL_URL', 'N8N_SERVICE_KEY', 'TELEGRAM_BOT_TOKEN'],
  },
  {
    name: 'Submission Receiver + AI Evaluation',
    trigger: 'Telegram Trigger (new message)',
    description:
      "Receives the user's reply, records the submission, asks the LLM to evaluate against the task's acceptance criteria, records the evaluation, and sends feedback.",
    nodes: [
      'Telegram Trigger → HTTP: getActiveTaskForChat → HTTP: recordSubmission → AI (Evaluate) → HTTP: recordEvaluation → Telegram: sendMessage (feedback)',
    ],
    envVars: [
      'GOAL_SERVICE_GRAPHQL_URL',
      'N8N_SERVICE_KEY',
      'TELEGRAM_BOT_TOKEN',
      'OPENAI_API_KEY',
    ],
  },
  {
    name: 'Missed Task Reminder (optional)',
    trigger: 'Cron (end of day)',
    description:
      'Marks tasks that were SENT but never submitted as MISSED and sends a reminder.',
    nodes: [
      'Cron → HTTP: getTasksDueNow → Filter (SENT, no submission) → HTTP: markTaskMissed → Telegram: sendMessage',
    ],
    envVars: [
      'GOAL_SERVICE_GRAPHQL_URL',
      'N8N_SERVICE_KEY',
      'TELEGRAM_BOT_TOKEN',
    ],
  },
];

const CREDENTIAL_TYPES = [
  {
    name: 'Telegram API',
    value: 'Telegram Bot Token',
    description: 'From BotFather (/newbot)',
  },
  {
    name: 'HTTP Header Auth',
    value: 'X-Service-Key',
    description: 'Same as N8N_SERVICE_KEY',
  },
  {
    name: 'OpenAI',
    value: 'OpenAI API Key',
    description: 'For decompose + evaluate nodes',
  },
  {
    name: 'Anthropic',
    value: 'Anthropic API Key',
    description: 'Alternative to OpenAI',
  },
];

export default function N8nSetupPage() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'credentials' | 'env'>(
    'workflows',
  );

  return (
    <div className="relative flex flex-col bg-grid">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb--violet" aria-hidden="true" />
      <div className="glow-orb glow-orb--pink" aria-hidden="true" />

      {/* Header */}
      <header className="page-header max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="link-btn"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </a>
          <span className="page-title">n8n Setup Guide</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto max-w-4xl w-full p-6 space-y-6">
        {/* ngrok tunnel */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-sm font-semibold text-zinc-200">
              ngrok Tunnel (for Telegram webhooks)
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-3">
            n8n needs a public HTTPS URL for Telegram webhooks. Run ngrok to expose
            your local n8n instance:
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-zinc-800/60 border border-zinc-700/40 px-3 py-2">
            <span className="text-[11px] font-medium text-zinc-500">$</span>
            <code className="text-xs font-mono text-zinc-300">npx ngrok http 5678</code>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Copy the HTTPS URL and use it as your{' '}
            <code className="font-mono text-xs bg-zinc-800/60 px-1 rounded text-zinc-400">GOAL_SERVICE_GRAPHQL_URL</code>
            {' '}in n8n.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-zinc-800/40 p-1 border border-zinc-800/60">
          {(['workflows', 'credentials', 'env'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === tab
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'workflows' && 'Workflows'}
              {tab === 'credentials' && 'Credentials'}
              {tab === 'env' && 'Environment'}
            </button>
          ))}
        </div>

        {/* Workflows tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-3">
            {WORKFLOWS.map((wf) => (
              <div key={wf.name} className="glass-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {wf.name}
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {wf.trigger}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                  {wf.description}
                </p>
                <div className="mt-3 rounded-lg bg-zinc-800/60 border border-zinc-800/60 p-3">
                  <p className="text-[11px] font-medium text-zinc-500 mb-1">Flow</p>
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                    {wf.nodes.join(' ')}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {wf.envVars.map((v) => (
                    <span key={v} className="n8n-badge">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Credentials tab */}
        {activeTab === 'credentials' && (
          <div className="space-y-3">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Credentials in n8n</h3>
              <p className="text-xs text-zinc-500">
                Add these in n8n → Credentials:
              </p>
              <div className="mt-4 space-y-2">
                {CREDENTIAL_TYPES.map((cred) => (
                  <div
                    key={cred.name}
                    className="rounded-lg border border-zinc-800/60 bg-zinc-800/40 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-200">
                        {cred.name}
                      </span>
                      <code className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                        {cred.value}
                      </code>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">{cred.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Environment tab */}
        {activeTab === 'env' && (
          <div className="space-y-3">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                n8n Instance Environment Variables
              </h3>
              <p className="text-xs text-zinc-500">
                Set these in n8n → Settings → Environment Variables:
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { key: 'TELEGRAM_BOT_TOKEN', desc: 'From BotFather' },
                  {
                    key: 'GOAL_SERVICE_GRAPHQL_URL',
                    desc: 'https://your-worker.workers.dev/graphql',
                  },
                  { key: 'N8N_SERVICE_KEY', desc: 'Same value as Cloudflare secret' },
                  { key: 'OPENAI_API_KEY', desc: 'For decompose + evaluate' },
                  { key: 'ANTHROPIC_API_KEY', desc: 'Optional alternative' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-800/40 p-3"
                  >
                    <code className="shrink-0 mt-0.5 h-6 rounded border border-zinc-700/60 bg-zinc-900/60 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
                      {item.key}
                    </code>
                    <span className="text-[11px] text-zinc-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                Cloudflare Worker Secrets (production)
              </h3>
              <p className="text-xs text-zinc-500">
                Set these with Wrangler:
              </p>
              <div className="mt-3 rounded-lg bg-zinc-800/60 border border-zinc-800/60 p-3">
                <p className="text-[11px] font-medium text-zinc-500 mb-2">Commands</p>
                <div className="space-y-1.5 font-mono text-xs">
                  {[
                    'wrangler secret put N8N_SERVICE_KEY',
                    'wrangler secret put CLERK_SECRET_KEY',
                    'wrangler secret put CLERK_WEBHOOK_SIGNING_SECRET',
                  ].map((cmd) => (
                    <div key={cmd} className="flex items-center gap-2 text-zinc-300">
                      <span className="text-zinc-600">$</span>
                      <code>{cmd}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">After setup</h3>
          <ul className="space-y-2 text-xs text-zinc-500">
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Activate each workflow in n8n (toggle <strong className="text-zinc-300">Active</strong>)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>
                For the Telegram Trigger, n8n auto-registers the webhook URL when activated
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Test the decompose flow: create a goal via the dashboard and check the
                n8n execution log
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
