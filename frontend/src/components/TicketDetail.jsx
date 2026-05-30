import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  AlertCircle, 
  User, 
  Mail, 
  Calendar, 
  Activity, 
  MessageSquare, 
  ArrowLeft, 
  Send 
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function TicketDetail() {
  const {
    selectedTicketId,
    setSelectedTicketId,
    selectedTicket,
    detailLoading,
    updateTicket,
    submittingUpdate
  } = useTickets();

  // Local Form States for Status Dropdown and Notes input
  const [localStatus, setLocalStatus] = useState('Open');
  const [newNote, setNewNote] = useState('');

  // Sync local status whenever the selected ticket changes
  useEffect(() => {
    if (selectedTicket) {
      setLocalStatus(selectedTicket.status);
    }
  }, [selectedTicket]);

  // Handle Note / Status Update
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const success = await updateTicket(selectedTicket.ticket_id, localStatus, newNote);
    if (success) {
      setNewNote('');
    }
  };

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

  // 1. Blank State
  if (!selectedTicketId) {
    return (
      <section className="hidden lg:flex lg:col-span-7 items-center justify-center p-8 bg-white rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
        <div className="text-center text-slate-400 max-w-sm flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-2">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-base font-semibold text-slate-700">No Ticket Selected</h4>
          <p className="text-xs text-slate-505 leading-relaxed">
            Select a support ticket from the list to view its descriptions, chronological status logs, and add agent notes.
          </p>
        </div>
      </section>
    );
  }

  // 2. Loading State
  if (detailLoading) {
    return (
      <section className="lg:col-span-7 flex flex-col items-center justify-center text-slate-450 gap-3 bg-white rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
        <span className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
        <span className="text-sm">Loading ticket details...</span>
      </section>
    );
  }

  // 3. Error State
  if (!selectedTicket) {
    return (
      <section className="lg:col-span-7 flex flex-col items-center justify-center text-slate-400 p-8 bg-white rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm font-semibold text-slate-700 mt-2">Error Loading Ticket</p>
        <p className="text-xs">The selected ticket could not be loaded from the database.</p>
      </section>
    );
  }

  // 4. Ticket Content Display
  return (
    <section className="lg:col-span-7 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
      <div className="flex-1 flex flex-col max-h-[750px]">
        
        {/* Details Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col gap-4">
          
          {/* Mobile Back Button & Header Actions */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedTicketId(null)}
              className="lg:hidden flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to list</span>
            </button>
            
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded tracking-wider">
              {selectedTicket.ticket_id}
            </span>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(selectedTicket.status)}`}>
              {selectedTicket.status}
            </span>
          </div>

          {/* Subject */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">
              {selectedTicket.subject}
            </h2>
          </div>

          {/* Customer Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
            
            <div className="flex items-center gap-2.5 text-xs text-slate-650 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-semibold">CUSTOMER</p>
                <p className="font-medium text-slate-700 truncate">{selectedTicket.customer_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-650 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-semibold">EMAIL ADDRESS</p>
                <a href={`mailto:${selectedTicket.customer_email}`} className="font-medium text-indigo-600 hover:underline truncate">
                  {selectedTicket.customer_email}
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Details Scrollable Body (Original Description + Notes Timeline) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 bg-slate-50/30">
          
          {/* Original Customer Inquiry Box */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original Ticket Inquiry</h4>
            <div className="bg-white p-4 rounded-xl border border-slate-250/70 shadow-sm leading-relaxed text-sm text-slate-705 whitespace-pre-wrap">
              {selectedTicket.description}
            </div>
            <div className="flex items-center gap-1.5 mt-2 ml-1 text-[11px] text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-350" />
              Submitted: {formatDate(selectedTicket.created_at)}
            </div>
          </div>

          {/* Collaboration Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Support & Collaboration Timeline</h4>
            <div className="relative pl-6 border-l-2 border-slate-200 flex flex-col gap-5 ml-2.5">
              
              {selectedTicket.notes && selectedTicket.notes.length > 0 ? (
                selectedTicket.notes.map((note, index) => {
                  const isSystem = note.note_text.startsWith('System:');
                  return (
                    <div key={note.id || index} className="relative">
                      
                      {/* Timeline indicator circle icon */}
                      <span className={`absolute -left-[33px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm ${
                        isSystem 
                          ? 'bg-slate-100 border-slate-300 text-slate-500' 
                          : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      }`}>
                        {isSystem ? (
                          <Activity className="w-3 h-3" />
                        ) : (
                          <MessageSquare className="w-3 h-3" />
                        )}
                      </span>

                      {/* Timeline Entry Card */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1 text-left">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isSystem ? 'text-slate-500' : 'text-indigo-600'}`}>
                            {isSystem ? 'CRM Operations' : 'Support Representative'}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-650 text-sm mt-1 leading-relaxed break-words whitespace-pre-wrap">
                          {isSystem ? note.note_text.replace('System:', '').trim() : note.note_text}
                        </p>
                      </div>

                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No notes or operations logged for this ticket yet.</p>
              )}

            </div>
          </div>

        </div>

        {/* Details Footer: Add Note / Change Status form */}
        <div className="p-4 md:p-6 border-t border-slate-200 bg-white">
          <form onSubmit={handleSubmitUpdate} className="flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Change Ticket State & Add Notes
              </label>
              
              {/* Quick Status Setter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Update status:</span>
                <select
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Note Input Box */}
            <div className="relative">
              <textarea
                rows="3"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type internal notes, customer responses, or action updates here..."
                className="w-full text-sm p-3 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 bg-slate-50/50"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingUpdate || (!newNote.trim() && localStatus === selectedTicket.status)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all text-white ${
                  submittingUpdate || (!newNote.trim() && localStatus === selectedTicket.status)
                    ? 'bg-slate-350 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md'
                }`}
              >
                {submittingUpdate ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Save Ticket Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}
