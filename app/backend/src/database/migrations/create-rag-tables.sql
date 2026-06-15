-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Table: project_embeddings
-- Stores vector embeddings for RAG (Retrieval-Augmented Generation)
CREATE TABLE IF NOT EXISTS project_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Vector embedding (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536) NOT NULL,
  
  -- Content metadata
  content_type VARCHAR(50) NOT NULL, -- 'project_summary', 'milestone', 'task', 'retrospective'
  content_text TEXT NOT NULL, -- Original text that was embedded
  
  -- Additional metadata for filtering
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast similarity search
CREATE INDEX IF NOT EXISTS project_embeddings_vector_idx 
ON project_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for filtering by project
CREATE INDEX IF NOT EXISTS project_embeddings_project_idx 
ON project_embeddings(project_id);

-- Index for filtering by content type
CREATE INDEX IF NOT EXISTS project_embeddings_content_type_idx 
ON project_embeddings(content_type);

-- Table: rag_search_logs
-- Logs RAG searches for analytics and improvement
CREATE TABLE IF NOT EXISTS rag_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Search details
  query_text TEXT NOT NULL,
  query_embedding vector(1536),
  
  -- Results
  results_count INTEGER DEFAULT 0,
  top_project_ids UUID[],
  
  -- Performance metrics
  search_duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS rag_search_logs_user_idx 
ON rag_search_logs(user_id);

CREATE INDEX IF NOT EXISTS rag_search_logs_created_at_idx 
ON rag_search_logs(created_at DESC);

-- Function: Calculate cosine similarity
-- Helper function for vector similarity search
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS float
AS $$
BEGIN
  RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- Function: Search similar projects
-- Performs semantic search using vector similarity
CREATE OR REPLACE FUNCTION search_similar_projects(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  result_limit integer DEFAULT 10
)
RETURNS TABLE (
  project_id UUID,
  content_type VARCHAR(50),
  content_text TEXT,
  similarity_score float,
  metadata JSONB
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.project_id,
    pe.content_type,
    pe.content_text,
    cosine_similarity(pe.embedding, query_embedding) as similarity_score,
    pe.metadata
  FROM project_embeddings pe
  WHERE cosine_similarity(pe.embedding, query_embedding) >= similarity_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE project_embeddings IS 'Stores vector embeddings of projects for RAG-based AI suggestions';
COMMENT ON TABLE rag_search_logs IS 'Logs RAG search queries for analytics and monitoring';
COMMENT ON FUNCTION search_similar_projects IS 'Semantic search for similar projects using vector embeddings';
