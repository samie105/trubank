export type IDType = "nin" | "bvn" | "passport" | "drivers_license";
export type AccountType = "Savings" | "Current";

export type FormData = {
  firstName: string;
  lastName: string;
  dob: Date | string;
  gender?: "Male" | "Female";
  email: string;
  phone: string;
  country: string;
  state: string;
  address: string;
  idType?: IDType;
  idNumber?: string;
  idDocument?: File | string | null;
  idType2?: IDType;
  idNumber2?: string;
  idDocument2?: File | string | null;
  proofOfAddress?: File | string | null;
  profileImage?: File | string | null;
  branch?: string;
  accountOfficer?: string;
  desiredAccount?: AccountType;
};

export type FormContextType = {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
};
export type BusinessFormData = {
  businessName: string;
  businessType: string;
  industrySector: string;
  businessAddress: string;
  email: string;
  phoneNumber: string;
  rcNumber: string;
  cacDocument: File | string | null;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPhoneNumber: string;
  ownerEmail: string;
  ownerTitle: string;
  branch: string;
  desiredAccount: AccountType;
  accountOfficer: string;
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
