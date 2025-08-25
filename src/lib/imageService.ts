interface PixabaySearchResult {
  id: number
  webformatURL: string
  largeImageURL: string
  tags: string
}

interface PexelsSearchResult {
  id: number
  src: {
    medium: string
    large: string
    original: string
  }
  alt: string
}

interface WikipediaImageResult {
  url: string
  description: string
}

interface OpenverseSearchResult {
  id: string
  url: string
  title: string
  license: string
}

export class ImageService {
  /**
   * Search for images using Openverse API (Creative Commons)
   * Completely free and commercial use allowed
   */
  static async searchOpenverse(query: string, count: number = 1): Promise<string[]> {
    try {
      const response = await fetch(
        `https://api.openverse.engineering/v1/images/?q=${encodeURIComponent(query)}&page_size=${count}&license_type=commercial&mature=false`,
        {
          headers: {
            'User-Agent': 'QMemory/1.0 (https://github.com/your-repo)'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Openverse API request failed')
      }

      const data = await response.json()
      return data.results?.map((result: OpenverseSearchResult) => result.url) || []
    } catch (error) {
      console.warn('Openverse search failed:', error)
      return []
    }
  }

  /**
   * Search for images using Lorem Picsum with location-based seeds
   * Completely free with no restrictions
   */
  static async searchPicsumByLocation(locationName: string, count: number = 1): Promise<string[]> {
    const results: string[] = []
    
    for (let i = 0; i < count; i++) {
      // Create a deterministic seed based on location name and index
      const seed = this.createLocationSeed(locationName, i)
      const imageId = this.hashStringToNumber(seed) % 1000 + 1 // 1-1000 range
      results.push(`https://picsum.photos/800/600?random=${imageId}`)
    }
    
    return results
  }

  /**
   * Create a seed string based on location name and index
   */
  private static createLocationSeed(locationName: string, index: number): string {
    return `${locationName.toLowerCase().replace(/\s+/g, '-')}-${index}`
  }

  /**
   * Simple hash function to convert string to number
   */
  private static hashStringToNumber(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get images from Wikipedia/Wikimedia Commons
   */
  static async searchWikipedia(locationName: string): Promise<string[]> {
    try {
      // First, search for the Wikipedia page
      const searchResponse = await fetch(
        `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(locationName)}`
      )

      if (!searchResponse.ok) {
        throw new Error('Wikipedia search failed')
      }

      const searchData = await searchResponse.json()
      
      if (searchData.thumbnail) {
        return [searchData.thumbnail.source.replace(/\/\d+px-/, '/800px-')]
      }

      return []
    } catch (error) {
      console.warn('Wikipedia search failed:', error)
      return []
    }
  }

  /**
   * Generate deterministic placeholder image using Picsum
   * Free for commercial use with no restrictions
   */
  static generatePlaceholder(width: number = 800, height: number = 600, seed?: string): string {
    if (seed) {
      const imageId = this.hashStringToNumber(seed) % 1000 + 1
      return `https://picsum.photos/${width}/${height}?random=${imageId}`
    }
    return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000) + 1}`
  }

  /**
   * Try multiple FREE commercial image sources and return the first available one
   * Priority: Wikipedia > Openverse > Location-based Picsum
   */
  static async getLocationImage(locationName: string, region?: string): Promise<string> {
    // Extract key location terms for better search accuracy
    const locationTerms = this.extractLocationTerms(locationName)
    const queries = this.generateLocationQueries(locationTerms, region)

    console.log(`Searching images for: ${locationName}`, { locationTerms, queries })

    // First try Wikipedia (often has good location images for Japan)
    for (const term of locationTerms.slice(0, 2)) { // Try top 2 terms
      const wikipediaResults = await this.searchWikipedia(term)
      if (wikipediaResults.length > 0) {
        console.log(`Found Wikipedia image for: ${term}`)
        return wikipediaResults[0]
      }
    }

    // Try Openverse (Creative Commons, commercial use allowed)
    for (const query of queries.slice(0, 3)) { // Try top 3 queries
      const openverseResults = await this.searchOpenverse(query, 1)
      if (openverseResults.length > 0) {
        console.log(`Found Openverse image for: ${query}`)
        return openverseResults[0]
      }
    }

    // Fallback to location-based Picsum (deterministic beautiful images)
    const picsumResults = await this.searchPicsumByLocation(locationName, 1)
    console.log(`Using Picsum placeholder for: ${locationName}`)
    return picsumResults[0]
  }

  /**
   * Extract meaningful location terms from location names (supports both Japanese and international)
   */
  private static extractLocationTerms(locationName: string): string[] {
    const terms: string[] = []
    
    // Add full name
    terms.push(locationName)
    
    // Check if this is Japanese text
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(locationName)
    
    if (hasJapanese) {
      // Japanese location processing
      const cleanName = locationName
        .replace(/の|で|に|を|は|が|と|へ|から|より|まで/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      const parts = cleanName.split(/\s|・|、|，/)
      
      for (const part of parts) {
        if (part.length >= 2) {
          terms.push(part)
        }
      }
      
      // Japanese location patterns
      const locationPatterns = [
        /(京都|東京|大阪|神戸|横浜|名古屋|札幌|福岡|仙台|広島|熊本|鹿児島|沖縄|奈良|金沢|富山|岐阜|静岡|浜松|新潟|長野|松本|高山|飛騨|熱海|箱根|日光|軽井沢|鎌倉|江ノ島|小樽|函館|旭川|釧路|帯広|青森|秋田|山形|福島|水戸|宇都宮|前橋|浦和|千葉|甲府|津|大津|和歌山|鳥取|松江|岡山|山口|徳島|高松|松山|高知|長崎|佐賀|大分|宮崎)/,
        /(寺|神社|城|公園|温泉|駅|港|山|川|湖|海|島|岬|峠|橋|タワー|ホテル|旅館|カフェ|レストラン)/
      ]
      
      for (const pattern of locationPatterns) {
        const matches = locationName.match(pattern)
        if (matches) {
          terms.push(...matches.slice(1))
        }
      }
    } else {
      // International location processing
      // Split by common delimiters
      const parts = locationName.split(/[,\s\-\/\\]+/).filter(part => part.length > 1)
      terms.push(...parts)
      
      // Extract common international location indicators
      const internationalPatterns = [
        /(Paris|London|New York|Tokyo|Berlin|Rome|Madrid|Barcelona|Amsterdam|Vienna|Prague|Budapest|Stockholm|Copenhagen|Oslo|Helsinki|Zurich|Geneva|Milan|Florence|Venice|Naples)/i,
        /(France|UK|USA|Germany|Italy|Spain|Netherlands|Austria|Czech|Hungary|Sweden|Denmark|Norway|Finland|Switzerland|Canada|Australia|Thailand|India|China|Korea|Brazil|Mexico)/i,
        /(Beach|Mountain|Lake|River|Park|Tower|Museum|Cathedral|Castle|Palace|Square|Street|Avenue|Bridge|Garden|Temple|Church)/i
      ]
      
      for (const pattern of internationalPatterns) {
        const matches = locationName.match(pattern)
        if (matches) {
          terms.push(...matches.slice(1))
        }
      }
    }
    
    return [...new Set(terms)] // Remove duplicates
  }

  /**
   * Generate optimized search queries for location images (supports both Japanese and international)
   */
  private static generateLocationQueries(locationTerms: string[], region?: string): string[] {
    const queries: string[] = []
    
    // Detect if this is Japanese content
    const hasJapanese = locationTerms.some(term => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term))
    
    // Auto-detect region if not provided
    let detectedRegion = region
    if (!detectedRegion) {
      if (hasJapanese) {
        detectedRegion = 'Japan'
      } else {
        // Try to detect region from terms
        const regionDetection = [
          { pattern: /(France|Paris|Lyon|Marseille|Nice|Bordeaux)/i, region: 'France' },
          { pattern: /(UK|Britain|London|Edinburgh|Manchester|Liverpool)/i, region: 'UK' },
          { pattern: /(USA|America|New York|Los Angeles|Chicago|Boston|Miami)/i, region: 'USA' },
          { pattern: /(Germany|Berlin|Munich|Hamburg|Frankfurt)/i, region: 'Germany' },
          { pattern: /(Italy|Rome|Milan|Venice|Florence|Naples)/i, region: 'Italy' },
          { pattern: /(Spain|Madrid|Barcelona|Seville|Valencia)/i, region: 'Spain' },
          { pattern: /(Netherlands|Amsterdam|Rotterdam|Utrecht)/i, region: 'Netherlands' },
          { pattern: /(Switzerland|Zurich|Geneva|Basel|Bern)/i, region: 'Switzerland' },
          { pattern: /(Australia|Sydney|Melbourne|Brisbane|Perth)/i, region: 'Australia' },
          { pattern: /(Canada|Toronto|Vancouver|Montreal|Ottawa)/i, region: 'Canada' },
          { pattern: /(Thailand|Bangkok|Phuket|Chiang Mai)/i, region: 'Thailand' },
          { pattern: /(India|Delhi|Mumbai|Bangalore|Chennai)/i, region: 'India' },
          { pattern: /(China|Beijing|Shanghai|Guangzhou|Shenzhen)/i, region: 'China' },
          { pattern: /(Korea|Seoul|Busan|Incheon)/i, region: 'Korea' },
        ]
        
        for (const detection of regionDetection) {
          for (const term of locationTerms) {
            if (detection.pattern.test(term)) {
              detectedRegion = detection.region
              break
            }
          }
          if (detectedRegion) break
        }
        
        // Default to first location term if no region detected
        detectedRegion = detectedRegion || locationTerms[0]
      }
    }
    
    // Primary queries with location terms
    for (const term of locationTerms.slice(0, 3)) {
      queries.push(`${term} ${detectedRegion}`)
      queries.push(`${term} landscape`)
      
      if (hasJapanese) {
        queries.push(`${term} 風景`)
      } else {
        queries.push(`${term} tourism`)
        queries.push(`${term} architecture`)
        queries.push(`${term} travel`)
      }
    }
    
    // Secondary queries based on region
    if (hasJapanese || detectedRegion === 'Japan') {
      queries.push(`${detectedRegion} tourism`)
      queries.push(`${detectedRegion} 観光`)
      queries.push('Japan traditional architecture')
      queries.push('Japanese scenery')
    } else {
      queries.push(`${detectedRegion} tourism`)
      queries.push(`${detectedRegion} travel`)
      queries.push(`${detectedRegion} landmarks`)
      queries.push(`${detectedRegion} scenery`)
    }
    
    return queries
  }

  /**
   * Batch fetch images for multiple locations using only free commercial sources
   */
  static async getMultipleLocationImages(
    locations: Array<{ name: string; region?: string }>
  ): Promise<Array<{ name: string; imageUrl: string }>> {
    const results = await Promise.allSettled(
      locations.map(async (location) => ({
        name: location.name,
        imageUrl: await this.getLocationImage(location.name, location.region)
      }))
    )

    return results
      .filter((result): result is PromiseFulfilledResult<{ name: string; imageUrl: string }> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value)
  }

  /**
   * Get image source information for attribution
   */
  static getImageAttribution(imageUrl: string): { source: string; license: string; attribution?: string } {
    if (imageUrl.includes('wikipedia.org') || imageUrl.includes('wikimedia.org')) {
      return {
        source: 'Wikimedia Commons',
        license: 'Creative Commons / Public Domain',
        attribution: 'Image from Wikimedia Commons'
      }
    }
    
    if (imageUrl.includes('openverse.engineering')) {
      return {
        source: 'Openverse',
        license: 'Creative Commons',
        attribution: 'Image from Openverse (Creative Commons)'
      }
    }
    
    if (imageUrl.includes('picsum.photos')) {
      return {
        source: 'Lorem Picsum',
        license: 'Free for commercial use',
        attribution: 'Image from Lorem Picsum'
      }
    }
    
    return {
      source: 'Unknown',
      license: 'Unknown',
      attribution: 'Image source unknown'
    }
  }
}

export default ImageService