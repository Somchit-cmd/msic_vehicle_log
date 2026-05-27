'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { shouldAutoRefresh, markRefreshed } from "@/lib/auto-refresh";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Download,
  RefreshCw,
  Car,
  Fuel,
  Gauge,
  Cog,
  Users,
  DollarSign,
  Calendar,
  Palette,
  Truck,
  ChevronDown,
  LayoutGrid,
  List,
  Zap,
  ArrowUpDown,
  Clock,
  Database,
} from "lucide-react";

interface CarModel {
  id: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  engine: string | null;
  fuelType: string | null;
  transmission: string | null;
  horsepower: number | null;
  torque: number | null;
  drivetrain: string | null;
  seatingCapacity: number | null;
  price: number | null;
  imageUrl: string | null;
  color: string | null;
  bodyStyle: string | null;
  mpgCity: number | null;
  mpgHighway: number | null;
  source: string | null;
  externalId: string | null;
  trim: string | null;
  region: string | null;
  sellerType: string | null;
  mileage: number | null;
  isNewVehicle: boolean | null;
  hasAccident: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  brands: string[];
  types: string[];
  years: number[];
  fuelTypes: string[];
  transmissions: string[];
}

interface CarResponse {
  cars: CarModel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Home() {
  const { toast } = useToast();
  const [cars, setCars] = useState<CarModel[]>([]);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [fetchingNHTSA, setFetchingNHTSA] = useState(false);
  const [loadingChinese, setLoadingChinese] = useState(false);
  const [fetchingCNC, setFetchingCNC] = useState(false);
  const [fetchingCarAPIs, setFetchingCarAPIs] = useState(false);
  const [cncProgress, setCncProgress] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarModel | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Smartcar connected vehicle state
  const [smartcarConnected, setSmartcarConnected] = useState(false);
  const [smartcarVehicles, setSmartcarVehicles] = useState<any[]>([]);
  const [smartcarLoading, setSmartcarLoading] = useState(false);
  const [fetchingSmartcarCatalog, setFetchingSmartcarCatalog] = useState(false);
  const [smartcarCatalogInfo, setSmartcarCatalogInfo] = useState<{ available: boolean; totalVehicles: number } | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");

  const fetchCars = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");
      if (searchQuery) params.set("search", searchQuery);
      if (brandFilter !== "all") params.set("brand", brandFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (yearFilter !== "all") params.set("year", yearFilter);
      if (fuelTypeFilter !== "all") params.set("fuelType", fuelTypeFilter);
      if (transmissionFilter !== "all") params.set("transmission", transmissionFilter);

      const res = await fetch(`/api/cars?${params}`);
      const data: CarResponse = await res.json();
      setCars(data.cars);
      setTotalPages(data.pagination.totalPages);
      setTotalCars(data.pagination.total);
      setCurrentPage(data.pagination.page);
    } catch {
      toast({ title: "Error", description: "Failed to fetch cars", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, brandFilter, typeFilter, yearFilter, fuelTypeFilter, transmissionFilter, toast]);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch("/api/cars/filters");
      const data = await res.json();
      setFilters(data);
    } catch {
      // silently fail
    }
  }, []);

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/cars/seed", { method: "POST" });
      const data = await res.json();
      toast({ title: "Success", description: `${data.sampleCount} sample cars seeded. NHTSA API fetch running in background...` });
      fetchCars(1);
      fetchFilters();
      // Wait a bit for background NHTSA fetch, then refresh
      setTimeout(() => { fetchCars(1); fetchFilters(); }, 15000);
    } catch {
      toast({ title: "Error", description: "Failed to seed database", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  const fetchNHTSAData = async () => {
    setFetchingNHTSA(true);
    try {
      const res = await fetch("/api/cars/fetch-nhtsa", { method: "POST" });
      const data = await res.json();
      toast({
        title: "NHTSA Fetch Complete",
        description: `Fetched ${data.totalFetched} models, added ${data.totalAdded} new, updated ${data.totalUpdated}`,
      });
      fetchCars(currentPage);
      fetchFilters();
    } catch {
      toast({ title: "Error", description: "Failed to fetch from NHTSA API", variant: "destructive" });
    } finally {
      setFetchingNHTSA(false);
    }
  };

  const loadChineseBrands = async () => {
    setLoadingChinese(true);
    try {
      const res = await fetch("/api/cars/seed-chinese", { method: "POST" });
      const data = await res.json();
      toast({
        title: "Chinese Brands Loaded",
        description: `Added ${data.addedCount} Chinese car models (BYD, NIO, XPeng, Zeekr, etc.)`,
      });
      fetchCars(currentPage);
      fetchFilters();
    } catch {
      toast({ title: "Error", description: "Failed to load Chinese brands", variant: "destructive" });
    } finally {
      setLoadingChinese(false);
    }
  };

  const [carApisStatus, setCarApisStatus] = useState<"unknown" | "available" | "rate_limited">("unknown");
  const [carApisRetryMinutes, setCarApisRetryMinutes] = useState<number | null>(null);

  const fetchCarAPIsData = async (fullFetch = true) => {
    setFetchingCarAPIs(true);
    try {
      // First check if the API is available (not rate-limited)
      const statusRes = await fetch("/api/cars/fetch-carapis/status");
      const statusData = await statusRes.json();

      if (!statusData.available) {
        setCarApisStatus("rate_limited");
        setCarApisRetryMinutes(statusData.retryAfterMinutes || null);
        toast({
          title: "CarAPIs Rate Limited",
          description: statusData.message || "API is rate-limited. Please wait before trying again.",
          variant: "destructive",
        });
        setFetchingCarAPIs(false);
        return;
      }

      setCarApisStatus("available");

      const res = fullFetch
        ? await fetch("/api/cars/fetch-carapis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullFetch: true, maxPages: 2 }),
          })
        : await fetch("/api/cars/fetch-carapis");
      const data = await res.json();

      // Handle rate-limit error from CarAPIs
      if (res.status === 429 || data.error === "rate_limited") {
        setCarApisStatus("rate_limited");
        setCarApisRetryMinutes(data.retryAfterMinutes || null);
        toast({
          title: "CarAPIs Rate Limited",
          description: data.message || `API is rate-limited. Try again in ${data.retryAfterMinutes || 60} minutes.`,
          variant: "destructive",
        });
        setFetchingCarAPIs(false);
        return;
      }

      if (data.error) {
        toast({
          title: "CarAPIs Error",
          description: data.message || data.details || "Failed to fetch from CarAPIs",
          variant: "destructive",
        });
        setFetchingCarAPIs(false);
        return;
      }

      toast({
        title: "CarAPIs Fetch Complete!",
        description: `Fetched ${data.totalFetched} vehicles from ${data.brandCount} brands (incl. BYD, Polestar, Tesla). Added ${data.totalAdded} new, updated ${data.totalUpdated}.`,
      });
      fetchCars(1);
      fetchFilters();
    } catch {
      toast({ title: "Error", description: "Failed to fetch from CarAPIs", variant: "destructive" });
    } finally {
      setFetchingCarAPIs(false);
    }
  };

  const fetchCarNewsChina = async (fullFetch = false) => {
    setFetchingCNC(true);
    setCncProgress("Fetching Chinese EV data from CarNewsChina.com...");
    try {
      const res = fullFetch
        ? await fetch("/api/cars/fetch-carnewschina", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ maxPages: 35, fetchSpecs: true, specBatchSize: 100 }),
          })
        : await fetch("/api/cars/fetch-carnewschina");
      const data = await res.json();
      setCncProgress(null);
      toast({
        title: "CarNewsChina Fetch Complete!",
        description: `Fetched ${data.totalFetched} models from ${data.brandCount || data.brands?.length || 0} Chinese brands. Added ${data.totalAdded} new, updated ${data.totalUpdated}.`,
      });
      fetchCars(1);
      fetchFilters();
    } catch {
      setCncProgress(null);
      toast({ title: "Error", description: "Failed to fetch from CarNewsChina", variant: "destructive" });
    } finally {
      setFetchingCNC(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/cars/refresh", { method: "POST" });
      const data = await res.json();
      setLastUpdated(data.lastUpdated);
      markRefreshed();
      toast({
        title: "Data Updated",
        description: `Updated ${data.updatedCount} cars, added ${data.addedCount} new models`,
      });
      fetchCars(currentPage);
      fetchFilters();
    } catch {
      toast({ title: "Error", description: "Failed to refresh data", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  // Smartcar: Connect vehicle via Smartcar Connect
  const connectSmartcar = async () => {
    try {
      const res = await fetch("/api/cars/smartcar");
      const data = await res.json();
      if (data.connectUrl) {
        // Open Smartcar Connect in a new window
        window.open(data.connectUrl, "_blank", "width=600,height=700");
      } else {
        const desc = data.hint || data.details || data.error || "Failed to get Smartcar Connect URL";
        toast({
          title: "Smartcar Connect Error",
          description: desc,
          variant: "destructive",
          duration: 8000,
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect Smartcar", variant: "destructive" });
    }
  };

  // Smartcar: Check connection status and load vehicle data
  const checkSmartcarStatus = async () => {
    try {
      const res = await fetch("/api/cars/smartcar/status");
      const data = await res.json();
      setSmartcarConnected(data.connected);
      if (data.connected) {
        loadSmartcarVehicles();
      }
    } catch {
      // silently fail
    }
  };

  // Smartcar: Load connected vehicle data
  const loadSmartcarVehicles = async () => {
    setSmartcarLoading(true);
    try {
      const res = await fetch("/api/cars/smartcar/vehicles");
      const data = await res.json();
      if (data.vehicles) {
        setSmartcarVehicles(data.vehicles);
        setSmartcarConnected(true);
      } else if (data.error === "not_connected" || data.error === "token_expired") {
        setSmartcarConnected(false);
        setSmartcarVehicles([]);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load connected vehicle data", variant: "destructive" });
    } finally {
      setSmartcarLoading(false);
    }
  };

  // Smartcar: Disconnect vehicle
  const disconnectSmartcar = async () => {
    try {
      await fetch("/api/cars/smartcar/disconnect", { method: "POST" });
      setSmartcarConnected(false);
      setSmartcarVehicles([]);
      toast({ title: "Disconnected", description: "Smartcar vehicle disconnected." });
    } catch {
      toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
    }
  };

  // Smartcar: Fetch catalog data from Compatibility API (FREE, no auth)
  const fetchSmartcarCatalog = async () => {
    setFetchingSmartcarCatalog(true);
    try {
      // First check availability
      const statusRes = await fetch("/api/cars/fetch-smartcar");
      const statusData = await statusRes.json();

      if (!statusData.available) {
        toast({
          title: "Smartcar API Unavailable",
          description: statusData.message || "Cannot reach Smartcar Compatibility API.",
          variant: "destructive",
        });
        setFetchingSmartcarCatalog(false);
        return;
      }

      setSmartcarCatalogInfo({ available: true, totalVehicles: statusData.totalVehicles || 0 });

      // Fetch catalog data
      const res = await fetch("/api/cars/fetch-smartcar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.error) {
        toast({
          title: "Smartcar Catalog Error",
          description: data.message || "Failed to fetch Smartcar catalog data",
          variant: "destructive",
        });
        setFetchingSmartcarCatalog(false);
        return;
      }

      toast({
        title: "Smartcar Catalog Fetched!",
        description: `Fetched ${data.totalFetched} vehicles from ${data.brandCount} brands. Added ${data.totalAdded} new, updated ${data.totalUpdated}.`,
      });
      fetchCars(1);
      fetchFilters();
    } catch {
      toast({ title: "Error", description: "Failed to fetch Smartcar catalog", variant: "destructive" });
    } finally {
      setFetchingSmartcarCatalog(false);
    }
  };

  // Smartcar: Check catalog API availability
  const checkSmartcarCatalogStatus = async () => {
    try {
      const res = await fetch("/api/cars/fetch-smartcar");
      const data = await res.json();
      setSmartcarCatalogInfo({ available: data.available, totalVehicles: data.totalVehicles || 0 });
    } catch {
      setSmartcarCatalogInfo({ available: false, totalVehicles: 0 });
    }
  };

  const exportData = async (format: "csv" | "excel") => {
    try {
      const params = new URLSearchParams();
      params.set("format", format);
      if (searchQuery) params.set("search", searchQuery);
      if (brandFilter !== "all") params.set("brand", brandFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (yearFilter !== "all") params.set("year", yearFilter);
      if (fuelTypeFilter !== "all") params.set("fuelType", fuelTypeFilter);
      if (transmissionFilter !== "all") params.set("transmission", transmissionFilter);

      const res = await fetch(`/api/cars/export?${params}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `car-models-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "xls"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Export Complete", description: `Car data exported as ${format.toUpperCase()}` });
    } catch {
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchFilters();
    checkSmartcarStatus();
    checkSmartcarCatalogStatus();
  }, [fetchFilters]);

  useEffect(() => {
    // Reset to page 1 when filters change
    fetchCars(1);
  }, [searchQuery, brandFilter, typeFilter, yearFilter, fuelTypeFilter, transmissionFilter]);

  // Auto-fetch from all sources if no cars
  useEffect(() => {
    if (!loading && cars.length === 0 && !searchQuery && brandFilter === "all" && !seeding && !fetchingNHTSA && !loadingChinese && !fetchingCNC && !fetchingCarAPIs) {
      fetchNHTSAData();
      fetchCarAPIsData(false);
    }
  }, [loading, cars.length]);

  // Handle Smartcar callback redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("smartcar_connected") === "true") {
      toast({ title: "Vehicle Connected!", description: "Your vehicle is now connected via Smartcar. Click 'My Vehicle' to see live data." });
      setSmartcarConnected(true);
      // Clean up URL
      window.history.replaceState({}, "", "/");
      // Auto-load vehicle data
      setTimeout(() => loadSmartcarVehicles(), 1000);
    }
    if (params.get("smartcar_error")) {
      toast({ title: "Smartcar Error", description: params.get("smartcar_error") || "Connection failed", variant: "destructive" });
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Daily auto-refresh: check on load and set up 24-hour interval
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    // Check if auto-refresh is needed on mount
    if (shouldAutoRefresh() && !loading && cars.length > 0) {
      refreshData();
      markRefreshed();
    }

    // Set up 24-hour interval for auto-refresh
    refreshIntervalRef.current = setInterval(() => {
      if (shouldAutoRefresh()) {
        refreshData();
        markRefreshed();
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loading, cars.length]);

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Sedan: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      SUV: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Truck: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Hatchback: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Coupe: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Convertible: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Van: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      Wagon: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getFuelIcon = (fuelType: string | null) => {
    if (fuelType === "Electric") return <Zap className="h-3.5 w-3.5" />;
    return <Fuel className="h-3.5 w-3.5" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  AutoCatalog
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalCars > 0 ? `${totalCars} models available` : "Car Model Database"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {lastUpdated && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mr-2">
                  <Clock className="h-3.5 w-3.5" />
                  Updated: {new Date(lastUpdated).toLocaleString()}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNHTSAData}
                disabled={fetchingNHTSA || refreshing}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetchingNHTSA ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Fetch from NHTSA</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCarAPIsData(true)}
                disabled={fetchingCarAPIs || carApisStatus === "rate_limited"}
                className={`gap-1.5 ${
                  carApisStatus === "rate_limited"
                    ? "border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 opacity-70"
                    : "border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
                }`}
                title={carApisStatus === "rate_limited" && carApisRetryMinutes ? `Rate limited - try again in ${carApisRetryMinutes} min` : "Fetch from CarAPIs"}
              >
                <Zap className={`h-3.5 w-3.5 ${fetchingCarAPIs ? "animate-pulse" : ""}`} />
                <span className="hidden sm:inline">
                  {fetchingCarAPIs ? "Fetching..." : carApisStatus === "rate_limited" ? `Rate Limited (${carApisRetryMinutes}m)` : "CarAPIs (BYD+Global)"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCarNewsChina(true)}
                disabled={fetchingCNC}
                className="gap-1.5 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <Car className={`h-3.5 w-3.5 ${fetchingCNC ? "animate-pulse" : ""}`} />
                <span className="hidden sm:inline">{fetchingCNC ? cncProgress || "Fetching..." : "Chinese EVs"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSmartcarCatalog}
                disabled={fetchingSmartcarCatalog}
                className="gap-1.5 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
                title={smartcarCatalogInfo ? `Smartcar Compatibility API — ${smartcarCatalogInfo.totalVehicles} vehicles available (FREE, no auth)` : "Smartcar Compatibility API (FREE, no auth)"}
              >
                <Database className={`h-3.5 w-3.5 ${fetchingSmartcarCatalog ? "animate-pulse" : ""}`} />
                <span className="hidden sm:inline">
                  {fetchingSmartcarCatalog ? "Fetching..." : smartcarCatalogInfo?.available ? `Smartcar (${smartcarCatalogInfo.totalVehicles})` : "Smartcar Catalog"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={smartcarConnected ? loadSmartcarVehicles : connectSmartcar}
                disabled={smartcarLoading}
                className={`gap-1.5 ${
                  smartcarConnected
                    ? "border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
                    : "border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950"
                }`}
                title="Connect your real vehicle via Smartcar OAuth to see live data (odometer, battery, etc.)"
              >
                {smartcarConnected ? (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{smartcarLoading ? "Loading..." : "My Vehicle"}</span>
                  </>
                ) : (
                  <>
                    <Car className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Connect Car</span>
                  </>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Export
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportData("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData("excel")}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by brand, model, type, engine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-2">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm bg-white dark:bg-slate-900">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {filters?.brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] h-9 text-sm bg-white dark:bg-slate-900">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filters?.types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[110px] h-9 text-sm bg-white dark:bg-slate-900">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {filters?.years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
              <SelectTrigger className="w-[130px] h-9 text-sm bg-white dark:bg-slate-900">
                <SelectValue placeholder="Fuel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel</SelectItem>
                {filters?.fuelTypes.map((ft) => (
                  <SelectItem key={ft} value={ft}>
                    {ft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm bg-white dark:bg-slate-900">
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trans.</SelectItem>
                {filters?.transmissions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(brandFilter !== "all" || typeFilter !== "all" || yearFilter !== "all" ||
              fuelTypeFilter !== "all" || transmissionFilter !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs"
                onClick={() => {
                  setBrandFilter("all");
                  setTypeFilter("all");
                  setYearFilter("all");
                  setFuelTypeFilter("all");
                  setTransmissionFilter("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Smartcar Connected Vehicle Panel */}
        {smartcarConnected && smartcarVehicles.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-100">Connected Vehicle (Smartcar)</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={loadSmartcarVehicles} disabled={smartcarLoading} className="h-7 text-xs">
                  <RefreshCw className={`h-3 w-3 mr-1 ${smartcarLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="ghost" size="sm" onClick={disconnectSmartcar} className="h-7 text-xs text-red-600 hover:text-red-700">
                  Disconnect
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {smartcarVehicles.map((v: any) => (
                <div key={v.id} className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900">
                      <Car className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {v.make} {v.model}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{v.year}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {v.odometer != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Odometer</span>
                        <span className="font-medium">{v.odometer.toLocaleString()} {v.odometerUnit || "km"}</span>
                      </div>
                    )}
                    {v.fuel != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fuel</span>
                        <span className="font-medium">{Math.round(v.fuel)}%</span>
                      </div>
                    )}
                    {v.battery != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Battery</span>
                        <span className="font-medium">{Math.round(v.battery)}%{v.charging ? " ⚡" : ""}</span>
                      </div>
                    )}
                    {v.batteryCapacity != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Capacity</span>
                        <span className="font-medium">{v.batteryCapacity} kWh</span>
                      </div>
                    )}
                    {v.engineOil != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Oil Life</span>
                        <span className="font-medium">{Math.round(v.engineOil.lifeRemaining * 100)}%</span>
                      </div>
                    )}
                    {v.isLocked != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Locks</span>
                        <span className="font-medium">{v.isLocked ? "Locked" : "Unlocked"}</span>
                      </div>
                    )}
                    {v.tirePressure && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-slate-500">Tires</span>
                        <span className="font-medium">
                          FL:{v.tirePressure.frontLeft ?? "-"} FR:{v.tirePressure.frontRight ?? "-"} BL:{v.tirePressure.backLeft ?? "-"} BR:{v.tirePressure.backRight ?? "-"} PSI
                        </span>
                      </div>
                    )}
                  </div>
                  {v.error && (
                    <p className="text-xs text-red-500 mt-1">{v.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
          }>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && cars.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
              <Car className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No cars found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
              {seeding
                ? "Seeding the database with sample car data and fetching from NHTSA API..."
                : fetchingNHTSA
                ? "Fetching car models from NHTSA API (this may take a minute)..."
                : "Load data from NHTSA (US brands), CarAPIs (BYD, Polestar, Tesla + Global), CarNewsChina (Chinese EVs), or Smartcar (1,464 vehicles, FREE)."}
            </p>
            {!seeding && !fetchingNHTSA && !fetchingCNC && (
              <div className="flex gap-3 flex-wrap justify-center">
                <Button onClick={fetchNHTSAData} disabled={fetchingNHTSA}>
                  Fetch from NHTSA API
                </Button>
                <Button onClick={() => fetchCarAPIsData(true)} disabled={fetchingCarAPIs} className="bg-blue-600 hover:bg-blue-700">
                  Fetch from CarAPIs (BYD + Global)
                </Button>
                <Button onClick={() => fetchCarNewsChina(true)} disabled={fetchingCNC} className="bg-emerald-600 hover:bg-emerald-700">
                  Fetch Chinese EVs (CarNewsChina)
                </Button>
                <Button onClick={fetchSmartcarCatalog} disabled={fetchingSmartcarCatalog} className="bg-violet-600 hover:bg-violet-700">
                  Smartcar Catalog (FREE)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Grid View */}
        {!loading && cars.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cars.map((car) => (
              <Card
                key={car.id}
                className="overflow-hidden cursor-pointer group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-0.5 border-slate-200 dark:border-slate-800"
                onClick={() => setSelectedCar(car)}
              >
                {/* Car Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                  <img
                    src={car.imageUrl || ""}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getTypeColor(car.type)} text-xs font-medium`}>
                      {car.type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {car.year}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-1">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      {car.brand}
                    </p>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-base">
                    {car.model}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {car.fuelType && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        {getFuelIcon(car.fuelType)}
                        {car.fuelType}
                      </div>
                    )}
                    {car.transmission && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Cog className="h-3.5 w-3.5" />
                        {car.transmission}
                      </div>
                    )}
                    {car.horsepower && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Gauge className="h-3.5 w-3.5" />
                        {car.horsepower} HP
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {formatPrice(car.price)}
                    </span>
                    {car.drivetrain && (
                      <Badge variant="outline" className="text-xs">
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        {car.drivetrain}
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && cars.length > 0 && viewMode === "list" && (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="col-span-3">Car</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Year</div>
              <div className="col-span-2">Engine</div>
              <div className="col-span-1">Fuel</div>
              <div className="col-span-1">HP</div>
              <div className="col-span-1">Drive</div>
              <div className="col-span-2 text-right">Price</div>
            </div>

            {cars.map((car) => (
              <Card
                key={car.id}
                className="cursor-pointer hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 border-slate-200 dark:border-slate-800"
                onClick={() => setSelectedCar(car)}
              >
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="h-12 w-16 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 overflow-hidden">
                        <img
                          src={car.imageUrl || ""}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                          {car.brand}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {car.model}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Badge className={`${getTypeColor(car.type)} text-xs`}>
                        {car.type}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-sm text-slate-600 dark:text-slate-300">
                      {car.year}
                    </div>
                    <div className="col-span-2 text-sm text-slate-600 dark:text-slate-300 truncate">
                      {car.engine || "N/A"}
                    </div>
                    <div className="col-span-1">
                      {car.fuelType && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            car.fuelType === "Electric"
                              ? "border-amber-400 text-amber-600 dark:text-amber-400"
                              : car.fuelType === "Hybrid"
                              ? "border-green-400 text-green-600 dark:text-green-400"
                              : ""
                          }`}
                        >
                          {car.fuelType}
                        </Badge>
                      )}
                    </div>
                    <div className="col-span-1 text-sm text-slate-600 dark:text-slate-300">
                      {car.horsepower || "N/A"}
                    </div>
                    <div className="col-span-1 text-sm text-slate-600 dark:text-slate-300">
                      {car.drivetrain || "N/A"}
                    </div>
                    <div className="col-span-2 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatPrice(car.price)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => fetchCars(Math.max(1, currentPage - 1))}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => fetchCars(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => fetchCars(Math.min(totalPages, currentPage + 1))}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-950/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5" />
            <span>AutoCatalog - Car Model Database</span>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
            <span>Data: NHTSA vPIC + CarAPIs (Global) + CarNewsChina (Chinese EVs) + Smartcar (Catalog + Connected)</span>
          </div>
        </div>
      </footer>

      {/* Car Detail Dialog */}
      <Dialog open={!!selectedCar} onOpenChange={() => setSelectedCar(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedCar && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    {selectedCar.brand}
                  </span>
                  <span>{selectedCar.model}</span>
                </DialogTitle>
              </DialogHeader>

              {/* Image */}
              <div className="relative h-56 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <img
                  src={selectedCar.imageUrl || ""}
                  alt={`${selectedCar.brand} ${selectedCar.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={`${getTypeColor(selectedCar.type)} text-sm font-medium px-3 py-1`}>
                    {selectedCar.type}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Year</p>
                    <p className="text-sm font-semibold">{selectedCar.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Price</p>
                    <p className="text-sm font-semibold">{formatPrice(selectedCar.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  {getFuelIcon(selectedCar.fuelType)}
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fuel</p>
                    <p className="text-sm font-semibold">{selectedCar.fuelType || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Cog className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Transmission</p>
                    <p className="text-sm font-semibold">{selectedCar.transmission || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Specifications</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {selectedCar.engine && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Engine</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCar.engine}</span>
                    </div>
                  )}
                  {selectedCar.horsepower && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Horsepower</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCar.horsepower} HP</span>
                    </div>
                  )}
                  {selectedCar.torque && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Torque</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCar.torque} lb-ft</span>
                    </div>
                  )}
                  {selectedCar.drivetrain && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Drivetrain</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCar.drivetrain}</span>
                    </div>
                  )}
                  {selectedCar.seatingCapacity && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Seats</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {selectedCar.seatingCapacity}
                      </span>
                    </div>
                  )}
                  {selectedCar.bodyStyle && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Body</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        {selectedCar.bodyStyle}
                      </span>
                    </div>
                  )}
                  {selectedCar.color && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Color</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Palette className="h-3.5 w-3.5" />
                        {selectedCar.color}
                      </span>
                    </div>
                  )}
                  {selectedCar.mpgCity != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">MPG</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        {selectedCar.mpgCity} city{selectedCar.mpgHighway ? ` / ${selectedCar.mpgHighway} hwy` : ""}
                        {selectedCar.fuelType === "Electric" ? " MPGe" : ""}
                      </span>
                    </div>
                  )}
                  {selectedCar.trim && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Trim</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCar.trim}</span>
                    </div>
                  )}
                  {selectedCar.region && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Region</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCar.region}</span>
                    </div>
                  )}
                  {selectedCar.mileage != null && selectedCar.mileage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Mileage</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCar.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                  {selectedCar.source && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Source</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedCar.source === "carapis" ? "CarAPIs" : selectedCar.source === "carnewschina" ? "CarNewsChina" : selectedCar.source === "nhtsa" ? "NHTSA" : selectedCar.source}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
