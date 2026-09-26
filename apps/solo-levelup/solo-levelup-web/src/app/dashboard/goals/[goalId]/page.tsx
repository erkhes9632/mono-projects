'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_GOAL_TREE } from '../../../../graphql/documents';

interface Task {
  id: string;
  title: string;
  description: string | null;
  acceptanceCriteria: string | null;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
}

interface Objective {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  status: string;
  progressPercent: number;
  tasks: Task[];
}

interface GoalTree {
  getGoalTree: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    progressPercent: number;
    createdAt: string;
    updatedAt: string;
    objectives: Objective[];
  } | null;
}

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = use(params);

  const { data, loading, error } = useQuery<GoalTree>(GET_GOAL_TREE, {
    variables: { goalId },
    skip: !goalId,
  });

  const goal = data?.getGoalTree;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="mx-auto max-w-4xl p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-zinc-500">Loading goal...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="mx-auto max-w-4xl p-6">
          <BackButton />
          <div className="mt-8 flex h-64 items-center justify-center">
            <p className="text-sm text-red-400">
              {error?.message || 'Goal not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = goal.objectives.reduce(
    (acc, o) => acc + o.tasks.length,
    0,
  );
  const doneTasks = goal.objectives.reduce(
    (acc, o) => acc + o.tasks.filter((t) => t.status === 'DONE').length,
    0,
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <BackButton />

        {/* Goal Header Card */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600/20 to-pink-600/10 border border-violet-500/20">
                  <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-10.5L2 9h7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-zinc-100 truncate">
                    {goal.title}
                  </h1>
                  {goal.description && (
                    <p className="mt-1 text-sm text-zinc-500">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <StatusBadge status={goal.status} />
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500">Overall Progress</span>
              <span className="text-sm font-bold text-zinc-200 tabular-nums">
                {goal.progressPercent}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-bar-fill ${
                  goal.progressPercent === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : goal.progressPercent > 0
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-zinc-600'
                }`}
                style={{ width: `${goal.progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-5 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                {goal.objectives.length} objective{goal.objectives.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {doneTasks}/{totalTasks} tasks done
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${goal.status === 'COMPLETED' ? 'bg-emerald-500' : goal.status === 'ACTIVE' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="capitalize text-zinc-500">{goal.status.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Objectives */}
        {goal.objectives.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-zinc-800/60 mb-3">
              <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-zinc-400">
              AI is decomposing your goal into objectives and daily tasks...
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              This should happen within seconds after goal creation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="section-header">
              <h2 className="section-title">Objectives</h2>
              <span className="text-xs text-zinc-500">
                {goal.objectives.filter((o) => o.status === 'DONE').length} / {goal.objectives.length} done
              </span>
            </div>
            {goal.objectives
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((objective) => (
                <ObjectiveCard key={objective.id} objective={objective} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Back to Dashboard
    </Link>
  );
}function StatusBadge({ status }: { status: string }) {
  const clsName =
    status === 'COMPLETED' || status === 'DONE'
      ? 'status-badge--completed'
      : status === 'ACTIVE'
        ? 'status-badge--active'
        : 'status-badge--abandoned';
  const label =
    status === 'COMPLETED' || status === 'DONE'
      ? 'Completed'
      : status === 'ACTIVE'
        ? 'Active'
        : status === 'ABANDONED' ? 'Abandoned' : status;
  const dotBg =
    (status === 'COMPLETED' || status === 'DONE')
      ? 'bg-emerald-400'
      : status === 'ACTIVE'
        ? 'bg-blue-400 animate-pulse'
        : 'bg-zinc-500';
  const dotBg =
    (status === 'COMPLETED' || status === 'DONE')
      ? 'bg-emerald-400'
      : status === 'ACTIVE'
        ? 'bg-blue-400 animate-pulse'
        : 'bg-zinc-500';

  return (
    <span className={'status-badge ' + clsName}>
      <span className={'h-1.5 w-1.5 rounded-full ' + dotBg} />
      {label}
    </span>
  );
}e}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === 'COMPLETED'
          ? 'bg-emerald-400'
          : status === 'ACTIVE'
            ? 'bg-blue-400 animate-pulse'
            : 'bg-zinc-500'
      }`} />
      {config.label}
    </span>
  );
}

function ObjectiveCard({ objective }: { objective: Objective }) {
  const doneCount = objective.tasks.filter(
    (t) => t.status === 'DONE',
  ).length;
  const progress = Math.min(100, Math.max(0, objective.progressPercent));

  const statusConfig =
    objective.status === 'DONE'
      ? {
          label: 'Done',
          color: 'text-emerald-300',
          dot: 'bg-emerald-400',
          progressColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        }
      : objective.status === 'IN_PROGRESS'
        ? {
            label: 'In Progress',
            color: 'text-blue-300',
            dot: 'bg-blue-400 animate-pulse',
            progressColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          }
        : {
            label: 'Pending',
            color: 'text-zinc-500',
            dot: 'bg-zinc-600',
            progressColor: 'bg-zinc-600',
          };

  const taskStatus = (task: Task) => {
    const isDone = task.status === 'DONE';
    const isMissed = task.status === 'MISSED';
    const isFailed = task.status === 'FAILED';
    const isSent = task.status === 'SENT';
    const isSubmitted = task.status === 'SUBMITTED';
    const isEvaluating = task.status === 'EVALUATING';

    return {
      rowClass: `task-row ${
        isDone ? 'task-row--done' : isMissed ? 'task-row--missed' : isFailed ? 'task-row--failed' : ''
      }`,
      icon: (
        <>
          {isDone && (
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isMissed && (
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
          )}
          {isFailed && (
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {isSent && (
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7 3 3-7-7" />
            </svg>
          )}
          {isSubmitted && (
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7 3 3-7-7" />
            </svg>
          )}
          {isEvaluating && (
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-violet-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </>
      ),
      titleClass: isDone ? 'text-zinc-500 line-through' : 'text-zinc-200',
      badgeClass: isDone
        ? 'status-badge--completed'
        : isMissed || isFailed
          ? 'status-badge--abandoned'
          : 'status-badge--active',
    };
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
            <h3 className="text-sm font-semibold text-zinc-100 truncate">
              {objective.title}
            </h3>
            <span className={`text-[10px] font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          {objective.description && (
            <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
              {objective.description}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-300 tabular-nums">
            {progress}%
          </span>
          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${statusConfig.progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
        <span>{doneCount}/{objective.tasks.length} tasks</span>
        <span>·</span>
        <span>{objective.orderIndex + 1} of {objective.tasks.length}</span>
      </div>
      {objective.tasks.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {objective.tasks.map((task) => {
            const t = taskStatus(task);
            return (
              <div key={task.id} className={t.rowClass}>
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {t.icon}
                  <span className={`truncate text-xs ${t.titleClass}`}>
                    {task.title}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {task.scheduledDate} · {task.scheduledTime}
                  </span>
                  <span className={`status-badge ${t.badgeClass}`}>
                    {task.status.charAt(0) + task.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
