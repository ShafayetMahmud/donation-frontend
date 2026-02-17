export enum ApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export interface DonorDto {
  id: number;
  fullName: string;
  phone?: string;
  email?: string;
  isAnonymous: boolean;
}

export interface CashDonationResponse {
  id: string;
  campaignId: string;

  amount: number;
  currency: string;
  notes?: string;

  donationDate: string;
  createdAt: string;

  approvalStatus: ApprovalStatus;
  approvalStatusUpdatedAt?: string;

  receiptNumber?: string;

  donor: DonorDto;
}

export interface CreateCashDonationDto {
  campaignId: string;

  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  isAnonymous: boolean;

  amount: number;
  currency: string;
  notes?: string;
}

export interface UpdateCashDonationDto {
  amount?: number;
  currency?: string;
  notes?: string;
  approvalStatus?: ApprovalStatus;
  receiptNumber?: string;
}
