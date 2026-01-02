import { z } from "zod";

// Customer Schema
export const customerSchema = z.object({
  fname: z
    .string()
    .min(1, "กรุณากรอกชื่อ")
    .max(45, "ชื่อต้องไม่เกิน 45 ตัวอักษร"),
  lname: z
    .string()
    .min(1, "กรุณากรอกนามสกุล")
    .max(45, "นามสกุลต้องไม่เกิน 45 ตัวอักษร"),
  phone: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทร")
    .max(20, "เบอร์โทรต้องไม่เกิน 20 ตัวอักษร"),
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .max(100, "อีเมลต้องไม่เกิน 100 ตัวอักษร")
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Product Schema
export const productSchema = z.object({
  productName: z
    .string()
    .min(1, "กรุณากรอกชื่อสินค้า")
    .max(100, "ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร"),
  quantityInStock: z
    .number()
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนต้องไม่ติดลบ"),
  price: z
    .number()
    .min(0, "ราคาต้องไม่ติดลบ"),
  volume: z
    .string()
    .min(1, "กรุณากรอกหน่วย/ปริมาตร")
    .max(45, "หน่วยต้องไม่เกิน 45 ตัวอักษร"),
  description: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Order Item Schema
export const orderItemSchema = z.object({
  productId: z.number().int().positive("กรุณาเลือกสินค้า"),
  quantityOrdered: z
    .number()
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .positive("จำนวนต้องมากกว่า 0"),
  priceEach: z
    .number()
    .positive("ราคาต้องมากกว่า 0"),
});

export type OrderItemFormData = z.infer<typeof orderItemSchema>;

// Order Schema
export const orderSchema = z.object({
  customer_id: z.number().int().positive("กรุณาเลือกลูกค้า"),
  orderDate: z.date().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ"),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// Validation helper function
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  const issues = result.error.issues;
  issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  
  return { success: false, errors };
}
