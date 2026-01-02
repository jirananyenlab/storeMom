-- 02-insert.sql - Insert sample data
USE storemom;

-- Insert customers
INSERT INTO customer (id, fname, lname) VALUES (1, 'ประสิทธิ์', '-');
INSERT INTO customer (id, fname, lname) VALUES (2, 'ด่อน', '-');
INSERT INTO customer (id, fname, lname) VALUES (3, 'อานนท์', 'จอมพันธ์');
INSERT INTO customer (id, fname, lname) VALUES (4, 'พร', 'จอมพันธ์');
INSERT INTO customer (id, fname, lname) VALUES (5, 'surut', '-');
INSERT INTO customer (id, fname, lname) VALUES (6, 'montri', '-');
INSERT INTO customer (id, fname, lname) VALUES (7, 'อาหมง', 'เย็นลับ');
INSERT INTO customer (id, fname, lname) VALUES (8, 'อาสิทธิ์', 'เย็นลับ');

-- Insert products
INSERT INTO product (productId, productName, price, volume, quantityInStock) VALUES (1, 'ปูนโดโลไมท์', 58, NULL, 100);
INSERT INTO product (productId, productName, price, volume, quantityInStock) VALUES (2, 'ยิปซั่มกรีนแคลแมก', 155, NULL, 50);
INSERT INTO product (productId, productName, price, volume, quantityInStock) VALUES (3, 'โฟแมกซ์ แมกนีเซียม 300', 320, '1 ลิตร', 30);
INSERT INTO product (productId, productName, price, volume, quantityInStock) VALUES (4, 'โฟแมกซ์ แคลเซียมโบรอน 400', 270, '1 ลิตร', 25);
INSERT INTO product (productId, productName, price, volume, quantityInStock) VALUES (5, 'ไฮเฟิร์ท - เอ็น', 240, '1 ลิตร', 40);
INSERT INTO product (productId, productName, price, volume, quantityInStock) VALUES (6, 'ฟังกูราน', 400, '1000 กรัม', 20);
INSERT INTO product (productId, productName, price, volume, quantityInStock) VALUES (7, 'ทีเอที', 400, NULL, 15);

-- Insert sample orders
INSERT INTO orders (orderId, totalAmount, customer_id, orderDate, profit) VALUES (1, 2400, 2, NOW(), '180');
INSERT INTO orders (orderId, totalAmount, customer_id, orderDate, profit) VALUES (2, 350, 3, NOW(), '30');

-- Insert order details
INSERT INTO orderdetail (orderDetailId, quantityOrdered, priceEach, productId, orderId) VALUES (1, 2, 350, 3, 1);
INSERT INTO orderdetail (orderDetailId, quantityOrdered, priceEach, productId, orderId) VALUES (2, 2, 300, 4, 1);
INSERT INTO orderdetail (orderDetailId, quantityOrdered, priceEach, productId, orderId) VALUES (3, 1, 260, 5, 1);
INSERT INTO orderdetail (orderDetailId, quantityOrdered, priceEach, productId, orderId) VALUES (4, 1, 420, 6, 1);
INSERT INTO orderdetail (orderDetailId, quantityOrdered, priceEach, productId, orderId) VALUES (5, 1, 420, 7, 1);
INSERT INTO orderdetail (orderDetailId, quantityOrdered, priceEach, productId, orderId) VALUES (6, 1, 350, 3, 2);
