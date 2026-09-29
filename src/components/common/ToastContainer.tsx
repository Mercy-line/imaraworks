import React from 'react';
import { useNotifications, ToastItem } from '../../contexts/NotificationContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />;
      case 'error':
        return <AlertCircle className="text-rose-500 shrink-0" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
      default:
        return <Info className="text-sky-500 shrink-0" size={18} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-4 border-l-emerald-500';
      case 'error':
        return 'border-l-4 border-l-rose-500';
      case 'warning':
        return 'border-l-4 border-l-amber-500';
      default:
        return 'border-l-4 border-l-sky-500';
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-3.5 bg-slate-900 text-white rounded-xl shadow-modal border border-slate-800 transition-all transform animate-in slide-in-from-bottom-3 duration-200',
        getBorderColor()
      )}
      role="alert"
    >
      <div className="pt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold tracking-tight text-white">{toast.title}</h5>
        {toast.message && (
          <p className="text-xs text-slate-300 mt-0.5 leading-snug break-words">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-1 rounded transition-colors -mr-1 -mt-1"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
};
