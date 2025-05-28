import { z } from "zod"

// Types and schemas for API requests
export const customerTypeEnum = z.enum(["Individual", "Business", "Admin"])
export type CustomerType = z.infer<typeof customerTypeEnum>

// Types for status and KYC status
export type KycStatusType = "Pending" | "Under Review" | "Approved" | "Rejected" | "Unknown"
export type StatusType = "active" | "inactive"

// Define the schema for pagination and search parameters
export const fetchCustomersSchema = z.object({
  pageSize: z.number().default(10),
  pageNumber: z.number().default(0),
  searchParams: z.record(z.string()).optional(),
  customerType: customerTypeEnum,
})

export type FetchCustomersInput = z.infer<typeof fetchCustomersSchema>

// Base types for shared component structures
export interface UserReference {
  id: string
  fullName: string
}

export interface AccountTierInfo {
  id: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
}

export interface BranchInfo {
  id: string
  name: string
}

// Define types for the API responses
export interface IndividualCustomerAPI {
  id: string
  firstName: string
  middleName: string
  lastName: string
  fullName: string
  gender: string
  customerId: string
  requireSmsAlert?: boolean
  requireEmailAlert?: boolean
  dateOfBirth: string
  maritalStatus: string
  nationality: string
  residentialAddress: string
  emailAddress: string
  passwordHash: string
  phoneNumber: string
  alternatePhoneNumber: string
  employmentStatus: string
  taxIdentificationNumber?: string
  taxIdenttfictionNumber?: string // Handle API typo
  branchId: string
  accountOfficerId: string
  idType: string
  idNumber: string
  idIssuingAuthority: string
  proofOfAddressType: string
  meansOfIdentification: {
    meansOfIdentificationFile: string
    meansOfIdentificationFileType: string
    meansOfIdentificationFileName: string
  }
  idExpiryDate: string
  proofOfAddress: {
    proofOfAddressFile: string
    proofOfAddressType: string
    proofOfAddressFileName: string
  }
  proofOfAddressIssuingAuthority: string
  proofOfAddressDateIssue: string
  profilePicture: {
    profilePicture: string
    profilePictureType: string
    profilePictureName: string
  }
  employmentDetailsId: string
  guarantorDetailsId: string
  nextOfKinDetailsId: string
  desiredAccount: string
  type: number
  kycStatus: number
  status: number
  lastLogin: string
  lastModified: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  employmentDetails?: {
    id: string
    appUserId: string
    currentEmployerName: string
    employerAddress: string
    jobTitle: string
    employementStateDate: string
    employementEndDate: string
    employmentVerificationDocument: string
    employmentVerificationDocumentName: string
    employmentVerificationDocumentType: string
  }
  guarantorDetails?: {
    id: string
    appUserId: string
    guarantorFullName: string
    guarantorRelationshipToCustomer: string
    guarantorPhoneNumber: string
    guarantorEmailAddress: string
    guarantorAddress: string
    guarantorFileDocument: string
    guarantorDocumentName: string
    guarantorDocumentType: string
  }
  nextOfKinDetails?: {
    id: string
    appUserId: string
    nextOfKinFullName: string
    nextOfKinRelationshipToCustomer: string
    nextOfKinPhoneNumber: string
    nextOfKinEmailAddress: string
    nextOfKinAddress: string
  }
  accountTier?: AccountTierInfo
  accountOfficer?: UserReference
  branch?: BranchInfo
}

// Update the BusinessCustomer interface to match the actual API response
export interface BusinessCustomerAPI {
  id: string
  busienssName: string // Spelling as in API response (typo)
  businessName?: string // Alternative name if both exist
  registrationNumber: string
  taxIdentificationNumber: string
  natureOfBusiness: string
  busienssType: string // Spelling as in API response (typo)
  businessType?: string // Alternative name if both exist
  businessAddress: string
  phoneNumber: string
  emailAddress: string
  website: string
  customerId: string
  passwordHash: string
  accountTierId: string
  accountOfficerId: string
  branchId: string
  incorporationCertificate: {
    incorporationCertificateFile: string
    incorporationCertificateType: string
    incorporationCertificateFileName: string
  }
  memorandumAssociation: {
    memorandumAssociationFile: string
    memorandumAssociationType: string
    memorandumAssociationFileName: string
  }
  businessLicence: {
    businessLicenceFile: string
    businessLicenceType: string
    businessLicenceFileName: string
  }
  utilityType: string
  utilityIssuer: string
  utilityDateIssuer: string
  utility: {
    utilityFile: string
    utilityFileType: string
    utilityFileName: string
  }
  productType: string
  retries: number
  type: number
  kycStatus: number
  lastLogin: string
  lastModified: string
  dateDeleted: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  status: number
  operationBy: string
  accountTier?: AccountTierInfo
  accountOfficer?: UserReference
  branch?: BranchInfo
}

// Standardized customer table data format - shared between server and client
export interface CustomerTableData {
  id: string
  fullId: string
  customerId?: string
  firstName?: string
  lastName?: string
  businessName?: string
  email: string
  phone: string
  status: StatusType
  date: string
  avatar: string
  type: CustomerType
  tierLevel: string
  kycStatus: KycStatusType
  // Store the complete original data for reference
  originalData: IndividualCustomerAPI | BusinessCustomerAPI
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  pagination?: {
    totalCount: number
    totalPages: number
  }
  error?: string
  statusCode?: number
}

// Type for API response structure
export interface ApiResponseStructure<T> {
  isSuccess: boolean
  result?: {
    data: T[]
    totalCount: number
    totalPages: number
    isSuccessful: boolean
    responseMessage: string
    responseCode: string
  }
  message?: string
  error?: string
  statCode?: number
} 