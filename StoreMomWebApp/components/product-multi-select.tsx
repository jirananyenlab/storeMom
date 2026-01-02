"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, Search, Loader2, Package, X } from "lucide-react";
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
  volume?: string;
}

interface ProductMultiSelectProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  error?: boolean;
  placeholder?: string;
}

export function ProductMultiSelect({ 
  values, 
  onValuesChange, 
  error, 
  placeholder = "เลือกสินค้า"
}: ProductMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, searchQuery, true);
    }
  }, [loading, hasMore, page, searchQuery, fetchProducts]);

  // Fetch selected products when values change
  useEffect(() => {
    if (values.length === 0) {
      setSelectedProducts([]);
      return;
    }

    // Fetch products that are selected but not in current list
    const missingIds = values.filter(
      (v) => !products.find((p) => p.productId.toString() === v)
    );

    // Only fetch if we have missing IDs that we haven't already fetched
    if (missingIds.length > 0) {
      setSelectedProducts((prev) => {
        // Check which IDs are truly missing (not in prev either)
        const trulyMissing = missingIds.filter(
          (id) => !prev.find((p) => p.productId.toString() === id)
        );
        
        if (trulyMissing.length === 0) return prev;

        // Fetch missing products
        Promise.all(
          trulyMissing.map((id) =>
            fetch(`/api/products/${id}`)
              .then((res) => res.json())
              .catch(() => null)
          )
        ).then((results) => {
          const validProducts = results.filter((p) => p && p.productId);
          if (validProducts.length > 0) {
            setSelectedProducts((current) => {
              const newProducts = validProducts.filter(
                (vp) => !current.find((p) => p.productId === vp.productId)
              );
              if (newProducts.length === 0) return current;
              return [...current, ...newProducts];
            });
          }
        });

        return prev;
      });
    }
  }, [values, products]);

  // Update selected products from current products list
  useEffect(() => {
    setSelectedProducts((prev) => {
      const newSelected = products.filter((p) => 
        values.includes(p.productId.toString()) &&
        !prev.find((sp) => sp.productId === p.productId)
      );
      if (newSelected.length === 0) return prev;
      return [...prev, ...newSelected];
    });
  }, [products, values]);

  // Get display products (selected ones)
  const displayProducts = selectedProducts.filter((p) => 
    values.includes(p.productId.toString())
  );

  const toggleProduct = (product: Product) => {
    const productIdStr = product.productId.toString();
    if (values.includes(productIdStr)) {
      onValuesChange(values.filter((v) => v !== productIdStr));
    } else {
      onValuesChange([...values, productIdStr]);
      // Add to selected products if not already there
      if (!selectedProducts.find((p) => p.productId === product.productId)) {
        setSelectedProducts((prev) => [...prev, product]);
      }
    }
  };

  const removeProduct = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange(values.filter((v) => v !== productId));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-normal h-auto min-h-10",
            error && "border-destructive",
            values.length === 0 && "text-muted-foreground"
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {values.length === 0 ? (
              placeholder
            ) : displayProducts.length > 0 ? (
              <>
                {displayProducts.slice(0, 2).map((product) => (
                  <span
                    key={product.productId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    <span className="max-w-[100px] truncate">{product.productName}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => removeProduct(product.productId.toString(), e)}
                    />
                  </span>
                ))}
                {displayProducts.length > 2 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    +{displayProducts.length - 2} อื่นๆ
                  </span>
                )}
              </>
            ) : (
              <span>{values.length} สินค้า</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {values.length > 0 && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={clearAll}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
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

        {/* Selected count */}
        {values.length > 0 && (
          <div className="px-3 py-2 border-b bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span>เลือกแล้ว {values.length} สินค้า</span>
            <button
              onClick={() => onValuesChange([])}
              className="text-xs hover:underline"
            >
              ล้างทั้งหมด
            </button>
          </div>
        )}

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
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Package className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-sm">ไม่พบสินค้า</span>
            </div>
          ) : (
            <>
              {products.map((product) => {
                const isSelected = values.includes(product.productId.toString());
                return (
                  <div
                    key={product.productId}
                    onClick={() => toggleProduct(product)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors",
                      isSelected && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                      isSelected 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-gray-300 dark:border-gray-600"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.productName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>สต็อก: {product.quantityInStock}</span>
                        <span>|</span>
                        <span>฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
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
              {!hasMore && products.length > 0 && !loading && (
                <div className="text-center py-2 text-xs text-muted-foreground border-t">
                  แสดงทั้งหมด {products.length} รายการ
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
