import React from 'react';

interface EnrollmentStatusBadgeProps {
  status: 'PENDING' | 'ENROLLED' | 'WITHDRAWN' | 'COMPLETED' | 'DROPPED';
}

// Dot + small uppercase label, matching ProgramStatusBadge on the admin Programs page
const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  PENDING: { dot: 'bg-yellow-500', text: 'text-yellow-700', label: 'Pending' },
  ENROLLED: { dot: 'bg-green-600', text: 'text-green-700', label: 'Enrolled' },
  WITHDRAWN: { dot: 'bg-red-500', text: 'text-red-700', label: 'Withdrawn' },
  COMPLETED: { dot: 'bg-blue-700', text: 'text-blue-800', label: 'Completed' },
  DROPPED: { dot: 'bg-red-500', text: 'text-red-700', label: 'Dropped' },
};

const EnrollmentStatusBadge: React.FC<EnrollmentStatusBadgeProps> = ({ status }) => {
  const style = STATUS_STYLES[status] ?? { dot: 'bg-slate-300', text: 'text-slate-500', label: status };

  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span className={style.text}>{style.label}</span>
    </span>
  );
};

export default EnrollmentStatusBadge;
