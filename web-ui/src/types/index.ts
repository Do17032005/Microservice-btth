/**
 * SRS-RHL-002 v1.0 / v2.0 - Domain Models & Contracts
 */

export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_DRIVER' | 'ROLE_ADMIN' | 'ROLE_STAFF';

export type ServiceType = 'RIDE_MOTORBIKE' | 'RIDE_CAR_4' | 'RIDE_CAR_7' | 'DELIVERY_MOTORBIKE';

export type TripStatus =
  | 'CREATED'
  | 'MATCHING'
  | 'ACCEPTED'
  | 'PICKING_UP'
  | 'ARRIVED'
  | 'IN_TRIP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_DRIVER';

export type DriverAvailabilityStatus = 'OFFLINE' | 'AVAILABLE' | 'OFFERED' | 'BUSY';

export type DriverReviewStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type OfferStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'E_WALLET_SANDBOX' | 'CASH' | 'CREDIT_CARD';

export type WalletEntryType = 'TRIP_EARNING' | 'PLATFORM_FEE' | 'WITHDRAWAL' | 'DEPOSIT' | 'PENALTY';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface DriverVehicle {
  id: string;
  driverId: string;
  vehicleType: ServiceType;
  brand: string;
  model: string;
  color: string;
  plateNumber: string;
  isActive: boolean;
}

export interface DriverDocument {
  id: string;
  driverId: string;
  documentType: 'CITIZEN_ID' | 'DRIVER_LICENSE' | 'VEHICLE_REGISTRATION';
  documentNumber: string;
  fileUrl: string;
  status: DriverReviewStatus;
  rejectionReason?: string;
  verifiedAt?: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  reviewStatus: DriverReviewStatus;
  availabilityStatus: DriverAvailabilityStatus;
  rating: number;
  totalTrips: number;
  activeVehicle?: DriverVehicle;
  documents?: DriverDocument[];
  currentLocation?: LocationPoint;
  lastTelemetryAt?: string;
  version: number;
}

export interface FareQuote {
  id: string;
  customerId: string;
  serviceType: ServiceType;
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  surgeFactor: number;
  totalFare: number;
  expiresAt: string; // ISO-8601, 300s TTL
  isUsed: boolean;
}

export interface CreateTripRequest {
  quoteId: string;
  paymentMethod: PaymentMethod;
  recipientName?: string;
  recipientPhone?: string;
  packageDescription?: string;
  weightKg?: number;
}

export interface Trip {
  id: string;
  tripCode: string;
  customerId: string;
  driverId?: string;
  serviceType: ServiceType;
  status: TripStatus;
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  estimatedFare: number;
  finalFare?: number;
  cancellationFee?: number;
  cancellationReason?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  driverLocation?: LocationPoint;
  etaMinutes?: number;
  deliveryOtp?: string;
  deliveryProofPhoto?: string;
  createdAt: string;
  completedAt?: string;
  version: number;
}

export interface DriverOffer {
  id: string;
  tripId: string;
  driverId: string;
  serviceType: ServiceType;
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  distanceToPickupKm: number;
  estimatedEarnings: number;
  totalTripFare: number;
  status: OfferStatus;
  expiresAt: string; // ISO-8601, 15s TTL
  remainingSeconds?: number;
}

export interface PaymentRecord {
  id: string;
  tripId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  transactionRef?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  driverId: string;
  balance: number;
  holdBalance: number;
  availableBalance: number;
  version: number;
}

export interface WalletEntry {
  id: string;
  walletId: string;
  entryType: WalletEntryType;
  amount: number;
  balanceAfter: number;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  region: string;
  serviceType: ServiceType;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minFare: number;
  cancellationFee: number;
  surgeFloor: number;
  surgeCeiling: number;
  active: boolean;
}

export interface AuditRecord {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  delta: string;
  correlationId: string;
  timestamp: string;
}

export interface WebSocketEnvelope<T> {
  eventType:
    | 'DRIVER_LOCATION_UPDATED'
    | 'DRIVER_OFFER_CREATED'
    | 'TRIP_STATUS_CHANGED'
    | 'CHAT_MESSAGE_SENT'
    | 'PAYMENT_SETTLED';
  sequence: number;
  timestamp: string;
  correlationId: string;
  payload: T;
}
