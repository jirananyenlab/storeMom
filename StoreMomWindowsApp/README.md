# StoreMom Windows Application

แอปพลิเคชัน Java Swing สำหรับจัดการร้านค้า (Desktop Application)

## Tech Stack

- **Language:** Java
- **UI Framework:** Swing
- **Database:** MySQL / MariaDB

## โครงสร้างโปรเจค

```
StoreMomWindowsApp/
├── src/           # Source code
├── lib/           # Libraries (JAR files)
└── out/           # Compiled classes
```

## การรัน

### ผ่าน IDE (IntelliJ IDEA / Eclipse)
1. เปิดโปรเจคใน IDE
2. เพิ่ม lib/*.jar เป็น dependencies
3. รัน Main class

### ผ่าน Command Line
```bash
java -cp "out;lib/*" Main
```

## Features

- จัดการลูกค้า
- จัดการสินค้า
- จัดการคำสั่งซื้อ
- รายงานยอดขาย

## Requirements

- Java 8 หรือสูงกว่า
- MySQL / MariaDB

## License

MIT
