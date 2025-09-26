import os
import json
from typing import Dict, List, Optional, Any
from fastapi import HTTPException
import google.generativeai as genai
from pydantic import BaseModel

class SecondaryLocation(BaseModel):
    name: str
    probability: float
    description: str
    region: str

class GeminiAnalysisResult(BaseModel):
    location: str
    story: str
    region: str
    secondary_locations: List[SecondaryLocation]

class GeminiService:
    def __init__(self):
        self.default_model = 'gemini-1.5-flash-latest'
        
    def _get_client(self, api_key: str):
        """Gemini APIクライアントを取得"""
        try:
            genai.configure(api_key=api_key)
            return genai.GenerativeModel(self.default_model)
        except Exception as e:
            print(f"Gemini client configuration error: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Gemini API設定エラー: {str(e)}"
            )
        
    async def analyze_memory_with_gemini(
        self,
        memory: str,
        emotion: str,
        api_key: str,
        model_name: Optional[str] = None
    ) -> GeminiAnalysisResult:
        """
        Gemini APIを使用してメモリを分析
        """
        try:
            model = self._get_client(api_key)
            
            # 国際的な場所かどうかを検出
            is_international = self._detect_international_location(memory)
            
            # プロンプトを生成
            prompt = self._generate_analysis_prompt(memory, emotion, is_international)
            
            # Gemini APIに送信
            response = model.generate_content(prompt)
            
            # レスポンスをパース
            result_data = self._parse_response(response.text)
            
            secondary_locations = []
            for sec_loc in result_data.get("secondaryLocations", []):
                secondary_locations.append(SecondaryLocation(
                    name=sec_loc["name"],
                    probability=sec_loc["probability"],
                    description=sec_loc["description"],
                    region=sec_loc["region"]
                ))

            return GeminiAnalysisResult(
                location=result_data["primaryLocation"]["name"],
                story=result_data["primaryLocation"]["story"],
                region=result_data["primaryLocation"]["region"],
                secondary_locations=secondary_locations
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Gemini分析エラー: {str(e)}"
            )
    
    def _detect_international_location(self, memory: str) -> bool:
        """記憶が国際的な場所を示しているかを検出"""
        international_keywords = [
            "Paris", "London", "New York", "Rome", "Berlin", "Madrid", 
            "Amsterdam", "Zurich", "Sydney", "Toronto", "France", "UK", 
            "USA", "Italy", "Germany", "Spain", "Netherlands", "Switzerland", 
            "Australia", "Canada", "パリ", "ロンドン", "ニューヨーク", "ローマ", 
            "ベルリン", "マドリード", "アムステルダム", "チューリッヒ", "シドニー", 
            "トロント", "フランス", "イギリス", "アメリカ", "イタリア", "ドイツ", 
            "スペイン", "オランダ", "スイス", "オーストラリア", "カナダ", "Europe", 
            "ヨーロッパ", "海外", "外国", "石畳", "教会", "カフェ", "エッフェル塔", 
            "セーヌ川", "テムズ川", "高層ビル"
        ]
        
        return any(keyword.lower() in memory.lower() for keyword in international_keywords)
    
    def _generate_analysis_prompt(self, memory: str, emotion: str, is_international: bool) -> str:
        """分析用のプロンプトを生成"""
        location_constraint = (
            "Use real, existing locations worldwide that match the memory. If the memory suggests international locations (Europe, America, etc.), suggest those places. Include specific landmarks, cities, or well-known places that actually exist."
            if is_international
            else "Use real, existing locations primarily in Japan, but if the memory clearly suggests international locations, include those as well."
        )
        
        region_instruction = (
            '"region": "Country or major region (e.g., France, UK, USA, Italy, etc.)"'
            if is_international
            else '"region": "Prefecture, country, or region name"'
        )
        
        return f"""
You are a quantum memory reconstruction AI that helps people discover meaningful locations from their memory fragments.

Given the following memory fragment and emotional context, suggest specific, real locations that could match this memory.

Memory Fragment: "{memory}"
Emotional Context: "{emotion}"

Please respond in the following JSON format:
{{
  "primaryLocation": {{
    "name": "A specific, real location name (city, landmark, or place)",
    "story": "A 2-3 sentence deeply emotional and poetic story connecting the memory to this place, written in Japanese",
    {region_instruction}
  }},
  "secondaryLocations": [
    {{
      "name": "Another possible real location",
      "probability": number between 10-30,
      "description": "Brief poetic description in Japanese",
      {region_instruction}
    }},
    {{
      "name": "Third possible real location", 
      "probability": number between 5-25,
      "description": "Brief poetic description in Japanese",
      {region_instruction}
    }}
  ]
}}

IMPORTANT: 
- {location_constraint}
- The locations should be places that actually exist and can be found on maps
- Match the geographic context of the memory (if it mentions Europe, suggest European places)
- Focus on creating emotionally resonant connections between the memory and real places
- Stories should be deeply moving and poetic, evoking the feeling of lost memories being recovered
- If memory mentions specific international elements (stone streets, churches, cafes in Europe, etc.), suggest international locations
"""
    
    def _parse_response(self, response_text: str) -> dict:
        """Gemini APIのレスポンスをパース"""
        try:
            # JSONマーカーを除去
            cleaned_text = response_text.replace("```json\n", "").replace("```", "").strip()
            return json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Gemini APIレスポンスの解析に失敗: {str(e)}"
            )
    
    async def generate_memory_image(
        self,
        location: str,
        memory: str,
        emotion: str,
        api_key: str,
        model_name: Optional[str] = None
    ) -> str:
        """記憶に基づく画像生成用の説明を生成"""
        try:
            model = self._get_client(api_key)
            
            prompt = f"""
Create a detailed, artistic description for an image that represents:
- Location: {location}
- Memory: {memory}
- Emotion: {emotion}

Describe the scene in vivid detail, including lighting, colors, atmosphere, and specific visual elements that would evoke nostalgia and emotional depth. The description should be suitable for image generation.
"""
            
            response = model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"画像説明生成エラー: {str(e)}"
            )

# シングルトンインスタンス
gemini_service = GeminiService()