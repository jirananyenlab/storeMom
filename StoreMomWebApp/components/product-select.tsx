"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, Search, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface Product {
  productId: number;
  productName: string;
  quantityInStock: number;
  price: number;
  sellPrice: number;
  volume?: string;
}

interface ProductSelectProps {
  value: string;
  onValueChange: (value: string, product?: Product) => void;
  error?: boolean;
  placeholder?: string;
  excludeOutOfStock?: boolean;
  // For edit mode: add back the original quantity from the order
  stockAdjustments?: Record<number, number>;
}

export function ProductSelect({ 
  value, 
  onValueChange, 
  error, 
  placeholder = "เลือกสินค้า",
  excludeOutOfStock = true,
  stockAdjustments = {}
}: ProductSelectProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Selected product for display
  const selectedProduct = products.find((p) => p.productId.toString() === value);

  // Get available stock considering adjustments
  const getAvailableStock = (product: Product) => {
    const adjustment = stockAdjustments[product.productId] || 0;
    return product.quantityInStock + adjustment;
  };

  // Fetch products with pagination
  const fetchProducts = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", "10");
      if (search) params.set("search", search);

      const res = await fetch(`/api/products?${params.toString()}`);
      const result = await res.json();

      if (result.data) {
        if (append) {
          setProducts((prev) => [...prev, ...result.data]);
        } else {
          setProducts(result.data);
        }
        setHasMore(pageNum < result.pagination.totalPages);
      } else {
        const data = Array.isArray(result) ? result : [];
        if (append) {
          setProducts((prev) => [...prev, ...data]);
        } else {
          setProducts(data);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(1, "");
  }, [fetchProducts]);

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, searchQuery, false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchProducts]);

  // Scroll handler for infinite loading
  const handleScroll = useCallback(() => {
    if (!listRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    // Load more when scrolled to bottom (with 50px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, searchQuery, true);
    }
  }, [loading, hasMore, page, searchQuery, fetchProducts]);

  // Reset and refresh when popover opens
  useEffect(() => {
    if (open) {
      // Fetch fresh products every time popover opens
      setPage(1);
      setSearchQuery("");
      fetchProducts(1, "");
    }
  }, [open, fetchProducts]);

  // Filter products based on stock
  const filteredProducts = excludeOutOfStock 
    ? products.filter((p) => getAvailableStock(p) > 0)
    : products;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-normal",
            error && "border-destructive",
            !value && "text-muted-foreground"
          )}
        >
          {value && selectedProduct ? (
            <span className="flex items-center gap-2 truncate">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <Package className="h-3 w-3" />
              </div>
              <span className="truncate">{selectedProduct.productName}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                (สต็อก: {getAvailableStock(selectedProduct)})
              </span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
        {/* Search Input */}
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="ค้นหาสินค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>

        {/* Product List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="max-h-[250px] overflow-y-auto"
        >
          {initialLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              <span className="ml-2 text-sm text-muted-foreground">กำลังโหลด...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Package className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-sm">ไม่พบสินค้า</span>
            </div>
          ) : (
            <>
              {filteredProducts.map((product) => {
                const availableStock = getAvailableStock(product);
                return (
                  <div
                    key={product.productId}
                    onClick={() => {
                      onValueChange(product.productId.toString(), product);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors",
                      value === product.productId.toString() && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.productName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={availableStock <= 5 ? "text-red-500 font-medium" : ""}>
                          สต็อก: {availableStock}
                        </span>
                        <span>|</span>
                        <span>฿{product.sellPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    {value === product.productId.toString() && (
                      <Check className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                );
              })}

              {/* Loading indicator for more items */}
              {loading && (
                <div className="flex items-center justify-center py-3 border-t">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  <span className="ml-2 text-xs text-muted-foreground">โหลดเพิ่มเติม...</span>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && filteredProducts.length > 0 && !loading && (
                <div className="text-center py-2 text-xs text-muted-foreground border-t">
                  แสดงทั้งหมด {filteredProducts.length} รายการ
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
