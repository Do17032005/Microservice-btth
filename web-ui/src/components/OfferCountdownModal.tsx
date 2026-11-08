import React from 'react';
import { DriverOffer } from '../types';

interface OfferCountdownModalProps {
  offer: DriverOffer;
  remainingSeconds: number;
  isAccepting: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const OfferCountdownModal: React.FC<OfferCountdownModalProps> = ({
  offer,
  remainingSeconds,
  isAccepting,
  onAccept,
  onReject
}) => {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const progressPercent = Math.max(0, (remainingSeconds / 15) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200">
        {/* Top Header & Countdown Progress Bar */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white relative">
          <div className="flex justify-between items-center">
            <span className="font-bold tracking-wide uppercase text-xs bg-white/20 px-2 py-0.5 rounded">
              {offer.serviceType}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold bg-white text-orange-600 px-2.5 py-0.5 rounded-full shadow-sm">
              <span>⏱️</span>
              <span>{remainingSeconds}s</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold mt-2">CÓ CUỐC XE MỚI!</h2>
          <p className="text-amber-100 text-xs">Vui lòng phản hồi trước khi hết thời gian</p>

          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
            <div
              className="h-full bg-yellow-300 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Offer Body */}
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-baseline bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Thu nhập dự kiến (80% ròng)</span>
              <span className="text-2xl font-black text-emerald-600">
                {formatVND(offer.estimatedEarnings)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Khoảng cách đón</span>
              <span className="text-sm font-bold text-slate-800">
                {offer.distanceToPickupKm} km
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                A
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase">Điểm đón</span>
                <p className="text-slate-800 font-medium">
                  {offer.pickupLocation.address || `${offer.pickupLocation.latitude.toFixed(4)}, ${offer.pickupLocation.longitude.toFixed(4)}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                B
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase">Điểm đến</span>
                <p className="text-slate-800 font-medium">
                  {offer.dropoffLocation.address || `${offer.dropoffLocation.latitude.toFixed(4)}, ${offer.dropoffLocation.longitude.toFixed(4)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onReject}
              disabled={isAccepting}
              className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 active:scale-95 transition-all"
            >
              Từ chối
            </button>
            <button
              onClick={onAccept}
              disabled={isAccepting}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              {isAccepting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang khóa cuốc...
                </>
              ) : (
                'NHẬN CUỐC'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
