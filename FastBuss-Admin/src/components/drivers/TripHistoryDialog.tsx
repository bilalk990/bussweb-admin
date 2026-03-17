import { TripHistory } from '../../services/driverService';
import { X } from 'lucide-react';

interface TripHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripHistory: TripHistory[];
  driverName: string;
}

const TripHistoryDialog = ({ isOpen, onClose, tripHistory, driverName }: TripHistoryDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gray-800 rounded-lg p-3 sm:p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-xl font-semibold text-white">
            Trip History - {driverName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {tripHistory.length === 0 ? (
          <p className="text-gray-400 text-center py-3 sm:py-4 text-sm sm:text-base">No trip history available</p>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:-mx-6 px-3 sm:px-6">
            <table className="min-w-full divide-y divide-gray-700 text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Bus</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Route</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Distance</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {tripHistory.map((trip) => (
                  <tr key={trip._id}>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-[10px] sm:text-sm text-white">{trip.busName}</div>
                      <div className="text-[10px] sm:text-sm text-gray-400">{trip.busPlateNumber}</div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-[10px] sm:text-sm text-white">{trip.routeName}</div>
                      <div className="text-[10px] sm:text-sm text-gray-400">
                        {trip.origin} → {trip.destination}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-white">
                      {trip.distance} km
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-white">
                      €{trip.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistoryDialog; 