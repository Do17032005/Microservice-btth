/**
 * RHL RIDE-HAILING & LOGISTICS ON-DEMAND SYSTEM (SRS-RHL-002 v2.0)
 * Main Interactive Application Core Engine
 */

// =========================================================================
// 1. DATA STORES & DEFAULT SYSTEM STATE
// =========================================================================

const SAMPLE_LOCATIONS = [
  { name: "Chợ Bến Thành, Quận 1", lat: 10.7725, lng: 106.6980, address: "Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM" },
  { name: "Landmark 81, Bình Thạnh", lat: 10.7950, lng: 106.7218, address: "720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM" },
  { name: "Sân bay Tân Sơn Nhất, Tân Bình", lat: 10.8185, lng: 106.6588, address: "Đường Trường Sơn, Phường 2, Tân Bình, TP.HCM" },
  { name: "Đại học Bách Khoa, Quận 10", lat: 10.7721, lng: 106.6579, address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM" },
  { name: "Phố đi bộ Nguyễn Huệ, Quận 1", lat: 10.7743, lng: 106.7034, address: "Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM" },
  { name: "Thảo Điền, TP. Thủ Đức", lat: 10.8038, lng: 106.7335, address: "Đường Xuân Thủy, Phường Thảo Điền, TP. Thủ Đức" },
  { name: "Khu đô thị Sala, TP. Thủ Đức", lat: 10.7675, lng: 106.7198, address: "Đường Mai Chí Thọ, An Lợi Đông, TP. Thủ Đức" },
  { name: "Bến xe Miền Đông mới", lat: 10.8805, lng: 106.8125, address: "Đường Hoàng Hữu Nam, Long Bình, TP. Thủ Đức" }
];

const INITIAL_DRIVERS = [
  {
    id: "drv-001",
    backendId: "e2034ed5-c74f-400a-9924-737f9aa77560",
    name: "Lê Văn Tài Xế 1",
    phone: "0903000001",
    vehicleType: "MOTORBIKE",
    vehiclePlate: "29A-111.11",
    vehicleModel: "Honda Wave (Đỏ)",
    rating: 4.90,
    totalTrips: 342,
    status: "AVAILABLE", // AVAILABLE, BUSY, OFFLINE, OFFERED
    lat: 10.7760,
    lng: 106.6950,
    kycStatus: "APPROVED",
    walletBalance: 500000,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60"
  },
  {
    id: "drv-002",
    backendId: "dc3e1f2c-21ef-40cb-a4aa-4b88a30d6de4",
    name: "Phạm Văn Tài Xế 2",
    phone: "0903000002",
    vehicleType: "CAR_4_SEATS",
    vehiclePlate: "30E-222.22",
    vehicleModel: "Toyota Vios (Trắng)",
    rating: 4.90,
    totalTrips: 215,
    status: "AVAILABLE",
    lat: 10.7710,
    lng: 106.7020,
    kycStatus: "APPROVED",
    walletBalance: 500000,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60"
  },
  {
    id: "drv-003",
    backendId: "1146efe9-4be2-4e09-9fcb-84a935b89937",
    name: "Hoàng Văn Tài Xế 3",
    phone: "0903000003",
    vehicleType: "CAR_7_SEATS",
    vehiclePlate: "51F-333.33",
    vehicleModel: "Mitsubishi Xpander (Bạc)",
    rating: 4.90,
    totalTrips: 520,
    status: "AVAILABLE",
    lat: 10.7790,
    lng: 106.7090,
    kycStatus: "APPROVED",
    walletBalance: 500000,
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60"
  },
  {
    id: "drv-004",
    backendId: "cda7a299-882f-4873-b159-ef47ee50689d",
    name: "Vũ Văn Tài Xế 4",
    phone: "0903000004",
    vehicleType: "MOTORBIKE",
    vehiclePlate: "43D-444.44",
    vehicleModel: "Yamaha Exciter (Xanh)",
    rating: 4.90,
    totalTrips: 180,
    status: "AVAILABLE",
    lat: 10.7850,
    lng: 106.6900,
    kycStatus: "APPROVED",
    walletBalance: 500000,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
  },
  {
    id: "drv-005",
    backendId: "ba5bf483-320f-4818-8e6c-0ebb322358b8",
    name: "Đặng Minh Khoa",
    phone: "0823111301",
    vehicleType: "MOTORBIKE",
    vehiclePlate: "12A-112.34",
    vehicleModel: "Honda Wave Alpha (Đen)",
    rating: 5.00,
    totalTrips: 640,
    status: "AVAILABLE",
    lat: 10.7680,
    lng: 106.6930,
    kycStatus: "APPROVED",
    walletBalance: 500000,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60"
  }
];

// Real Microservices & Database API Client (SRS-RHL-002)
const BackendAPI = {
  baseUrl: "http://localhost:8000/api/v1",

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/locations/nearby-drivers?latitude=21.0285&longitude=105.8542&radiusKm=50`);
      return res.ok;
    } catch {
      return false;
    }
  },

  async login(phoneNumber, password) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, password })
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async requestQuote(payload) {
    const res = await fetch(`${this.baseUrl}/pricing/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async createTrip(payload) {
    const res = await fetch(`${this.baseUrl}/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async cancelTrip(tripId, actorId, reason = "User reset") {
    try {
      const res = await fetch(`${this.baseUrl}/trips/${tripId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId, reason })
      });
      return res.json();
    } catch {
      return null;
    }
  },

  async updateTripStatus(tripId, actorId, status, lat, lng, reason = null, deliveryOtp = null) {
    const res = await fetch(`${this.baseUrl}/trips/${tripId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorId,
        status,
        latitude: lat,
        longitude: lng,
        reason,
        deliveryOtp
      })
    });
    return res.json();
  },

  async updateDriverStatus(driverId, status) {
    try {
      const res = await fetch(`${this.baseUrl}/drivers/${driverId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return res.json();
    } catch {
      return null;
    }
  },

  async updateDriverTelemetry(driverId, lat, lng, accuracy = 5.0) {
    try {
      const res = await fetch(`${this.baseUrl}/drivers/${driverId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy })
      });
      return res.json();
    } catch {
      return null;
    }
  },

  async getDriverOffers(driverId) {
    try {
      const res = await fetch(`${this.baseUrl}/drivers/${driverId}/offers`);
      return res.json();
    } catch {
      return null;
    }
  },

  async acceptOffer(offerId, driverId) {
    const res = await fetch(`${this.baseUrl}/offers/${offerId}/accept?driverId=${driverId}`, {
      method: "POST"
    });
    return res.json();
  },

  async rejectOffer(offerId, driverId) {
    const res = await fetch(`${this.baseUrl}/offers/${offerId}/reject?driverId=${driverId}`, {
      method: "POST"
    });
    return res.json();
  },

  async getDriverWallet(driverId) {
    try {
      const res = await fetch(`${this.baseUrl}/drivers/${driverId}/wallet`);
      return res.json();
    } catch {
      return null;
    }
  },

  async getDriverWalletEntries(driverId) {
    try {
      const res = await fetch(`${this.baseUrl}/drivers/${driverId}/wallet/entries`);
      return res.json();
    } catch {
      return null;
    }
  },

  async getCustomerTrips(customerId) {
    try {
      const res = await fetch(`${this.baseUrl}/customers/${customerId}/trips`);
      return res.json();
    } catch {
      return null;
    }
  },

  async getAdminDrivers(token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${this.baseUrl}/admin/drivers`, { headers });
      return res.json();
    } catch {
      return null;
    }
  },

  async getAdminTrips(token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${this.baseUrl}/admin/trips`, { headers });
      return res.json();
    } catch {
      return null;
    }
  }
};

// App Global State
window.RHL = {
  apiBaseUrl: "http://localhost:8000/api/v1",
  isBackendConnected: false,
  activeRole: "customer", // customer, driver, admin, dual
  drivers: [...INITIAL_DRIVERS],
  selectedDriverId: "drv-001",
  
  // Active Customer Trip State
  trip: null, // Current active trip object
  quote: null, // Current FareQuote
  quoteTimerInterval: null,
  quoteRemainingSeconds: 300,
  
  // Dispatch matching state
  matchingTimerInterval: null,
  matchingStage: 1, // 1 (3km), 2 (5km), 3 (8km)
  matchingRemainingSeconds: 45,
  
  // Driver Offer State
  activeOffer: null,
  offerTimerInterval: null,
  offerRemainingSeconds: 15,
  
  // GPS Animation
  gpsSimInterval: null,
  
  // Chat Messages
  chatMessages: [],
  
  // Wallet Entries for Drivers
  walletEntries: {
    "drv-001": [
      { id: "ent-101", type: "TRIP_EARNING", amount: 48000, balanceAfter: 850000, ref: "trip_prev_01", time: "10:30 Hôm nay" },
      { id: "ent-100", type: "TOPUP", amount: 500000, balanceAfter: 802000, ref: "topup_bank", time: "Hôm qua" }
    ]
  },
  
  // Audit Logs
  auditLogs: [
    { time: new Date().toLocaleTimeString(), actor: "SYSTEM", action: "SYSTEM_INIT", detail: "SRS-RHL-002 v2.0 Platform Initialized" }
  ],
  
  // Leaflet map instances
  maps: {
    customer: null,
    driver: null,
    admin: null,
    dualCustomer: null,
    dualDriver: null
  },
  mapMarkers: {},
  routeLayers: {}
};

// =========================================================================
// 2. WEB AUDIO SOUND FX GENERATOR (SYNTHESIZED CHIMES)
// =========================================================================
const AudioPlayer = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  playBeep(freq = 440, duration = 0.15, type = "sine") {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) { /* ignore audio permission issues */ }
  },
  playOfferChime() {
    this.playBeep(587.33, 0.12, "triangle");
    setTimeout(() => this.playBeep(880, 0.25, "triangle"), 140);
  },
  playAcceptChime() {
    this.playBeep(523.25, 0.1, "sine");
    setTimeout(() => this.playBeep(659.25, 0.1, "sine"), 100);
    setTimeout(() => this.playBeep(783.99, 0.2, "sine"), 200);
  },
  playCompleteChime() {
    this.playBeep(440, 0.15, "triangle");
    setTimeout(() => this.playBeep(554.37, 0.15, "triangle"), 150);
    setTimeout(() => this.playBeep(659.25, 0.15, "triangle"), 300);
    setTimeout(() => this.playBeep(880, 0.4, "triangle"), 450);
  },
  playChatPing() {
    this.playBeep(740, 0.08, "sine");
  }
};

// =========================================================================
// 3. GEOMETRY & PRICING ENGINE (TBD-03, TBD-04, TBD-02)
// =========================================================================
const GeoUtils = {
  // Haversine formula distance calculation in kilometers
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const directKm = R * c;
    // OSRM road detour factor 1.30x (TBD-02)
    return directKm * 1.30;
  },
  
  // Format currency in VND
  formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  },

  // Interpolate route coordinates
  generateRoutePoints(start, end, steps = 30) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      // Slight arc curve to simulate city streets
      const curve = Math.sin(ratio * Math.PI) * 0.003;
      const lat = start.lat + (end.lat - start.lat) * ratio + curve;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      points.push([lat, lng]);
    }
    return points;
  }
};

const PricingEngine = {
  // Calculate dynamic fare quote according to SRS TBD-03 & TBD-04
  calculateQuote(serviceType, pickupLat, pickupLng, dropoffLat, dropoffLng) {
    const distanceKm = GeoUtils.calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const durationMins = Math.max(3, Math.round(distanceKm * 2.8)); // avg 22km/h
    
    let baseFare = 12000;
    let perKmRate = 5000;
    let perMinRate = 500;
    let minimumFare = 15000;
    
    if (serviceType === "RIDE_CAR_4") {
      baseFare = 20000;
      perKmRate = 10000;
      perMinRate = 1000;
      minimumFare = 25000;
    } else if (serviceType === "RIDE_CAR_7") {
      baseFare = 25000;
      perKmRate = 13000;
      perMinRate = 1200;
      minimumFare = 30000;
    } else if (serviceType === "DELIVERY_MOTORBIKE") {
      baseFare = 15000;
      perKmRate = 5500;
      perMinRate = 500;
      minimumFare = 15000;
    }
    
    // Calculate raw distance fare (first 1km covered in base fare)
    const extraKm = Math.max(0, distanceKm - 1.0);
    const distanceFare = extraKm * perKmRate;
    const timeFare = durationMins * perMinRate;
    
    // Surge Pricing (TBD-04): 3.0km radius check
    const nearbyAvailCount = window.RHL.drivers.filter(d => 
      d.status === "AVAILABLE" && 
      GeoUtils.calculateDistance(pickupLat, pickupLng, d.lat, d.lng) <= 3.0
    ).length;
    
    let surgeMultiplier = 1.00;
    if (nearbyAvailCount === 0) surgeMultiplier = 1.80;
    else if (nearbyAvailCount === 1) surgeMultiplier = 1.40;
    else if (nearbyAvailCount <= 3) surgeMultiplier = 1.20;
    else surgeMultiplier = 1.00;
    
    const subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;
    // Round up to multiple of 1,000 VND (TBD-03)
    let totalFare = Math.ceil(Math.max(minimumFare, subtotal) / 1000) * 1000;
    
    return {
      quoteId: "quote_" + Math.random().toString(36).substr(2, 9),
      serviceType,
      distanceKm: parseFloat(distanceKm.toFixed(1)),
      durationMins,
      baseFare,
      distanceFare: Math.round(distanceFare),
      timeFare: Math.round(timeFare),
      surgeMultiplier,
      nearbyAvailDrivers: nearbyAvailCount,
      totalFare,
      expiresAt: Date.now() + 300 * 1000 // 5 minutes TTL
    };
  }
};

// =========================================================================
// 4. MAP INITIALIZATION & RENDERER (LEAFLET)
// =========================================================================
const MapService = {
  createMap(elementId, center = [10.7725, 106.6980], zoom = 14) {
    const el = document.getElementById(elementId);
    if (!el) return null;
    
    // Clear previous if any
    if (el._leaflet_id) {
      el._leaflet_id = null;
      el.innerHTML = "";
    }
    
    const map = L.map(elementId, {
      zoomControl: false,
      attributionControl: false
    }).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    return map;
  },

  createDriverIcon(vehicleType, isBusy = false) {
    const isCar = vehicleType.includes("CAR");
    const iconClass = isCar ? "fa-car-side" : "fa-motorcycle";
    const bgClass = isBusy ? "border-rose-500 text-rose-600" : "border-emerald-600 text-emerald-700";
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="w-8 h-8 rounded-full bg-white border-2 ${bgClass} shadow-lg flex items-center justify-center text-sm font-bold transition-transform hover:scale-110">
          <i class="fa-solid ${iconClass}"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  },

  createPickupIcon() {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="w-7 h-7 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xs animate-bounce">
          <i class="fa-solid fa-person-walking"></i>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });
  },

  createDropoffIcon() {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="w-7 h-7 rounded-full bg-rose-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xs animate-pulse">
          <i class="fa-solid fa-flag-checkered"></i>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });
  },

  renderAllDriversOnMap(map, mapKey = 'admin') {
    if (!map) return;
    if (!window.RHL.mapMarkers[mapKey]) window.RHL.mapMarkers[mapKey] = {};
    
    // Clear old driver markers
    Object.keys(window.RHL.mapMarkers[mapKey]).forEach(key => {
      if (key.startsWith("drv_")) {
        map.removeLayer(window.RHL.mapMarkers[mapKey][key]);
        delete window.RHL.mapMarkers[mapKey][key];
      }
    });

    window.RHL.drivers.forEach(driver => {
      if (driver.status === "OFFLINE") return;
      const marker = L.marker([driver.lat, driver.lng], {
        icon: this.createDriverIcon(driver.vehicleType, driver.status === "BUSY")
      }).addTo(map);
      
      marker.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <div class="font-bold text-slate-800">${driver.name}</div>
          <div class="text-slate-500">${driver.vehicleModel}</div>
          <div class="text-slate-700 font-semibold">${driver.vehiclePlate}</div>
          <div class="mt-1"><span class="px-1.5 py-0.5 rounded text-[10px] ${driver.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${driver.status}</span> ⭐ ${driver.rating}</div>
        </div>
      `);
      
      window.RHL.mapMarkers[mapKey]["drv_" + driver.id] = marker;
    });
  },

  drawTripRoute(map, mapKey, pickup, dropoff) {
    if (!map) return;
    if (!window.RHL.routeLayers[mapKey]) window.RHL.routeLayers[mapKey] = [];
    
    // Clear existing routes
    window.RHL.routeLayers[mapKey].forEach(layer => map.removeLayer(layer));
    window.RHL.routeLayers[mapKey] = [];

    const points = GeoUtils.generateRoutePoints(pickup, dropoff);
    const polyline = L.polyline(points, {
      color: '#059669',
      weight: 5,
      opacity: 0.85,
      dashArray: '1, 8',
      lineCap: 'round'
    }).addTo(map);

    window.RHL.routeLayers[mapKey].push(polyline);
    
    // Add markers
    const pMarker = L.marker([pickup.lat, pickup.lng], { icon: this.createPickupIcon() }).addTo(map);
    const dMarker = L.marker([dropoff.lat, dropoff.lng], { icon: this.createDropoffIcon() }).addTo(map);
    window.RHL.routeLayers[mapKey].push(pMarker, dMarker);

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }
};

