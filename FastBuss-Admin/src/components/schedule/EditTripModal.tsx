import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, User } from 'lucide-react';
import { tripHistoryService, Driver } from '../../services/tripHistoryService';
import { authService } from '../../services/authService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";

interface EditTripModalProps {
  tripId: string;
  initialDepartureTime: string;
  initialArrivalTime: string;
  initialDriverId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const EditTripModal = ({
  tripId,
  initialDepartureTime,
  initialArrivalTime,
  initialDriverId,
  onClose,
  onUpdate
}: EditTripModalProps) => {
  const [departureTime, setDepartureTime] = useState<Date | null>(new Date(initialDepartureTime));
  const [arrivalTime, setArrivalTime] = useState<Date | null>(new Date(initialArrivalTime));
  const [driverId, setDriverId] = useState(initialDriverId);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await tripHistoryService.getAvailableDrivers();
        setDrivers(response.data);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError('Failed to load available drivers');
      }
    };

    fetchDrivers();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await authService.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!departureTime || !arrivalTime) {
        throw new Error('Please select both departure and arrival times');
      }

      await tripHistoryService.updateTrip(
        token,
        tripId,
        {
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString(),
          driverId
        }
      );

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating trip:', err);
      setError(err instanceof Error ? err.message : 'Failed to update trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Edit Trip</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Driver Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Change Driver
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          {/* Departure Time */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Departure Time
            </label>
            <DatePicker
              selected={departureTime}
              onChange={(date) => setDepartureTime(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy HH:mm"
              timeFormat="HH:mm"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholderText="Select departure time"
            />
          </div>

          {/* Arrival Time */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Arrival Time
            </label>
            <DatePicker
              selected={arrivalTime}
              onChange={(date) => setArrivalTime(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy HH:mm"
              timeFormat="HH:mm"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholderText="Select arrival time"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditTripModal; 