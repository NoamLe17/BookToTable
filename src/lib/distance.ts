'use server';

/**
 * Calculates the driving distance between two addresses using Google Maps Distance Matrix API.
 * 
 * @param origin The starting address (e.g., Author's pickup address)
 * @param destination The destination address (e.g., Buyer's shipping address)
 * @returns The distance in kilometers, or null if calculation failed.
 */
export async function calculateDistance(origin: string, destination: string): Promise<number | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn("Google Maps API key is missing. Cannot calculate distance.");
    // In a real scenario without an API key, we might return 0 to bypass the extra fee, 
    // or return a mock value for testing. We'll return 0 to avoid charging extra if API key is missing.
    return 0; 
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const distanceMeters = data.rows[0].elements[0].distance.value;
      return distanceMeters / 1000; // Return distance in kilometers
    } else {
      console.error("Distance Matrix API error:", data);
      return null;
    }
  } catch (error) {
    console.error("Failed to calculate distance:", error);
    return null;
  }
}
