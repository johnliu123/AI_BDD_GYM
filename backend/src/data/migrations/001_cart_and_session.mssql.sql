IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'guest_sessions' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE guest_sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  csrf_token VARCHAR(128) NOT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_guest_sessions_created_at DEFAULT SYSUTCDATETIME(),
  last_activity_at DATETIME2 NOT NULL CONSTRAINT DF_guest_sessions_last_activity_at DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'carts' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE carts (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  guest_session_id VARCHAR(128) NOT NULL UNIQUE,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_carts_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_carts_updated_at DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cart_items' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE cart_items (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  cart_id VARCHAR(36) NOT NULL,
  menu_item_id VARCHAR(64) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at DATETIME2 NOT NULL CONSTRAINT DF_cart_items_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_cart_items_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cart_item_options' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE cart_item_options (
  cart_item_id VARCHAR(36) NOT NULL,
  menu_item_id VARCHAR(64) NOT NULL,
  option_group_id VARCHAR(64) NOT NULL,
  menu_item_option_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (cart_item_id, option_group_id),
  CONSTRAINT FK_cart_item_options_item FOREIGN KEY (cart_item_id) REFERENCES cart_items(id) ON DELETE CASCADE
);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_cart_items_cart_id')
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_carts_guest_session_id')
CREATE INDEX idx_carts_guest_session_id ON carts(guest_session_id);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'session_create_rate_limits' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE session_create_rate_limits (
  client_key VARCHAR(128) NOT NULL PRIMARY KEY,
  window_start_ms BIGINT NOT NULL,
  request_count INT NOT NULL CHECK (request_count >= 0)
);
