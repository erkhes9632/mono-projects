'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useUser } from '@clerk/nextjs';
import { GET_USER, GET_TASKS, GET_MY_GOALS_FULL, LINK_TELEGRAM, GET_MY_GOALS } from '../../graphql/documents';
import { GoalList } from '../../components/goal-list';
import { CreateGoalModal } from '../../components/create-goal-modal';
import { TelegramLinkCard } from '../../components/telegram-link-card';

interface UserData {
  getUser: {
    id: string;
    userName: string | null;
    email: string | null;
    telegramChatId: string | null;
    telegramUsername: string | null;
    timezone: string;
    linkCode: string | null;
  } | null;
}

interface GoalData {
  getMyGoals: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    progressPercent: number;
    createdAt: string;
    updatedAt: string;
    objectives: {
      id: string;
      title: string;
      status: string;
      progressPercent: number;
      tasks: { id: string; status: string }[];
    }[];
  }[];
}

interface TaskData {
  getTasks: {
    id: string;
    objectiveId: string;
    title: string;
    description: string | null;
    acceptanceCriteria: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
  }[];
}

interface LinkTelegramData {
  linkTelegram: {
    id: string;
    telegramChatId: string | null;
    telegramUsername: string | null;
    linkCode: string | null;
  };
}

export default function DashboardPage() {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  const { data: userData, refetch: refetchUser } = useQuery<UserData>(
    GET_USER,
    {
      variables: { id: user?.id || '' },
      skip: !user?.id,
    },
  );

  const { data: goalData, refetch: refetchGoals } = useQuery<GoalData>(
    GET_MY_GOALS_FULL,
    { skip: !user?.id },
  );

  const today = new Date().toISOString().split('T')[0];
  const { data: taskData } = useQuery<TaskData>(GET_TASKS, {
    variables: { scheduledDate: today },
    skip: !user?.id,
  });

  const [linkTelegram, { loading: linking }] = useMutation<LinkTelegramData>(
    LINK_TELEGRAM,
    {
      refetchQueries: (
        user?.id
          ? [{ query: GET_USER, variables: { id: user?.id || '' } }]
          : [{ query: GET_MY_GOALS }]
      ),
      update: (cache, { data }) => {
        if (data?.linkTelegram) {
          cache.modify({
            fields: {
              getUser: () => data.linkTelegram ?? false,
            },
          });
        }
      },
    },
  );

  const telegramUser = userData?.getUser;
  const goals = (goalData?.getMyGoals || []) as Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    progressPercent: number;
    objectives: Array<{
      id: string;
      title: string;
      status: string;
      progressPercent: number;
      tasks: Array<{ id: string; status: string }>;
    }>;
  }>;
  const tasks = taskData?.getTasks || [];
  const displayName =
    user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? null;

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  const isN8nConfigured =
    Boolean(graphqlUrl && graphqlUrl !== 'http://localhost:4002/graphql');

  return (
    <div className="relative flex min-h-screen flex-col bg-grid">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb--violet" aria-hidden="true" />
      <div className="glow-orb glow-orb--pink" aria-hidden="true" />

      {/* Page header */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-pink-600/10 border border-violet-500/20">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#headerGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="headerGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-10.5L2 9h7z" />
            </svg>
          </div>
          <span className="page-title">Solo LevelUp</span>
        </div>

        <div className="flex items-center gap-2">
          {displayName && (
            <span className="hidden sm:inline text-xs text-zinc-500">
              {displayName}
            </span>
          )}
          <a
            href="/n8n-setup"
            className="link-btn"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 00.583 1.045l4.115 3.12a1.724 1.724 0 001.045.583c1.756.426 1.756 2.924 0 3.35l-4.115 3.12a1.724 1.724 0 00-1.045.583 1.724 1.724 0 00-.583 1.045L12.074 18.63a1.724 1.724 0 00-1.045.583c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-.583-1.045L7.74 15.55a1.724 1.724 0 00-1.045-.583c-.75-.426-1.756-.426-2.176 0L2.03 13.48a1.724 1.724 0 00-.583-1.045 1.724 1.724 0 00-1.045-.583c-1.756-.426-1.756-2.924 0-3.35l4.115-3.12a1.724 1.724 0 00.583-1.045 1.724 1.724 0 00-1.045-.583z" />
            </svg>
            n8n Setup
          </a>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto max-w-5xl w-full p-6 space-y-6">
        {/* Telegram link card */}
        <TelegramLinkCard
          linkCode={telegramUser?.linkCode ?? null}
          telegramChatId={telegramUser?.telegramChatId ?? null}
          telegramUsername={telegramUser?.telegramUsername ?? null}
          onLink={(chatId, username) => {
            linkTelegram({
              variables: { telegramChatId: chatId, telegramUsername: username },
              refetchQueries: [{ query: GET_USER, variables: { id: user?.id || '' } }],
            });
          }}
          linking={linking}
        />

        {/* n8n notice */}
        <N8nSetupNotice isConfigured={isN8nConfigured} />

        {/* Stats grid */}
        <StatsGrid tasks={tasks} goals={goals} />

        {/* Goals section */}
        <div className="section-header">
          <h2 className="section-title">Your Goals</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn-glow rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            + New Goal
          </button>
        </div>
        <GoalList goals={goals} />
      </main>
    </div>
  );
}

