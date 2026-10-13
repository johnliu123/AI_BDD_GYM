IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE orders (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  guest_session_id VARCHAR(128) NOT NULL,
  order_number VARCHAR(32) NOT NULL UNIQUE,
  status VARCHAR(32) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_orders_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_orders_guest_session FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(session_id)
);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_orders_session_created')
CREATE INDEX idx_orders_session_created ON orders(guest_session_id, created_at);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_items' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE order_items (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  menu_item_id VARCHAR(64) NOT NULL,
  menu_item_name NVARCHAR(200) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  CONSTRAINT FK_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_item_options' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE order_item_options (
  order_item_id VARCHAR(36) NOT NULL,
  option_group_id VARCHAR(64) NOT NULL,
  option_group_name NVARCHAR(100) NOT NULL,
  menu_item_option_id VARCHAR(64) NOT NULL,
  option_name NVARCHAR(100) NOT NULL,
  PRIMARY KEY (order_item_id, option_group_id),
  CONSTRAINT FK_order_item_options_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_idempotency_keys' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE order_idempotency_keys (
  guest_session_id VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_order_idempotency_created_at DEFAULT SYSUTCDATETIME(),
  expires_at DATETIME2 NOT NULL,
  PRIMARY KEY (guest_session_id, idempotency_key),
  CONSTRAINT FK_order_idempotency_session FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(session_id),
  CONSTRAINT FK_order_idempotency_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_order_idempotency_expires')
CREATE INDEX idx_order_idempotency_expires ON order_idempotency_keys(expires_at);
