import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  onClose?: () => void;
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
  ...props
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-primary-50 border-primary-200 text-primary-900',
      icon: <Info className="w-5 h-5 text-primary-600" />,
    },
    success: {
      container: 'bg-success-50 border-success-200 text-success-900',
      icon: <CheckCircle className="w-5 h-5 text-success-600" />,
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-900',
      icon: <AlertCircle className="w-5 h-5 text-warning-600" />,
    },
    danger: {
      container: 'bg-danger-50 border-danger-200 text-danger-900',
      icon: <XCircle className="w-5 h-5 text-danger-600" />,
    },
  };

  const config = variants[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border rounded-lg',
        config.container,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
