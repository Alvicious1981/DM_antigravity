-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the narrative_memory table to store semantic chunks
CREATE TABLE IF NOT EXISTS narrative_memory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text NOT NULL,
    embedding vector(768), -- Adjust dimension if using a different model (768 for Gemini)
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Create an HNSW index for fast similarity search
-- m: Max number of connections per layer
-- ef_construction: Size of the dynamic candidate list for index construction
CREATE INDEX ON narrative_memory USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Function to search for similar memories
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    narrative_memory.id,
    narrative_memory.content,
    narrative_memory.metadata,
    1 - (narrative_memory.embedding <=> query_embedding) AS similarity
  FROM narrative_memory
  WHERE 1 - (narrative_memory.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