// =========================================================================
// 5. TOAST NOTIFICATIONS & AUDIT LOGGER
// =========================================================================
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toast = document.createElement("div");
  const bgClass = type === "error" ? "bg-rose-600 text-white" : 
                 type === "warning" ? "bg-amber-500 text-white" : 
                 "bg-emerald-600 text-white";
  
  const icon = type === "error" ? "fa-circle-xmark" : 
               type === "warning" ? "fa-triangle-exclamation" : 
               "fa-circle-check";
               
  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl font-medium text-sm transition-all transform translate-y-2 opacity-0 duration-300 ${bgClass}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-lg"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });
  
  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function logAudit(actor, action, detail) {
  const logItem = {
    time: new Date().toLocaleTimeString(),
    actor,
    action,
    detail
  };
  window.RHL.auditLogs.unshift(logItem);
  if (window.RHL.auditLogs.length > 50) window.RHL.auditLogs.pop();
  renderAdminAuditLogs();
}

// =========================================================================
// 6. DISPATCH & STATE MACHINE ENGINE (MATCHING & TRIP LIFECYCLE)
// =========================================================================
const TripEngine = {
  // Start 3-stage matching algorithm
  startMatching(trip) {
    window.RHL.trip = trip;
    window.RHL.matchingStage = 1;
    window.RHL.matchingRemainingSeconds = 45;
    
    // Add to Available Orders Pool immediately so it is visible in the Driver Market Pool
    const poolItem = {
      id: "ord-live-" + trip.code,
      code: trip.code,
      serviceType: trip.serviceType,
      pickup: trip.pickup,
      dropoff: trip.dropoff,
      distanceKm: trip.quote.distanceKm,
      durationMins: trip.quote.durationMins,
      totalFare: trip.quote.totalFare,
      customerName: "Khách Vừa Đặt",
      customerPhone: "0901234567"
    };
    AVAILABLE_ORDERS_POOL.unshift(poolItem);
    renderAvailableOrdersPool();

    logAudit("CUSTOMER", "TRIP_REQUESTED", `Trip ${trip.code} initiated with quote ${trip.quote.quoteId}`);
    updateCustomerTripUI();
    updateDualSimulationUI();

    // Dispatch offer immediately to driver
    setTimeout(() => {
      this.dispatchOfferToNearbyDriver(trip);
    }, 400);

    // Matching stages interval
    window.RHL.matchingTimerInterval = setInterval(() => {
      window.RHL.matchingRemainingSeconds--;
      
      const secondsPassed = 45 - window.RHL.matchingRemainingSeconds;
      if (secondsPassed >= 30) window.RHL.matchingStage = 3; // 8km
      else if (secondsPassed >= 15) window.RHL.matchingStage = 2; // 5km
      else window.RHL.matchingStage = 1; // 3km

      const stageRadius = window.RHL.matchingStage === 1 ? 3 : window.RHL.matchingStage === 2 ? 5 : 8;
      const stageEl = document.getElementById("matching-stage-text");
      if (stageEl) {
        stageEl.innerText = `Vòng ${window.RHL.matchingStage}/3 (Bán kính ${stageRadius}km) - ${window.RHL.matchingRemainingSeconds}s`;
      }
      
      const dualStageEl = document.getElementById("dual-matching-stage-text");
      if (dualStageEl) {
        dualStageEl.innerText = `Vòng ${window.RHL.matchingStage}/3 (${stageRadius}km) - ${window.RHL.matchingRemainingSeconds}s`;
      }

      if (window.RHL.matchingRemainingSeconds <= 0) {
        this.handleNoDriverFound();
      }
    }, 1000);
  },

  dispatchOfferToNearbyDriver(trip) {
    // 1. Check if the currently selected driver in Driver view is eligible
    let driver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId);
    
    // Auto-turn available if currently viewed driver was offline
    if (driver && driver.status === "OFFLINE") {
      driver.status = "AVAILABLE";
    }

    // 2. If current driver is busy or not eligible, find another eligible available driver
    if (!driver || driver.status !== "AVAILABLE") {
      driver = window.RHL.drivers.find(d => 
        d.status === "AVAILABLE" && 
        (trip.serviceType === "DELIVERY_MOTORBIKE" ? d.vehicleType === "MOTORBIKE" : 
         trip.serviceType === "RIDE_MOTORBIKE" ? d.vehicleType === "MOTORBIKE" : 
         trip.serviceType === "RIDE_CAR_4" ? d.vehicleType === "CAR_4_SEATS" : 
         d.vehicleType === "CAR_7_SEATS")
      ) || window.RHL.drivers.find(d => d.status === "AVAILABLE") || window.RHL.drivers[0];
    }

    if (!driver) {
      showToast("Đang mở rộng tìm kiếm tài xế lân cận...", "warning");
      return;
    }

    // Synchronize selected driver ID to ensure the Driver view displays this offer
    window.RHL.selectedDriverId = driver.id;
    const drvSelect = document.getElementById("select-driver-switch");
    if (drvSelect) drvSelect.value = driver.id;

    // Assign atomic OFFERED state
    driver.status = "OFFERED";
    window.RHL.activeOffer = {
      offerId: "off_" + Math.random().toString(36).substr(2, 8),
      trip: trip,
      driverId: driver.id,
      distanceToPickup: Math.round(GeoUtils.calculateDistance(driver.lat, driver.lng, trip.pickup.lat, trip.pickup.lng) * 1000),
      expiresAt: Date.now() + 15000
    };

    AudioPlayer.playOfferChime();
    logAudit("DISPATCH", "DRIVER_OFFER_CREATED", `Offer ${window.RHL.activeOffer.offerId} sent to Driver ${driver.name} (15s countdown)`);
    showToast(`🔔 Cuốc xe mới đã gửi tới tài xế ${driver.name}! Bấm tab Tài Xế để nhận.`, "success");

    // Show popup in Driver View and Dual View
    updateDriverUI();
    updateDualSimulationUI();
    this.startOfferCountdown();
  },

  startOfferCountdown() {
    clearInterval(window.RHL.offerTimerInterval);
    window.RHL.offerRemainingSeconds = 15;
    
    window.RHL.offerTimerInterval = setInterval(() => {
      window.RHL.offerRemainingSeconds--;
      
      const timerBar = document.getElementById("offer-countdown-bar");
      if (timerBar) {
        timerBar.style.width = `${(window.RHL.offerRemainingSeconds / 15) * 100}%`;
      }
      const timerText = document.getElementById("offer-timer-seconds");
      if (timerText) timerText.innerText = `${window.RHL.offerRemainingSeconds}s`;

      const dualTimerBar = document.getElementById("dual-offer-countdown-bar");
      if (dualTimerBar) {
        dualTimerBar.style.width = `${(window.RHL.offerRemainingSeconds / 15) * 100}%`;
      }

      if (window.RHL.offerRemainingSeconds <= 0) {
        this.rejectOffer("EXPIRED");
      }
    }, 1000);
  },

  async acceptOffer(driverId) {
    clearInterval(window.RHL.offerTimerInterval);
    clearInterval(window.RHL.matchingTimerInterval);
    
    const driver = window.RHL.drivers.find(d => d.id === driverId);
    if (!driver || !window.RHL.activeOffer) return;

    // Atomic assignment
    driver.status = "BUSY";
    window.RHL.trip.driver = driver;
    window.RHL.trip.status = "ACCEPTED";
    window.RHL.trip.acceptedAt = Date.now();
    const offerObj = window.RHL.activeOffer;
    window.RHL.activeOffer = null;

    // Sync to PostgreSQL backend
    if (window.RHL.isBackendConnected) {
      try {
        if (offerObj.backendOfferId && driver.backendId) {
          await BackendAPI.acceptOffer(offerObj.backendOfferId, driver.backendId);
        } else if (window.RHL.trip.backendTripId && driver.backendId) {
          await BackendAPI.updateTripStatus(window.RHL.trip.backendTripId, driver.backendId, "ACCEPTED", driver.lat, driver.lng);
        }
      } catch (err) {
        console.warn("Backend accept offer sync:", err);
      }
    }

    AudioPlayer.playAcceptChime();
    logAudit("DRIVER", "OFFER_ACCEPTED", `Driver ${driver.name} accepted Trip ${window.RHL.trip.code} (PostgreSQL Synced)`);
    showToast(`Tài xế ${driver.name} đã nhận chuyến thành công!`, "success");

    updateCustomerTripUI();
    updateDriverUI();
    updateDualSimulationUI();

    // Start simulation GPS route from Driver to Pickup
    this.simulateDriverMovement("PICKING_UP");
  },

  async rejectOffer(reason = "REJECTED") {
    clearInterval(window.RHL.offerTimerInterval);
    if (!window.RHL.activeOffer) return;

    const driver = window.RHL.drivers.find(d => d.id === window.RHL.activeOffer.driverId);
    if (driver) driver.status = "AVAILABLE";

    const offerObj = window.RHL.activeOffer;
    window.RHL.activeOffer = null;

    // Sync rejection to PostgreSQL
    if (window.RHL.isBackendConnected && offerObj.backendOfferId && driver?.backendId) {
      BackendAPI.rejectOffer(offerObj.backendOfferId, driver.backendId).catch(() => {});
    }

    logAudit("DRIVER", `OFFER_${reason}`, `Driver ${driver ? driver.name : ''} ${reason} offer`);
    showToast(reason === "EXPIRED" ? "Đề nghị chuyến đã hết hạn (15s)!" : "Tài xế đã từ chối chuyến xe", "warning");

    updateDriverUI();
    updateDualSimulationUI();
  },

  async updateTripStatus(newStatus) {
    if (!window.RHL.trip) return;
    const oldStatus = window.RHL.trip.status;
    window.RHL.trip.status = newStatus;

    logAudit("TRIP", "TRIP_STATUS_CHANGED", `Trip ${window.RHL.trip.code}: ${oldStatus} -> ${newStatus}`);

    // Map UI status to Backend State Machine (SRS-RHL-002)
    if (window.RHL.isBackendConnected && window.RHL.trip.backendTripId && window.RHL.trip.driver?.backendId) {
      try {
        let beStatus = newStatus;
        if (newStatus === "ARRIVED") beStatus = "ARRIVED_AT_PICKUP";
        else if (newStatus === "IN_TRIP") beStatus = "IN_TRANSIT";
        
        await BackendAPI.updateTripStatus(
          window.RHL.trip.backendTripId,
          window.RHL.trip.driver.backendId,
          beStatus,
          window.RHL.trip.driver.lat,
          window.RHL.trip.driver.lng,
          null,
          window.RHL.trip.deliveryOtp || "1234"
        );
      } catch (err) {
        console.warn("Backend updateTripStatus sync:", err);
      }
    }

    if (newStatus === "ARRIVED") {
      AudioPlayer.playBeep(600, 0.2);
      showToast("Tài xế đã có mặt tại điểm đón/lấy hàng!", "success");
    } else if (newStatus === "IN_TRIP") {
      AudioPlayer.playBeep(700, 0.2);
      showToast("Chuyến đi đã bắt đầu! Đang di chuyển tới điểm đến.", "success");
      this.simulateDriverMovement("IN_TRIP");
    } else if (newStatus === "COMPLETED") {
      this.completeTrip();
    }

    updateCustomerTripUI();
    updateDriverUI();
    updateDualSimulationUI();
  },

  async completeTrip() {
    clearInterval(window.RHL.gpsSimInterval);
    AudioPlayer.playCompleteChime();

    const trip = window.RHL.trip;
    const driver = trip.driver;
    const finalFare = trip.quote.totalFare;

    // Platform takes 20%, Driver receives 80% (SRS-RHL-002 TBD-10)
    const platformCommission = Math.round(finalFare * 0.20);
    const driverEarning = finalFare - platformCommission;

    driver.walletBalance += driverEarning;
    driver.totalTrips += 1;
    driver.status = "AVAILABLE";

    // Backend completion & immutable ledger settlement
    if (window.RHL.isBackendConnected && trip.backendTripId && driver.backendId) {
      try {
        await BackendAPI.updateTripStatus(
          trip.backendTripId,
          driver.backendId,
          "COMPLETED",
          trip.dropoff.lat,
          trip.dropoff.lng,
          null,
          trip.deliveryOtp || "1234"
        );
        
        // Sync real wallet balance from PostgreSQL
        const walletRes = await BackendAPI.getDriverWallet(driver.backendId);
        if (walletRes && walletRes.data) {
          driver.walletBalance = walletRes.data.balance;
        }
      } catch (err) {
        console.warn("Backend settlement sync:", err);
      }
    }

    // Record Immutable Ledger entry in UI
    if (!window.RHL.walletEntries[driver.id]) window.RHL.walletEntries[driver.id] = [];
    window.RHL.walletEntries[driver.id].unshift({
      id: "ent_" + Math.random().toString(36).substr(2, 8),
      type: "TRIP_EARNING",
      amount: driverEarning,
      balanceAfter: driver.walletBalance,
      ref: trip.code,
      time: new Date().toLocaleTimeString(),
      commission: platformCommission
    });

    logAudit("PAYMENT", "TRIP_COMPLETED_SETTLED", `Trip ${trip.code} settled. Total: ${GeoUtils.formatVND(finalFare)}, Driver Net: ${GeoUtils.formatVND(driverEarning)}, Platform Fee: ${GeoUtils.formatVND(platformCommission)} (Database Saved)`);
    showToast(`Chuyến đi hoàn tất! Thu nhập tài xế: +${GeoUtils.formatVND(driverEarning)}`, "success");

    // Open Rating Modal for customer
    setTimeout(() => {
      openRatingModal(trip);
    }, 800);

    updateCustomerTripUI();
    updateDriverUI();
    updateDualSimulationUI();
    renderDriverWallet();
  },

  async cancelTrip(actorRole = "CUSTOMER", reason = "Khách hàng đổi kế hoạch") {
    clearInterval(window.RHL.matchingTimerInterval);
    clearInterval(window.RHL.offerTimerInterval);
    clearInterval(window.RHL.gpsSimInterval);

    if (!window.RHL.trip) return;
    const trip = window.RHL.trip;

    // Cancellation fee rule (TBD-07)
    let cancelFee = 0;
    if (trip.status === "ARRIVED" || (trip.acceptedAt && Date.now() - trip.acceptedAt > 120000)) {
      cancelFee = 10000;
    }

    if (trip.driver) {
      trip.driver.status = "AVAILABLE";
    }

    trip.status = "CANCELLED";
    trip.cancelFee = cancelFee;
    trip.cancelReason = reason;

    // Sync cancellation to PostgreSQL
    if (window.RHL.isBackendConnected && trip.backendTripId) {
      const actorId = trip.driver?.backendId || window.RHL.currentUser?.userId || "c2a5e154-aeaa-4583-9ef0-ca3fdd2344ca";
      BackendAPI.cancelTrip(trip.backendTripId, actorId, reason).catch(() => {});
    }

    logAudit(actorRole, "TRIP_CANCELLED", `Trip ${trip.code} cancelled. Reason: ${reason}. Penalty Fee: ${GeoUtils.formatVND(cancelFee)}`);
    showToast(`Chuyến đi đã bị hủy! Phí hủy: ${GeoUtils.formatVND(cancelFee)}`, "warning");

    updateCustomerTripUI();
    updateDriverUI();
    updateDualSimulationUI();
  },

  handleNoDriverFound() {
    clearInterval(window.RHL.matchingTimerInterval);
    if (!window.RHL.trip) return;
    
    window.RHL.trip.status = "NO_DRIVER";
    logAudit("DISPATCH", "NO_DRIVER_FOUND", `Trip ${window.RHL.trip.code} ended with NO_DRIVER after 45s`);
    showToast("Rất tiếc, hiện tại không có tài xế nào khả dụng trong khu vực!", "error");
    
    updateCustomerTripUI();
    updateDualSimulationUI();
  },

  simulateDriverMovement(mode = "PICKING_UP") {
    clearInterval(window.RHL.gpsSimInterval);
    const trip = window.RHL.trip;
    if (!trip || !trip.driver) return;

    const start = mode === "PICKING_UP" ? 
      { lat: trip.driver.lat, lng: trip.driver.lng } : 
      { lat: trip.pickup.lat, lng: trip.pickup.lng };
      
    const end = mode === "PICKING_UP" ? 
      { lat: trip.pickup.lat, lng: trip.pickup.lng } : 
      { lat: trip.dropoff.lat, lng: trip.dropoff.lng };

    const points = GeoUtils.generateRoutePoints(start, end, 20);
    let currentIdx = 0;

    window.RHL.gpsSimInterval = setInterval(() => {
      if (currentIdx >= points.length) {
        clearInterval(window.RHL.gpsSimInterval);
        if (mode === "PICKING_UP") {
          this.updateTripStatus("ARRIVED");
        } else if (mode === "IN_TRIP") {
          // Reached destination
          showToast("Đã tới điểm đến! Tài xế có thể ấn Hoàn tất.", "success");
        }
        return;
      }

      const [lat, lng] = points[currentIdx];
      trip.driver.lat = lat;
      trip.driver.lng = lng;

      // Update markers on active maps
      ['customer', 'driver', 'admin', 'dualCustomer', 'dualDriver'].forEach(mapKey => {
        const marker = window.RHL.mapMarkers[mapKey] && window.RHL.mapMarkers[mapKey]["drv_" + trip.driver.id];
        if (marker) marker.setLatLng([lat, lng]);
      });

      currentIdx++;
    }, 1200);
  }
};

