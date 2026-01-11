-- Add sellPrice column to product table
-- Run this migration to add the sellPrice column

ALTER TABLE product 
ADD COLUMN sellPrice DECIMAL(10,2) DEFAULT NULL AFTER price;

-- Optional: Update existing products to set sellPrice = price
UPDATE product SET sellPrice = price WHERE sellPrice IS NULL;
