"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Users, Package, ShoppingCart, AlertTriangle, TrendingUp, Trophy, ArrowUpRight, Sparkles, PackagePlus, BarChart3, Loader2, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface StockProduct {
  productId: number;
  productName: string;
  volume: string | null;
  quantityInStock: number;
  price: number;
  createdAt?: string;
}

interface SoldItem {
  productId: number;
  productName: string;
  volume: string | null;
  quantitySold: number;
  remainingStock: number;
  price: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface NewProductsData {
  month: number;
  year: number;
  monthName: string;
  pagination: PaginationInfo;
  products: StockProduct[];
  loading: boolean;
  loadingMore: boolean;
}

interface SoldProductsData {
  month: number;
  year: number;
  monthName: string;
  pagination: PaginationInfo;
  products: SoldItem[];
  loading: boolean;
  loadingMore: boolean;
}

interface MonthlyStockData {
  month: number;
  year: number;
  monthName: string;
  label: string;
  summary: {
    totalNewProducts: number;
    totalItemsSold: number;
    totalRemainingStock: number;
    lowStockCount: number;
  };
  lowStockProducts: StockProduct[];
  loading: boolean;
}

interface LowStockProductsData {
  pagination: PaginationInfo;
  products: StockProduct[];
  loading: boolean;
  loadingMore: boolean;
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
const [monthlyStock, setMonthlyStock] = useState<MonthlyStockData>({
    month: 0,
    year: 0,
    monthName: "",
    label: "",
    summary: { totalNewProducts: 0, totalItemsSold: 0, totalRemainingStock: 0, lowStockCount: 0 },
    lowStockProducts: [],
    loading: true,
  });
  const [newProductsData, setNewProductsData] = useState<NewProductsData>({
    month: 0,
    year: 0,
    monthName: "",
    pagination: { page: 1, limit: 5, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    products: [],
    loading: true,
    loadingMore: false,
  });
  const [soldProductsData, setSoldProductsData] = useState<SoldProductsData>({
    month: 0,
    year: 0,
    monthName: "",
    pagination: { page: 1, limit: 5, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    products: [],
    loading: true,
    loadingMore: false,
  });

  const newProductsScrollRef = useRef<HTMLDivElement>(null);
  const soldProductsScrollRef = useRef<HTMLDivElement>(null);
  const lowStockScrollRef = useRef<HTMLDivElement>(null);
  const [lowStockDialogOpen, setLowStockDialogOpen] = useState(false);
  const [lowStockProductsData, setLowStockProductsData] = useState<LowStockProductsData>({
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    products: [],
    loading: false,
    loadingMore: false,
  });

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

const fetchMonthlyStock = useCallback((month: number, year: number) => {
    setMonthlyStock((prev) => ({ ...prev, loading: true }));
    fetch(`/api/stats/monthly-stock?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) =>
        setMonthlyStock({
          month: data.month || 0,
          year: data.year || 0,
          monthName: data.monthName || "",
          label: data.label || "",
          summary: data.summary || { totalNewProducts: 0, totalItemsSold: 0, totalRemainingStock: 0, lowStockCount: 0 },
          lowStockProducts: data.lowStockProducts || [],
          loading: false,
        })
      )
      .catch(() =>
        setMonthlyStock({
          month: 0,
          year: 0,
          monthName: "",
          label: "",
          summary: { totalNewProducts: 0, totalItemsSold: 0, totalRemainingStock: 0, lowStockCount: 0 },
          lowStockProducts: [],
          loading: false,
        })
      );
  }, []);

  const fetchNewProducts = useCallback((month: number, year: number, page: number = 1, append: boolean = false) => {
    if (append) {
      setNewProductsData((prev) => ({ ...prev, loadingMore: true }));
    } else {
      setNewProductsData((prev) => ({ ...prev, loading: true }));
    }
    fetch(`/api/stats/new-products?month=${month}&year=${year}&page=${page}&limit=5`)
      .then((res) => res.json())
      .then((data) =>
        setNewProductsData((prev) => ({
          month: data.month || 0,
          year: data.year || 0,
          monthName: data.monthName || "",
          pagination: data.pagination || { page: 1, limit: 5, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
          products: append ? [...prev.products, ...(data.products || [])] : (data.products || []),
          loading: false,
          loadingMore: false,
        }))
      )
      .catch(() =>
        setNewProductsData((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
        }))
      );
  }, []);

  const fetchSoldProducts = useCallback((month: number, year: number, page: number = 1, append: boolean = false) => {
    if (append) {
      setSoldProductsData((prev) => ({ ...prev, loadingMore: true }));
    } else {
      setSoldProductsData((prev) => ({ ...prev, loading: true }));
    }
    fetch(`/api/stats/sold-products?month=${month}&year=${year}&page=${page}&limit=5`)
      .then((res) => res.json())
      .then((data) =>
        setSoldProductsData((prev) => ({
          month: data.month || 0,
          year: data.year || 0,
          monthName: data.monthName || "",
          pagination: data.pagination || { page: 1, limit: 5, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
          products: append ? [...prev.products, ...(data.products || [])] : (data.products || []),
          loading: false,
          loadingMore: false,
        }))
      )
      .catch(() =>
        setSoldProductsData((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
        }))
      );
  }, []);

  const fetchLowStockProducts = useCallback((page: number = 1, append: boolean = false) => {
    if (append) {
      setLowStockProductsData((prev) => ({ ...prev, loadingMore: true }));
    } else {
      setLowStockProductsData((prev) => ({ ...prev, loading: true }));
    }
    fetch(`/api/stats/low-stock-products?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) =>
        setLowStockProductsData((prev) => ({
          pagination: data.pagination || { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
          products: append ? [...prev.products, ...(data.products || [])] : (data.products || []),
          loading: false,
          loadingMore: false,
        }))
      )
      .catch(() =>
        setLowStockProductsData((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
        }))
      );
  }, []);

  useEffect(() => {
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

fetch("/api/stats/available-periods")
      .then((res) => res.json())
      .then((data) => {
        setPeriodsData({
          periods: data.periods || [],
          current: data.current || null,
          loading: false,
        });
        if (data.current) {
          const periodKey = `${data.current.year}-${data.current.month}`;
          setSelectedPeriod(periodKey);
          fetchMonthlySales(data.current.month, data.current.year);
          fetchMonthlyStock(data.current.month, data.current.year);
          fetchNewProducts(data.current.month, data.current.year, 1);
          fetchSoldProducts(data.current.month, data.current.year, 1);
        }
      })
      .catch(() => {
        setPeriodsData({ periods: [], current: null, loading: false });
        setMonthlySales((prev) => ({ ...prev, loading: false }));
        setMonthlyStock((prev) => ({ ...prev, loading: false }));
        setNewProductsData((prev) => ({ ...prev, loading: false }));
        setSoldProductsData((prev) => ({ ...prev, loading: false }));
      });
  }, [fetchMonthlySales, fetchMonthlyStock, fetchNewProducts, fetchSoldProducts]);

const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    const [year, month] = value.split("-").map(Number);
    if (year && month) {
      fetchMonthlySales(month, year);
      fetchMonthlyStock(month, year);
      fetchNewProducts(month, year, 1);
      fetchSoldProducts(month, year, 1);
    }
  };

