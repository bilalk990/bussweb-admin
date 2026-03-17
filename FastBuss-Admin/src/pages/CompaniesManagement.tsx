import React, { useState, useEffect } from 'react';
import { Company } from '../types/company';
import { motion } from 'framer-motion';
import CompanyForm from '../components/companies/CompanyForm';
import { companyService } from '../services/companyService';
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

const CompaniesManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenuCompany, setSelectedMenuCompany] = useState<string | null>(null);
  const [processingDeleteId, setProcessingDeleteId] = useState<string | null>(null);
  const [processingSuspendId, setProcessingSuspendId] = useState<string | null>(null);
  const [processingActivateId, setProcessingActivateId] = useState<string | null>(null);
  const [processingViewDetailsId, setProcessingViewDetailsId] = useState<string | null>(null);

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await companyService.listCompanies();
      setCompanies(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setIsLoading(false);
    }
  };

  const handleAddCompany = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const newCompany = await companyService.createCompany(formData);
      // Fetch the updated list of companies
      const updatedCompanies = await companyService.listCompanies();
      setCompanies(updatedCompanies);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = async (formData: any) => {
    if (!selectedCompany) return;
    try {
      const updatedCompany = await companyService.updateCompany(selectedCompany._id, formData);
      setCompanies(companies.map(company => 
        company._id === updatedCompany._id ? updatedCompany : company
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      setProcessingDeleteId(companyId);
      await companyService.deleteCompany(companyId);
      setCompanies(companies.filter(company => company._id !== companyId));
    } catch (error) {
      console.error('Error deleting company:', error);
    } finally {
      setProcessingDeleteId(null);
      setSelectedMenuCompany(null);
    }
  };

  const handleSuspendCompany = async (companyId: string) => {
    try {
      setProcessingSuspendId(companyId);
      const response = await companyService.suspendCompany(companyId);
      setCompanies(companies.map(company => 
        company._id === companyId ? { ...company, isActive: false } : company
      ));
    } catch (error) {
      console.error('Error suspending company:', error);
    } finally {
      setProcessingSuspendId(null);
      setSelectedMenuCompany(null);
    }
  };

  const handleActivateCompany = async (companyId: string) => {
    try {
      setProcessingActivateId(companyId);
      const response = await companyService.activateCompany(companyId);
      setCompanies(companies.map(company => 
        company._id === companyId ? { ...company, isActive: true } : company
      ));
    } catch (error) {
      console.error('Error activating company:', error);
    } finally {
      setProcessingActivateId(null);
      setSelectedMenuCompany(null);
    }
  };

  const handleViewDetails = async (companyId: string) => {
    try {
      setProcessingViewDetailsId(companyId);
      const companyDetails = await companyService.getCompany(companyId);
      setSelectedCompany(companyDetails);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching company details:', error);
    } finally {
      setProcessingViewDetailsId(null);
      setSelectedMenuCompany(null);
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (!company) return false;
    const matchesSearch = (company.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (company.contactEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && company.isActive) || 
                         (statusFilter === 'blocked' && !company.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Companies Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span>Add New Company</span>
        </button>
      </div>

      <div className="bg-dark-blue rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 bg-dark rounded-lg text-white placeholder-gray-400 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="w-full sm:w-auto pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 bg-dark rounded-lg text-white appearance-none text-sm sm:text-base"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/50 rounded-lg p-4 space-y-4 relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={company.logo} 
                    alt={company.companyName} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{company.companyName}</h3>
                    <p className="text-sm text-gray-400">{company.contactEmail}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setSelectedMenuCompany(selectedMenuCompany === company._id ? null : company._id)}
                    className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <MoreVertical size={20} className="text-gray-400" />
                  </button>
                  
                  {selectedMenuCompany === company._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                      <button
                        onClick={() => {
                          handleViewDetails(company._id);
                          setSelectedMenuCompany(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50"
                        disabled={processingViewDetailsId === company._id}
                      >
                        {processingViewDetailsId === company._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Eye size={16} />
                        )}
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setIsEditModalOpen(true);
                          setSelectedMenuCompany(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50"
                      >
                        <Edit2 size={16} />
                        <span>Edit</span>
                      </button>
                      {company.isActive ? (
                        <button
                          onClick={() => handleSuspendCompany(company._id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50"
                          disabled={processingSuspendId === company._id}
                        >
                          {processingSuspendId === company._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}
                          <span>Suspend</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateCompany(company._id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-400 hover:bg-gray-700/50"
                          disabled={processingActivateId === company._id}
                        >
                          {processingActivateId === company._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          <span>Activate</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCompany(company._id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50"
                        disabled={processingDeleteId === company._id}
                      >
                        {processingDeleteId === company._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 line-clamp-2">{company.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    company.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {company.isActive ? 'Active' : 'Blocked'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{company.contactPhone}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-blue rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New Company</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddCompany(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Admin Name</label>
                  <input
                    type="text"
                    name="adminName"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Admin Password</label>
                  <input
                    type="password"
                    name="adminPassword"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Logo</label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Company'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-blue rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Edit Company</h2>
            <CompanyForm
              initialData={selectedCompany}
              onSubmit={handleEditCompany}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Company Details</h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedCompany.logo} 
                  alt={selectedCompany.companyName} 
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedCompany.companyName}</h3>
                  <p className="text-gray-400">{selectedCompany.contactEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-400">Contact Phone</p>
                  <p className="text-white">{selectedCompany.contactPhone}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400">Status</p>
                  <p className={`${selectedCompany.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCompany.isActive ? 'Active' : 'Suspended'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400">Staff Count</p>
                  <p className="text-white">{selectedCompany.staffCount}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400">Bus Count</p>
                  <p className="text-white">{selectedCompany.busCount}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400">Driver Count</p>
                  <p className="text-white">{selectedCompany.driverCount}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400">Created At</p>
                  <p className="text-white">{new Date(selectedCompany.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-400">Description</p>
                <p className="text-white">{selectedCompany.description}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CompaniesManagement; 