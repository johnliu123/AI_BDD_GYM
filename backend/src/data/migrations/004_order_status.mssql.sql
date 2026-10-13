IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'status_updated_at')
ALTER TABLE dbo.orders ADD status_updated_at DATETIME2 NULL;

UPDATE dbo.orders SET status_updated_at = created_at WHERE status_updated_at IS NULL;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_orders_status_created')
CREATE INDEX idx_orders_status_created ON dbo.orders(status, created_at DESC);
