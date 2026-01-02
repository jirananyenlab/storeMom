# Database - StoreMom

ไฟล์ SQL สำหรับสร้างและจัดการฐานข้อมูล StoreMom

## ไฟล์

| ไฟล์ | คำอธิบาย |
|------|----------|
| `table.sql` | สร้างตารางฐานข้อมูล (CREATE TABLE) |
| `insert.sql` | ข้อมูลตัวอย่าง (Sample data) |
| `migrate.sql` | Migration script สำหรับปรับโครงสร้างตาราง |

## การใช้งาน

### 1. สร้างตารางใหม่
```sql
source table.sql
```

### 2. เพิ่มข้อมูลตัวอย่าง
```sql
source insert.sql
```

### 3. Migration (ปรับโครงสร้าง)
```sql
source migrate.sql
```

## โครงสร้างตาราง

- **customer** - ข้อมูลลูกค้า
- **product** - ข้อมูลสินค้า
- **orders** - คำสั่งซื้อ
- **orderdetail** - รายละเอียดสินค้าในคำสั่งซื้อ

## Requirements

- MySQL 5.7+ หรือ MariaDB 10.3+
