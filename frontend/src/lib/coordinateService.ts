import { Coordinates } from '@/types/quantum'

// Famous locations and their coordinates
const LOCATION_COORDINATES: Record<string, Coordinates> = {
  // France
  'パリ': { lat: 48.8566, lng: 2.3522 },
  'パリの石畳通り': { lat: 48.8566, lng: 2.3522 },
  'エッフェル塔': { lat: 48.8584, lng: 2.2945 },
  'シャンゼリゼ': { lat: 48.8698, lng: 2.3076 },
  'モンマルトル': { lat: 48.8867, lng: 2.3431 },
  'セーヌ川': { lat: 48.8566, lng: 2.3522 },
  
  // Japan
  '東京': { lat: 35.6762, lng: 139.6503 },
  '湘南': { lat: 35.3362, lng: 139.4778 },
  '江ノ島': { lat: 35.2975, lng: 139.4814 },
  '熱海': { lat: 35.0955, lng: 139.0732 },
  '逗子': { lat: 35.2952, lng: 139.5803 },
  '鎌倉': { lat: 35.3191, lng: 139.5462 },
  '京都': { lat: 35.0116, lng: 135.7681 },
  '大阪': { lat: 34.6937, lng: 135.5023 },
  '富士山': { lat: 35.3606, lng: 138.7274 },
  
  // Italy
  'ローマ': { lat: 41.9028, lng: 12.4964 },
  'ヴェネツィア': { lat: 45.4408, lng: 12.3155 },
  'フィレンツェ': { lat: 43.7696, lng: 11.2558 },
  
  // UK
  'ロンドン': { lat: 51.5074, lng: -0.1278 },
  
  // USA
  'ニューヨーク': { lat: 40.7128, lng: -74.0060 },
  
  // Germany
  'ベルリン': { lat: 52.5200, lng: 13.4050 },
  
  // Spain
  'バルセロナ': { lat: 41.3851, lng: 2.1734 },
  'マドリード': { lat: 40.4168, lng: -3.7038 },
  
  // Default locations for regions
  'フランス': { lat: 48.8566, lng: 2.3522 },
  '日本': { lat: 35.6762, lng: 139.6503 },
  'イタリア': { lat: 41.9028, lng: 12.4964 },
  'イギリス': { lat: 51.5074, lng: -0.1278 },
  'アメリカ': { lat: 40.7128, lng: -74.0060 },
  'ドイツ': { lat: 52.5200, lng: 13.4050 },
  'スペイン': { lat: 41.3851, lng: 2.1734 }
}

export class CoordinateService {
  /**
   * Get coordinates for a given location name
   */
  static getCoordinatesForLocation(locationName: string, region?: string): Coordinates {
    // First try exact match
    if (LOCATION_COORDINATES[locationName]) {
      return LOCATION_COORDINATES[locationName]
    }
    
    // Try partial matching for names containing keywords
    for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
      if (locationName.includes(key) || key.includes(locationName)) {
        return coords
      }
    }
    
    // Try region match
    if (region && LOCATION_COORDINATES[region]) {
      return LOCATION_COORDINATES[region]
    }
    
    // Try to match common patterns
    if (locationName.includes('パリ') || locationName.includes('Paris')) {
      return LOCATION_COORDINATES['パリ']
    }
    if (locationName.includes('東京') || locationName.includes('Tokyo')) {
      return LOCATION_COORDINATES['東京']
    }
    if (locationName.includes('京都') || locationName.includes('Kyoto')) {
      return LOCATION_COORDINATES['京都']
    }
    if (locationName.includes('ローマ') || locationName.includes('Rome')) {
      return LOCATION_COORDINATES['ローマ']
    }
    
    // Check region patterns
    if (region) {
      if (region.includes('フランス') || region.includes('France')) {
        return LOCATION_COORDINATES['フランス']
      }
      if (region.includes('日本') || region.includes('Japan')) {
        return LOCATION_COORDINATES['日本']
      }
      if (region.includes('イタリア') || region.includes('Italy')) {
        return LOCATION_COORDINATES['イタリア']
      }
    }
    
    // Default to Tokyo if no match found
    return LOCATION_COORDINATES['日本']
  }
  
  /**
   * Add new location coordinates
   */
  static addLocationCoordinates(name: string, coordinates: Coordinates) {
    LOCATION_COORDINATES[name] = coordinates
  }
  
  /**
   * Get all available locations
   */
  static getAllLocations() {
    return Object.keys(LOCATION_COORDINATES)
  }
}

export default CoordinateService