interface StatsCardProps {
  label: string;
  value: number;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
}
export function StatsCard({
  label,
  value,
  unit,
  color,
  icon,
}: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="stat-card-label">{label}</span>
        {icon && (
          <div className="h-7 w-7 rounded-lg bg-zinc-800/60 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`stat-card-value ${color || 'text-zinc-100'}`}>
          {value}
        </span>
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
    </div>
  );
}
