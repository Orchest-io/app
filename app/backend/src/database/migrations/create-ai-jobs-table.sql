-- Migration: Create ai_jobs table
-- Description: Stores AI processing jobs with progress tracking

CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_stage VARCHAR(200),
  input_data JSONB,
  result_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_jobs_user_status ON ai_jobs(user_id, status);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_ai_jobs_created ON ai_jobs(created_at DESC);

-- Comments
COMMENT ON TABLE ai_jobs IS 'Tracks AI processing jobs with real-time progress';
COMMENT ON COLUMN ai_jobs.type IS 'Job type: project_planning, task_estimation, etc.';
COMMENT ON COLUMN ai_jobs.status IS 'pending, processing, completed, failed, accepted, rejected';
COMMENT ON COLUMN ai_jobs.progress IS 'Progress percentage 0-100';
COMMENT ON COLUMN ai_jobs.current_stage IS 'Current processing stage message';
