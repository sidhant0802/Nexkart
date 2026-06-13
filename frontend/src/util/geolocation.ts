// src/util/geolocation.ts

export interface UserLocation {
  latitude:  number;
  longitude: number;
  city?:     string;
  state?:    string;
  country?:  string;
  pincode?:  string;
  formattedAddress?: string;
}

/**
 * Get user's current GPS coordinates from browser.
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout:    10000,
      maximumAge: 0,
    });
  });
};

/**
 * Reverse geocode coordinates → address using OpenStreetMap (FREE, no API key)
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<Partial<UserLocation>> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent":      "Nexkart-App",
        },
      }
    );

    if (!res.ok) throw new Error("Reverse geocoding failed");
    const data = await res.json();
    const a = data.address || {};

    return {
      city:     a.city || a.town || a.village || a.county || "",
      state:    a.state || "",
      country:  a.country || "India",
      pincode:  a.postcode || "",
      formattedAddress: data.display_name || "",
    };
  } catch (err) {
    console.error("Reverse geocode error:", err);
    return {};
  }
};

/**
 * One-shot helper: get coords + reverse geocode together
 */
export const captureUserLocation = async (): Promise<UserLocation> => {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;

  const addressData = await reverseGeocode(latitude, longitude);

  return {
    latitude,
    longitude,
    ...addressData,
  };
};