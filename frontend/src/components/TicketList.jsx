import React from 'react';
import { Search, Inbox, User, Calendar, ChevronRight, X } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function TicketList() {
  const {
    tickets,
    selectedTicketId,
    setSelectedTicketId,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    loading
  } = useTickets();

  // Formatting date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status Badge Class Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <section className={`lg:col-span-5 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${
      selectedTicketId ? 'hidden lg:flex' : 'flex'
    }`}>
      
      {/* Search Input Box */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, subject, TKT ID..."
            className="w-full text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Navigation Tabs */}
      <div className="px-4 py-2 border-b border-slate-150 bg-slate-50/50 flex gap-2 overflow-x-auto">
        {['All', 'Open', 'In Progress', 'Closed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border whitespace-nowrap ${
              statusFilter === tab 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Tickets List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px]">
        {loading && tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <span className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-sm">Loading tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Inbox className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-medium">No tickets found</p>
            <p className="text-xs">Try adjusting your filters or search queries.</p>
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.ticket_id}
              onClick={() => setSelectedTicketId(t.ticket_id)}
              className={`p-4 hover:bg-indigo-50/20 cursor-pointer flex flex-col gap-2.5 transition-all text-left ${
                selectedTicketId === t.ticket_id 
                  ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' 
                  : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wide border border-indigo-100">
                  {t.ticket_id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(t.status)}`}>
                  {t.status}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                  {t.subject}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{t.customer_name}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-350" />
                  {formatDate(t.created_at)}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* List Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-400">
        Showing {tickets.length} support tickets
      </div>

    </section>
  );
}
