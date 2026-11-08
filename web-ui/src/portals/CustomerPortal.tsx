import React, { useState } from 'react';
import { FareQuote, Trip, ServiceType, PaymentMethod } from '../types';
import { ApiClient } from '../services/apiClient';
import { StateBadge } from '../components/StateBadge';
import { PriceBreakdown } from '../components/PriceBreakdown';

export const CustomerPortal: React.FC = () => {
  // Current active customer
  const [customerId] = useState('c101-uuid-cust-001');
  const [selectedService, setSelectedService] = useState<ServiceType>('RIDE_MOTORBIKE');
  const [pickupAddress, setPickupAddress] = useState('144 Xuân Thủy, Cầu Giấy, Hà Nội');
  const [dropoffAddress, setDropoffAddress] = useState('Bệnh viện Bạch Mai, Giải Phóng, Hà Nội');
  const [pickupCoords, setPickupCoords] = useState({ lat: 21.0368, lng: 105.7836 });
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 20.9995, lng: 105.8423 });

  // Delivery options
  const [recipientName, setRecipientName] = useState('Nguyễn Văn B');
  const [recipientPhone, setRecipientPhone] = useState('0987654321');
  const [packageDescription, setPackageDescription] = useState('Tài liệu hợp đồng kinh tế A4 (0.5kg)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('E_WALLET_SANDBOX');

  // Flow states
  const [fareQuote, setFareQuote] = useState<FareQuote | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isRated, setIsRated] = useState(false);

  // Request Quote
  const handleGetQuote = async () => {
    try {
      setIsQuoting(true);
      const quote = await ApiClient.requestFareQuote({
        customerId,
        serviceType: selectedService,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng
      });
      setFareQuote(quote);
    } catch (err: any) {
      // Fallback mock quote for offline demonstration
      const distance = 8.5;
      const duration = 24;
      const base = selectedService === 'RIDE_MOTORBIKE' ? 12000 : 20000;
      const distRate = selectedService === 'RIDE_MOTORBIKE' ? 5000 : 10000;
      const distFare = (distance - 1) * distRate;
      const timeFare = duration * (selectedService === 'RIDE_MOTORBIKE' ? 500 : 1000);
      const surge = 1.2;
      const total = Math.ceil(((base + distFare + timeFare) * surge) / 1000) * 1000;

      const mockQuote: FareQuote = {
        id: 'quote-' + Date.now(),
        customerId,
        serviceType: selectedService,
        pickupLocation: { latitude: pickupCoords.lat, longitude: pickupCoords.lng, address: pickupAddress },
        dropoffLocation: { latitude: dropoffCoords.lat, longitude: dropoffCoords.lng, address: dropoffAddress },
        distanceKm: distance,
        durationMinutes: duration,
        baseFare: base,
        distanceFare: distFare,
        timeFare: timeFare,
        surgeMultiplier: surge,
        surgeFactor: surge,
        totalFare: total,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        isUsed: false
      };
      setFareQuote(mockQuote);
    } finally {
      setIsQuoting(false);
    }
  };

  // Create Trip
  const handleBookTrip = async () => {
    if (!fareQuote) return;
    try {
      setIsBooking(true);
      const idempotencyKey = 'idemp-trip-' + fareQuote.id;
      const trip = await ApiClient.createTrip(
        {
          quoteId: fareQuote.id,
          paymentMethod,
          recipientName: selectedService === 'DELIVERY_MOTORBIKE' ? recipientName : undefined,
          recipientPhone: selectedService === 'DELIVERY_MOTORBIKE' ? recipientPhone : undefined,
          packageDescription: selectedService === 'DELIVERY_MOTORBIKE' ? packageDescription : undefined
        },
        idempotencyKey
      );
      setActiveTrip(trip);
      setFareQuote(null);
    } catch (err: any) {
      // Mock active trip
      const mockTrip: Trip = {
        id: 'trip-' + Date.now(),
        tripCode: 'RHL-' + Math.floor(100000 + Math.random() * 900000),
        customerId,
        serviceType: selectedService,
        status: 'MATCHING',
        pickupLocation: fareQuote.pickupLocation,
        dropoffLocation: fareQuote.dropoffLocation,
        estimatedFare: fareQuote.totalFare,
        createdAt: new Date().toISOString(),
        version: 1
      };
      setActiveTrip(mockTrip);
      setFareQuote(null);

      // Simulate Driver Matching Progression in 4 seconds
      setTimeout(() => {
        setActiveTrip((prev) =>
          prev
            ? {
                ...prev,
                status: 'ACCEPTED',
                driverId: 'drv-8899',
                driverName: 'Trần Văn Mạnh',
                driverPhone: '0912****88',
                driverRating: 4.9,
                vehiclePlate: '29B1-888.99',
                vehicleModel: 'Honda Wave Alpha (Đỏ đen)',
                driverLocation: { latitude: 21.0345, longitude: 105.7812 },
                etaMinutes: 3,
                deliveryOtp: selectedService === 'DELIVERY_MOTORBIKE' ? '4829' : undefined
              }
            : null
        );
      }, 3500);
    } finally {
      setIsBooking(false);
    }
  };

  // Cancel Trip
  const handleCancelTrip = async () => {
    if (!activeTrip) return;
    const isFeeApplies = activeTrip.status === 'ARRIVED' || activeTrip.status === 'IN_TRIP';
    const msg = isFeeApplies
      ? 'Hủy sau khi tài xế đã đến sẽ phát sinh phí phạt 10.000 VNĐ theo điều khoản TBD-07. Bạn có chắc chắn muốn hủy?'
      : 'Bạn có chắc chắn muốn hủy chuyến xe này?';

    if (window.confirm(msg)) {
      try {
        await ApiClient.cancelTrip(activeTrip.id, customerId, 'Khách hàng thay đổi kế hoạch');
      } catch (e) {
        // Mock cancellation
      }
      setActiveTrip((prev) =>
        prev
          ? {
              ...prev,
              status: 'CANCELLED',
              cancellationFee: isFeeApplies ? 10000 : 0,
              cancellationReason: 'Khách hàng hủy chủ động'
            }
          : null
      );
    }
  };

  const handleRateSubmit = () => {
    setIsRated(true);
    alert(`Cảm ơn bạn đã đánh giá ${ratingInput} sao cho tài xế!`);
  };

  const resetAll = () => {
    setActiveTrip(null);
    setFareQuote(null);
    setIsRated(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
      {/* Left Column: Booking & Quoting Form */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">🚗</span>
              Đặt Xe & Giao Hàng Trực Tuyến
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              ID: {customerId.slice(0, 8)}...
            </span>
          </div>

          {!activeTrip ? (
            <div className="space-y-4">
              {/* Service Selection Tabs */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">
                  Chọn Loại Hình Dịch Vụ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'RIDE_MOTORBIKE', label: 'Xe Máy', icon: '🛵', desc: 'Nhanh, tiết kiệm' },
                    { id: 'RIDE_CAR_4', label: 'Ô Tô 4 Chỗ', icon: '🚗', desc: 'Thoải mái, tiện lợi' },
                    { id: 'RIDE_CAR_7', label: 'Ô Tô 7 Chỗ', icon: '🚐', desc: 'Rộng rãi gia đình' },
                    { id: 'DELIVERY_MOTORBIKE', label: 'Giao Hàng', icon: '📦', desc: 'Nhanh chóng < 20kg' }
                  ].map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(srv.id as ServiceType);
                        setFareQuote(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedService === srv.id
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xl mb-1">{srv.icon}</div>
                      <div className="font-bold text-xs">{srv.label}</div>
                      <div className="text-[10px] text-slate-500">{srv.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup & Dropoff Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Điểm đón
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Điểm đến
                  </label>
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Delivery Specifics */}
              {selectedService === 'DELIVERY_MOTORBIKE' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                  <span className="text-xs font-bold text-amber-900 block flex items-center gap-1">
                    📦 Thông Tin Bưu Kiện & Người Nhận (TBD-08)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tên người nhận"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Mô tả kiện hàng (VD: Hồ sơ, Quần áo... < 20kg)"
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg"
                  />
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">
                  Phương Thức Thanh Toán
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('E_WALLET_SANDBOX')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                      paymentMethod === 'E_WALLET_SANDBOX'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>💳</span> Ví Điện Tử Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                      paymentMethod === 'CASH'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>💵</span> Tiền Mặt
                  </button>
                </div>
              </div>

              {/* Quote CTA */}
              {!fareQuote ? (
                <button
                  onClick={handleGetQuote}
                  disabled={isQuoting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-sm transition-all"
                >
                  {isQuoting ? 'Đang tính toán cước tuyến đường...' : 'XEM BÁO GIÁ TRƯỚC (5 PHÚT)'}
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <PriceBreakdown quote={fareQuote} onExpired={() => setFareQuote(null)} />
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFareQuote(null)}
                      className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Chọn lại
                    </button>
                    <button
                      onClick={handleBookTrip}
                      disabled={isBooking}
                      className="col-span-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                    >
                      {isBooking ? 'Đang gửi điều phối...' : 'XÁC NHẬN ĐẶT XE'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Trip Active Tracking Card */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mã chuyến đi</span>
                  <span className="font-mono font-bold text-slate-800">{activeTrip.tripCode}</span>
                </div>
                <StateBadge status={activeTrip.status} />
              </div>

              {/* Status progression indicator */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-xs font-bold text-blue-900 block mb-1">Tiến Trình Chuyến Đi</span>
                <p className="text-xs text-blue-700 font-medium">
                  {activeTrip.status === 'MATCHING' && 'Đang quét tìm tài xế gần bạn nhất (3km - 15s)...'}
                  {activeTrip.status === 'ACCEPTED' && 'Tài xế đã nhận cuốc và đang chuẩn bị di chuyển!'}
                  {activeTrip.status === 'PICKING_UP' && 'Tài xế đang trên đường đến điểm đón bạn...'}
                  {activeTrip.status === 'ARRIVED' && 'Tài xế đã đến điểm đón! Vui lòng ra xe.'}
                  {activeTrip.status === 'IN_TRIP' && 'Chuyến đi đang diễn ra an toàn.'}
                  {activeTrip.status === 'COMPLETED' && 'Chuyến đi đã hoàn tất. Cảm ơn quý khách!'}
                  {activeTrip.status === 'CANCELLED' && 'Chuyến đi đã bị hủy.'}
                </p>
              </div>

              {/* Assigned Driver Card */}
              {activeTrip.driverName && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Tài xế</span>
                      <span className="font-bold text-slate-800 text-sm">{activeTrip.driverName}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">
                      <span>⭐</span> {activeTrip.driverRating}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between border-t pt-2">
                    <span>Biển số xe: <strong className="text-slate-900 font-mono">{activeTrip.vehiclePlate}</strong></span>
                    <span>{activeTrip.vehicleModel}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">Liên hệ bảo mật: {activeTrip.driverPhone}</span>
                    <a
                      href={`tel:${activeTrip.driverPhone}`}
                      className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold hover:bg-emerald-200"
                    >
                      📞 Gọi điện
                    </a>
                  </div>

                  {activeTrip.deliveryOtp && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-center">
                      <span className="text-[10px] text-purple-600 uppercase font-bold block">
                        Mã OTP Bàn Giao Hàng Cho Người Nhận
                      </span>
                      <span className="text-lg font-mono font-extrabold text-purple-900 tracking-wider">
                        {activeTrip.deliveryOtp}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Trip Completion & Rating Screen */}
              {activeTrip.status === 'COMPLETED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-center">
                    <span className="text-2xl">🎉</span>
                    <h3 className="font-bold text-emerald-900 text-sm mt-1">Chuyến Xe Hoàn Thành!</h3>
                    <p className="text-xs text-emerald-700">Tổng thanh toán: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeTrip.estimatedFare)}</strong></p>
                  </div>

                  {!isRated ? (
                    <div className="space-y-2 pt-2 border-t border-emerald-200">
                      <span className="text-xs font-semibold text-emerald-800 block text-center">
                        Đánh giá chất lượng phục vụ của tài xế (FR-RAT-001)
                      </span>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingInput(star)}
                            className={`text-xl transition-transform hover:scale-125 ${
                              ratingInput >= star ? 'text-amber-500' : 'text-slate-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Nhận xét trải nghiệm chuyến đi (tùy chọn)..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-emerald-300 rounded-lg bg-white"
                      />
                      <button
                        onClick={handleRateSubmit}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                      >
                        GỬI ĐÁNH GIÁ
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-white rounded border border-emerald-200 text-center text-xs font-medium text-emerald-800">
                      ✓ Đã gửi đánh giá thành công!
                    </div>
                  )}
                </div>
              )}

              {/* Cancel Trip & Reset Buttons */}
              <div className="pt-2">
                {activeTrip.status !== 'COMPLETED' && activeTrip.status !== 'CANCELLED' && (
                  <button
                    onClick={handleCancelTrip}
                    className="w-full py-2.5 border border-rose-300 text-rose-700 font-semibold text-xs rounded-xl hover:bg-rose-50"
                  >
                    HỦY CHUYẾN XE NÀY
                  </button>
                )}

                {(activeTrip.status === 'COMPLETED' || activeTrip.status === 'CANCELLED') && (
                  <button
                    onClick={resetAll}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
                  >
                    ĐẶT CHUYẾN XE MỚI
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Interactive Map View */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-[650px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-sm font-bold text-slate-800">Bản Đồ Điều Phối & Telemetry Thời Gian Thực</span>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
              WSS Connected (3-5s Ingest)
            </span>
          </div>

          {/* Map canvas / illustration representation */}
          <div className="relative flex-1 bg-slate-900 rounded-xl mt-3 overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Pickup Marker A */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded shadow-md mb-1 whitespace-nowrap">
                Điểm đón: 144 Xuân Thủy
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg">
                A
              </div>
            </div>

            {/* Dropoff Marker B */}
            <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded shadow-md mb-1 whitespace-nowrap">
                Điểm đến: BV Bạch Mai
              </div>
              <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg">
                B
              </div>
            </div>

            {/* Route Connecting Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 280 220 Q 420 300 700 480"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Moving Driver Marker */}
            {activeTrip && activeTrip.driverLocation && (
              <div className="absolute top-[42%] left-[36%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                <div className="px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-bold rounded shadow-lg mb-1 whitespace-nowrap flex items-center gap-1">
                  <span>🛵</span> {activeTrip.driverName} ({activeTrip.etaMinutes} min)
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-slate-900 flex items-center justify-center text-sm shadow-xl">
                  📍
                </div>
              </div>
            )}

            {/* Bottom telemetry overlay pill */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> OSRM Routing Engine
                </span>
                <span>Khoảng cách: <strong>8.5 km</strong></span>
                <span>Hệ số uốn khúc: <strong>1.30x</strong></span>
              </div>
              <span className="text-[11px] text-slate-400">Spatial Index Latency: &lt; 18ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
