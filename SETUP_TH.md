# คู่มือติดตั้ง StoreMom Web (ภาษาไทย)

## ขั้นตอนการติดตั้งสำหรับผู้ใช้ที่มีฐานข้อมูลเดิมอยู่แล้ว

หากคุณมีฐานข้อมูล StoreMom จากโปรแกรม Windows เดิมอยู่แล้ว ทำตามขั้นตอนเหล่านี้:

### 1. ติดตั้ง Dependencies

```bash
bun install
```

### 2. เพิ่มคอลัมน์ใหม่ในฐานข้อมูลเดิม

รันไฟล์ migration เพื่อเพิ่มคอลัมน์ใหม่ (phone, email, address, timestamps):

```bash
mysql -u root -p storemom < database/migrate.sql
```

> **หมายเหตุ**: ไฟล์นี้จะเพิ่มคอลัมน์ใหม่เท่านั้น ข้อมูลเดิมของคุณจะไม่สูญหาย

### 3. สร้างไฟล์ `.env`

คัดลอกไฟล์ตัวอย่าง:

```bash
cp .env.example .env
```

### 4. แก้ไขไฟล์ `.env`

เปิดไฟล์ `.env` และใส่รหัสผ่าน MySQL ของคุณ:

```env
DATABASE_URL="mysql://root:รหัสผ่านของคุณ@localhost:3306/storemom"
```

**ตัวอย่าง**:
- ถ้ารหัสผ่านคือ `password123`:
  ```env
  DATABASE_URL="mysql://root:password123@localhost:3306/storemom"
  ```
- ถ้าไม่มีรหัสผ่าน (ไม่แนะนำ):
  ```env
  DATABASE_URL="mysql://root@localhost:3306/storemom"
  ```

### 5. สร้าง Prisma Client

```bash
bunx prisma generate
```

### 6. (ไม่บังคับ) ตรวจสอบว่าฐานข้อมูลพร้อมใช้งาน

```bash
bunx prisma db pull
```

คำสั่งนี้จะดึงข้อมูลโครงสร้างจากฐานข้อมูลของคุณมาตรวจสอบ

### 7. รันเว็บแอปพลิเคชัน

```bash
bun run dev
```

เปิดเบราว์เซอร์ที่: [http://localhost:3000](http://localhost:3000)

---

## ขั้นตอนการติดตั้งสำหรับผู้ใช้ใหม่ (ไม่มีฐานข้อมูล)

หากคุณยังไม่มีฐานข้อมูล:

### 1. ติดตั้ง Dependencies

```bash
bun install
```

### 2. สร้างฐานข้อมูล

เปิด MySQL และสร้างฐานข้อมูล:

```bash
mysql -u root -p
```

ใน MySQL prompt:

```sql
CREATE DATABASE storemom;
exit;
```

### 3. นำเข้าโครงสร้างฐานข้อมูล

```bash
mysql -u root -p storemom < database/schema.sql
```

### 4. สร้างและแก้ไขไฟล์ `.env`

```bash
cp .env.example .env
```

แก้ไขไฟล์:

```env
DATABASE_URL="mysql://root:รหัสผ่านของคุณ@localhost:3306/storemom"
```

### 5. สร้าง Prisma Client

```bash
bunx prisma generate
```

### 6. รันเว็บแอปพลิเคชัน

```bash
bun run dev
```

---

## คำสั่งที่มีประโยชน์

### ดูฐานข้อมูลด้วย Prisma Studio

```bash
bunx prisma studio
```

จะเปิดหน้าต่างเบราว์เซอร์ที่ [http://localhost:5555](http://localhost:5555) ให้คุณดูและแก้ไขข้อมูลได้

### อัพเดท Schema หลังจากแก้ไขฐานข้อมูลด้วย MySQL

```bash
bunx prisma db pull
```

### สร้าง Prisma Client ใหม่หลังแก้ไข Schema

```bash
bunx prisma generate
```

---

## การแก้ปัญหา

### เชื่อมต่อฐานข้อมูลไม่ได้

1. ตรวจสอบว่า MySQL กำลังทำงานอยู่
2. ตรวจสอบรหัสผ่านใน `.env` ให้ถูกต้อง
3. ตรวจสอบว่าฐานข้อมูล `storemom` มีอยู่จริง

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### ไม่เจอ Prisma Client

ถ้าเจอข้อผิดพลาด "Cannot find module '@prisma/client'":

```bash
bunx prisma generate
```

### Schema ไม่ตรงกัน

ถ้า Prisma บอกว่า schema ไม่ตรงกับฐานข้อมูล:

```bash
bunx prisma db push
```

---

## ความแตกต่างจากโปรแกรมเดิม

✅ **ใช้งานผ่านเว็บ**: เข้าถึงได้จากหลายเครื่อง  
✅ **UI สมัยใหม่**: ใช้งานง่าย ตอบสนองเร็ว  
✅ **Type-safe**: ลดข้อผิดพลาดด้วย TypeScript และ Prisma  
✅ **Transaction Safety**: ข้อมูลปลอดภัยกว่า มีการ rollback เมื่อเกิดข้อผิดพลาด  
✅ **เพิ่มฟีเจอร์**: เพิ่มข้อมูลลูกค้า (เบอร์โทร, อีเมล, ที่อยู่)  
✅ **ประเภทข้อมูลถูกต้อง**: ใช้ DECIMAL สำหรับราคา ไม่ใช่ INT  

---

**สร้างด้วย ❤️ สำหรับธุรกิจขนาดเล็ก**
