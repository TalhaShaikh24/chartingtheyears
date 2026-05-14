'use client';

import { toast, Toaster } from 'sonner';
import { CheckCircle2, CircleAlert, CircleX, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ShowApiToastOptions {
  variant: ToastVariant;
  title: string;
  message?: string;
}

const variantConfig: Record<
  ToastVariant,
  {
    Icon: typeof CheckCircle2;
    iconClassName: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    iconClassName: 'text-emerald-400',
  },
  error: {
    Icon: CircleX,
    iconClassName: 'text-red-400',
  },
  warning: {
    Icon: CircleAlert,
    iconClassName: 'text-amber-400',
  },
  info: {
    Icon: Info,
    iconClassName: 'text-sky-400',
  },
};

export function showApiToast({ variant, title, message }: ShowApiToastOptions) {
  const { Icon, iconClassName } = variantConfig[variant];

  toast.custom(
    () => (
      <div className="w-full max-w-sm rounded-xl border border-line/70 bg-surface-2 px-4 py-3 shadow-xl">
        <div className="flex items-start gap-3">
          <Icon className={`mt-0.5 h-5 w-5 ${iconClassName}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{title}</p>
            {message && <p className="mt-0.5 text-xs text-ink-soft">{message}</p>}
          </div>
        </div>
      </div>
    ),
    { duration: variant === 'error' ? 4500 : 3000 }
  );
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed') {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className: '!bg-transparent !border-0 !shadow-none !p-0',
      }}
    />
  );
}
