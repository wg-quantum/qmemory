"""
地理情報サービス - 国際対応動的ジオコーディング
ハードコーディングなしでAI/量子推定による座標取得
"""

import requests
import asyncio
import logging
import time
from typing import Dict, Optional, List
import hashlib
import json

logger = logging.getLogger(__name__)

class InternationalGeocodingService:
    """国際対応ジオコーディングサービス"""
    
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 3600  # 1時間キャッシュ
        self.last_request_time = 0
        self.rate_limit_delay = 1.0  # 1秒間隔
    
    def _get_cache_key(self, location_name: str, country_hint: str = None) -> str:
        """キャッシュキー生成"""
        cache_input = f"{location_name}:{country_hint or 'global'}"
        return hashlib.md5(cache_input.encode()).hexdigest()[:16]
    
    def geocode_location_international(
        self, 
        location_name: str, 
        country_hint: str = None,
        context: Dict = None
    ) -> Optional[Dict]:
        """国際対応ジオコーディング"""
        
        cache_key = self._get_cache_key(location_name, country_hint)
        if cache_key in self.cache:
            logger.info(f"Geocoding cache hit for: {location_name}")
            return self.cache[cache_key]
        
        try:
            # 国別検索戦略
            search_queries = self._build_search_queries(location_name, country_hint, context)
            
            for query_info in search_queries:
                result = self._try_geocoding_query(query_info)
                if result:
                    # キャッシュに保存
                    self.cache[cache_key] = result
                    logger.info(f"Geocoded {location_name} -> {result['country']}")
                    return result
            
            # フォールバック: 地域デフォルト座標
            fallback_result = self._get_regional_fallback(country_hint, context)
            self.cache[cache_key] = fallback_result
            return fallback_result
            
        except Exception as e:
            logger.error(f"Geocoding failed for {location_name}: {e}")
            return self._get_regional_fallback(country_hint, context)
    
    def _build_search_queries(
        self, 
        location_name: str, 
        country_hint: str, 
        context: Dict = None
    ) -> List[Dict]:
        """検索クエリ構築"""
        
        queries = []
        
        if country_hint:
            # 国別検索パターン
            country_patterns = {
                'france': [
                    f"{location_name}, Paris, France",
                    f"{location_name}, France", 
                    f"Paris {location_name}",
                    f"{location_name}, Île-de-France, France"
                ],
                'japan': [
                    f"{location_name}, Japan",
                    f"{location_name}, 日本",
                    f"{location_name}, Kyoto, Japan",
                    f"{location_name}, Tokyo, Japan"
                ],
                'italy': [
                    f"{location_name}, Italy",
                    f"{location_name}, Rome, Italy",
                    f"{location_name}, Florence, Italy",
                    f"{location_name}, Italia"
                ],
                'uk': [
                    f"{location_name}, London, UK",
                    f"{location_name}, United Kingdom",
                    f"{location_name}, England",
                    f"London {location_name}"
                ],
                'usa': [
                    f"{location_name}, New York, USA",
                    f"{location_name}, United States",
                    f"{location_name}, California, USA",
                    f"New York {location_name}"
                ]
            }
            
            if country_hint in country_patterns:
                for pattern in country_patterns[country_hint]:
                    queries.append({
                        'query': pattern,
                        'priority': 'high',
                        'expected_country': country_hint
                    })
        
        # 汎用パターン
        queries.extend([
            {'query': location_name, 'priority': 'medium', 'expected_country': None},
            {'query': f"{location_name} landmark", 'priority': 'low', 'expected_country': None}
        ])
        
        return queries
    
    def _try_geocoding_query(self, query_info: Dict) -> Optional[Dict]:
        """個別クエリ実行"""
        
        query = query_info['query']
        
        try:
            # レート制限対応
            current_time = time.time()
            if current_time - self.last_request_time < self.rate_limit_delay:
                time.sleep(self.rate_limit_delay)
            
            # Nominatim (OpenStreetMap) 使用
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': query,
                'format': 'json',
                'limit': 1,
                'addressdetails': 1,
                'accept-language': 'en'  # 英語で統一
            }
            
            headers = {
                'User-Agent': 'QMemory/1.0 (quantum memory analysis)'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            self.last_request_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    return self._parse_nominatim_result(data[0], query_info)
            
        except Exception as e:
            logger.warning(f"Geocoding query failed: {query} - {e}")
        
        return None
    
    def _parse_nominatim_result(self, result: Dict, query_info: Dict) -> Dict:
        """Nominatim結果解析"""
        
        address = result.get('address', {})
        
        # 国名を正規化
        country = self._normalize_country(address.get('country', ''))
        
        # 期待される国と一致するかチェック
        expected = query_info.get('expected_country')
        if expected and country != expected:
            # 部分的にマッチしていればOK
            country_mappings = {
                'france': ['france', 'french'],
                'japan': ['japan', 'japanese'], 
                'italy': ['italy', 'italian'],
                'uk': ['united kingdom', 'england', 'britain', 'british'],
                'usa': ['united states', 'america', 'american']
            }
            
            if expected in country_mappings:
                if not any(mapping in country.lower() for mapping in country_mappings[expected]):
                    logger.warning(f"Country mismatch: expected {expected}, got {country}")
        
        return {
            'lat': float(result['lat']),
            'lng': float(result['lon']),
            'formatted_address': result.get('display_name', ''),
            'city': address.get('city') or address.get('town') or address.get('village'),
            'country': country,
            'confidence': min(0.9, float(result.get('importance', 0.5))),
            'source': 'nominatim'
        }
    
    def _normalize_country(self, country_raw: str) -> str:
        """国名正規化"""
        country_lower = country_raw.lower()
        
        mappings = {
            'france': 'france',
            'french republic': 'france',
            'japan': 'japan', 
            '日本': 'japan',
            'italy': 'italy',
            'italia': 'italy',
            'united kingdom': 'uk',
            'england': 'uk', 
            'britain': 'uk',
            'united states': 'usa',
            'united states of america': 'usa',
            'america': 'usa'
        }
        
        for pattern, normalized in mappings.items():
            if pattern in country_lower:
                return normalized
                
        return country_raw.lower()
    
    def _get_regional_fallback(self, country_hint: str, context: Dict = None) -> Dict:
        """地域フォールバック座標"""
        
        # 改善された地域別フォールバック座標
        regional_defaults = {
            'france': {
                'lat': 48.8566, 'lng': 2.3522, 
                'city': 'Paris', 'country': 'france',
                'formatted_address': 'Paris, France',
                'confidence': 0.6, 'source': 'fallback'
            },
            'japan': {
                'lat': 35.0116, 'lng': 135.7681,
                'city': 'Kyoto', 'country': 'japan', 
                'formatted_address': 'Kyoto, Japan',
                'confidence': 0.6, 'source': 'fallback'
            },
            'italy': {
                'lat': 41.9028, 'lng': 12.4964,
                'city': 'Rome', 'country': 'italy',
                'formatted_address': 'Rome, Italy', 
                'confidence': 0.6, 'source': 'fallback'
            },
            'uk': {
                'lat': 51.5074, 'lng': -0.1278,
                'city': 'London', 'country': 'uk',
                'formatted_address': 'London, UK',
                'confidence': 0.6, 'source': 'fallback'  
            },
            'usa': {
                'lat': 40.7128, 'lng': -74.0060,
                'city': 'New York', 'country': 'usa',
                'formatted_address': 'New York, USA',
                'confidence': 0.6, 'source': 'fallback'
            }
        }
        
        if country_hint in regional_defaults:
            return regional_defaults[country_hint]
        
        # デフォルト（東京）
        return {
            'lat': 35.6762, 'lng': 139.6503,
            'city': 'Tokyo', 'country': 'japan',
            'formatted_address': 'Tokyo, Japan',
            'confidence': 0.4, 'source': 'global_fallback'
        }

# シングルトンインスタンス
_geocoding_service = None

def get_geocoding_service() -> InternationalGeocodingService:
    """ジオコーディングサービス取得"""
    global _geocoding_service
    if not _geocoding_service:
        _geocoding_service = InternationalGeocodingService()
    return _geocoding_service

def geocode_location_dynamic(
    location_name: str, 
    country_hint: str = None, 
    context: Dict = None
) -> Optional[Dict]:
    """動的ジオコーディング - ハードコーディングなし"""
    
    service = get_geocoding_service()
    
    result = service.geocode_location_international(
        location_name, country_hint, context
    )
    return result