"use client";

import { useEffect, useState } from "react";
import { Search, Pencil, Trash2, User, Eye, ChevronLeft, ChevronRight, Users, UserPlus } from "lucide-react";
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
import { customerSchema, type CustomerFormData, validateForm } from "@/lib/validations";

interface Customer {
  id: number;
  fname: string;
  lname: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt?: string;
}

const initialFormData: CustomerFormData = {
  fname: "",
  lname: "",
  phone: "",
  email: "",
  address: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Form states (for Add)
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState<CustomerFormData>(initialFormData);
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Fetch customers with pagination
  const fetchCustomers = async (search?: string, page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (search) params.set('search', search);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const result = await res.json();
      
      if (result.data) {
        setCustomers(result.data);
        setTotalItems(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } else {
        // Fallback for old API format
        setCustomers(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery, currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Search handler
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers(searchQuery, 1, itemsPerPage);
  };

  // Handle form submit (Add)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm(customerSchema, formData);
    
    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("เพิ่มสำเร็จ", {
        description: "เพิ่มลูกค้าใหม่เรียบร้อยแล้ว",
      });

      setFormData(initialFormData);
      setFormErrors({});
      fetchCustomers(searchQuery, currentPage, itemsPerPage);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // View customer detail
  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailDialogOpen(true);
  };

  // Open detail dialog
  const openDetailDialog = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedCustomer(customer);
    setIsDetailDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedCustomer(customer);
    setEditFormData({
      fname: customer.fname,
      lname: customer.lname,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setEditFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!selectedCustomer) return;

    const validation = validateForm(customerSchema, editFormData);
    
    if (!validation.success) {
      setEditFormErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("อัพเดทสำเร็จ", {
        description: "อัพเดทข้อมูลลูกค้าเรียบร้อยแล้ว",
      });

      setIsEditDialogOpen(false);
      fetchCustomers(searchQuery, currentPage, itemsPerPage);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const openDeleteDialog = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingCustomer) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${deletingCustomer.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast.success("ลบสำเร็จ", {
        description: "ลบข้อมูลลูกค้าเรียบร้อยแล้ว",
      });

      setIsDeleteDialogOpen(false);
      setDeletingCustomer(null);
      fetchCustomers(searchQuery, currentPage, itemsPerPage);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            จัดการลูกค้า
          </h1>
          <p className="text-muted-foreground mt-1">เพิ่ม แก้ไข และจัดการข้อมูลลูกค้า</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/25">
            <Users className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form - Left Side (Add only) */}
        <Card className="lg:col-span-1 border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-b border-violet-100 dark:border-violet-900/30">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-violet-600" />
              เพิ่มลูกค้าใหม่
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fname">
                    ชื่อ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fname"
                    value={formData.fname}
                    onChange={(e) =>
                      setFormData({ ...formData, fname: e.target.value })
                    }
                    className={`rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${formErrors.fname ? "border-destructive" : ""}`}
                  />
                  {formErrors.fname && (
                    <p className="text-xs text-destructive">{formErrors.fname}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">
                    นามสกุล <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lname"
                    value={formData.lname}
                    onChange={(e) =>
                      setFormData({ ...formData, lname: e.target.value })
                    }
                    className={`rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${formErrors.lname ? "border-destructive" : ""}`}
                  />
                  {formErrors.lname && (
                    <p className="text-xs text-destructive">{formErrors.lname}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  เบอร์โทร <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${formErrors.phone ? "border-destructive" : ""}`}
                />
                {formErrors.phone && (
                  <p className="text-xs text-destructive">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${formErrors.email ? "border-destructive" : ""}`}
                />
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300" 
                disabled={submitting}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {submitting ? "กำลังบันทึก..." : "เพิ่มลูกค้า"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table - Right Side */}
        <Card className="lg:col-span-2 border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <CardTitle>รายชื่อลูกค้า</CardTitle>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาลูกค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>
              <Button onClick={handleSearch} size="icon" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
                <p className="mt-4">กำลังโหลด...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 mx-auto mb-4">
                  <User className="h-8 w-8 text-violet-500" />
                </div>
                <p className="text-muted-foreground">ไม่พบลูกค้า</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50/50">
                        <TableHead className="font-semibold">ชื่อ-นามสกุล</TableHead>
                        <TableHead className="font-semibold">เบอร์โทร</TableHead>
                        <TableHead className="font-semibold">อีเมล</TableHead>
                        <TableHead className="w-[120px] font-semibold">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow
                          key={customer.id}
                          className="cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors"
                          onClick={() => handleRowClick(customer)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-bold">
                                {customer.fname.charAt(0)}
                              </div>
                              {customer.fname} {customer.lname}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{customer.phone || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.email || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openDetailDialog(customer, e)}
                                title="ดูรายละเอียด"
                                className="h-8 w-8 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30"
                              >
                                <Eye className="h-4 w-4 text-violet-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openEditDialog(customer, e)}
                                title="แก้ไข"
                                className="h-8 w-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => openDeleteDialog(customer, e)}
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
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>รายละเอียดลูกค้า</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/25">
                  <span className="text-2xl font-bold text-white">
                    {selectedCustomer.fname.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedCustomer.fname} {selectedCustomer.lname}
                  </h3>
                  <p className="text-muted-foreground">ID: {selectedCustomer.id}</p>
                </div>
              </div>

              <div className="grid gap-3 pt-4 border-t">
                <div className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-muted-foreground">เบอร์โทร</span>
                  <span className="font-medium">{selectedCustomer.phone || "-"}</span>
                </div>
                <div className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-muted-foreground">อีเมล</span>
                  <span className="font-medium">{selectedCustomer.email || "-"}</span>
                </div>
                <div className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-muted-foreground">ที่อยู่</span>
                  <span className="font-medium">{selectedCustomer.address || "-"}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="rounded-xl">
              ปิด
            </Button>
            <Button 
              onClick={() => {
                setIsDetailDialogOpen(false);
                if (selectedCustomer) openEditDialog(selectedCustomer);
              }}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              <Pencil className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขลูกค้า</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลลูกค้า ID: {selectedCustomer?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fname">
                  ชื่อ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-fname"
                  value={editFormData.fname}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fname: e.target.value })
                  }
                  className={`rounded-xl ${editFormErrors.fname ? "border-destructive" : ""}`}
                />
                {editFormErrors.fname && (
                  <p className="text-xs text-destructive">{editFormErrors.fname}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lname">
                  นามสกุล <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-lname"
                  value={editFormData.lname}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, lname: e.target.value })
                  }
                  className={`rounded-xl ${editFormErrors.lname ? "border-destructive" : ""}`}
                />
                {editFormErrors.lname && (
                  <p className="text-xs text-destructive">{editFormErrors.lname}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">
                เบอร์โทร <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-phone"
                value={editFormData.phone || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                className={`rounded-xl ${editFormErrors.phone ? "border-destructive" : ""}`}
              />
              {editFormErrors.phone && (
                <p className="text-xs text-destructive">{editFormErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">อีเมล</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                className={`rounded-xl ${editFormErrors.email ? "border-destructive" : ""}`}
              />
              {editFormErrors.email && (
                <p className="text-xs text-destructive">{editFormErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">ที่อยู่</Label>
              <Input
                id="edit-address"
                value={editFormData.address || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              ยกเลิก
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
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
              คุณต้องการลบลูกค้า &quot;{deletingCustomer?.fname} {deletingCustomer?.lname}&quot; ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl"
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
              className="rounded-xl"
            >
              {submitting ? "กำลังลบ..." : "ลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
