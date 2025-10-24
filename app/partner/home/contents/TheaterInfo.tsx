"use client"

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Edit3, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Save,
  X
} from "lucide-react";
import { 
  getMyTheater, 
  createTheater, 
  updateTheater,
  type TheaterResponse,
  type TheaterCreateRequest
} from '../../../apis/staff.api';
import { toast } from 'sonner';

// ✅ Di chuyển TheaterForm ra ngoài component chính
const TheaterForm = ({ 
  isEdit = false, 
  onSubmit, 
  onCancel,
  formData,
  loading,
  availableAmenities,
  handleInputChange,
  handleInputBlur,
  addAmenity,
  removeAmenity,
  amenityInput,
  setAmenityInput,
  formErrors,
  isSubmitting
}: { 
  isEdit?: boolean; 
  onSubmit: (e: React.FormEvent) => void; 
  onCancel: () => void;
  formData: TheaterCreateRequest;
  loading: boolean;
  availableAmenities: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  addAmenity: (amenity: string) => void;
  removeAmenity: (amenityToRemove: string) => void;
  amenityInput: string;
  setAmenityInput: React.Dispatch<React.SetStateAction<string>>;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
}) => (
  <motion.div
    className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white flex items-center">
        {isEdit ? <Edit3 size={24} className="mr-2 text-orange-400" /> : <Plus size={24} className="mr-2 text-orange-400" />}
        {isEdit ? 'Edit Theater' : 'Create New Theater'}
      </h3>
      <button
        onClick={onCancel}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Theater Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.name 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-slate-600 focus:border-orange-500'
            }`}
            placeholder="Cinema Name"
            required
          />
          {formErrors.name && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.name}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.location 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-slate-600 focus:border-orange-500'
            }`}
            placeholder="Downtown, City Center"
            required
          />
          {formErrors.location && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.location}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
            formErrors.address 
              ? 'border-red-500 focus:border-red-400' 
              : 'border-slate-600 focus:border-orange-500'
          }`}
          placeholder="123 Main Street"
          required
        />
        {formErrors.address && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {formErrors.address}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.city 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-slate-600 focus:border-orange-500'
            }`}
            placeholder="Ha Noi"
            required
          />
          {formErrors.city && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.city}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.state 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-slate-600 focus:border-orange-500'
            }`}
            placeholder="Ha Noi"
            required
          />
          {formErrors.state && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.state}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Pin Code</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.pincode 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-slate-600 focus:border-orange-500'
            }`}
            placeholder="8000"
            required
          />
          {formErrors.pincode && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.pincode}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Number of Screens</label>
          <input
            type="number"
            name="screens"
            value={formData.screens}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min="1"
            max="50"
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.screens 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-slate-600 focus:border-orange-500'
            }`}
            required
          />
          {formErrors.screens && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.screens}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Contact Phone</label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.contact_phone 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-slate-600 focus:border-orange-500'
            }`}
            placeholder="0947679302"
            required
          />
          {formErrors.contact_phone && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.contact_phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Contact Email</label>
        <input
          type="email"
          name="contact_email"
          value={formData.contact_email}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
            formErrors.contact_email 
              ? 'border-red-500 focus:border-red-400' 
              : 'border-slate-600 focus:border-orange-500'
          }`}
          placeholder="theater@example.com"
          required
        />
        {formErrors.contact_email && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {formErrors.contact_email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          rows={3}
          className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
            formErrors.description 
              ? 'border-red-500 focus:border-red-400' 
              : 'border-slate-600 focus:border-orange-500'
          }`}
          placeholder="Premium cinema experience..."
          required
        />
        {formErrors.description && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {formErrors.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.amenities.map((amenity, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30 flex items-center"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(amenity)}
                className="ml-2 text-orange-300 hover:text-orange-200"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
              placeholder="Add amenity..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity(amenityInput))}
            />
            <button
              type="button"
              onClick={() => addAmenity(amenityInput)}
              className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
            >
              Add
            </button>
          </div>
          {formErrors.amenities && (
            <p className="text-red-400 text-xs mb-2 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.amenities}
            </p>
          )}
        <div className="flex flex-wrap gap-2">
          {availableAmenities.filter(amenity => !formData.amenities.includes(amenity)).map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => addAmenity(amenity)}
              className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
            >
              + {amenity}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {isSubmitting || loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Save size={18} className="mr-2" />
          )}
          {isEdit ? 'Update Theater' : 'Create Theater'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </motion.div>
);

const TheaterInfo = () => {
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState<TheaterCreateRequest>({
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    screens: 1,
    amenities: [],
    contact_phone: '',
    contact_email: '',
    description: ''
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableAmenities = [
    'Parking', 'Food Court', 'AC', '3D', 'IMAX', 'Dolby Atmos', 
    'VIP Seats', 'Premium Sound', 'Recliner Seats', '4DX', 
    'VIP Lounge', 'Concession Stand', 'Bar & Grill'
  ];

  // Validation patterns
  const validationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+84|0)[3-9]\d{8}$/,
    pincode: /^\d{4,6}$/,
    name: /^[a-zA-Z0-9\s\-&.()]{2,50}$/,
    text: /^[a-zA-Z0-9\s\-,.()&]{2,100}$/,
    description: /^[a-zA-Z0-9\s\-,.()&]{10,500}$/
  };

  useEffect(() => {
    fetchTheaterData();
  }, []);

  const fetchTheaterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyTheater();
      setTheater(response);
      if (response.result) {
        setFormData({
          name: response.result.name,
          location: response.result.location,
          address: response.result.address,
          city: response.result.city,
          state: response.result.state,
          pincode: response.result.pincode,
          screens: response.result.screens,
          amenities: response.result.amenities,
          contact_phone: response.result.contact_phone,
          contact_email: response.result.contact_email,
          description: response.result.description
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch theater data';
      setError(errorMessage);
      console.error('Error fetching theater:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateField = (name: string, value: string): string => {
    const trimmedValue = value.trim();
    
    switch (name) {
      case 'name':
        if (!trimmedValue) return 'Theater name is required';
        if (trimmedValue.length < 2) return 'Theater name must be at least 2 characters';
        if (trimmedValue.length > 50) return 'Theater name must be less than 50 characters';
        if (!validationPatterns.name.test(trimmedValue)) return 'Theater name contains invalid characters';
        return '';
        
      case 'location':
        if (!trimmedValue) return 'Location is required';
        if (trimmedValue.length < 2) return 'Location must be at least 2 characters';
        if (trimmedValue.length > 100) return 'Location must be less than 100 characters';
        if (!validationPatterns.text.test(trimmedValue)) return 'Location contains invalid characters';
        return '';
        
      case 'address':
        if (!trimmedValue) return 'Address is required';
        if (trimmedValue.length < 5) return 'Address must be at least 5 characters';
        if (trimmedValue.length > 100) return 'Address must be less than 100 characters';
        if (!validationPatterns.text.test(trimmedValue)) return 'Address contains invalid characters';
        return '';
        
      case 'city':
        if (!trimmedValue) return 'City is required';
        if (trimmedValue.length < 2) return 'City must be at least 2 characters';
        if (trimmedValue.length > 50) return 'City must be less than 50 characters';
        if (!validationPatterns.name.test(trimmedValue)) return 'City contains invalid characters';
        return '';
        
      case 'state':
        if (!trimmedValue) return 'State is required';
        if (trimmedValue.length < 2) return 'State must be at least 2 characters';
        if (trimmedValue.length > 50) return 'State must be less than 50 characters';
        if (!validationPatterns.name.test(trimmedValue)) return 'State contains invalid characters';
        return '';
        
      case 'pincode':
        if (!trimmedValue) return 'Pin code is required';
        if (!validationPatterns.pincode.test(trimmedValue)) return 'Pin code must be 4-6 digits';
        return '';
        
      case 'contact_phone':
        if (!trimmedValue) return 'Contact phone is required';
        if (!validationPatterns.phone.test(trimmedValue)) return 'Please enter a valid Vietnamese phone number (e.g., 0947679302 or +84947679302)';
        return '';
        
      case 'contact_email':
        if (!trimmedValue) return 'Contact email is required';
        if (!validationPatterns.email.test(trimmedValue)) return 'Please enter a valid email address';
        return '';
        
      case 'description':
        if (!trimmedValue) return 'Description is required';
        if (trimmedValue.length < 10) return 'Description must be at least 10 characters';
        if (trimmedValue.length > 500) return 'Description must be less than 500 characters';
        if (!validationPatterns.description.test(trimmedValue)) return 'Description contains invalid characters';
        return '';
        
      case 'screens':
        const screenCount = parseInt(trimmedValue);
        if (!screenCount || screenCount < 1) return 'Number of screens must be at least 1';
        if (screenCount > 50) return 'Number of screens cannot exceed 50';
        return '';
        
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedFormData: any = {};
    
    // Process all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'amenities') {
        const value = formData[key as keyof TheaterCreateRequest];
        const stringValue = String(value || '');
        const trimmedValue = stringValue.trim();
        
        if (key === 'screens') {
          const numValue = parseInt(trimmedValue) || 1;
          trimmedFormData[key] = Math.max(1, numValue);
        } else {
          trimmedFormData[key] = trimmedValue;
        }
        
        const error = validateField(key, trimmedValue);
        if (error) errors[key] = error;
      } else {
        trimmedFormData[key] = formData[key];
      }
    });

    // Update form data with trimmed values
    setFormData(trimmedFormData);

    // Validate amenities
    if (formData.amenities.length === 0) {
      errors.amenities = 'At least one amenity is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form data without trimming during typing
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle field blur (when user leaves the input)
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Trim the value on blur and handle special cases
    const stringValue = String(value);
    const trimmedValue = stringValue.trim();
    
    let finalValue: string | number;
    if (name === 'screens') {
      // For screens, ensure minimum value of 1
      const numValue = parseInt(trimmedValue) || 1;
      finalValue = Math.max(1, numValue);
    } else {
      finalValue = trimmedValue;
    }
    
    // Update form data with processed value
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Validate field on blur
    const error = validateField(name, trimmedValue);
    if (error) {
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const addAmenity = (amenity: string) => {
    const trimmedAmenity = amenity.trim();
    if (trimmedAmenity && !formData.amenities.includes(trimmedAmenity)) {
      if (trimmedAmenity.length < 2) {
        toast.error('Amenity must be at least 2 characters');
        return;
      }
      if (trimmedAmenity.length > 30) {
        toast.error('Amenity must be less than 30 characters');
        return;
      }
      if (!/^[a-zA-Z0-9\s\-&.()]{2,30}$/.test(trimmedAmenity)) {
        toast.error('Amenity contains invalid characters');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, trimmedAmenity]
      }));
      
      // Clear amenities error if it exists
      if (formErrors.amenities) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.amenities;
          return newErrors;
        });
      }
    } else if (formData.amenities.includes(trimmedAmenity)) {
      toast.error('This amenity already exists');
    }
    setAmenityInput('');
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  const handleCreateTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setLoading(true);
      await createTheater(formData);
      toast.success('Theater created successfully!');
      setShowCreateForm(false);
      setFormErrors({});
      await fetchTheaterData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create theater';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleUpdateTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theater?.result?._id) return;
    
    if (!validateForm()) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setLoading(true);
      await updateTheater(theater.result._id, formData);
      toast.success('Theater updated successfully!');
      setShowEditForm(false);
      setFormErrors({});
      await fetchTheaterData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update theater';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      screens: 1,
      amenities: [],
      contact_phone: '',
      contact_email: '',
      description: ''
    });
    setAmenityInput('');
    setFormErrors({});
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !theater) {
    return (
      <motion.div
        className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading theater information...</p>
          </div>
        </div>
      </motion.div>
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Theater Management
          </h2>
          {theater?.result && !showEditForm && !showCreateForm && (
            <button
              onClick={() => {
                // Initialize form with current theater data when editing
                if (theater.result) {
                  setFormData({
                    name: theater.result.name,
                    location: theater.result.location,
                    address: theater.result.address,
                    city: theater.result.city,
                    state: theater.result.state,
                    pincode: theater.result.pincode,
                    screens: theater.result.screens,
                    amenities: theater.result.amenities,
                    contact_phone: theater.result.contact_phone,
                    contact_email: theater.result.contact_email,
                    description: theater.result.description
                  });
                  setFormErrors({});
                }
                setShowEditForm(true);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center"
            >
              <Edit3 size={18} className="mr-2" />
              Edit Theater
            </button>
          )}
        </div>

        {showCreateForm && (
          <TheaterForm
            onSubmit={handleCreateTheater}
            onCancel={() => {
              setShowCreateForm(false);
              resetForm();
            }}
            formData={formData}
            loading={loading}
            availableAmenities={availableAmenities}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            addAmenity={addAmenity}
            removeAmenity={removeAmenity}
            amenityInput={amenityInput}
            setAmenityInput={setAmenityInput}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}

        {showEditForm && theater?.result && (
          <TheaterForm
            isEdit
            onSubmit={handleUpdateTheater}
            onCancel={() => {
              setShowEditForm(false);
              setFormErrors({});
            }}
            formData={formData}
            loading={loading}
            availableAmenities={availableAmenities}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            addAmenity={addAmenity}
            removeAmenity={removeAmenity}
            amenityInput={amenityInput}
            setAmenityInput={setAmenityInput}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}

        {!showCreateForm && !showEditForm && (
          <>
            {error && (
              <motion.div
                className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-400 mr-2" />
                  <p className="text-red-300">{error}</p>
                </div>
              </motion.div>
            )}

            {!theater?.result ? (
              <motion.div
                className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Building2 size={64} className="text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Theater Found
                </h3>
                <p className="text-slate-300 mb-6">
                  You haven't created a theater yet. Create your first theater to start managing your cinema business.
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(true);
                  }}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <Plus size={18} className="mr-2" />
                  Create Theater
                </button>
              </motion.div>
            ) : (
              <motion.div
                className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {theater.result.name}
                    </h3>
                    <p className="text-slate-400 flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {theater.result.location}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      theater.result.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    <CheckCircle size={16} className="inline mr-1" />
                    {theater.result.status.charAt(0).toUpperCase() + theater.result.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Screens</p>
                    <p className="text-white font-bold text-xl">{theater.result.screens}</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">City</p>
                    <p className="text-white font-bold">{theater.result.city}</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Pin Code</p>
                    <p className="text-white font-bold">{theater.result.pincode}</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Created</p>
                    <p className="text-orange-400 font-bold text-sm">{formatDate(theater.result.created_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-300">
                        <Phone size={16} className="mr-3 text-orange-400" />
                        {theater.result.contact_phone}
                      </div>
                      <div className="flex items-center text-slate-300">
                        <Mail size={16} className="mr-3 text-orange-400" />
                        {theater.result.contact_email}
                      </div>
                      <div className="flex items-start text-slate-300">
                        <MapPin size={16} className="mr-3 text-orange-400 mt-0.5" />
                        <div>
                          <p>{theater.result.address}</p>
                          <p>{theater.result.city}, {theater.result.state} {theater.result.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
                    <p className="text-slate-300 leading-relaxed">
                      {theater.result.description}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {theater.result.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700/50">
                  <div className="text-sm text-slate-400">
                    <p>Last updated: {formatDate(theater.result.updated_at)}</p>
                  </div>
                  <button
                    onClick={fetchTheaterData}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TheaterInfo;