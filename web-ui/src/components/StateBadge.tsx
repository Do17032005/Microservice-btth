import React from 'react';
import { TripStatus, DriverAvailabilityStatus, DriverReviewStatus, PaymentStatus } from '../types';

interface StateBadgeProps {
  status: TripStatus | DriverAvailabilityStatus | DriverReviewStatus | PaymentStatus | string;
  type?: 'trip' | 'driver' | 'review' | 'payment';
}

export const StateBadge: React.FC<StateBadgeProps> = ({ status, type = 'trip' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Trip Status
      case 'CREATED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MATCHING':
        return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      case 'ACCEPTED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PICKING_UP':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ARRIVED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'IN_TRIP':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'NO_DRIVER':
        return 'bg-red-100 text-red-800 border-red-200';

      // Driver Availability
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'OFFLINE':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'OFFERED':
        return 'bg-amber-100 text-amber-700 border-amber-300 animate-bounce';
      case 'BUSY':
        return 'bg-red-100 text-red-700 border-red-300';

      // Review Status
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'REJECTED':
      case 'SUSPENDED':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-300';

      // Payment Status
      case 'SUCCEEDED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'FAILED':
        return 'bg-rose-100 text-rose-700 border-rose-300';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};
