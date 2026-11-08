import React, { useState, useEffect } from 'react';
import { FareQuote } from '../types';

interface PriceBreakdownProps {
  quote: FareQuote;
  onExpired?: () => void;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ quote, onExpired }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(300);

  useEffect(() => {
    const calculateSeconds = () => {
      const expiry = new Date(quote.expiresAt).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    setSecondsLeft(calculateSeconds());

    const interval = setInterval(() => {
      const remaining = calculateSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quote, onExpired]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm font-semibold text-slate-700">Chi tiết cước tính</span>
        <div className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
          secondsLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'
        }`}>
          Hết hạn sau: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Giá mở cửa:</span>
          <span className="font-medium text-slate-800">{formatVND(quote.baseFare)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cước khoảng cách ({quote.distanceKm} km):</span>
          <span className="font-medium text-slate-800">{formatVND(quote.distanceFare)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cước thời gian ({quote.durationMinutes} phút):</span>
          <span className="font-medium text-slate-800">{formatVND(quote.timeFare)}</span>
        </div>

        {quote.surgeMultiplier > 1.0 && (
          <div className="flex justify-between items-center text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
            <span className="flex items-center gap-1 font-medium">
              <span className="text-sm">⚡</span> Surge Pricing ({quote.surgeMultiplier}x):
            </span>
            <span className="font-bold">+{Math.round((quote.surgeMultiplier - 1) * 100)}%</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t flex justify-between items-center">
        <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
        <span className="text-lg font-extrabold text-blue-600">{formatVND(quote.totalFare)}</span>
      </div>
    </div>
  );
};
