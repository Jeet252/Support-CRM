import React, { createContext, useContext, useState, useEffect } from 'react';

const TicketContext = createContext();
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function TicketProvider({ children }) {
  // Global Application States
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Open' | 'In Progress' | 'Closed'
  const [searchQuery, setSearchQuery] = useState('');

  // Stats Metrics Counters
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });

  // UI Processing Indicators
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Auto-dismiss notification toast banners
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Toast Trigger Helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  // 1. Fetch tickets list based on filter/search parameters
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

  // 2. Fetch stats metrics from the database (analyzing all tickets)
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

  // Trigger ticket updates on query/filter modifications (with debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTickets();
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery, statusFilter]);

  // Sync general dashboard counters
  useEffect(() => {
    fetchStats();
  }, [tickets]);

  // 3. Fetch specific ticket details when selectedTicketId changes
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
      } catch (err) {
        showNotification('error', 'Failed to load ticket details.');
        console.error(err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedTicketId]);

  // 4. Create new ticket (POST /api/tickets)
  const createTicket = async (ticketData) => {
    try {
      setSubmittingTicket(true);
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (!res.ok) throw new Error('Server error while creating ticket');
      const data = await res.json();

      showNotification('success', `Ticket ${data.ticket_id} created successfully!`);
      setIsCreateOpen(false);

      // Reload tickets and auto-select the new one
      await fetchTickets();
      setSelectedTicketId(data.ticket_id);
      return true;
    } catch (err) {
      showNotification('error', 'Could not create ticket. Please try again.');
      console.error(err);
      return false;
    } finally {
      setSubmittingTicket(false);
    }
  };

  // 5. Update ticket status & add comments (PUT /api/tickets/{ticket_id})
  const updateTicket = async (ticketId, status, notes) => {
    try {
      setSubmittingUpdate(true);
      const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          notes: notes.trim() || undefined
        })
      });

      if (!res.ok) throw new Error('Server failed to update ticket');

      showNotification('success', 'Ticket updated successfully!');

      // Refresh current details & full list
      const detailsRes = await fetch(`${API_BASE}/tickets/${ticketId}`);
      const detailsData = await detailsRes.json();
      setSelectedTicket(detailsData);

      fetchTickets();
      return true;
    } catch (err) {
      showNotification('error', 'Failed to submit ticket update.');
      console.error(err);
      return false;
    } finally {
      setSubmittingUpdate(false);
    }
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      selectedTicketId,
      setSelectedTicketId,
      selectedTicket,
      statusFilter,
      setStatusFilter,
      searchQuery,
      setSearchQuery,
      stats,
      loading,
      detailLoading,
      isCreateOpen,
      setIsCreateOpen,
      notification,
      setNotification,
      submittingTicket,
      submittingUpdate,
      createTicket,
      updateTicket,
      showNotification
    }}>
      {children}
    </TicketContext.Provider>
  );
}

// Custom Hook to consume context
export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
