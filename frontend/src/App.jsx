import React from 'react';
import { TicketProvider } from './context/TicketContext';
import Navbar from './components/Navbar';
import StatsRow from './components/StatsRow';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import CreateTicketModal from './components/CreateTicketModal';
import ToastNotification from './components/ToastNotification';

export default function App() {
  return (
    <TicketProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
        
        {/* Banner Alert Popups */}
        <ToastNotification />

        {/* Branding Navigation Header */}
        <Navbar />

        {/* Dashboard Grid Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
          
          {/* Dashboard upper overview stats row */}
          <StatsRow />

          {/* Master-Detail workspace split screen */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
            
            {/* Left list and search column */}
            <TicketList />

            {/* Right conversation timeline column */}
            <TicketDetail />

          </div>

        </main>

        {/* Floating ticket creator overlays */}
        <CreateTicketModal />

        {/* Simple Footer */}
        <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white">
          © 2026 SupportDesk CRM. Designed with a clean, professional React Context split-component architecture.
        </footer>

      </div>
    </TicketProvider>
  );
}
