"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Users, Package, ShoppingCart, AlertTriangle, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface StatData {
  count: number;
  loading: boolean;
}

interface TopProduct {
  productId: number;
  productName: string;
  volume: string | null;
  price: number;
  quantitySold: number;
}

interface MonthlySalesData {
  month: number;
  year: number;
  monthName: string;
  label: string;
  summary: {
    totalSales: number;
    totalProfit: number;
    orderCount: number;
  };
  topSellingProducts: TopProduct[];
  loading: boolean;
}

interface Period {
  month: number;
  year: number;
  yearBE: number;
  monthName: string;
}

interface PeriodsData {
  periods: Period[];
  current: Period | null;
  loading: boolean;
}

export default function HomePage() {
  const [customersStats, setCustomersStats] = useState<StatData>({ count: 0, loading: true });
  const [productsStats, setProductsStats] = useState<StatData>({ count: 0, loading: true });
  const [ordersStats, setOrdersStats] = useState<StatData>({ count: 0, loading: true });
  const [lowStockStats, setLowStockStats] = useState<StatData>({ count: 0, loading: true });
  const [periodsData, setPeriodsData] = useState<PeriodsData>({
    periods: [],
    current: null,
    loading: true,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData>({
    month: 0,
    year: 0,
    monthName: "",
    label: "",
    summary: { totalSales: 0, totalProfit: 0, orderCount: 0 },
    topSellingProducts: [],
    loading: true,
  });

  // Fetch monthly sales data
  const fetchMonthlySales = useCallback((month: number, year: number) => {
    setMonthlySales((prev) => ({ ...prev, loading: true }));
    fetch(`/api/stats/monthly-sales?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) =>
        setMonthlySales({
          month: data.month || 0,
          year: data.year || 0,
          monthName: data.monthName || "",
          label: data.label || "",
          summary: data.summary || { totalSales: 0, totalProfit: 0, orderCount: 0 },
          topSellingProducts: data.topSellingProducts || [],
          loading: false,
        })
      )
      .catch(() =>
        setMonthlySales({
          month: 0,
          year: 0,
          monthName: "",
          label: "",
          summary: { totalSales: 0, totalProfit: 0, orderCount: 0 },
          topSellingProducts: [],
          loading: false,
        })
      );
  }, []);

  useEffect(() => {
    // Fetch each stat independently
    fetch("/api/stats/customers")
      .then((res) => res.json())
      .then((data) => setCustomersStats({ count: data.count || 0, loading: false }))
      .catch(() => setCustomersStats({ count: 0, loading: false }));

    fetch("/api/stats/products")
      .then((res) => res.json())
      .then((data) => setProductsStats({ count: data.count || 0, loading: false }))
      .catch(() => setProductsStats({ count: 0, loading: false }));

    fetch("/api/stats/orders")
      .then((res) => res.json())
      .then((data) => setOrdersStats({ count: data.count || 0, loading: false }))
      .catch(() => setOrdersStats({ count: 0, loading: false }));

    fetch("/api/stats/low-stock")
      .then((res) => res.json())
      .then((data) => setLowStockStats({ count: data.count || 0, loading: false }))
      .catch(() => setLowStockStats({ count: 0, loading: false }));

    // Fetch available periods
    fetch("/api/stats/available-periods")
      .then((res) => res.json())
      .then((data) => {
        setPeriodsData({
          periods: data.periods || [],
          current: data.current || null,
          loading: false,
        });
        // Set default selected period and fetch sales data
        if (data.current) {
          const periodKey = `${data.current.year}-${data.current.month}`;
          setSelectedPeriod(periodKey);
          fetchMonthlySales(data.current.month, data.current.year);
        }
      })
      .catch(() => {
        setPeriodsData({ periods: [], current: null, loading: false });
        setMonthlySales((prev) => ({ ...prev, loading: false }));
      });
  }, [fetchMonthlySales]);

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    const [year, month] = value.split("-").map(Number);
    if (year && month) {
      fetchMonthlySales(month, year);
    }
  };

  const statCards = [
    {
      title: "ลูกค้า",
      value: customersStats.count,
      loading: customersStats.loading,
      icon: Users,
      href: "/customers",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "สินค้า",
      value: productsStats.count,
      loading: productsStats.loading,
      icon: Package,
      href: "/products",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "คำสั่งซื้อ",
      value: ordersStats.count,
      loading: ordersStats.loading,
      icon: ShoppingCart,
      href: "/orders",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "สินค้าใกล้หมด",
      value: lowStockStats.count,
      loading: lowStockStats.loading,
      icon: AlertTriangle,
      href: "/products",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">ยินดีต้อนรับสู่ StoreMom</h1>
        <p className="text-muted-foreground mt-1">
          ระบบจัดการร้านค้าและคลังสินค้าครบวงจร
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Monthly Sales Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales Summary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                สรุปยอดขาย
              </CardTitle>
              {periodsData.loading ? (
                <div className="h-9 w-40 bg-muted animate-pulse rounded" />
              ) : (
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="เลือกเดือน" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodsData.periods.map((period) => (
                      <SelectItem
                        key={`${period.year}-${period.month}`}
                        value={`${period.year}-${period.month}`}
                      >
                        {period.monthName} {period.yearBE}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {monthlySales.loading ? (
              <div className="space-y-3">
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">ยอดขายรวม</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {monthlySales.summary.totalSales.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="text-lg font-normal">บาท</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">กำไร</p>
                    <p className={`text-xl font-semibold ${monthlySales.summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {monthlySales.summary.totalProfit.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      บาท
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">จำนวนออเดอร์</p>
                    <p className="text-xl font-semibold">
                      {monthlySales.summary.orderCount.toLocaleString()} รายการ
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              {monthlySales.loading ? (
                "สินค้าขายดี"
              ) : (
                `สินค้าขายดี ${monthlySales.monthName || ""}`
              )}
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {monthlySales.loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : monthlySales.topSellingProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                ยังไม่มีข้อมูลการขายในเดือนที่เลือก
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>สินค้า</TableHead>
                    <TableHead className="text-right">ขายได้</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySales.topSellingProducts.map((product, index) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? "bg-amber-500 text-white" :
                          index === 1 ? "bg-gray-400 text-white" :
                          index === 2 ? "bg-amber-700 text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          {product.volume && (
                            <p className="text-xs text-muted-foreground">{product.volume}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {product.quantitySold.toLocaleString()} ชิ้น
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">การดำเนินการด่วน</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/customers">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">จัดการลูกค้า</h3>
                    <p className="text-sm text-muted-foreground">
                      เพิ่ม แก้ไข ลบข้อมูลลูกค้า
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <Package className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">จัดการสินค้า</h3>
                    <p className="text-sm text-muted-foreground">
                      เพิ่ม แก้ไข จัดการสต็อก
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <ShoppingCart className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">สร้างคำสั่งซื้อ</h3>
                    <p className="text-sm text-muted-foreground">
                      สร้างคำสั่งซื้อใหม่
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