  const handleNewProductsPageChange = (page: number) => {
    const [year, month] = selectedPeriod.split("-").map(Number);
    if (year && month) {
      fetchNewProducts(month, year, page, true);
    }
  };

  const handleSoldProductsPageChange = (page: number) => {
    const [year, month] = selectedPeriod.split("-").map(Number);
    if (year && month) {
      fetchSoldProducts(month, year, page, true);
    }
  };

  const handleNewProductsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isAtBottom && newProductsData.pagination.hasNextPage && !newProductsData.loadingMore) {
      handleNewProductsPageChange(newProductsData.pagination.page + 1);
    }
  };

  const handleSoldProductsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isAtBottom && soldProductsData.pagination.hasNextPage && !soldProductsData.loadingMore) {
      handleSoldProductsPageChange(soldProductsData.pagination.page + 1);
    }
  };

  const handleLowStockScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isAtBottom && lowStockProductsData.pagination.hasNextPage && !lowStockProductsData.loadingMore) {
      fetchLowStockProducts(lowStockProductsData.pagination.page + 1, true);
    }
  };

  const handleOpenLowStockDialog = () => {
    setLowStockDialogOpen(true);
    // Reset and fetch first page when opening
    setLowStockProductsData({
      pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      products: [],
      loading: true,
      loadingMore: false,
    });
    fetchLowStockProducts(1, false);
  };

  const statCards = [
    {
      title: "ลูกค้าทั้งหมด",
      value: customersStats.count,
      loading: customersStats.loading,
      icon: Users,
      href: "/customers",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-blue-500",
    },
    {
      title: "สินค้าทั้งหมด",
      value: productsStats.count,
      loading: productsStats.loading,
      icon: Package,
      href: "/products",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500",
    },
    {
      title: "คำสั่งซื้อ",
      value: ordersStats.count,
      loading: ordersStats.loading,
      icon: ShoppingCart,
      href: "/orders",
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/10 to-purple-500/10",
      iconBg: "bg-violet-500",
    },
    {
      title: "สินค้าใกล้หมด",
      value: lowStockStats.count,
      loading: lowStockStats.loading,
      icon: AlertTriangle,
      href: "/products",
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-500/10 to-amber-500/10",
      iconBg: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold">ยินดีต้อนรับสู่ StoreMom</h1>
          </div>
          <p className="text-white/80 text-lg max-w-xl">
            ระบบจัดการร้านค้าและคลังสินค้าครบวงจร ออกแบบมาเพื่อธุรกิจของคุณ
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Link key={stat.title} href={stat.href}>
            <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.bgGradient} hover-lift cursor-pointer group`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${stat.iconBg} shadow-lg`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">
                    {stat.loading ? (
                      <div className="h-9 w-16 bg-muted/50 animate-pulse rounded-lg" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">สรุปข้อมูลประจำเดือน</h2>
        {periodsData.loading ? (
          <div className="h-10 w-44 bg-muted animate-pulse rounded-lg" />
        ) : (
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[200px] rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <SelectValue placeholder="เลือกเดือน" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {periodsData.periods.map((period) => (
                <SelectItem
                  key={`${period.year}-${period.month}`}
                  value={`${period.year}-${period.month}`}
                  className="rounded-lg"
                >
                  {period.monthName} {period.yearBE}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Monthly Sales Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Summary Card */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">สรุปยอดขาย</CardTitle>
              <p className="text-sm text-muted-foreground">{monthlySales.monthName || "เดือนนี้"}</p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {monthlySales.loading ? (
              <div className="space-y-4">
                <div className="h-12 w-48 bg-muted animate-pulse rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <p className="text-sm text-muted-foreground mb-1">ยอดขายรวม</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {monthlySales.summary.totalSales.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-lg font-normal text-muted-foreground ml-2">บาท</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-muted-foreground mb-1">กำไร</p>
                    <p className={`text-2xl font-bold ${monthlySales.summary.totalProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {monthlySales.summary.totalProfit.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      <span className="text-sm font-normal ml-1">บาท</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-muted-foreground mb-1">จำนวนออเดอร์</p>
                    <p className="text-2xl font-bold">
                      {monthlySales.summary.orderCount.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground ml-1">รายการ</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products Card */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold">
                สินค้าขายดีใน {monthlySales.monthName || "เดือนนี้"}
              </CardTitle>
        
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {monthlySales.loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : monthlySales.topSellingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">ยังไม่มีข้อมูลการขายในเดือนที่เลือก</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlySales.topSellingProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold text-sm ${
                      index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30" :
                      index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg shadow-gray-500/30" :
                      index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg shadow-amber-700/30" :
                      "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.productName}</p>
                      {product.volume && (
                        <p className="text-xs text-muted-foreground">{product.volume}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.quantitySold.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">ชิ้น</p>
                    </div>
                  </div>
))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stock Statistics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stock Summary Card */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">สรุปสต็อกประจำเดือน</CardTitle>
              <p className="text-sm text-muted-foreground">{monthlyStock.monthName || "เดือนนี้"}</p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {monthlyStock.loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                  <p className="text-sm text-muted-foreground mb-1">สินค้าเพิ่มใหม่</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {monthlyStock.summary.totalNewProducts.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-2">รายการ</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-muted-foreground mb-1">ขายไปแล้ว</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {monthlyStock.summary.totalItemsSold.toLocaleString()}
                      <span className="text-xs font-normal ml-1">ชิ้น</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-muted-foreground mb-1">คงเหลือรวม</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {monthlyStock.summary.totalRemainingStock.toLocaleString()}
                      <span className="text-xs font-normal ml-1">ชิ้น</span>
                    </p>
                  </div>
                </div>
                <div 
                  className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 cursor-pointer hover:from-red-500/20 hover:to-orange-500/20 transition-colors"
                  onClick={handleOpenLowStockDialog}
                >
                  <p className="text-sm text-muted-foreground mb-1">สินค้าใกล้หมด</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {monthlyStock.summary.lowStockCount.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-2">รายการ</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

{/* Newly Added Products Card */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold">
                สินค้าเพิ่มใหม่ใน {newProductsData.monthName || monthlyStock.monthName || "เดือนนี้"}
              </CardTitle>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
              <PackagePlus className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {newProductsData.loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : newProductsData.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <PackagePlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">ยังไม่มีสินค้าเพิ่มใหม่ในเดือนที่เลือก</p>
              </div>
            ) : (
              <div 
                ref={newProductsScrollRef}
                onScroll={handleNewProductsScroll}
                className="space-y-3 max-h-80 overflow-y-auto pr-1"
              >
                {newProductsData.products.map((product) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.productName}</p>
                      {product.volume && (
                        <p className="text-xs text-muted-foreground">{product.volume}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.quantityInStock.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">ชิ้น</p>
                    </div>
                  </div>
                ))}
                {/* Loading more indicator */}
                {newProductsData.loadingMore && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-muted-foreground">กำลังโหลด...</span>
                  </div>
                )}
                {/* End of list indicator */}
                {!newProductsData.pagination.hasNextPage && newProductsData.products.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    แสดงทั้งหมด {newProductsData.pagination.totalCount} รายการ
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sold Items Card */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold">
                สินค้าที่ขายได้ใน {soldProductsData.monthName || monthlyStock.monthName || "เดือนนี้"}
              </CardTitle>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {soldProductsData.loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : soldProductsData.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">ยังไม่มีการขายในเดือนที่เลือก</p>
              </div>
            ) : (
              <div 
                ref={soldProductsScrollRef}
                onScroll={handleSoldProductsScroll}
                className="space-y-3 max-h-80 overflow-y-auto pr-1"
              >
                {soldProductsData.products.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.productName}</p>
                      {item.volume && (
                        <p className="text-xs text-muted-foreground">{item.volume}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600 dark:text-orange-400">{item.quantitySold.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">คงเหลือ {item.remainingStock.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {/* Loading more indicator */}
                {soldProductsData.loadingMore && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                    <span className="ml-2 text-sm text-muted-foreground">กำลังโหลด...</span>
                  </div>
                )}
                {/* End of list indicator */}
                {!soldProductsData.pagination.hasNextPage && soldProductsData.products.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    แสดงทั้งหมด {soldProductsData.pagination.totalCount} รายการ
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">การดำเนินการด่วน</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/customers">
            <Card className="border-0 shadow-lg hover-lift cursor-pointer group bg-white dark:bg-gray-900/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">จัดการลูกค้า</h3>
                    <p className="text-sm text-muted-foreground">
                      เพิ่ม แก้ไข ลบข้อมูลลูกค้า
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="border-0 shadow-lg hover-lift cursor-pointer group bg-white dark:bg-gray-900/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">จัดการสินค้า</h3>
                    <p className="text-sm text-muted-foreground">
                      เพิ่ม แก้ไข จัดการสต็อก
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="border-0 shadow-lg hover-lift cursor-pointer group bg-white dark:bg-gray-900/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">สร้างคำสั่งซื้อ</h3>
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

      {/* Low Stock Products Dialog */}
      <Dialog open={lowStockDialogOpen} onOpenChange={setLowStockDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              สินค้าใกล้หมด
            </DialogTitle>
          </DialogHeader>
          <div 
            ref={lowStockScrollRef}
            onScroll={handleLowStockScroll}
            className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-96"
          >
            {lowStockProductsData.loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : lowStockProductsData.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">ไม่มีสินค้าใกล้หมดในขณะนี้</p>
              </div>
            ) : (
              <>
                {lowStockProductsData.products.map((product) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.productName}</p>
                      {product.volume && (
                        <p className="text-xs text-muted-foreground">{product.volume}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 dark:text-red-400">
                        {product.quantityInStock.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">ชิ้น</p>
                    </div>
                  </div>
                ))}
                {/* Loading more indicator */}
                {lowStockProductsData.loadingMore && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                    <span className="ml-2 text-sm text-muted-foreground">กำลังโหลด...</span>
                  </div>
                )}
                {/* End of list indicator */}
                {!lowStockProductsData.pagination.hasNextPage && lowStockProductsData.products.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    แสดงทั้งหมด {lowStockProductsData.pagination.totalCount} รายการ
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
