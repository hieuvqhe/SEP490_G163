/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Users,
  AlertTriangle,
  X,
  MonitorPlay,
} from "lucide-react";
import { toast } from "sonner";

// Import APIs
import {
  getMyShowtimes,
  createShowtime,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
  formatShowtimeDate,
  formatShowtimeTime,
  getShowtimeStatusDisplay,
  getShowtimeStatusColor,
  calculateShowtimeOccupancy,
  formatPrice,
  validateShowtimeData,
  generateTimeSlots,
  type Showtime,
  type ShowtimeCreateRequest,
  type ShowtimeStatus,
  ShowtimeStatusValues,
} from "../../../apis/showtime_staff.api";

import { getMyTheater, type TheaterResponse } from "../../../apis/staff.api";

import {
  searchAvailableMovies,
  getPopularMovies,
  getMovieById,
  formatMovieDuration,
  getMovieStatusDisplay,
  getMovieStatusColor,
  isMovieAvailableForShowtime,
  type StaffMovie,
  type MovieSearchParams,
} from "../../../apis/movie_staff.api";

import { getTheaterScreens, type Screen } from "../../../apis/staff_screen.api";

// Movie Select Item Component
interface MovieSelectItemProps {
  movie: StaffMovie;
  isSelected: boolean;
  onSelect: (movie: StaffMovie) => void;
}

const MovieSelectItem = ({
  movie,
  isSelected,
  onSelect,
}: MovieSelectItemProps) => (
  <div
    onClick={() => onSelect(movie)}
    className={`p-3 cursor-pointer border-b border-slate-600/50 last:border-b-0 transition-colors ${
      isSelected
        ? "bg-orange-500/20 border-orange-500/30"
        : "hover:bg-slate-600/30"
    }`}
  >
    <div className="flex items-center">
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="w-12 h-16 object-cover rounded mr-3"
        onError={(e) => {
          e.currentTarget.src = "/placeholder-movie.jpg";
        }}
      />
      <div className="flex-1">
        <h4 className="text-white font-medium">{movie.title}</h4>
        <p className="text-slate-400 text-sm">
          {formatMovieDuration(movie.duration)}
        </p>
        <p className="text-slate-400 text-xs">{movie.genre.join(", ")}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`px-2 py-1 rounded text-xs ${getMovieStatusColor(
              movie.status
            )}`}
          >
            {getMovieStatusDisplay(movie.status)}
          </span>
          <span className="text-slate-400 text-xs">
            ⭐ {movie.average_rating.toFixed(1)} ({movie.ratings_count})
          </span>
        </div>
      </div>
    </div>
  </div>
);

