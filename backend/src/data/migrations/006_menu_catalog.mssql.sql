IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE categories (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name NVARCHAR(100) NOT NULL UNIQUE,
  sort_order INT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_categories_created_at DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'menu_items' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE menu_items (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  category_id VARCHAR(64) NOT NULL,
  name NVARCHAR(200) NOT NULL,
  image_url NVARCHAR(500) NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BIT NOT NULL CONSTRAINT DF_menu_items_is_active DEFAULT 1,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_menu_items_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_menu_items_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_menu_items_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'menu_item_option_groups' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE menu_item_option_groups (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  menu_item_id VARCHAR(64) NOT NULL,
  name NVARCHAR(100) NOT NULL,
  is_required BIT NOT NULL CONSTRAINT DF_menu_item_option_groups_is_required DEFAULT 1,
  sort_order INT NULL,
  CONSTRAINT FK_menu_item_option_groups_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'menu_item_options' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE menu_item_options (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  menu_item_id VARCHAR(64) NOT NULL,
  option_group_id VARCHAR(64) NOT NULL,
  name NVARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10,2) NOT NULL CONSTRAINT DF_menu_item_options_price_adjustment DEFAULT 0,
  is_active BIT NOT NULL CONSTRAINT DF_menu_item_options_is_active DEFAULT 1,
  CONSTRAINT FK_menu_item_options_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  -- NO ACTION on group: SQL Server rejects dual CASCADE paths (item→options and item→groups→options).
  CONSTRAINT FK_menu_item_options_group FOREIGN KEY (option_group_id) REFERENCES menu_item_option_groups(id)
);

IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-1')
INSERT INTO categories (id, name, sort_order, created_at) VALUES
('cat-1', N'主餐', 1, '2026-10-01T00:00:00'),
('cat-2', N'輕食', 2, '2026-10-01T00:00:00'),
('cat-3', N'飲品', 3, '2026-10-01T00:00:00');

IF NOT EXISTS (SELECT 1 FROM menu_items WHERE id = 'item-1')
INSERT INTO menu_items (id, category_id, name, image_url, price, is_active, created_at, updated_at) VALUES
('item-1', 'cat-1', N'香蒜嫩雞', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 220.00, 1, '2026-10-01T00:00:00', '2026-10-01T00:00:00'),
('item-2', 'cat-1', N'海鮮義大利麵', NULL, 260.00, 1, '2026-10-01T00:00:00', '2026-10-01T00:00:00'),
('item-3', 'cat-2', N'田園沙拉', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80', 180.00, 1, '2026-10-01T00:00:00', '2026-10-01T00:00:00'),
('item-4', 'cat-3', N'檸檬氣泡水', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80', 85.00, 1, '2026-10-01T00:00:00', '2026-10-01T00:00:00');

IF NOT EXISTS (SELECT 1 FROM menu_item_option_groups WHERE id = 'group-1')
INSERT INTO menu_item_option_groups (id, menu_item_id, name, is_required, sort_order) VALUES
('group-1', 'item-1', N'烹調方式', 1, 1),
('group-2', 'item-1', N'附餐', 1, 2),
('group-3', 'item-2', N'麵體', 1, 1);

IF NOT EXISTS (SELECT 1 FROM menu_item_options WHERE id = 'opt-1')
INSERT INTO menu_item_options (id, menu_item_id, option_group_id, name, price_adjustment, is_active) VALUES
('opt-1', 'item-1', 'group-1', N'原味', 0.00, 1),
('opt-2', 'item-1', 'group-1', N'辣香', 10.00, 1),
('opt-3', 'item-1', 'group-1', N'黑胡椒', 15.00, 1),
('opt-9', 'item-1', 'group-1', N'暫停販售', 99.00, 0),
('opt-4', 'item-1', 'group-2', N'無附餐', 0.00, 1),
('opt-5', 'item-1', 'group-2', N'馬鈴薯', 20.00, 1),
('opt-6', 'item-1', 'group-2', N'沙拉', 30.00, 1),
('opt-7', 'item-2', 'group-3', N'細麵', 0.00, 1),
('opt-8', 'item-2', 'group-3', N'筆管麵', 5.00, 1);
