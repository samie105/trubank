export type IDType = "nin" | "bvn" | "passport" | "drivers_license" | undefined;

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
  idType: IDType;
  idNumber: string;
  idDocument?: File;
};

export type FormContextType = {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
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
