IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'payment_status')
ALTER TABLE dbo.orders ADD payment_status VARCHAR(32) NOT NULL CONSTRAINT DF_orders_payment_status DEFAULT 'unpaid';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'payment_status_updated_at')
ALTER TABLE dbo.orders ADD payment_status_updated_at DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'payment_failure_reason')
ALTER TABLE dbo.orders ADD payment_failure_reason NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'payment_failed_at')
ALTER TABLE dbo.orders ADD payment_failed_at DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'paid_at')
ALTER TABLE dbo.orders ADD paid_at DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'cancelled_at')
ALTER TABLE dbo.orders ADD cancelled_at DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'refunded_at')
ALTER TABLE dbo.orders ADD refunded_at DATETIME2 NULL;

UPDATE dbo.orders SET payment_status = 'unpaid' WHERE payment_status IS NULL;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_orders_payment_status_created')
CREATE INDEX idx_orders_payment_status_created ON dbo.orders(payment_status, created_at DESC);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payment_idempotency_keys' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE payment_idempotency_keys (
  guest_session_id VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  result_payment_status VARCHAR(32) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_payment_idempotency_created_at DEFAULT SYSUTCDATETIME(),
  expires_at DATETIME2 NOT NULL,
  PRIMARY KEY (guest_session_id, idempotency_key),
  CONSTRAINT FK_payment_idempotency_session FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(session_id),
  CONSTRAINT FK_payment_idempotency_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payment_idempotency_expires')
CREATE INDEX idx_payment_idempotency_expires ON payment_idempotency_keys(expires_at);