const Showtimes = () => {
  // State management
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Movie search states
  const [movieSearchTerm, setMovieSearchTerm] = useState("");
  const [movieLoading, setMovieLoading] = useState(false);
  const [popularMovies, setPopularMovies] = useState<StaffMovie[]>([]);
  const [searchResults, setSearchResults] = useState<StaffMovie[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    null
  );
  const [showtimeToDelete, setShowtimeToDelete] = useState<{
    id: string;
    movie: string;
  } | null>(null);

  // Form states for modals
  const [formData, setFormData] = useState<ShowtimeCreateRequest>({
    movie_id: "",
    screen_id: "",
    theater_id: "",
    start_time: "",
    end_time: "",
    price: { regular: 50000, premium: 70000 },
    available_seats: 0,
    status: ShowtimeStatusValues.SCHEDULED,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for create/edit
  const [selectedMovie, setSelectedMovie] = useState<StaffMovie | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [showDate, setShowDate] = useState("");
  const [showTime, setShowTime] = useState("");
  const [timeSlots] = useState(generateTimeSlots(8, 23, 30));

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get theater info first
      const theaterResponse = await getMyTheater();
      setTheater(theaterResponse);

      if (theaterResponse.result?._id) {
        // Get popular movies, screens, and showtimes in parallel
        const [popularMoviesResponse, screensResponse, showtimesResponse] =
          await Promise.all([
            getPopularMovies(20), // Get popular movies for quick selection
            getTheaterScreens(theaterResponse.result._id, 1, 100), // Get all screens
            getMyShowtimes(
              page,
              limit,
              undefined,
              undefined,
              undefined,
              undefined
            ),
          ]);

        setPopularMovies(popularMoviesResponse.result.movies);
        setScreens(screensResponse.result.screens);
        setShowtimes(showtimesResponse.result.showtimes);
        setTotalPages(showtimesResponse.result.total_pages);
        setTotal(showtimesResponse.result.total);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search movies function
  const searchMovies = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setMovieLoading(true);
      const params: MovieSearchParams = {
        search: searchTerm,
        limit: 10,
        status: "now_showing", // Only show movies that are currently showing or coming soon
      };

      const response = await searchAvailableMovies(params);
      setSearchResults(
        response.result.movies.filter(isMovieAvailableForShowtime)
      );
    } catch (err) {
      console.error("Error searching movies:", err);
      toast.error("Failed to search movies");
    } finally {
      setMovieLoading(false);
    }
  };

  // Helper function to format date for input fields
  const formatDateForInput = (
    dateString: string
  ): { date: string; time: string } => {
    const date = new Date(dateString);
    const formattedDate =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    const formattedTime =
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0");
    return { date: formattedDate, time: formattedTime };
  };

  // Helper function to create date from local date and time strings
  const createLocalDateTime = (date: string, time: string): Date => {
    return new Date(`${date}T${time}:00`);
  };

  // Handle form field changes
  const handleFormChange = (field: keyof ShowtimeCreateRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear related errors
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  // Handle movie selection
  const handleMovieSelect = (movie: StaffMovie) => {
    setSelectedMovie(movie);
    handleFormChange("movie_id", movie._id);

    // Auto-calculate end time when movie and start time are selected
    if (showDate && showTime && movie.duration) {
      const startDateTime = createLocalDateTime(showDate, showTime);
      const endDateTime = new Date(
        startDateTime.getTime() + movie.duration * 60 * 1000
      );
      handleFormChange("end_time", endDateTime.toISOString());
    }
  };

  // Handle screen selection
  const handleScreenSelect = (screen: Screen) => {
    setSelectedScreen(screen);
    handleFormChange("screen_id", screen._id);
    handleFormChange("available_seats", screen.capacity);
  };

  // Handle date and time changes
  const handleDateTimeChange = (date: string, time: string) => {
    setShowDate(date);
    setShowTime(time);

    if (date && time) {
      // Create date without timezone offset to maintain local time
      const startDateTime = createLocalDateTime(date, time);

      handleFormChange("start_time", startDateTime.toISOString());

      // Calculate end time if we have movie duration
      if (selectedMovie && selectedMovie.duration) {
        const endDateTime = new Date(
          startDateTime.getTime() + selectedMovie.duration * 60 * 1000
        );
        handleFormChange("end_time", endDateTime.toISOString());
      }
    }
  };

  // Check if showtime has any bookings
  const hasBookings = (showtime: Showtime): boolean => {
    // Check if booked_seats array exists and has any bookings
    if (showtime.booked_seats && showtime.booked_seats.length > 0) {
      return true;
    }

    // Fallback: Check if available seats is less than total capacity
    if (showtime.screen?.capacity) {
      const totalCapacity = showtime.screen.capacity;
      const availableSeats = showtime.available_seats;
      return availableSeats < totalCapacity;
    }

    return false;
  };

  // Check if showtime can be edited/deleted
  const canModifyShowtime = (showtime: Showtime): boolean => {
    // Cannot modify if it has bookings
    if (hasBookings(showtime)) return false;

    // Cannot modify if it's in the past
    const now = new Date();
    const showtimeStart = new Date(showtime.start_time);
    if (showtimeStart <= now) return false;

    // Cannot modify if status is completed or cancelled
    if (
      showtime.status === ShowtimeStatusValues.COMPLETED ||
      showtime.status === ShowtimeStatusValues.CANCELLED
    )
      return false;

    return true;
  };

  // Handle showtime deletion
  const handleDeleteShowtime = async (showtime: Showtime) => {
    try {
      // First, fetch the latest showtime data to get current booking status
      const latestShowtimeResponse = await getShowtimeById(showtime._id);
      const latestShowtime = latestShowtimeResponse.result;

      // Check if showtime can be modified with latest data
      if (!canModifyShowtime(latestShowtime)) {
        if (hasBookings(latestShowtime)) {
          toast.error("Cannot delete showtime with existing bookings");
        } else if (new Date(latestShowtime.start_time) <= new Date()) {
          toast.error("Cannot delete past showtimes");
        } else {
          toast.error("Cannot delete this showtime");
        }
        return;
      }

      setShowtimeToDelete({
        id: latestShowtime._id,
        movie: latestShowtime.movie?.title || "Unknown",
      });
      setShowDeleteModal(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch showtime details";
      toast.error(errorMessage);
    }
  };

  // Confirm delete showtime
  const confirmDeleteShowtime = async () => {
    if (!showtimeToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteShowtime(showtimeToDelete.id);
      toast.success("Showtime deleted successfully");
      setShowDeleteModal(false);
      setShowtimeToDelete(null);
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete showtime";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel delete showtime
  const cancelDeleteShowtime = () => {
    setShowDeleteModal(false);
    setShowtimeToDelete(null);
  };

  // Modal handlers
  const handleAddShowtime = () => {
    setFormData({
      movie_id: "",
      screen_id: "",
      theater_id: theater?.result?._id || "",
      start_time: "",
      end_time: "",
      price: { regular: 50000, premium: 70000 },
      available_seats: 0,
      status: ShowtimeStatusValues.SCHEDULED,
    });
    setSelectedMovie(null);
    setSelectedScreen(null);
    setShowDate("");
    setShowTime("");
    setFormErrors([]);
    setIsSubmitting(false);
    setShowAddModal(true);
  };

  const handleEditShowtime = async (showtime: Showtime) => {
    try {
      // First, fetch the latest showtime data to get current booking status
      const latestShowtimeResponse = await getShowtimeById(showtime._id);
      const latestShowtime = latestShowtimeResponse.result;

      // Check if showtime can be modified with latest data
      if (!canModifyShowtime(latestShowtime)) {
        if (hasBookings(latestShowtime)) {
          toast.error("Cannot edit showtime with existing bookings");
        } else if (new Date(latestShowtime.start_time) <= new Date()) {
          toast.error("Cannot edit past showtimes");
        } else {
          toast.error("Cannot edit this showtime");
        }
        return;
      }

      setSelectedShowtime(latestShowtime);
      setFormData({
        movie_id: latestShowtime.movie_id,
        screen_id: latestShowtime.screen_id,
        theater_id: latestShowtime.theater_id,
        start_time: latestShowtime.start_time,
        end_time: latestShowtime.end_time,
        price: latestShowtime.price,
        available_seats: latestShowtime.available_seats,
        status: latestShowtime.status,
      });

      // Fetch movie details and find screen
      const [movieResponse] = await Promise.all([
        getMovieById(latestShowtime.movie_id),
      ]);

      const screen = screens.find((s) => s._id === latestShowtime.screen_id);
      setSelectedMovie(movieResponse.result);
      setSelectedScreen(screen || null);

      // Set date and time from start_time - use local timezone
      const { date, time } = formatDateForInput(latestShowtime.start_time);
      setShowDate(date);
      setShowTime(time);

      setFormErrors([]);
      setIsSubmitting(false);
      setShowEditModal(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch showtime details";
      toast.error(errorMessage);
    }
  };

  const handleViewDetails = async (showtime: Showtime) => {
    try {
      const response = await getShowtimeById(showtime._id);
      setSelectedShowtime(response.result);
      setShowViewModal(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch showtime details";
      toast.error(errorMessage);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedShowtime(null);
    setShowtimeToDelete(null);
    setSelectedMovie(null);
    setSelectedScreen(null);
    setShowDate("");
    setShowTime("");
    setFormErrors([]);
    setIsSubmitting(false);
  };

  // Form validation
  const validateForm = (): string[] => {
    const errors = validateShowtimeData(formData);

    if (!selectedMovie) errors.push("Please select a movie");
    if (!selectedScreen) errors.push("Please select a screen");
    if (!showDate) errors.push("Please select a date");
    if (!showTime) errors.push("Please select a time");
    if (!formData.end_time) errors.push("End time is required");

    // Check if start time is in the future
    if (formData.start_time) {
      const startTime = new Date(formData.start_time);
      const now = new Date();
      if (startTime <= now) {
        errors.push("Start time must be in the future");
      }
    }

    // Check if end time is after start time
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      if (endTime <= startTime) {
        errors.push("End time must be after start time");
      }
    }

    return errors;
  };

  // Handle form submission for creating showtime
  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure end_time is calculated before validation
    if (selectedMovie && showDate && showTime && selectedMovie.duration) {
      const startDateTime = createLocalDateTime(showDate, showTime);
      const endDateTime = new Date(
        startDateTime.getTime() + selectedMovie.duration * 60 * 1000
      );
      handleFormChange("end_time", endDateTime.toISOString());

      // Update formData with latest end_time
      setFormData((prev) => ({
        ...prev,
        end_time: endDateTime.toISOString(),
      }));
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);

      // Prepare the final data to ensure all fields are included
      const showtimeData: ShowtimeCreateRequest = {
        movie_id: formData.movie_id,
        screen_id: formData.screen_id,
        theater_id: formData.theater_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        price: formData.price,
        available_seats: formData.available_seats,
      };

      // Debug log to check if end_time is included

      await createShowtime(showtimeData);
      toast.success("Showtime created successfully");
      closeModals();
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create showtime";
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for updating showtime
  const handleUpdateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure end_time is calculated before validation for update
    if (selectedMovie && showDate && showTime && selectedMovie.duration) {
      const startDateTime = createLocalDateTime(showDate, showTime);
      const endDateTime = new Date(
        startDateTime.getTime() + selectedMovie.duration * 60 * 1000
      );
      handleFormChange("end_time", endDateTime.toISOString());

      // Update formData with latest end_time
      setFormData((prev) => ({
        ...prev,
        end_time: endDateTime.toISOString(),
      }));
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedShowtime) {
      toast.error("Showtime information not available");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);

      const updateData = {
        start_time: formData.start_time,
        end_time: formData.end_time,
        price: formData.price,
        available_seats: formData.available_seats,
        status: formData.status,
      };

      // Debug log to check if end_time is included in update

      await updateShowtime(selectedShowtime._id, updateData);
      toast.success("Showtime updated successfully");
      closeModals();
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update showtime";
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [page]);

  // Filter showtimes based on search term
  const filteredShowtimes = showtimes.filter(
    (showtime) =>
      showtime.movie?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      showtime.screen?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
            <h2 className="text-2xl font-bold text-white">
              Showtime Management
            </h2>
            <p className="text-slate-400 text-sm">
              {theater?.result
                ? `${theater.result.name} - ${total} showtime${
                    total !== 1 ? "s" : ""
                  } found`
                : "Loading theater info..."}
            </p>
          </div>
          <motion.button
            onClick={handleAddShowtime}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || !theater?.result}
          >
            <Plus size={18} className="mr-2" />
            Add Showtime
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search showtimes by movie or screen..."
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
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Movie
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Screen
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Seats
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-700/50 animate-pulse"
                    >
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-24"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Showtimes Table */}
            {filteredShowtimes.length > 0 ? (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Movie
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Screen
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Date & Time
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Seats
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShowtimes.map((showtime, index) => (
                        <motion.tr
                          key={showtime._id}
                          className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {showtime.movie?.poster_url && (
                                <img
                                  src={showtime.movie.poster_url}
                                  alt={showtime.movie.title}
                                  className="w-12 h-16 object-cover rounded mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium text-white">
                                  {showtime.movie?.title || "Unknown Movie"}
                                </div>
                                <div className="text-sm text-slate-400">
                                  {showtime.movie?.genre?.join(", ")}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300">
                              {showtime.screen?.name}
                            </div>
                            <div className="text-sm text-slate-400">
                              Capacity: {showtime.screen?.capacity}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300">
                              {formatShowtimeDate(showtime.start_time)}
                            </div>
                            <div className="text-sm text-slate-400">
                              {formatShowtimeTime(showtime.start_time)} -{" "}
                              {formatShowtimeTime(showtime.end_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-orange-400 font-medium">
                              {formatPrice(showtime.price.regular)}
                            </div>
                            {showtime.price.premium && (
                              <div className="text-sm text-slate-400">
                                Premium: {formatPrice(showtime.price.premium)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300">
                              {showtime.available_seats}/
                              {showtime.screen?.capacity || 0}
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2 mt-1">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${calculateShowtimeOccupancy(
                                    showtime
                                  )}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getShowtimeStatusColor(
                                  showtime.status
                                )}`}
                              >
                                {getShowtimeStatusDisplay(showtime.status)}
                              </span>
                              {hasBookings(showtime) && (
                                <div className="flex items-center text-xs text-amber-400">
                                  <Users size={12} className="mr-1" />
                                  Has bookings
                                </div>
                              )}
                              {!canModifyShowtime(showtime) &&
                                !hasBookings(showtime) && (
                                  <div className="text-xs text-gray-400">
                                    {new Date(showtime.start_time) <= new Date()
                                      ? "Past showtime"
                                      : "Cannot modify"}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleEditShowtime(showtime)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-300 flex items-center ${
                                  canModifyShowtime(showtime)
                                    ? "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 cursor-pointer"
                                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                                whileHover={
                                  canModifyShowtime(showtime)
                                    ? { scale: 1.05 }
                                    : {}
                                }
                                whileTap={
                                  canModifyShowtime(showtime)
                                    ? { scale: 0.95 }
                                    : {}
                                }
                                disabled={!canModifyShowtime(showtime)}
                                title={
                                  !canModifyShowtime(showtime)
                                    ? hasBookings(showtime)
                                      ? "Cannot edit showtime with existing bookings"
                                      : new Date(showtime.start_time) <=
                                        new Date()
                                      ? "Cannot edit past showtimes"
                                      : "Cannot edit this showtime"
                                    : "Edit showtime"
                                }
                              >
                                <Edit size={14} className="mr-1" />
                                Edit
                              </motion.button>
                              <motion.button
                                onClick={() => handleViewDetails(showtime)}
                                className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-3 py-1 rounded text-sm font-medium transition-colors duration-300 flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteShowtime(showtime)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-300 ${
                                  canModifyShowtime(showtime)
                                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 cursor-pointer"
                                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                                whileHover={
                                  canModifyShowtime(showtime)
                                    ? { scale: 1.05 }
                                    : {}
                                }
                                whileTap={
                                  canModifyShowtime(showtime)
                                    ? { scale: 0.95 }
                                    : {}
                                }
                                disabled={!canModifyShowtime(showtime)}
                                title={
                                  !canModifyShowtime(showtime)
                                    ? hasBookings(showtime)
                                      ? "Cannot delete showtime with existing bookings"
                                      : new Date(showtime.start_time) <=
                                        new Date()
                                      ? "Cannot delete past showtimes"
                                      : "Cannot delete this showtime"
                                    : "Delete showtime"
                                }
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              !loading && (
                <motion.div
                  className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Calendar
                    size={64}
                    className="text-orange-400 mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Showtimes Found
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {searchTerm
                      ? "No showtimes match your search criteria. Try adjusting your search."
                      : "You haven't created any showtimes yet. Create your first showtime to get started."}
                  </p>
                  <motion.button
                    onClick={handleAddShowtime}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!theater?.result}
                  >
                    <Plus size={18} className="mr-2" />
                    Add Showtime
                  </motion.button>
                </motion.div>
              )
            )}

            {/* Pagination */}
            {filteredShowtimes.length > 0 && totalPages > 1 && (
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
                            ? "bg-orange-500 text-white"
                            : "bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60"
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

      {/* Add Showtime Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                Add New Showtime
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateShowtime} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle
                      size={20}
                      className="text-red-400 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-red-300 font-medium mb-2">
                        Please fix the following errors:
                      </p>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Movie Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Select Movie <span className="text-red-400">*</span>
                    </label>

                    {/* Movie Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          placeholder="Search movies..."
                          value={movieSearchTerm}
                          onChange={(e) => {
                            setMovieSearchTerm(e.target.value);
                            searchMovies(e.target.value);
                          }}
                          className="w-full bg-slate-700/30 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Movie Selection */}
                    <div className="max-h-48 overflow-y-auto bg-slate-700/30 rounded-lg border border-slate-600">
                      {movieLoading ? (
                        <div className="p-4 text-center text-slate-400">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400 mx-auto"></div>
                          <p className="mt-2">Searching movies...</p>
                        </div>
                      ) : (
                        <>
                          {/* Search Results */}
                          {movieSearchTerm && searchResults.length > 0 && (
                            <div>
                              <div className="px-3 py-2 bg-slate-600/50 text-slate-300 text-xs font-medium">
                                Search Results
                              </div>
                              {searchResults.map((movie) => (
                                <MovieSelectItem
                                  key={movie._id}
                                  movie={movie}
                                  isSelected={selectedMovie?._id === movie._id}
                                  onSelect={handleMovieSelect}
                                />
                              ))}
                            </div>
                          )}

                          {/* Popular Movies */}
                          {(!movieSearchTerm || searchResults.length === 0) && (
                            <div>
                              <div className="px-3 py-2 bg-slate-600/50 text-slate-300 text-xs font-medium">
                                Popular Movies
                              </div>
                              {popularMovies.map((movie) => (
                                <MovieSelectItem
                                  key={movie._id}
                                  movie={movie}
                                  isSelected={selectedMovie?._id === movie._id}
                                  onSelect={handleMovieSelect}
                                />
                              ))}
                            </div>
                          )}

                          {/* No Results */}
                          {movieSearchTerm &&
                            searchResults.length === 0 &&
                            !movieLoading && (
                              <div className="p-4 text-center text-slate-400">
                                <p>
                                  No movies found matching "{movieSearchTerm}"
                                </p>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Screen Selection */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Select Screen <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {screens.map((screen) => (
                        <div
                          key={screen._id}
                          onClick={() => handleScreenSelect(screen)}
                          className={`p-3 cursor-pointer rounded-lg border transition-colors ${
                            selectedScreen?._id === screen._id
                              ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                              : "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{screen.name}</h4>
                              <p className="text-sm opacity-70">
                                Capacity: {screen.capacity} seats
                              </p>
                            </div>
                            <MonitorPlay size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date, Time & Pricing */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Show Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={showDate}
                      onChange={(e) =>
                        handleDateTimeChange(e.target.value, showTime)
                      }
                      min={getMinDate()}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Show Time <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={showTime}
                      onChange={(e) =>
                        handleDateTimeChange(showDate, e.target.value)
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Configuration */}
                  <div className="space-y-3">
                    <label className="block text-slate-300 text-sm font-medium">
                      Ticket Pricing <span className="text-red-400">*</span>
                    </label>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Regular Seats
                      </label>
                      <input
                        type="number"
                        value={formData.price.regular}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            regular: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Price in VND"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Premium Seats
                      </label>
                      <input
                        type="number"
                        value={formData.price.premium}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            premium: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Price in VND"
                      />
                    </div>

                    {formData.price.vip !== undefined && (
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">
                          VIP Seats
                        </label>
                        <input
                          type="number"
                          value={formData.price.vip || 0}
                          onChange={(e) =>
                            handleFormChange("price", {
                              ...formData.price,
                              vip: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                          disabled={isSubmitting}
                          placeholder="Price in VND"
                        />
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedMovie && selectedScreen && showDate && showTime && (
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">
                        Showtime Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Movie:</span>{" "}
                          {selectedMovie.title}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Screen:</span>{" "}
                          {selectedScreen.name}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Duration:</span>{" "}
                          {selectedMovie.duration} minutes
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">
                            Available Seats:
                          </span>{" "}
                          {formData.available_seats}
                        </p>
                        {formData.end_time && (
                          <p className="text-slate-300">
                            <span className="text-slate-400">End Time:</span>{" "}
                            {formatShowtimeTime(formData.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Selection */}
              <div className="px-6 pb-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Showtime Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.status || ShowtimeStatusValues.SCHEDULED}
                    onChange={(e) =>
                      handleFormChange(
                        "status",
                        e.target.value as ShowtimeStatus
                      )
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value={ShowtimeStatusValues.SCHEDULED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.SCHEDULED)}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_OPEN}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_OPEN
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_CLOSED}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_CLOSED
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.CANCELLED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.CANCELLED)}
                    </option>
                    <option value={ShowtimeStatusValues.COMPLETED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.COMPLETED)}
                    </option>
                  </select>
                  <p className="text-slate-400 text-xs mt-1">
                    Set the initial status for this showtime
                  </p>
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
                      Create Showtime
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && showtimeToDelete && (
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
                    Delete Showtime
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Are you sure you want to delete the showtime for "
                    {showtimeToDelete.movie}"? This action cannot be undone and
                    will permanently remove the showtime.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteShowtime}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteShowtime}
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
                      Delete Showtime
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Showtime Modal */}
      {showEditModal && selectedShowtime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Edit Showtime</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateShowtime} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle
                      size={20}
                      className="text-red-400 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-red-300 font-medium mb-2">
                        Please fix the following errors:
                      </p>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Movie Selection - Read Only in Edit Mode */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Selected Movie{" "}
                      <span className="text-slate-400">
                        (Cannot be changed)
                      </span>
                    </label>
                    <div className="bg-slate-700/30 rounded-lg border border-slate-600 p-4">
                      {selectedMovie ? (
                        <div className="flex items-center">
                          <img
                            src={selectedMovie.poster_url}
                            alt={selectedMovie.title}
                            className="w-12 h-16 object-cover rounded mr-3"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-movie.jpg";
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {selectedMovie.title}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {formatMovieDuration(selectedMovie.duration)}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {selectedMovie.genre.join(", ")}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-1 rounded text-xs ${getMovieStatusColor(
                                  selectedMovie.status
                                )}`}
                              >
                                {getMovieStatusDisplay(selectedMovie.status)}
                              </span>
                              <span className="text-slate-400 text-xs">
                                ⭐ {selectedMovie.average_rating.toFixed(1)} (
                                {selectedMovie.ratings_count})
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400">
                          Loading movie information...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Screen Selection */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Select Screen <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {screens.map((screen) => (
                        <div
                          key={screen._id}
                          onClick={() => handleScreenSelect(screen)}
                          className={`p-3 cursor-pointer rounded-lg border transition-colors ${
                            selectedScreen?._id === screen._id
                              ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                              : "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{screen.name}</h4>
                              <p className="text-sm opacity-70">
                                Capacity: {screen.capacity} seats
                              </p>
                            </div>
                            <MonitorPlay size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date, Time & Pricing */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Show Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={showDate}
                      onChange={(e) =>
                        handleDateTimeChange(e.target.value, showTime)
                      }
                      min={getMinDate()}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Show Time <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={showTime}
                      onChange={(e) =>
                        handleDateTimeChange(showDate, e.target.value)
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Configuration */}
                  <div className="space-y-3">
                    <label className="block text-slate-300 text-sm font-medium">
                      Ticket Pricing <span className="text-red-400">*</span>
                    </label>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Regular Seats
                      </label>
                      <input
                        type="number"
                        value={formData.price.regular}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            regular: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Price in VND"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Premium Seats
                      </label>
                      <input
                        type="number"
                        value={formData.price.premium}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            premium: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Price in VND"
                      />
                    </div>

                    {formData.price.vip !== undefined && (
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">
                          VIP Seats
                        </label>
                        <input
                          type="number"
                          value={formData.price.vip || 0}
                          onChange={(e) =>
                            handleFormChange("price", {
                              ...formData.price,
                              vip: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                          disabled={isSubmitting}
                          placeholder="Price in VND"
                        />
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedMovie && selectedScreen && showDate && showTime && (
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">
                        Showtime Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Movie:</span>{" "}
                          {selectedMovie.title}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Screen:</span>{" "}
                          {selectedScreen.name}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Duration:</span>{" "}
                          {selectedMovie.duration} minutes
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">
                            Available Seats:
                          </span>{" "}
                          {formData.available_seats}
                        </p>
                        {formData.end_time && (
                          <p className="text-slate-300">
                            <span className="text-slate-400">End Time:</span>{" "}
                            {formatShowtimeTime(formData.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Selection */}
              <div className="px-6 pb-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Showtime Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.status || ShowtimeStatusValues.SCHEDULED}
                    onChange={(e) =>
                      handleFormChange(
                        "status",
                        e.target.value as ShowtimeStatus
                      )
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value={ShowtimeStatusValues.SCHEDULED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.SCHEDULED)}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_OPEN}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_OPEN
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_CLOSED}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_CLOSED
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.CANCELLED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.CANCELLED)}
                    </option>
                    <option value={ShowtimeStatusValues.COMPLETED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.COMPLETED)}
                    </option>
                  </select>
                  <p className="text-slate-400 text-xs mt-1">
                    Update the status of this showtime
                  </p>
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
                      Update Showtime
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Showtime Modal */}
      {showViewModal && selectedShowtime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                Showtime Details
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Movie Info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      selectedShowtime.movie?.poster_url ||
                      "/placeholder-movie.jpg"
                    }
                    alt={selectedShowtime.movie?.title || "Movie"}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">
                      {selectedShowtime.movie?.title}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-300">
                        <span className="text-slate-400">Duration:</span>{" "}
                        {selectedShowtime.movie?.duration} minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Showtime Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                      Schedule Details
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-300">
                        <Calendar size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">Date:</span>
                        {formatShowtimeDate(selectedShowtime.start_time)}
                      </div>
                      <div className="flex items-center text-slate-300">
                        <Clock size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">Time:</span>
                        {formatShowtimeTime(selectedShowtime.start_time)} -{" "}
                        {formatShowtimeTime(selectedShowtime.end_time)}
                      </div>
                      <div className="flex items-center text-slate-300">
                        <MonitorPlay
                          size={16}
                          className="mr-2 text-slate-400"
                        />
                        <span className="text-slate-400 mr-2">Screen:</span>
                        {selectedShowtime.screen?.name}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                      Seating & Pricing
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-300">
                        <Users size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">Available:</span>
                        {selectedShowtime.available_seats} seats
                      </div>
                      <div className="flex items-center text-slate-300">
                        <Users size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">
                          Total Capacity:
                        </span>
                        {selectedShowtime.screen?.capacity} seats
                      </div>
                      {selectedShowtime.booked_seats &&
                        selectedShowtime.booked_seats.length > 0 && (
                          <div className="flex items-center text-amber-400">
                            <Users size={16} className="mr-2" />
                            <span className="text-slate-400 mr-2">Booked:</span>
                            {selectedShowtime.booked_seats.length} seats
                          </div>
                        )}
                      <div className="space-y-2">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Regular:</span>
                          <span>
                            {formatPrice(selectedShowtime.price.regular)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Premium:</span>
                          <span>
                            {formatPrice(selectedShowtime.price.premium)}
                          </span>
                        </div>
                        {selectedShowtime.price.vip && (
                          <div className="flex justify-between text-slate-300">
                            <span className="text-slate-400">VIP:</span>
                            <span>
                              {formatPrice(selectedShowtime.price.vip)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <span className="text-slate-400 mr-2">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getShowtimeStatusColor(
                            selectedShowtime.status
                          )}`}
                        >
                          {getShowtimeStatusDisplay(selectedShowtime.status)}
                        </span>
                      </div>

                      {hasBookings(selectedShowtime) && (
                        <div className="flex items-center text-amber-400">
                          <Users size={16} className="mr-1" />
                          <span className="text-sm font-medium">
                            Has Active Bookings
                          </span>
                        </div>
                      )}

                      {!canModifyShowtime(selectedShowtime) && (
                        <div className="flex items-center text-red-400">
                          <AlertTriangle size={16} className="mr-1" />
                          <span className="text-sm font-medium">
                            Cannot Edit/Delete
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditShowtime(selectedShowtime)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                          canModifyShowtime(selectedShowtime)
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!canModifyShowtime(selectedShowtime)}
                        title={
                          !canModifyShowtime(selectedShowtime)
                            ? "Cannot edit showtime with existing bookings or past showtimes"
                            : "Edit showtime"
                        }
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Showtimes;
