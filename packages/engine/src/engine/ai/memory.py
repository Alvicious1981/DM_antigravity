
import os
import json
from typing import List, Dict, Any, Optional
from google import genai
from postgrest import SyncPostgrestClient

class MemoryService:
    """
    Handles semantic memory storage and retrieval using pgvector and Gemini Embeddings.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        
        if self.api_key:
            self.genai_client = genai.Client(api_key=self.api_key)
            
        if self.supabase_url and self.supabase_key:
            # Simple sync client for core logic
            self.supabase = SyncPostgrestClient(f"{self.supabase_url}/rest/v1", headers={
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}"
            })

    def generate_embedding(self, text: str) -> List[float]:
        """Generate a vector embedding for the given text using Gemini."""
        if not self.api_key:
            return [0.0] * 768  # Mock embedding

        response = self.genai_client.models.embed_content(
            model="text-embedding-004",
            content=text
        )
        return response.embeddings[0].values

    def store_memory(self, content: str, metadata: Dict[str, Any] = None):
        """Store a new narrative memory chunk in Supabase."""
        if not self.supabase_url:
            print("⚠️ Supabase not configured. Skipping memory storage.")
            return

        embedding = self.generate_embedding(content)
        
        try:
            self.supabase.table("narrative_memory").insert({
                "content": content,
                "embedding": embedding,
                "metadata": metadata or {}
            }).execute()
        except Exception as e:
            print(f"❌ Error storing memory: {e}")

    def retrieve_similar_memories(self, query: str, limit: int = 5, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Retrieve similar memories from Supabase using vector similarity."""
        if not self.supabase_url:
            return []

        embedding = self.generate_embedding(query)
        
        try:
            # Using the RPC function we created in the migration
            response = self.supabase.rpc("match_memories", {
                "query_embedding": embedding,
                "match_threshold": threshold,
                "match_count": limit
            }).execute()
            return response.data
        except Exception as e:
            print(f"❌ Error retrieving memories: {e}")
            return []
