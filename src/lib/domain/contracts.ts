export type RecordStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "ARCHIVED";

export type CampaignStatus =
  | "DRAFT"
  | "PLANNED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type ProductionBatchStatus =
  | "PLANNED"
  | "PRINTING"
  | "READY"
  | "DELIVERED"
  | "ACTIVE"
  | "PAUSED"
  | "EXHAUSTED"
  | "CLOSED";

export type ScanSessionStatus =
  | "STARTED"
  | "ENGAGED"
  | "GAME_COMPLETED"
  | "CLAIM_STARTED"
  | "CLAIM_COMPLETED"
  | "ABANDONED";

export type ClaimStatus =
  | "STARTED"
  | "PHONE_SUBMITTED"
  | "OTP_SENT"
  | "VERIFIED"
  | "VOUCHER_ISSUED"
  | "FAILED";

export type VoucherStatus =
  | "ISSUED"
  | "ACTIVE"
  | "REDEEMED"
  | "EXPIRED"
  | "CANCELLED";

export type ProfileContract = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationContract = {
  id: string;
  name: string;
  slug: string;
  organizationType: "KULTUR" | "ADVERTISER" | "VENUE_ORGANIZER";
  status: RecordStatus;
};

export type EventContract = {
  id: string;
  organizerOrganizationId: string;
  name: string;
  slug: string;
  eventType: "GANESH_PUJA";
  startsAt: string;
  endsAt: string;
  status: RecordStatus;
};

export type VenueContract = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  geoRadiusMeters: number | null;
};

export type CampaignContract = {
  id: string;
  kulturOrganizationId: string;
  advertiserOrganizationId: string;
  name: string;
  slug: string;
  status: CampaignStatus;
  startsAt: string;
  endsAt: string;
};

export type CampaignActivationContract = {
  id: string;
  campaignId: string;
  eventId: string;
  eventVenueId: string;
  status: RecordStatus;
  startsAt: string;
  endsAt: string;
};

export type ProductionBatchContract = {
  id: string;
  campaignActivationId: string;
  batchCode: string;
  quantity: number;
  status: ProductionBatchStatus;
  createdAt: string;
};

export type ScanSessionContract = {
  id: string;
  productionBatchId: string;
  campaignActivationId: string;
  status: ScanSessionStatus;
  startedAt: string;
  lastSeenAt: string;
  completedAt: string | null;
};

export type ClaimContract = {
  id: string;
  campaignId: string;
  productionBatchId: string;
  scanSessionId: string;
  phoneE164: string;
  phoneHash: string;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  status: ClaimStatus;
  createdAt: string;
};

export type VoucherContract = {
  id: string;
  campaignId: string;
  claimId: string;
  leadId: string | null;
  voucherCode: string;
  status: VoucherStatus;
  issuedAt: string;
  expiresAt: string | null;
  redeemedAt: string | null;
};
