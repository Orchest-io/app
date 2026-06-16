-- Table: user_sessions
-- Stores active user sessions for security tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session identification
  session_token VARCHAR(255) NOT NULL UNIQUE,
  
  -- Device & Browser info
  device_info TEXT, -- e.g., "Chrome 120 on Windows 10"
  user_agent TEXT, -- Full User-Agent string
  
  -- Location tracking
  ip_address VARCHAR(45), -- IPv4 or IPv6
  location VARCHAR(255), -- e.g., "Cairo, EG"
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- Index for faster queries
  INDEX idx_user_sessions_user_id (user_id),
  INDEX idx_user_sessions_token (session_token),
  INDEX idx_user_sessions_active (is_active, expires_at)
);

-- Comments
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for security and device management';
COMMENT ON COLUMN user_sessions.session_token IS 'JWT token or session identifier';
COMMENT ON COLUMN user_sessions.device_info IS 'Human-readable device description';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP address of the session';
COMMENT ON COLUMN user_sessions.location IS 'Approximate location based on IP';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether the session is still valid';
COMMENT ON COLUMN user_sessions.last_active_at IS 'Last time this session was used';
COMMENT ON COLUMN user_sessions.expires_at IS 'Session expiration timestamp';
