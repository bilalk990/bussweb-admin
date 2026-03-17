import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Bus } from 'lucide-react';
import { busService } from '../../services/busService';
import LoadingOverlay from '../common/LoadingOverlay';

interface AssignBusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (busId: string) => void;
  driverId: string;
}

const AssignBusDialog = ({ isOpen, onClose, onAssign }: AssignBusDialogProps) => {
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const response = await busService.fetchNoDriverBuses();
        setBuses(response.data);
        if (response.data.length > 0) {
          setSelectedBusId(response.data[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch available buses');
        console.error('Error fetching buses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchBuses();
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedBusId) return;
    
    setIsLoading(true);
    try {
      await onAssign(selectedBusId);
      onClose();
    } catch (err) {
      setError('Failed to assign bus');
      console.error('Error assigning bus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-gray-900 p-3 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Dialog.Title className="text-base sm:text-xl font-semibold text-white">
              Assign Bus to Driver
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <LoadingOverlay isLoading={isLoading} />

          {error && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-900/30 text-red-400 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          {buses.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Bus size={36} className="mx-auto text-gray-600 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
              <p className="text-xs sm:text-sm text-gray-400">No available buses found</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
                {buses.map((bus) => (
                  <div
                    key={bus._id}
                    className={`p-2 sm:p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedBusId === bus._id
                        ? 'border-primary-500 bg-primary-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedBusId(bus._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-white">{bus.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{bus.plateNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-white">{bus.capacity} seats</p>
                        <p className="text-xs sm:text-sm text-gray-400 capitalize">{bus.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedBusId || isLoading}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary-500 text-xs sm:text-sm text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Bus
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AssignBusDialog; 