import React from 'react';
import { Plus, Inbox } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function Navbar() {
  const { setIsCreateOpen } = useTickets();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <Inbox className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">SupportDesk</h1>
          <p className="text-xs text-slate-500">Customer Ticketing CRM System</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Database Connected
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ticket</span>
        </button>
      </div>
    </header>
  );
}
