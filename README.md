# StoreMom

ระบบจัดการร้านค้าและคลังสินค้าสำหรับธุรกิจขนาดเล็ก

## โครงสร้างโปรเจค

```
StoreMom/
├── StoreMomWebApp/        # Web Application (Next.js)
├── StoreMomWindowsApp/    # Desktop Application (Java Swing)
└── db/                    # Database Scripts
```

## Applications

### 1. StoreMom Web App
Web Application สำหรับจัดการร้านค้าผ่าน Browser

**Tech Stack:**
- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Prisma ORM + MariaDB
- Bun Runtime

**Features:**
- Dashboard สรุปข้อมูลร้านค้า
- จัดการลูกค้า, สินค้า, คำสั่งซื้อ
- สรุปยอดขายรายเดือน (เลือกเดือน/ปีได้)
- สินค้าขายดี Top 5
- Server-side Pagination
- Dark/Light Theme
- Responsive Design

[ดูรายละเอียด →](./StoreMomWebApp/README.md)

---

### 2. StoreMom Windows App
Desktop Application สำหรับ Windows

**Tech Stack:**
- Java + Swing

**Features:**
- จัดการลูกค้า, สินค้า, คำสั่งซื้อ
- รายงานยอดขาย

[ดูรายละเอียด →](./StoreMomWindowsApp/README.md)

---

### 3. Database
SQL Scripts สำหรับสร้างและจัดการฐานข้อมูล

**Files:**
- `table.sql` - สร้างตาราง
- `insert.sql` - ข้อมูลตัวอย่าง
- `migrate.sql` - Migration script

[ดูรายละเอียด →](./db/README.md)

---

## Quick Start

### 1. ตั้งค่าฐานข้อมูล

```bash
cd db
mysql -u root -p < table.sql
mysql -u root -p < insert.sql
```

### 2. รัน Web App

```bash
cd StoreMomWebApp
bun install
cp .env.example .env
# แก้ไข .env ตั้งค่า DATABASE_URL
bunx prisma generate
bun run dev
```

เปิด http://localhost:3000

### 3. รัน Windows App

เปิดโปรเจค `StoreMomWindowsApp` ใน Java IDE แล้วรัน

---

## Database Schema

```
┌─────────────┐     ┌─────────────┐
│  customer   │     │   product   │
├─────────────┤     ├─────────────┤
│ id          │     │ productId   │
│ fname       │     │ productName │
│ lname       │     │ price       │
│ phone       │     │ quantity    │
│ email       │     │ volume      │
│ address     │     │ description │
└─────────────┘     └─────────────┘
       │                   │
       │    ┌──────────┐   │
       └────│  orders  │───┘
            ├──────────┤
            │ orderId  │
            │ customerId
            │ totalAmount
            │ profit   │
            │ status   │
            └──────────┘
                 │
         ┌──────────────┐
         │ orderdetail  │
         ├──────────────┤
         │ orderId      │
         │ productId    │
         │ quantity     │
         │ priceEach    │
         └──────────────┘
```

---

## License

MIT

## Author

jirananyenlab
