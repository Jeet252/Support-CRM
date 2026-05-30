import React from 'react';
import { FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function StatsRow() {
  const { stats, statusFilter, setStatusFilter } = useTickets();

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Tickets Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
          <FileText className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* Open Tickets Card */}
      <button 
        onClick={() => setStatusFilter(statusFilter === 'Open' ? 'All' : 'Open')}
        className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all text-left w-full ${
          statusFilter === 'Open' 
            ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-100' 
            : 'bg-white border-slate-200 hover:border-emerald-200'
        }`}
      >
        <div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Open</p>
          <h3 className="text-2xl font-bold text-emerald-800 mt-1">{stats.open}</h3>
        </div>
        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
          <AlertCircle className="w-5 h-5 text-emerald-600" />
        </div>
      </button>

      {/* In Progress Card */}
      <button 
        onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'All' : 'In Progress')}
        className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all text-left w-full ${
          statusFilter === 'In Progress' 
            ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-100' 
            : 'bg-white border-slate-200 hover:border-amber-250'
        }`}
      >
        <div>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
          <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.inProgress}</h3>
        </div>
        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
      </button>

      {/* Closed Tickets Card */}
      <button 
        onClick={() => setStatusFilter(statusFilter === 'Closed' ? 'All' : 'Closed')}
        className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all text-left w-full ${
          statusFilter === 'Closed' 
            ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-200' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div>
          <p className="text-xs font-semibold text-slate-505 uppercase tracking-wider">Closed</p>
          <h3 className="text-2xl font-bold text-slate-700 mt-1">{stats.closed}</h3>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-150">
          <CheckCircle2 className="w-5 h-5 text-slate-500" />
        </div>
      </button>

    </section>
  );
}
