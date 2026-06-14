export type CredentialType = 'education' | 'work' | 'certification' | 'project' | 'skill' | 'award'
export type VerificationStatus = 'pending' | 'reviewing' | 'verified' | 'failed'
export type AccessMode = 'free' | 'paid'

export interface Credential {
  id: string
  type: CredentialType
  title: string
  institution: string
  description: string
  startDate: string
  endDate?: string
  current?: boolean
  credentialUrl?: string
  blobId: string
  merkleRoot: string
  verificationStatus: VerificationStatus
  verificationBlobId?: string
  verifiedAt?: number
  verificationReason?: string
  createdAt: number
}

export interface ProfilrProfile {
  id: string
  walletAddress: string
  displayName: string
  title: string
  bio: string
  location?: string
  website?: string
  avatarUrl?: string
  accessMode: AccessMode
  accessFeeUsdc: number
  profileBlobId: string
  totalViews: number
  totalEarnings: number
  credentials: Credential[]
  createdAt: number
  updatedAt: number
}

export interface AccessRecord {
  id: string
  profileId: string
  viewerWallet: string
  paidAt: number
  expiresAt: number
  txHash: string
  amountUsdc: number
  isActive: boolean
}

export interface ShelbyUploadResult {
  blobId: string
  merkleRoot: string
  size: number
  url: string
}

export interface GenLayerVerdict {
  verdict: 'VERIFIED' | 'REVIEWING' | 'FAILED'
  reasoning: string
  validatorCount: number
  timestamp: number
  blobId: string
}
