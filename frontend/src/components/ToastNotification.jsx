import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function ToastNotification() {
  const { notification, setNotification } = useTickets();

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm max-w-md ${
        notification.type === 'success' 
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
          : 'bg-red-50 text-red-900 border-red-200'
      }`}>
        {notification.type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        )}
        <span>{notification.message}</span>
        <button 
          onClick={() => setNotification(null)} 
          className="ml-auto text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
