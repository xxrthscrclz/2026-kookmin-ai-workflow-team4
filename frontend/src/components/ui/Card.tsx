import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export default function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`glass flex flex-col rounded-2xl p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-4 flex flex-col gap-1">
          {title && (
            <div className="text-lg font-semibold text-text-primary">{title}</div>
          )}
          {description && (
            <div className="text-sm text-text-secondary">{description}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