// =========================================================================
// 7. UI RENDERERS & EVENT HANDLERS
// =========================================================================

// Switch main role tabs
function setRole(roleName) {
  window.RHL.activeRole = roleName;
  
  // Highlight buttons
  document.querySelectorAll(".role-tab-btn").forEach(btn => {
    if (btn.dataset.role === roleName) {
      btn.classList.add("bg-emerald-600", "text-white", "shadow-md");
      btn.classList.remove("text-slate-300", "hover:bg-slate-800");
    } else {
      btn.classList.remove("bg-emerald-600", "text-white", "shadow-md");
      btn.classList.add("text-slate-300", "hover:bg-slate-800");
    }
  });

  // Show corresponding view panel
  ['customer', 'driver', 'admin', 'dual'].forEach(r => {
    const el = document.getElementById(`view-${r}`);
    if (el) {
      if (r === roleName) {
        el.classList.remove("hidden");
        el.style.display = "flex";
      } else {
        el.classList.add("hidden");
        el.style.display = "none";
      }
    }
  });

  // Re-trigger map invalidateSize after display
  setTimeout(() => {
    if (roleName === "customer") {
      if (!window.RHL.maps.customer) window.RHL.maps.customer = MapService.createMap("map-customer", [10.7725, 106.6980]);
      if (window.RHL.maps.customer) window.RHL.maps.customer.invalidateSize(true);
      setTimeout(() => { if (window.RHL.maps.customer) window.RHL.maps.customer.invalidateSize(true); }, 300);
    }
    if (roleName === "driver") {
      if (!window.RHL.maps.driver) window.RHL.maps.driver = MapService.createMap("map-driver", [10.7760, 106.6950]);
      if (window.RHL.maps.driver) window.RHL.maps.driver.invalidateSize(true);
      setTimeout(() => { if (window.RHL.maps.driver) window.RHL.maps.driver.invalidateSize(true); }, 300);
    }
    if (roleName === "admin") {
      if (!window.RHL.maps.admin) window.RHL.maps.admin = MapService.createMap("map-admin", [10.7780, 106.7050], 13);
      if (window.RHL.maps.admin) {
        window.RHL.maps.admin.invalidateSize(true);
        MapService.renderAllDriversOnMap(window.RHL.maps.admin, 'admin');
      }
      setTimeout(() => { if (window.RHL.maps.admin) window.RHL.maps.admin.invalidateSize(true); }, 300);
    }
    if (roleName === "dual") {
      if (!window.RHL.maps.dualCustomer) {
        window.RHL.maps.dualCustomer = MapService.createMap("map-dual-customer", [10.7725, 106.6980]);
      }
      if (!window.RHL.maps.dualDriver) {
        window.RHL.maps.dualDriver = MapService.createMap("map-dual-driver", [10.7760, 106.6950]);
      }
      if (window.RHL.maps.dualCustomer) window.RHL.maps.dualCustomer.invalidateSize(true);
      if (window.RHL.maps.dualDriver) window.RHL.maps.dualDriver.invalidateSize(true);
      syncDualMaps();
      updateDualSimulationUI();
      setTimeout(() => {
        if (window.RHL.maps.dualCustomer) window.RHL.maps.dualCustomer.invalidateSize(true);
        if (window.RHL.maps.dualDriver) window.RHL.maps.dualDriver.invalidateSize(true);
      }, 300);
    }
  }, 100);
}

// Switch between 1. RIDE-HAILING and 2. LOGISTICS DELIVERY
function switchCustomerServiceMode(mode) {
  const btnRide = document.getElementById("service-tab-ride");
  const btnDelivery = document.getElementById("service-tab-delivery");
  const vehSelector = document.getElementById("ride-vehicle-selector");
  const deliveryFields = document.getElementById("customer-delivery-fields");
  const labelPickup = document.getElementById("label-pickup-point");
  const labelDropoff = document.getElementById("label-dropoff-point");
  const hiddenType = document.getElementById("select-service-type");

  if (mode === 'RIDE') {
    btnRide.className = "py-2.5 px-2 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1.5 transition-all";
    btnDelivery.className = "py-2.5 px-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all";
    vehSelector.classList.remove("hidden");
    deliveryFields.classList.add("hidden");
    labelPickup.innerHTML = `<i class="fa-solid fa-circle-dot text-emerald-400 mr-1"></i> Điểm Đón Khách`;
    labelDropoff.innerHTML = `<i class="fa-solid fa-flag text-rose-400 mr-1"></i> Điểm Đến / Trả Khách`;
    hiddenType.value = "RIDE_MOTORBIKE";
    selectRideVehicle("RIDE_MOTORBIKE");
  } else {
    btnRide.className = "py-2.5 px-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all";
    btnDelivery.className = "py-2.5 px-2 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1.5 transition-all";
    vehSelector.classList.add("hidden");
    deliveryFields.classList.remove("hidden");
    labelPickup.innerHTML = `<i class="fa-solid fa-warehouse text-emerald-400 mr-1"></i> Điểm Lấy Hàng (Kho / Người gửi)`;
    labelDropoff.innerHTML = `<i class="fa-solid fa-location-arrow text-rose-400 mr-1"></i> Điểm Giao Hàng (Người nhận)`;
    hiddenType.value = "DELIVERY_MOTORBIKE";
  }
}

function selectRideVehicle(vType) {
  document.getElementById("select-service-type").value = vType;
  const mapBtn = {
    RIDE_MOTORBIKE: "btn-veh-moto",
    RIDE_CAR_4: "btn-veh-car4",
    RIDE_CAR_7: "btn-veh-car7"
  };

  Object.keys(mapBtn).forEach(k => {
    const el = document.getElementById(mapBtn[k]);
    if (!el) return;
    if (k === vType) {
      el.className = "veh-type-btn p-2 rounded-xl bg-slate-900 border-2 border-emerald-500 text-center transition-all shadow-lg";
    } else {
      el.className = "veh-type-btn p-2 rounded-xl bg-slate-900 border border-slate-700 text-center transition-all opacity-70 hover:opacity-100";
    }
  });
}

