IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'session_create_rate_limits' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE session_create_rate_limits (
  client_key VARCHAR(128) NOT NULL PRIMARY KEY,
  window_start_ms BIGINT NOT NULL,
  request_count INT NOT NULL CHECK (request_count >= 0)
);
