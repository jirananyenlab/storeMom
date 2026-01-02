"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, Package, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";

interface Customer {
  id: number;
  fname: string;
  lname: string;
}

interface Product {
  productId: number;
  productName: string;
  quantityInStock: number;
  price: number;
  volume?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantityOrdered: number;
  originalPrice: number;
  priceEach: number;
  subtotal: number;
}

interface Order {
  orderId: number;
  customerName: string;
  totalAmount: number;
  profit: number;
  orderDate: string;
  status: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form states
  const [customerId, setCustomerId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal states
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [editingStatusOrder, setEditingStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    // Fetch customers for dropdown
    fetch("/api/customers?limit=1000")
      .then((res) => res.json())
      .then((result) => {
        setCustomers(result.data ? result.data : (Array.isArray(result) ? result : []));
      })
      .catch(() => {
        toast.error("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
        });
      });

    // Fetch products for dropdown
    fetch("/api/products?limit=1000")
      .then((res) => res.json())
      .then((result) => {
        setProducts(result.data ? result.data : (Array.isArray(result) ? result : []));
      })
      .catch(() => {
        toast.error("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
        });
      });
  }, []);

  useEffect(() => {
    // Fetch orders with pagination
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', itemsPerPage.toString());

        const response = await fetch(`/api/orders?${params.toString()}`);
        const result = await response.json();
        
        if (result.data) {
          setOrders(result.data);
          setTotalItems(result.pagination.total);
          setTotalPages(result.pagination.totalPages);
        } else {
          setOrders(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถโหลดข้อมูลออเดอร์ได้",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, itemsPerPage]);

  // Refetch orders
  const refetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', itemsPerPage.toString());

      const response = await fetch(`/api/orders?${params.toString()}`);
      const result = await response.json();
      
      if (result.data) {
        setOrders(result.data);
        setTotalItems(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } else {
        setOrders(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูลออเดอร์ได้",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch products
  const refetchProducts = async () => {
    try {
      const response = await fetch("/api/products?limit=1000");
      const result = await response.json();
      setProducts(result.data ? result.data : (Array.isArray(result) ? result : []));
    } catch (error) {
      // Silent fail for products refetch
    }
  };

  // Add item to order
  const addItem = () => {
    setFormErrors({});

    if (!selectedProduct) {
      setFormErrors({ product: "กรุณาเลือกสินค้า" });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (!quantity || quantityNum <= 0) {
      setFormErrors({ quantity: "กรุณากรอกจำนวนที่ถูกต้อง" });
      return;
    }

    const priceNum = parseFloat(sellingPrice);
    if (!sellingPrice || priceNum < 0) {
      setFormErrors({ price: "กรุณากรอกราคาขายที่ถูกต้อง" });
      return;
    }

    const product = products.find(
      (p) => p.productId.toString() === selectedProduct
    );
    if (!product) return;

    const existingItem = orderItems.find((i) => i.productId === product.productId);
    const alreadyInCart = existingItem ? existingItem.quantityOrdered : 0;

    if (quantityNum + alreadyInCart > product.quantityInStock) {
      setFormErrors({
        quantity: `สต็อกไม่พอ (เหลือ ${product.quantityInStock - alreadyInCart} ชิ้น)`,
      });
      return;
    }

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                quantityOrdered: item.quantityOrdered + quantityNum,
                priceEach: priceNum,
                subtotal: (item.quantityOrdered + quantityNum) * priceNum,
              }
            : item
        )
      );
    } else {
      const item: OrderItem = {
        productId: product.productId,
        productName: product.productName,
        quantityOrdered: quantityNum,
        originalPrice: product.price,
        priceEach: priceNum,
        subtotal: quantityNum * priceNum,
      };
      setOrderItems([...orderItems, item]);
    }

    setSelectedProduct("");
    setQuantity("");
    setOriginalPrice("");
    setSellingPrice("");
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!customerId) {
      setFormErrors({ customer: "กรุณาเลือกลูกค้า" });
      return;
    }

    if (orderItems.length === 0) {
      setFormErrors({ items: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          orderDate: new Date().toISOString(),
          status: paymentStatus,
          items: orderItems.map((item) => ({
            productId: item.productId,
            quantityOrdered: item.quantityOrdered,
            priceEach: item.priceEach,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("สร้างออเดอร์สำเร็จ", {
        description: "ออเดอร์ใหม่ถูกบันทึกเรียบร้อยแล้ว",
      });

      setCustomerId("");
      setOrderItems([]);
      setPaymentStatus("pending");
      refetchOrders();
      refetchProducts();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถสร้างออเดอร์ได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // View order detail
  const handleRowClick = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.orderId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
        setIsDetailDialogOpen(true);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดรายละเอียดออเดอร์ได้",
      });
    }
  };

  // Open detail dialog
  const openDetailDialog = async (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await fetch(`/api/orders/${order.orderId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
        setIsDetailDialogOpen(true);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดรายละเอียดออเดอร์ได้",
      });
    }
  };

  // Open status edit dialog
  const openStatusDialog = (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingStatusOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  // Update order status
  const handleUpdateStatus = async () => {
    if (!editingStatusOrder) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${editingStatusOrder.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("อัพเดทสถานะสำเร็จ", {
        description: `เปลี่ยนสถานะเป็น "${getStatusText(newStatus)}" เรียบร้อยแล้ว`,
      });

      setIsStatusDialogOpen(false);
      setEditingStatusOrder(null);
      refetchOrders();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถอัพเดทสถานะได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const openDeleteDialog = (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingOrder(order);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingOrder) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${deletingOrder.orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("ลบสำเร็จ", {
        description: "ลบออเดอร์เรียบร้อยแล้ว (สต็อกถูกคืนแล้ว)",
      });

      setIsDeleteDialogOpen(false);
      setDeletingOrder(null);
      refetchOrders();
      refetchProducts();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถลบออเดอร์ได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "จ่ายแล้ว";
      case "pending":
        return "ยังไม่จ่าย";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCost = orderItems.reduce((sum, item) => sum + (item.originalPrice * item.quantityOrdered), 0);
  const estimatedProfit = totalAmount - totalCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">จัดการออเดอร์</h1>
        <p className="text-muted-foreground">สร้างและจัดการคำสั่งซื้อ</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form - Left Side */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>สร้างออเดอร์ใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Select */}
              <div className="space-y-2">
                <Label>
                  ลูกค้า <span className="text-destructive">*</span>
                </Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className={formErrors.customer ? "border-destructive" : ""}>
                    <SelectValue placeholder="เลือกลูกค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.fname} {customer.lname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.customer && (
                  <p className="text-xs text-destructive">{formErrors.customer}</p>
                )}
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <Label>
                  สถานะการจ่ายเงิน <span className="text-destructive">*</span>
                </Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">ยังไม่จ่าย</SelectItem>
                    <SelectItem value="completed">จ่ายแล้ว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">เพิ่มสินค้า</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>สินค้า</Label>
                    <Select
                      value={selectedProduct}
                      onValueChange={(value) => {
                        setSelectedProduct(value);
                        const product = products.find(
                          (p) => p.productId.toString() === value
                        );
                        if (product) {
                          setOriginalPrice(product.price.toString());
                          setSellingPrice(product.price.toString());
                        }
                      }}
                    >
                      <SelectTrigger className={formErrors.product ? "border-destructive" : ""}>
                        <SelectValue placeholder="เลือกสินค้า" />
                      </SelectTrigger>
                      <SelectContent>
                        {products
                          .filter((p) => p.quantityInStock > 0)
                          .map((product) => (
                            <SelectItem
                              key={product.productId}
                              value={product.productId.toString()}
                            >
                              {product.productName} (สต็อก: {product.quantityInStock})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {formErrors.product && (
                      <p className="text-xs text-destructive">{formErrors.product}</p>
                    )}
                  </div>

                  {/* Original Price - Read Only */}
                  <div className="space-y-2">
                    <Label>ราคาสินค้า (฿)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>จำนวน</Label>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className={formErrors.quantity ? "border-destructive" : ""}
                      />
                      {formErrors.quantity && (
                        <p className="text-xs text-destructive">{formErrors.quantity}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>ราคาขาย (฿)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        className={formErrors.price ? "border-destructive" : ""}
                      />
                      {formErrors.price && (
                        <p className="text-xs text-destructive">{formErrors.price}</p>
                      )}
                    </div>
                  </div>

                  <Button type="button" variant="outline" onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มรายการ
                  </Button>
                </div>
              </div>

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">รายการสินค้า</h3>
                  <div className="space-y-2 mb-3">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted-foreground">
                            {item.quantityOrdered} × ฿{formatPrice(item.priceEach)}
                            <span className="text-xs ml-1">(ทุน: ฿{formatPrice(item.originalPrice)})</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">฿{formatPrice(item.subtotal)}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>ต้นทุน:</span>
                      <span>฿{formatPrice(totalCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>รวม:</span>
                      <span className="text-primary">฿{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>กำไร:</span>
                      <span className={estimatedProfit < 0 ? "text-destructive font-semibold" : "text-green-600 font-semibold"}>
                        ฿{formatPrice(estimatedProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {formErrors.items && (
                <p className="text-xs text-destructive">{formErrors.items}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!customerId || orderItems.length === 0 || submitting}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {submitting ? "กำลังบันทึก..." : "สร้างออเดอร์"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table - Right Side */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>รายการออเดอร์</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                กำลังโหลด...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ไม่มีออเดอร์</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>ลูกค้า</TableHead>
                        <TableHead>วันที่</TableHead>
                        <TableHead className="text-right">ยอดรวม</TableHead>
                        <TableHead className="text-right">กำไร</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead className="w-[100px]">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order.orderId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(order)}
                        >
                          <TableCell className="font-medium">#{order.orderId}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell className="text-right">
                            ฿{formatPrice(order.totalAmount)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${order.profit < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                            ฿{formatPrice(order.profit)}
                          </TableCell>
                          <TableCell>
                            <button
                              className={`text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80 ${getStatusBadge(order.status)}`}
                              onClick={(e) => openStatusDialog(order, e)}
                            >
                              {getStatusText(order.status)}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openDetailDialog(order, e)}
                                title="ดูรายละเอียด"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openDeleteDialog(order, e)}
                                title="ลบ"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">แสดง</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(parseInt(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      จาก {totalItems} รายการ
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      หน้า {currentPage} / {totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>รายละเอียดออเดอร์ #{selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>
              {selectedOrder?.customerName} - {selectedOrder && formatDate(selectedOrder.orderDate)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">สถานะการจ่ายเงิน</span>
                <button
                  className={`text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80 ${getStatusBadge(selectedOrder.status)}`}
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    openStatusDialog(selectedOrder);
                  }}
                >
                  {getStatusText(selectedOrder.status)}
                </button>
              </div>

              <div className="border rounded-lg divide-y">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantityOrdered} × ฿{formatPrice(item.priceEach)}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">฿{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ยอดรวม</span>
                  <span className="font-bold text-lg">
                    ฿{formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">กำไร</span>
                  <span className={`font-semibold ${selectedOrder.profit < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                    ฿{formatPrice(selectedOrder.profit)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Edit Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขสถานะการจ่ายเงิน</DialogTitle>
            <DialogDescription>
              ออเดอร์ #{editingStatusOrder?.orderId} - {editingStatusOrder?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>สถานะ</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">ยังไม่จ่าย</SelectItem>
                <SelectItem value="completed">จ่ายแล้ว</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdateStatus} disabled={submitting}>
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณต้องการลบออเดอร์ #{deletingOrder?.orderId} ใช่หรือไม่?
              สต็อกสินค้าจะถูกคืนกลับโดยอัตโนมัติ
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "กำลังลบ..." : "ลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
