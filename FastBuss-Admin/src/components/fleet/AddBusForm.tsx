import React, { useState } from 'react';
import { CreateBusData } from '../../services/busService';
import { ChevronDown, Loader2 } from 'lucide-react';

interface AddBusFormProps {
  onSubmit: (data: CreateBusData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddBusForm: React.FC<AddBusFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<CreateBusData>({
    name: '',
    plateNumber: '',
    capacity: '',
    type: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      plateNumber: '',
      capacity: '',
      type: ''
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
          Bus Name
        </label>
        <input
          type="text"
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-dark rounded-lg text-sm sm:text-base text-white"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
          Plate Number
        </label>
        <input
          type="text"
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-dark rounded-lg text-sm sm:text-base text-white"
          value={formData.plateNumber}
          onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
          Capacity
        </label>
        <input
          type="number"
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-dark rounded-lg text-sm sm:text-base text-white"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
          Bus Type
        </label>
        <div className="relative">
          <select
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-dark rounded-lg text-sm sm:text-base text-white appearance-none pr-8 sm:pr-10"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            disabled={isLoading}
          >
            <option value="">Select Type</option>
            <option value="luxury">Luxury</option>
            <option value="standard">Standard</option>
            <option value="minibus">Minibus</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
            <ChevronDown size={14} className="text-gray-400 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 sm:gap-4 mt-4 sm:mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-xs sm:text-sm text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-xs sm:text-sm text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Bus'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddBusForm; 