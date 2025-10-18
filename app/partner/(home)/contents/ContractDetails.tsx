"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { checkStaffContract } from '../../../apis/staff.api';
import type { ContractCheckResponse } from '../../../apis/staff.api';
import { toast } from 'sonner';

const ContractDetails = () => {
  const [contract, setContract] = useState<ContractCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContractDetails();
  }, []);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await checkStaffContract();
      setContract(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contract details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'inactive':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'expired':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'inactive':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'expired':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
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
            <p className="text-slate-300">Loading contract details...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !contract?.result) {
    return (
      <motion.div
        className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center min-h-96 flex items-center justify-center">
          <div>
            <AlertCircle size={64} className="text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Contract Found</h3>
            <p className="text-slate-300 mb-4">
              {error || 'You do not have an active contract. Please contact your administrator.'}
            </p>
            <button
              onClick={fetchContractDetails}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const contractData = contract.result;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText size={32} className="text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Contract Details</h1>
              <p className="text-slate-300">Contract #{contractData.contract_number}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor(contractData.status)}`}>
            {getStatusIcon(contractData.status)}
            <span className="font-medium capitalize">{contractData.status}</span>
          </div>
        </div>
      </div>

      {/* Contract Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User size={20} className="text-orange-400 mr-2" />
            Basic Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Staff Name:</span>
              <span className="text-white">{contractData.staff_name || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-white flex items-center">
                {contractData.staff_email || 'Not specified'}
                {contractData.staff_email && <Mail size={14} className="ml-2 text-slate-400" />}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phone:</span>
              <span className="text-white flex items-center">
                {contractData.staff_phone || 'Not specified'}
                {contractData.staff_phone && <Phone size={14} className="ml-2 text-slate-400" />}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DollarSign size={20} className="text-orange-400 mr-2" />
            Financial Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Salary:</span>
              <span className="text-white font-semibold">{formatCurrency(contractData.salary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Currency:</span>
              <span className="text-white">USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Method:</span>
              <span className="text-white">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Period */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar size={20} className="text-orange-400 mr-2" />
          Contract Period
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Start Date:</span>
              <span className="text-white">{formatDate(contractData.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">End Date:</span>
              <span className="text-white">{formatDate(contractData.end_date)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Created:</span>
              <span className="text-white">{formatDate(contractData.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-white">{formatDate(contractData.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theater Information */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Building size={20} className="text-orange-400 mr-2" />
          Theater Assignment
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Theater Name:</span>
            <span className="text-white">{contractData.theater_name || 'Not assigned'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Location:</span>
            <span className="text-white flex items-center">
              {contractData.theater_location || 'Not specified'}
              {contractData.theater_location && <MapPin size={14} className="ml-2 text-slate-400" />}
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {contractData.terms && (
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FileText size={20} className="text-orange-400 mr-2" />
            Terms and Conditions
          </h2>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-slate-300 leading-relaxed">{contractData.terms}</p>
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {contractData.responsibilities && contractData.responsibilities.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Responsibilities</h2>
          <ul className="space-y-2">
            {contractData.responsibilities.map((responsibility, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">{responsibility}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {contractData.benefits && contractData.benefits.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Benefits</h2>
          <ul className="space-y-2">
            {contractData.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Admin Contact */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <User size={20} className="text-orange-400 mr-2" />
          Administrator Contact
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Admin Name:</span>
            <span className="text-white">{contractData.admin.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Admin Email:</span>
            <span className="text-white flex items-center">
              {contractData.admin.email}
              <Mail size={14} className="ml-2 text-slate-400" />
            </span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchContractDetails}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <Clock size={18} />
          <span>Refresh Contract Details</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ContractDetails;
