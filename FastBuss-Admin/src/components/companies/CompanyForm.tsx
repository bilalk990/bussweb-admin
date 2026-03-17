import React from 'react';
import { CompanyFormData } from '../../types/company';

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<CompanyFormData>({
    companyName: initialData?.companyName || '',
    logo: initialData?.logo || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Company Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-dark rounded-lg text-white"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 bg-dark rounded-lg text-white"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 bg-dark rounded-lg text-white"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            className="w-full px-4 py-2 bg-dark rounded-lg text-white"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 bg-dark rounded-lg text-white"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update Company' : 'Add Company'}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm; 