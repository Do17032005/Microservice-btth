import React, { useState } from 'react';
import {
  DriverProfile,
  DriverOffer,
  Trip,
  DriverAvailabilityStatus,
  Wallet,
  WalletEntry
} from '../types';
import { StateBadge } from '../components/StateBadge';
import { OfferCountdownModal } from '../components/OfferCountdownModal';
import { ApiClient } from '../services/apiClient';

export const DriverPortal: React.FC = () => {
  // Current driver profile
  const [profile, setProfile] = useState<DriverProfile>({
    id: 'drv-uuid-8899',
    userId: 'usr-driver-8899',
    licenseNumber: '29-B1 088.99',
    reviewStatus: 'APPROVED',
    availabilityStatus: 'OFFLINE',
    rating: 4.88,
    totalTrips: 142,
    activeVehicle: {
      id: 'veh-01',
      driverId: 'drv-uuid-8899',
      vehicleType: 'RIDE_MOTORBIKE',
      brand: 'Honda',
      model: 'Wave Alpha',
      color: 'Đỏ Đen',
      plateNumber: '29B1-888.99',
      isActive: true
    },
    version: 12
  });

  // Wallet state
  const [wallet, setWallet] = useState<Wallet>({
    id: 'wal-8899',
    driverId: 'drv-uuid-8899',
    balance: 850000,
    holdBalance: 0,
    availableBalance: 850000,
    version: 45
  });

  const [walletEntries, setWalletEntries] = useState<WalletEntry[]>([
    {
      id: 'entry-01',
      walletId: 'wal-8899',
      entryType: 'TRIP_EARNING',
      amount: 45600,
      balanceAfter: 850000,
      referenceId: 'TRIP-8821',
      description: 'Cước hoàn thành chuyến đi (80% net)',
      createdAt: '2026-10-14 06:45:12'
    },
    {
      id: 'entry-02',
      walletId: 'wal-8899',
      entryType: 'PLATFORM_FEE',
      amount: -11400,
      balanceAfter: 804400,
      referenceId: 'TRIP-8821',
      description: 'Phí dịch vụ nền tảng (20% commission)',
      createdAt: '2026-10-14 06:45:12'
    }
  ]);

  // Incoming offer simulation state
  const [activeOffer, setActiveOffer] = useState<DriverOffer | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(15);
  const [isAccepting, setIsAccepting] = useState(false);

  // Active in-trip progression
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [otpInput, setOtpInput] = useState('');

  // Toggle Availability
  const handleToggleOnline = async () => {
    if (profile.reviewStatus !== 'APPROVED') {
      alert('Tài khoản chưa được duyệt hồ sơ! Vui lòng chờ Admin phê duyệt.');
      return;
    }

    if (profile.availabilityStatus === 'BUSY' || profile.availabilityStatus === 'OFFERED') {
      alert('Không thể đổi trạng thái khi đang có chuyến hoặc đang nhận cuốc!');
      return;
    }

    const nextStatus: DriverAvailabilityStatus =
      profile.availabilityStatus === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';

    try {
      await ApiClient.updateDriverStatus(profile.id, nextStatus as any);
    } catch (e) {
      // offline fallback
    }

    setProfile((prev) => ({ ...prev, availabilityStatus: nextStatus }));

    // Trigger an offer test after 3 seconds if going online
    if (nextStatus === 'AVAILABLE') {
      setTimeout(() => {
        simulateIncomingOffer();
      }, 3000);
    }
  };

  // Simulate Incoming Offer
  const simulateIncomingOffer = () => {
    const offer: DriverOffer = {
      id: 'off-' + Date.now(),
      tripId: 'trip-9021',
      driverId: profile.id,
      serviceType: 'RIDE_MOTORBIKE',
      pickupLocation: { latitude: 21.0368, longitude: 105.7836, address: '144 Xuân Thủy, Cầu Giấy' },
      dropoffLocation: { latitude: 20.9995, longitude: 105.8423, address: 'Bệnh viện Bạch Mai' },
      distanceToPickupKm: 0.8,
      estimatedEarnings: 45600, // 80% of 57,000 VND
      totalTripFare: 57000,
      status: 'OFFERED',
      expiresAt: new Date(Date.now() + 15000).toISOString()
    };
    setActiveOffer(offer);
    setProfile((prev) => ({ ...prev, availabilityStatus: 'OFFERED' }));
    setRemainingSeconds(15);

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActiveOffer(null);
          setProfile((p) => ({ ...p, availabilityStatus: 'AVAILABLE' }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Accept Offer
  const handleAcceptOffer = async () => {
    if (!activeOffer) return;
    setIsAccepting(true);
    try {
      await ApiClient.acceptOffer(activeOffer.id, profile.id);
    } catch (e) {
      // offline fallback
    }

    // Assign active trip
    const trip: Trip = {
      id: activeOffer.tripId,
      tripCode: 'RHL-9021',
      customerId: 'c101-uuid-cust-001',
      driverId: profile.id,
      serviceType: activeOffer.serviceType,
      status: 'ACCEPTED',
      pickupLocation: activeOffer.pickupLocation,
      dropoffLocation: activeOffer.dropoffLocation,
      estimatedFare: activeOffer.totalTripFare,
      createdAt: new Date().toISOString(),
      version: 1
    };

    setActiveTrip(trip);
    setActiveOffer(null);
    setProfile((prev) => ({ ...prev, availabilityStatus: 'BUSY' }));
    setIsAccepting(false);
  };

  // Reject Offer
  const handleRejectOffer = () => {
    setActiveOffer(null);
    setProfile((prev) => ({ ...prev, availabilityStatus: 'AVAILABLE' }));
  };

  // In-Trip State Machine Progression
  const handleProgressTrip = async (nextStatus: any) => {
    if (!activeTrip) return;

    if (nextStatus === 'COMPLETED' && activeTrip.serviceType === 'DELIVERY_MOTORBIKE' && !otpInput) {
      alert('Vui lòng nhập mã OTP xác nhận bàn giao hàng từ người nhận (TBD-08)!');
      return;
    }

    try {
      await ApiClient.updateTripStatus(activeTrip.id, nextStatus, profile.id);
    } catch (e) {
      // offline fallback
    }

    if (nextStatus === 'COMPLETED') {
      // Credit wallet
      const fare = activeTrip.estimatedFare;
      const netEarnings = Math.round(fare * 0.8);
      const platformFee = fare - netEarnings;

      const newBalance = wallet.balance + netEarnings;
      setWallet((prev) => ({
        ...prev,
        balance: newBalance,
        availableBalance: newBalance
      }));

      setWalletEntries((prev) => [
        {
          id: 'entry-' + Date.now(),
          walletId: wallet.id,
          entryType: 'TRIP_EARNING',
          amount: netEarnings,
          balanceAfter: newBalance,
          referenceId: activeTrip.tripCode,
          description: `Thu nhập cuốc ${activeTrip.tripCode} (80% net)`,
          createdAt: new Date().toLocaleString()
        },
        ...prev
      ]);

      setActiveTrip(null);
      setProfile((prev) => ({
        ...prev,
        availabilityStatus: 'AVAILABLE',
        totalTrips: prev.totalTrips + 1
      }));
      alert(`Đã hoàn thành chuyến đi! Bạn nhận được ${netEarnings.toLocaleString('vi-VN')} VNĐ vào ví.`);
    } else {
      setActiveTrip((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner: Driver Status, Profile, and Availability Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Trần Văn Mạnh</h2>
              <StateBadge status={profile.reviewStatus} type="review" />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Biển số: <strong className="font-mono text-slate-800">{profile.activeVehicle?.plateNumber}</strong></span>
              <span>•</span>
              <span>⭐ {profile.rating} ({profile.totalTrips} chuyến)</span>
              <span>•</span>
              <span className="font-mono">ID: {profile.id}</span>
            </div>
          </div>
        </div>

        {/* Online / Offline Switch */}
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Trạng thái trực tuyến</span>
            <span className="text-xs font-bold text-slate-800">
              {profile.availabilityStatus === 'AVAILABLE' && '🟢 Đang Sẵn Sàng Nhận Cuốc'}
              {profile.availabilityStatus === 'OFFLINE' && '⚪ Đang Tắt Trực Tuyến'}
              {profile.availabilityStatus === 'OFFERED' && '🟡 Đang Xem Cuốc Đến'}
              {profile.availabilityStatus === 'BUSY' && '🔴 Đang Trong Chuyến Đi'}
            </span>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={profile.availabilityStatus === 'BUSY' || profile.availabilityStatus === 'OFFERED'}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              profile.availabilityStatus === 'OFFLINE'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
            }`}
          >
            {profile.availabilityStatus === 'OFFLINE' ? 'BẬT ONLINE' : 'TẮT OFFLINE'}
          </button>
        </div>
      </div>

      {/* Main Grid: Active In-Trip Navigation vs Wallet Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active In-Trip Status Machine (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">🧭</span>
              Điều Hướng & Hành Trình Chuyến Xe Hiện Tại
            </h3>

            {activeTrip ? (
              <div className="space-y-5">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-xs text-amber-800 font-semibold block">Mã đơn vận hành</span>
                    <span className="text-base font-mono font-extrabold text-amber-950">
                      {activeTrip.tripCode}
                    </span>
                  </div>
                  <StateBadge status={activeTrip.status} />
                </div>

                {/* Step-by-Step State Transition Stepper */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { key: 'ACCEPTED', label: '1. Đã Nhận' },
                    { key: 'PICKING_UP', label: '2. Đang Đến Đón' },
                    { key: 'ARRIVED', label: '3. Đã Đến Đón' },
                    { key: 'IN_TRIP', label: '4. Đang Chở Khách' }
                  ].map((step, idx) => {
                    const activeStatuses = ['ACCEPTED', 'PICKING_UP', 'ARRIVED', 'IN_TRIP', 'COMPLETED'];
                    const currentIdx = activeStatuses.indexOf(activeTrip.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = activeTrip.status === step.key;

                    return (
                      <div
                        key={step.key}
                        className={`p-2.5 rounded-xl border ${
                          isCurrent
                            ? 'bg-amber-500 text-white font-bold border-amber-600 shadow'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {step.label}
                      </div>
                    );
                  })}
                </div>

                {/* Addresses */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-500">Đón tại:</span>
                    <strong className="text-slate-900">{activeTrip.pickupLocation.address}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-500">Trả tại:</span>
                    <strong className="text-slate-900">{activeTrip.dropoffLocation.address}</strong>
                  </div>
                </div>

                {/* Delivery OTP verification input */}
                {activeTrip.serviceType === 'DELIVERY_MOTORBIKE' && activeTrip.status === 'IN_TRIP' && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                    <span className="text-xs font-bold text-purple-900 block">
                      Xác thực OTP người nhận trước khi hoàn tất (TBD-08)
                    </span>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Nhập 4 số OTP từ người nhận hàng..."
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full text-sm font-mono tracking-widest text-center px-3 py-2 bg-white border border-purple-300 rounded-lg"
                    />
                  </div>
                )}

                {/* State Machine Action Transitions */}
                <div className="pt-2">
                  {activeTrip.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleProgressTrip('PICKING_UP')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20"
                    >
                      BẮT ĐẦU ĐI ĐÓN KHÁCH (PICKING_UP)
                    </button>
                  )}

                  {activeTrip.status === 'PICKING_UP' && (
                    <button
                      onClick={() => handleProgressTrip('ARRIVED')}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md shadow-teal-500/20"
                    >
                      TÔI ĐÃ ĐẾN ĐIỂM ĐÓN (ARRIVED)
                    </button>
                  )}

                  {activeTrip.status === 'ARRIVED' && (
                    <button
                      onClick={() => handleProgressTrip('IN_TRIP')}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-500/20"
                    >
                      KHÁCH ĐÃ LÊN XE / BẮT ĐẦU CHUYẾN (IN_TRIP)
                    </button>
                  )}

                  {activeTrip.status === 'IN_TRIP' && (
                    <button
                      onClick={() => handleProgressTrip('COMPLETED')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20"
                    >
                      HOÀN THÀNH CHUYẾN & QUYẾT TOÁN CƯỚC (COMPLETED)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <span className="text-4xl block">💤</span>
                <p className="text-sm font-medium">Hiện không có cuốc xe nào đang chạy.</p>
                <p className="text-xs text-slate-500">
                  {profile.availabilityStatus === 'AVAILABLE'
                    ? 'Hệ thống đang quét phân phối cuốc mới cho bạn theo bán kính 3km...'
                    : 'Hãy chuyển trạng thái sang "BẬT ONLINE" để nhận cuốc xe.'}
                </p>
                {profile.availabilityStatus === 'AVAILABLE' && (
                  <button
                    onClick={simulateIncomingOffer}
                    className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Mô phỏng cuốc xe mới gửi đến
                  </button>
                )}
              </div>
            )}
          </div>

          {/* KYC Document Management Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">📋</span>
              Hồ Sơ & Giấy Tờ Xác Minh (KYC TBD-11)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'CCCD Gắn Chip', number: '001201019921', status: 'APPROVED' },
                { title: 'Bằng Lái Xe (A1/A2)', number: 'B2-99120381', status: 'APPROVED' },
                { title: 'Đăng Ký Xe Máy', number: 'ĐK-29B1-88899', status: 'APPROVED' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{doc.title}</span>
                    <StateBadge status={doc.status} type="review" />
                  </div>
                  <span className="font-mono text-slate-500 block">Số: {doc.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Wallet & Earnings Dashboard (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">💰</span>
                Ví Thu Nhập Tài Xế
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                80% Net
              </span>
            </h3>

            {/* Balance Card */}
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
              <span className="text-xs text-emerald-100 block">Số dư khả dụng (Ledger Balance)</span>
              <span className="text-2xl font-black block mt-1 tracking-tight">
                {formatVND(wallet.availableBalance)}
              </span>
              <div className="flex justify-between items-center text-[11px] text-emerald-100/90 pt-3 mt-3 border-t border-white/20">
                <span>Hạn mức rút tối thiểu: 100.000 VNĐ</span>
                <button
                  onClick={() => alert('Yêu cầu rút tiền về tài khoản ngân hàng đã được ghi nhận!')}
                  className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded-lg hover:bg-emerald-50"
                >
                  Rút Tiền
                </button>
              </div>
            </div>

            {/* Commission Policy Note */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
              <strong>Chính sách phân chia doanh thu (TBD-10):</strong>
              <div className="flex justify-between mt-1 text-slate-700">
                <span>Thu nhập tài xế: <strong>80%</strong></span>
                <span>Chiết khấu sàn: <strong>20%</strong></span>
              </div>
            </div>

            {/* Wallet Ledger History */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Lịch Sử Biến Động Sổ Cái Bất Biến (Immutable Ledger)
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {walletEntries.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">{e.description}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {e.referenceId} • {e.createdAt}
                      </span>
                    </div>
                    <span
                      className={`font-bold font-mono ${
                        e.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {e.amount > 0 ? `+${formatVND(e.amount)}` : formatVND(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Offer Countdown Modal */}
      {activeOffer && (
        <OfferCountdownModal
          offer={activeOffer}
          remainingSeconds={remainingSeconds}
          isAccepting={isAccepting}
          onAccept={handleAcceptOffer}
          onReject={handleRejectOffer}
        />
      )}
    </div>
  );
};
