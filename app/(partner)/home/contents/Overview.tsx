"use client"

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  BarChart3,
  Film,
  DollarSign,
  TrendingUp,
  Star,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// Import analytics APIs
import {
  getMyTheaterAnalytics,
  getAllTheatersAnalytics,
  formatRevenueShort,
  getTheaterPerformanceStatus,
  getPerformanceStatusDisplay,
  getPerformanceStatusColor,
  type MyTheaterAnalyticsResponse,
  type AllTheatersAnalyticsResponse,
} from "../../../apis/analytics_staff.api";

// Import other APIs
import { getMyMovies, type MovieListResponse } from "../../../apis/staff.api";
import {
  getTheaterBookings,
  formatPrice,
  type BookingListResponse,
} from "../../../apis/staff_booking.api";

const Overview = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myTheaterAnalytics, setMyTheaterAnalytics] =
    useState<MyTheaterAnalyticsResponse | null>(null);
  const [allTheatersAnalytics, setAllTheatersAnalytics] =
    useState<AllTheatersAnalyticsResponse | null>(null);
  const [myMovies, setMyMovies] = useState<MovieListResponse | null>(null);
  const [recentBookings, setRecentBookings] =
    useState<BookingListResponse | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytics data in parallel
        const [myTheaterData, allTheatersData, moviesData, bookingsData] =
          await Promise.allSettled([
            getMyTheaterAnalytics(),
            getAllTheatersAnalytics(),
            getMyMovies(1, 10), // Get first 10 movies
            getTheaterBookings(1, 5, "confirmed"), // Get 5 recent confirmed bookings
          ]);

        // Handle my theater analytics
        if (myTheaterData.status === "fulfilled") {
          setMyTheaterAnalytics(myTheaterData.value);
        } else {
          console.error(
            "Failed to fetch my theater analytics:",
            myTheaterData.reason
          );
        }

        // Handle all theaters analytics
        if (allTheatersData.status === "fulfilled") {
          setAllTheatersAnalytics(allTheatersData.value);
        } else {
          console.error(
            "Failed to fetch all theaters analytics:",
            allTheatersData.reason
          );
        }

        // Handle movies data
        if (moviesData.status === "fulfilled") {
          setMyMovies(moviesData.value);
        } else {
          console.error("Failed to fetch movies:", moviesData.reason);
        }

        // Handle bookings data
        if (bookingsData.status === "fulfilled") {
          setRecentBookings(bookingsData.value);
        } else {
          console.error("Failed to fetch bookings:", bookingsData.reason);
        }
      } catch (err) {
        console.error("Error fetching overview data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from real data
  const stats = [
    {
      label: "Total Revenue",
      value: myTheaterAnalytics
        ? formatRevenueShort(myTheaterAnalytics.result.analytics.total_revenue)
        : "Loading...",
      change: myTheaterAnalytics
        ? `${
            myTheaterAnalytics.result.analytics.total_revenue > 0 ? "+" : ""
          }${(
            (myTheaterAnalytics.result.analytics.total_revenue / 1000000) *
            100
          ).toFixed(1)}%`
        : "+0%",
      icon: DollarSign,
      changeType: "positive" as const,
    },
    {
      label: "My Theater",
      value: myTheaterAnalytics ? "1" : "0",
      change:
        myTheaterAnalytics?.result.theater_info.status === "active"
          ? "Active"
          : "Inactive",
      icon: Building2,
      changeType:
        myTheaterAnalytics?.result.theater_info.status === "active"
          ? ("positive" as const)
          : ("negative" as const),
    },
    {
      label: "Movies Managed",
      value: myMovies ? myMovies.result.total.toString() : "0",
      change: myMovies
        ? `${
            myMovies.result.movies.filter((m) => m.status === "now_showing")
              .length
          } showing`
        : "0 showing",
      icon: Film,
      changeType: "positive" as const,
    },
    {
      label: "Total Bookings",
      value: myTheaterAnalytics
        ? myTheaterAnalytics.result.analytics.total_bookings.toString()
        : "0",
      change: myTheaterAnalytics
        ? `${myTheaterAnalytics.result.analytics.total_customers} customers`
        : "0 customers",
      icon: Calendar,
      changeType: "positive" as const,
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading overview data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Failed to load overview data</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-orange-500/20 hover:shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp size={14} className="mr-1 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-orange-500/30">
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <motion.div
            className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Recent Bookings
              </h3>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg shadow-lg shadow-orange-500/30">
                <Calendar size={20} className="text-white" />
              </div>
            </div>
            <div className="space-y-3">
              {recentBookings && recentBookings.result.bookings.length > 0 ? (
                recentBookings.result.bookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition-all duration-300 border border-slate-600/30 hover:border-orange-500/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">
                          Booking #{booking.ticket_code}
                        </p>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-500/20 text-green-400"
                                : booking.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {booking.seats.length} seats •{" "}
                        {new Date(booking.booking_time).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-400 font-semibold text-lg">
                        {formatPrice(booking.total_amount)}
                      </span>
                      <p className="text-slate-400 text-xs">
                        {booking.payment_status}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No recent bookings found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Theater Performance */}
          <motion.div
            className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Theater Analytics
              </h3>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg shadow-lg shadow-orange-500/30">
                <BarChart3 size={20} className="text-white" />
              </div>
            </div>

            {myTheaterAnalytics ? (
              <div className="space-y-4">
                {/* My Theater Performance */}
                <motion.div
                  className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:border-orange-500/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">
                        {myTheaterAnalytics.result.theater_info.name}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {myTheaterAnalytics.result.theater_info.location} •{" "}
                        {myTheaterAnalytics.result.theater_info.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-400 font-semibold">
                        {formatRevenueShort(
                          myTheaterAnalytics.result.analytics.total_revenue
                        )}
                      </span>
                      <p className="text-slate-400 text-xs">Total Revenue</p>
                    </div>
                  </div>

                  {/* Performance metrics */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {myTheaterAnalytics.result.analytics.total_bookings}
                      </p>
                      <p className="text-slate-400 text-xs">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {myTheaterAnalytics.result.analytics.total_customers}
                      </p>
                      <p className="text-slate-400 text-xs">Customers</p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-2xl font-bold"
                        style={{
                          color: getPerformanceStatusColor(
                            getTheaterPerformanceStatus(
                              myTheaterAnalytics.result.analytics.total_revenue
                            )
                          ),
                        }}
                      >
                        {getPerformanceStatusDisplay(
                          getTheaterPerformanceStatus(
                            myTheaterAnalytics.result.analytics.total_revenue
                          )
                        )}
                      </p>
                      <p className="text-slate-400 text-xs">Performance</p>
                    </div>
                  </div>

                  {/* Performance bar */}
                  <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden mt-4">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          (myTheaterAnalytics.result.analytics.total_revenue /
                            10000000) *
                            100,
                          100
                        )}%`,
                      }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </motion.div>

                {/* Comparison with other theaters */}
                {allTheatersAnalytics &&
                  allTheatersAnalytics.result.length > 1 && (
                    <div className="mt-4">
                      <h4 className="text-white font-medium mb-3">
                        Market Comparison
                      </h4>
                      <div className="space-y-2">
                        {allTheatersAnalytics.result
                          .filter(
                            (theater) =>
                              theater.theater_id !==
                              myTheaterAnalytics.result.theater_info._id
                          )
                          .sort((a, b) => b.total_revenue - a.total_revenue)
                          .slice(0, 3)
                          .map((theater, index) => (
                            <motion.div
                              key={theater.theater_id}
                              className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.6 + index * 0.1,
                              }}
                            >
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">
                                  {theater.theater_name}
                                </p>
                                <p className="text-slate-400 text-xs">
                                  {theater.theater_location}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-300 text-sm">
                                  {formatRevenueShort(theater.total_revenue)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No analytics data available</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Add Movie",
                icon: Film,
                color: "from-orange-500 to-red-500",
                description: "Create new movie",
              },
              {
                label: "Manage Theater",
                icon: Building2,
                color: "from-amber-500 to-yellow-500",
                description: "Theater settings",
              },
              {
                label: "View Bookings",
                icon: Calendar,
                color: "from-emerald-500 to-green-500",
                description: "Recent bookings",
              },
              {
                label: "Analytics",
                icon: BarChart3,
                color: "from-blue-500 to-cyan-500",
                description: "Detailed reports",
              },
            ].map((action, index) => (
              <motion.button
                key={index}
                className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:border-orange-500/30 transition-all duration-300 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`bg-gradient-to-r ${action.color} p-3 rounded-lg mb-3 mx-auto w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <action.icon size={24} className="text-white" />
                </div>
                <p className="text-white font-medium text-sm">{action.label}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {action.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Movies Overview */}
        {myMovies && myMovies.result.movies.length > 0 && (
          <motion.div
            className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">My Movies</h3>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg shadow-lg shadow-orange-500/30">
                <Film size={20} className="text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myMovies.result.movies.slice(0, 6).map((movie, index) => (
                <motion.div
                  key={movie._id}
                  className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:border-orange-500/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 bg-slate-600 rounded overflow-hidden flex-shrink-0">
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {movie.title}
                      </p>
                      <p className="text-slate-400 text-xs">{movie.language}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            movie.status === "now_showing"
                              ? "bg-green-500/20 text-green-400"
                              : movie.status === "coming_soon"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {movie.status.replace("_", " ")}
                        </span>
                        {movie.average_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star
                              size={10}
                              className="text-yellow-400 fill-current"
                            />
                            <span className="text-yellow-400 text-xs">
                              {movie.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {myMovies.result.total > 6 && (
              <div className="text-center mt-4">
                <p className="text-slate-400 text-sm">
                  Showing 6 of {myMovies.result.total} movies
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Overview;
