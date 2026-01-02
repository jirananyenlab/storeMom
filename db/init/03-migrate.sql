-- 03-migrate.sql - Migration script to update existing StoreMom database
-- Adds new columns and indexes required by the web application

USE storemom;

-- Safely add new columns to customer table
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'customer' AND COLUMN_NAME = 'phone');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE customer ADD COLUMN phone VARCHAR(20) NULL AFTER lname', 
  'SELECT "Column phone already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'customer' AND COLUMN_NAME = 'email');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE customer ADD COLUMN email VARCHAR(100) NULL AFTER lname', 
  'SELECT "Column email already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'customer' AND COLUMN_NAME = 'address');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE customer ADD COLUMN address TEXT NULL AFTER lname', 
  'SELECT "Column address already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'customer' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE customer ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER lname', 
  'SELECT "Column created_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'customer' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE customer ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER lname', 
  'SELECT "Column updated_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on customer name
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'customer' AND INDEX_NAME = 'idx_customer_name');
SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_customer_name ON customer(fname, lname)', 
  'SELECT "Index idx_customer_name already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update product table - change price to DECIMAL
ALTER TABLE product 
  MODIFY COLUMN price DECIMAL(10,2) NOT NULL;

-- Safely add new columns to product table
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'product' AND COLUMN_NAME = 'description');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE product ADD COLUMN description TEXT NULL AFTER volume', 
  'SELECT "Column description already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'product' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE product ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER volume', 
  'SELECT "Column created_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'product' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE product ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER volume', 
  'SELECT "Column updated_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on product name
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'product' AND INDEX_NAME = 'idx_product_name');
SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_product_name ON product(productName)', 
  'SELECT "Index idx_product_name already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update product name column to allow longer names
ALTER TABLE product 
  MODIFY COLUMN productName VARCHAR(100) NOT NULL;

-- Update orders table - change totalAmount and profit to DECIMAL
ALTER TABLE orders 
  MODIFY COLUMN totalAmount DECIMAL(10,2) DEFAULT 0,
  MODIFY COLUMN profit DECIMAL(10,2) DEFAULT 0;

-- Safely add new columns to orders table
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'status');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT "pending" AFTER profit', 
  'SELECT "Column status already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER profit', 
  'SELECT "Column created_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER profit', 
  'SELECT "Column updated_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes on orders
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_order_date');
SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_order_date ON orders(orderDate)', 
  'SELECT "Index idx_order_date already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_customer');
SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_customer ON orders(customer_id)', 
  'SELECT "Index idx_customer already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update orderdetail table - change priceEach to DECIMAL
ALTER TABLE orderdetail 
  MODIFY COLUMN priceEach DECIMAL(10,2) NOT NULL;

-- Safely add created_at to orderdetail
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orderdetail' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE orderdetail ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 
  'SELECT "Column created_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes on orderdetail
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orderdetail' AND INDEX_NAME = 'idx_order');
SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_order ON orderdetail(orderId)', 
  'SELECT "Index idx_order already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'storemom' AND TABLE_NAME = 'orderdetail' AND INDEX_NAME = 'idx_product');
SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_product ON orderdetail(productId)', 
  'SELECT "Index idx_product already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Set default value for orderDate if NULL
UPDATE orders SET orderDate = NOW() WHERE orderDate IS NULL;

-- Set default value for quantityInStock if NULL
UPDATE product SET quantityInStock = 0 WHERE quantityInStock IS NULL;

SELECT 'Migration completed successfully!' as status;
