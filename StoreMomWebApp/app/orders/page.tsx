"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, Package, X, Eye, ChevronLeft, ChevronRight, ShoppingBag, Receipt, Pencil, Filter } from "lucide-react";
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
import { CustomerSelect } from "@/components/customer-select";
import { ProductSelect } from "@/components/product-select";
import { ProductMultiSelect } from "@/components/product-multi-select";

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
  customer_id?: number;
  customerName: string;
  totalAmount: number;
  profit: number;
  orderDate: string;
  status: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCustomerId, setFilterCustomerId] = useState("");
  const [filterProductIds, setFilterProductIds] = useState<string[]>([]);

  // Form states
  const [customerId, setCustomerId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductData, setSelectedProductData] = useState<Product | null>(null);
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [editingStatusOrder, setEditingStatusOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [editCustomerId, setEditCustomerId] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");

  // Edit order items states
  const [editOrderItems, setEditOrderItems] = useState<OrderItem[]>([]);
  const [editSelectedProduct, setEditSelectedProduct] = useState("");
  const [editSelectedProductData, setEditSelectedProductData] = useState<Product | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch orders with pagination and filters
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', itemsPerPage.toString());
        if (filterStatus && filterStatus !== "all") {
          params.set('status', filterStatus);
        }
        if (filterCustomerId) {
          params.set('customerId', filterCustomerId);
        }
        if (filterProductIds.length > 0) {
          params.set('productIds', filterProductIds.join(','));
        }

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
  }, [currentPage, itemsPerPage, filterStatus, filterCustomerId, filterProductIds]);

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

  // Add item to order
  const addItem = () => {
    setFormErrors({});

    if (!selectedProduct || !selectedProductData) {
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

    const product = selectedProductData;

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
    setSelectedProductData(null);
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

  // Open edit dialog
  const openEditDialog = async (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await fetch(`/api/orders/${order.orderId}`);
      if (response.ok) {
        const data = await response.json();
        setEditingOrder(data);
        setEditCustomerId(data.customer_id?.toString() || "");
        setEditPaymentStatus(data.status);
        // Load order items for editing
        if (data.items) {
          setEditOrderItems(data.items.map((item: OrderItem) => ({
            ...item,
            subtotal: item.priceEach * item.quantityOrdered
          })));
        } else {
          setEditOrderItems([]);
        }
        setEditSelectedProduct("");
        setEditQuantity("");
        setEditOriginalPrice("");
        setEditSellingPrice("");
        setEditFormErrors({});
        setIsEditDialogOpen(true);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูลออเดอร์ได้",
      });
    }
  };

  // Add item to edit order
  const addEditItem = () => {
    setEditFormErrors({});

    if (!editSelectedProduct || !editSelectedProductData) {
      setEditFormErrors({ product: "กรุณาเลือกสินค้า" });
      return;
    }

    const quantityNum = parseInt(editQuantity);
    if (!editQuantity || quantityNum <= 0) {
      setEditFormErrors({ quantity: "กรุณากรอกจำนวนที่ถูกต้อง" });
      return;
    }

    const priceNum = parseFloat(editSellingPrice);
    if (!editSellingPrice || priceNum < 0) {
      setEditFormErrors({ price: "กรุณากรอกราคาขายที่ถูกต้อง" });
      return;
    }

    const product = editSelectedProductData;

    const existingItem = editOrderItems.find((i) => i.productId === product.productId);
    const alreadyInCart = existingItem ? existingItem.quantityOrdered : 0;
    
    // Check current order's original quantity for this product
    const originalItem = editingOrder?.items?.find((i: OrderItem) => i.productId === product.productId);
    const originalQty = originalItem ? originalItem.quantityOrdered : 0;
    const availableStock = product.quantityInStock + originalQty;

    if (quantityNum + alreadyInCart > availableStock) {
      setEditFormErrors({
        quantity: `สต็อกไม่พอ (เหลือ ${availableStock - alreadyInCart} ชิ้น)`,
      });
      return;
    }

    if (existingItem) {
      setEditOrderItems(
        editOrderItems.map((item) =>
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
      setEditOrderItems([...editOrderItems, item]);
    }

    setEditSelectedProduct("");
    setEditSelectedProductData(null);
    setEditQuantity("");
    setEditOriginalPrice("");
    setEditSellingPrice("");
  };

  // Remove item from edit order
  const removeEditItem = (index: number) => {
    setEditOrderItems(editOrderItems.filter((_, i) => i !== index));
  };

  // Handle edit order
  const handleEditOrder = async () => {
    if (!editingOrder) return;

    if (editOrderItems.length === 0) {
      setEditFormErrors({ items: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${editingOrder.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: editPaymentStatus,
          customerId: parseInt(editCustomerId),
          items: editOrderItems.map((item) => ({
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

      toast.success("แก้ไขสำเร็จ", {
        description: "แก้ไขออเดอร์เรียบร้อยแล้ว",
      });

      setIsEditDialogOpen(false);
      setEditingOrder(null);
      refetchOrders();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถแก้ไขออเดอร์ได้",
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
        return "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25";
      case "pending":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25";
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            จัดการออเดอร์
          </h1>
          <p className="text-muted-foreground mt-1">สร้างและจัดการคำสั่งซื้อ</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form - Left Side */}
        <Card className="lg:col-span-1 border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-100 dark:border-orange-900/30">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-600" />
              สร้างออเดอร์ใหม่
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Select */}
              <div className="space-y-2">
                <Label>
                  ลูกค้า <span className="text-destructive">*</span>
                </Label>
                <CustomerSelect
                  value={customerId}
                  onValueChange={setCustomerId}
                  error={!!formErrors.customer}
                />
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
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
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
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  เพิ่มสินค้า
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>สินค้า</Label>
                    <ProductSelect
                      value={selectedProduct}
                      onValueChange={(value, product) => {
                        setSelectedProduct(value);
                        setSelectedProductData(product || null);
                        if (product) {
                          setOriginalPrice(product.price.toString());
                          setSellingPrice(product.price.toString());
                        }
                      }}
                      error={!!formErrors.product}
                      stockAdjustments={
                        // Calculate stock adjustments based on items already in cart
                        orderItems.reduce((acc, item) => {
                          acc[item.productId] = -(item.quantityOrdered);
                          return acc;
                        }, {} as Record<number, number>)
                      }
                    />
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
                      className="bg-muted rounded-xl"
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
                        className={`rounded-xl ${formErrors.quantity ? "border-destructive" : ""}`}
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
                        className={`rounded-xl ${formErrors.price ? "border-destructive" : ""}`}
                      />
                      {formErrors.price && (
                        <p className="text-xs text-destructive">{formErrors.price}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addItem} 
                    className="w-full rounded-xl border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <Plus className="h-4 w-4 mr-2 text-orange-600" />
                    เพิ่มรายการ
                  </Button>
                </div>
              </div>

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                    รายการสินค้า ({orderItems.length})
                  </h3>
                  <div className="space-y-2 mb-3">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantityOrdered} x ฿{formatPrice(item.priceEach)}
                            <span className="ml-1">(ทุน: ฿{formatPrice(item.originalPrice)})</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-orange-600">฿{formatPrice(item.subtotal)}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 space-y-2 bg-gray-50 dark:bg-gray-800/50 -mx-6 px-6 py-3 -mb-6 rounded-b-2xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ต้นทุน:</span>
                      <span>฿{formatPrice(totalCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>รวม:</span>
                      <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">฿{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">กำไร:</span>
                      <span className={`font-semibold ${estimatedProfit < 0 ? "text-destructive" : "text-emerald-600"}`}>
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
                className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
                disabled={!customerId || orderItems.length === 0 || submitting}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {submitting ? "กำลังบันทึก..." : "สร้างออเดอร์"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table - Right Side */}
        <Card className="lg:col-span-2 border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <CardTitle>รายการออเดอร์</CardTitle>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">กรองโดย:</span>
                </div>
                <div className="w-[180px]">
                  <CustomerSelect
                    value={filterCustomerId}
                    onValueChange={(value) => {
                      setFilterCustomerId(value);
                      setCurrentPage(1);
                    }}
                    placeholder="ลูกค้าทั้งหมด"
                  />
                </div>
                <div className="w-[220px]">
                  <ProductMultiSelect
                    values={filterProductIds}
                    onValuesChange={(values) => {
                      setFilterProductIds(values);
                      setCurrentPage(1);
                    }}
                    placeholder="สินค้าทั้งหมด"
                  />
                </div>
                <Select 
                  value={filterStatus} 
                  onValueChange={(value) => {
                    setFilterStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px] rounded-xl">
                    <SelectValue placeholder="สถานะทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                    <SelectItem value="pending">ยังไม่จ่าย</SelectItem>
                    <SelectItem value="completed">จ่ายแล้ว</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
                {(filterStatus || filterCustomerId || filterProductIds.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setFilterStatus("");
                      setFilterCustomerId("");
                      setFilterProductIds([]);
                      setCurrentPage(1);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    ล้างตัวกรอง
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                <p className="mt-4">กำลังโหลด...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-muted-foreground">ไม่มีออเดอร์</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50/50">
                        <TableHead className="font-semibold">เลขที่</TableHead>
                        <TableHead className="font-semibold">ลูกค้า</TableHead>
                        <TableHead className="font-semibold">วันที่</TableHead>
                        <TableHead className="text-right font-semibold">ต้นทุน</TableHead>
                        <TableHead className="text-right font-semibold">ยอดรวม</TableHead>
                        <TableHead className="text-right font-semibold">กำไร</TableHead>
                        <TableHead className="font-semibold">สถานะ</TableHead>
                        <TableHead className="w-[120px] font-semibold">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order.orderId}
                          className="cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                          onClick={() => handleRowClick(order)}
                        >
                          <TableCell className="font-medium">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
                              #{order.orderId}
                            </span>
                          </TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(order.orderDate)}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-muted-foreground">฿{formatPrice(order.totalAmount - order.profit)}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold">฿{formatPrice(order.totalAmount)}</span>
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${order.profit < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                            ฿{formatPrice(order.profit)}
                          </TableCell>
                          <TableCell>
                            <button
                              className={`text-xs px-3 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity font-medium ${getStatusBadge(order.status)}`}
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
                                className="h-8 w-8 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30"
                              >
                                <Eye className="h-4 w-4 text-orange-600" />
                              </Button>
                              {order.status === "pending" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => openEditDialog(order, e)}
                                  title="แก้ไข"
                                  className="h-8 w-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                >
                                  <Pencil className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openDeleteDialog(order, e)}
                                title="ลบ"
                                className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
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
                <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">แสดง</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(parseInt(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8 rounded-lg">
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
                      className="h-8 w-8 rounded-lg"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      หน้า {currentPage} / {totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
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
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-600" />
              รายละเอียดออเดอร์ #{selectedOrder?.orderId}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.customerName} - {selectedOrder && formatDate(selectedOrder.orderDate)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-muted-foreground">สถานะการจ่ายเงิน</span>
                <button
                  className={`text-xs px-3 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity font-medium ${getStatusBadge(selectedOrder.status)}`}
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    openStatusDialog(selectedOrder);
                  }}
                >
                  {getStatusText(selectedOrder.status)}
                </button>
              </div>

              <div className="border rounded-xl divide-y overflow-hidden">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantityOrdered} x ฿{formatPrice(item.priceEach)}
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
                  <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    ฿{formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">กำไร</span>
                  <span className={`font-semibold ${selectedOrder.profit < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                    ฿{formatPrice(selectedOrder.profit)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="rounded-xl">
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Edit Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขสถานะการจ่ายเงิน</DialogTitle>
            <DialogDescription>
              ออเดอร์ #{editingStatusOrder?.orderId} - {editingStatusOrder?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>สถานะ</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-2 rounded-xl">
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
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} className="rounded-xl">
              ยกเลิก
            </Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-600"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-blue-600" />
              แก้ไขออเดอร์ #{editingOrder?.orderId}
            </DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลลูกค้า สถานะ และรายการสินค้า
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ลูกค้า</Label>
                <CustomerSelect
                  value={editCustomerId}
                  onValueChange={setEditCustomerId}
                />
              </div>
              <div className="space-y-2">
                <Label>สถานะการจ่ายเงิน</Label>
                <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">ยังไม่จ่าย</SelectItem>
                    <SelectItem value="completed">จ่ายแล้ว</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Items Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                เพิ่มสินค้า
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>สินค้า</Label>
                  <ProductSelect
                    value={editSelectedProduct}
                    onValueChange={(value, product) => {
                      setEditSelectedProduct(value);
                      setEditSelectedProductData(product || null);
                      if (product) {
                        setEditOriginalPrice(product.price.toString());
                        setEditSellingPrice(product.price.toString());
                      }
                    }}
                    error={!!editFormErrors.product}
                    stockAdjustments={
                      // Calculate stock adjustments for edit mode
                      // Add back original order quantities, subtract current edit cart quantities
                      (() => {
                        const adj: Record<number, number> = {};
                        // Add back original quantities from the order being edited
                        editingOrder?.items?.forEach((item: OrderItem) => {
                          adj[item.productId] = (adj[item.productId] || 0) + item.quantityOrdered;
                        });
                        // Subtract current edit cart quantities
                        editOrderItems.forEach((item) => {
                          adj[item.productId] = (adj[item.productId] || 0) - item.quantityOrdered;
                        });
                        return adj;
                      })()
                    }
                  />
                  {editFormErrors.product && (
                    <p className="text-xs text-destructive">{editFormErrors.product}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>ราคาสินค้า (฿)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editOriginalPrice}
                    disabled
                    className="bg-muted rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>จำนวน</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className={`rounded-xl ${editFormErrors.quantity ? "border-destructive" : ""}`}
                    />
                    {editFormErrors.quantity && (
                      <p className="text-xs text-destructive">{editFormErrors.quantity}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>ราคาขาย (฿)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editSellingPrice}
                      onChange={(e) => setEditSellingPrice(e.target.value)}
                      className={`rounded-xl ${editFormErrors.price ? "border-destructive" : ""}`}
                    />
                    {editFormErrors.price && (
                      <p className="text-xs text-destructive">{editFormErrors.price}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addEditItem} 
                  className="w-full rounded-xl border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4 mr-2 text-blue-600" />
                  เพิ่มรายการ
                </Button>
              </div>
            </div>

            {/* Order Items */}
            {editOrderItems.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  รายการสินค้า ({editOrderItems.length})
                </h3>
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {editOrderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.quantityOrdered} x ฿{formatPrice(item.priceEach)}
                          <span className="ml-1">(ทุน: ฿{formatPrice(item.originalPrice)})</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">฿{formatPrice(item.subtotal)}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => removeEditItem(index)}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ต้นทุน:</span>
                    <span>฿{formatPrice(editOrderItems.reduce((sum, item) => sum + (item.originalPrice * item.quantityOrdered), 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>รวม:</span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ฿{formatPrice(editOrderItems.reduce((sum, item) => sum + item.subtotal, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">กำไร:</span>
                    <span className={`font-semibold ${
                      editOrderItems.reduce((sum, item) => sum + item.subtotal, 0) - editOrderItems.reduce((sum, item) => sum + (item.originalPrice * item.quantityOrdered), 0) < 0 
                        ? "text-destructive" 
                        : "text-emerald-600"
                    }`}>
                      ฿{formatPrice(
                        editOrderItems.reduce((sum, item) => sum + item.subtotal, 0) - 
                        editOrderItems.reduce((sum, item) => sum + (item.originalPrice * item.quantityOrdered), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {editFormErrors.items && (
              <p className="text-xs text-destructive">{editFormErrors.items}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              ยกเลิก
            </Button>
            <Button 
              onClick={handleEditOrder} 
              disabled={submitting || !editCustomerId || editOrderItems.length === 0}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive">ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณต้องการลบออเดอร์ #{deletingOrder?.orderId} ใช่หรือไม่?
              สต็อกสินค้าจะถูกคืนกลับโดยอัตโนมัติ
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl">
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="rounded-xl">
              {submitting ? "กำลังลบ..." : "ลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
