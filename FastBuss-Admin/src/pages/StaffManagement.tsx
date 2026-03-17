import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Trash2,
  Loader2,
  MoreVertical,
  Mail,
  Shield,
  Lock,
  Unlock,
  Clock,
  User
} from 'lucide-react';
import AddStaffModal from '../components/staff/AddStaffModal';
import Avatar from '../components/common/Avatar';
import { staffService } from '../services/staffService';
interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

const StaffManagement: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [blockingStaffId, setBlockingStaffId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const staff = await staffService.listAllStaff();
        setStaffMembers(staff);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffMembers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId]?.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddStaff = () => {
    setIsAddModalOpen(true);
  };

  const handleStaffCreated = async () => {
    try {
      setIsLoading(true);
      const staff = await staffService.listAllStaff();
      setStaffMembers(staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh staff list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      setDeletingStaffId(staffId);
      await staffService.deleteStaff(staffId);
      setStaffMembers(staffMembers.filter(staff => staff._id !== staffId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete staff member');
    } finally {
      setDeletingStaffId(null);
      setOpenMenuId(null);
    }
  };

  const handleBlockStaff = async (staffId: string) => {
    try {
      setBlockingStaffId(staffId);
      await staffService.blockStaff(staffId);
      
      // Refresh staff list
      const updatedStaff = await staffService.listAllStaff();
      setStaffMembers(updatedStaff);
    } catch (err) {
      console.error('Error blocking staff:', err);
      // Handle error (you might want to show a toast or error message)
    } finally {
      setBlockingStaffId(null);
    }
  };

  const handleUnblockStaff = async (staffId: string) => {
    try {
      setBlockingStaffId(staffId);
      await staffService.unblockStaff(staffId);
      
      // Refresh staff list
      const updatedStaff = await staffService.listAllStaff();
      setStaffMembers(updatedStaff);
    } catch (err) {
      console.error('Error unblocking staff:', err);
      // Handle error (you might want to show a toast or error message)
    } finally {
      setBlockingStaffId(null);
    }
  };

  const toggleMenu = (staffId: string) => {
    setOpenMenuId(openMenuId === staffId ? null : staffId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Shield size={14} className="text-green-400" />;
      case 'inactive':
        return <Lock size={14} className="text-red-400" />;
      case 'pending':
        return <Clock size={14} className="text-yellow-400" />;
      default:
        return <User size={14} className="text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          <span className="text-white">Loading staff members...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6">
      {/* Header */}
      <div className="relative mb-6 sm:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Staff Management
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">Manage your staff members</p>
          </div>
          <button 
            className="btn-holographic flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            onClick={handleAddStaff}
          >
            <UserPlus size={14} className="sm:w-4 sm:h-4" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-gray-900/50 border border-gray-800 rounded-md text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-gray-900/50 border border-gray-800 rounded-md text-sm sm:text-base text-white px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
      <motion.div
            key={staff._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-primary-500/50 transition-colors"
          >
            {/* Status Badge */}
            <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
              {getStatusIcon(staff.status)}
              <span className="capitalize">{staff.status}</span>
            </div>

            {/* Staff Info */}
            <div className="flex items-start gap-4 mt-8">
              <div className="relative">
                      <Avatar
                  name={staff.name}
                  status={staff.status}
                  size="lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{staff.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                  <Mail size={14} />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                  <User size={14} />
                  <span className="capitalize">{staff.role}</span>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => toggleMenu(staff._id)}
                className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <MoreVertical size={16} className="text-gray-400" />
              </button>

              {openMenuId === staff._id && (
                <div
                  ref={el => menuRefs.current[staff._id] = el}
                  className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => handleDeleteStaff(staff._id)}
                      disabled={deletingStaffId === staff._id}
                    >
                      {deletingStaffId === staff._id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          Delete
                        </>
                      )}
                    </button>
                    {staff.status === 'active' ? (
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => handleBlockStaff(staff._id)}
                        disabled={blockingStaffId === staff._id}
                      >
                        {blockingStaffId === staff._id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Blocking...
                          </>
                        ) : (
                          <>
                            <Lock size={14} />
                            Block
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => handleUnblockStaff(staff._id)}
                        disabled={blockingStaffId === staff._id}
                      >
                        {blockingStaffId === staff._id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Unblocking...
                          </>
                        ) : (
                          <>
                            <Unlock size={14} />
                            Unblock
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
              </motion.div>
        ))}
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleStaffCreated}
      />
    </div>
  );
};

export default StaffManagement; 