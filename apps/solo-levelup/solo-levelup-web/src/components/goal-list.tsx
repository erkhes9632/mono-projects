'use client';

import Link from 'next/link';

type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

interface GoalItem {
  id: string;
  title: string;
  description?: string | null;
  status: GoalStatus | string;
  progressPercent: number;
  objectives?: {
    id: string;
    title: string;
    status: string;
    progressPercent: number;
    tasks?: { id: string; status: string }[];
  }[];
}

function GoalRow({ goal }: { goal: GoalItem }) {
  const progress = Math.min(100, Math.max(0, goal.progressPercent));
  const objectiveCount = goal.objectives?.length ?? 0;
  const taskCount =
    goal.objectives?.reduce((acc, o) => acc + (o.tasks?.length ?? 0), 0) ?? 0;

  const statusConfig = {
    ACTIVE: {
      label: 'Active',
      icon: (
        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      progressColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    COMPLETED: {
      label: 'Completed',
      icon: (
        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      progressColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    },
    ABANDONED: {
      label: 'Abandoned',
      icon: (
        <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
      ),
      iconBg: 'bg-zinc-800/60 border-zinc-700/40',
      progressColor: 'bg-zinc-600',
    },
  }[goal.status] ?? {
    label: goal.status,
    icon: (
      <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    iconBg: 'bg-zinc-800/60 border-zinc-700/40',
    progressColor: 'bg-zinc-600',
  };

  const statusBadgeClass =
    goal.status === 'ACTIVE'
      ? 'status-badge--active'
      : goal.status === 'COMPLETED' || goal.status === 'DONE'
        ? 'status-badge--completed'
        : 'status-badge--abandoned';

  return (
    <Link href={`/dashboard/goals/${goal.id}`} className="group">
      <div className="goal-card">
        {/* Status icon */}
        <div className={`goal-card-icon ${statusConfig.iconBg}`}>
          {statusConfig.icon}
        </div>

        {/* Body */}
        <div className="goal-card-body">
          <div className="flex items-center gap-2.5">
            <h3 className="goal-card-title">{goal.title}</h3>
            <span className={`status-badge ${statusBadgeClass}`}>
              {statusConfig.label}
            </span>
          </div>
          {goal.description && (
            <p className="goal-card-desc">{goal.description}</p>
          )}
          <div className="goal-card-stats">
            <span>{progress}% complete</span>
            {objectiveCount > 0 && (
              <>
                <span>·</span>
                <span>{objectiveCount} objective{objectiveCount !== 1 ? 's' : ''}</span>
              </>
            )}
            {taskCount > 0 && (
              <>
                <span>·</span>
                <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="goal-card-progress">
          <div
            className={`goal-card-progress-fill ${statusConfig.progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Arrow */}
        <svg
          className="goal-card-arrow"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export function GoalList({ goals }: { goals: GoalItem[] }) {
  if (goals.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="empty-state-text">No goals yet. Create your first one to start leveling up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {goals.map((goal) => (
        <GoalRow key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
