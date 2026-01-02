SELECT * FROM storemom.customer;
SELECT *  FROM customer  where concat(fname," ",lname) like "%x%";

insert into customer value(1,"ประสิทธิ์","-") ;
insert into customer value(2,"ด่อน","-") ;
insert into customer value(3,"อานนท์","จอมพันธ์") ;
insert into customer value(4,"พร","จอมพันธ์") ;
insert into customer value(5,"surut","-");
insert into customer value(6,"montri","-");
insert into customer value(7,"อาหมง","เย็นลับ");
insert into customer value(8,"อาสิทธิ์","เย็นลับ");

-- UPDATE customer
-- SET fname = "surut" 
-- WHERE id=5 ;

-- UPDATE customer
-- SET fname = "montri" 
-- WHERE id=6 ;

-- UPDATE customer
-- SET fname = "อาหมง" 
-- WHERE id=7 ;

-- UPDATE customer
-- SET fname = "k" 
-- WHERE id=9 ;

-- UPDATE customer SET fname="L" WHERE id = (select id from customer where concat(fname," ",lname) like "%%") ;

INSERT INTO product (productId,productName,price) VALUES (1,"ปูนโดโลไมท์",58);
INSERT INTO product (productId,productName,price) VALUES (2,"ยิปซั่มกรีนแคลแมก",155);
INSERT INTO product (productId,productName,price,volume) VALUES (3,"โฟแมกซ์ แมกนีเซียม 300 ",320,"1 ลิตร");
INSERT INTO product (productId,productName,price,volume) VALUES (4,"โฟแมกซ์ แคลเซียมโบรอน 400 ",270,"1 ลิตร");
INSERT INTO product (productId,productName,price,volume) VALUES (5,"ไฮเฟิร์ท - เอ็น",240,"1 ลิตร");
INSERT INTO product (productId,productName,price,volume) VALUES (6,"ฟังกูราน",400,"1000 กรัม");
INSERT INTO product (productId,productName,price) VALUES (7,"ทีเอที",400);

insert into orders (orderId,totalAmount,customer_id,profit) value(1,2400,2,180) ;
-- UPDATE orders
-- SET profit = "180"
-- WHERE orderId=1 ;

insert into orderdetail (orderDetailId,quantityOrdered,priceEach,productId,orderId) value(1,2,350,3,1) ;
insert into orderdetail (orderDetailId,quantityOrdered,priceEach,productId,orderId) value(2,2,300,4,1) ;
insert into orderdetail (orderDetailId,quantityOrdered,priceEach,productId,orderId) value(3,1,260,5,1) ;
insert into orderdetail (orderDetailId,quantityOrdered,priceEach,productId,orderId) value(4,1,420,6,1) ;
insert into orderdetail (orderDetailId,quantityOrdered,priceEach,productId,orderId) value(5,1,420,7,1) ;

SELECT c.fname,p.productName,p.price,o.totalAmount,o.profit ,od.quantityOrdered,od.priceEach 
FROM customer c join orders o on c.id = o.customer_id 
join orderdetail od on od.orderId = o.orderId
join product p on p.productId = od.productId;

insert into orders (orderId,totalAmount,customer_id,profit) value(2,350,3,30) ;
insert into orderdetail (orderDetailId,quantityOrdered,priceEach,productId,orderId) value(6,1,350,3,2) ;

-- commit;
-- rollback;

show variables like 'autocommit' ;
set autocommit = 0;














