import {
  FareQuote,
  Trip,
  CreateTripRequest,
  DriverOffer,
  DriverProfile,
  PaymentRecord,
  Wallet,
  WalletEntry,
  PricingRule,
  AuditRecord
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export class ApiClient {
  private static token: string | null = localStorage.getItem('rhl_auth_token');

  public static setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('rhl_auth_token', token);
    } else {
      localStorage.removeItem('rhl_auth_token');
    }
  }

  public static getToken(): string | null {
    return this.token;
  }

  private static generateCorrelationId(): string {
    return 'req-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    idempotencyKey?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-Id': this.generateCorrelationId(),
      ...((options.headers as Record<string, string>) || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();
    return (json.data !== undefined ? json.data : json) as T;
  }

  // --- Pricing & Quotes ---
  public static async requestFareQuote(payload: {
    customerId: string;
    serviceType: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
  }): Promise<FareQuote> {
    return this.request<FareQuote>('/pricing/quotes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // --- Trips ---
  public static async createTrip(
    payload: CreateTripRequest,
    idempotencyKey?: string
  ): Promise<Trip> {
    const key = idempotencyKey || 'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    return this.request<Trip>(
      '/trips',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      key
    );
  }

  public static async getTrip(tripId: string): Promise<Trip> {
    return this.request<Trip>(`/trips/${tripId}`);
  }

  public static async updateTripStatus(
    tripId: string,
    status: string,
    actorId: string,
    coords?: { lat: number; lng: number },
    reason?: string,
    deliveryOtp?: string
  ): Promise<Trip> {
    return this.request<Trip>(`/trips/${tripId}/status`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        actorId,
        latitude: coords?.lat,
        longitude: coords?.lng,
        reason,
        deliveryOtp
      })
    });
  }

  public static async cancelTrip(
    tripId: string,
    actorId: string,
    reason: string
  ): Promise<Trip> {
    return this.request<Trip>(`/trips/${tripId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ actorId, reason })
    });
  }

  // --- Driver Offers ---
  public static async getDriverOffers(driverId: string): Promise<DriverOffer[]> {
    return this.request<DriverOffer[]>(`/drivers/${driverId}/offers`);
  }

  public static async acceptOffer(offerId: string, driverId: string): Promise<DriverOffer> {
    return this.request<DriverOffer>(
      `/offers/${offerId}/accept?driverId=${driverId}`,
      { method: 'POST' },
      `accept-${offerId}-${driverId}`
    );
  }

  public static async rejectOffer(offerId: string, driverId: string): Promise<void> {
    return this.request<void>(`/offers/${offerId}/reject?driverId=${driverId}`, {
      method: 'POST'
    });
  }

  // --- Driver Profile & Status ---
  public static async updateDriverStatus(
    driverId: string,
    status: 'AVAILABLE' | 'OFFLINE'
  ): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/drivers/${driverId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  public static async sendTelemetry(
    driverId: string,
    lat: number,
    lng: number,
    speed: number = 25
  ): Promise<void> {
    return this.request<void>(`/drivers/${driverId}/telemetry`, {
      method: 'POST',
      body: JSON.stringify({ latitude: lat, longitude: lng, speedKmh: speed })
    });
  }

  // --- Payment & Wallet ---
  public static async getDriverWallet(driverId: string): Promise<Wallet> {
    return this.request<Wallet>(`/drivers/${driverId}/wallet`);
  }

  public static async getWalletEntries(driverId: string): Promise<WalletEntry[]> {
    return this.request<WalletEntry[]>(`/drivers/${driverId}/wallet/entries`);
  }

  public static async getTripPayment(tripId: string): Promise<PaymentRecord> {
    return this.request<PaymentRecord>(`/payments/trips/${tripId}`);
  }

  // --- Admin ---
  public static async getAdminPendingDrivers(): Promise<DriverProfile[]> {
    return this.request<DriverProfile[]>('/admin/drivers/pending');
  }

  public static async reviewDriverDocument(
    driverId: string,
    status: 'APPROVED' | 'REJECTED',
    notes: string
  ): Promise<DriverProfile> {
    return this.request<DriverProfile>(`/admin/drivers/${driverId}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
  }

  public static async getAdminTrips(status?: string): Promise<Trip[]> {
    const q = status ? `?status=${status}` : '';
    return this.request<Trip[]>(`/admin/trips${q}`);
  }

  public static async getPricingRules(): Promise<PricingRule[]> {
    return this.request<PricingRule[]>('/admin/pricing-rules');
  }
}
