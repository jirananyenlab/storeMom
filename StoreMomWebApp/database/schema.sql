-- StoreMom Database Schema (Improved)
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS storemom;
USE storemom;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS orderdetail;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS customer;

-- Customer table
CREATE TABLE customer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fname VARCHAR(45) NOT NULL,
  lname VARCHAR(45) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_name (fname, lname)
);

-- Product table  
CREATE TABLE product (
  productId INT AUTO_INCREMENT PRIMARY KEY,
  productName VARCHAR(100) NOT NULL,
  quantityInStock INT DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  sellPrice DECIMAL(10,2) DEFAULT NULL,
  volume VARCHAR(45),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_name (productName)
);

-- Orders table
CREATE TABLE orders (
  orderId INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  totalAmount DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT,
  INDEX idx_order_date (orderDate),
  INDEX idx_customer (customer_id)
);

-- OrderDetail table
CREATE TABLE orderdetail (
  orderDetailId INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantityOrdered INT NOT NULL,
  priceEach DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantityOrdered * priceEach) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES product(productId) ON DELETE RESTRICT,
  INDEX idx_order (orderId),
  INDEX idx_product (productId)
);

-- Insert sample data
INSERT INTO customer (fname, lname, phone, email) VALUES
('John', 'Doe', '081-234-5678', 'john@example.com'),
('Jane', 'Smith', '082-345-6789', 'jane@example.com'),
('สมชาย', 'ใจดี', '083-456-7890', 'somchai@example.com');

INSERT INTO product (productName, quantityInStock, price, volume) VALUES
('ปูนโดโลไมท์', 100, 58.00, '1 ถุง'),
('ยิปซั่มกรีนแคลแมก', 50, 155.00, '1 ถุง'),
('โฟแมกซ์ แมกนีเซียม 300', 30, 320.00, '1 ลิตร'),
('โฟแมกซ์ แคลเซียมโบรอน 400', 25, 270.00, '1 ลิตร'),
('ไฮเฟิร์ท - เอ็น', 40, 240.00, '1 ลิตร'),
('ฟังกูราน', 20, 400.00, '1000 กรัม'),
('ทีเอที', 35, 400.00, '1 ถุง');
