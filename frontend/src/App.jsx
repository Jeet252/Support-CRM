import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Calendar, 
  Send, 
  X, 
  FileText, 
  Activity, 
  ArrowLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  // Application State
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Open' | 'In Progress' | 'Closed'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats Counters
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });

  // UI States
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form States
  const [newTicket, setNewTicket] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Note/Update States
  const [newNote, setNewNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState('Open');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch Tickets List
  const fetchTickets = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/tickets`;
      const params = [];
      
      if (statusFilter !== 'All') {
        params.push(`status=${encodeURIComponent(statusFilter)}`);
      }
      if (searchQuery.trim() !== '') {
        params.push(`search=${encodeURIComponent(searchQuery)}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      showNotification('error', 'Could not load tickets from server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Metrics Stats (We calculate from fetching all tickets without filter)
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const allTickets = await res.json();
      
      const counts = allTickets.reduce(
        (acc, t) => {
          acc.total += 1;
          if (t.status === 'Open') acc.open += 1;
          else if (t.status === 'In Progress') acc.inProgress += 1;
          else if (t.status === 'Closed') acc.closed += 1;
          return acc;
        },
        { total: 0, open: 0, inProgress: 0, closed: 0 }
      );
      setStats(counts);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Debounced ticket fetching based on search & filter
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTickets();
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery, statusFilter]);

  // Fetch stats on load and whenever tickets list might change
  useEffect(() => {
    fetchStats();
  }, [tickets]);

  // Fetch Ticket Details when selected
  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        const res = await fetch(`${API_BASE}/tickets/${selectedTicketId}`);
        if (!res.ok) {
          if (res.status === 404) {
            showNotification('error', 'Ticket not found.');
            setSelectedTicketId(null);
            return;
          }
          throw new Error('Failed to fetch ticket details');
        }
        const data = await res.json();
        setSelectedTicket(data);
        setUpdateStatus(data.status);
      } catch (err) {
        showNotification('error', 'Failed to load ticket details.');
        console.error(err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedTicketId]);

  // Trigger Toast Notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  // Form Input Validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newTicket.customer_name.trim()) {
      errors.customer_name = 'Customer name is required';
    }
    if (!newTicket.customer_email.trim()) {
      errors.customer_email = 'Email address is required';
    } else if (!emailRegex.test(newTicket.customer_email)) {
      errors.customer_email = 'Enter a valid email address';
    }
    if (!newTicket.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!newTicket.description.trim()) {
      errors.description = 'Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Ticket Submission
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmittingTicket(true);
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });

      if (!res.ok) throw new Error('Server returned error while creating ticket');
      const data = await res.json();

      showNotification('success', `Ticket ${data.ticket_id} created successfully!`);
      setIsCreateOpen(false);
      
      // Reset form
      setNewTicket({
        customer_name: '',
        customer_email: '',
        subject: '',
        description: ''
      });
      setFormErrors({});

      // Refresh list & select the new ticket
      await fetchTickets();
      setSelectedTicketId(data.ticket_id);
    } catch (err) {
      showNotification('error', 'Could not create ticket. Please try again.');
      console.error(err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle Note Addition & Status Update
  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setSubmittingUpdate(true);
      const res = await fetch(`${API_BASE}/tickets/${selectedTicket.ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          notes: newNote.trim() || undefined
        })
      });

      if (!res.ok) throw new Error('Server failed to update ticket');
      
      showNotification('success', 'Ticket updated successfully!');
      setNewNote('');
      
      // Refresh details and tickets list
      const detailsRes = await fetch(`${API_BASE}/tickets/${selectedTicket.ticket_id}`);
      const detailsData = await detailsRes.json();
      setSelectedTicket(detailsData);
      
      fetchTickets();
    } catch (err) {
      showNotification('error', 'Failed to submit ticket update.');
      console.error(err);
    } finally {
      setSubmittingUpdate(false);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      
      {/* Toast Notification Banner */}
      {notification && (
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
            <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Navigation */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">

        {/* Dashboard Overview Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
              <FileText className="w-5 h-5 text-slate-500" />
            </div>
          </div>

          <button 
            onClick={() => setStatusFilter('Open')}
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

          <button 
            onClick={() => setStatusFilter('In Progress')}
            className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all text-left w-full ${
              statusFilter === 'In Progress' 
                ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-100' 
                : 'bg-white border-slate-200 hover:border-amber-200'
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

          <button 
            onClick={() => setStatusFilter('Closed')}
            className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all text-left w-full ${
              statusFilter === 'Closed' 
                ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-200' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed</p>
              <h3 className="text-2xl font-bold text-slate-700 mt-1">{stats.closed}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-150">
              <CheckCircle2 className="w-5 h-5 text-slate-500" />
            </div>
          </button>

        </section>

        {/* Workspace Layout Grid: Left List / Right Details */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">

          {/* Left Column: Tickets Search, Filter Tabs & Scrollable List */}
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
                        <Calendar className="w-3 h-3 text-slate-350" />
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

          {/* Right Column: Ticket Conversation Timeline & Details */}
          <section className={`lg:col-span-7 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] ${
            !selectedTicketId ? 'hidden lg:flex items-center justify-center p-8' : 'flex'
          }`}>
            
            {/* Blank State if no ticket selected */}
            {!selectedTicketId ? (
              <div className="text-center text-slate-400 max-w-sm flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-2">
                  <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-base font-semibold text-slate-700">No Ticket Selected</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a support ticket from the list to view its descriptions, chronological status logs, and add agent notes.
                </p>
              </div>
            ) : detailLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <span className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-sm">Loading ticket details...</span>
              </div>
            ) : !selectedTicket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-sm font-semibold text-slate-700 mt-2">Error Loading Ticket</p>
                <p className="text-xs">The selected ticket could not be loaded from the database.</p>
              </div>
            ) : (
              // Full Details Pane
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
                    <div className="bg-white p-4 rounded-xl border border-slate-250/70 shadow-sm leading-relaxed text-sm text-slate-700 whitespace-pre-wrap">
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
                  <form onSubmit={handleUpdateTicket} className="flex flex-col gap-4">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Change Ticket State & Add Notes
                      </label>
                      
                      {/* Quick Status Setter */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Update status:</span>
                        <select
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value)}
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
                        disabled={submittingUpdate || (!newNote.trim() && updateStatus === selectedTicket.status)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all text-white ${
                          submittingUpdate || (!newNote.trim() && updateStatus === selectedTicket.status)
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
            )}

          </section>

        </div>

      </main>

      {/* Floating Create Ticket Drawer Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Submit Support Ticket</h3>
                <p className="text-xs text-slate-500">Record a new customer support request in the system</p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTicket} className="p-6 flex flex-col gap-4">
              
              {/* Customer Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Customer Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTicket.customer_name}
                    onChange={(e) => setNewTicket({ ...newTicket, customer_name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className={`w-full text-sm px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 ${
                      formErrors.customer_name ? 'border-red-300 focus:ring-red-200 bg-red-50/10' : 'border-slate-250'
                    }`}
                  />
                  {formErrors.customer_name && (
                    <span className="text-red-555 text-[11px] font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      {formErrors.customer_name}
                    </span>
                  )}
                </div>

                {/* Customer Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Customer Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTicket.customer_email}
                    onChange={(e) => setNewTicket({ ...newTicket, customer_email: e.target.value })}
                    placeholder="e.g. johndoe@example.com"
                    className={`w-full text-sm px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 ${
                      formErrors.customer_email ? 'border-red-300 focus:ring-red-200 bg-red-50/10' : 'border-slate-250'
                    }`}
                  />
                  {formErrors.customer_email && (
                    <span className="text-red-555 text-[11px] font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      {formErrors.customer_email}
                    </span>
                  )}
                </div>

              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Subject / Short Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Received incorrect item color in order"
                  className={`w-full text-sm px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 ${
                    formErrors.subject ? 'border-red-300 focus:ring-red-200 bg-red-50/10' : 'border-slate-250'
                  }`}
                />
                {formErrors.subject && (
                  <span className="text-red-555 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    {formErrors.subject}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="5"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe the client's question or problem in detail. Include order numbers or technical constraints if any..."
                  className={`w-full text-sm p-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 ${
                    formErrors.description ? 'border-red-300 focus:ring-red-200 bg-red-50/10' : 'border-slate-250'
                  }`}
                ></textarea>
                {formErrors.description && (
                  <span className="text-red-555 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    {formErrors.description}
                  </span>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-550 hover:bg-slate-50 font-semibold rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                >
                  {submittingTicket ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Open Ticket</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

      {/* Footer copyright */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 SupportDesk CRM. Designed with a clean, professional, and intuitive developer mindset.
      </footer>

    </div>
  );
}
