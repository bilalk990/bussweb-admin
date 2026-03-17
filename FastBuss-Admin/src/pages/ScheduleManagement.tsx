import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarClock, 
  Bus, 
  Users, 
  Clock, 
  Search, 
  Filter,
  ChevronDown,
  AlertCircle,
  Plus,
  Timer,
  Map,
  User,
  X,
  MapPin
} from 'lucide-react';
import { 
  tripHistoryService, 
  TripHistory,
  Route,
  Driver,
  CreateScheduleRequest
} from '../services/tripHistoryService';
import { authService } from '../services/authService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import TripDetailsModal from '../components/schedule/TripDetailsModal';
import EditTripModal from '../components/schedule/EditTripModal';
import LocationInput from '../components/common/LocationInput';

const ScheduleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeView, setActiveView] = useState<'timeline' | 'grid'>('grid');
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState<TripHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New schedule form states
  const [showNewScheduleForm, setShowNewScheduleForm] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState<CreateScheduleRequest>({
    routeId: '',
    driverId: '',
    departureTime: '',
    arrivalTime: '',
    departureBusStation: '',
    arrivalBusStation: '',
    stops: []
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<{
    id: string;
    departureTime: string;
    arrivalTime: string;
    driverId: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        if (!token) {
          setError('Authentication token not found. Please login again.');
          setLoading(false);
          return;
        }

        const [schedulesResponse, routesResponse, driversResponse] = await Promise.all([
          tripHistoryService.getTripHistory(),
          tripHistoryService.getAllRoutes(),
          tripHistoryService.getAvailableDrivers()
        ]);

        setSchedules(schedulesResponse.data);
        setRoutes(routesResponse.data);
        setDrivers(driversResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch routes and drivers when form is opened
  useEffect(() => {
    const fetchFormData = async () => {
      if (!showNewScheduleForm) return;

      try {
        setIsFormLoading(true);
        const token = authService.getToken();
        if (!token) {
          setFormError('Authentication token not found. Please login again.');
          return;
        }

        const [routesResponse, driversResponse] = await Promise.all([
          tripHistoryService.getAllRoutes(),
          tripHistoryService.getAvailableDrivers()
        ]);

        setRoutes(routesResponse.data);
        setDrivers(driversResponse.data);
        setFormError(null);
      } catch (err) {
        setFormError('Failed to load form data. Please try again.');
        console.error('Error loading form data:', err);
      } finally {
        setIsFormLoading(false);
      }
    };

    fetchFormData();
  }, [showNewScheduleForm]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          location: '',
          arrivalTime: '',
          departureTime: ''
        }
      ]
    }));
  };

  const removeStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const updateStop = (index: number, field: 'location' | 'arrivalTime' | 'departureTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => 
        i === index ? { ...stop, [field]: value } : stop
      )
    }));
  };

  const handleCreateSchedule = async () => {
    if (isCreating) return; // Prevent double-clicking
    
    try {
      setIsCreating(true);
      setFormError(null);
      const token = authService.getToken();
      if (!token) {
        setFormError('Authentication token not found. Please login again.');
        return;
      }

      // Validate form data
      if (!formData.routeId || !formData.driverId || !formData.departureTime || !formData.arrivalTime || 
          !formData.departureBusStation || !formData.arrivalBusStation) {
        setFormError('Please fill in all fields');
        return;
      }

      // Format the data for submission
      const scheduleData = {
        routeId: formData.routeId,
        driverId: formData.driverId,
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
        departureBusStation: formData.departureBusStation,
        arrivalBusStation: formData.arrivalBusStation,
        stops: formData.stops.map(stop => ({
          location: stop.location,
          arrivalTime: new Date(stop.arrivalTime).toISOString(),
          departureTime: new Date(stop.departureTime).toISOString()
        }))
      };

      await tripHistoryService.createSchedule(token, scheduleData);
      
      // Refresh schedules
      const response = await tripHistoryService.getTripHistory();
      setSchedules(response.data);
      
      // Reset form
      setFormData({
        routeId: '',
        driverId: '',
        departureTime: '',
        arrivalTime: '',
        departureBusStation: '',
        arrivalBusStation: '',
        stops: []
      });
      setShowNewScheduleForm(false);
    } catch (err) {
      setFormError('Failed to create schedule. Please try again.');
      console.error('Error creating schedule:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Calculate schedule statistics
  const totalSchedules = schedules.length;
  const inProgressSchedules = schedules.filter(s => s.status === 'in-progress').length;
  const upcomingSchedules = schedules.filter(s => s.status === 'pending').length;
  const completedSchedules = schedules.filter(s => s.status === 'completed').length;

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.routeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-primary-900/60 text-primary-400';
      case 'pending':
        return 'bg-success-900/60 text-success-400';
      case 'completed':
        return 'bg-gray-900/60 text-gray-400';
      case 'cancelled':
        return 'bg-warning-900/60 text-warning-400';
      default:
        return 'bg-gray-900/60 text-gray-400';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTimeDifference = (dateString: string) => {
    const scheduleTime = new Date(dateString);
    const diff = scheduleTime.getTime() - currentTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (diff < 0) return 'In Progress';
    if (hours > 0) return `In ${hours}h ${remainingMinutes}m`;
    return `In ${minutes}m`;
  };

  const handleViewClick = (tripId: string) => {
    setSelectedTripId(tripId);
  };

  const handleEditClick = (trip: TripHistory) => {
    setEditingTrip({
      id: trip._id,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      driverId: trip.driverId || ''
    });
  };

  const handleTripUpdate = async () => {
    try {
      const response = await tripHistoryService.getTripHistory();
      setSchedules(response.data);
    } catch (err) {
      console.error('Error refreshing trips:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
          <p className="text-warning-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Schedule Management</h1>
          <div className="flex items-center gap-2">
            <button
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeView === 'timeline'
                  ? 'bg-primary-900 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveView('timeline')}
            >
              Timeline
            </button>
            <button
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeView === 'grid'
                  ? 'bg-primary-900 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveView('grid')}
            >
              Grid
            </button>
          </div>
        </div>
        <button 
          className="btn-primary flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
          onClick={() => setShowNewScheduleForm(true)}
        >
          <Plus size={14} className="sm:w-4 sm:h-4" />
          New Schedule
        </button>
      </div>

      {/* New Schedule Form Modal */}
      <AnimatePresence>
        {showNewScheduleForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-lg p-3 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-4"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-6">
                <h2 className="text-base sm:text-xl font-semibold text-white">Create New Schedule</h2>
                <button
                  onClick={() => setShowNewScheduleForm(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-warning-900/50 text-warning-400 rounded-md text-xs sm:text-sm">
                  {formError}
                </div>
              )}

              {isFormLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4 overflow-y-auto flex-1 pr-1 sm:pr-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
                      Route
                    </label>
                    <select
                      value={formData.routeId}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 pr-8 sm:pr-10 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      <option value="">Select a route</option>
                      {routes.map((route) => (
                        <option key={route._id} value={route._id}>
                          {route.routeName} ({route.origin} → {route.destination})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
                      Driver
                    </label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 pr-8 sm:pr-10 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      <option value="">Select a driver</option>
                      {drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.name} ({driver.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
                      Departure Bus Station
                    </label>
                    <input
                      type="text"
                      value={formData.departureBusStation}
                      onChange={(e) => setFormData({ ...formData, departureBusStation: e.target.value })}
                      placeholder="Enter departure bus station"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
                      Arrival Bus Station
                    </label>
                    <input
                      type="text"
                      value={formData.arrivalBusStation}
                      onChange={(e) => setFormData({ ...formData, arrivalBusStation: e.target.value })}
                      placeholder="Enter arrival bus station"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
                      Departure Time
                    </label>
                    <DatePicker
                      selected={formData.departureTime ? new Date(formData.departureTime) : null}
                      onChange={(date: Date | null) => setFormData({ ...formData, departureTime: date?.toISOString() || '' })}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy HH:mm"
                      timeFormat="HH:mm"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholderText="Select departure time"
                      timeIntervals={15}
                      showPopperArrow={false}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
                      Arrival Time
                    </label>
                    <DatePicker
                      selected={formData.arrivalTime ? new Date(formData.arrivalTime) : null}
                      onChange={(date: Date | null) => setFormData({ ...formData, arrivalTime: date?.toISOString() || '' })}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy HH:mm"
                      timeFormat="HH:mm"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholderText="Select arrival time"
                      timeIntervals={15}
                      showPopperArrow={false}
                    />
                  </div>

                  {/* Stops Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs sm:text-sm font-medium text-gray-400">
                        Stops
                      </label>
                      <button
                        type="button"
                        onClick={addStop}
                        className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-xs sm:text-sm"
                      >
                        <Plus size={14} className="w-3 h-3 sm:w-4 sm:h-4" />
                        Add Stop
                      </button>
                    </div>

                    {formData.stops.map((stop, index) => (
                      <div key={index} className="space-y-2 p-2 sm:p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs sm:text-sm font-medium text-gray-400">Stop {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeStop(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X size={14} className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <LocationInput
                            value={stop.location}
                            onChange={(value) => updateStop(index, 'location', value)}
                            placeholder="Enter location"
                            className="w-full"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <DatePicker
                              selected={stop.arrivalTime ? new Date(stop.arrivalTime) : null}
                              onChange={(date: Date | null) => updateStop(index, 'arrivalTime', date?.toISOString() || '')}
                              showTimeSelect
                              dateFormat="HH:mm"
                              timeFormat="HH:mm"
                              placeholderText="Arrival Time"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                              timeIntervals={15}
                              required
                            />
                            <DatePicker
                              selected={stop.departureTime ? new Date(stop.departureTime) : null}
                              onChange={(date: Date | null) => updateStop(index, 'departureTime', date?.toISOString() || '')}
                              showTimeSelect
                              dateFormat="HH:mm"
                              timeFormat="HH:mm"
                              placeholderText="Departure Time"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                              timeIntervals={15}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <button
                      onClick={() => setShowNewScheduleForm(false)}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-white"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateSchedule}
                      className="btn-primary text-xs sm:text-sm flex items-center gap-2"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Schedule'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div 
          className="glass-card p-3 sm:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary-900/60 rounded-md">
              <CalendarClock size={16} className="text-primary-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Schedules</p>
              <p className="text-lg sm:text-xl font-semibold text-white">{totalSchedules}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-3 sm:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-success-900/60 rounded-md">
              <Bus size={16} className="text-success-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">In Progress</p>
              <p className="text-lg sm:text-xl font-semibold text-white">{inProgressSchedules}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-3 sm:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-secondary-900/60 rounded-md">
              <Clock size={16} className="text-secondary-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Upcoming</p>
              <p className="text-lg sm:text-xl font-semibold text-white">{upcomingSchedules}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-3 sm:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-accent-900/60 rounded-md">
              <Users size={16} className="text-accent-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Completed</p>
              <p className="text-lg sm:text-xl font-semibold text-white">{completedSchedules}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        className="glass-card p-3 sm:p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:pl-10 sm:pr-4 sm:py-2 bg-gray-900/50 border border-gray-800 rounded-md text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900/50 border border-gray-800 rounded-md text-sm sm:text-base text-white px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Timeline View */}
      <AnimatePresence mode="wait">
        {activeView === 'timeline' ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 sm:space-y-4"
          >
            {filteredSchedules.map((schedule, index) => (
              <motion.div
                key={schedule._id}
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div 
                  className="p-3 sm:p-4 cursor-pointer"
                  onClick={() => setSelectedSchedule(selectedSchedule === schedule._id ? null : schedule._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-1.5 sm:p-2 bg-primary-900/60 rounded-md">
                        <Bus size={16} className="text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">{schedule.busName}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{schedule.routeName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {schedule.status.replace('-', ' ').charAt(0).toUpperCase() + schedule.status.slice(1)}
                      </span>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 ${
                          selectedSchedule === schedule._id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedSchedule === schedule._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-800"
                    >
                      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Timer size={14} />
                              <span className="text-xs sm:text-sm">Schedule Time</span>
                            </div>
                            <p className="text-sm sm:text-base text-white">
                              {formatTime(schedule.departureTime)} - {formatTime(schedule.arrivalTime)}
                            </p>
                            <p className="text-xs sm:text-sm text-primary-400">
                              {getTimeDifference(schedule.departureTime)}
                            </p>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2 text-gray-400">
                              <User size={14} />
                              <span className="text-xs sm:text-sm">Driver</span>
                            </div>
                            <p className="text-sm sm:text-base text-white">{schedule.driverName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-warning-400">
                          <AlertCircle size={14} />
                          <span className="text-xs sm:text-sm">Route: {schedule.origin} → {schedule.destination}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400">
                          <Map size={14} />
                          <span className="text-xs sm:text-sm">{schedule.origin} → {schedule.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin size={14} />
                          <span className="text-xs sm:text-sm">{schedule.stops} stops</span>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button className="btn-secondary text-xs sm:text-sm">View Details</button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(schedule);
                            }}
                            className="btn-primary text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {filteredSchedules.map((schedule, index) => (
              <motion.div
                key={schedule._id}
                className="glass-card p-3 sm:p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-primary-900/60 rounded-md">
                    <Bus size={16} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">{schedule.busName}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{schedule.routeName}</p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Timer size={14} />
                    <span className="text-xs sm:text-sm">{formatTime(schedule.departureTime)} - {formatTime(schedule.arrivalTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <User size={14} />
                    <span className="text-xs sm:text-sm">{schedule.driverName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Map size={14} />
                    <span className="text-xs sm:text-sm">{schedule.origin} → {schedule.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} />
                    <span className="text-xs sm:text-sm">{schedule.stops} stops</span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex items-center justify-between">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {schedule.status.replace('-', ' ').charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewClick(schedule._id)}
                      className="btn-secondary text-xs"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(schedule);
                      }}
                      className="btn-primary text-xs"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Details Modal */}
      <AnimatePresence>
        {selectedTripId && (
          <TripDetailsModal
            tripId={selectedTripId}
            onClose={() => setSelectedTripId(null)}
          />
        )}
      </AnimatePresence>

      {/* Edit Trip Modal */}
      <AnimatePresence>
        {editingTrip && (
          <EditTripModal
            tripId={editingTrip.id}
            initialDepartureTime={editingTrip.departureTime}
            initialArrivalTime={editingTrip.arrivalTime}
            initialDriverId={editingTrip.driverId}
            onClose={() => setEditingTrip(null)}
            onUpdate={handleTripUpdate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScheduleManagement; 