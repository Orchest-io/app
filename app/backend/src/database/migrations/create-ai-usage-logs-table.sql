-- AI Usage Logs Table
-- Tracks all AI API usage for monitoring, billing, and limits

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL,
  ai_job_id UUID REFERENCES ai_jobs(id) ON DELETE SET NULL,
  tokens_used INT,
  estimated_cost DECIMAL(10, 6),
  model_used VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for monthly usage queries (critical for limit checks)
CREATE INDEX idx_ai_usage_user_month ON ai_usage_logs(user_id, DATE_TRUNC('month', created_at));

-- Index for job lookups
CREATE INDEX idx_ai_usage_job ON ai_usage_logs(ai_job_id);

-- Index for cost analysis
CREATE INDEX idx_ai_usage_created ON ai_usage_logs(created_at DESC);
