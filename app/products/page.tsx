"use client";

import { useEffect, useState } from "react";
import { Search, Pencil, Trash2, Package, AlertTriangle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { productSchema, type ProductFormData, validateForm } from "@/lib/validations";

interface Product {
  productId: number;
  productName: string;
  quantityInStock: number;
  price: number;
  volume?: string | null;
  description?: string | null;
}

interface ProductFormDataRaw {
  productName: string;
  quantityInStock: string;
  price: string;
  volume: string;
  description: string;
}

const initialFormData: ProductFormDataRaw = {
  productName: "",
  quantityInStock: "0",
  price: "",
  volume: "",
  description: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form states (for Add)
  const [formData, setFormData] = useState<ProductFormDataRaw>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<ProductFormDataRaw>(initialFormData);
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Fetch products with pagination
  const fetchProducts = async (search?: string, page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (search) params.set('search', search);

      const res = await fetch(`/api/products?${params.toString()}`);
      const result = await res.json();
      
      if (result.data) {
        setProducts(result.data);
        setTotalItems(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } else {
        // Fallback for old API format
        setProducts(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery, currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Search handler
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(searchQuery, 1, itemsPerPage);
  };

  // Handle form submit (Add)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToValidate: ProductFormData = {
      productName: formData.productName,
      quantityInStock: parseInt(formData.quantityInStock) || 0,
      price: parseFloat(formData.price) || 0,
      volume: formData.volume,
      description: formData.description || null,
    };

    const validation = validateForm(productSchema, dataToValidate);

    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("เพิ่มสำเร็จ", {
        description: "เพิ่มสินค้าใหม่เรียบร้อยแล้ว",
      });

      setFormData(initialFormData);
      setFormErrors({});
      fetchProducts(searchQuery, currentPage, itemsPerPage);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // View product detail
  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  // Open detail dialog
  const openDetailDialog = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedProduct(product);
    setEditFormData({
      productName: product.productName,
      quantityInStock: product.quantityInStock.toString(),
      price: product.price.toString(),
      volume: product.volume || "",
      description: product.description || "",
    });
    setEditFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!selectedProduct) return;

    const dataToValidate: ProductFormData = {
      productName: editFormData.productName,
      quantityInStock: parseInt(editFormData.quantityInStock) || 0,
      price: parseFloat(editFormData.price) || 0,
      volume: editFormData.volume,
      description: editFormData.description || null,
    };

    const validation = validateForm(productSchema, dataToValidate);

    if (!validation.success) {
      setEditFormErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("อัพเดทสำเร็จ", {
        description: "อัพเดทข้อมูลสินค้าเรียบร้อยแล้ว",
      });

      setIsEditDialogOpen(false);
      fetchProducts(searchQuery, currentPage, itemsPerPage);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const openDeleteDialog = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingProduct) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${deletingProduct.productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("ลบสำเร็จ", {
        description: "ลบข้อมูลสินค้าเรียบร้อยแล้ว",
      });

      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
      fetchProducts(searchQuery, currentPage, itemsPerPage);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">จัดการสินค้า</h1>
        <p className="text-muted-foreground">เพิ่ม แก้ไข และจัดการสินค้าคงคลัง</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form - Left Side (Add only) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>เพิ่มสินค้าใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">
                  ชื่อสินค้า <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  className={formErrors.productName ? "border-destructive" : ""}
                />
                {formErrors.productName && (
                  <p className="text-xs text-destructive">{formErrors.productName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  ราคา (฿) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={formErrors.price ? "border-destructive" : ""}
                />
                {formErrors.price && (
                  <p className="text-xs text-destructive">{formErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityInStock">
                  จำนวนในสต็อก <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantityInStock"
                  type="number"
                  min="0"
                  value={formData.quantityInStock}
                  onChange={(e) =>
                    setFormData({ ...formData, quantityInStock: e.target.value })
                  }
                  className={formErrors.quantityInStock ? "border-destructive" : ""}
                />
                {formErrors.quantityInStock && (
                  <p className="text-xs text-destructive">{formErrors.quantityInStock}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">
                  หน่วย/ปริมาตร <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="volume"
                  placeholder="เช่น 1 ลิตร, 500 กรัม"
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData({ ...formData, volume: e.target.value })
                  }
                  className={formErrors.volume ? "border-destructive" : ""}
                />
                {formErrors.volume && (
                  <p className="text-xs text-destructive">{formErrors.volume}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "กำลังบันทึก..." : "เพิ่มสินค้า"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table - Right Side */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>รายการสินค้า</CardTitle>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                กำลังโหลด...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ไม่พบสินค้า</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อสินค้า</TableHead>
                        <TableHead className="text-right">ราคา</TableHead>
                        <TableHead>หน่วย</TableHead>
                        <TableHead className="text-right">สต็อก</TableHead>
                        <TableHead className="w-[120px]">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow
                          key={product.productId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(product)}
                        >
                          <TableCell className="font-medium">
                            {product.productName}
                          </TableCell>
                          <TableCell className="text-right">
                            ฿{formatPrice(product.price)}
                          </TableCell>
                          <TableCell>{product.volume || "-"}</TableCell>
                          <TableCell className="text-right">
                            {product.quantityInStock < 10 ? (
                              <span className="inline-flex items-center gap-1 text-destructive font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                {product.quantityInStock}
                              </span>
                            ) : (
                              product.quantityInStock
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openDetailDialog(product, e)}
                                title="ดูรายละเอียด"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openEditDialog(product, e)}
                                title="แก้ไข"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openDeleteDialog(product, e)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รายละเอียดสินค้า</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedProduct.productName}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ฿{formatPrice(selectedProduct.price)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">รหัสสินค้า</span>
                  <span>{selectedProduct.productId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">หน่วย/ปริมาตร</span>
                  <span>{selectedProduct.volume || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">จำนวนในสต็อก</span>
                  <span className={selectedProduct.quantityInStock < 10 ? "text-destructive font-medium" : ""}>
                    {selectedProduct.quantityInStock}
                    {selectedProduct.quantityInStock < 10 && " (สต็อกต่ำ)"}
                  </span>
                </div>
                {selectedProduct.description && (
                  <div className="pt-3 border-t">
                    <span className="text-muted-foreground">รายละเอียด</span>
                    <p className="mt-1">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              ปิด
            </Button>
            <Button onClick={() => {
              setIsDetailDialogOpen(false);
              if (selectedProduct) openEditDialog(selectedProduct);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขสินค้า</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลสินค้า ID: {selectedProduct?.productId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-productName">
                ชื่อสินค้า <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-productName"
                value={editFormData.productName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, productName: e.target.value })
                }
                className={editFormErrors.productName ? "border-destructive" : ""}
              />
              {editFormErrors.productName && (
                <p className="text-xs text-destructive">{editFormErrors.productName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">
                  ราคา (฿) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.price}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, price: e.target.value })
                  }
                  className={editFormErrors.price ? "border-destructive" : ""}
                />
                {editFormErrors.price && (
                  <p className="text-xs text-destructive">{editFormErrors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantityInStock">
                  จำนวนในสต็อก <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-quantityInStock"
                  type="number"
                  min="0"
                  value={editFormData.quantityInStock}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, quantityInStock: e.target.value })
                  }
                  className={editFormErrors.quantityInStock ? "border-destructive" : ""}
                />
                {editFormErrors.quantityInStock && (
                  <p className="text-xs text-destructive">{editFormErrors.quantityInStock}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-volume">
                หน่วย/ปริมาตร <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-volume"
                placeholder="เช่น 1 ลิตร, 500 กรัม"
                value={editFormData.volume}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, volume: e.target.value })
                }
                className={editFormErrors.volume ? "border-destructive" : ""}
              />
              {editFormErrors.volume && (
                <p className="text-xs text-destructive">{editFormErrors.volume}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">รายละเอียด</Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>
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
              คุณต้องการลบสินค้า &quot;{deletingProduct?.productName}&quot; ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "กำลังลบ..." : "ลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
