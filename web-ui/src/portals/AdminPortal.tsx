import React, { useState } from 'react';
import {
  DriverProfile,
  Trip,
  PricingRule,
  AuditRecord,
  TripStatus,
  ServiceType
} from '../types';
import { StateBadge } from '../components/StateBadge';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'trips' | 'pricing' | 'audit'>('drivers');

  // Pending Driver Review List
  const [drivers, setDrivers] = useState<DriverProfile[]>([
    {
      id: 'drv-001',
      userId: 'usr-901',
      licenseNumber: '29-B1 445.89',
      reviewStatus: 'PENDING_REVIEW',
      availabilityStatus: 'OFFLINE',
      rating: 5.0,
      totalTrips: 0,
      activeVehicle: {
        id: 'v-01',
        driverId: 'drv-001',
        vehicleType: 'RIDE_MOTORBIKE',
        brand: 'Honda',
        model: 'Air Blade 125',
        color: 'Xám Xi Măng',
        plateNumber: '29B1-445.89',
        isActive: true
      },
      documents: [
        {
          id: 'doc-01',
          driverId: 'drv-001',
          documentType: 'CITIZEN_ID',
          documentNumber: '001099014522',
          fileUrl: '/uploads/cccd_01.jpg',
          status: 'PENDING_REVIEW'
        },
        {
          id: 'doc-02',
          driverId: 'drv-001',
          documentType: 'DRIVER_LICENSE',
          documentNumber: 'A1-20948123',
          fileUrl: '/uploads/gplx_01.jpg',
          status: 'PENDING_REVIEW'
        }
      ],
      version: 1
    },
    {
      id: 'drv-002',
      userId: 'usr-902',
      licenseNumber: '30-E 888.12',
      reviewStatus: 'PENDING_REVIEW',
      availabilityStatus: 'OFFLINE',
      rating: 5.0,
      totalTrips: 0,
      activeVehicle: {
        id: 'v-02',
        driverId: 'drv-002',
        vehicleType: 'RIDE_CAR_4',
        brand: 'Hyundai',
        model: 'Accent 2024',
        color: 'Trắng',
        plateNumber: '30E-888.12',
        isActive: true
      },
      version: 1
    }
  ]);

  // Trips List
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 'trip-101',
      tripCode: 'RHL-8821',
      customerId: 'c101-uuid-cust-001',
      driverId: 'drv-uuid-8899',
      serviceType: 'RIDE_MOTORBIKE',
      status: 'COMPLETED',
      pickupLocation: { latitude: 21.0368, longitude: 105.7836, address: '144 Xuân Thủy, Cầu Giấy' },
      dropoffLocation: { latitude: 20.9995, longitude: 105.8423, address: 'Bệnh viện Bạch Mai' },
      estimatedFare: 57000,
      finalFare: 57000,
      driverName: 'Trần Văn Mạnh',
      driverPhone: '0912****88',
      vehiclePlate: '29B1-888.99',
      createdAt: '2026-10-14 06:15:30',
      completedAt: '2026-10-14 06:45:12',
      version: 5
    },
    {
      id: 'trip-102',
      tripCode: 'RHL-9022',
      customerId: 'c102-uuid-cust-002',
      serviceType: 'DELIVERY_MOTORBIKE',
      status: 'MATCHING',
      pickupLocation: { latitude: 21.0285, longitude: 105.8542, address: 'Bưu điện Bờ Hồ, Hoàn Kiếm' },
      dropoffLocation: { latitude: 21.0023, longitude: 105.8145, address: 'Đại học Thăng Long, Hoàng Mai' },
      estimatedFare: 42000,
      deliveryOtp: '7712',
      createdAt: '2026-10-14 07:12:00',
      version: 1
    }
  ]);

  // Pricing Rules
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: 'rule-01',
      region: 'HANOI_URBAN',
      serviceType: 'RIDE_MOTORBIKE',
      baseFare: 12000,
      perKmRate: 5000,
      perMinuteRate: 500,
      minFare: 15000,
      cancellationFee: 10000,
      surgeFloor: 1.0,
      surgeCeiling: 2.5,
      active: true
    },
    {
      id: 'rule-02',
      region: 'HANOI_URBAN',
      serviceType: 'RIDE_CAR_4',
      baseFare: 20000,
      perKmRate: 10000,
      perMinuteRate: 1000,
      minFare: 25000,
      cancellationFee: 15000,
      surgeFloor: 1.0,
      surgeCeiling: 2.5,
      active: true
    },
    {
      id: 'rule-03',
      region: 'HANOI_URBAN',
      serviceType: 'DELIVERY_MOTORBIKE',
      baseFare: 15000,
      perKmRate: 5500,
      perMinuteRate: 400,
      minFare: 18000,
      cancellationFee: 10000,
      surgeFloor: 1.0,
      surgeCeiling: 2.5,
      active: true
    }
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    {
      id: 'audit-001',
      actorId: 'admin-sec-01',
      actorRole: 'ROLE_ADMIN',
      action: 'APPROVE_DRIVER_KYC',
      targetType: 'DRIVER_PROFILE',
      targetId: 'drv-uuid-8899',
      delta: 'status: PENDING_REVIEW -> APPROVED',
      correlationId: 'req-corr-99214',
      timestamp: '2026-10-14 05:30:11'
    },
    {
      id: 'audit-002',
      actorId: 'system-dispatch',
      actorRole: 'SYSTEM',
      action: 'ATOMIC_OFFER_ACCEPTED',
      targetType: 'DRIVER_OFFER',
      targetId: 'off-trip-9021',
      delta: 'offerStatus: OFFERED -> ACCEPTED, tripStatus: MATCHING -> ACCEPTED',
      correlationId: 'req-corr-99285',
      timestamp: '2026-10-14 06:15:35'
    },
    {
      id: 'audit-003',
      actorId: 'system-payment',
      actorRole: 'SYSTEM',
      action: 'LEDGER_SETTLEMENT',
      targetType: 'WALLET',
      targetId: 'wal-8899',
      delta: 'balance: 804400 -> 850000 (+45600 VND, 80% net)',
      correlationId: 'req-corr-99341',
      timestamp: '2026-10-14 06:45:12'
    }
  ]);

  // Filters
  const [tripFilterStatus, setTripFilterStatus] = useState<string>('ALL');
  const [tripSearchCode, setTripSearchCode] = useState<string>('');

  // Handle Approve Driver
  const handleApproveDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, reviewStatus: 'APPROVED' } : d))
    );
    // Append audit record
    setAuditLogs((prev) => [
      {
        id: 'audit-' + Date.now(),
        actorId: 'admin-current',
        actorRole: 'ROLE_ADMIN',
        action: 'APPROVE_DRIVER_KYC',
        targetType: 'DRIVER_PROFILE',
        targetId: driverId,
        delta: 'status: PENDING_REVIEW -> APPROVED',
        correlationId: 'req-corr-' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);
  };

  // Handle Reject Driver
  const handleRejectDriver = (driverId: string) => {
    const reason = prompt('Nhập lý do từ chối hồ sơ:', 'Ảnh giấy tờ bị mờ / không khớp thông tin');
    if (!reason) return;

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, reviewStatus: 'REJECTED' } : d))
    );
    setAuditLogs((prev) => [
      {
        id: 'audit-' + Date.now(),
        actorId: 'admin-current',
        actorRole: 'ROLE_ADMIN',
        action: 'REJECT_DRIVER_KYC',
        targetType: 'DRIVER_PROFILE',
        targetId: driverId,
        delta: `status: PENDING_REVIEW -> REJECTED (reason: ${reason})`,
        correlationId: 'req-corr-' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);
  };

  const filteredTrips = trips.filter((t) => {
    const matchStatus = tripFilterStatus === 'ALL' || t.status === tripFilterStatus;
    const matchSearch =
      !tripSearchCode ||
      t.tripCode.toLowerCase().includes(tripSearchCode.toLowerCase()) ||
      t.customerId.toLowerCase().includes(tripSearchCode.toLowerCase()) ||
      (t.driverName && t.driverName.toLowerCase().includes(tripSearchCode.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Admin Sub-navigation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bảng Điều Khiển Quản Trị & Vận Hành (Admin & Ops)</h2>
          <p className="text-xs text-slate-500">Giám sát điều phối, kiểm duyệt đối tác, cấu hình giá & đối soát sổ cái</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'drivers', label: 'Duyệt Tài Xế' },
            { id: 'trips', label: 'Giám Sát Chuyến' },
            { id: 'pricing', label: 'Cấu Hình Giá' },
            { id: 'audit', label: 'Sổ Cái & Audit' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Driver Review Panel */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Danh Sách Đối Tác Chờ Phê Duyệt Hồ Sơ (KYC TBD-11)
            </h3>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {drivers.filter((d) => d.reviewStatus === 'PENDING_REVIEW').length} Chờ Xử Lý
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã Đối Tác</th>
                  <th className="p-3">Loại Phương Tiện</th>
                  <th className="p-3">Biển Số / Xe</th>
                  <th className="p-3">GPLX / CCCD</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-medium text-slate-800">{drv.id}</td>
                    <td className="p-3 font-semibold">{drv.activeVehicle?.vehicleType}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-800">
                        {drv.activeVehicle?.plateNumber}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {drv.activeVehicle?.brand} {drv.activeVehicle?.model} ({drv.activeVehicle?.color})
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{drv.licenseNumber}</td>
                    <td className="p-3">
                      <StateBadge status={drv.reviewStatus} type="review" />
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {drv.reviewStatus === 'PENDING_REVIEW' ? (
                        <>
                          <button
                            onClick={() => handleApproveDriver(drv.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                          >
                            Phê Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectDriver(drv.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-sm"
                          >
                            Từ Chối
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Trip & Dispatch Monitoring */}
      {activeTab === 'trips' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <h3 className="text-base font-bold text-slate-800">
              Giám Sát Chuyến Đi & Điều Phối Thời Gian Thực
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Tìm mã chuyến / khách / tài xế..."
                value={tripSearchCode}
                onChange={(e) => setTripSearchCode(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg w-full sm:w-48"
              />
              <select
                value={tripFilterStatus}
                onChange={(e) => setTripFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="MATCHING">MATCHING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="PICKING_UP">PICKING_UP</option>
                <option value="ARRIVED">ARRIVED</option>
                <option value="IN_TRIP">IN_TRIP</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã Chuyến</th>
                  <th className="p-3">Dịch Vụ</th>
                  <th className="p-3">Lộ Trình</th>
                  <th className="p-3">Tài Xế</th>
                  <th className="p-3">Cước Phí</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-blue-600">{t.tripCode}</td>
                    <td className="p-3 font-semibold">{t.serviceType}</td>
                    <td className="p-3 text-[11px] text-slate-600">
                      <div>A: {t.pickupLocation.address}</div>
                      <div>B: {t.dropoffLocation.address}</div>
                    </td>
                    <td className="p-3">
                      {t.driverName ? (
                        <>
                          <span className="font-semibold text-slate-800">{t.driverName}</span>
                          <span className="block text-[10px] font-mono text-slate-400">
                            {t.vehiclePlate}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Đang tìm...</span>
                      )}
                    </td>
                    <td className="p-3 font-bold font-mono text-slate-800">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        t.finalFare || t.estimatedFare
                      )}
                    </td>
                    <td className="p-3">
                      <StateBadge status={t.status} />
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{t.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing & Surge Configuration */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-800">
            Cấu Hình Ma Trận Bảng Giá & Hệ Số Surge Pricing (TBD-03, TBD-04)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingRules.map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-800">{r.serviceType}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold text-[10px]">
                    {r.region}
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Mở cửa (1km đầu):</span>
                    <strong className="text-slate-800 font-mono">
                      {r.baseFare.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cước km tiếp theo:</span>
                    <strong className="text-slate-800 font-mono">
                      {r.perKmRate.toLocaleString('vi-VN')} đ/km
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cước thời gian:</span>
                    <strong className="text-slate-800 font-mono">
                      {r.perMinuteRate.toLocaleString('vi-VN')} đ/phút
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cước tối thiểu:</span>
                    <strong className="text-slate-800 font-mono">
                      {r.minFare.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <div className="flex justify-between text-amber-700 bg-amber-50 p-1 rounded">
                    <span>Surge Range (TBD-04):</span>
                    <strong className="font-mono">[{r.surgeFloor}x - {r.surgeCeiling}x]</strong>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Cấu hình bảng giá ${r.serviceType} đã được lưu an toàn!`)}
                  className="w-full py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100"
                >
                  Chỉnh Sửa Tham Số
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs & Ledger Records */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Nhật Ký Kiểm Toán Bất Biến & Đối Soát (Immutable Audit Logs)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
              Retention: Permanent (Min 5 Years TBD-12)
            </span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-mono rounded text-[10px]">
                      {log.actorRole}
                    </span>
                    <strong className="text-slate-800">{log.action}</strong>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-mono">{log.targetType}:{log.targetId}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 font-mono">
                  {log.delta}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Correlation ID: <span className="text-slate-600">{log.correlationId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
