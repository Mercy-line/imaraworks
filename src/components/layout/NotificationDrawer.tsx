import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Bell, Check, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatTimeAgo } from '../../lib/formatters';
import { cn } from '../../lib/utils';

export const NotificationMenu: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { navigateTo } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.requestId) {
      navigateTo('payment-detail', notif.requestId);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval_needed':
        return <Clock size={14} className="text-amber-600" />;
      case 'payment_processed':
        return <CheckCircle2 size={14} className="text-emerald-600" />;
      case 'payment_failed':
        return <AlertTriangle size={14} className="text-rose-600" />;
      default:
        return <Bell size={14} className="text-slate-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-2xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-modal border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-2xs font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-2xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <Check size={12} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No notifications at this time
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left',
                      !notif.read ? 'bg-amber-50/20' : ''
                    )}
                  >
                    <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-semibold text-slate-900 truncate">
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>
                      {notif.requestId && (
                        <div className="mt-2 flex items-center gap-1 text-2xs font-semibold text-slate-700 hover:text-slate-900">
                          <span>Inspect {notif.requestId}</span>
                          <ChevronRight size={10} />
                        </div>
                      )}
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
