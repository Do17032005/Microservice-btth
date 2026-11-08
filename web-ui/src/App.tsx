import React, { useState } from 'react';
import { CustomerPortal } from './portals/CustomerPortal';
import { DriverPortal } from './portals/DriverPortal';
import { AdminPortal } from './portals/AdminPortal';

export const App: React.FC = () => {
  const [activePortal, setActivePortal] = useState<'customer' | 'driver' | 'admin'>('customer');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Main Navigation Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Specification Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl shadow-md">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base tracking-tight">RHL PLATFORM</h1>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    SRS-RHL-002 v2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ride-Hailing & Realtime Logistics Microservices WebUI
                </p>
              </div>
            </div>

            {/* Portal Role Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActivePortal('customer')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePortal === 'customer'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>👤</span> Khách Hàng
              </button>
              <button
                onClick={() => setActivePortal('driver')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePortal === 'driver'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🛵</span> Tài Xế Đối Tác
              </button>
              <button
                onClick={() => setActivePortal('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePortal === 'admin'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🛡️</span> Quản Trị Sàn (Admin)
              </button>
            </div>

            {/* Backend Connectivity Status */}
            <div className="hidden lg:flex items-center gap-3">
              <div
                onClick={() => setIsLiveConnected(!isLiveConnected)}
                className="cursor-pointer flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <span className="text-slate-300 font-mono text-[11px]">
                  {isLiveConnected ? 'Live API :8000' : 'Interactive Demo Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto">
        {activePortal === 'customer' && <CustomerPortal />}
        {activePortal === 'driver' && <DriverPortal />}
        {activePortal === 'admin' && <AdminPortal />}
      </main>

      {/* Footer Info */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Hệ thống Đặt xe và Giao hàng theo yêu cầu trong thời gian thực (SRS-RHL-002)
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            PostgreSQL • Redis GEO • Apache Kafka • Eureka • Spring Cloud Gateway
          </span>
        </div>
      </footer>
    </div>
  );
};
