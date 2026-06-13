import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'ממתין לתשלום',
  pending: 'ממתין לאריזה',
  shipped: 'נשלח',
  delivered: 'נמסר',
};

interface BadgeProps {
  status?: OrderStatus;
  label?: string;
  className?: string;
  variant?: 'green' | 'yellow' | 'blue' | 'purple' | 'red';
}

export default function Badge({ status, label, className, variant }: BadgeProps) {
  if (status) {
    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', `status-${status}`, className)}>
        {statusLabels[status]}
      </span>
    );
  }
  const variantClasses = {
    green: 'bg-green-900/40 text-green-400 border-green-700/40',
    yellow: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
    blue: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
    purple: 'bg-purple-900/40 text-purple-400 border-purple-700/40',
    red: 'bg-red-900/40 text-red-400 border-red-700/40',
  };
  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', variant && variantClasses[variant], className)}>
      {label}
    </span>
  );
}
