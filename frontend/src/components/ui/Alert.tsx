import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'glass border-primary/25 text-text-primary',
  success: 'glass border-success/30 text-text-primary',
  warning: 'glass border-warning/30 text-text-primary',
  error: 'glass border-error/30 text-text-primary',
};

export default function Alert({ variant = 'info', title, children }: AlertProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]}`}
      role="alert"
    >
      {title && <div className="mb-1 font-medium">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
