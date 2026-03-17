import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  Shield,
  Save,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { companyProfileService } from '../services/companyProfileService';
import { authService } from '../services/authService';

interface CompanyProfile {
  _id: string;
  companyName: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
    logo: null as File | null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const profile = await companyProfileService.getCompanyProfile();
        setCompanyProfile(profile);
        setFormData({
          companyName: profile.companyName,
          contactEmail: profile.contactEmail,
          contactPhone: profile.contactPhone,
          description: profile.description,
          logo: null
        });
      } catch (err) {
        setError('Failed to load company profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const formDataToSend = new FormData();
      if (formData.companyName) formDataToSend.append('companyName', formData.companyName);
      if (formData.contactEmail) formDataToSend.append('contactEmail', formData.contactEmail);
      if (formData.contactPhone) formDataToSend.append('contactPhone', formData.contactPhone);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.logo) formDataToSend.append('logo', formData.logo);

      const updatedProfile = await companyProfileService.updateCompanyProfile(formDataToSend);
      setCompanyProfile(updatedProfile);
      setFormData(prev => ({ ...prev, logo: null }));
      setSuccessMessage('Company profile updated successfully!');
    } catch (err) {
      setError('Failed to update company profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    {
      id: 'general',
      title: 'General Settings',
      icon: SettingsIcon,
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Company Information</h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="text-gray-400 sm:w-5 sm:h-5" size={16} />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone className="text-gray-400 sm:w-5 sm:h-5" size={16} />
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="Contact Number"
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail className="text-gray-400 sm:w-5 sm:h-5" size={16} />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Contact Email"
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-sm sm:text-base text-white">Company Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter company description"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-sm sm:text-base text-white">Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
                {companyProfile?.logo && (
                  <div className="mt-2">
                    <img 
                      src={companyProfile.logo} 
                      alt="Company Logo" 
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${
                  isSaving 
                    ? 'bg-primary-600 cursor-not-allowed' 
                    : 'bg-primary-500 hover:bg-primary-600'
                } text-sm sm:text-base text-white transition-colors`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="sm:w-5 sm:h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: Shield,
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Password Settings</h3>
            {passwordError && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500 rounded-lg text-sm sm:text-base text-red-500">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-500/10 border border-green-500 rounded-lg text-sm sm:text-base text-green-500">
                {passwordSuccess}
              </div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${
                  isChangingPassword 
                    ? 'bg-primary-600 cursor-not-allowed' 
                    : 'bg-primary-500 hover:bg-primary-600'
                } text-sm sm:text-base text-white transition-colors`}
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="sm:w-5 sm:h-5" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-3 sm:p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-3 sm:p-6 flex items-center justify-center">
        <div className="text-red-500 text-sm sm:text-base">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Settings</h1>
        
        {error && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500 rounded-lg text-sm sm:text-base text-red-500">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-500/10 border border-green-500 rounded-lg text-sm sm:text-base text-green-500">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          {/* Tabs Navigation */}
          <div className="w-full sm:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-3 sm:p-4 rounded-lg text-left transition-colors flex items-center gap-2 sm:gap-3 ${
                  activeTab === tab.id
                    ? 'bg-primary-900 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon size={16} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: activeTab === tab.id ? 1 : 0,
                  x: activeTab === tab.id ? 0 : 20
                }}
                className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
              >
                {tab.content}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings; 