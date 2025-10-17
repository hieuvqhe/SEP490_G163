"use client"

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  getTheaterBookings,
  formatBookingTime,
  formatPrice,
  getBookingStatusDisplay,
  getPaymentStatusDisplay,
  type Booking
} from "../../../apis/staff_booking.api";
import BookingDetailsModal from "../../../components/BookingDetailsModal";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'confirmed' | 'cancelled' | 'pending' | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<'paid' | 'failed' | 'pending' | ''>('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTheaterBookings(
        currentPage,
        20,
        statusFilter || undefined,
        paymentFilter || undefined
      );
      
      setBookings(response.result.bookings);
      setTotalPages(Math.ceil(response.result.total / response.result.limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load bookings on component mount and when filters change
  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, paymentFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleStatusFilter = (status: 'confirmed' | 'cancelled' | 'pending' | '') => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  const handlePaymentFilter = (status: 'paid' | 'failed' | 'pending' | '') => {
    setPaymentFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  // Handle view booking details
  const handleViewBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
  };

  // Get customer display name from booking
  const getCustomerDisplay = (booking: Booking) => {
    // For performance reasons, we only show user_id in the list view
    // The detailed modal will fetch and display full user information
    // TODO: Could enhance this to show names if user data is included in booking list API
    return booking.user_id;
  };
  return (
    <div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Booking Management</h2>
          <div className="flex gap-3">
            {/* Filter buttons */}
            <select 
              value={statusFilter} 
              onChange={(e) => handleStatusFilter(e.target.value as any)}
              className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
            >
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select 
              value={paymentFilter} 
              onChange={(e) => handlePaymentFilter(e.target.value as any)}
              className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <motion.button
              onClick={fetchBookings}
              className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-300">Loading bookings...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            <p>Error: {error}</p>
            <button 
              onClick={fetchBookings}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Bookings table */}
        {!loading && !error && (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                    Movie
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                    Theater
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                    Showtime
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                    Seats
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                    Total
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
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking, index) => (
                    <motion.tr
                      key={booking._id}
                      className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-orange-400">
                          {booking.ticket_code}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {getCustomerDisplay(booking)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatBookingTime(booking.booking_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{booking.movie_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{booking.theater_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{booking.showtime_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {booking.seats.map((seat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/30"
                            >
                              {seat.row}{seat.number}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-emerald-400 font-medium">
                          {formatPrice(booking.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : booking.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {getBookingStatusDisplay(booking.status)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              booking.payment_status === "paid"
                                ? "bg-green-500/20 text-green-400"
                                : booking.payment_status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {getPaymentStatusDisplay(booking.payment_status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleViewBooking(booking._id)}
                            className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1 rounded text-sm font-medium transition-colors duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded text-sm font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Previous
                </motion.button>
                <motion.button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded text-sm font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </div>
        )}
      </motion.div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        bookingId={selectedBookingId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Bookings;
