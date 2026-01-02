"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, Search, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface Customer {
  id: number;
  fname: string;
  lname: string;
}

interface CustomerSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: boolean;
  placeholder?: string;
}

export function CustomerSelect({ value, onValueChange, error, placeholder = "เลือกลูกค้า" }: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Selected customer name for display
  const selectedCustomer = customers.find((c) => c.id.toString() === value);

  // Fetch customers with pagination
  const fetchCustomers = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", "10");
      if (search) params.set("search", search);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const result = await res.json();

      if (result.data) {
        if (append) {
          setCustomers((prev) => [...prev, ...result.data]);
        } else {
          setCustomers(result.data);
        }
        setHasMore(pageNum < result.pagination.totalPages);
      } else {
        const data = Array.isArray(result) ? result : [];
        if (append) {
          setCustomers((prev) => [...prev, ...data]);
        } else {
          setCustomers(data);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCustomers(1, "");
  }, [fetchCustomers]);

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchCustomers(1, searchQuery, false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchCustomers]);

  // Scroll handler for infinite loading
  const handleScroll = useCallback(() => {
    if (!listRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    // Load more when scrolled to bottom (with 50px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCustomers(nextPage, searchQuery, true);
    }
  }, [loading, hasMore, page, searchQuery, fetchCustomers]);

  // Reset when popover opens
  useEffect(() => {
    if (open) {
      // If we have a selected value but it's not in the current list, we need to fetch it
      if (value && !customers.find((c) => c.id.toString() === value)) {
        // Fetch the selected customer to show their name
        fetch(`/api/customers/${value}`)
          .then((res) => res.json())
          .then((customer) => {
            if (customer && customer.id) {
              setCustomers((prev) => {
                // Avoid duplicates
                if (prev.find((c) => c.id === customer.id)) return prev;
                return [customer, ...prev];
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [open, value, customers]);

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
          {value && selectedCustomer ? (
            <span className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xs font-bold">
                {selectedCustomer.fname.charAt(0)}
              </div>
              {selectedCustomer.fname} {selectedCustomer.lname}
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
            placeholder="ค้นหาลูกค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>

        {/* Customer List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="max-h-[200px] overflow-y-auto"
        >
          {initialLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              <span className="ml-2 text-sm text-muted-foreground">กำลังโหลด...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <User className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-sm">ไม่พบลูกค้า</span>
            </div>
          ) : (
            <>
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => {
                    onValueChange(customer.id.toString());
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors",
                    value === customer.id.toString() && "bg-orange-50 dark:bg-orange-900/20"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-bold">
                    {customer.fname.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {customer.fname} {customer.lname}
                    </p>
                  </div>
                  {value === customer.id.toString() && (
                    <Check className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              ))}

              {/* Loading indicator for more items */}
              {loading && (
                <div className="flex items-center justify-center py-3 border-t">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  <span className="ml-2 text-xs text-muted-foreground">โหลดเพิ่มเติม...</span>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && customers.length > 0 && !loading && (
                <div className="text-center py-2 text-xs text-muted-foreground border-t">
                  แสดงทั้งหมด {customers.length} รายการ
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
