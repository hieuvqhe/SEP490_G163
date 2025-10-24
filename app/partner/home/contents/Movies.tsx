"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, AlertTriangle } from "lucide-react";
// import {
//   getMyMovies,
//   deleteMovie,
//   type Movie,
//   type MovieListResponse,
//   type MovieCreateRequest,
//   formatMovieDuration,
//   formatMovieReleaseDate,
//   getMovieStatusDisplay
// } from '../../../apis/staff.api';
// import AddMovieModal from "./movies/AddMovieModal";
// import EditMovieModal from "./movies/EditMovieModal";

const Movies = () => {
  // const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "coming_soon" | "now_showing" | "ended" | ""
  >("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Form states for modals
  // const [formData, setFormData] = useState<MovieCreateRequest>({
  //   title: '',
  //   description: '',
  //   duration: 0,
  //   genre: [],
  //   language: '',
  //   release_date: '',
  //   director: '',
  //   cast: [],
  //   poster_url: '',
  //   trailer_url: '',
  //   status: 'coming_soon'
  // });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload states for modals
  // const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  // const [isUploadingTrailer, setIsUploadingTrailer] = useState(false);
  // const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [trailerPreview, setTrailerPreview] = useState<string | null>(null);

  // Fetch movies from API
  // const fetchMovies = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const response: MovieListResponse = await getMyMovies(
  //       page,
  //       limit,
  //       searchTerm || undefined,
  //       statusFilter || undefined
  //     );

  //     setMovies(response.result.movies);
  //     setTotalPages(response.result.total_pages);
  //     setTotal(response.result.total);
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movies';
  //     setError(errorMessage);
  //     console.error('Error fetching movies:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handle movie deletion
  // const handleDeleteMovie = (movieId: string, movieTitle: string) => {
  //   setMovieToDelete({ id: movieId, title: movieTitle });
  //   setShowDeleteModal(true);
  // };

  // Confirm delete movie
  // const confirmDeleteMovie = async () => {
  //   if (!movieToDelete) return;

  //   try {
  //     setIsSubmitting(true);
  //     await deleteMovie(movieToDelete.id);
  //     // toast.success('Movie deleted successfully');
  //     setShowDeleteModal(false);
  //     setMovieToDelete(null);
  //     await fetchMovies(); // Refresh the list
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : 'Failed to delete movie';
  //     // toast.error(errorMessage);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // Cancel delete movie
  const cancelDeleteMovie = () => {
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };

  // Handle search
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setPage(1); // Reset to first page when searching
  //   fetchMovies();
  // };

  // Handle filter change
  // const handleFilterChange = (
  //   newFilter: "coming_soon" | "now_showing" | "ended" | ""
  // ) => {
  //   setStatusFilter(newFilter);
  //   setPage(1); // Reset to first page when filtering
  // };

  // Modal handlers
  // const handleAddMovie = () => {
  //   setFormData({
  //     title: '',
  //     description: '',
  //     duration: 0,
  //     genre: [],
  //     language: '',
  //     release_date: '',
  //     director: '',
  //     cast: [],
  //     poster_url: '',
  //     trailer_url: '',
  //     status: 'coming_soon'
  //   });
  //   setFormErrors([]);
  //   setIsSubmitting(false);
  //   setPosterPreview(null);
  //   setTrailerPreview(null);
  //   setShowAddModal(true);
  // };

  // const handleEditMovie = (movie: Movie) => {
  //   setSelectedMovie(movie);
  //   setFormData({
  //     title: movie.title,
  //     description: movie.description,
  //     duration: movie.duration,
  //     genre: movie.genre,
  //     language: movie.language,
  //     release_date: movie.release_date.split('T')[0], // Convert to YYYY-MM-DD format
  //     director: movie.director,
  //     cast: movie.cast,
  //     poster_url: movie.poster_url,
  //     trailer_url: movie.trailer_url,
  //     status: movie.status
  //   });
  //   setFormErrors([]);
  //   setIsSubmitting(false);
  //   // Set previews for existing URLs
  //   setPosterPreview(movie.poster_url || null);
  //   setTrailerPreview(movie.trailer_url || null);
  //   setShowEditModal(true);
  // };

  // const handleViewDetails = (movie: Movie) => {
  //   setSelectedMovie(movie);
  //   setShowDetailsModal(true);
  // };

  // const closeModals = () => {
  //   setShowAddModal(false);
  //   setShowEditModal(false);
  //   setShowDetailsModal(false);
  //   setShowDeleteModal(false);
  //   setSelectedMovie(null);
  //   setMovieToDelete(null);
  //   setFormErrors([]);
  //   setIsSubmitting(false);
  //   setPosterPreview(null);
  //   setTrailerPreview(null);
  // };

  // Handle movie operations success
  // const handleMovieOperationSuccess = async () => {
  //   await fetchMovies(); // Refresh the list
  // };

  // Fetch movies on component mount and when dependencies change
  // useEffect(() => {
  //   fetchMovies();
  // }, [page, statusFilter]);

  // Get status styling
  // const getStatusStyle = (status: string) => {
  //   switch (status) {
  //     case "now_showing":
  //       return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  //     case "coming_soon":
  //       return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  //     case "ended":
  //       return "bg-red-500/20 text-red-400 border border-red-500/30";
  //     default:
  //       return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  //   }
  // };

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
            <h2 className="text-2xl font-bold text-white">Movie Management</h2>
            <p className="text-slate-400 text-sm">
              {total > 0
                ? `${total} movie${total !== 1 ? "s" : ""} found`
                : "No movies found"}
            </p>
          </div>
          <motion.button
            // onClick={handleAddMovie}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} className="mr-2" />
            Add Movie
          </motion.button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* <form onSubmit={handleSearch} className="flex-1"> */}
          <form className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </form>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              // onChange={(e) => handleFilterChange(e.target.value as any)}
              className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="ended">Ended</option>
            </select>
          </div>
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
              <div
                key={index}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden animate-pulse"
              >
                <div className="aspect-[2/3] bg-slate-700/50" />
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
            {/* Movies Grid */}
            {/* {movies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie._id}
                    className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-orange-500/20 hover:shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="aspect-[2/3] bg-slate-700/30 relative overflow-hidden">
                      <img
                        src={movie.poster_url || ''}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(movie.status)}`}>
                        {getMovieStatusDisplay(movie.status)}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {movie.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-3">
                        {movie.genre.join(', ')} • {formatMovieDuration(movie.duration)}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-700/30 p-3 rounded-lg">
                          <p className="text-slate-400 text-xs">Rating</p>
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-400 fill-current mr-1" />
                            <span className="text-white font-bold">
                              {movie.average_rating.toFixed(1)}
                            </span>
                            <span className="text-slate-400 text-xs ml-1">
                              ({movie.ratings_count})
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 p-3 rounded-lg">
                          <p className="text-slate-400 text-xs">Release Date</p>
                          <p className="text-orange-400 font-bold text-sm">
                            {formatMovieReleaseDate(movie.release_date)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-slate-400 text-xs mb-2">Director</p>
                        <p className="text-white text-sm">{movie.director}</p>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleEditMovie(movie)}
                          className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleViewDetails(movie)}
                          className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Eye size={14} className="mr-1" />
                          Details
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteMovie(movie._id, movie.title)}
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
                  <Calendar size={64} className="text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Movies Found
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {searchTerm || statusFilter 
                      ? "No movies match your search criteria. Try adjusting your filters."
                      : "You haven't created any movies yet. Create your first movie to get started."
                    }
                  </p>
                  <motion.button
                    onClick={handleAddMovie}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={18} className="mr-2" />
                    Add Movie
                  </motion.button>
                </motion.div>
              )
            )} */}

            {/* Pagination */}
            {/* {movies.length > 0 && totalPages > 1 && (
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
            )} */}
          </>
        )}

        {/* Movie Details Modal */}
        {/* {showDetailsModal && selectedMovie && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Movie Details</h3>
                <button
                  onClick={closeModals}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <img
                      src={selectedMovie.poster_url || ''}
                      alt={selectedMovie.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                  </div>
                  
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h1>
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedMovie.status)}`}>
                          {getMovieStatusDisplay(selectedMovie.status)}
                        </span>
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-400 fill-current mr-1" />
                          <span className="text-white font-bold">
                            {selectedMovie.average_rating.toFixed(1)}
                          </span>
                          <span className="text-slate-400 text-sm ml-1">
                            ({selectedMovie.ratings_count} ratings)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm mb-1">Duration</p>
                        <p className="text-white font-medium">{formatMovieDuration(selectedMovie.duration)}</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm mb-1">Release Date</p>
                        <p className="text-white font-medium">{formatMovieReleaseDate(selectedMovie.release_date)}</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm mb-1">Director</p>
                        <p className="text-white font-medium">{selectedMovie.director}</p>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm mb-1">Language</p>
                        <p className="text-white font-medium">{selectedMovie.language}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMovie.genre.map((g, index) => (
                          <span key={index} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">Description</p>
                      <p className="text-white leading-relaxed">{selectedMovie.description}</p>
                    </div>

                    {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-sm mb-3">Cast</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedMovie.cast.map((actor, index) => (
                            <div key={index} className="bg-slate-700/30 p-3 rounded-lg flex items-center space-x-3">
                              {actor.profile_image && (
                                <img
                                  src={actor.profile_image}
                                  alt={actor.name}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{actor.name}</p>
                                <p className="text-slate-400 text-sm truncate">{actor.character}</p>
                                {actor.gender !== undefined && (
                                  <p className="text-slate-500 text-xs">
                                    {actor.gender === 0 ? 'Male' : actor.gender === 1 ? 'Female' : 'Other'}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )} */}
      </motion.div>

      {/* Add Movie Modal */}
      {/* <AddMovieModal
        isOpen={showAddModal}
        onClose={closeModals}
        onSuccess={handleMovieOperationSuccess}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        isUploadingPoster={isUploadingPoster}
        setIsUploadingPoster={setIsUploadingPoster}
        isUploadingTrailer={isUploadingTrailer}
        setIsUploadingTrailer={setIsUploadingTrailer}
        posterPreview={posterPreview}
        setPosterPreview={setPosterPreview}
        trailerPreview={trailerPreview}
        setTrailerPreview={setTrailerPreview}
      /> */}

      {/* Edit Movie Modal */}
      {/* <EditMovieModal
        isOpen={showEditModal}
        onClose={closeModals}
        onSuccess={handleMovieOperationSuccess}
        selectedMovie={selectedMovie}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        isUploadingPoster={isUploadingPoster}
        setIsUploadingPoster={setIsUploadingPoster}
        isUploadingTrailer={isUploadingTrailer}
        setIsUploadingTrailer={setIsUploadingTrailer}
        posterPreview={posterPreview}
        setPosterPreview={setPosterPreview}
        trailerPreview={trailerPreview}
        setTrailerPreview={setTrailerPreview}
      /> */}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && movieToDelete && (
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
                    Delete Movie
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Are you sure you want to delete: {movieToDelete.title}?
                    This action cannot be undone and will permanently remove the
                    movie from your collection.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteMovie}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  // onClick={confirmDeleteMovie}
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
                      Delete Movie
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

export default Movies;
