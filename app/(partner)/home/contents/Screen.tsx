"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MonitorPlay, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Users,
  AlertTriangle,
  X
} from "lucide-react";
import { 
  getMyTheater,
  getTheaterScreens,
  createScreen,
  updateScreen,
  deleteScreen,
  getScreenById,
  generateSeatLayout,
  calculateTotalSeats,
  validateSeatLayoutCapacity,
  getScreenTypeDisplay,
  getScreenStatusColor,
  type Screen as ScreenType,
  type ScreenCreateRequest,
  type TheaterResponse
} from '../../../apis/staff_screen.api';
import { toast } from 'sonner';

const Screen = () => {
  const [screens, setScreens] = useState<ScreenType[]>([]);
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<ScreenType | null>(null);
  const [screenToDelete, setScreenToDelete] = useState<{id: string, name: string} | null>(null);

  // Form states for modals
  const [formData, setFormData] = useState<ScreenCreateRequest>({
    name: '',
    seat_layout: [],
    capacity: 0,
    screen_type: 'standard'
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seat layout form states
  const [rows, setRows] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(12);
  const [seatType] = useState<'regular' | 'premium' | 'vip'>('regular');
  const [selectedSeatType, setSelectedSeatType] = useState<'regular' | 'premium' | 'vip'>('regular');

  // Fetch theater and screens
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get theater info first
      const theaterResponse = await getMyTheater();
      setTheater(theaterResponse);
      
      if (theaterResponse.result?._id) {
        // Get screens for this theater
        const screensResponse = await getTheaterScreens(
          theaterResponse.result._id,
          page,
          limit
        );
        
        setScreens(screensResponse.result.screens);
        setTotalPages(screensResponse.result.total_pages);
        setTotal(screensResponse.result.total);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle screen deletion
  const handleDeleteScreen = (screenId: string, screenName: string) => {
    setScreenToDelete({ id: screenId, name: screenName });
    setShowDeleteModal(true);
  };

  // Confirm delete screen
  const confirmDeleteScreen = async () => {
    if (!screenToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteScreen(screenToDelete.id);
      toast.success('Screen deleted successfully');
      setShowDeleteModal(false);
      setScreenToDelete(null);
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete screen';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel delete screen
  const cancelDeleteScreen = () => {
    setShowDeleteModal(false);
    setScreenToDelete(null);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Modal handlers
  const handleAddScreen = () => {
    const seatLayout = generateSeatLayout(rows, seatsPerRow, seatType);
    const capacity = calculateTotalSeats(seatLayout);
    
    setFormData({
      name: '',
      seat_layout: seatLayout,
      capacity,
      screen_type: 'standard'
    });
    setFormErrors([]);
    setIsSubmitting(false);
    setSelectedSeatType('regular'); // Initialize seat type selector
    setShowAddModal(true);
  };

  const handleEditScreen = async (screen: ScreenType) => {
    setSelectedScreen(screen);
    setFormData({
      name: screen.name,
      seat_layout: screen.seat_layout,
      capacity: screen.capacity,
      screen_type: screen.screen_type
    });
    setFormErrors([]);
    setIsSubmitting(false);
    setSelectedSeatType('regular'); // Reset to default
    setRows(screen.seat_layout.length);
    setSeatsPerRow(screen.seat_layout[0]?.length || 0);
    setShowEditModal(true);
  };

  const handleViewDetails = async (screen: ScreenType) => {
    try {
      const response = await getScreenById(screen._id);
      setSelectedScreen(response.result);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch screen details';
      toast.error(errorMessage);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowDeleteModal(false);
    setSelectedScreen(null);
    setScreenToDelete(null);
    setFormErrors([]);
    setIsSubmitting(false);
  };

  // Handle screen operations success
  const handleScreenOperationSuccess = async () => {
    await fetchData(); // Refresh the list
  };

  // Form validation
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('Screen name is required');
    if (formData.capacity <= 0) errors.push('Capacity must be greater than 0');
    if (!validateSeatLayoutCapacity(formData.seat_layout, formData.capacity)) {
      errors.push('Capacity must match total number of seats in layout');
    }
    
    return errors;
  };

  // Handle form submission for creating screen
  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!theater?.result?._id) {
      toast.error('Theater information not available');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);
      
      await createScreen(theater.result._id, formData);
      toast.success('Screen created successfully');
      closeModals();
      handleScreenOperationSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create screen';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for updating screen
  const handleUpdateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedScreen) {
      toast.error('Screen information not available');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);
      
      await updateScreen(selectedScreen._id, formData);
      toast.success('Screen updated successfully');
      closeModals();
      handleScreenOperationSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update screen';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (field: keyof ScreenCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  // Update seat layout when parameters change
  const updateSeatLayout = () => {
    const seatLayout = generateSeatLayout(rows, seatsPerRow, seatType);
    const capacity = calculateTotalSeats(seatLayout);
    
    handleFormChange('seat_layout', seatLayout);
    handleFormChange('capacity', capacity);
  };

  // Interactive seat layout manipulation
  const toggleSeat = (rowIndex: number, seatIndex: number) => {
    const newLayout = [...formData.seat_layout];
    const currentSeat = newLayout[rowIndex][seatIndex];
    
    if (currentSeat.status === 'active') {
      // Remove seat
      newLayout[rowIndex][seatIndex] = {
        ...currentSeat,
        status: 'inactive'
      };
    } else {
      // Add seat
      newLayout[rowIndex][seatIndex] = {
        ...currentSeat,
        status: 'active',
        type: selectedSeatType
      };
    }
    
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
  };

  // Change seat type for active seats
  const changeSeatType = (rowIndex: number, seatIndex: number, newType: 'regular' | 'premium' | 'vip') => {
    const newLayout = [...formData.seat_layout];
    if (newLayout[rowIndex][seatIndex].status === 'active') {
      newLayout[rowIndex][seatIndex] = {
        ...newLayout[rowIndex][seatIndex],
        type: newType
      };
      handleFormChange('seat_layout', newLayout);
    }
  };

  // Add or remove entire row
  const addRow = () => {
    if (formData.seat_layout.length >= 26) return; // Max 26 rows (A-Z)
    
    const newRowLetter = String.fromCharCode(65 + formData.seat_layout.length); // A, B, C...
    const newRow = Array.from({ length: seatsPerRow }, (_, index) => ({
      row: newRowLetter,
      number: index + 1,
      type: selectedSeatType,
      status: 'active' as const
    }));
    
    const newLayout = [...formData.seat_layout, newRow];
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setRows(newLayout.length);
  };

  const removeRow = () => {
    if (formData.seat_layout.length <= 1) return; // Keep at least one row
    
    const newLayout = formData.seat_layout.slice(0, -1);
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setRows(newLayout.length);
  };

  // Add or remove seats from all rows
  const addSeatToAllRows = () => {
    const maxSeats = Math.max(...formData.seat_layout.map(row => row.length));
    if (maxSeats >= 50) return; // Max 50 seats per row
    
    const newLayout = formData.seat_layout.map(row => {
      const newSeat = {
        row: row[0].row,
        number: row.length + 1,
        type: selectedSeatType,
        status: 'active' as const
      };
      return [...row, newSeat];
    });
    
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setSeatsPerRow(newLayout[0]?.length || 0);
  };

  const removeSeatFromAllRows = () => {
    const minSeats = Math.min(...formData.seat_layout.map(row => row.length));
    if (minSeats <= 1) return; // Keep at least one seat per row
    
    const newLayout = formData.seat_layout.map(row => row.slice(0, -1));
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setSeatsPerRow(newLayout[0]?.length || 0);
  };

  // Reset layout to default grid
  const resetLayout = () => {
    const seatLayout = generateSeatLayout(rows, seatsPerRow, selectedSeatType);
    const capacity = calculateTotalSeats(seatLayout);
    
    handleFormChange('seat_layout', seatLayout);
    handleFormChange('capacity', capacity);
  };

  // Get seat style based on type and status
  const getSeatStyle = (seat: any) => {
    if (seat.status === 'inactive') {
      return 'bg-slate-600/30 border-slate-500/50 text-slate-500 cursor-pointer hover:bg-slate-500/50';
    }
    
    switch (seat.type) {
      case 'premium':
        return 'bg-blue-500/80 border-blue-400/50 text-white cursor-pointer hover:bg-blue-400/80';
      case 'vip':
        return 'bg-purple-500/80 border-purple-400/50 text-white cursor-pointer hover:bg-purple-400/80';
      default:
        return 'bg-green-500/80 border-green-400/50 text-white cursor-pointer hover:bg-green-400/80';
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [page]);

  // Update seat layout when parameters change (for initial generation only)
  useEffect(() => {
    if (showAddModal && formData.seat_layout.length === 0) {
      updateSeatLayout();
    }
  }, [rows, seatsPerRow, seatType, showAddModal]);

  return (
    <div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Screen Management</h2>
            <p className="text-slate-400 text-sm">
              {theater?.result ? `${theater.result.name} - ${total} screen${total !== 1 ? 's' : ''} found` : 'Loading theater info...'}
            </p>
          </div>
          <motion.button
            onClick={handleAddScreen}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || !theater?.result}
          >
            <Plus size={18} className="mr-2" />
            Add Screen
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search screens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-red-400 mr-2" />
              <p className="text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-700/50 rounded" />
                  <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-slate-700/50 rounded" />
                    <div className="h-16 bg-slate-700/50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Screens Grid */}
            {screens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screens.map((screen, index) => (
                  <motion.div
                    key={screen._id}
                    className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-orange-500/20 hover:shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mr-3">
                            <MonitorPlay size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                              {screen.name}
                            </h3>
                            <p className="text-slate-400 text-sm">{getScreenTypeDisplay(screen.screen_type)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getScreenStatusColor(screen.status)}`}>
                          {screen.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-700/30 p-3 rounded-lg">
                          <p className="text-slate-400 text-xs">Capacity</p>
                          <div className="flex items-center">
                            <Users size={14} className="text-orange-400 mr-1" />
                            <span className="text-white font-bold">
                              {screen.capacity}
                            </span>
                            <span className="text-slate-400 text-xs ml-1">seats</span>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 p-3 rounded-lg">
                          <p className="text-slate-400 text-xs">Layout</p>
                          <p className="text-orange-400 font-bold text-sm">
                            {screen.seat_layout.length} rows
                          </p>
                        </div>
                      </div>

                      {screen.statistics && (
                        <div className="bg-slate-700/30 p-3 rounded-lg mb-4">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Showtimes</span>
                            <span className="text-white font-medium">{screen.statistics.total_showtimes}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Active Bookings</span>
                            <span className="text-white font-medium">{screen.statistics.active_bookings}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleEditScreen(screen)}
                          className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleViewDetails(screen)}
                          className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Eye size={14} className="mr-1" />
                          Details
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteScreen(screen._id, screen.name)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !loading && (
                <motion.div
                  className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MonitorPlay size={64} className="text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Screens Found
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {searchTerm 
                      ? "No screens match your search criteria. Try adjusting your search."
                      : "You haven't created any screens yet. Create your first screen to get started."
                    }
                  </p>
                  <motion.button
                    onClick={handleAddScreen}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!theater?.result}
                  >
                    <Plus size={18} className="mr-2" />
                    Add Screen
                  </motion.button>
                </motion.div>
              )
            )}

            {/* Pagination */}
            {screens.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Add Screen Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Add New Screen</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateScreen} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle size={20} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-medium mb-2">Please fix the following errors:</p>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Screen Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                      placeholder="Enter screen name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Screen Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.screen_type}
                      onChange={(e) => handleFormChange('screen_type', e.target.value as any)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="imax">IMAX</option>
                      <option value="dolby">Dolby Atmos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Total Capacity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.capacity || ''}
                      readOnly
                      className="w-full bg-slate-700/30 border border-slate-600 rounded-lg px-4 py-2 text-slate-300"
                      placeholder="Auto-calculated from seat layout"
                    />
                    <p className="text-slate-400 text-xs mt-1">Automatically calculated from seat layout</p>
                  </div>

                  {/* Seat Type Selector */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Seat Type for New Seats
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['regular', 'premium', 'vip'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedSeatType(type)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            selectedSeatType === type
                              ? type === 'regular' 
                                ? 'bg-green-500 text-white'
                                : type === 'premium'
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-500 text-white'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                          }`}
                          disabled={isSubmitting}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Layout Controls */}
                  <div className="bg-slate-700/30 p-4 rounded-lg space-y-3">
                    <h5 className="text-white font-medium">Quick Layout Controls</h5>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addRow}
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || formData.seat_layout.length >= 26}
                      >
                        + Add Row
                      </button>
                      <button
                        type="button"
                        onClick={removeRow}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || formData.seat_layout.length <= 1}
                      >
                        - Remove Row
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addSeatToAllRows}
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || (formData.seat_layout[0]?.length || 0) >= 50}
                      >
                        + Add Column
                      </button>
                      <button
                        type="button"
                        onClick={removeSeatFromAllRows}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || (formData.seat_layout[0]?.length || 0) <= 1}
                      >
                        - Remove Column
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={resetLayout}
                      className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Reset Layout
                    </button>
                  </div>
                </div>

                {/* Interactive Seat Layout Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Interactive Seat Layout</h4>
                    <div className="text-sm text-slate-400">
                      {formData.seat_layout.length} × {formData.seat_layout[0]?.length || 0} = {formData.capacity} seats
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs mb-2">Click seats to toggle, right-click to change type</p>
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500/80 rounded mr-1"></div>
                        <span className="text-slate-300">Regular</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500/80 rounded mr-1"></div>
                        <span className="text-slate-300">Premium</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500/80 rounded mr-1"></div>
                        <span className="text-slate-300">VIP</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-slate-600/30 border border-slate-500/50 rounded mr-1"></div>
                        <span className="text-slate-300">Disabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Layout Grid */}
                  <div className="bg-slate-700/30 p-4 rounded-lg max-h-80 overflow-auto">
                    {/* Screen indicator */}
                    <div className="text-center mb-4">
                      <div className="bg-slate-600 text-white text-xs px-6 py-2 rounded-lg inline-block">
                        🎬 SCREEN
                      </div>
                    </div>
                    
                    {/* Seat grid */}
                    <div className="space-y-1">
                      {formData.seat_layout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex items-center justify-center gap-1">
                          {/* Row label */}
                          <span className="text-slate-400 text-sm w-6 text-center font-medium">
                            {row[0]?.row}
                          </span>
                          
                          {/* Seats in row */}
                          <div className="flex gap-1">
                            {row.map((seat, seatIndex) => (
                              <button
                                key={seatIndex}
                                type="button"
                                onClick={() => toggleSeat(rowIndex, seatIndex)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  if (seat.status === 'active') {
                                    const types: ('regular' | 'premium' | 'vip')[] = ['regular', 'premium', 'vip'];
                                    const currentIndex = types.indexOf(seat.type);
                                    const nextType = types[(currentIndex + 1) % types.length];
                                    changeSeatType(rowIndex, seatIndex, nextType);
                                  }
                                }}
                                className={`w-6 h-6 rounded text-xs font-medium border transition-all duration-200 ${getSeatStyle(seat)}`}
                                title={`${seat.row}${seat.number} - ${seat.type} - ${seat.status === 'active' ? 'Available' : 'Disabled'}\nLeft click: Toggle seat\nRight click: Change type`}
                                disabled={isSubmitting}
                              >
                                {seat.number}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {formData.seat_layout.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No seats configured</p>
                        <button
                          type="button"
                          onClick={() => {
                            const seatLayout = generateSeatLayout(8, 12, selectedSeatType);
                            const capacity = calculateTotalSeats(seatLayout);
                            handleFormChange('seat_layout', seatLayout);
                            handleFormChange('capacity', capacity);
                          }}
                          className="mt-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded text-sm transition-colors"
                          disabled={isSubmitting}
                        >
                          Generate Default Layout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="mr-2" />
                      Create Screen
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Screen Modal */}
      {showEditModal && selectedScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Edit Screen</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateScreen} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle size={20} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-medium mb-2">Please fix the following errors:</p>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Screen Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                      placeholder="Enter screen name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Screen Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.screen_type}
                      onChange={(e) => handleFormChange('screen_type', e.target.value as any)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="imax">IMAX</option>
                      <option value="dolby">Dolby Atmos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Total Capacity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.capacity || ''}
                      readOnly
                      className="w-full bg-slate-700/30 border border-slate-600 rounded-lg px-4 py-2 text-slate-300"
                      placeholder="Auto-calculated from seat layout"
                    />
                    <p className="text-slate-400 text-xs mt-1">Automatically calculated from seat layout</p>
                  </div>

                  {/* Seat Type Selector */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Seat Type for New Seats
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['regular', 'premium', 'vip'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedSeatType(type)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            selectedSeatType === type
                              ? type === 'regular' 
                                ? 'bg-green-500 text-white'
                                : type === 'premium'
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-500 text-white'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                          }`}
                          disabled={isSubmitting}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Layout Controls */}
                  <div className="bg-slate-700/30 p-4 rounded-lg space-y-3">
                    <h5 className="text-white font-medium">Quick Layout Controls</h5>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addRow}
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || formData.seat_layout.length >= 26}
                      >
                        + Add Row
                      </button>
                      <button
                        type="button"
                        onClick={removeRow}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || formData.seat_layout.length <= 1}
                      >
                        - Remove Row
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addSeatToAllRows}
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || (formData.seat_layout[0]?.length || 0) >= 50}
                      >
                        + Add Column
                      </button>
                      <button
                        type="button"
                        onClick={removeSeatFromAllRows}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                        disabled={isSubmitting || (formData.seat_layout[0]?.length || 0) <= 1}
                      >
                        - Remove Column
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={resetLayout}
                      className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-2 rounded text-sm font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Reset to Default Grid
                    </button>
                  </div>
                </div>

                {/* Interactive Seat Layout Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Interactive Seat Layout</h4>
                    <div className="text-sm text-slate-400">
                      {formData.seat_layout.length} × {formData.seat_layout[0]?.length || 0} = {formData.capacity} seats
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs mb-2">Click seats to toggle, right-click to change type</p>
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500/80 rounded mr-1"></div>
                        <span className="text-slate-300">Regular</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500/80 rounded mr-1"></div>
                        <span className="text-slate-300">Premium</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500/80 rounded mr-1"></div>
                        <span className="text-slate-300">VIP</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-slate-600/30 border border-slate-500/50 rounded mr-1"></div>
                        <span className="text-slate-300">Disabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Layout Grid */}
                  <div className="bg-slate-700/30 p-4 rounded-lg max-h-80 overflow-auto">
                    {/* Screen indicator */}
                    <div className="text-center mb-4">
                      <div className="bg-slate-600 text-white text-xs px-6 py-2 rounded-lg inline-block">
                        🎬 SCREEN
                      </div>
                    </div>
                    
                    {/* Seat grid */}
                    <div className="space-y-1">
                      {formData.seat_layout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex items-center justify-center gap-1">
                          {/* Row label */}
                          <span className="text-slate-400 text-sm w-6 text-center font-medium">
                            {row[0]?.row}
                          </span>
                          
                          {/* Seats in row */}
                          <div className="flex gap-1">
                            {row.map((seat, seatIndex) => (
                              <button
                                key={seatIndex}
                                type="button"
                                onClick={() => toggleSeat(rowIndex, seatIndex)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  if (seat.status === 'active') {
                                    const types: ('regular' | 'premium' | 'vip')[] = ['regular', 'premium', 'vip'];
                                    const currentIndex = types.indexOf(seat.type);
                                    const nextType = types[(currentIndex + 1) % types.length];
                                    changeSeatType(rowIndex, seatIndex, nextType);
                                  }
                                }}
                                className={`w-6 h-6 rounded text-xs font-medium border transition-all duration-200 ${getSeatStyle(seat)}`}
                                title={`${seat.row}${seat.number} - ${seat.type} - ${seat.status === 'active' ? 'Available' : 'Disabled'}\nLeft click: Toggle seat\nRight click: Change type`}
                                disabled={isSubmitting}
                              >
                                {seat.number}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {formData.seat_layout.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No seats configured</p>
                        <button
                          type="button"
                          onClick={() => {
                            const seatLayout = generateSeatLayout(8, 12, selectedSeatType);
                            const capacity = calculateTotalSeats(seatLayout);
                            handleFormChange('seat_layout', seatLayout);
                            handleFormChange('capacity', capacity);
                          }}
                          className="mt-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded text-sm transition-colors"
                          disabled={isSubmitting}
                        >
                          Generate Default Layout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit size={18} className="mr-2" />
                      Update Screen
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Screen Details Modal */}
      {showDetailsModal && selectedScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Screen Details</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-slate-700/30 p-6 rounded-xl text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MonitorPlay size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{selectedScreen.name}</h2>
                    <p className="text-slate-400">{getScreenTypeDisplay(selectedScreen.screen_type)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-3 ${getScreenStatusColor(selectedScreen.status)}`}>
                      {selectedScreen.status}
                    </span>
                  </div>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">Capacity</p>
                      <p className="text-white font-bold text-lg">{selectedScreen.capacity} seats</p>
                    </div>
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">Layout</p>
                      <p className="text-white font-bold text-lg">{selectedScreen.seat_layout.length} rows</p>
                    </div>
                  </div>

                  {selectedScreen.theater && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Theater Information</p>
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <h4 className="text-white font-semibold">{selectedScreen.theater.name}</h4>
                        <p className="text-slate-400 text-sm">{selectedScreen.theater.address}</p>
                        <p className="text-slate-400 text-sm">{selectedScreen.theater.city}</p>
                      </div>
                    </div>
                  )}

                  {selectedScreen.statistics && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Statistics</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                          <p className="text-slate-400 text-xs">Total Showtimes</p>
                          <p className="text-white font-bold">{selectedScreen.statistics.total_showtimes}</p>
                        </div>
                        <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                          <p className="text-slate-400 text-xs">Upcoming</p>
                          <p className="text-white font-bold">{selectedScreen.statistics.upcoming_showtimes}</p>
                        </div>
                        <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                          <p className="text-slate-400 text-xs">Active Bookings</p>
                          <p className="text-white font-bold">{selectedScreen.statistics.active_bookings}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Seat Layout Preview</p>
                    <div className="bg-slate-700/30 p-4 rounded-lg max-h-64 overflow-auto">
                      <div className="text-center mb-4">
                        <div className="bg-slate-600 text-white text-xs px-4 py-1 rounded inline-block">SCREEN</div>
                      </div>
                      <div className="space-y-1">
                        {selectedScreen.seat_layout.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex justify-center gap-1">
                            <span className="text-slate-400 text-xs w-6 text-center">{row[0]?.row}</span>
                            {row.map((seat, seatIndex) => (
                              <div
                                key={seatIndex}
                                className={`w-4 h-4 rounded text-xs flex items-center justify-center ${
                                  seat.status === 'active' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                                title={`${seat.row}${seat.number} - ${seat.type} - ${seat.status}`}
                              >
                                {seat.number}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && screenToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-400" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Delete Screen
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Are you sure you want to delete "{screenToDelete.name}"? This action cannot be undone and will permanently remove the screen and all associated data.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteScreen}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteScreen}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete Screen
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Screen;
