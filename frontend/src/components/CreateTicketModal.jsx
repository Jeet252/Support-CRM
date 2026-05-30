import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function CreateTicketModal() {
  const { isCreateOpen, setIsCreateOpen, createTicket, submittingTicket } = useTickets();

  // Local Form States
  const [formValues, setFormValues] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Input validator
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formValues.customer_name.trim()) {
      errors.customer_name = 'Customer name is required';
    }
    if (!formValues.customer_email.trim()) {
      errors.customer_email = 'Email address is required';
    } else if (!emailRegex.test(formValues.customer_email)) {
      errors.customer_email = 'Enter a valid email address';
    }
    if (!formValues.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!formValues.description.trim()) {
      errors.description = 'Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await createTicket(formValues);
    if (success) {
      // Clear form
      setFormValues({
        customer_name: '',
        customer_email: '',
        subject: '',
        description: ''
      });
      setFormErrors({});
    }
  };

  if (!isCreateOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Submit Support Ticket</h3>
            <p className="text-xs text-slate-500">Record a new customer support request in the system</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-205 text-slate-400 hover:text-slate-650 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Customer Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formValues.customer_name}
                onChange={(e) => setFormValues({ ...formValues, customer_name: e.target.value })}
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
                value={formValues.customer_email}
                onChange={(e) => setFormValues({ ...formValues, customer_email: e.target.value })}
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
              value={formValues.subject}
              onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
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
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              placeholder="Describe the client's question or problem in detail..."
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
              className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold rounded-lg text-sm transition-all"
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
                <span>Open Ticket</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