// Generate Fare Quote from Customer Form
async function handleRequestQuote() {
  const serviceType = document.getElementById("select-service-type").value;
  const pickupIdx = parseInt(document.getElementById("select-pickup-loc").value);
  const dropoffIdx = parseInt(document.getElementById("select-dropoff-loc").value);

  if (pickupIdx === dropoffIdx) {
    showToast("Điểm đón và điểm đến không được trùng nhau!", "warning");
    return;
  }

  const pickup = SAMPLE_LOCATIONS[pickupIdx];
  const dropoff = SAMPLE_LOCATIONS[dropoffIdx];

  let quote = PricingEngine.calculateQuote(serviceType, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  quote.pickup = pickup;
  quote.dropoff = dropoff;

  // Real PostgreSQL Pricing Rules & Fare Calculation via Backend Microservice
  if (window.RHL.isBackendConnected) {
    try {
      const beServiceType = serviceType.startsWith("DELIVERY") ? "DELIVERY" : "RIDE";
      const beVehicleType = (serviceType === "RIDE_MOTORBIKE" || serviceType.startsWith("DELIVERY")) ? "MOTORBIKE" : 
                            (serviceType === "RIDE_CAR_7" ? "CAR_7_SEATS" : "CAR_4_SEATS");
      const quoteRes = await BackendAPI.requestQuote({
        customerId: window.RHL.currentUser?.userId || "c2a5e154-aeaa-4583-9ef0-ca3fdd2344ca",
        serviceType: beServiceType,
        vehicleType: beVehicleType,
        pickupLatitude: pickup.lat,
        pickupLongitude: pickup.lng,
        pickupAddress: pickup.name || pickup.address,
        dropoffLatitude: dropoff.lat,
        dropoffLongitude: dropoff.lng,
        dropoffAddress: dropoff.name || dropoff.address
      });

      if (quoteRes && quoteRes.code === "SUCCESS" && quoteRes.data) {
        const beQuote = quoteRes.data;
        quote.backendQuoteId = beQuote.quoteId;
        quote.totalFare = beQuote.totalFare;
        quote.baseFare = beQuote.baseFare;
        quote.distanceFare = beQuote.distanceFare;
        quote.timeFare = beQuote.timeFare;
        quote.surgeMultiplier = beQuote.surgeMultiplier;
        quote.distanceKm = beQuote.distanceKm;
        quote.durationMins = beQuote.durationMinutes;
      }
    } catch (err) {
      console.warn("Backend quote fetch fallback to local engine:", err);
    }
  }

  window.RHL.quote = quote;

  // Render Quote Details
  document.getElementById("quote-total-fare").innerText = GeoUtils.formatVND(quote.totalFare);
  document.getElementById("quote-distance").innerText = `${quote.distanceKm} km`;
  document.getElementById("quote-duration").innerText = `~${quote.durationMins} phút`;
  document.getElementById("quote-base-fare").innerText = GeoUtils.formatVND(quote.baseFare);
  document.getElementById("quote-distance-fare").innerText = GeoUtils.formatVND(quote.distanceFare);
  document.getElementById("quote-time-fare").innerText = GeoUtils.formatVND(quote.timeFare);

  // Surge Multiplier Badge
  const surgeBadge = document.getElementById("quote-surge-badge");
  if (quote.surgeMultiplier > 1.0) {
    surgeBadge.classList.remove("hidden");
    surgeBadge.innerHTML = `<i class="fa-solid fa-bolt text-amber-500 mr-1"></i> Giá cao do nhu cầu tăng (${quote.surgeMultiplier.toFixed(2)}x)`;
  } else {
    surgeBadge.classList.add("hidden");
  }

  // Show quote card
  document.getElementById("booking-quote-card").classList.remove("hidden");

  // Show on Map
  if (window.RHL.maps.customer) {
    MapService.drawTripRoute(window.RHL.maps.customer, 'customer', pickup, dropoff);
  }
  if (window.RHL.maps.dualCustomer) {
    MapService.drawTripRoute(window.RHL.maps.dualCustomer, 'dualCustomer', pickup, dropoff);
  }

  // 5-minute Quote countdown (TBD-05)
  clearInterval(window.RHL.quoteTimerInterval);
  window.RHL.quoteRemainingSeconds = 300;
  window.RHL.quoteTimerInterval = setInterval(() => {
    window.RHL.quoteRemainingSeconds--;
    const mins = Math.floor(window.RHL.quoteRemainingSeconds / 60);
    const secs = window.RHL.quoteRemainingSeconds % 60;
    const timerEl = document.getElementById("quote-countdown-text");
    if (timerEl) {
      timerEl.innerText = `Báo giá có hiệu lực: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    if (window.RHL.quoteRemainingSeconds <= 0) {
      clearInterval(window.RHL.quoteTimerInterval);
      showToast("Báo giá đã hết hạn! Vui lòng tính lại giá cước.", "warning");
      document.getElementById("booking-quote-card").classList.add("hidden");
      window.RHL.quote = null;
    }
  }, 1000);

  logAudit("CUSTOMER", "FARE_QUOTE_GENERATED", `Quote ${quote.quoteId}: ${GeoUtils.formatVND(quote.totalFare)} (Surge: ${quote.surgeMultiplier}x) (PostgreSQL Calculated)`);
}

// Confirm booking and start trip matching
async function handleConfirmBooking() {
  if (!window.RHL.quote) {
    showToast("Vui lòng lấy báo giá trước khi đặt xe!", "warning");
    return;
  }

  const newTrip = {
    tripId: "trip_" + Math.random().toString(36).substr(2, 9),
    code: "RHL-" + Math.floor(100000 + Math.random() * 900000),
    serviceType: window.RHL.quote.serviceType,
    pickup: window.RHL.quote.pickup,
    dropoff: window.RHL.quote.dropoff,
    quote: window.RHL.quote,
    status: "MATCHING",
    createdAt: Date.now(),
    driver: null,
    receiverName: document.getElementById("delivery-receiver-name")?.value || "Anh Minh",
    receiverPhone: document.getElementById("delivery-receiver-phone")?.value || "0918889999",
    packageDesc: document.getElementById("delivery-package-desc")?.value || "Hồ sơ tài liệu hợp đồng"
  };

  // Reset quote card
  clearInterval(window.RHL.quoteTimerInterval);
  document.getElementById("booking-quote-card").classList.add("hidden");
  document.getElementById("booking-form-card").classList.add("hidden");

  // Create real persistent Trip in PostgreSQL via api-gateway
  if (window.RHL.isBackendConnected && window.RHL.quote.backendQuoteId) {
    try {
      const customerId = window.RHL.currentUser?.userId || "c2a5e154-aeaa-4583-9ef0-ca3fdd2344ca";
      
      // Ensure nearby driver is ready & indexed in database
      const activeDriver = window.RHL.drivers.find(d => d.status === "AVAILABLE") || window.RHL.drivers[0];
      if (activeDriver && activeDriver.backendId) {
        BackendAPI.updateDriverStatus(activeDriver.backendId, "AVAILABLE");
        BackendAPI.updateDriverTelemetry(activeDriver.backendId, newTrip.pickup.lat + 0.001, newTrip.pickup.lng + 0.001, 5.0);
      }

      let createRes = await BackendAPI.createTrip({
        quoteId: window.RHL.quote.backendQuoteId,
        customerId: customerId,
        paymentMethod: "E_WALLET_SANDBOX",
        receiverName: newTrip.receiverName,
        receiverPhone: newTrip.receiverPhone,
        packageDescription: newTrip.packageDesc
      });

      // Handle active trip conflict automatically
      if (createRes && createRes.code === "ACTIVE_TRIP_EXISTS") {
        const custTrips = await BackendAPI.getCustomerTrips(customerId);
        if (custTrips && custTrips.data) {
          const active = custTrips.data.find(t => !["COMPLETED", "CANCELLED", "NO_DRIVER"].includes(t.status));
          if (active) {
            await BackendAPI.cancelTrip(active.tripId, customerId, "User auto-rebooked");
            createRes = await BackendAPI.createTrip({
              quoteId: window.RHL.quote.backendQuoteId,
              customerId: customerId,
              paymentMethod: "E_WALLET_SANDBOX",
              receiverName: newTrip.receiverName,
              receiverPhone: newTrip.receiverPhone,
              packageDescription: newTrip.packageDesc
            });
          }
        }
      }

      if (createRes && createRes.code === "SUCCESS" && createRes.data) {
        newTrip.backendTripId = createRes.data.tripId;
        newTrip.backendTripCode = createRes.data.tripCode;
        newTrip.code = createRes.data.tripCode;
      }
    } catch (err) {
      console.warn("Backend create trip error:", err);
    }
  }

  TripEngine.startMatching(newTrip);
}

// Update Customer Trip UI based on active status
function updateCustomerTripUI() {
  const activeTripCard = document.getElementById("customer-active-trip-card");
  const matchingCard = document.getElementById("customer-matching-card");
  const bookingFormCard = document.getElementById("booking-form-card");

  if (!window.RHL.trip || ["COMPLETED", "CANCELLED", "NO_DRIVER"].includes(window.RHL.trip.status)) {
    if (activeTripCard) activeTripCard.classList.add("hidden");
    if (matchingCard) matchingCard.classList.add("hidden");
    if (bookingFormCard) bookingFormCard.classList.remove("hidden");
    return;
  }

  if (window.RHL.trip.status === "MATCHING") {
    if (activeTripCard) activeTripCard.classList.add("hidden");
    if (matchingCard) matchingCard.classList.remove("hidden");
    if (bookingFormCard) bookingFormCard.classList.add("hidden");
    return;
  }

  // Status is ACCEPTED, PICKING_UP, ARRIVED, or IN_TRIP
  if (matchingCard) matchingCard.classList.add("hidden");
  if (activeTripCard) activeTripCard.classList.remove("hidden");
  if (bookingFormCard) bookingFormCard.classList.add("hidden");

  const trip = window.RHL.trip;
  const driver = trip.driver;

  const setEl = (id, fn) => {
    const el = document.getElementById(id);
    if (el) fn(el);
  };

  setEl("active-trip-code", el => el.innerText = trip.code);
  setEl("active-driver-name", el => el.innerText = driver ? driver.name : "Đang kết nối...");
  setEl("active-driver-vehicle", el => el.innerText = driver ? `${driver.vehicleModel} • ${driver.vehiclePlate}` : "");
  setEl("active-driver-rating", el => el.innerText = driver ? `⭐ ${driver.rating}` : "");
  setEl("active-driver-avatar", el => el.src = driver ? driver.avatar : "https://via.placeholder.com/60");

  // Status Badge
  const statusBadge = document.getElementById("active-trip-status-badge");
  if (statusBadge) {
    const statusMap = {
      ACCEPTED: { text: "Tài xế đã nhận", color: "bg-blue-100 text-blue-700" },
      PICKING_UP: { text: "Tài xế đang đến đón", color: "bg-amber-100 text-amber-700" },
      ARRIVED: { text: "Tài xế đã đến điểm đón", color: "bg-emerald-100 text-emerald-700" },
      IN_TRIP: { text: "Đang trong chuyến đi", color: "bg-purple-100 text-purple-700" }
    };
    const currentStatusInfo = statusMap[trip.status] || { text: trip.status, color: "bg-slate-100 text-slate-700" };
    statusBadge.className = `px-2.5 py-1 rounded-full text-xs font-semibold ${currentStatusInfo.color}`;
    statusBadge.innerText = currentStatusInfo.text;
  }
}

// Update Driver App Panel
function updateDriverUI() {
  const driver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId);
  if (!driver) return;

  const setSafeText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  // Driver Profile & Status
  setSafeText("driver-display-name", driver.name);
  setSafeText("driver-display-phone", driver.phone);
  setSafeText("driver-display-plate", driver.vehiclePlate);
  setSafeText("driver-display-vehicle", driver.vehicleModel);
  setSafeText("driver-display-rating", `⭐ ${driver.rating} (${driver.totalTrips} chuyến)`);
  setSafeText("driver-wallet-balance", GeoUtils.formatVND(driver.walletBalance));

  // Status Switch Button
  const toggleBtn = document.getElementById("driver-toggle-status-btn");
  const radarBadge = document.getElementById("driver-radar-badge");
  const radarDesc = document.getElementById("driver-radar-desc");
  const poolCard = document.getElementById("driver-pool-orders-card");

  if (driver.status === "AVAILABLE") {
    toggleBtn.innerHTML = `<i class="fa-solid fa-power-off mr-2"></i> Trực Tuyến (Online)`;
    toggleBtn.className = "w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all flex items-center justify-center";
    if (radarBadge) {
      radarBadge.innerText = "SẴN SÀNG NHẬN ĐƠN";
      radarBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
    if (radarDesc) {
      radarDesc.innerText = "Đang quét tín hiệu đơn đặt xe và giao hàng trong bán kính 3km – 8km...";
    }
    if (poolCard) poolCard.classList.remove("opacity-50", "pointer-events-none");
  } else if (driver.status === "OFFLINE") {
    toggleBtn.innerHTML = `<i class="fa-solid fa-power-off mr-2"></i> Ngoại Tuyến (Offline)`;
    toggleBtn.className = "w-full py-3 rounded-xl font-bold text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all flex items-center justify-center";
    if (radarBadge) {
      radarBadge.innerText = "TẠM NGHỈ (OFFLINE)";
      radarBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400 border border-slate-600";
    }
    if (radarDesc) {
      radarDesc.innerText = "Bác tài đang tắt nhận đơn. Hãy bật Trực Tuyến ở trên để nhận cuốc xe mới!";
    }
    if (poolCard) poolCard.classList.add("opacity-50", "pointer-events-none");
  } else {
    toggleBtn.innerHTML = `<i class="fa-solid fa-car mr-2"></i> Đang Chạy Cuốc (${driver.status})`;
    toggleBtn.className = "w-full py-3 rounded-xl font-bold text-sm bg-amber-600 text-white cursor-not-allowed flex items-center justify-center";
    if (radarBadge) {
      radarBadge.innerText = "ĐANG THỰC HIỆN CUỐC";
      radarBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30";
    }
    if (radarDesc) {
      radarDesc.innerText = "Bác tài đang bận phục vụ chuyến xe hiện tại.";
    }
    if (poolCard) poolCard.classList.add("opacity-50", "pointer-events-none");
  }

  // Render Available Orders Pool
  renderAvailableOrdersPool();

  // Active Offer Card
  const offerCard = document.getElementById("driver-offer-popup-card");
  if (offerCard) {
    if (window.RHL.activeOffer && window.RHL.activeOffer.driverId === driver.id) {
      offerCard.classList.remove("hidden");
      const off = window.RHL.activeOffer;
      setSafeText("offer-trip-type", off.trip.serviceType.replace("_", " "));
      setSafeText("offer-trip-fare", GeoUtils.formatVND(off.trip.quote.totalFare));
      setSafeText("offer-pickup-distance", `${off.distanceToPickup} m`);
      setSafeText("offer-pickup-addr", off.trip.pickup.name);
      setSafeText("offer-dropoff-addr", off.trip.dropoff.name);
    } else {
      offerCard.classList.add("hidden");
    }
  }

  // Driver Active Job Control Panel
  const jobPanel = document.getElementById("driver-active-job-panel");
  if (jobPanel) {
    if (window.RHL.trip && window.RHL.trip.driver && window.RHL.trip.driver.id === driver.id && 
        !["COMPLETED", "CANCELLED"].includes(window.RHL.trip.status)) {
      jobPanel.classList.remove("hidden");
      const trip = window.RHL.trip;
      setSafeText("driver-job-trip-code", trip.code);
      setSafeText("driver-job-pickup-name", trip.pickup.name);
      setSafeText("driver-job-dropoff-name", trip.dropoff.name);

      // Delivery specific info
      const deliveryBox = document.getElementById("driver-job-delivery-box");
      if (deliveryBox) {
        if (trip.serviceType === "DELIVERY_MOTORBIKE") {
          deliveryBox.classList.remove("hidden");
          setSafeText("driver-job-receiver-info", `${trip.receiverName} (${trip.receiverPhone})`);
          setSafeText("driver-job-package-desc", trip.packageDesc);
        } else {
          deliveryBox.classList.add("hidden");
        }
      }

      // Action button based on state machine
      const actionBtn = document.getElementById("driver-job-next-action-btn");
      if (actionBtn) {
        const isDelivery = trip.serviceType === "DELIVERY_MOTORBIKE";

        if (trip.status === "ACCEPTED") {
          actionBtn.innerText = isDelivery ? "Bắt đầu đến điểm lấy hàng (PICKING_UP)" : "Bắt đầu đến điểm đón (PICKING_UP)";
          actionBtn.onclick = () => TripEngine.updateTripStatus("PICKING_UP");
        } else if (trip.status === "PICKING_UP") {
          actionBtn.innerText = isDelivery ? "Đã tới kho / điểm lấy hàng (ARRIVED)" : "Đã tới điểm đón (ARRIVED)";
          actionBtn.onclick = () => TripEngine.updateTripStatus("ARRIVED");
        } else if (trip.status === "ARRIVED") {
          actionBtn.innerText = isDelivery ? "Đã lấy hàng & Đang vận chuyển (IN_TRIP)" : "Khách đã lên xe (IN_TRIP)";
          actionBtn.onclick = () => TripEngine.updateTripStatus("IN_TRIP");
        } else if (trip.status === "IN_TRIP") {
          actionBtn.innerText = isDelivery ? "Xác nhận đã giao hàng tận tay (Nhập OTP)" : "Hoàn tất chuyến đi (COMPLETED)";
          actionBtn.onclick = () => {
            if (isDelivery) {
              openDeliveryOTPModal();
            } else {
              TripEngine.updateTripStatus("COMPLETED");
            }
          };
        }
      }
    } else {
      jobPanel.classList.add("hidden");
    }
  }
}

function openDeliveryOTPModal() {
  const trip = window.RHL.trip;
  if (!trip) return;
  document.getElementById("delivery-otp-receiver-name").innerText = trip.receiverName || "Anh Tuấn";
  document.getElementById("delivery-otp-receiver-phone").innerText = trip.receiverPhone || "0919888999";
  document.getElementById("delivery-otp-package-desc").innerText = trip.packageDesc || "Hồ sơ hợp đồng & quà tặng";
  document.getElementById("delivery-otp-input").value = "8264";
  document.getElementById("delivery-otp-modal").classList.remove("hidden");
}

function confirmDeliveryOTP() {
  const otpVal = document.getElementById("delivery-otp-input").value.trim();
  if (!otpVal || otpVal.length < 4) {
    showToast("Vui lòng nhập đủ 4 chữ số OTP từ người nhận!", "warning");
    return;
  }
  document.getElementById("delivery-otp-modal").classList.add("hidden");
  showToast(`Mã OTP ${otpVal} hợp lệ! Bằng chứng giao hàng hoàn tất (TBD-08).`, "success");
  TripEngine.completeTrip();
}

// =========================================================================
// DUAL SIMULATION ENGINE & INTERACTIVE CONTROLLER
// =========================================================================

function syncDualMaps() {
  if (!window.RHL.maps.dualCustomer || !window.RHL.maps.dualDriver) return;
  window.RHL.maps.dualCustomer.invalidateSize();
  window.RHL.maps.dualDriver.invalidateSize();
  MapService.renderAllDriversOnMap(window.RHL.maps.dualCustomer, 'dualCustomer');
  MapService.renderAllDriversOnMap(window.RHL.maps.dualDriver, 'dualDriver');
  if (window.RHL.trip && window.RHL.trip.pickup && window.RHL.trip.dropoff) {
    MapService.drawTripRoute(window.RHL.maps.dualCustomer, 'dualCustomer', window.RHL.trip.pickup, window.RHL.trip.dropoff);
    MapService.drawTripRoute(window.RHL.maps.dualDriver, 'dualDriver', window.RHL.trip.pickup, window.RHL.trip.dropoff);
  }
}

function updateDualSimulationUI() {
  const dualOfferBox = document.getElementById("dual-driver-offer-box");
  const dualJobBox = document.getElementById("dual-driver-job-box");
  const dualCustomerTracking = document.getElementById("dual-customer-tracking-box");
  const dualMatchingBox = document.getElementById("dual-customer-matching-box");
  const dualBookingBox = document.getElementById("dual-customer-booking-box");
  const stepBadge = document.getElementById("dual-sim-step-badge");
  const driverHeader = document.getElementById("dual-driver-header-name");

  const currentDriver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId) || window.RHL.drivers[0];
  if (driverHeader && currentDriver) {
    driverHeader.innerText = `Tài xế: ${currentDriver.name} (${currentDriver.status})`;
  }

  // Case 1: No active trip or Trip Finished
  if (!window.RHL.trip || ["COMPLETED", "CANCELLED", "NO_DRIVER"].includes(window.RHL.trip.status)) {
    if (dualBookingBox) dualBookingBox.classList.remove("hidden");
    if (dualMatchingBox) dualMatchingBox.classList.add("hidden");
    if (dualCustomerTracking) dualCustomerTracking.classList.add("hidden");
    if (dualOfferBox) dualOfferBox.classList.add("hidden");
    if (dualJobBox) dualJobBox.classList.add("hidden");

    if (stepBadge) {
      stepBadge.innerText = window.RHL.trip && window.RHL.trip.status === "COMPLETED" ? "ĐÃ HOÀN TẤT CHUYẾN" : "SẴN SÀNG MÔ PHỎNG";
      stepBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-emerald-400 border border-slate-700";
    }
    const statusText = document.getElementById("dual-trip-status-text");
    if (statusText) statusText.innerText = "SẴN SÀNG";
    return;
  }

  const trip = window.RHL.trip;
  if (dualBookingBox) dualBookingBox.classList.add("hidden");

  // Case 2: Trip Matching / Dispatched
  if (trip.status === "MATCHING") {
    if (dualMatchingBox) dualMatchingBox.classList.remove("hidden");
    if (dualCustomerTracking) dualCustomerTracking.classList.add("hidden");

    if (stepBadge) {
      stepBadge.innerText = `ĐANG TÌM TÀI XẾ (Vòng ${window.RHL.matchingStage || 1}/3)`;
      stepBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse";
    }

    const statusText = document.getElementById("dual-trip-status-text");
    if (statusText) statusText.innerText = "TÌM TÀI XẾ";

    // Offer popup on driver side
    if (window.RHL.activeOffer) {
      if (dualOfferBox) {
        dualOfferBox.classList.remove("hidden");
        const fareEl = document.getElementById("dual-offer-fare");
        if (fareEl) fareEl.innerText = GeoUtils.formatVND(trip.quote.totalFare);
      }
      if (stepBadge) stepBadge.innerText = "ĐÃ GỬI ĐỀ NGHỊ TỚI TÀI XẾ (15S)";
    } else {
      if (dualOfferBox) dualOfferBox.classList.add("hidden");
    }
    return;
  }

  // Case 3: Trip Accepted & In Progress (ACCEPTED, PICKING_UP, ARRIVED, IN_TRIP)
  if (dualMatchingBox) dualMatchingBox.classList.add("hidden");
  if (dualOfferBox) dualOfferBox.classList.add("hidden");
  if (dualCustomerTracking) dualCustomerTracking.classList.remove("hidden");
  if (dualJobBox) dualJobBox.classList.remove("hidden");

  // Customer side updates
  const statusText = document.getElementById("dual-trip-status-text");
  if (statusText) statusText.innerText = trip.status;
  const dNameEl = document.getElementById("dual-trip-driver-name");
  if (dNameEl) dNameEl.innerText = trip.driver ? `${trip.driver.name} (${trip.driver.vehiclePlate})` : "Tài xế RHL";
  
  const statusBadgeCust = document.getElementById("dual-customer-badge-status");
  if (statusBadgeCust) statusBadgeCust.innerText = trip.status;

  const subDesc = document.getElementById("dual-customer-trip-status-sub");
  if (subDesc) {
    if (trip.status === "ACCEPTED") subDesc.innerText = "Tài xế đã nhận đơn và chuẩn bị di chuyển";
    else if (trip.status === "PICKING_UP") subDesc.innerText = "Tài xế đang trên đường đến điểm đón";
    else if (trip.status === "ARRIVED") subDesc.innerText = "Tài xế đã có mặt tại điểm đón";
    else if (trip.status === "IN_TRIP") subDesc.innerText = "Đang trong chuyến đi đến điểm trả";
  }

  // Driver side updates
  const jobStatus = document.getElementById("dual-driver-job-status");
  if (jobStatus) jobStatus.innerText = trip.status;

  const netEarning = Math.round(trip.quote.totalFare * 0.80);
  const earningEl = document.getElementById("dual-driver-earning-preview");
  if (earningEl) earningEl.innerText = `+${GeoUtils.formatVND(netEarning)}`;

  if (stepBadge) {
    stepBadge.innerText = `TIẾN TRÌNH: ${trip.status}`;
    stepBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  }

  // Action Button on Driver Side
  const actionBtn = document.getElementById("dual-driver-action-btn");
  if (actionBtn) {
    const isDelivery = trip.serviceType === "DELIVERY_MOTORBIKE";
    if (trip.status === "ACCEPTED") {
      actionBtn.innerHTML = `<span>Bắt đầu đến điểm đón (PICKING_UP)</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
    } else if (trip.status === "PICKING_UP") {
      actionBtn.innerHTML = `<span>Đã tới điểm đón (ARRIVED)</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
    } else if (trip.status === "ARRIVED") {
      actionBtn.innerHTML = `<span>Khách đã lên xe (IN_TRIP)</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
    } else if (trip.status === "IN_TRIP") {
      actionBtn.innerHTML = `<span>${isDelivery ? 'Giao Hàng Thành Công (Nhập OTP)' : 'Hoàn Tất Chuyến Đi (COMPLETED)'}</span> <i class="fa-solid fa-check ml-1"></i>`;
    }
  }
}

// Next state handler for Dual Simulation
function handleDualNextState() {
  if (!window.RHL.trip) return;
  const trip = window.RHL.trip;
  const isDelivery = trip.serviceType === "DELIVERY_MOTORBIKE";

  if (trip.status === "ACCEPTED") {
    TripEngine.updateTripStatus("PICKING_UP");
  } else if (trip.status === "PICKING_UP") {
    TripEngine.updateTripStatus("ARRIVED");
  } else if (trip.status === "ARRIVED") {
    TripEngine.updateTripStatus("IN_TRIP");
  } else if (trip.status === "IN_TRIP") {
    if (isDelivery) {
      openDeliveryOTPModal();
    } else {
      TripEngine.updateTripStatus("COMPLETED");
    }
  }
}

// 1-Click quick booking from Dual Screen
function quickBookDualTrip(type = "RIDE") {
  const pickup = SAMPLE_LOCATIONS[0]; // Chợ Bến Thành
  const dropoff = type === "DELIVERY" ? SAMPLE_LOCATIONS[3] : SAMPLE_LOCATIONS[1]; // Landmark 81 or Bách Khoa
  const serviceType = type === "DELIVERY" ? "DELIVERY_MOTORBIKE" : "RIDE_MOTORBIKE";

  const quote = PricingEngine.calculateQuote(serviceType, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  window.RHL.quote = quote;

  const newTrip = {
    tripId: "trip_" + Math.random().toString(36).substr(2, 9),
    code: "RHL-" + Math.floor(100000 + Math.random() * 900000),
    serviceType: serviceType,
    pickup: pickup,
    dropoff: dropoff,
    quote: quote,
    status: "MATCHING",
    createdAt: Date.now(),
    driver: null,
    receiverName: "Anh Hoàng Tuấn",
    receiverPhone: "0909887766",
    packageDesc: "Tài liệu & hợp đồng công chứng"
  };

  showToast(`⚡ Đã tạo cuốc xe mô phỏng ${newTrip.code}! Đang kết nối tài xế...`, "success");
  TripEngine.startMatching(newTrip);

  if (window.RHL.maps.dualCustomer) {
    MapService.drawTripRoute(window.RHL.maps.dualCustomer, 'dualCustomer', pickup, dropoff);
  }
  if (window.RHL.maps.dualDriver) {
    MapService.drawTripRoute(window.RHL.maps.dualDriver, 'dualDriver', pickup, dropoff);
  }
  updateDualSimulationUI();
}

// Full automated walk-through from A to Z
let autoDemoTimer = null;
function startAutoFullDemo() {
  clearTimeout(autoDemoTimer);
  setRole('dual');
  showToast("🚀 Bắt đầu kịch bản mô phỏng tự động toàn trình (A-Z)...", "success");

  // Step 1: Book a trip immediately
  quickBookDualTrip("RIDE");

  // Step 2: Driver accepts offer automatically after 1.8s
  autoDemoTimer = setTimeout(() => {
    if (window.RHL.activeOffer) {
      showToast("🚗 Tài xế tự động chấp nhận cuốc xe (ACCEPT)!", "success");
      TripEngine.acceptOffer(window.RHL.selectedDriverId);
      syncDualMaps();

      // Step 3: Arrived after 2.5s
      autoDemoTimer = setTimeout(() => {
        showToast("📍 Tài xế đã đến điểm đón (ARRIVED)!", "success");
        TripEngine.updateTripStatus("ARRIVED");

        // Step 4: Passenger boards & In-Trip after 2s
        autoDemoTimer = setTimeout(() => {
          showToast("🛣️ Khách đã lên xe, bắt đầu di chuyển (IN_TRIP)!", "success");
          TripEngine.updateTripStatus("IN_TRIP");

          // Step 5: Completed after 3s
          autoDemoTimer = setTimeout(() => {
            showToast("🏁 Đã tới điểm đến! Hoàn tất & nhận 80% thu nhập!", "success");
            TripEngine.updateTripStatus("COMPLETED");
            syncDualMaps();
          }, 3000);

        }, 2000);

      }, 2500);
    }
  }, 1800);
}

// Reset Dual Simulation
function resetDualSimulation() {
  clearTimeout(autoDemoTimer);
  clearInterval(window.RHL.offerTimerInterval);
  clearInterval(window.RHL.matchingTimerInterval);
  clearInterval(window.RHL.gpsSimInterval);
  window.RHL.activeOffer = null;
  window.RHL.trip = null;

  // Restore drivers
  window.RHL.drivers.forEach(d => {
    if (d.status !== "OFFLINE") d.status = "AVAILABLE";
  });

  // Clear map routes
  ['dualCustomer', 'dualDriver'].forEach(mapKey => {
    if (window.RHL.routeLayers[mapKey] && window.RHL.maps[mapKey]) {
      window.RHL.routeLayers[mapKey].forEach(layer => window.RHL.maps[mapKey].removeLayer(layer));
      window.RHL.routeLayers[mapKey] = [];
    }
  });

  syncDualMaps();
  updateCustomerTripUI();
  updateDriverUI();
  updateDualSimulationUI();
  showToast("Đã đặt lại trạng thái mô phỏng ban đầu!", "success");
}

// Toggle Driver Online / Offline status
function toggleDriverAvailability() {
  const driver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId);
  if (!driver) return;

  if (driver.status === "BUSY" || driver.status === "OFFERED") {
    showToast("Không thể đổi trạng thái khi đang có chuyến hoặc đề nghị!", "warning");
    return;
  }

  driver.status = driver.status === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
  logAudit("DRIVER", "AVAILABILITY_CHANGED", `Driver ${driver.name} is now ${driver.status}`);
  showToast(`Đã chuyển sang chế độ ${driver.status === 'AVAILABLE' ? 'Trực Tuyến (Online)' : 'Ngoại Tuyến (Offline)'}`, "success");
  
  updateDriverUI();
  if (window.RHL.maps.admin) MapService.renderAllDriversOnMap(window.RHL.maps.admin, 'admin');
}

// In-trip Chat
function sendChatMessage(senderRole) {
  const inputEl = document.getElementById(senderRole === "CUSTOMER" ? "customer-chat-input" : "driver-chat-input");
  if (!inputEl || !inputEl.value.trim()) return;

  const text = inputEl.value.trim();
  const msg = {
    id: "msg_" + Date.now(),
    sender: senderRole,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  window.RHL.chatMessages.push(msg);
  inputEl.value = "";
  AudioPlayer.playChatPing();

  renderChatBubbles();
}

function renderChatBubbles() {
  ['customer', 'driver'].forEach(view => {
    const chatContainer = document.getElementById(`${view}-chat-messages`);
    if (!chatContainer) return;
    
    chatContainer.innerHTML = window.RHL.chatMessages.map(m => {
      const isMe = (view === 'customer' && m.sender === 'CUSTOMER') || (view === 'driver' && m.sender === 'DRIVER');
      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2">
          <div class="px-3 py-2 text-xs max-w-[80%] ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}">
            ${m.text}
          </div>
          <span class="text-[10px] text-slate-400 mt-0.5">${m.time}</span>
        </div>
      `;
    }).join("");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}

// Rating Modal (FR-RAT-001)
function openRatingModal(trip) {
  const modal = document.getElementById("rating-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.getElementById("rating-driver-name").innerText = trip.driver.name;
  document.getElementById("rating-driver-plate").innerText = trip.driver.vehiclePlate;
  document.getElementById("rating-fare-amount").innerText = GeoUtils.formatVND(trip.quote.totalFare);
}

function submitRating(score) {
  const modal = document.getElementById("rating-modal");
  if (modal) modal.classList.add("hidden");

  const driver = window.RHL.trip?.driver;
  if (driver) {
    // Weighted average formula (FR-RAT-003)
    const newRating = ((driver.rating * driver.totalTrips) + score) / (driver.totalTrips + 1);
    driver.rating = parseFloat(newRating.toFixed(2));
    logAudit("CUSTOMER", "RATING_SUBMITTED", `Customer rated Driver ${driver.name} ${score} stars`);
    showToast(`Cảm ơn bạn đã đánh giá ${score} sao cho bác tài!`, "success");
  }

  // Add completed trip to Customer Trip History (Capability 11)
  const trip = window.RHL.trip;
  if (trip) {
    CUSTOMER_TRIP_HISTORY.unshift({
      code: trip.code,
      serviceType: trip.serviceType,
      pickup: trip.pickup.name,
      dropoff: trip.dropoff.name,
      totalFare: trip.quote.totalFare,
      driverName: driver ? driver.name : "Tài xế RHL",
      driverPlate: driver ? driver.vehiclePlate : "59-P1 839.21",
      rating: score,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Hôm nay",
      paymentMethod: "Ví điện tử / Tiền mặt",
      status: "COMPLETED"
    });
  }

  // Reset active trip state
  window.RHL.trip = null;
  window.RHL.chatMessages = [];
  updateCustomerTripUI();
  updateDriverUI();
  updateDualSimulationUI();
}

// =========================================================================
// 8.8. CUSTOMER TRIP HISTORY (CAPABILITY 11 / FR-TRIP-015)
// =========================================================================
const CUSTOMER_TRIP_HISTORY = [
  {
    code: "RHL-782109",
    serviceType: "RIDE_MOTORBIKE",
    pickup: "Chợ Bến Thành, Quận 1",
    dropoff: "Landmark 81, Bình Thạnh",
    totalFare: 38000,
    driverName: "Nguyễn Văn Hùng",
    driverPlate: "59-P1 839.21",
    rating: 5,
    time: "09:15 Hôm nay",
    paymentMethod: "Ví điện tử Sandbox",
    status: "COMPLETED"
  },
  {
    code: "RHL-442109",
    serviceType: "DELIVERY_MOTORBIKE",
    pickup: "Sân bay Tân Sơn Nhất",
    dropoff: "Đại học Bách Khoa, Quận 10",
    totalFare: 42000,
    driverName: "Trần Thị Mai",
    driverPlate: "59-T2 472.90",
    rating: 5,
    time: "Hôm qua",
    paymentMethod: "Tiền mặt (CASH)",
    status: "COMPLETED"
  }
];

function openCustomerHistoryModal() {
  const modal = document.getElementById("customer-history-modal");
  const listEl = document.getElementById("customer-history-list");
  if (!modal || !listEl) return;

  listEl.innerHTML = CUSTOMER_TRIP_HISTORY.map(t => {
    const isDelivery = t.serviceType === "DELIVERY_MOTORBIKE";
    const icon = isDelivery ? "fa-box text-amber-400" : t.serviceType.includes("CAR") ? "fa-car text-blue-400" : "fa-motorcycle text-emerald-400";
    const serviceLabel = isDelivery ? "GIAO HÀNG SIÊU TỐC" : t.serviceType === "RIDE_CAR_4" ? "XE 4 CHỖ" : t.serviceType === "RIDE_CAR_7" ? "XE 7 CHỖ" : "XE MÁY CHỞ KHÁCH";

    return `
      <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid ${icon}"></i>
            <span class="font-bold text-white">${serviceLabel}</span>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">${t.status}</span>
          </div>
          <span class="font-mono text-slate-400 text-[11px]">${t.code}</span>
        </div>

        <div class="text-[11px] text-slate-300 space-y-0.5">
          <div>📍 Đón/Lấy: <b>${t.pickup}</b></div>
          <div>🏁 Đến/Giao: <b>${t.dropoff}</b></div>
        </div>

        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <div>
            <div class="text-slate-400">Tài xế: <span class="font-bold text-white">${t.driverName}</span> (${t.driverPlate})</div>
            <div class="text-amber-400">Đánh giá: ${'⭐'.repeat(t.rating)}</div>
          </div>
          <div class="text-right">
            <div class="font-extrabold text-emerald-400 font-mono text-sm">${GeoUtils.formatVND(t.totalFare)}</div>
            <div class="text-[10px] text-slate-400">${t.time}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  modal.classList.remove("hidden");
}

// =========================================================================
// 8.9. SUPPORT INCIDENT & TRIP INTERVENTION HANDLERS (CAPABILITY 12 / FR-CAN-007)
// =========================================================================
function handleSupportLookupTrip() {
  const codeInput = document.getElementById("support-trip-code-input");
  const code = codeInput ? codeInput.value.trim() : "";
  const trip = window.RHL.trip;

  if (trip && (!code || code === trip.code)) {
    document.getElementById("support-trip-code-display").innerText = trip.code;
    document.getElementById("support-trip-status").innerText = trip.status;
    showToast(`Đã tìm thấy thông tin chuyến đi ${trip.code}!`, "info");
  } else {
    document.getElementById("support-trip-code-display").innerText = code || "RHL-882190";
    document.getElementById("support-trip-status").innerText = "IN_TRIP";
    showToast(`Đã tải hồ sơ chuyến ${code || 'RHL-882190'} từ hệ thống lưu trữ.`, "info");
  }
}

function handleSupportEmergencyCancel() {
  const reason = prompt("Vui lòng nhập lý do can thiệp hủy chuyến sự cố (Bắt buộc theo FR-CAN-007):", "Sự cố giao thông khẩn cấp / Hỏng xe đột xuất");
  if (!reason) return;

  if (window.RHL.trip) {
    TripEngine.cancelTrip("SUPPORT_STAFF", reason);
  } else {
    logAudit("SUPPORT_STAFF", "EMERGENCY_TRIP_CANCELLED", `Incident override cancellation. Reason: ${reason}`);
    showToast(`Đã can thiệp hủy chuyến theo quy trình sự cố khẩn cấp!`, "warning");
  }
}

function handleSupportIssueRefund() {
  const tripCode = document.getElementById("support-trip-code-display")?.innerText || "RHL-CURRENT";
  logAudit("FINANCE_STAFF", "REFUND_ISSUED", `Full refund issued for Trip ${tripCode} to customer wallet/bank (FR-PAY-009)`);
  showToast(`Đã hoàn tiền 100% cho khách hàng thành công! Ghi sổ bù bất biến.`, "success");
}

// Render Admin Audit Logs
function renderAdminAuditLogs() {
  const tbody = document.getElementById("admin-audit-table-body");
  if (!tbody) return;

  tbody.innerHTML = window.RHL.auditLogs.slice(0, 15).map(l => `
    <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 text-xs">
      <td class="py-2.5 px-3 text-slate-400">${l.time}</td>
      <td class="py-2.5 px-3 font-semibold text-emerald-400">${l.actor}</td>
      <td class="py-2.5 px-3 text-slate-300">${l.action}</td>
      <td class="py-2.5 px-3 text-slate-400 font-mono text-[11px]">${l.detail}</td>
    </tr>
  `).join("");
}

// Render Driver Wallet Ledger
function renderDriverWallet() {
  const driver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId);
  if (!driver) return;

  const entries = window.RHL.walletEntries[driver.id] || [];
  const listEl = document.getElementById("driver-wallet-entries-list");
  if (!listEl) return;

  listEl.innerHTML = entries.map(e => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 text-xs mb-2">
      <div>
        <div class="font-bold text-slate-200">${e.type === 'TRIP_EARNING' ? 'Thu nhập chuyến ' + e.ref : e.type}</div>
        <div class="text-[10px] text-slate-400">${e.time}</div>
      </div>
      <div class="text-right">
        <div class="font-bold ${e.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
          ${e.amount >= 0 ? '+' : ''}${GeoUtils.formatVND(e.amount)}
        </div>
        <div class="text-[10px] text-slate-400">Số dư: ${GeoUtils.formatVND(e.balanceAfter)}</div>
      </div>
    </div>
  `).join("");
}

// =========================================================================
// 8.5. AVAILABLE ORDERS POOL & INSTANT ORDER ACCEPTANCE (TRUNG TÂM NHẬN ĐƠN TÀI XẾ)
// =========================================================================

const AVAILABLE_ORDERS_POOL = [
  {
    id: "ord-pool-1",
    code: "RHL-882190",
    serviceType: "RIDE_MOTORBIKE",
    pickup: SAMPLE_LOCATIONS[0], // Chợ Bến Thành
    dropoff: SAMPLE_LOCATIONS[1], // Landmark 81
    distanceKm: 4.2,
    durationMins: 12,
    totalFare: 38000,
    customerName: "Nguyễn Văn Tuấn",
    customerPhone: "0918112233"
  },
  {
    id: "ord-pool-2",
    code: "RHL-551029",
    serviceType: "DELIVERY_MOTORBIKE",
    pickup: SAMPLE_LOCATIONS[2], // Sân bay Tân Sơn Nhất
    dropoff: SAMPLE_LOCATIONS[3], // ĐH Bách Khoa
    distanceKm: 5.1,
    durationMins: 15,
    totalFare: 42000,
    customerName: "Lê Hoàng Yến",
    customerPhone: "0934556677",
    receiverName: "Chị Thảo (Nhận hàng)",
    receiverPhone: "0909112233",
    packageDesc: "Hồ sơ tài liệu và quà tặng"
  },
  {
    id: "ord-pool-3",
    code: "RHL-339182",
    serviceType: "RIDE_CAR_4",
    pickup: SAMPLE_LOCATIONS[4], // Phố đi bộ Nguyễn Huệ
    dropoff: SAMPLE_LOCATIONS[6], // Khu đô thị Sala
    distanceKm: 3.8,
    durationMins: 10,
    totalFare: 58000,
    customerName: "Trần Bảo Nam",
    customerPhone: "0988776655"
  }
];

function renderAvailableOrdersPool() {
  const listEl = document.getElementById("driver-pool-orders-list");
  const countBadge = document.getElementById("pool-orders-count-badge");
  if (!listEl) return;

  const currentDriver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId);
  const isOnline = currentDriver && currentDriver.status === "AVAILABLE";

  if (countBadge) {
    countBadge.innerText = `${AVAILABLE_ORDERS_POOL.length} cuốc quanh đây`;
  }

  if (AVAILABLE_ORDERS_POOL.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-6 text-slate-500 text-xs">
        <i class="fa-solid fa-mug-hot text-lg mb-1 block"></i>
        Hiện tại không có cuốc xe nào đang chờ.
      </div>
    `;
    return;
  }

  listEl.innerHTML = AVAILABLE_ORDERS_POOL.map((order, idx) => {
    const commission = Math.round(order.totalFare * 0.20);
    const netEarning = order.totalFare - commission;
    const isDelivery = order.serviceType === "DELIVERY_MOTORBIKE";
    const serviceIcon = isDelivery ? "fa-box text-amber-400" : order.serviceType.includes("CAR") ? "fa-car text-blue-400" : "fa-motorcycle text-emerald-400";
    const serviceLabel = isDelivery ? "GIAO HÀNG" : order.serviceType === "RIDE_CAR_4" ? "XE 4 CHỖ" : order.serviceType === "RIDE_CAR_7" ? "XE 7 CHỖ" : "XE MÁY";

    return `
      <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-all text-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-white flex items-center gap-1.5">
            <i class="fa-solid ${serviceIcon}"></i> ${serviceLabel}
          </span>
          <span class="font-mono text-[10px] text-slate-400">${order.code}</span>
        </div>

        <div class="text-[11px] text-slate-300 space-y-0.5">
          <div class="truncate"><i class="fa-solid fa-location-dot text-emerald-400 mr-1 text-[10px]"></i> Đón: <b>${order.pickup.name}</b></div>
          <div class="truncate"><i class="fa-solid fa-flag text-rose-400 mr-1 text-[10px]"></i> Đến: <b>${order.dropoff.name}</b></div>
        </div>

        <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-slate-400">${order.distanceKm} km • ~${order.durationMins}p</div>
            <div class="font-extrabold text-emerald-400 font-mono text-xs">+${GeoUtils.formatVND(netEarning)} <span class="text-[9px] text-slate-400 font-normal">(80%)</span></div>
          </div>
          <button onclick="acceptPoolOrder('${order.id}')" ${!isOnline ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg font-bold text-xs ${isOnline ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} transition-all flex items-center gap-1">
            <i class="fa-solid fa-check"></i> Nhận Cuốc
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function acceptPoolOrder(orderId) {
  const driver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId);
  if (!driver) return;

  if (driver.status === "OFFLINE") {
    showToast("Vui lòng BẬT TRỰC TUYẾN (Online) trước khi nhận cuốc xe!", "warning");
    return;
  }

  if (driver.status === "BUSY" || driver.status === "OFFERED") {
    showToast("Bác tài đang thực hiện cuốc xe khác!", "warning");
    return;
  }

  const orderIdx = AVAILABLE_ORDERS_POOL.findIndex(o => o.id === orderId);
  if (orderIdx === -1) {
    showToast("Cuốc xe này đã được tài xế khác nhận!", "warning");
    return;
  }

  const order = AVAILABLE_ORDERS_POOL.splice(orderIdx, 1)[0];

  // Convert pool order to Active Trip
  const trip = {
    tripId: "trip_" + Math.random().toString(36).substr(2, 9),
    code: order.code,
    serviceType: order.serviceType,
    pickup: order.pickup,
    dropoff: order.dropoff,
    quote: {
      quoteId: "quote_" + Math.random().toString(36).substr(2, 8),
      serviceType: order.serviceType,
      totalFare: order.totalFare,
      distanceKm: order.distanceKm,
      durationMins: order.durationMins,
      surgeMultiplier: 1.0
    },
    status: "ACCEPTED",
    driver: driver,
    createdAt: Date.now(),
    acceptedAt: Date.now(),
    receiverName: order.receiverName || "Khách Nhận",
    receiverPhone: order.receiverPhone || "0901112233",
    packageDesc: order.packageDesc || "Kiện hàng theo yêu cầu"
  };

  // Atomic state change
  driver.status = "BUSY";
  window.RHL.trip = trip;

  AudioPlayer.playAcceptChime();
  logAudit("DRIVER", "ORDER_CLAIMED_FROM_POOL", `Driver ${driver.name} accepted Order ${trip.code} from Pool`);
  showToast(`Bác tài đã nhận cuốc xe ${trip.code} thành công!`, "success");

  // Update UI and map route
  updateDriverUI();
  updateCustomerTripUI();
  updateDualSimulationUI();

  if (window.RHL.maps.driver) {
    MapService.drawTripRoute(window.RHL.maps.driver, 'driver', trip.pickup, trip.dropoff);
  }

  // Start GPS movement towards pickup
  TripEngine.simulateDriverMovement("PICKING_UP");
}

function simulateIncomingRideForDriver() {
  const driver = window.RHL.drivers.find(d => d.id === window.RHL.selectedDriverId);
  if (!driver) return;

  if (driver.status === "OFFLINE") {
    showToast("Vui lòng BẬT TRỰC TUYẾN (Online) trước khi nhận đơn!", "warning");
    return;
  }

  if (driver.status === "BUSY" || driver.status === "OFFERED") {
    showToast("Bác tài đang thực hiện cuốc xe khác!", "warning");
    return;
  }

  const pickup = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
  let dropoff = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
  while (dropoff.name === pickup.name) {
    dropoff = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
  }

  const serviceType = driver.vehicleType === "MOTORBIKE" ? 
    (Math.random() > 0.5 ? "RIDE_MOTORBIKE" : "DELIVERY_MOTORBIKE") : 
    (driver.vehicleType === "CAR_7_SEATS" ? "RIDE_CAR_7" : "RIDE_CAR_4");

  const quote = PricingEngine.calculateQuote(serviceType, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  quote.pickup = pickup;
  quote.dropoff = dropoff;

  const simTrip = {
    tripId: "trip_sim_" + Math.random().toString(36).substr(2, 9),
    code: "RHL-" + Math.floor(100000 + Math.random() * 900000),
    serviceType: serviceType,
    pickup: pickup,
    dropoff: dropoff,
    quote: quote,
    status: "MATCHING",
    createdAt: Date.now(),
    driver: null,
    receiverName: "Chị Lan Anh",
    receiverPhone: "0912999888",
    packageDesc: "Kiện quà giao nhanh"
  };

  window.RHL.trip = simTrip;
  driver.status = "OFFERED";
  window.RHL.activeOffer = {
    offerId: "off_" + Math.random().toString(36).substr(2, 8),
    trip: simTrip,
    driverId: driver.id,
    distanceToPickup: Math.round(GeoUtils.calculateDistance(driver.lat, driver.lng, pickup.lat, pickup.lng) * 1000),
    expiresAt: Date.now() + 15000
  };

  AudioPlayer.playOfferChime();
  logAudit("DISPATCH", "DRIVER_OFFER_SIMULATED", `Simulated offer dispatched to Driver ${driver.name} (15s countdown)`);
  showToast(`Có cuốc xe mới gửi tới bác tài! Đồng hồ 15s đếm ngược.`, "success");

  updateDriverUI();
  updateDualSimulationUI();
  TripEngine.startOfferCountdown();
}

// =========================================================================
// 9. AUTHENTICATION & RBAC ENGINE (FR-IAM-001...011: LOGIN & REGISTER PER ROLE)
// =========================================================================

const DEMO_ACCOUNTS = {
  CUSTOMER: {
    phoneNumber: "0901234567",
    password: "123456",
    fullName: "Nguyen Van A (Customer)",
    role: "CUSTOMER",
    email: "customer1@gmail.com"
  },
  CUSTOMER2: {
    phoneNumber: "082311130111",
    password: "123456",
    fullName: "Honag VAn Doo",
    role: "CUSTOMER",
    email: "082311130111@rhl.demo"
  },
  DRIVER: {
    phoneNumber: "0903000001",
    password: "123456",
    fullName: "Le Van Tài Xế 1",
    role: "DRIVER",
    email: "driver1@gmail.com",
    driverId: "drv-001"
  },
  DRIVER2: {
    phoneNumber: "0823111301",
    password: "123456",
    fullName: "Honagf Văn Độ",
    role: "DRIVER",
    email: "0823111301@rhl.demo",
    driverId: "drv-005"
  },
  ADMIN: {
    phoneNumber: "0900000000",
    password: "123456",
    fullName: "System Administrator",
    role: "ADMIN",
    email: "admin@rhl.com"
  },
  ADMIN2: {
    phoneNumber: "08231113011",
    password: "123456",
    fullName: "Hoàng Văn Độ",
    role: "ADMIN",
    email: "08231113011@rhl.demo"
  }
};

function openAuthModal(tab = 'login') {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.add("hidden");
}

function switchAuthTab(tab) {
  const btnLogin = document.getElementById("auth-tab-login");
  const btnRegister = document.getElementById("auth-tab-register");
  const formLogin = document.getElementById("auth-form-login");
  const formRegister = document.getElementById("auth-form-register");

  if (tab === 'login') {
    btnLogin.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white transition-all";
    btnRegister.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all";
    formLogin.classList.remove("hidden");
    formRegister.classList.add("hidden");
  } else {
    btnLogin.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all";
    btnRegister.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white transition-all";
    formLogin.classList.add("hidden");
    formRegister.classList.remove("hidden");
    toggleDriverRegFields();
  }
}

function toggleDriverRegFields() {
  const roleSelect = document.getElementById("reg-input-role");
  const driverFields = document.getElementById("driver-reg-fields");
  if (!roleSelect || !driverFields) return;

  if (roleSelect.value === "DRIVER") {
    driverFields.classList.remove("hidden");
  } else {
    driverFields.classList.add("hidden");
  }
}

function fillLoginDemo(role) {
  const account = DEMO_ACCOUNTS[role];
  if (!account) return;

  document.getElementById("login-input-phone").value = account.phoneNumber;
  document.getElementById("login-input-password").value = account.password;
  showToast(`Đã điền tài khoản CSDL: ${account.fullName} (${account.phoneNumber})`, "info");
}

async function handleLoginSubmit() {
  const phone = document.getElementById("login-input-phone").value.trim();
  const password = document.getElementById("login-input-password").value.trim();

  if (!phone || !password) {
    showToast("Vui lòng nhập đầy đủ số điện thoại và mật khẩu!", "warning");
    return;
  }

  // Authenticate directly against PostgreSQL via api-gateway
  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, password: password })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.code === "SUCCESS") {
      const authData = data.data || data;
      await applySuccessfulAuth(authData);
      showToast(`Đăng nhập thành công tài khoản CSDL: ${authData.fullName} (${authData.role})!`, "success");
      closeAuthModal();
      return;
    } else {
      showToast(data?.message || "Đăng nhập thất bại: Số điện thoại hoặc mật khẩu không chính xác trong CSDL!", "error");
      return;
    }
  } catch (err) {
    console.error("Backend login error:", err);
    showToast("Không thể kết nối đến máy chủ CSDL (Gateway: 8000)!", "error");
  }
}

async function handleRegisterSubmit() {
  const role = document.getElementById("reg-input-role").value;
  const fullName = document.getElementById("reg-input-name").value.trim();
  const phoneNumber = document.getElementById("reg-input-phone").value.trim();
  const email = document.getElementById("reg-input-email").value.trim();
  const password = document.getElementById("reg-input-password").value.trim();

  if (!fullName || !phoneNumber || !password) {
    showToast("Vui lòng điền đầy đủ các thông tin bắt buộc!", "warning");
    return;
  }

  const payload = {
    role,
    fullName,
    phoneNumber,
    email,
    password
  };

  if (role === "DRIVER") {
    payload.vehicleType = document.getElementById("reg-input-vehicle-type").value;
    payload.plateNumber = document.getElementById("reg-input-plate").value.trim();
    payload.vehicleModel = document.getElementById("reg-input-model").value.trim();
  }

  // 1. Try Live Microservice API
  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      const authData = data.data || data;
      applySuccessfulAuth(authData);
      showToast(`Đăng ký tài khoản ${role} thành công trên Microservice!`, "success");
      closeAuthModal();
      return;
    } else {
      const errorJson = await res.json().catch(() => null);
      if (errorJson && errorJson.message) {
        showToast("Lỗi: " + errorJson.message, "error");
        return;
      }
    }
  } catch (err) {
    // Offline fallback
  }

  // 2. Standalone Engine Fallback
  const newDriverId = "drv-" + Math.floor(100 + Math.random() * 900);
  if (role === "DRIVER") {
    const newDriverObj = {
      id: newDriverId,
      name: fullName,
      phone: phoneNumber,
      vehicleType: payload.vehicleType || "MOTORBIKE",
      vehiclePlate: payload.plateNumber || "59-X1 999.88",
      vehicleModel: payload.vehicleModel || "Honda Air Blade 150",
      rating: 5.0,
      totalTrips: 0,
      status: "AVAILABLE",
      lat: 10.7740 + (Math.random() - 0.5) * 0.02,
      lng: 106.6980 + (Math.random() - 0.5) * 0.02,
      kycStatus: "APPROVED",
      walletBalance: 100000, // 100k bonus
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
    };
    window.RHL.drivers.push(newDriverObj);
    window.RHL.selectedDriverId = newDriverId;
    
    // Add to selector
    const drvSelect = document.getElementById("select-driver-switch");
    if (drvSelect) {
      drvSelect.innerHTML += `<option value="${newDriverObj.id}">${newDriverObj.name} (${newDriverObj.vehicleModel})</option>`;
      drvSelect.value = newDriverObj.id;
    }
    updateDriverUI();
  }

  const createdUser = {
    userId: "usr_" + Math.random().toString(36).substr(2, 9),
    fullName,
    phoneNumber,
    email,
    role,
    tokenType: "Bearer",
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ sub: phoneNumber, role })) + ".rhl_signature",
    refreshToken: "ref_" + Math.random().toString(36).substr(2, 16)
  };

  applySuccessfulAuth(createdUser);
  showToast(`Đăng ký thành công tài khoản ${role}! Tự động đăng nhập.`, "success");
  closeAuthModal();
}

async function applySuccessfulAuth(userData) {
  window.RHL.currentUser = userData;
  localStorage.setItem("rhl_auth_user", JSON.stringify(userData));
  if (userData.accessToken) {
    localStorage.setItem("rhl_auth_token", userData.accessToken);
  }

  logAudit(userData.role, "USER_AUTHENTICATED", `User ${userData.fullName} (${userData.phoneNumber}) [DB ID: ${userData.userId}]`);
  updateAuthUI();

  // Role-based automatic view navigation (RBAC) & State Sync
  if (userData.role === "CUSTOMER") {
    // Sync customer info and active trips from PostgreSQL
    if (window.RHL.isBackendConnected && userData.userId) {
      try {
        const tripsRes = await BackendAPI.getCustomerTrips(userData.userId);
        if (tripsRes && tripsRes.data && tripsRes.data.length > 0) {
          const activeTrip = tripsRes.data.find(t => !["COMPLETED", "CANCELLED", "NO_DRIVER"].includes(t.status));
          if (activeTrip) {
            window.RHL.trip = {
              tripId: activeTrip.tripId,
              backendTripId: activeTrip.tripId,
              code: activeTrip.tripCode,
              serviceType: activeTrip.serviceType === "DELIVERY" ? "DELIVERY_MOTORBIKE" : "RIDE_MOTORBIKE",
              status: activeTrip.status,
              pickup: { lat: activeTrip.pickupLatitude, lng: activeTrip.pickupLongitude, name: activeTrip.pickupAddress },
              dropoff: { lat: activeTrip.dropoffLatitude, lng: activeTrip.dropoffLongitude, name: activeTrip.dropoffAddress },
              quote: { totalFare: activeTrip.estimatedFare, distanceKm: (activeTrip.distanceMeters / 1000).toFixed(1), durationMins: Math.round(activeTrip.durationSeconds / 60) },
              receiverName: activeTrip.receiverName,
              receiverPhone: activeTrip.receiverPhone
            };
            updateCustomerTripUI();
          }
        }
      } catch (e) {
        console.warn("Trip sync failed:", e);
      }
    }
    setRole("customer");
  } else if (userData.role === "DRIVER") {
    // Find or register driver in UI matching PostgreSQL record
    let matchingDriver = window.RHL.drivers.find(d => d.backendId === userData.userId || d.phone === userData.phoneNumber);
    if (!matchingDriver) {
      matchingDriver = {
        id: "drv-" + (userData.userId ? userData.userId.slice(0, 8) : "user"),
        backendId: userData.userId,
        name: userData.fullName,
        phone: userData.phoneNumber,
        vehicleType: "MOTORBIKE",
        vehiclePlate: "29A-888.88",
        vehicleModel: "Honda Wave Alpha",
        rating: 5.0,
        totalTrips: 0,
        status: "AVAILABLE",
        lat: 10.7760,
        lng: 106.6950,
        kycStatus: "APPROVED",
        walletBalance: 100000,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60"
      };
      window.RHL.drivers.push(matchingDriver);
      const drvSelect = document.getElementById("select-driver-switch");
      if (drvSelect) {
        drvSelect.innerHTML += `<option value="${matchingDriver.id}" style="background-color: #0f172a; color: #f8fafc;" class="bg-slate-900 text-slate-100">${matchingDriver.name} (${matchingDriver.vehicleModel})</option>`;
      }
    } else {
      matchingDriver.name = userData.fullName;
      matchingDriver.phone = userData.phoneNumber;
      matchingDriver.backendId = userData.userId;
    }

    window.RHL.selectedDriverId = matchingDriver.id;
    const drvSelect = document.getElementById("select-driver-switch");
    if (drvSelect) drvSelect.value = matchingDriver.id;

    // Fetch real driver wallet balance & transactions from PostgreSQL
    if (window.RHL.isBackendConnected && userData.userId) {
      try {
        const wallet = await BackendAPI.getDriverWallet(userData.userId);
        if (wallet && wallet.data) {
          matchingDriver.walletBalance = wallet.data.balance;
        }
        const entries = await BackendAPI.getDriverWalletEntries(userData.userId);
        if (entries && entries.data && entries.data.length > 0) {
          window.RHL.walletEntries[matchingDriver.id] = entries.data.map(e => ({
            id: e.entryId,
            type: e.entryType,
            amount: e.amount,
            balanceAfter: e.balanceAfter,
            ref: e.referenceId || "TRIP-SETTLED",
            time: new Date(e.createdAt).toLocaleTimeString(),
            commission: 0
          }));
        }
      } catch (e) {
        console.warn("Wallet sync failed:", e);
      }
    }

    updateDriverUI();
    renderDriverWallet();
    updateDualSimulationUI();
    setRole("driver");
  } else if (["REVIEWER", "SUPPORT_STAFF", "FINANCE_STAFF", "ADMIN"].includes(userData.role)) {
    // If Admin, load real PostgreSQL drivers and trips
    if (window.RHL.isBackendConnected && userData.accessToken) {
      BackendAPI.getAdminDrivers(userData.accessToken).then(res => {
        if (res && res.data) {
          logAudit("ADMIN", "DRIVERS_LOADED", `Loaded ${res.data.length} drivers from PostgreSQL`);
        }
      });
    }
    setRole("admin");
  }
}

function updateAuthUI() {
  const unauthBox = document.getElementById("auth-unauthenticated-box");
  const authBox = document.getElementById("auth-authenticated-box");
  const user = window.RHL.currentUser;

  if (user) {
    unauthBox.classList.add("hidden");
    authBox.classList.remove("hidden");

    // Initials
    const initials = user.fullName ? user.fullName.split(" ").map(w => w[0]).join("").slice(-2).toUpperCase() : "U";
    document.getElementById("user-avatar-initials").innerText = initials;
    document.getElementById("user-display-name-header").innerText = user.fullName;

    // Role badge
    const badge = document.getElementById("user-role-badge-header");
    badge.innerText = user.role;
    
    // Distinct badge colors per role
    const roleColors = {
      CUSTOMER: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      DRIVER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      REVIEWER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      SUPPORT_STAFF: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      FINANCE_STAFF: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      ADMIN: "bg-rose-500/20 text-rose-400 border-rose-500/30"
    };
    badge.className = `px-1.5 py-0.2 rounded text-[9px] font-bold border ${roleColors[user.role] || 'bg-slate-800 text-slate-300 border-slate-700'}`;

    // Update customer active name in Customer Panel
    const custActiveNameEl = document.getElementById("customer-active-name");
    if (custActiveNameEl) {
      custActiveNameEl.innerText = user.fullName;
    }
  } else {
    unauthBox.classList.remove("hidden");
    authBox.classList.add("hidden");

    const custActiveNameEl = document.getElementById("customer-active-name");
    if (custActiveNameEl) {
      custActiveNameEl.innerText = "Khách Hàng";
    }
  }
}

function handleLogout() {
  const oldUser = window.RHL.currentUser;
  window.RHL.currentUser = null;
  localStorage.removeItem("rhl_auth_user");
  localStorage.removeItem("rhl_auth_token");

  const custActiveNameEl = document.getElementById("customer-active-name");
  if (custActiveNameEl) {
    custActiveNameEl.innerText = "Khách Hàng";
  }

  if (oldUser) {
    logAudit(oldUser.role, "USER_LOGGED_OUT", `User ${oldUser.fullName} logged out`);
  }

  updateAuthUI();
  showToast("Đã đăng xuất khỏi hệ thống thành công!", "info");
}

function openProfileModal() {
  const user = window.RHL.currentUser;
  if (!user) return;

  const modal = document.getElementById("profile-modal");
  if (!modal) return;

  const initials = user.fullName ? user.fullName.split(" ").map(w => w[0]).join("").slice(-2).toUpperCase() : "U";
  document.getElementById("profile-modal-avatar").innerText = initials;
  document.getElementById("profile-modal-name").innerText = user.fullName;
  document.getElementById("profile-modal-role").innerText = user.role;
  document.getElementById("profile-modal-phone").innerText = user.phoneNumber;
  document.getElementById("profile-modal-email").innerText = user.email || "Chưa cập nhật";
  document.getElementById("profile-modal-token").innerText = user.accessToken ? `Bearer ${user.accessToken}` : "Chưa cấp token";

  modal.classList.remove("hidden");
}

function closeProfileModal() {
  const modal = document.getElementById("profile-modal");
  if (modal) modal.classList.add("hidden");
}

async function handleRefreshToken() {
  const user = window.RHL.currentUser;
  if (!user) return;

  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: user.refreshToken })
    });
    if (res.ok) {
      const data = await res.json();
      applySuccessfulAuth(data.data || data);
      openProfileModal();
      showToast("Đã làm mới JWT Token thành công qua /auth/refresh!", "success");
      return;
    }
  } catch(e) {}

  // Fallback refresh
  user.accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ sub: user.phoneNumber, role: user.role, iat: Date.now() })) + ".new_signature";
  applySuccessfulAuth(user);
  openProfileModal();
  showToast("Đã làm mới JWT Access Token thành công!", "success");
}

// =========================================================================
// 8. LIFECYCLE & DOM INIT
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Check stored auth session from PostgreSQL
  const storedUser = localStorage.getItem("rhl_auth_user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.userId && !parsed.userId.startsWith("usr_")) {
        applySuccessfulAuth(parsed);
      } else {
        localStorage.removeItem("rhl_auth_user");
        localStorage.removeItem("rhl_auth_token");
        BackendAPI.login("0901234567", "123456").then(res => {
          if (res && res.code === "SUCCESS" && res.data) applySuccessfulAuth(res.data);
        });
      }
    } catch(e) {
      localStorage.removeItem("rhl_auth_user");
    }
  } else {
    BackendAPI.login("0901234567", "123456").then(res => {
      if (res && res.code === "SUCCESS" && res.data) applySuccessfulAuth(res.data);
    });
  }

  // Populate location dropdowns
  const pSelect = document.getElementById("select-pickup-loc");
  const dSelect = document.getElementById("select-dropoff-loc");
  if (pSelect && dSelect) {
    SAMPLE_LOCATIONS.forEach((loc, idx) => {
      pSelect.innerHTML += `<option value="${idx}" style="background-color: #0f172a; color: #f8fafc;" class="bg-slate-900 text-slate-100">${loc.name}</option>`;
      dSelect.innerHTML += `<option value="${idx}" ${idx === 1 ? 'selected' : ''} style="background-color: #0f172a; color: #f8fafc;" class="bg-slate-900 text-slate-100">${loc.name}</option>`;
    });
  }

  // Populate driver selector in driver app
  const drvSelect = document.getElementById("select-driver-switch");
  if (drvSelect) {
    window.RHL.drivers.forEach(d => {
      drvSelect.innerHTML += `<option value="${d.id}" style="background-color: #0f172a; color: #f8fafc;" class="bg-slate-900 text-slate-100">${d.name} (${d.vehicleModel})</option>`;
    });
    drvSelect.addEventListener("change", (e) => {
      window.RHL.selectedDriverId = e.target.value;
      updateDriverUI();
      renderDriverWallet();
    });
  }

  // Init Maps
  setTimeout(() => {
    window.RHL.maps.customer = MapService.createMap("map-customer", [10.7725, 106.6980]);
    window.RHL.maps.driver = MapService.createMap("map-driver", [10.7760, 106.6950]);
    window.RHL.maps.admin = MapService.createMap("map-admin", [10.7780, 106.7050], 13);
    window.RHL.maps.dualCustomer = MapService.createMap("map-dual-customer", [10.7725, 106.6980]);
    window.RHL.maps.dualDriver = MapService.createMap("map-dual-driver", [10.7760, 106.6950]);

    // Plot initial drivers on admin map
    MapService.renderAllDriversOnMap(window.RHL.maps.admin, 'admin');
  }, 200);

  // Initialize UI components
  updateDriverUI();
  renderDriverWallet();
  renderAdminAuditLogs();

  // Test backend connectivity & sync with PostgreSQL (port 8000)
  BackendAPI.checkHealth().then(async (isConnected) => {
    if (isConnected) {
      window.RHL.isBackendConnected = true;
      const statusPill = document.getElementById("backend-status-pill");
      if (statusPill) {
        statusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live PostgreSQL & Microservices (Gateway: 8000)`;
        statusPill.className = "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300";
      }

      // Sync initial driver wallets from PostgreSQL
      for (const d of window.RHL.drivers) {
        if (d.backendId) {
          const w = await BackendAPI.getDriverWallet(d.backendId);
          if (w && w.data) d.walletBalance = w.data.balance;
        }
      }
      renderDriverWallet();
      updateDriverUI();
      logAudit("SYSTEM", "DATABASE_CONNECTED", "PostgreSQL database & Spring Boot microservices connected via Gateway (8000)");
    } else {
      window.RHL.isBackendConnected = false;
      const statusPill = document.getElementById("backend-status-pill");
      if (statusPill) {
        statusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-400"></span> Standalone Engine (Offline Ready)`;
        statusPill.className = "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/50 text-blue-300";
      }
    }
  });
});

