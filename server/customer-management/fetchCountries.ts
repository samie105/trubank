'use server';

// Country interfaces
export interface Country {
  id: string;
  name: string;
  countryCode: string;
}

interface CountryResponse {
  isSuccess: boolean;
  result: Country[];
  message: string;
  error: string;
  statCode: number;
}

/**
 * Fetches all countries from the API
 * @returns A Promise resolving to an array of Country objects
 */
export async function fetchCountries(): Promise<Country[]> {
  try {
    const baseUrl = process.env.API_URL || '';
    const response = await fetch(`${baseUrl}/usermanagement/general/get-all-countries`, {
      // Adding next.js specific cache options
      cache: 'no-store', // Don't cache this request
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    const data: CountryResponse = await response.json();

    if (data.isSuccess && Array.isArray(data.result)) {
      return data.result;
    } else {
      throw new Error(data.error || 'Invalid response format');
    }
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    return []; // Return empty array in case of error
  }
}
