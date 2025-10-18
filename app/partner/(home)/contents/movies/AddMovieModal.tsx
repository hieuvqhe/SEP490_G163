import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Save, 
  Loader, 
  X, 
  Plus,
  Image,
  Video,
  User,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { 
  type MovieCreateRequest,
  type MovieCast,
  createMovie,
  checkMovieTitleExists
} from '../../../../apis/staff.api';
import mediasApi from '../../../../apis/medias.api';
import { toast } from 'sonner';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formData: MovieCreateRequest;
  setFormData: React.Dispatch<React.SetStateAction<MovieCreateRequest>>;
  formErrors: string[];
  setFormErrors: React.Dispatch<React.SetStateAction<string[]>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  isUploadingPoster: boolean;
  setIsUploadingPoster: React.Dispatch<React.SetStateAction<boolean>>;
  isUploadingTrailer: boolean;
  setIsUploadingTrailer: React.Dispatch<React.SetStateAction<boolean>>;
  posterPreview: string | null;
  setPosterPreview: React.Dispatch<React.SetStateAction<string | null>>;
  trailerPreview: string | null;
  setTrailerPreview: React.Dispatch<React.SetStateAction<string | null>>;
}

const AddMovieModal: React.FC<AddMovieModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  isSubmitting,
  setIsSubmitting,
  isUploadingPoster,
  setIsUploadingPoster,
  isUploadingTrailer,
  setIsUploadingTrailer,
  posterPreview,
  setPosterPreview,
  trailerPreview,
  setTrailerPreview
}) => {
  // Title checking states
  const [titleCheckTimer, setTitleCheckTimer] = useState<number | null>(null);
  const [titleExists, setTitleExists] = useState(false);
  const [checkingTitle, setCheckingTitle] = useState(false);

  // Check if title exists with debouncing
  const checkTitleExists = async (title: string) => {
    if (!title.trim()) {
      setTitleExists(false);
      return;
    }

    try {
      setCheckingTitle(true);
      const exists = await checkMovieTitleExists(title);
      setTitleExists(exists);
    } catch (error) {
      console.error('Error checking title:', error);
      setTitleExists(false);
    } finally {
      setCheckingTitle(false);
    }
  };

  // Debounced title checking
  useEffect(() => {
    if (titleCheckTimer) {
      clearTimeout(titleCheckTimer);
    }

    const timer = setTimeout(() => {
      if (formData.title.trim()) {
        checkTitleExists(formData.title);
      } else {
        setTitleExists(false);
        setCheckingTitle(false);
      }
    }, 800); // Wait 800ms after user stops typing

    setTitleCheckTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData.title]);

  // Reset title checking states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTitleExists(false);
      setCheckingTitle(false);
      if (titleCheckTimer) {
        clearTimeout(titleCheckTimer);
        setTitleCheckTimer(null);
      }
    }
  }, [isOpen, titleCheckTimer]);

  // Form validation
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (titleExists) errors.push('This movie title already exists in your collection');
    if (!formData.description.trim()) errors.push('Description is required');
    if (formData.duration <= 0) errors.push('Duration must be greater than 0');
    if (formData.genre.length === 0) errors.push('At least one genre is required');
    if (!formData.language.trim()) errors.push('Language is required');
    if (!formData.release_date) errors.push('Release date is required');
    if (!formData.director.trim()) errors.push('Director is required');
    if (!formData.poster_url.trim()) errors.push('Poster URL is required');
    
    return errors;
  };

  // Handle form submission for creating movie
  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);
      
      await createMovie(formData);
      toast.success('Movie created successfully');
      onClose();
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create movie';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (field: keyof MovieCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  // Handle genre changes
  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      handleFormChange('genre', [...formData.genre, genre]);
    } else {
      handleFormChange('genre', formData.genre.filter(g => g !== genre));
    }
  };

  // Handle cast changes
  const handleAddCastMember = () => {
    const newCastMember: MovieCast = {
      id: Date.now(), // Temporary ID
      name: '',
      character: '',
      order: formData.cast.length,
      profile_image: '',
      gender: 0
    };
    handleFormChange('cast', [...formData.cast, newCastMember]);
  };

  const handleCastChange = (index: number, field: keyof MovieCast, value: any) => {
    const updatedCast = formData.cast.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    handleFormChange('cast', updatedCast);
  };

  const handleRemoveCastMember = (index: number) => {
    const updatedCast = formData.cast.filter((_, i) => i !== index);
    handleFormChange('cast', updatedCast);
  };

  // Handle poster upload
  const handlePosterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    try {
      setIsUploadingPoster(true);
      
      // Create preview first
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await mediasApi.uploadImages(file);
      
      // Check if response is successful and has the expected structure
      // API response: { message: "Upload success", result: [{ url: "...", type: 0 }] }
      if (response?.data?.result?.[0]?.url) {
        const uploadedUrl = response.data.result[0].url;
        handleFormChange('poster_url', uploadedUrl);
        toast.success('Poster uploaded successfully');
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Invalid response from upload service');
      }
    } catch (error) {
      console.error('Error uploading poster:', error);
      toast.error('Failed to upload poster');
      setPosterPreview(null);
      // Reset the poster_url if upload fails
      handleFormChange('poster_url', '');
    } finally {
      setIsUploadingPoster(false);
    }
  };

  // Handle trailer upload
  const handleTrailerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size should be less than 100MB');
      return;
    }

    try {
      setIsUploadingTrailer(true);
      
      // Create preview first
      const reader = new FileReader();
      reader.onload = (e) => {
        setTrailerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server using HLS
      const response = await mediasApi.uploadVideoHLS(file);
      
      // Check if response is successful and has the expected structure
      // API response: { message: "Upload success", result: [{ url: "...", type: 2 }] }
      if (response?.data?.result?.[0]?.url) {
        const uploadedUrl = response.data.result[0].url;
        handleFormChange('trailer_url', uploadedUrl);
        toast.success('Trailer uploaded successfully as HLS');
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Invalid response from upload service');
      }
    } catch (error) {
      console.error('Error uploading trailer:', error);
      toast.error('Failed to upload trailer');
      setTrailerPreview(null);
      // Reset the trailer_url if upload fails
      handleFormChange('trailer_url', '');
    } finally {
      setIsUploadingTrailer(false);
    }
  };

  // Handle cast profile image upload
  const handleCastImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      // Create preview first
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedCast = formData.cast.map((member, i) => 
          i === index ? { ...member, profileImagePreview: e.target?.result as string } : member
        );
        handleFormChange('cast', updatedCast);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await mediasApi.uploadImages(file);
      
      if (response?.data?.result?.[0]?.url) {
        const uploadedUrl = response.data.result[0].url;
        const updatedCast = formData.cast.map((member, i) => 
          i === index ? { ...member, profile_image: uploadedUrl } : member
        );
        handleFormChange('cast', updatedCast);
        toast.success('Cast member image uploaded successfully');
      } else {
        throw new Error('Invalid response from upload service');
      }
    } catch (error) {
      console.error('Error uploading cast image:', error);
      toast.error('Failed to upload cast image');
      // Remove preview on error
      const updatedCast = formData.cast.map((member, i) => 
        i === index ? { ...member, profileImagePreview: undefined } : member
      );
      handleFormChange('cast', updatedCast);
    }
  };

  // Handle removing cast profile image
  const handleRemoveCastImage = (index: number) => {
    const updatedCast = formData.cast.map((member, i) => 
      i === index ? { ...member, profile_image: '', profileImagePreview: undefined } : member
    );
    handleFormChange('cast', updatedCast);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Add New Movie</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleCreateMovie} className="p-6 space-y-6">
          {/* Error Messages */}
          {formErrors.length > 0 && (
            <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 pr-10 text-white placeholder-slate-400 focus:outline-none ${
                      titleExists 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-slate-600 focus:border-orange-500'
                    }`}
                    placeholder="Enter movie title"
                    disabled={isSubmitting}
                  />
                  {checkingTitle && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader size={16} className="text-slate-400 animate-spin" />
                    </div>
                  )}
                  {titleExists && !checkingTitle && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertTriangle size={16} className="text-red-400" />
                    </div>
                  )}
                </div>
                {titleExists && !checkingTitle && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertTriangle size={14} className="mr-1" />
                    This movie title already exists in your collection
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Director <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => handleFormChange('director', e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                  placeholder="Enter director name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Duration (minutes) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => handleFormChange('duration', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                    placeholder="120"
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Language <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => handleFormChange('language', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                    placeholder="English"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Release Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => handleFormChange('release_date', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value as any)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="coming_soon">Coming Soon</option>
                    <option value="now_showing">Now Showing</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Genres <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure'].map((genre) => (
                    <label key={genre} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.genre.includes(genre)}
                        onChange={(e) => handleGenreChange(genre, e.target.checked)}
                        className="text-orange-500 focus:ring-orange-500 focus:ring-2"
                        disabled={isSubmitting}
                      />
                      <span className="text-slate-300">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* URLs and Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Poster Image <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isUploadingPoster 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-slate-600 hover:border-orange-500 hover:bg-orange-500/5'
                    }`}
                    onClick={() => document.getElementById('poster-upload-add')?.click()}
                  >
                    <input
                      id="poster-upload-add"
                      type="file"
                      accept="image/*"
                      onChange={handlePosterUpload}
                      className="hidden"
                      disabled={isSubmitting || isUploadingPoster}
                    />
                    <div className="flex flex-col items-center space-y-2">
                      {isUploadingPoster ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                          <p className="text-orange-400 text-sm">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Image size={32} className="text-slate-400" />
                          <p className="text-slate-400 text-sm">Click to upload poster image</p>
                          <p className="text-slate-500 text-xs">JPG, PNG up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  {posterPreview && (
                    <div className="relative">
                      <img
                        src={posterPreview}
                        alt="Poster preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPosterPreview(null);
                          handleFormChange('poster_url', '');
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Trailer Video (Optional)
                </label>
                <div className="space-y-2">
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isUploadingTrailer 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-slate-600 hover:border-orange-500 hover:bg-orange-500/5'
                    }`}
                    onClick={() => document.getElementById('trailer-upload-add')?.click()}
                  >
                    <input
                      id="trailer-upload-add"
                      type="file"
                      accept="video/*"
                      onChange={handleTrailerUpload}
                      className="hidden"
                      disabled={isSubmitting || isUploadingTrailer}
                    />
                    <div className="flex flex-col items-center space-y-2">
                      {isUploadingTrailer ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                          <p className="text-orange-400 text-sm">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Video size={32} className="text-slate-400" />
                          <p className="text-slate-400 text-sm">Click to upload trailer video</p>
                          <p className="text-slate-500 text-xs">MP4, MOV up to 100MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  {trailerPreview && (
                    <div className="relative">
                      <video
                        src={trailerPreview}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setTrailerPreview(null);
                          handleFormChange('trailer_url', '');
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={8}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Enter movie description..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Cast Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-slate-300 text-sm font-medium">
                Cast Members
              </label>
              <button
                type="button"
                onClick={handleAddCastMember}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1 rounded-lg text-sm transition-colors"
                disabled={isSubmitting}
              >
                <Plus size={16} className="inline mr-1" />
                Add Cast
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.cast.map((member, index) => (
                <div key={index} className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-slate-300 font-medium">Cast Member {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCastMember(index)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Profile Image */}
                    <div className="md:col-span-1">
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Profile Image
                      </label>
                      <div className="space-y-2">
                        <div
                          className="border-2 border-dashed border-slate-600 hover:border-orange-500 rounded-lg p-4 text-center cursor-pointer transition-colors bg-slate-600/20 hover:bg-orange-500/5"
                          onClick={() => document.getElementById(`cast-image-${index}`)?.click()}
                        >
                          <input
                            id={`cast-image-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCastImageUpload(index, e)}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                          <div className="flex flex-col items-center space-y-2">
                            <User size={24} className="text-slate-400" />
                            <p className="text-slate-400 text-xs">Click to upload</p>
                            <p className="text-slate-500 text-xs">JPG, PNG up to 5MB</p>
                          </div>
                        </div>
                        
                        {((member as any).profileImagePreview || member.profile_image) && (
                          <div className="relative">
                            <img
                              src={(member as any).profileImagePreview || member.profile_image}
                              alt="Profile preview"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCastImage(index)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
                              disabled={isSubmitting}
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Cast Information */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-1">
                            Actor Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleCastChange(index, 'name', e.target.value)}
                            placeholder="Enter actor name"
                            className="w-full bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-1">
                            Character <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.character}
                            onChange={(e) => handleCastChange(index, 'character', e.target.value)}
                            placeholder="Enter character name"
                            className="w-full bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-1">
                            Order
                          </label>
                          <input
                            type="number"
                            value={member.order}
                            onChange={(e) => handleCastChange(index, 'order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className="w-full bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-1">
                            Gender
                          </label>
                          <select
                            value={member.gender}
                            onChange={(e) => handleCastChange(index, 'gender', parseInt(e.target.value))}
                            className="w-full bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                            disabled={isSubmitting}
                          >
                            <option value={0}>Male</option>
                            <option value={1}>Female</option>
                            <option value={2}>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isSubmitting || titleExists || checkingTitle
                  ? 'bg-slate-600 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white`}
              disabled={isSubmitting || titleExists || checkingTitle}
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : checkingTitle ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Checking title...
                </>
              ) : titleExists ? (
                <>
                  <AlertTriangle size={18} className="mr-2" />
                  Title already exists
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Create Movie
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddMovieModal;
