interface Coordinates {
  lat: number
  lng: number
}

interface GeocodingResult {
  coordinates: Coordinates
  formattedAddress: string
  city?: string
  country?: string
}

export async function geocodeLocation(locationName: string): Promise<GeocodingResult | null> {
  try {
    // Use Nominatim (OpenStreetMap) for free geocoding
    const query = encodeURIComponent(locationName + ', Japan')
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        formattedAddress: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        country: result.address?.country
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data) {
      return {
        coordinates,
        formattedAddress: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country
      }
    }
    
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}