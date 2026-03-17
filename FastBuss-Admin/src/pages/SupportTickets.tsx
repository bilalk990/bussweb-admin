import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  ChevronDown,
  Star,
  StarOff,
  MessageCircle,
  FileText,
  CreditCard,
  Wrench,
  HelpCircle,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { supportService, SupportTicket } from '../services/supportService';

const SupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsEditDialogOpen(true);
  };

  const handleCreateTicket = async (ticketData: {
    subject: string;
    description: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
  }) => {
    try {
      await supportService.createTicket(ticketData);
      setIsEditDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleUpdateTicket = async (
    ticketId: string,
    status: SupportTicket['status'],
    priority: SupportTicket['priority']
  ) => {
    try {
      setIsUpdating(true);
      await supportService.updateTicket(ticketId, status, priority);
      setIsEditDialogOpen(false);
      await fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError(error instanceof Error ? error.message : 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking':
        return <FileText size={16} />;
      case 'payment':
        return <CreditCard size={16} />;
      case 'technical':
        return <Wrench size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-1 sm:px-0"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">Manage and respond to customer support requests</p>
        </div>
        
        <button 
          onClick={() => setIsEditDialogOpen(true)}
          className="btn-primary text-sm sm:text-base py-1.5 sm:py-2 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: 'Total Tickets', value: tickets.length, color: 'primary', icon: Headphones },
          { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: 'info', icon: MessageSquare },
          { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length, color: 'warning', icon: Clock },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: 'success', icon: CheckCircle2 },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="data-card p-3 sm:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
                <p className={`text-lg sm:text-2xl font-semibold text-${stat.color}-400 mt-0.5 sm:mt-1`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-900/20`}>
                <stat.icon size={20} className={`text-${stat.color}-400 sm:w-6 sm:h-6`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 sm:w-[18px] sm:h-[18px]" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 border border-gray-700 rounded-lg bg-gray-800/50 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>

            <select
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Tickets</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No tickets found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket._id}
              className="data-card hover:shadow-neon-strong transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {/* Status Bar */}
              <div className={`h-1.5 bg-${getStatusColor(ticket.status)}-500`} />
              
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-${getStatusColor(ticket.status)}-900/20 border border-${getStatusColor(ticket.status)}-500/20`}>
                      {getCategoryIcon(ticket.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-semibold text-white capitalize">{ticket.category}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(ticket.priority)}-900/30 text-${getPriorityColor(ticket.priority)}-400 border border-${getPriorityColor(ticket.priority)}-500/20`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium bg-${getStatusColor(ticket.status)}-900/30 text-${getStatusColor(ticket.status)}-400 border border-${getStatusColor(ticket.status)}-500/20 whitespace-nowrap`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Subject */}
                <h3 className="text-sm font-semibold text-white truncate mb-3">{ticket.subject}</h3>
                
                {/* Description */}
                <div className="relative mb-4">
                  <p className="text-sm text-gray-400 line-clamp-2">{ticket.description}</p>
                  {ticket.description.length > 150 && (
                    <div className="absolute bottom-0 right-0 w-20 h-6 bg-gradient-to-l from-dark-blue to-transparent" />
                  )}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-400 truncate max-w-[100px]">{ticket.user.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-400">{format(new Date(ticket.createdAt), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="p-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-primary-400 hover:bg-primary-900/20 transition-colors"
                      title="View Details"
                    >
                      <MessageCircle size={14} />
                    </button>
                    <button
                      onClick={() => handleEditTicket(ticket)}
                      className="p-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                      title="Edit Ticket"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* View Ticket Dialog */}
      <AnimatePresence>
        {isViewDialogOpen && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsViewDialogOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-dark-blue rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(selectedTicket.priority)}-900/30 text-${getPriorityColor(selectedTicket.priority)}-400`}>
                      {selectedTicket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(selectedTicket.status)}-900/30 text-${getStatusColor(selectedTicket.status)}-400`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                  <p className="text-white">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Category</h3>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(selectedTicket.category)}
                      <span className="text-white capitalize">{selectedTicket.category}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Created</h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-white">
                        {format(new Date(selectedTicket.createdAt), 'PPpp')}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Attachments</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-gray-800/50 text-sm text-white hover:bg-gray-800 transition-colors"
                        >
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Create Ticket Dialog */}
      <AnimatePresence>
        {isEditDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsEditDialogOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-dark-blue rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {selectedTicket ? 'Edit Ticket' : 'Create New Ticket'}
                </h2>
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter ticket subject"
                    defaultValue={selectedTicket?.subject}
                    readOnly={selectedTicket ? true : false}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      defaultValue={selectedTicket?.category || 'other'}
                    >
                      <option value="booking">Booking</option>
                      <option value="payment">Payment</option>
                      <option value="technical">Technical</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Priority
                    </label>
                    <select
                      id="edit-priority"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      defaultValue={selectedTicket?.priority || 'medium'}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {selectedTicket && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Status
                    </label>
                    <select
                      id="edit-status"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      defaultValue={selectedTicket.status}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const statusElement = document.getElementById('edit-status') as HTMLSelectElement;
                    const priorityElement = document.getElementById('edit-priority') as HTMLSelectElement;
                    if (selectedTicket && statusElement && priorityElement) {
                      handleUpdateTicket(selectedTicket._id, statusElement.value as SupportTicket['status'], priorityElement.value as SupportTicket['priority']);
                    }
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>{selectedTicket ? 'Update' : 'Create'}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SupportTickets; 