function N8nSetupNotice({ isConfigured }: { isConfigured: boolean }) {
  return (
    <div className="n8n-card">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 00.583 1.045l4.115 3.12a1.724 1.724 0 001.045.583c1.756.426 1.756 2.924 0 3.35l-4.115 3.12a1.724 1.724 0 00-1.045.583 1.724 1.724 0 00-.583 1.045L12.074 18.63a1.724 1.724 0 00-1.045.583c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-.583-1.045L7.74 15.55a1.724 1.724 0 00-1.045-.583c-.75-.426-1.756-.426-2.176 0L2.03 13.48a1.724 1.724 0 00-.583-1.045 1.724 1.724 0 00-.583-.583z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {isConfigured ? 'n8n Connected' : 'n8n Local Setup'}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {isConfigured
              ? "n8n is connected to the production service. Workflows are active."
              : 'Runs on '}
            {isConfigured ? (
              <span />
            ) : (
              <code className="font-mono text-xs bg-zinc-800/60 px-1 rounded text-zinc-400">
                localhost:5678
              </code>
            )}
            {!isConfigured && (
              <>
                {' '}
                — use ngrok to tunnel for Telegram webhooks.
              </>
            )}
          </p>
          {!isConfigured && (
            <div className="mt-2 flex flex-wrap gap-2">
              <N8nBadge label="Telegram Bot Token" />
              <N8nBadge label="X-Service-Key" />
              <N8nBadge label="OpenAI / Anthropic Key" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function N8nBadge({ label }: { label: string }) {
  return (
    <span className="n8n-badge">{label}</span>
  );
}

interface StatsGridGoal {
  status: string;
  objectives: Array<{ status: string; tasks: Array<{ status: string }> }>;
}

function StatsGrid({
  tasks,
  goals,
}: {
  tasks: Array<{ status: string }>;
  goals: StatsGridGoal[];
}) {
  const done = tasks.filter((t) => t.status === 'DONE').length;
  const pending = tasks.filter((t) => t.status !== 'DONE').length;
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE').length;
  const totalObjectives = goals.reduce(
    (acc, g) => acc + g.objectives.length,
    0,
  );
  const doneObjectives = goals.reduce(
    (acc, g) =>
      acc + g.objectives.filter((o) => o.status === 'DONE').length,
    0,
  );

  const stats: Array<{
    label: string;
    value: number;
    unit: string;
    color: string;
    icon: React.ReactNode;
  }> = [
    {
      label: 'Active Goals',
      value: activeGoals,
      unit: '',
      color: 'text-violet-400',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      label: 'Objectives',
      value: doneObjectives,
      unit: `/ ${totalObjectives}`,
      color: 'text-blue-400',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
    {
      label: 'Today Done',
      value: done,
      unit: '',
      color: 'text-emerald-400',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      label: 'Today Pending',
      value: pending,
      unit: '',
      color: 'text-amber-400',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <span className="stat-card-label">{stat.label}</span>
            <div className={`h-7 w-7 rounded-lg bg-zinc-800/60 flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`stat-card-value ${stat.color}`}>
              {stat.value}
            </span>
            {stat.unit && (
              <span className="stat-card-unit">{stat.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
