# StoreMom Web - Inventory Management System

A modern web-based inventory management system rebuilt from the original Windows desktop application. Built with Next.js, TypeScript, Bun, and SeraUI components.

## Features

- **Customer Management**: Add, edit, delete, and search customers
- **Product Management**: Manage inventory, pricing, and stock levels
- **Order Management**: Create orders, track sales, and calculate profits
- **Real-time Stock Updates**: Automatic inventory updates on order creation
- **Search & Filter**: Quick search functionality across all modules
- **Modern UI**: Built with SeraUI components and Tailwind CSS
- **Type-safe**: Full TypeScript support
- **Fast**: Powered by Bun runtime

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **UI Components**: SeraUI (shadcn/ui compatible)
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **ORM**: Prisma
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Prerequisites

- **Bun** v1.0.0 or higher ([Installation Guide](https://bun.sh/docs/installation))
- **MySQL** 5.7 or higher
- **Node.js** 18+ (for compatibility)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd storemom-web
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Database

**Option A: Using Existing Database (Recommended if you already have data)**

If you have an existing StoreMom database from the Windows app:

1. Run the migration script to add new columns:
```bash
mysql -u root -p storemom < database/migrate.sql
```

2. Configure your `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` with your database credentials:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/storemom"
```

4. Generate Prisma client:
```bash
bunx prisma generate
```

5. (Optional) Verify schema is in sync:
```bash
bunx prisma db pull
```

**Option B: Creating New Database from Scratch**

1. Create a new MySQL database:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE storemom;
exit;
```

2. Run the schema file:
```bash
mysql -u root -p storemom < database/schema.sql
```

3. Configure your `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/storemom"
```

5. Generate Prisma client:
```bash
bunx prisma generate
```

6. (Optional) Push Prisma schema to database:
```bash
bunx prisma db push
```

### 4. Run Development Server

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
bun run build
bun run start
```

## Prisma Commands

### View Database in Prisma Studio

```bash
bunx prisma studio
```

This opens a visual database browser at [http://localhost:5555](http://localhost:5555)

### Update Prisma Schema from Database

If you make changes directly in MySQL:

```bash
bunx prisma db pull
```

### Format Prisma Schema

```bash
bunx prisma format
```

### Generate Prisma Client (after schema changes)

```bash
bunx prisma generate
```

## Project Structure

```
storemom-web/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── customers/       # Customer CRUD endpoints
│   │   ├── products/        # Product CRUD endpoints
│   │   └── orders/          # Order CRUD endpoints
│   ├── customers/           # Customer management page
│   ├── products/            # Product management page
│   ├── orders/              # Order management page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   └── ui/                  # UI components (SeraUI)
├── lib/                     # Utilities
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Helper functions
├── prisma/                 # Prisma ORM
│   └── schema.prisma       # Database schema definition
├── database/               # Database files
│   ├── schema.sql          # Database schema (for new installations)
│   └── migrate.sql         # Migration script (for existing databases)
├── public/                 # Static files
└── package.json            # Dependencies

```

## API Endpoints

### Customers

- `GET /api/customers` - Get all customers (optional: `?search=name`)
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get single customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Products

- `GET /api/products` - Get all products (optional: `?search=name`)
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders

- `GET /api/orders` - Get all orders (optional: `?customerId=id`)
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order with details
- `PUT /api/orders/[id]` - Update order status
- `DELETE /api/orders/[id]` - Delete order (restores stock)

## Database Schema

### Customer Table
- `id`: Primary key
- `fname`, `lname`: Customer name
- `phone`, `email`, `address`: Contact information
- Timestamps: `created_at`, `updated_at`

### Product Table
- `productId`: Primary key
- `productName`: Product name
- `quantityInStock`: Available inventory
- `price`: Cost price (DECIMAL for precision)
- `volume`: Unit/size description
- `description`: Product details
- Timestamps: `created_at`, `updated_at`

### Orders Table
- `orderId`: Primary key
- `customer_id`: Foreign key to customer
- `totalAmount`: Total order value (DECIMAL)
- `profit`: Calculated profit (DECIMAL)
- `orderDate`: Order timestamp
- `status`: Order status (pending/completed/cancelled)
- Timestamps: `created_at`, `updated_at`

### OrderDetail Table
- `orderDetailId`: Primary key
- `orderId`: Foreign key to orders
- `productId`: Foreign key to product
- `quantityOrdered`: Quantity purchased
- `priceEach`: Selling price (DECIMAL)
- `subtotal`: Calculated (generated column)

## Key Features Explained

### Customer Management
- Full CRUD operations
- Search by name
- Validation prevents deletion if customer has orders

### Product Management
- Inventory tracking
- Low stock highlighting (< 10 items)
- Validation prevents deletion if product is in orders
- Decimal precision for prices

### Order Management
- Multi-item orders
- Automatic stock updates
- Profit calculation (selling price - cost price)
- Order deletion restores inventory
- Transaction-based for data integrity

## Improvements Over Original

✅ **Fixed Data Types**: Uses DECIMAL instead of INT/VARCHAR for money  
✅ **Security**: Prepared statements prevent SQL injection  
✅ **Transaction Safety**: Proper rollback on errors  
✅ **Complete CRUD**: All operations fully implemented  
✅ **Better UX**: Modern, responsive interface  
✅ **Multi-user**: Web-based, accessible from anywhere  
✅ **Validation**: Client and server-side validation  
✅ **Error Handling**: Comprehensive error messages  

## Development

### Adding New Components

SeraUI components are compatible with shadcn/ui. To add components:

```bash
npx seraui@latest add [component-name]
```

Or copy from [SeraUI Documentation](https://seraui.com/docs)

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Server components by default, client components when needed
- API routes follow RESTful conventions

## Troubleshooting

### Database Connection Issues

1. Verify MySQL is running: `mysql.server start` (macOS) or `sudo service mysql start` (Linux)
2. Check credentials in `.env` - make sure `DATABASE_URL` is correct
3. Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`
4. Test Prisma connection: `bunx prisma db pull`

### Prisma Client Not Generated

If you get "Cannot find module '@prisma/client'":

```bash
bunx prisma generate
```

### Schema Out of Sync

If Prisma complains about schema mismatch:

```bash
bunx prisma db push
# or
bunx prisma migrate dev
```

### Port Already in Use

```bash
# Change the port
bun run dev -- -p 3001
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
bun run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects

## Acknowledgments

- Original Windows app: [storeMom](https://github.com/jirananyenlab/storeMom)
- UI Components: [SeraUI](https://seraui.com)
- Framework: [Next.js](https://nextjs.org)
- Runtime: [Bun](https://bun.sh)

---

**Built with ❤️ for small businesses**
