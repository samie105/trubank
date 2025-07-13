export type IDType = 
  | "Driver_Licence"
  | "International_Passport"
  | "Voters_Card"
  | "NationalIdentityCard"
  | "BVN"
  | "Nin";

export type DocumentType = 
  | "DriverLicense"
  | "InternationalPassport"
  | "VotersCard"
  | "NationalIdentityCard"
  | "BVN"
  | "Cac"
  | "BusinessIncorporationCertificate"
  | "MemorandumArticlesAssociation"
  | "BusinessLicense"
  | "ProfilePicture"
  | "UtilityBill"
  | "WaterBill"
  | "GuarantorIdentity"
  | "EmploymentProof"
  | "BankStatement"
  | "LeaseAgreement";

export type ProofOfAddressType = "Utility_Bill" | "Water_Bill";

export type CustomerType = "Individual" | "Business" | "Admin";

export type AccountType = "Savings" | "Current";

export type FormData = {
  firstName?: string;
  lastName?: string;
  dob?: Date | string;
  gender?: string;
  email?: string;
  phone?: string;
  country?: string;
  countryName?: string;
  maritalStatus?: string;
  alternatePhone?: string;
  employmentStatus?: string;
  tin?: string;
  address?: string;
  idType?: IDType;
  idNumber?: string;
  IdFile?: File | string | null;
  expiryDate?: Date | string;
  issuingAuthority?: string;
  issuingAuthorityPOA?: string;
  proofOfAddress?: File | string | null;
  dateOfIssue?: Date | string;
  addressProofType?: ProofOfAddressType;
  profileImage?: File | string | null;
  branch?: string;
  accountOfficer?: string | null;
  productId?: string;
  productType?: string;
  desiredAccount?: string;
  // Display names for UI purposes
  branchName?: string;
  accountOfficerName?: string;
  productTypeName?: string;
  employerAddress?: string;
  jobTitle?: string;
  startDate?: Date | string;
  currentEmployerName?: string;
  endDate?: Date | string;
  employmentDocument?: File | string | null;
  guarantorFullName?: string;
  guarantorRelationship?: string;
  guarantorPhone?: string;
  guarantorEmail?: string;
  guarantorAddress?: string;
  guarantorId?: File | string | null;
  nextOfKinFullName?: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;
  nextOfKinAddress?: string;
  nextOfKinRelationship?: string;
  customerType?: CustomerType;
  requireSmsAlert?: boolean;
  requireEmailAlert?: boolean;
  customerId?: string;
};

export interface CustomerApiResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  emailAddress?: string;
  phoneNumber?: string;
  nationality?: string;
  maritalStatus?: string;
  alternatePhoneNumber?: string;
  employmentStatus?: string;
  taxIdenttfictionNumber?: string;
  residentialAddress?: string;
  idType?: string;
  idNumber?: string;
  idExpiryDate?: string;
  idIssuingAuthority?: string;
  proofOfAddressType?: string;
  proofOfAddressIssuingAuthority?: string;
  proofOfAddressDateIssue?: string;
  branchId?: string;
  accountOfficerId?: string;
  desiredAccount?: string;
  meansOfIdentification?: {
    meansOfIdentificationFile?: string;
    meansOfIdentificationFileType?: string;
    meansOfIdentificationFileName?: string;
  };
  proofOfAddress?: {
    proofOfAddressFile?: string;
    proofOfAddressType?: string;
    proofOfAddressFileName?: string;
  };
  profilePicture?: {
    profilePicture?: string;
    profilePictureType?: string;
    profilePictureName?: string;
  };
  branch?: {
    id?: string;
    name?: string;
  };
  accountOfficer?: {
    id?: string;
    fullName?: string;
  };
  employmentDetails?: {
    currentEmployerName?: string;
    employerAddress?: string;
    jobTitle?: string;
    employementStateDate?: string;
    employementEndDate?: string;
    employmentVerificationDocument?: string;
  };
  guarantorDetails?: {
    guarantorFullName?: string;
    guarantorRelationshipToCustomer?: string;
    guarantorPhoneNumber?: string;
    guarantorEmailAddress?: string;
    guarantorAddress?: string;
    guarantorFileDocument?: string;
  };
  nextOfKinDetails?: {
    nextOfKinFullName?: string;
    nextOfKinRelationshipToCustomer?: string;
    nextOfKinPhoneNumber?: string;
    nextOfKinEmailAddress?: string;
    nextOfKinAddress?: string;
  };
  [key: string]: string | number | boolean | object | undefined;
}

export type FormContextType = {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  loadEditData: (customerId: string, data: CustomerApiResponse) => void;
};

export type BusinessFormData = {
  businessName: string;
  registrationNumber: string;
  tin: string;
  natureOfBusiness: string;
  businessType: string;
  businessAddress: string;
  phoneNumber: string;
  email: string;
  website: string;
  branch?: string;
  branchId?: string;
  accountOfficer?: string | null;
  accountOfficerId?: string | null;
  businessIncorporationCertificate: File | string | null;
  memorandumArticles: File | string | null;
  businessLicense: File | string | null;
  utilityBillType: string;
  utilityBillIssuer: string;
  issueDateOfBill: Date | string;
  utilityBill: File | string | null;
  desiredAccount?: string;
  type?: number;
  customerId?: string;
  businessId?: string;
  // Display names for UI purposes
  branchName?: string;
  accountOfficerName?: string;
  desiredAccountName?: string;
};

export interface BusinessApiResponse {
  id?: string;
  busienssName?: string;
  busienssType?: string;
  businessAddress?: string;
  emailAddress?: string;
  phoneNumber?: string;
  registrationNumber?: string;
  website?: string;
  taxIdentificationNumber?: string;
  natureOfBusiness?: string;
  branchId?: string;
  accountOfficerId?: string;
  desiredAccount?: string;
  branch?: {
    id?: string;
    name?: string;
  };
  accountOfficer?: {
    id?: string;
    fullName?: string;
  };
  businessIncorporationDocument?: {
    theFile?: string;
    fileType?: number;
  };
  memorandumOfAssociationDocument?: {
    theFile?: string;
    fileType?: number;
  };
  businessLicenseDocument?: {
    theFile?: string;
    fileType?: number;
  };
  proofOfAddress?: {
    utilityFile?: string;
    utilityType?: number;
    utilityIssuer?: string;
    utilityDateIssuer?: string;
  };
  [key: string]: string | number | boolean | object | undefined;
}

export type BusinessFormContextType = {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
  loadEditData: (businessId: string, data: BusinessApiResponse) => void;
};

export type Country = {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  native: string;
  region: string;
  subregion: string;
  emoji: string;
  emojiU: string;
  tld: string;
  latitude: string;
  longitude: string;
};

export type State = {
  id: number;
  name: string;
  state_code: string;
  latitude: string;
  longitude: string;
};
